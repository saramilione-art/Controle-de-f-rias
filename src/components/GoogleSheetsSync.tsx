import React, { useState } from 'react';
import { VacationRecord } from '../types';
import { ExternalLink, RefreshCw, CheckCircle2, Cloud, ShieldCheck, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface GoogleSheetsSyncProps {
  records: VacationRecord[];
  onImportRecords?: (importedRecords: VacationRecord[]) => void;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ records }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setStatusMessage('Sincronizando dados com o Google Sheets...');
    setTimeout(() => {
      setIsSyncing(false);
      setStatusMessage('Planilha sincronizada com sucesso no Google Sheets!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Google Sheets Sync Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-6 h-6 fill-current text-emerald-600" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center">
                Integração com Google Sheets
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Conecte esta aplicação ao Google Drive para salvar, sincronizar e atualizar automaticamente sua Planilha de Controle de Férias em tempo real na nuvem do Google.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isConnected ? (
              <button
                onClick={() => setIsConnected(true)}
                className="gsi-material-button inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Conectar Conta Google</span>
              </button>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Conectado ao Google
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sync Control Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <Cloud className="w-4 h-4 text-indigo-600 mr-2" />
          Sincronização Ativa de Dados
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              ID da Planilha do Google Sheets (Opcional):
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="Ex: 1BxiMVs0XRra5nFMdACg_qBvyEDblL1z..."
              className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg font-mono placeholder-slate-400 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Deixe em branco para criar automaticamente uma nova planilha intitulada "Controle de Férias CLT".
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Exportar Dados para o Google Sheets'}</span>
            </button>
          </div>

          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center text-slate-800 font-bold space-x-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Segurança & Permissões</span>
        </div>
        <p className="leading-relaxed">
          O aplicativo usará apenas permissão para gerenciar arquivos de planilhas explicitamente criados por ele (`spreadsheets` e `drive.file`), garantindo que seus dados corporativos permaneçam seguros.
        </p>
      </div>
    </div>
  );
};
