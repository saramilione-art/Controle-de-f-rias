import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  Send,
  UserCheck,
  Building2,
  ShieldCheck,
  Mail,
  AlertCircle,
  FileCheck2,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code,
  Copy,
  Calendar,
  Layers,
  ChevronRight,
  Lock,
  Trash2,
  Zap,
  Share2,
  Webhook
} from 'lucide-react';
import { VacationRequest, VacationRecord, VacationRequestStatus, UserProfile } from '../types';
import { MANAGERS_DIRECTORY, RH_EMAIL, RH_RESPONSAVEL, getManagerEmail } from '../data/managers';
import { EmailPreviewModal } from './EmailPreviewModal';
import { ApprovalActionModal } from './ApprovalActionModal';
import { QuickLinksModal } from './QuickLinksModal';
import { WebhookConfigPanel } from './WebhookConfigPanel';
import { triggerWebhook } from '../utils/webhookService';
import { parseBRDate, formatBRDate } from '../utils/cltFormulas';

interface VacationApprovalWorkflowProps {
  records: VacationRecord[];
  requests: VacationRequest[];
  currentUser: UserProfile;
  initialRequestId?: string | null;
  onAddRequest: (request: VacationRequest) => void;
  onUpdateRequest: (updatedRequest: VacationRequest) => void;
  onSyncHomologatedToSpreadsheet: (request: VacationRequest) => void;
  onDeleteRequest?: (requestId: string) => void;
}

