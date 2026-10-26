import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Code, 
  Copy, 
  Check, 
  Trash2, 
  Sliders, 
  Zap, 
  Link as LinkIcon, 
  MessageSquare, 
  ShieldCheck, 
  BellRing,
  HelpCircle
} from 'lucide-react';
import { WebhookConfig, WebhookDeliveryLog, WebhookProvider } from '../types';
import { 
  getWebhookConfig, 
  saveWebhookConfig, 
  getWebhookLogs, 
  clearWebhookLogs, 
  sendTestWebhook,
  DEFAULT_WEBHOOK_CONFIG
} from '../utils/webhookService';

export const WebhookConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<WebhookConfig>(getWebhookConfig());
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>(getWebhookLogs());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedLogPayload, setSelectedLogPayload] = useState<WebhookDeliveryLog | null>(null);

  useEffect(() => {
    setConfig(getWebhookConfig());
    setLogs(getWebhookLogs());
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebhookConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await sendTestWebhook();
      setTestResult(res);
      // Reload logs to show test dispatch
      setLogs(getWebhookLogs());
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro ao realizar teste de conexão.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Deseja limpar todos os registros de histórico de disparos?')) {
      clearWebhookLogs();
      setLogs([]);
    }
  };

  const sampleJsonPayload = JSON.stringify(
    {
      evento: "SOLICITACAO_CRIADA",
      timestamp: "2026-10-26T12:00:00Z",
      provedor: config.provider,
      origem: "Greener Portal de Gestão & Férias CLT",
      solicitacao: {
        id: "REQ-2026-001",
        colaborador: {
          nome: "Tamíris Aparecida da Silva Santos",
          email: "tamiris.santos@greener.com.br",
          setor: "Relacionamento/Comercial"
        },
        gestor: {
          nome: "Silvana Maria Silva Silvestre",
          email: "silvana.silvestre@greener.com.br"
        },
        detalhes: {
          inicioFerias: "11/01/2027",
          retornoFerias: "20/01/2027",
          diasFerias: 10,
          abonoPecuniario: "Não",
          adiantamento13: "Não"
        },
        status: "PENDENTE_GESTOR"
      },
      linksRapidos: {
        linkRevisaoPortal: "https://greener-ferias.greener.com.br?reqId=REQ-2026-001&action=review",
        linkAprovacaoDireta: "https://greener-ferias.greener.com.br?reqId=REQ-2026-001&action=approve",
        linkWhatsAppGestor: "https://api.whatsapp.com/send?text=...",
        linkMailtoGestor: "mailto:silvana.silvestre@greener.com.br?subject=..."
      }
    },
    null,
    2
  );

  return (
    <div className="space-y-6 text-xs">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
              Automação Contínua
            </span>
            <span className="flex items-center text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Webhook & Links Rápidos Ativos
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Configuração de Webhook & Links de Aprovação em 1 Clique
          </h2>
          <p className="text-slate-300 text-[11px] max-w-2xl leading-relaxed">
            Conecte o portal com ferramentas externas (Make.com, Zapier, Slack, Teams, Google Chat ou WhatsApp). A cada ação do Colaborador, Gestor ou RH, links rápidos são gerados para aprovação imediata sem login complexo.
          </p>
        </div>

        <button
          onClick={handleTestPing}
          disabled={isTesting}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{isTesting ? 'Testando Conexão...' : 'Testar Webhook Agora'}</span>
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold ${
          testResult.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Main Grid: Settings & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Webhook Configuration */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-800 font-bold">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Parâmetros do Endpoint de Webhook</span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-[11px] font-semibold text-slate-600">
                {config.enabled ? 'Ativado' : 'Desativado'}
              </span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            {/* Provider and Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Provedor / Formato do Payload:
                </label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig(prev => ({ ...prev, provider: e.target.value as WebhookProvider }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                >
                  <option value="make_zapier">Make.com / Zapier / N8N (JSON REST Completo)</option>
                  <option value="slack">Slack (Incoming Webhook com Blocos Interativos)</option>
                  <option value="teams">Microsoft Teams (Adaptive Cards)</option>
                  <option value="google_chat">Google Chat (Cards V2)</option>
                  <option value="custom">API REST Personalizada (Webhook Genérico)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identificador / Canal / Equipe:
                </label>
                <input
                  type="text"
                  value={config.channelOrTeam || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, channelOrTeam: e.target.value }))}
                  placeholder="Ex: #rh-ferias ou Greener Gestão"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                URL de Destino do Webhook (POST HTTP):
              </label>
              <input
                type="url"
                required
                value={config.url}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://hook.eu1.make.com/... ou https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-xs text-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Exemplos: Webhook do Make.com, Zapier Catch Hook, n8n webhook, Slack Incoming Webhook ou endpoint interno.
              </span>
            </div>

            {/* Secret Token */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Token de Segurança / Secret (Opcional):
              </label>
              <input
                type="password"
                value={config.secretToken || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, secretToken: e.target.value }))}
                placeholder="Enviado nos headers X-Greener-Secret e Authorization"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-xs"
              />
            </div>

            {/* Triggers selection */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-2">
                Eventos Gatilho que Disparam o Webhook Automaticamente:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-start space-x-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={config.events.onRequestCreated}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      events: { ...prev.events, onRequestCreated: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Nova Solicitação</span>
                    <span className="text-[10px] text-slate-500">Colaborador pede férias &rarr; Notifica Gestor</span>
                  </div>
                </label>

                <label className="flex items-start space-x-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={config.events.onManagerReviewed}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      events: { ...prev.events, onManagerReviewed: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Parecer do Gestor</span>
                    <span className="text-[10px] text-slate-500">Gestor aprova/reprova &rarr; Notifica RH</span>
                  </div>
                </label>

                <label className="flex items-start space-x-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={config.events.onRhHomologated}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      events: { ...prev.events, onRhHomologated: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Homologação RH</span>
                    <span className="text-[10px] text-slate-500">RH homologa &rarr; Atualiza planilha & avisa</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {saveSuccess && (
                  <span className="text-emerald-700 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Configurações de Webhook salvas com sucesso!
                  </span>
                )}
              </span>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-colors"
              >
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: How Quick Links Work */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold pb-3 border-b border-slate-100">
            <LinkIcon className="w-4 h-4 text-emerald-600" />
            <span>Como Funcionam os Links Rápidos</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Deep Link Direto para o Gestor</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ao clicar no link rápido recebido no WhatsApp, Teams ou E-mail, o sistema abre diretamente o modal com o parecer do gestor pré-selecionado para aprovação em 1 clique.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Disparo Instantâneo no WhatsApp</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Cada cartão na fila possui o botão <strong>⚡ Links Rápidos</strong> para abrir o WhatsApp Web com texto formatado pronto, mencionando o colaborador e as datas solicitadas.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>E-mail Corporativo Pré-Preenchido</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Botão <code>mailto:</code> que aciona o Gmail com o e-mail do gestor de área e do RH (sara.milione@greener.com.br), dispensando digitação manual.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Payload Spec & Schema Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800 font-bold">
            <Code className="w-4 h-4 text-indigo-600" />
            <span>Estrutura do Payload JSON Transmitido pelo Webhook</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(sampleJsonPayload);
              setCopiedPayload(true);
              setTimeout(() => setCopiedPayload(false), 2000);
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors"
          >
            {copiedPayload ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar JSON Modelo</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800">
          {sampleJsonPayload}
        </pre>
      </div>

      {/* Webhook Delivery Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-800 font-bold">
            <BellRing className="w-4 h-4 text-indigo-600" />
            <span>Auditoria & Histórico de Disparos de Webhook ({logs.length})</span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="flex items-center space-x-1 text-rose-600 hover:text-rose-800 font-semibold text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1">
            <p className="font-semibold text-slate-600">Nenhum disparo registrado ainda.</p>
            <p className="text-[11px]">
              Clique em &ldquo;Testar Webhook Agora&rdquo; acima ou realize uma solicitação para visualizar os logs de transmissão.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold">
                <tr>
                  <th className="px-3 py-2 text-left">Data / Hora</th>
                  <th className="px-3 py-2 text-left">Evento</th>
                  <th className="px-3 py-2 text-left">Referência</th>
                  <th className="px-3 py-2 text-left">Destinatário</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="px-3 py-2 font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.event}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-700 font-medium">
                      {log.funcionario || log.requestId || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{log.destinatario || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status === 'SUCCESS' ? '✓ Entregue (200)' :
                         log.status === 'FAILED' ? `✕ Erro (${log.statusCode || 500})` :
                         '• Pendente / Simulado'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {log.payloadPreview && (
                        <button
                          onClick={() => setSelectedLogPayload(log)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[11px]"
                        >
                          Ver Payload
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Log Payload Modal */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Payload Transmitido: {selectedLogPayload.event}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{selectedLogPayload.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-950">
              <pre className="text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96">
                {selectedLogPayload.payloadPreview}
              </pre>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
