import React, { useState } from 'react';
import { 
  X, 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Send, 
  MessageSquare, 
  Mail, 
  Zap, 
  ShieldCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { VacationRequest, UserProfile } from '../types';
import { generateQuickLinks, triggerWebhook, getWebhookConfig } from '../utils/webhookService';

interface QuickLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: VacationRequest | null;
  currentUser: UserProfile;
  onNotificationSent?: (msg: string) => void;
}

export const QuickLinksModal: React.FC<QuickLinksModalProps> = ({
  isOpen,
  onClose,
  request,
  currentUser,
  onNotificationSent
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isTriggeringWebhook, setIsTriggeringWebhook] = useState(false);
  const [webhookStatusMsg, setWebhookStatusMsg] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const quickLinks = generateQuickLinks(request);
  const webhookConfig = getWebhookConfig();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSendManualWebhook = async () => {
    setIsTriggeringWebhook(true);
    setWebhookStatusMsg(null);
    try {
      const result = await triggerWebhook('SOLICITACAO_CRIADA', request, {
        nome: currentUser.nome,
        email: currentUser.email
      });
      setWebhookStatusMsg(result.message);
      if (onNotificationSent) onNotificationSent('Webhook disparado com sucesso!');
    } catch (err: any) {
      setWebhookStatusMsg(`Erro: ${err.message || 'Falha ao conectar'}`);
    } finally {
      setIsTriggeringWebhook(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight flex items-center space-x-1.5">
                <span>Links Rápidos & Disparo Direto</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
                  #{request.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Compartilhe com 1 clique para aprovação do gestor ou notificação do colaborador.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Quick Summary */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Colaborador:</span>{' '}
            <strong className="text-slate-900">{request.funcionario}</strong>
            <span className="text-slate-400 mx-1.5">•</span>
            <span className="text-indigo-700 font-bold">{request.inicioFerias} a {request.retornoFerias} ({request.diasFerias} dias)</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            request.status === 'HOMOLOGADO_RH' ? 'bg-emerald-100 text-emerald-800' :
            request.status === 'APROVADO_GESTOR' ? 'bg-blue-100 text-blue-800' :
            'bg-amber-100 text-amber-800'
          }`}>
            {request.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Action 1: Direct Portal Deep Link */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <span>Link Direto do Sistema (Aprovação em 1 Clique)</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                Deep Link
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Ao abrir este link, o sistema carrega diretamente esta solicitação para o gestor ou RH aprovar com parecer.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                readOnly
                value={quickLinks.portalApproveUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
              />
              <button
                onClick={() => handleCopy(quickLinks.portalApproveUrl, 'deepLink')}
                className={`px-3 py-2 rounded-lg font-bold flex items-center space-x-1 transition-all shrink-0 ${
                  copiedLink === 'deepLink'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {copiedLink === 'deepLink' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action 2: Fast Channels (WhatsApp & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp */}
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span>Notificar via WhatsApp</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  Abre o WhatsApp com mensagem formatada para o gestor ({request.gestorResponsavel}) contendo resumo das datas e link de aprovação.
                </p>
              </div>
              <div className="space-y-1.5 pt-1">
                <a
                  href={quickLinks.whatsappManagerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar para o Gestor</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
                <button
                  onClick={() => handleCopy(quickLinks.formattedShareMessage, 'waText')}
                  className="w-full py-1.5 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold text-center hover:underline"
                >
                  {copiedLink === 'waText' ? '✓ Texto copiado!' : 'Copiar texto formatado do WhatsApp'}
                </button>
              </div>
            </div>

            {/* Email (Gmail / Outlook) */}
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2 text-blue-900 font-bold">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span>Disparo via E-mail (Gmail)</span>
                </div>
                <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                  Abre seu cliente de e-mail (Gmail/Outlook) com destinatário, assunto formal e link de aprovação preenchidos.
                </p>
              </div>
              <div className="space-y-1.5 pt-1">
                <a
                  href={
                    request.status === 'PENDENTE_GESTOR'
                      ? quickLinks.mailtoManagerUrl
                      : request.status === 'APROVADO_GESTOR'
                      ? quickLinks.mailtoRhUrl
                      : quickLinks.mailtoEmployeeUrl
                  }
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {request.status === 'PENDENTE_GESTOR' ? 'Abrir E-mail ao Gestor' :
                     request.status === 'APROVADO_GESTOR' ? 'Abrir E-mail ao RH' :
                     'Abrir E-mail ao Colaborador'}
                  </span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
                <div className="text-center text-[10px] text-blue-700 font-mono">
                  {request.status === 'PENDENTE_GESTOR' ? request.gestorEmail : 'sara.milione@greener.com.br'}
                </div>
              </div>
            </div>
          </div>

          {/* Action 3: Trigger Webhook Now */}
          <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-950 font-bold">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Disparo Automático via Webhook</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Canal: {webhookConfig.provider.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Envia os dados desta solicitação e os links de aprovação para o endpoint configurado ({webhookConfig.url || 'Não configurado'}).
            </p>

            {webhookStatusMsg && (
              <div className="p-2.5 rounded-lg bg-indigo-100/70 border border-indigo-200 text-indigo-900 text-xs font-semibold">
                {webhookStatusMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                {webhookConfig.url || 'Configure a URL na aba Automação'}
              </div>
              <button
                onClick={handleSendManualWebhook}
                disabled={isTriggeringWebhook}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTriggeringWebhook ? 'Enviando Webhook...' : 'Disparar Webhook Agora'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
