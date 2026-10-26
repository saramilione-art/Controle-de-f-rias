import React, { useState } from 'react';
import { VacationRecord } from '../types';
import { EXCEL_FORMULAS_INFO } from '../utils/cltFormulas';
import { Download, Copy, Check, X, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: VacationRecord[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, records }) => {
  const [copiedCSV, setCopiedCSV] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate CSV text
  const generateCSV = () => {
    const headers = [
      'FUNCIONÁRIO',
      'E-mail',
      'Setor',
      'Gestor Responsável',
      'Data da contratação',
      'Início novo período aquisitivo',
      'Data vencimento',
      'Início férias',
      'Retorno',
      'Dias de férias',
      'Venda de férias (Abono pecuniário)',
      'Adiantamento 13º salário',
      'Data limite',
      'Situação',
      'Saldo de férias',
      'Status de Alerta',
      'Aviso de Férias',
      'Recibo de férias'
    ];

    const rows = records.map(r => [
      `"${r.funcionario}"`,
      `"${r.email || ''}"`,
      `"${r.setor || ''}"`,
      `"${r.gestorResponsavel || ''}"`,
      r.dataContratacao,
      r.inicioPeriodoAquisitivo,
      r.dataVencimento,
      r.inicioFerias || '',
      r.retornoFerias || '',
      r.diasFerias,
      `"${r.abonoPecuniario || 'Não'}"`,
      `"${r.adiantamento13 || 'Não'}"`,
      r.dataLimite,
      `"${r.situacao}"`,
      r.saldoFerias,
      `"${r.statusAlerta || ''}"`,
      `"${r.avisoFerias || ''}"`,
      `"${r.reciboFerias || ''}"`
    ]);

    return [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = '\uFEFF' + generateCSV(); // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Controle_de_Ferias_CLT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCSV = () => {
    navigator.clipboard.writeText(generateCSV());
    setCopiedCSV(true);
    setTimeout(() => setCopiedCSV(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Exportar Planilha de Férias</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            Exporte os <strong className="text-indigo-700">{records.length} registros</strong> de férias formatados com todas as colunas de dados e cálculos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadCSV}
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 rounded-xl text-left space-y-2 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">Baixar Arquivo CSV / Excel</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Compatível com Excel, Google Sheets e Numbers (Separado por Ponto e Vírgula)</p>
              </div>
            </button>

            <button
              onClick={handleCopyCSV}
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 rounded-xl text-left space-y-2 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                {copiedCSV ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">
                  {copiedCSV ? 'Copiado para a Área de Transferência!' : 'Copiar Dados Brutos'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Cole diretamente em qualquer planilha existente</p>
              </div>
            </button>
          </div>

          {/* Formulas Summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 block">Dica para Google Sheets / Excel:</span>
            <p>
              As colunas Data Vencimento, Dias Gozo, Data Limite, SITUAÇÃO e Saldo de Férias contêm fórmulas automáticas. Consulte a aba "Fórmulas & Regras CLT" para copiar as fórmulas de cada coluna.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
