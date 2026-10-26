import React from 'react';
import { Calendar, Search, Plus, Download, RefreshCw, FileCode, Users, Layers, Sparkles, UserCheck, LogOut, ShieldCheck } from 'lucide-react';
import { FilterStatus, UserProfile } from '../types';

interface HeaderProps {
  referenceDate: string;
  setReferenceDate: (date: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  activeTab: 'planilha' | 'colaboradores' | 'formulas' | 'google-sheets' | 'aprovacoes';
  setActiveTab: (tab: 'planilha' | 'colaboradores' | 'formulas' | 'google-sheets' | 'aprovacoes') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onRecalculateAll: () => void;
  pendingApprovalsCount?: number;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  referenceDate,
  setReferenceDate,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenExportModal,
  onRecalculateAll,
  pendingApprovalsCount = 0,
  currentUser,
  onLogout
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 shadow-xs">
      {/* Top Corporate Status Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Greener • Sistema Integrado de Gestão de Férias CLT</span>
        </div>

        {/* Authenticated User Capsule */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Conectado como:</span>
            <span className="font-bold text-white text-xs">{currentUser.nome}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              currentUser.role === 'RH'
                ? 'bg-indigo-600 text-white'
                : currentUser.role === 'GESTOR'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-emerald-600 text-white'
            }`}>
              {currentUser.role === 'RH' ? 'Gente & Gestão (RH)' : currentUser.role === 'GESTOR' ? 'Gestor(a)' : 'Colaborador(a)'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors text-[11px]"
            title="Sair ou trocar de conta"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-800">
                  Controle de Férias CLT
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                  {currentUser.role === 'RH' ? 'Painel Geral RH' : currentUser.role === 'GESTOR' ? 'Painel de Gestão' : 'Portal do Colaborador'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentUser.role === 'RH' && 'Visão completa corporativa: homologação de férias, controle de saldos e alertas CLT.'}
                {currentUser.role === 'GESTOR' && `Gestão de equipe: aprovação de solicitações de férias para o time de ${currentUser.setor || currentUser.nome}.`}
                {currentUser.role === 'COLABORADOR' && `Área individual: faça sua solicitação de férias e acompanhe o fluxo até a homologação.`}
              </p>
            </div>
          </div>

          {/* Reference Date Control (RH and Managers) */}
          {(currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
            <div className="flex items-center space-x-2.5 bg-slate-50 p-1.5 px-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="font-bold uppercase text-[10px] text-slate-500 tracking-wider">Data de Referência:</span>
              </div>
              <input
                type="text"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="bg-white border border-slate-300 text-indigo-700 font-mono font-bold px-2 py-1 rounded text-xs w-28 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => setReferenceDate('28/07/2026')}
                className={`px-2 py-1 rounded text-xs transition-colors font-semibold ${
                  referenceDate === '28/07/2026'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                title="Restaurar data do cabeçalho da planilha original (28/07/2026)"
              >
                28/07/2026
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const dd = String(today.getDate()).padStart(2, '0');
                  const mm = String(today.getMonth() + 1).padStart(2, '0');
                  const yyyy = today.getFullYear();
                  setReferenceDate(`${dd}/${mm}/${yyyy}`);
                }}
                className="px-2 py-1 rounded text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold transition-colors"
                title="Usar Data Atual de Hoje"
              >
                Hoje
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation & Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <nav className="flex space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {/* Solicitações & Aprovações - Top priority for all users */}
            <button
              onClick={() => setActiveTab('aprovacoes')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'aprovacoes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {currentUser.role === 'COLABORADOR'
                  ? 'Minhas Solicitações'
                  : currentUser.role === 'GESTOR'
                  ? 'Aprovações da Equipe'
                  : 'Solicitações & Homologação'}
              </span>
              {pendingApprovalsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'aprovacoes'
                    ? 'bg-white text-indigo-700'
                    : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Planilha Geral (RH and Gestores) */}
            {(currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
              <button
                onClick={() => setActiveTab('planilha')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'planilha'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Planilha Geral</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('colaboradores')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'colaboradores'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{currentUser.role === 'COLABORADOR' ? 'Meu Período & Linha do Tempo' : 'Visão por Colaborador'}</span>
            </button>

            <button
              onClick={() => setActiveTab('formulas')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'formulas'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Fórmulas & Regras CLT</span>
            </button>

            {currentUser.role === 'RH' && (
              <button
                onClick={() => setActiveTab('google-sheets')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'google-sheets'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"/>
                </svg>
                <span>Google Sheets Sync</span>
              </button>
            )}
          </nav>

          {/* Action Buttons - according to role permissions */}
          <div className="flex items-center space-x-2">
            {(currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
              <button
                onClick={onRecalculateAll}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors shadow-2xs"
                title="Recalcular todas as fórmulas automaticamente"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Recalcular</span>
              </button>
            )}

            {(currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
              <button
                onClick={onOpenExportModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Exportar</span>
              </button>
            )}

            {currentUser.role === 'RH' && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Novo Lançamento</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        {activeTab === 'planilha' && (currentUser.role === 'RH' || currentUser.role === 'GESTOR') && (
          <div className="mt-3.5 flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do funcionário..."
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs pl-9 pr-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">Filtrar por Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="bg-white border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold w-full sm:w-auto"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="Férias em Dobro">🚨 Férias em Dobro (Crítico)</option>
                <option value="URGENTE_30">🔴 Urgência (&lt; 30 Dias)</option>
                <option value="ALERTA_60">🟠 Alerta (&lt; 60 Dias)</option>
                <option value="ATENCAO_90">🟡 Atenção (&lt; 90 Dias)</option>
                <option value="Dentro do Prazo">🟢 Dentro do Prazo</option>
                <option value="Férias não vencidas">⏳ Férias Não Vencidas</option>
                <option value="Em Férias">✈️ Em Férias</option>
                <option value="Concluído">🏁 Concluído (Saldo 0)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
