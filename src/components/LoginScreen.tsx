import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, UserCheck, Users, Sparkles, Building2, CheckCircle, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { PRESET_ACCOUNTS, resolveUserProfile } from '../utils/auth';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [emailInput, setEmailInput] = useState<string>('sara.milione@greener.com.br');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailInput.trim().toLowerCase();
    if (!clean) {
      setErrorMsg('Por favor, informe seu e-mail corporativo.');
      return;
    }

    const resolved = resolveUserProfile(clean);
    onLogin(resolved);
  };

  const handleSelectPreset = (account: UserProfile) => {
    setEmailInput(account.email);
    onLogin(account);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background visual accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Greener Soluções Sustentáveis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Portal de Gestão & Férias CLT
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Acesso corporativo unificado com permissões automáticas por perfil (RH, Gestão de Equipe ou Colaborador).
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail Corporativo Greener
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="seu.nome@greener.com.br"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                />
              </div>
              {errorMsg && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errorMsg}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Acessar Portal de Férias</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role Explanations */}
          <div className="border-t border-slate-800/80 pt-5 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Acesso Rápido por Perfil Corporativo
            </span>

            {/* RH Group */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gente & Gestão (RH) — Visão Geral & Homologação</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_ACCOUNTS.filter(p => p.role === 'RH').map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectPreset(acc)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-800/40 text-left transition-all text-xs group"
                  >
                    <div>
                      <div className="font-bold text-indigo-200 group-hover:text-white flex items-center space-x-1.5">
                        <span>{acc.nome}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                          RH Geral
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{acc.email}</span>
                    </div>
                    <span className="text-indigo-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Entrar &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gestores Group */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Diretório de Gestores — Fila de Aprovação da Equipe</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PRESET_ACCOUNTS.filter(p => p.role === 'GESTOR').map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectPreset(acc)}
                    className="flex flex-col p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-left transition-all text-xs group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-amber-300 truncate">
                      {acc.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</span>
                    <span className="text-[10px] text-amber-400/80 mt-0.5 truncate">{acc.cargo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colaboradores Group */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>Colaboradores — Minhas Férias & Solicitações</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PRESET_ACCOUNTS.filter(p => p.role === 'COLABORADOR').map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectPreset(acc)}
                    className="flex flex-col p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-left transition-all text-xs group"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                      {acc.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</span>
                    <span className="text-[10px] text-emerald-400/80 mt-0.5 truncate">{acc.setor}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security / Compliance note */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Controle de Férias CLT em Conformidade com o Artigo 140 da CLT e Políticas Greener</span>
        </div>
      </div>
    </div>
  );
};
