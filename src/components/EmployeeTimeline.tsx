import React, { useState } from 'react';
import { VacationRecord, EmployeeSummary } from '../types';
import { Users, Calendar, AlertTriangle, CheckCircle, ChevronRight, Clock, Award } from 'lucide-react';

interface EmployeeTimelineProps {
  records: VacationRecord[];
}

export const EmployeeTimeline: React.FC<EmployeeTimelineProps> = ({ records }) => {
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  // Group records by employee name
  const employeeMap = new Map<string, VacationRecord[]>();
  records.forEach(r => {
    if (!employeeMap.has(r.funcionario)) {
      employeeMap.set(r.funcionario, []);
    }
    employeeMap.get(r.funcionario)!.push(r);
  });

  const summaries: EmployeeSummary[] = Array.from(employeeMap.entries()).map(([nome, groupRecords]) => {
    const dataContratacao = groupRecords[0]?.dataContratacao || '---';
    const email = groupRecords.find(r => r.email)?.email;
    const setor = groupRecords.find(r => r.setor)?.setor;
    const gestorResponsavel = groupRecords.find(r => r.gestorResponsavel)?.gestorResponsavel;
    const totalPeriodos = groupRecords.length;
    const saldoTotalDias = groupRecords.reduce((acc, r) => acc + (r.saldoFerias || 0), 0);
    const temFeriasEmDobro = groupRecords.some(r => r.situacao === 'Férias em Dobro');
    const temAtencao = groupRecords.some(r => r.situacao === 'Atenção (A Vencer)');
    
    // Nearest limit date
    const limits = groupRecords.map(r => r.dataLimite).filter(Boolean).sort();
    const proximoVencimento = limits[0] || '---';

    return {
      nome,
      email,
      setor,
      gestorResponsavel,
      dataContratacao,
      totalPeriodos,
      saldoTotalDias,
      temFeriasEmDobro,
      temAtencao,
      proximoVencimento,
      registros: groupRecords
    };
  });

  const toggleExpand = (nome: string) => {
    setExpandedEmployee(expandedEmployee === nome ? null : nome);
  };

  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Visão Consolidada por Colaborador</h2>
            <p className="text-xs text-slate-500">
              Total de {summaries.length} colaboradores ativos na base de dados
            </p>
          </div>
        </div>
      </div>

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 gap-3">
        {summaries.map((emp) => {
          const isExpanded = expandedEmployee === emp.nome || summaries.length <= 4;

          return (
            <div
              key={emp.nome}
              className={`bg-white border rounded-xl overflow-hidden transition-all shadow-2xs ${
                emp.temFeriasEmDobro
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Employee Summary Card Header */}
              <div
                onClick={() => toggleExpand(emp.nome)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    emp.temFeriasEmDobro
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {emp.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-800">{emp.nome}</h3>
                      {emp.temFeriasEmDobro && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Risco Férias em Dobro
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Admissão: {emp.dataContratacao}
                      </span>
                      {emp.setor && (
                        <>
                          <span>•</span>
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                            {emp.setor}
                          </span>
                        </>
                      )}
                      {emp.gestorResponsavel && (
                        <>
                          <span>•</span>
                          <span>Gestor: <strong className="text-slate-700">{emp.gestorResponsavel}</strong></span>
                        </>
                      )}
                      {emp.email && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 font-mono text-[11px]">{emp.email}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{emp.totalPeriodos} período(s)</span>
                    </div>
                  </div>
                </div>

                {/* Right Stat Indicators */}
                <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">Saldo Total de Férias</p>
                    <p className="text-sm font-bold text-emerald-700 font-mono">
                      {emp.saldoTotalDias} <span className="text-xs font-normal text-slate-500">dias</span>
                    </p>
                  </div>

                  <div className="p-1 rounded text-slate-400 hover:text-slate-600">
                    <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Detail Rows timeline if expanded */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                    Histórico de Períodos Aquisitivos & Gozo
                  </h4>

                  <div className="space-y-2">
                    {emp.registros.map((r, idx) => (
                      <div
                        key={r.id}
                        className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 font-bold">#{idx + 1}</span>
                            <span className="text-slate-800 font-semibold">
                              Aquisitivo: {r.inicioPeriodoAquisitivo} a {r.dataVencimento}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] flex flex-wrap gap-2 items-center">
                            <span>Limite Concessivo: <strong className="text-slate-800">{r.dataLimite}</strong></span>
                            {r.inicioFerias && (
                              <span>Gozo: <strong className="text-indigo-700">{r.inicioFerias} a {r.retornoFerias}</strong> ({r.diasFerias} dias)</span>
                            )}
                            {r.abonoPecuniario && r.abonoPecuniario !== 'Não' && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                💰 Venda: {r.abonoPecuniario}
                              </span>
                            )}
                            {r.adiantamento13 === 'Sim' && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                13º Adiantado
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-sans">Saldo do Período</span>
                            <span className="text-xs font-bold text-emerald-700">{r.saldoFerias} dias</span>
                          </div>

                          <div className="flex items-center space-x-2 font-sans">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              r.situacao === 'Férias em Dobro'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : r.situacao === 'Dentro do Prazo'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {r.situacao}
                            </span>

                            {r.statusAlerta && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {r.statusAlerta}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
