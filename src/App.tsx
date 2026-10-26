import React, { useState, useEffect, useMemo } from 'react';
import { VacationRecord, VacationRequest, FilterStatus, UserProfile } from './types';
import { INITIAL_VACATION_RECORDS } from './data/initialData';
import { INITIAL_VACATION_REQUESTS } from './data/initialRequests';
import { recalculateRecord } from './utils/cltFormulas';
import { resolveUserProfile } from './utils/auth';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { FormulaInspector } from './components/FormulaInspector';
import { EmployeeTimeline } from './components/EmployeeTimeline';
import { AddRecordModal } from './components/AddRecordModal';
import { ExportModal } from './components/ExportModal';
import { GoogleSheetsSync } from './components/GoogleSheetsSync';
import { VacationApprovalWorkflow } from './components/VacationApprovalWorkflow';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  // Authentication & Current User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('greener_vacation_user_email');
    if (saved) {
      return resolveUserProfile(saved);
    }
    // Default initial session is Sara Milione (RH)
    return resolveUserProfile('sara.milione@greener.com.br');
  });

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('greener_vacation_user_email', user.email);
    // If collaborator, direct immediately to approvals / vacation requests
    if (user.role === 'COLABORADOR') {
      setActiveTab('aprovacoes');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('greener_vacation_user_email');
  };

  const [referenceDate, setReferenceDate] = useState<string>('28/07/2026');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('TODOS');
  const [activeTab, setActiveTab] = useState<'planilha' | 'colaboradores' | 'formulas' | 'google-sheets' | 'aprovacoes'>('aprovacoes');
  
  // Deep-link initial request ID from URL query parameters (e.g. ?reqId=REQ-2026-001)
  const [initialRequestId, setInitialRequestId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('reqId');
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const reqId = params.get('reqId');
      if (reqId) {
        setInitialRequestId(reqId);
        setActiveTab('aprovacoes');
      }
    }
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Main Vacation Records state
  const [records, setRecords] = useState<VacationRecord[]>(INITIAL_VACATION_RECORDS);

  // Approval Requests state - filtered to exclude Tamíris, Heloísa and Viviane
  const [requests, setRequests] = useState<VacationRequest[]>(() => {
    const saved = localStorage.getItem('greener_vacation_requests');
    if (saved) {
      try {
        const parsed: VacationRequest[] = JSON.parse(saved);
        return parsed.filter(
          r =>
            !r.funcionario.toLowerCase().includes('tamíris') &&
            !r.funcionario.toLowerCase().includes('tamiris') &&
            !r.funcionario.toLowerCase().includes('heloísa') &&
            !r.funcionario.toLowerCase().includes('heloisa') &&
            !r.funcionario.toLowerCase().includes('viviane')
        );
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_VACATION_REQUESTS.filter(
      r =>
        !r.funcionario.toLowerCase().includes('tamíris') &&
        !r.funcionario.toLowerCase().includes('tamiris') &&
        !r.funcionario.toLowerCase().includes('heloísa') &&
        !r.funcionario.toLowerCase().includes('heloisa') &&
        !r.funcionario.toLowerCase().includes('viviane')
    );
  });

  // Sync requests with localStorage
  useEffect(() => {
    localStorage.setItem('greener_vacation_requests', JSON.stringify(requests));
  }, [requests]);

  // Recalculate all records whenever referenceDate or records change
  const handleRecalculateAll = () => {
    setRecords(prevRecords => {
      return prevRecords.map(rec => recalculateRecord(rec, prevRecords, referenceDate));
    });
  };

  // Recalculate on initial mount and reference date change
  useEffect(() => {
    setRecords(prevRecords => {
      return prevRecords.map(rec => recalculateRecord(rec, prevRecords, referenceDate));
    });
  }, [referenceDate]);

  // Update a single record
  const handleUpdateRecord = (updatedRecord: VacationRecord) => {
    setRecords(prev => {
      const nextList = prev.map(r => r.id === updatedRecord.id ? updatedRecord : r);
      // Re-run formula calculations for consistency
      return nextList.map(rec => recalculateRecord(rec, nextList, referenceDate));
    });
  };

  // Add new record
  const handleAddRecord = (newRecord: VacationRecord) => {
    setRecords(prev => {
      const nextList = [...prev, newRecord];
      return nextList.map(rec => recalculateRecord(rec, nextList, referenceDate));
    });
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este registro de férias?')) {
      setRecords(prev => {
        const nextList = prev.filter(r => r.id !== id);
        return nextList.map(rec => recalculateRecord(rec, nextList, referenceDate));
      });
    }
  };

  // Workflow Handlers
  const handleAddRequest = (newRequest: VacationRequest) => {
    setRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateRequest = (updatedRequest: VacationRequest) => {
    setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Sync homologated request directly into the official records spreadsheet
  const handleSyncHomologatedToSpreadsheet = (req: VacationRequest) => {
    const existingRec = records.find(r => r.funcionario === req.funcionario);
    const newId = `${records.length + 1}_wf`;

    const newVacationRecord: VacationRecord = {
      id: newId,
      funcionario: req.funcionario,
      email: req.email,
      gestorResponsavel: req.gestorResponsavel,
      setor: req.setor,
      abonoPecuniario: req.abonoPecuniario,
      adiantamento13: req.adiantamento13,
      dataContratacao: existingRec?.dataContratacao || '01/01/2023',
      inicioPeriodoAquisitivo: existingRec?.inicioPeriodoAquisitivo || '01/01/2026',
      dataVencimento: existingRec?.dataVencimento || '01/01/2027',
      inicioFerias: req.inicioFerias,
      retornoFerias: req.retornoFerias,
      diasFerias: req.diasFerias,
      dataLimite: existingRec?.dataLimite || '01/12/2027',
      situacao: 'Dentro do Prazo',
      saldoFerias: Math.max(0, (existingRec?.saldoFerias || 30) - req.diasFerias),
      avisoFerias: 'Enviado',
      reciboFerias: 'Finalizado',
      observacao: `Homologado via esteira de aprovação (#${req.id})`
    };

    handleAddRecord(newVacationRecord);
  };

  // Total pending count for badge in header
  const pendingApprovalsCount = useMemo(() => {
    if (!currentUser) return 0;
    if (currentUser.role === 'RH') {
      return requests.filter(r => r.status === 'PENDENTE_GESTOR' || r.status === 'APROVADO_GESTOR').length;
    }
    if (currentUser.role === 'GESTOR') {
      return requests.filter(r =>
        r.status === 'PENDENTE_GESTOR' &&
        (r.gestorEmail.toLowerCase() === currentUser.email.toLowerCase() ||
         r.gestorResponsavel.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
         currentUser.nome.toLowerCase().includes(r.gestorResponsavel.toLowerCase()))
      ).length;
    }
    // Colaborador
    return requests.filter(r =>
      (r.email.toLowerCase() === currentUser.email.toLowerCase() ||
       r.funcionario.toLowerCase() === currentUser.nome.toLowerCase()) &&
      r.status !== 'HOMOLOGADO_RH' &&
      r.status !== 'REPROVADO_GESTOR' &&
      r.status !== 'REPROVADO_RH'
    ).length;
  }, [requests, currentUser]);

  // Filtered records according to search term and selected status
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Search term filter
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        r.funcionario.toLowerCase().includes(term) ||
        (r.email && r.email.toLowerCase().includes(term)) ||
        (r.setor && r.setor.toLowerCase().includes(term)) ||
        (r.gestorResponsavel && r.gestorResponsavel.toLowerCase().includes(term));

      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'ALERTAS') {
        matchesStatus = r.situacao === 'Férias em Dobro' || r.situacao === 'Atenção (A Vencer)' || (r.statusAlerta && !r.statusAlerta.includes('Regular') && !r.statusAlerta.includes('Concluído'));
      } else if (filterStatus === 'URGENTE_30') {
        matchesStatus = r.statusAlerta?.includes('URGENTE') || r.statusAlerta?.includes('CRÍTICO') || false;
      } else if (filterStatus === 'ALERTA_60') {
        matchesStatus = r.statusAlerta?.includes('ALERTA') || false;
      } else if (filterStatus === 'ATENCAO_90') {
        matchesStatus = r.statusAlerta?.includes('ATENÇÃO') || false;
      } else if (filterStatus !== 'TODOS') {
        matchesStatus = r.situacao === filterStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, filterStatus]);

  // Unique employee names list
  const existingEmployees = useMemo(() => {
    return Array.from(new Set(records.map(r => r.funcionario))).sort();
  }, [records]);

  // If no user is logged in, show the Corporate Login Screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header component */}
      <Header
        referenceDate={referenceDate}
        setReferenceDate={setReferenceDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onRecalculateAll={handleRecalculateAll}
        pendingApprovalsCount={pendingApprovalsCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Metric Overview Cards (only for RH and Gestores) */}
        {(currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
          <StatsOverview records={records} referenceDate={referenceDate} />
        )}

        {/* Tab Content Display */}
        {activeTab === 'planilha' && (currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
          <SpreadsheetGrid
            records={filteredRecords}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onSelectFormulaColumn={() => setActiveTab('formulas')}
          />
        )}

        {activeTab === 'colaboradores' && (
          <EmployeeTimeline
            records={
              currentUser.role === 'COLABORADOR'
                ? records.filter(
                    r =>
                      r.email?.toLowerCase() === currentUser.email.toLowerCase() ||
                      r.funcionario.toLowerCase() === currentUser.nome.toLowerCase()
                  )
                : records
            }
          />
        )}

        {activeTab === 'formulas' && (
          <FormulaInspector />
        )}

        {activeTab === 'google-sheets' && currentUser.role === 'RH' && (
          <GoogleSheetsSync records={records} />
        )}

        {activeTab === 'aprovacoes' && (
          <VacationApprovalWorkflow
            records={records}
            requests={requests}
            initialRequestId={initialRequestId}
            onAddRequest={handleAddRequest}
            onUpdateRequest={handleUpdateRequest}
            onDeleteRequest={handleDeleteRequest}
            onSyncHomologatedToSpreadsheet={handleSyncHomologatedToSpreadsheet}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Modals */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        existingEmployees={existingEmployees}
        existingRecords={records}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-3.5 px-6 mt-10 text-center shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600">Controle de Férias CLT • Painel Corporativo Greener</span>
          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            CLT Art. 130, 134, 137 e 140
          </span>
        </div>
      </footer>
    </div>
  );
}

