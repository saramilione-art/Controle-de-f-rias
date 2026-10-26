import React, { useState } from 'react';
import { VacationRecord, VacationStatus, AlertStatus, NoticeStatus, ReceiptStatus, Adiantamento13Status } from '../types';
import { HelpCircle, Sparkles, Check, Trash2, Edit3, Save, X, ChevronUp, ChevronDown, Info, AlertTriangle, Bell, Mail, Building2, UserCheck, DollarSign } from 'lucide-react';

interface SpreadsheetGridProps {
  records: VacationRecord[];
  onUpdateRecord: (updatedRecord: VacationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSelectFormulaColumn?: (columnLetter: string) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onSelectFormulaColumn
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<VacationRecord | null>(null);
  const [sortField, setSortField] = useState<keyof VacationRecord>('funcionario');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [showFormulaLegend, setShowFormulaLegend] = useState<boolean>(true);

  // Sorting logic
  const sortedRecords = [...records].sort((a, b) => {
    const aVal = a[sortField] ?? '';
    const bVal = b[sortField] ?? '';
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof VacationRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleStartEdit = (record: VacationRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateRecord(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  // Helper for Row Class Styling according to Alert Urgency
  const getRowClass = (record: VacationRecord) => {
    const alert = record.statusAlerta || '';
    if (alert.includes('CRÍTICO')) return 'bg-red-50/60 border-l-4 border-l-red-600 hover:bg-red-50';
    if (alert.includes('URGENTE')) return 'bg-rose-50/50 border-l-4 border-l-rose-500 hover:bg-rose-50';
    if (alert.includes('ALERTA')) return 'bg-amber-50/40 border-l-4 border-l-amber-500 hover:bg-amber-50';
    if (alert.includes('ATENÇÃO')) return 'bg-yellow-50/30 border-l-4 border-l-yellow-500 hover:bg-yellow-50';
    return 'hover:bg-slate-50/80';
  };

  // Helper for Status Badge Styling
  const renderStatusBadge = (status: VacationStatus) => {
    switch (status) {
      case 'Férias em Dobro':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>
            Férias em Dobro
          </span>
        );
      case 'Dentro do Prazo':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
            Dentro do Prazo
          </span>
        );
      case 'Férias não vencidas':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
            Férias não vencidas
          </span>
        );
      case 'Em Férias':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5"></span>
            Em Férias
          </span>
        );
      case 'Atenção (A Vencer)':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
            Atenção (A Vencer)
          </span>
        );
      case 'Concluído':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
            Concluído
          </span>
        );
    }
  };

  const renderAlertBadge = (status?: AlertStatus) => {
    if (!status) return <span className="text-slate-400 text-xs">-</span>;

    if (status.includes('CRÍTICO')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300 animate-pulse">
          {status}
        </span>
      );
    }
    if (status.includes('URGENTE')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          {status}
        </span>
      );
    }
    if (status.includes('ALERTA')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          {status}
        </span>
      );
    }
    if (status.includes('ATENÇÃO')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
          {status}
        </span>
      );
    }
    if (status.includes('Vencendo')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100 text-sky-800 border border-sky-300">
          {status}
        </span>
      );
    }
    if (status.includes('Concluído')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        {status}
      </span>
    );
  };

  const renderNoticeBadge = (notice?: NoticeStatus | '') => {
    if (!notice) return <span className="text-slate-400 text-xs">-</span>;
    if (notice === 'Enviado') return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Enviado</span>;
    if (notice === 'Finalizado') return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Aviso Ok</span>;
    if (notice === 'Não enviado') return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">Não enviado</span>;
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{notice}</span>;
  };

  const renderReceiptBadge = (receipt?: ReceiptStatus | '') => {
    if (!receipt) return <span className="text-slate-400 text-xs">-</span>;
    if (receipt === 'Finalizado') return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Recibo Ok</span>;
    if (receipt === 'Enviado') return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Enviado</span>;
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{receipt}</span>;
  };

  return (
    <div className="space-y-3">
      {/* Visual Legend Banner */}
      {showFormulaLegend && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-bold text-slate-800 flex items-center">
              <Bell className="w-4 h-4 text-indigo-600 mr-1.5" />
              Notificações Visuais & Alertas do Período Concessivo CLT:
            </span>

            <button
              onClick={() => setShowFormulaLegend(false)}
              className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold"
            >
              Ocultar Legenda
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-600 mr-1.5 animate-ping"></span>
              Dobro Já Vencido
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-semibold">
              🔴 Urgência (&lt; 30 dias)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-medium">
              🟠 Alerta (&lt; 60 dias)
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
              🟡 Atenção (&lt; 90 dias)
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              <Sparkles className="w-3 h-3 mr-1 inline text-indigo-600" />
              Fórmulas CLT em Tempo Real
            </span>
          </div>
        </div>
      )}

      {/* Spreadsheet Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 select-none">
                <th className="py-3 px-3 w-10 text-center border-r border-slate-200 text-slate-400 font-mono text-[10px] uppercase">#</th>
                
                {/* FUNCIONÁRIO */}
                <th
                  onClick={() => handleSort('funcionario')}
                  className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors"
                >
                  <div className="flex items-center justify-between space-x-1">
                    <span>FUNCIONÁRIO</span>
                    {sortField === 'funcionario' && (sortAsc ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />)}
                  </div>
                </th>

                {/* E-mail do Colaborador */}
                <th
                  onClick={() => handleSort('email')}
                  className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors min-w-[150px]"
                >
                  <div className="flex items-center justify-between space-x-1">
                    <span>E-mail</span>
                    {sortField === 'email' && (sortAsc ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />)}
                  </div>
                </th>

                {/* Setor */}
                <th
                  onClick={() => handleSort('setor')}
                  className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors min-w-[120px]"
                >
                  <div className="flex items-center justify-between space-x-1">
                    <span>Setor</span>
                    {sortField === 'setor' && (sortAsc ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />)}
                  </div>
                </th>

                {/* Gestor Responsável */}
                <th
                  onClick={() => handleSort('gestorResponsavel')}
                  className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors min-w-[140px]"
                >
                  <div className="flex items-center justify-between space-x-1">
                    <span>Gestor Resp.</span>
                    {sortField === 'gestorResponsavel' && (sortAsc ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />)}
                  </div>
                </th>

                {/* Data da contratação */}
                <th className="py-3 px-3 border-r border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Data Contratação
                </th>

                {/* Início novo período aquisitivo */}
                <th className="py-3 px-3 border-r border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Início P. Aquisitivo
                </th>

                {/* Data vencimento (Formula) */}
                <th 
                  onClick={() => onSelectFormulaColumn?.('D')}
                  className="py-3 px-3 border-r border-slate-200 text-center bg-indigo-50/60 text-indigo-900 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-indigo-100/70 transition-colors"
                  title="Calculado automaticamente por fórmula: =EDATE(Início; 12)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Data Vencimento</span>
                    <Sparkles className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                  </div>
                </th>

                {/* Período de Gozo: Início férias */}
                <th className="py-3 px-3 border-r border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Início Férias
                </th>

                {/* Retorno */}
                <th className="py-3 px-3 border-r border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Retorno
                </th>

                {/* Dias de férias (Formula) */}
                <th 
                  onClick={() => onSelectFormulaColumn?.('G')}
                  className="py-3 px-3 border-r border-slate-200 text-center bg-indigo-50/60 text-indigo-900 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-indigo-100/70 transition-colors"
                  title="Calculado automaticamente por fórmula: =Retorno - Início + 1"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Dias Gozo</span>
                    <Sparkles className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                  </div>
                </th>

                {/* Venda de Férias (Abono Pecuniário) */}
                <th
                  onClick={() => handleSort('abonoPecuniario')}
                  className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-100 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors min-w-[120px]"
                  title="Abono Pecuniário - Conversão de 1/3 do período de férias (Art. 143 da CLT)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Venda Férias</span>
                    {sortField === 'abonoPecuniario' && (sortAsc ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />)}
                  </div>
                </th>

                {/* Adiantamento de 13º salário (Sim/Não) */}
                <th
                  onClick={() => handleSort('adiantamento13')}
                  className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-100 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors min-w-[100px]"
                  title="Adiantamento da 1ª parcela do 13º Salário por ocasião das férias"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Adiant. 13º</span>
                    {sortField === 'adiantamento13' && (sortAsc ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />)}
                  </div>
                </th>

                {/* Data limite (Formula) */}
                <th 
                  onClick={() => onSelectFormulaColumn?.('H')}
                  className="py-3 px-3 border-r border-slate-200 text-center bg-indigo-50/60 text-indigo-900 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-indigo-100/70 transition-colors"
                  title="Calculado automaticamente por fórmula CLT: =Data Vencimento + 1 ano - 30d"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Data Limite</span>
                    <Sparkles className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                  </div>
                </th>

                {/* Situação (Formula) */}
                <th 
                  onClick={() => onSelectFormulaColumn?.('I')}
                  className="py-3 px-3 border-r border-slate-200 text-center bg-indigo-50/60 text-indigo-900 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-indigo-100/70 transition-colors"
                  title="Status de Situação calculado via Fórmula Dinâmica CLT"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>SITUAÇÃO</span>
                    <Sparkles className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                  </div>
                </th>

                {/* Saldo de férias (Formula) */}
                <th 
                  onClick={() => onSelectFormulaColumn?.('J')}
                  className="py-3 px-3 border-r border-slate-200 text-center bg-indigo-50/60 text-indigo-900 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-indigo-100/70 transition-colors"
                  title="Calculado automaticamente: =30 - SUM(Dias Gozados)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Saldo Férias</span>
                    <Sparkles className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                  </div>
                </th>

                {/* Status de Alerta (Formula Column K) */}
                <th 
                  onClick={() => onSelectFormulaColumn?.('K')}
                  className="py-3 px-3 border-r border-slate-200 text-center bg-indigo-50/60 text-indigo-900 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-indigo-100/70 transition-colors min-w-[150px]"
                  title="Status de Alerta Automático de Vencimento e Férias em Dobro"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>STATUS DE ALERTA</span>
                    <Sparkles className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                  </div>
                </th>

                {/* Aviso de Férias */}
                <th className="py-3 px-3 border-r border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Aviso Férias
                </th>

                {/* Recibo de férias */}
                <th className="py-3 px-3 border-r border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Recibo Férias
                </th>

                {/* Ações */}
                <th className="py-3 px-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-8 text-center text-slate-500">
                    Nenhum colaborador ou registro encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record, index) => {
                  const isEditing = editingId === record.id;
                  const rowClass = getRowClass(record);

                  return (
                    <tr
                      key={record.id}
                      className={`transition-colors ${rowClass}`}
                    >
                      {/* Row Index */}
                      <td className="py-2.5 px-3 text-center text-slate-400 border-r border-slate-100 font-mono text-xs">
                        {index + 1}
                      </td>

                      {/* FUNCIONÁRIO */}
                      <td className="py-2.5 px-4 border-r border-slate-100 font-semibold text-slate-700 min-w-[180px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.funcionario || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, funcionario: e.target.value } : null)}
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          record.funcionario
                        )}
                      </td>

                      {/* E-mail */}
                      <td className="py-2.5 px-3 border-r border-slate-100 min-w-[150px]">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm?.email || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, email: e.target.value } : null)}
                            placeholder="email@empresa.com.br"
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-xs"
                          />
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-600 text-xs truncate max-w-[140px]" title={record.email}>
                              {record.email || <span className="text-slate-300">—</span>}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Setor */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center min-w-[120px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.setor || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, setor: e.target.value } : null)}
                            placeholder="Setor"
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-xs"
                          />
                        ) : (
                          record.setor ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                              {record.setor}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )
                        )}
                      </td>

                      {/* Gestor Responsável */}
                      <td className="py-2.5 px-3 border-r border-slate-100 min-w-[140px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.gestorResponsavel || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, gestorResponsavel: e.target.value } : null)}
                            placeholder="Gestor responsável"
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-xs"
                          />
                        ) : (
                          <span className="text-slate-700 text-xs font-medium">
                            {record.gestorResponsavel || <span className="text-slate-300">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Data Contratação */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center text-slate-500 font-mono text-xs min-w-[110px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.dataContratacao || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, dataContratacao: e.target.value } : null)}
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-center text-xs"
                          />
                        ) : (
                          record.dataContratacao
                        )}
                      </td>

                      {/* Início P. Aquisitivo */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center text-slate-500 font-mono text-xs min-w-[110px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.inicioPeriodoAquisitivo || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, inicioPeriodoAquisitivo: e.target.value } : null)}
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-center text-xs"
                          />
                        ) : (
                          record.inicioPeriodoAquisitivo
                        )}
                      </td>

                      {/* Data Vencimento (Fórmula) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center font-mono text-xs text-indigo-950 font-bold bg-indigo-50/30 min-w-[110px]" title="Calculado por fórmula =EDATE(Início, 12)">
                        {record.dataVencimento || '---'}
                      </td>

                      {/* Início Férias */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center text-slate-600 text-xs min-w-[110px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.inicioFerias || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, inicioFerias: e.target.value } : null)}
                            placeholder="DD/MM/YYYY"
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-center text-xs"
                          />
                        ) : (
                          record.inicioFerias || <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Retorno */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center text-slate-600 text-xs min-w-[110px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.retornoFerias || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, retornoFerias: e.target.value } : null)}
                            placeholder="DD/MM/YYYY"
                            className="bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded w-full text-center text-xs"
                          />
                        ) : (
                          record.retornoFerias || <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Dias Gozo (Fórmula) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center bg-indigo-50/30 text-slate-800 font-bold min-w-[80px]" title="Calculado por fórmula">
                        {record.diasFerias}
                      </td>

                      {/* Venda de Férias (Abono Pecuniário) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center min-w-[120px]">
                        {isEditing ? (
                          <select
                            value={editForm?.abonoPecuniario || 'Não'}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, abonoPecuniario: e.target.value } : null)}
                            className="bg-white border border-slate-300 text-slate-800 px-1 py-1 rounded text-xs w-full"
                          >
                            <option value="Não">Não</option>
                            <option value="10 dias">10 dias (1/3)</option>
                            <option value="5 dias">5 dias</option>
                          </select>
                        ) : (
                          record.abonoPecuniario && record.abonoPecuniario !== 'Não' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              💰 {record.abonoPecuniario}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Não</span>
                          )
                        )}
                      </td>

                      {/* Adiantamento 13º Salário (Sim/Não) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center min-w-[100px]">
                        {isEditing ? (
                          <select
                            value={editForm?.adiantamento13 || 'Não'}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, adiantamento13: e.target.value as Adiantamento13Status } : null)}
                            className="bg-white border border-slate-300 text-slate-800 px-1 py-1 rounded text-xs w-full"
                          >
                            <option value="Não">Não</option>
                            <option value="Sim">Sim</option>
                          </select>
                        ) : (
                          record.adiantamento13 === 'Sim' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 mr-0.5 text-emerald-600" /> Sim
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Não</span>
                          )
                        )}
                      </td>

                      {/* Data Limite (Fórmula) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center font-mono text-xs bg-indigo-50/30 text-indigo-900 font-semibold min-w-[110px]" title="Calculado por fórmula CLT">
                        {record.dataLimite || '---'}
                      </td>

                      {/* SITUAÇÃO (Fórmula) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center bg-indigo-50/30 min-w-[140px]">
                        {renderStatusBadge(record.situacao)}
                      </td>

                      {/* Saldo de Férias (Fórmula) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center font-mono bg-indigo-50/30 text-slate-900 font-bold min-w-[80px]">
                        {record.saldoFerias}
                      </td>

                      {/* Status de Alerta (Fórmula Automática Coluna K) */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center bg-indigo-50/30 min-w-[170px]">
                        {renderAlertBadge(record.statusAlerta)}
                      </td>

                      {/* Aviso Férias */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center min-w-[100px]">
                        {isEditing ? (
                          <select
                            value={editForm?.avisoFerias || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, avisoFerias: e.target.value as NoticeStatus } : null)}
                            className="bg-white border border-slate-300 text-slate-800 px-1 py-1 rounded text-xs w-full"
                          >
                            <option value="">Nenhum</option>
                            <option value="Não enviado">Não enviado</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Finalizado">Finalizado</option>
                          </select>
                        ) : (
                          renderNoticeBadge(record.avisoFerias)
                        )}
                      </td>

                      {/* Recibo Férias */}
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center min-w-[100px]">
                        {isEditing ? (
                          <select
                            value={editForm?.reciboFerias || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, reciboFerias: e.target.value as ReceiptStatus } : null)}
                            className="bg-white border border-slate-300 text-slate-800 px-1 py-1 rounded text-xs w-full"
                          >
                            <option value="">Nenhum</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Finalizado">Finalizado</option>
                          </select>
                        ) : (
                          renderReceiptBadge(record.reciboFerias)
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                              title="Salvar Alterações"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                              title="Cancelar Edição"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleStartEdit(record)}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Editar Registro"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRecord(record.id)}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p className="text-[11px] text-slate-400 italic">Nota: As datas e saldos são calculados automaticamente com base no período aquisitivo.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Férias em Dobro
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Dentro do Prazo
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Não Vencidas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
