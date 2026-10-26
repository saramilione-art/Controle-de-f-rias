import React from 'react';
import { VacationRecord } from '../types';
import { AlertTriangle, CheckCircle2, Clock, Users, Calendar, AlertCircle, Bell, ShieldAlert } from 'lucide-react';

interface StatsOverviewProps {
  records: VacationRecord[];
  referenceDate: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ records, referenceDate }) => {
  // Unique employees
  const uniqueEmployees = Array.from(new Set(records.map(r => r.funcionario)));
  
  // Count by status
  const feriasEmDobroCount = records.filter(r => r.situacao === 'Férias em Dobro' || r.statusAlerta?.includes('CRÍTICO')).length;
  const dentroDoPrazoCount = records.filter(r => r.situacao === 'Dentro do Prazo').length;
  const naoVencidasCount = records.filter(r => r.situacao === 'Férias não vencidas').length;
  
  // Expiration alerts count (30, 60, 90 days)
  const urgente30Count = records.filter(r => r.statusAlerta?.includes('URGENTE')).length;
  const alerta60Count = records.filter(r => r.statusAlerta?.includes('ALERTA')).length;
  const atencao90Count = records.filter(r => r.statusAlerta?.includes('ATENÇÃO')).length;
  
  // Sum of total balance
  const saldoTotal = records.reduce((acc, r) => acc + (r.saldoFerias || 0), 0);
  
  // List of employees with Férias em Dobro or Urgente < 30d
  const feriasEmDobroEmployees = Array.from(
    new Set(records.filter(r => r.situacao === 'Férias em Dobro' || r.statusAlerta?.includes('CRÍTICO')).map(r => r.funcionario))
  );

  const urgente30Employees = Array.from(
    new Set(records.filter(r => r.statusAlerta?.includes('URGENTE')).map(r => r.funcionario))
  );

  return (
    <div className="space-y-3">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Employees */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Colaboradores Ativos</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{uniqueEmployees.length < 10 ? `0${uniqueEmployees.length}` : uniqueEmployees.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{records.length} períodos registrados</p>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Férias em Dobro (Alert) */}
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-2xs bg-red-50/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Férias em Dobro</p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              {feriasEmDobroCount < 10 ? `0${feriasEmDobroCount}` : feriasEmDobroCount}
            </p>
            <p className="text-[11px] text-red-600/80 font-medium mt-0.5">Multa CLT Art. 137</p>
          </div>
          <div className="p-2.5 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Avisos Pendentes / Urgência < 30 dias */}
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs bg-amber-50/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Avisos Pendentes (&lt;30d)</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {urgente30Count < 10 ? `0${urgente30Count}` : urgente30Count}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Prestes a vencer</p>
          </div>
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Dentro do Prazo / Regular */}
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs bg-emerald-50/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Dentro do Prazo</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {dentroDoPrazoCount < 10 ? `0${dentroDoPrazoCount}` : dentroDoPrazoCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{saldoTotal} dias de saldo total</p>
          </div>
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Horizon Expiration Alert Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-2 text-slate-800 font-bold">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>Visão de Próximos Vencimentos de Gozo (Período Concessivo CLT):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-red-50 border border-red-200 px-2.5 py-1 rounded flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-red-800 font-bold text-[11px]">Dobro (Vencido): {feriasEmDobroCount}</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded flex items-center space-x-1.5">
            <span className="text-rose-800 font-bold text-[11px]">🔴 &lt; 30d: {urgente30Count}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded flex items-center space-x-1.5">
            <span className="text-amber-800 font-semibold text-[11px]">🟠 &lt; 60d: {alerta60Count}</span>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded flex items-center space-x-1.5">
            <span className="text-yellow-800 font-semibold text-[11px]">🟡 &lt; 90d: {atencao90Count}</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar if Férias em Dobro or Urgente <30d detected */}
      {(feriasEmDobroCount > 0 || urgente30Count > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-red-900 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-800 uppercase tracking-wide text-[11px]">
                Aviso Trabalhista CLT (Art. 137): Ação Urgente Necessária
              </span>
              <span className="text-[11px] text-red-700 font-mono">Data Ref: {referenceDate}</span>
            </div>
            {feriasEmDobroCount > 0 && (
              <p className="text-slate-700">
                • <strong>{feriasEmDobroCount} período(s)</strong> ultrapassaram a Data Limite em dobro: {' '}
                <strong className="text-red-800 underline">{feriasEmDobroEmployees.join(', ')}</strong>.
              </p>
            )}
            {urgente30Count > 0 && (
              <p className="text-slate-700">
                • <strong>{urgente30Count} período(s)</strong> vencerão nos próximos 30 dias: {' '}
                <strong className="text-red-800 underline">{urgente30Employees.join(', ')}</strong>. Programar o aviso e gozo imediatamente.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
