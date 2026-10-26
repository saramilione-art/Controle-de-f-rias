import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Sparkles, Send } from 'lucide-react';
import { VacationRequest } from '../types';
import { RH_RESPONSAVEL } from '../data/managers';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: VacationRequest | null;
  actionType: 'approve_manager' | 'reject_manager' | 'homologate_rh' | 'reject_rh';
  currentRole: string;
  onConfirmAction: (
    requestId: string,
    actionType: 'approve_manager' | 'reject_manager' | 'homologate_rh' | 'reject_rh',
    feedback: string,
    autoAddToSpreadsheet: boolean
  ) => void;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  isOpen,
  onClose,
  request,
  actionType,
  currentRole,
  onConfirmAction
}) => {
  const [feedback, setFeedback] = useState<string>('');
  const [autoAdd, setAutoAdd] = useState<boolean>(true);

  if (!isOpen || !request) return null;

  const isApproval = actionType === 'approve_manager' || actionType === 'homologate_rh';
  const isRH = actionType === 'homologate_rh' || actionType === 'reject_rh';

  const title = isApproval
    ? isRH
      ? 'Homologar Férias no RH'
      : 'Aprovar Solicitação de Férias (Gestor)'
    : isRH
    ? 'Recusar / Solicitar Ajuste (RH)'
    : 'Recusar / Solicitar Ajuste (Gestor)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmAction(request.id, actionType, feedback, isRH && isApproval ? autoAdd : false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${isApproval ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <div className="flex items-center space-x-2.5">
            {isApproval ? (
              <CheckCircle className="w-5 h-5 text-white stroke-[2.5]" />
            ) : (
              <XCircle className="w-5 h-5 text-white stroke-[2.5]" />
            )}
            <h3 className="text-base font-bold tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-black/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Colaborador(a)</span>
                <span className="font-bold text-sm text-slate-900">{request.funcionario}</span>
                <span className="text-slate-500">{request.setor}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium block">Período</span>
                <span className="font-bold text-indigo-700">{request.inicioFerias} a {request.retornoFerias}</span>
                <span className="text-slate-600 font-semibold block">{request.diasFerias} dias</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
              <span>Gestor Imediato: <strong className="text-slate-800">{request.gestorResponsavel}</strong></span>
              <span>Abono: <strong>{request.abonoPecuniario}</strong></span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {isApproval ? 'Parecer / Observações (Opcional):' : 'Motivo da Recusa ou Instruções de Ajuste (Obrigatório):'}
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required={!isApproval}
              placeholder={
                isApproval
                  ? isRH
                    ? 'Ex: Homologado pelo RH. Aviso de Férias e cálculo de 1/3 validados com sucesso.'
                    : 'Ex: Aprovado. Alinhado com a cobertura da equipe.'
                  : 'Ex: Favor readequar o período para a segunda quinzena por conta do fechamento fiscal.'
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* If RH is homologating, option to sync into spreadsheet */}
          {isRH && isApproval && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 space-y-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdd}
                  onChange={(e) => setAutoAdd(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="text-[11px] text-slate-700">
                  <span className="font-bold text-indigo-900 block">
                    Atualizar Planilha Oficial & Deduzir Saldo Automaticamente
                  </span>
                  Lança este período gozado na aba "Planilha Geral" e marca o Aviso de Férias como emitido.
                </div>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors ${
                isApproval
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isApproval ? (isRH ? 'Confirmar Homologação' : 'Confirmar Aprovação') : 'Confirmar Recusa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