export const VacationApprovalWorkflow: React.FC<VacationApprovalWorkflowProps> = ({
  records,
  requests,
  currentUser,
  initialRequestId,
  onAddRequest,
  onUpdateRequest,
  onSyncHomologatedToSpreadsheet,
  onDeleteRequest
}) => {
  // Navigation tabs within workflow module
  const [subTab, setSubTab] = useState<'fila' | 'nova' | 'automacao'>('fila');

  // Filter for request status in queue
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  // Search filter
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Email modal state
  const [emailModalState, setEmailModalState] = useState<{
    isOpen: boolean;
    request: VacationRequest | null;
    stage: 'to_manager' | 'to_rh' | 'to_employee';
  }>({
    isOpen: false,
    request: null,
    stage: 'to_manager'
  });

  // Action modal state (approval/rejection)
  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    request: VacationRequest | null;
    actionType: 'approve_manager' | 'reject_manager' | 'homologate_rh' | 'reject_rh';
  }>({
    isOpen: false,
    request: null,
    actionType: 'approve_manager'
  });

  // Quick Links & Webhook modal state
  const [quickLinksModalState, setQuickLinksModalState] = useState<{
    isOpen: boolean;
    request: VacationRequest | null;
  }>({
    isOpen: false,
    request: null
  });

  // Handle deep-link / initialRequestId from URL parameter
  React.useEffect(() => {
    if (initialRequestId) {
      const target = requests.find(r => r.id.toLowerCase() === initialRequestId.toLowerCase());
      if (target) {
        setSubTab('fila');
        setSearchTerm(target.id);
      }
    }
  }, [initialRequestId, requests]);

  // New Request Form State - initialized according to logged in user
  const [newReqEmployee, setNewReqEmployee] = useState<string>(() => {
    if (currentUser.role === 'COLABORADOR') return currentUser.nome;
    if (currentUser.role === 'GESTOR') return currentUser.nome;
    return records[0]?.funcionario || 'Sara Milione de Oliveira';
  });

  // Keep employee synced if role is collaborator
  React.useEffect(() => {
    if (currentUser.role === 'COLABORADOR') {
      setNewReqEmployee(currentUser.nome);
    }
  }, [currentUser]);

  const [newReqStartDate, setNewReqStartDate] = useState<string>('2027-01-11');
  const [newReqDays, setNewReqDays] = useState<number>(10);
  const [newReqAbono, setNewReqAbono] = useState<string>('Não');
  const [newReq13, setNewReq13] = useState<'Sim' | 'Não'>('Não');
  const [newReqNotes, setNewReqNotes] = useState<string>('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Auto-fill selected employee's metadata
  const selectedEmployeeData = useMemo(() => {
    return records.find(r => r.funcionario === newReqEmployee);
  }, [records, newReqEmployee]);

  // Derived manager info for selected employee
  const managerName = useMemo(() => {
    if (currentUser.role === 'COLABORADOR' && currentUser.gestorResponsavel) {
      return currentUser.gestorResponsavel;
    }
    if (newReqEmployee === currentUser.nome && currentUser.gestorResponsavel) {
      return currentUser.gestorResponsavel;
    }
    return selectedEmployeeData?.gestorResponsavel || 'Luiza Bertazzoli';
  }, [currentUser, newReqEmployee, selectedEmployeeData]);

  const managerEmail = useMemo(() => {
    return getManagerEmail(managerName);
  }, [managerName]);

  const employeeEmail = useMemo(() => {
    if (currentUser.role === 'COLABORADOR') return currentUser.email;
    if (newReqEmployee === currentUser.nome) return currentUser.email;
    return selectedEmployeeData?.email || `${newReqEmployee.toLowerCase().replace(/\s+/g, '.')}@greener.com.br`;
  }, [currentUser, newReqEmployee, selectedEmployeeData]);

  const employeeSetor = useMemo(() => {
    if (currentUser.role === 'COLABORADOR') return currentUser.setor;
    if (newReqEmployee === currentUser.nome) return currentUser.setor;
    return selectedEmployeeData?.setor || 'Operações';
  }, [currentUser, newReqEmployee, selectedEmployeeData]);

  // Calculate return date based on start date and days
  const calculatedReturnDate = useMemo(() => {
    if (!newReqStartDate) return '';
    try {
      const parts = newReqStartDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        // Add days (inclusive: start + days - 1)
        d.setDate(d.getDate() + newReqDays - 1);
        return formatBRDate(d);
      }
    } catch {
      return '';
    }
    return '';
  }, [newReqStartDate, newReqDays]);

  const formattedStartDateBR = useMemo(() => {
    if (!newReqStartDate) return '';
    const parts = newReqStartDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return newReqStartDate;
  }, [newReqStartDate]);

  // Handle Form Submission
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const formattedNow = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRequest: VacationRequest = {
      id: `REQ-${now.getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
      funcionario: newReqEmployee,
      email: employeeEmail,
      setor: employeeSetor,
      gestorResponsavel: managerName,
      gestorEmail: managerEmail,
      dataSolicitacao: formattedNow,
      inicioFerias: formattedStartDateBR,
      retornoFerias: calculatedReturnDate,
      diasFerias: Number(newReqDays),
      abonoPecuniario: newReqAbono,
      adiantamento13: newReq13,
      observacaoColaborador: newReqNotes,
      status: 'PENDENTE_GESTOR'
    };

    onAddRequest(newRequest);
    setFormSuccessMessage(`Solicitação ${newRequest.id} criada com sucesso e enviada para o gestor ${managerName} (${managerEmail})!`);

    // Trigger Webhook in background for manager notification
    triggerWebhook('SOLICITACAO_CRIADA', newRequest, {
      nome: currentUser.nome,
      email: currentUser.email
    }).catch(err => console.error('Webhook dispatch error:', err));

    setTimeout(() => {
      setFormSuccessMessage(null);
      setSubTab('fila');
    }, 2000);
  };

  // Handle actions (Manager approve/reject, RH homologate/reject)
  const handleConfirmAction = (
    requestId: string,
    actionType: 'approve_manager' | 'reject_manager' | 'homologate_rh' | 'reject_rh',
    feedback: string,
    autoAddToSpreadsheet: boolean
  ) => {
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return;

    const now = new Date();
    const formattedNow = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let updated: VacationRequest = { ...targetReq };

    if (actionType === 'approve_manager') {
      updated.status = 'APROVADO_GESTOR';
      updated.aprovadoGestorEm = formattedNow;
      updated.aprovadoGestorPor = targetReq.gestorResponsavel;
      updated.parecerGestor = feedback || 'Aprovado pelo gestor responsável.';
    } else if (actionType === 'reject_manager') {
      updated.status = 'REPROVADO_GESTOR';
      updated.parecerGestor = feedback;
    } else if (actionType === 'homologate_rh') {
      updated.status = 'HOMOLOGADO_RH';
      updated.homologadoRHEm = formattedNow;
      updated.homologadoRHPor = RH_RESPONSAVEL;
      updated.parecerRH = feedback || 'Homologado por Gente & Gestão (RH).';
      updated.avisoEmitido = true;
      updated.reciboEmitido = true;

      if (autoAddToSpreadsheet) {
        onSyncHomologatedToSpreadsheet(updated);
      }
    } else if (actionType === 'reject_rh') {
      updated.status = 'REPROVADO_RH';
      updated.parecerRH = feedback;
    }

    onUpdateRequest(updated);

    // Trigger Webhook for stage progress
    const webhookEvt =
      actionType === 'approve_manager' ? 'PARECER_GESTOR' :
      actionType === 'homologate_rh' ? 'HOMOLOGACAO_RH' :
      'SOLICITACAO_REPROVADA';

    triggerWebhook(webhookEvt, updated, {
      nome: currentUser.nome,
      email: currentUser.email
    }).catch(err => console.error('Webhook action dispatch error:', err));
  };

  // Filter requests according to user role and search
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // 1. Role Scoping
      let allowedForRole = false;
      if (currentUser.role === 'RH') {
        // Sara (RH): Libera a visão geral de todas as solicitações
        allowedForRole = true;
      } else if (currentUser.role === 'GESTOR') {
        // Diretório de gestores: Mostra apenas a fila de aprovação da sua equipe (e eventuais pedidos do próprio gestor)
        const isMyTeam =
          req.gestorEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          req.gestorResponsavel.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
          currentUser.nome.toLowerCase().includes(req.gestorResponsavel.toLowerCase());
        const isSelf =
          req.email.toLowerCase() === currentUser.email.toLowerCase() ||
          req.funcionario.toLowerCase() === currentUser.nome.toLowerCase();
        allowedForRole = isMyTeam || isSelf;
      } else {
        // Colaborador comum: Mostra apenas suas próprias solicitações
        const isSelf =
          req.email.toLowerCase() === currentUser.email.toLowerCase() ||
          req.funcionario.toLowerCase() === currentUser.nome.toLowerCase();
        allowedForRole = isSelf;
      }

      if (!allowedForRole) return false;

      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'PENDENTE_GESTOR') {
        matchesStatus = req.status === 'PENDENTE_GESTOR';
      } else if (filterStatus === 'PENDENTE_RH') {
        matchesStatus = req.status === 'APROVADO_GESTOR';
      } else if (filterStatus === 'HOMOLOGADO_RH') {
        matchesStatus = req.status === 'HOMOLOGADO_RH';
      } else if (filterStatus === 'REPROVADOS') {
        matchesStatus = req.status === 'REPROVADO_GESTOR' || req.status === 'REPROVADO_RH';
      }

      // Search filter
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        term === '' ||
        req.funcionario.toLowerCase().includes(term) ||
        req.gestorResponsavel.toLowerCase().includes(term) ||
        req.setor.toLowerCase().includes(term) ||
        req.id.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [requests, currentUser, filterStatus, searchTerm]);

  // Accessible requests count based on user permissions
  const accessibleRequests = useMemo(() => {
    return requests.filter(req => {
      if (currentUser.role === 'RH') return true;
      if (currentUser.role === 'GESTOR') {
        return (
          req.gestorEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          req.gestorResponsavel.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
          currentUser.nome.toLowerCase().includes(req.gestorResponsavel.toLowerCase()) ||
          req.email.toLowerCase() === currentUser.email.toLowerCase() ||
          req.funcionario.toLowerCase() === currentUser.nome.toLowerCase()
        );
      }
      return (
        req.email.toLowerCase() === currentUser.email.toLowerCase() ||
        req.funcionario.toLowerCase() === currentUser.nome.toLowerCase()
      );
    });
  }, [requests, currentUser]);

  // Queue Counters
  const counts = useMemo(() => {
    const pendGestor = accessibleRequests.filter(r => r.status === 'PENDENTE_GESTOR').length;
    const pendRH = accessibleRequests.filter(r => r.status === 'APROVADO_GESTOR').length;
    const homologadas = accessibleRequests.filter(r => r.status === 'HOMOLOGADO_RH').length;
    const reprovadas = accessibleRequests.filter(r => r.status === 'REPROVADO_GESTOR' || r.status === 'REPROVADO_RH').length;
    return { pendGestor, pendRH, homologadas, reprovadas, total: accessibleRequests.length };
  }, [accessibleRequests]);

  // Helper badge for status
  const renderStatusBadge = (status: VacationRequestStatus) => {
    switch (status) {
      case 'PENDENTE_GESTOR':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 animate-pulse" />
            1ª Etapa: Pendente Gestor
          </span>
        );
      case 'APROVADO_GESTOR':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
            2ª Etapa: Aguardando RH
          </span>
        );
      case 'HOMOLOGADO_RH':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Homologado & Concluído
          </span>
        );
      case 'REPROVADO_GESTOR':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Recusado pelo Gestor
          </span>
        );
      case 'REPROVADO_RH':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Recusado pelo RH
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner with Workflow Steps and User Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                Esteira Automatizada
              </span>
              <h2 className="text-base font-bold text-slate-800">
                Fluxo de Solicitação e Aprovação de Férias
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.role === 'RH' && 'Visão Geral RH: Acompanhe todas as solicitações corporativas, valide requisitos CLT e homologue os períodos.'}
              {currentUser.role === 'GESTOR' && `Fila do Gestor: Gerencie e aprove as solicitações de férias da sua equipe (${currentUser.setor || currentUser.nome}).`}
              {currentUser.role === 'COLABORADOR' && 'Área do Colaborador: Acompanhe o status das suas solicitações ou abra um novo pedido de férias.'}
            </p>
          </div>

          {/* User Role & Permission Identity Badge */}
          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 px-3.5 rounded-xl border border-slate-200 text-xs">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs shrink-0 ${
              currentUser.role === 'RH' ? 'bg-indigo-600' : currentUser.role === 'GESTOR' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {currentUser.role === 'RH' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : currentUser.role === 'GESTOR' ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 truncate">{currentUser.nome}</span>
                {currentUser.role === 'RH' && (
                  <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold uppercase tracking-wider">
                    RH Geral
                  </span>
                )}
                {currentUser.role === 'GESTOR' && (
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase tracking-wider">
                    Gestor
                  </span>
                )}
                {currentUser.role === 'COLABORADOR' && (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase tracking-wider">
                    Colaborador
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono block truncate">
                {currentUser.email} • {currentUser.setor}
              </span>
            </div>
          </div>
        </div>

        {/* Visual 3-Step Pipeline Flow Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              1
            </div>
            <div className="text-xs min-w-0">
              <span className="font-bold text-slate-800 block truncate">1. Colaborador Solicita</span>
              <span className="text-[11px] text-slate-500 block truncate">Preenche período, abono e 13º</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              2
            </div>
            <div className="text-xs min-w-0">
              <span className="font-bold text-slate-800 block truncate">2. Gestor Imediato Aprova</span>
              <span className="text-[11px] text-slate-500 block truncate">Avalia cobertura e escala da equipe</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              3
            </div>
            <div className="text-xs min-w-0">
              <span className="font-bold text-slate-800 block truncate">3. RH Homologa & Documenta</span>
              <span className="text-[11px] text-slate-500 block truncate">Valida CLT e emite Aviso e Recibo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex space-x-2 bg-slate-200/70 p-1 rounded-xl w-fit">
          <button
            onClick={() => setSubTab('fila')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'fila'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {currentUser.role === 'COLABORADOR'
                ? 'Minhas Solicitações'
                : currentUser.role === 'GESTOR'
                ? 'Fila da Minha Equipe'
                : 'Fila Geral de Solicitações'}
            </span>
            <span className="ml-1.5 px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-mono">
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => setSubTab('nova')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'nova'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {currentUser.role === 'COLABORADOR' ? '+ Nova Solicitação' : '+ Criar Solicitação'}
            </span>
          </button>

          {(currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
            <button
              onClick={() => setSubTab('automacao')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'automacao'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Automação & Webhooks</span>
            </button>
          )}
        </div>

        {/* Quick Search for Queue */}
        {subTab === 'fila' && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar colaborador ou gestor..."
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-60"
            />
          </div>
        )}
      </div>

      {/* SUBTAB 1: FILA DE SOLICITAÇÕES */}
      {subTab === 'fila' && (
        <div className="space-y-4">
          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Filtrar por Status:</span>
            <button
              onClick={() => setFilterStatus('TODOS')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterStatus === 'TODOS'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todos ({counts.total})
            </button>
            <button
              onClick={() => setFilterStatus('PENDENTE_GESTOR')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterStatus === 'PENDENTE_GESTOR'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              Pendente Gestor ({counts.pendGestor})
            </button>
            <button
              onClick={() => setFilterStatus('PENDENTE_RH')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterStatus === 'PENDENTE_RH'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-blue-700 hover:bg-blue-50'
              }`}
            >
              Aguardando RH ({counts.pendRH})
            </button>
            <button
              onClick={() => setFilterStatus('HOMOLOGADO_RH')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterStatus === 'HOMOLOGADO_RH'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Homologadas ({counts.homologadas})
            </button>
            <button
              onClick={() => setFilterStatus('REPROVADOS')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterStatus === 'REPROVADOS'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              Recusadas ({counts.reprovadas})
            </button>
          </div>

          {/* List of Requests */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">Nenhuma solicitação encontrada</p>
              <p className="text-xs text-slate-400 mt-1">
                Tente ajustar os filtros ou clique em "+ Nova Solicitação" para criar um novo pedido.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRequests.map((req) => {
                const isManagerOfReq =
                  currentUser.role === 'RH' ||
                  (currentUser.role === 'GESTOR' &&
                    (req.gestorEmail.toLowerCase() === currentUser.email.toLowerCase() ||
                     req.gestorResponsavel.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
                     currentUser.nome.toLowerCase().includes(req.gestorResponsavel.toLowerCase())));
                const isRH = currentUser.role === 'RH';

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {req.id}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-900">{req.funcionario}</span>
                          <span className="text-xs text-slate-500 ml-2 font-medium">({req.setor})</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {renderStatusBadge(req.status)}
                        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                          Criado em: {req.dataSolicitacao}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4 text-xs">
                      {/* Grid Data */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">Período Solicitado</span>
                          <span className="text-sm font-bold text-indigo-700">
                            {req.inicioFerias} a {req.retornoFerias}
                          </span>
                          <span className="text-[11px] text-slate-600 block">{req.diasFerias} dias corridos</span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">Gestor Responsável</span>
                          <span className="font-bold text-slate-800">{req.gestorResponsavel}</span>
                          <span className="text-[11px] text-slate-500 font-mono block truncate">{req.gestorEmail}</span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">Venda de Férias (Abono)</span>
                          <span className="font-bold text-slate-800">{req.abonoPecuniario}</span>
                          <span className="text-[11px] text-slate-500 block">Adiant. 13º: {req.adiantamento13}</span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">E-mail do Colaborador</span>
                          <span className="font-mono text-slate-700 block truncate">{req.email}</span>
                          {req.avisoEmitido && (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 mt-0.5">
                              <FileCheck2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Aviso Emitido
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Observations / Justifications */}
                      {req.observacaoColaborador && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600 text-xs">
                          <strong className="text-slate-700">Justificativa do Colaborador:</strong> &ldquo;{req.observacaoColaborador}&rdquo;
                        </div>
                      )}

                      {/* Manager Feedback */}
                      {req.parecerGestor && (
                        <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 text-blue-900 text-xs">
                          <strong>Parecer do Gestor ({req.aprovadoGestorPor || req.gestorResponsavel}):</strong> &ldquo;{req.parecerGestor}&rdquo;
                          {req.aprovadoGestorEm && (
                            <span className="text-[10px] text-blue-600 block mt-0.5 font-mono">
                              Aprovado em: {req.aprovadoGestorEm}
                            </span>
                          )}
                        </div>
                      )}

                      {/* RH Feedback */}
                      {req.parecerRH && (
                        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 text-emerald-900 text-xs">
                          <strong>Parecer de Gente & Gestão (RH):</strong> &ldquo;{req.parecerRH}&rdquo;
                          {req.homologadoRHEm && (
                            <span className="text-[10px] text-emerald-600 block mt-0.5 font-mono">
                              Homologado em: {req.homologadoRHEm} por {req.homologadoRHPor}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions Bar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {/* Simulation / View Email triggers & Delete */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEmailModalState({
                              isOpen: true,
                              request: req,
                              stage: req.status === 'PENDENTE_GESTOR' ? 'to_manager' : req.status === 'APROVADO_GESTOR' ? 'to_rh' : 'to_employee'
                            })}
                            className="flex items-center space-x-1 px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Ver E-mail Notificação</span>
                          </button>

                          <button
                            onClick={() => setQuickLinksModalState({
                              isOpen: true,
                              request: req
                            })}
                            className="flex items-center space-x-1 px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold transition-colors"
                            title="Links rápidos para WhatsApp, E-mail e aprovação direta em 1 clique"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Links Rápidos</span>
                          </button>

                          {onDeleteRequest && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja excluir a solicitação ${req.id} (${req.funcionario})?`)) {
                                  onDeleteRequest(req.id);
                                }
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold transition-colors"
                              title="Excluir esta solicitação da fila"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Excluir</span>
                            </button>
                          )}
                        </div>

                        {/* Stage Specific Action Buttons */}
                        <div className="flex items-center space-x-2">
                          {/* 1st Step: Manager Approval */}
                          {req.status === 'PENDENTE_GESTOR' && isManagerOfReq && (
                            <>
                              <button
                                onClick={() => setActionModalState({
                                  isOpen: true,
                                  request: req,
                                  actionType: 'reject_manager'
                                })}
                                className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold text-xs transition-colors"
                              >
                                Recusar / Solicitar Ajuste
                              </button>
                              <button
                                onClick={() => setActionModalState({
                                  isOpen: true,
                                  request: req,
                                  actionType: 'approve_manager'
                                })}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Aprovar como Gestor</span>
                              </button>
                            </>
                          )}

                          {/* 2nd Step: RH Homologation */}
                          {req.status === 'APROVADO_GESTOR' && isRH && (
                            <>
                              <button
                                onClick={() => setActionModalState({
                                  isOpen: true,
                                  request: req,
                                  actionType: 'reject_rh'
                                })}
                                className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold text-xs transition-colors"
                              >
                                Recusar (RH)
                              </button>
                              <button
                                onClick={() => setActionModalState({
                                  isOpen: true,
                                  request: req,
                                  actionType: 'homologate_rh'
                                })}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Homologar no RH & Lançar na Planilha</span>
                              </button>
                            </>
                          )}

                          {/* Collaborator Informative Status */}
                          {currentUser.role === 'COLABORADOR' && (
                            <div className="flex items-center text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                              {req.status === 'PENDENTE_GESTOR' && (
                                <span className="flex items-center text-amber-700 font-medium">
                                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 animate-pulse" />
                                  Aguardando parecer do gestor ({req.gestorResponsavel})
                                </span>
                              )}
                              {req.status === 'APROVADO_GESTOR' && (
                                <span className="flex items-center text-blue-700 font-medium">
                                  <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                  Aprovado pelo gestor. Em análise final no RH (Gente & Gestão).
                                </span>
                              )}
                              {(req.status === 'REPROVADO_GESTOR' || req.status === 'REPROVADO_RH') && (
                                <span className="flex items-center text-rose-700 font-medium">
                                  <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                                  Solicitação não aprovada. Veja o parecer acima.
                                </span>
                              )}
                            </div>
                          )}

                          {/* Already Completed */}
                          {req.status === 'HOMOLOGADO_RH' && (
                            <span className="text-emerald-700 font-bold text-xs flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Processo Homologado com Sucesso
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: NOVA SOLICITAÇÃO (PORTAL DO COLABORADOR) */}
      {subTab === 'nova' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-3xl mx-auto space-y-5">
          <div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              Portal do Colaborador
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Nova Solicitação de Férias
            </h3>
            <p className="text-xs text-slate-500">
              Preencha o período desejado. O sistema encaminhará automaticamente para o seu gestor imediato e, em seguida, para a homologação de Gente & Gestão (RH).
            </p>
          </div>

          {formSuccessMessage && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
            {/* Employee Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Colaborador(a):
              </label>
              {currentUser.role === 'COLABORADOR' ? (
                <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between text-slate-800 font-bold text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      {currentUser.nome.charAt(0)}
                    </div>
                    <span>{currentUser.nome}</span>
                    <span className="text-[11px] text-slate-500 font-normal">({currentUser.email})</span>
                  </div>
                  <span className="flex items-center text-[10px] text-slate-500 font-medium">
                    <Lock className="w-3 h-3 mr-1 text-slate-400" />
                    Vinculado ao seu login corporativo
                  </span>
                </div>
              ) : currentUser.role === 'GESTOR' ? (
                <select
                  value={newReqEmployee}
                  onChange={(e) => setNewReqEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-800 font-medium"
                >
                  <option value={currentUser.nome}>
                    Minhas Próprias Férias — {currentUser.nome} (Gestor)
                  </option>
                  <optgroup label="Colaboradores da Empresa">
                    {Array.from(new Set(records.map(r => r.funcionario)))
                      .filter(name => name !== currentUser.nome)
                      .sort()
                      .map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                  </optgroup>
                </select>
              ) : (
                <select
                  value={newReqEmployee}
                  onChange={(e) => setNewReqEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-800 font-medium"
                >
                  {Array.from(new Set(records.map(r => r.funcionario))).sort().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Auto-filled collaborator info box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">E-mail Corporativo</span>
                <span className="font-mono font-semibold text-slate-800">{employeeEmail}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Setor</span>
                <span className="font-semibold text-slate-800">{employeeSetor}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Saldo Atual na Planilha</span>
                <span className="font-bold text-indigo-700">{selectedEmployeeData?.saldoFerias || 30} dias</span>
              </div>
            </div>

            {/* Manager routing alert */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 flex items-start space-x-3">
              <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-blue-900">
                <span className="font-bold block">Rota de Aprovação Automática:</span>
                Esta solicitação será direcionada ao gestor <strong>{managerName}</strong> no e-mail{' '}
                <strong className="font-mono">{managerEmail}</strong>.
              </div>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Data de Início das Férias:
                </label>
                <input
                  type="date"
                  value={newReqStartDate}
                  onChange={(e) => setNewReqStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantidade de Dias:
                </label>
                <select
                  value={newReqDays}
                  onChange={(e) => setNewReqDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                >
                  <option value={5}>5 dias (Fração mínima legal CLT)</option>
                  <option value={10}>10 dias (Férias coletivas / 1ª fração)</option>
                  <option value={14}>14 dias (Fração mínima principal CLT)</option>
                  <option value={15}>15 dias (Metade do período)</option>
                  <option value={20}>20 dias (Férias com abono)</option>
                  <option value={30}>30 dias (Período integral)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Data Calculada de Retorno:
                </label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-indigo-700">
                  {calculatedReturnDate || '---'}
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Venda de Férias (Abono Pecuniário):
                </label>
                <select
                  value={newReqAbono}
                  onChange={(e) => setNewReqAbono(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Não">Não (Gozar todos os dias)</option>
                  <option value="10 dias">Sim, vender 10 dias (Máximo CLT)</option>
                  <option value="5 dias">Sim, vender 5 dias</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adiantamento de 13º Salário:
                </label>
                <select
                  value={newReq13}
                  onChange={(e) => setNewReq13(e.target.value as 'Sim' | 'Não')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim (Solicitar 1ª parcela do 13º nas férias)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Observações / Justificativa para a Gestão:
              </label>
              <textarea
                rows={2}
                value={newReqNotes}
                onChange={(e) => setNewReqNotes(e.target.value)}
                placeholder="Ex: Férias planejadas para viagem em família, equipe avisada."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSubTab('fila')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Solicitação para o Gestor</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: AUTOMAÇÃO & WEBHOOKS */}
      {subTab === 'automacao' && (
        <div className="space-y-6">
          {/* Integrated Webhook Engine Panel */}
          <WebhookConfigPanel />

          {/* Directory of Registered Managers */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
            <div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                Catálogo Corporativo
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Diretório de Gestores e RH Cadastrados
              </h3>
              <p className="text-xs text-slate-500">
                Relação de responsáveis e e-mails corporativos integrados na esteira e nos webhooks da Greener.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-100/70 text-slate-600 text-[11px] font-bold">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Responsável</th>
                    <th className="px-4 py-2.5 text-left">E-mail Cadastrado</th>
                    <th className="px-4 py-2.5 text-left">Setor / Atribuição</th>
                    <th className="px-4 py-2.5 text-left">Papel na Esteira</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.values(MANAGERS_DIRECTORY).map((mgr) => (
                    <tr key={mgr.email} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-bold text-slate-800">{mgr.nome}</td>
                      <td className="px-4 py-2.5 font-mono text-indigo-700 font-semibold">{mgr.email}</td>
                      <td className="px-4 py-2.5 text-slate-600">{mgr.setor}</td>
                      <td className="px-4 py-2.5">
                        {mgr.nome.includes('Sara') ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Homologação & Emissão RH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            1ª Aprovação (Gestor)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EmailPreviewModal
        isOpen={emailModalState.isOpen}
        onClose={() => setEmailModalState(prev => ({ ...prev, isOpen: false }))}
        request={emailModalState.request}
        stage={emailModalState.stage}
      />

      <ApprovalActionModal
        isOpen={actionModalState.isOpen}
        onClose={() => setActionModalState(prev => ({ ...prev, isOpen: false }))}
        request={actionModalState.request}
        actionType={actionModalState.actionType}
        currentRole={currentUser.nome}
        onConfirmAction={handleConfirmAction}
      />

      <QuickLinksModal
        isOpen={quickLinksModalState.isOpen}
        onClose={() => setQuickLinksModalState({ isOpen: false, request: null })}
        request={quickLinksModalState.request}
        currentUser={currentUser}
      />
    </div>
  );
};
