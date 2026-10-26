import React from 'react';
import { X, Mail, CheckCircle2, AlertTriangle, Send, Copy, ExternalLink } from 'lucide-react';
import { VacationRequest } from '../types';
import { RH_EMAIL } from '../data/managers';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: VacationRequest | null;
  stage: 'to_manager' | 'to_rh' | 'to_employee';
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  request,
  stage
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !request) return null;

  let recipientName = '';
  let recipientEmail = '';
  let subject = '';
  let badgeText = '';

  if (stage === 'to_manager') {
    recipientName = request.gestorResponsavel;
    recipientEmail = request.gestorEmail;
    subject = `[Aprovação de Férias] Solicitação de ${request.funcionario} (${request.diasFerias} dias)`;
    badgeText = 'Notificação para o Gestor Imediato';
  } else if (stage === 'to_rh') {
    recipientName = 'Gente & Gestão (RH)';
    recipientEmail = RH_EMAIL;
    subject = `[Férias Aprovadas pelo Gestor] Homologação pendente: ${request.funcionario}`;
    badgeText = 'Notificação para Gente & Gestão (RH)';
  } else {
    recipientName = request.funcionario;
    recipientEmail = request.email;
    subject = `[Férias Greener] Atualização de status da sua solicitação (#${request.id})`;
    badgeText = 'Confirmação para o Colaborador';
  }

  const emailBodyText = `Prezado(a) ${recipientName},\n\n` +
    (stage === 'to_manager'
      ? `O colaborador ${request.funcionario} (${request.setor}) submeteu uma solicitação de férias para o período de ${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias).\n\n` +
        `Venda de Férias: ${request.abonoPecuniario}\nAdiantamento de 13º: ${request.adiantamento13}\nObservação: ${request.observacaoColaborador || 'Nenhuma'}\n\n` +
        `Por favor, acesse o painel para aprovar ou solicitar ajuste.`
      : stage === 'to_rh'
      ? `A solicitação de férias de ${request.funcionario} foi APROVADA pelo gestor ${request.gestorResponsavel} em ${request.aprovadoGestorEm || 'recente'}.\n\n` +
        `Parecer do Gestor: "${request.parecerGestor || 'Aprovado'}"\nPeríodo: ${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias).\n\n` +
        `Favor homologar no sistema e gerar o Aviso de Férias formal.`
      : `Sua solicitação de férias (#${request.id}) de ${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias) foi atualizada para: ${request.status}.\n\n` +
        `Qualquer dúvida, entre em contato com Gente & Gestão.`);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Simulador de E-mail Automático</h3>
              <p className="text-[11px] text-slate-400">{badgeText}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center">
            <span className="w-16 font-semibold text-slate-400">De:</span>
            <span className="font-mono text-slate-800">notificacoes-rh@greener.com.br (Sistema de Férias Greener)</span>
          </div>
          <div className="flex items-center">
            <span className="w-16 font-semibold text-slate-400">Para:</span>
            <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {recipientName} &lt;{recipientEmail}&gt;
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-16 font-semibold text-slate-400">Assunto:</span>
            <span className="font-semibold text-slate-900">{subject}</span>
          </div>
        </div>

        {/* Email Body Rendering */}
        <div className="p-6 bg-white space-y-4">
          <div className="border border-slate-200 rounded-lg p-5 bg-gradient-to-b from-slate-50/50 to-white shadow-xs space-y-4">
            {/* Greener Header Logo Sim */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  G
                </div>
                <span className="font-bold text-slate-800 tracking-tight text-sm">Greener • Gente & Gestão</span>
              </div>
              <span className="text-[11px] text-slate-400">Protocolo #{request.id}</span>
            </div>

            {/* Email Greeting */}
            <div>
              <p className="text-sm text-slate-800 font-medium">Olá, <strong>{recipientName}</strong>,</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {stage === 'to_manager' && (
                  <>Você recebeu uma nova solicitação de férias de um membro da sua equipe para avaliação e aprovação:</>
                )}
                {stage === 'to_rh' && (
                  <>O gestor responsável <strong>{request.gestorResponsavel}</strong> aprovou a programação de férias a seguir. É necessária a sua homologação e emissão dos documentos formais:</>
                )}
                {stage === 'to_employee' && (
                  <>Sua solicitação de férias foi atualizada na esteira de aprovação da Greener:</>
                )}
              </p>
            </div>

            {/* Request Summary Box */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Colaborador(a)</span>
                  <span className="font-bold text-slate-900">{request.funcionario}</span>
                  <span className="text-[11px] text-slate-500 block">{request.setor}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Gestor Imediato</span>
                  <span className="font-bold text-slate-900">{request.gestorResponsavel}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">{request.gestorEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Período Solicitado</span>
                  <span className="font-bold text-indigo-700">{request.inicioFerias} a {request.retornoFerias}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Duração</span>
                  <span className="font-bold text-slate-800">{request.diasFerias} dias</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Abono Pecuniário (Venda)</span>
                  <span className="font-bold text-slate-800">{request.abonoPecuniario}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Adiantamento de 13º Salário:</span>
                <span className="font-bold text-slate-800">{request.adiantamento13}</span>
              </div>

              {request.observacaoColaborador && (
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-[11px] text-slate-600 italic">
                  &ldquo;{request.observacaoColaborador}&rdquo;
                </div>
              )}

              {request.parecerGestor && (
                <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-100 text-[11px] text-emerald-800">
                  <strong>Parecer do Gestor ({request.gestorResponsavel}):</strong> &ldquo;{request.parecerGestor}&rdquo;
                </div>
              )}
            </div>

            {/* Email Action Buttons Preview */}
            {stage === 'to_manager' && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-md text-center shadow-xs cursor-default">
                  ✓ Aprovar Férias da Equipe
                </div>
                <div className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-md text-center border border-slate-200 cursor-default">
                  Solicitar Ajuste de Datas
                </div>
              </div>
            )}

            {stage === 'to_rh' && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-md text-center shadow-xs cursor-default">
                  ✓ Homologar no RH & Gerar Aviso de Férias
                </div>
              </div>
            )}

            {/* Footer note */}
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Este e-mail é gerado automaticamente pelo fluxo de férias da Greener Tecnologia e Pesquisa.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto do E-mail'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
