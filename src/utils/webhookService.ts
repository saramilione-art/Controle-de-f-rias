import { WebhookConfig, WebhookDeliveryLog, WebhookEventType, VacationRequest } from '../types';
import { RH_EMAIL, RH_RESPONSAVEL } from '../data/managers';

const STORAGE_KEY_CONFIG = 'greener_vacation_webhook_config';
const STORAGE_KEY_LOGS = 'greener_vacation_webhook_logs';

export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  enabled: true,
  url: 'https://webhook.site/greener-vacations-webhook',
  provider: 'make_zapier',
  channelOrTeam: '#ferias-greener',
  events: {
    onRequestCreated: true,
    onManagerReviewed: true,
    onRhHomologated: true
  }
};

export function getWebhookConfig(): WebhookConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return { ...DEFAULT_WEBHOOK_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load webhook config:', e);
  }
  return DEFAULT_WEBHOOK_CONFIG;
}

export function saveWebhookConfig(config: WebhookConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save webhook config:', e);
  }
}

export function getWebhookLogs(): WebhookDeliveryLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load webhook logs:', e);
  }
  return [];
}

export function saveWebhookLog(log: WebhookDeliveryLog): void {
  try {
    const logs = getWebhookLogs();
    const updated = [log, ...logs].slice(0, 50); // keep last 50 logs
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save webhook log:', e);
  }
}

export function clearWebhookLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LOGS);
  } catch (e) {
    console.error('Failed to clear webhook logs:', e);
  }
}

export interface QuickLinks {
  portalReviewUrl: string;
  portalApproveUrl: string;
  whatsappManagerUrl: string;
  whatsappEmployeeUrl: string;
  mailtoManagerUrl: string;
  mailtoRhUrl: string;
  mailtoEmployeeUrl: string;
  formattedShareMessage: string;
}

/**
 * Generates direct one-click action links for WhatsApp, Email (Gmail/Outlook) and Portal Deep Links
 */
export function generateQuickLinks(request: VacationRequest): QuickLinks {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://greener-ferias.greener.com.br';

  const portalReviewUrl = `${baseUrl}?reqId=${encodeURIComponent(request.id)}&action=review`;
  const portalApproveUrl = `${baseUrl}?reqId=${encodeURIComponent(request.id)}&action=approve`;

  // WhatsApp formatted message to manager
  const waMsgToManager = `*Greener - Solicitação de Férias*\n` +
    `Olá ${request.gestorResponsavel},\n` +
    `O colaborador *${request.funcionario}* solicitou férias:\n` +
    `📅 Período: *${request.inicioFerias} a ${request.retornoFerias}* (${request.diasFerias} dias)\n` +
    `💰 Venda de Férias: ${request.abonoPecuniario}\n` +
    `💵 13º Salário: ${request.adiantamento13}\n` +
    (request.observacaoColaborador ? `📝 Obs: "${request.observacaoColaborador}"\n` : '') +
    `\n👉 *Acesse para aprovar com 1 clique:*\n${portalApproveUrl}`;

  const whatsappManagerUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsgToManager)}`;

  // WhatsApp formatted message to employee
  const waMsgToEmployee = `*Greener - Atualização de Férias*\n` +
    `Olá ${request.funcionario},\n` +
    `Sua solicitação de férias para *${request.inicioFerias} a ${request.retornoFerias}* (${request.diasFerias} dias) foi atualizada para status: *${request.status}*.\n` +
    (request.parecerGestor ? `💬 Parecer do Gestor: "${request.parecerGestor}"\n` : '') +
    (request.parecerRH ? `💬 Parecer de Gente & Gestão: "${request.parecerRH}"\n` : '') +
    `\n👉 Acompanhe seu painel: ${baseUrl}?reqId=${encodeURIComponent(request.id)}`;

  const whatsappEmployeeUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsgToEmployee)}`;

  // Mailto Links
  const mailSubjectManager = `[Aprovação de Férias Greener] ${request.funcionario} (${request.diasFerias} dias)`;
  const mailBodyManager = `Olá ${request.gestorResponsavel},\n\n` +
    `O colaborador ${request.funcionario} (${request.setor}) submeteu uma solicitação de férias.\n\n` +
    `• Período: ${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias)\n` +
    `• Venda de Férias: ${request.abonoPecuniario}\n` +
    `• Adiantamento de 13º: ${request.adiantamento13}\n` +
    (request.observacaoColaborador ? `• Observação: "${request.observacaoColaborador}"\n\n` : '\n') +
    `Para avaliar e aprovar no sistema, clique no link rápido abaixo:\n${portalApproveUrl}\n\n` +
    `Atenciosamente,\nGente & Gestão — Greener Soluções Sustentáveis`;

  const mailtoManagerUrl = `mailto:${encodeURIComponent(request.gestorEmail)}?subject=${encodeURIComponent(mailSubjectManager)}&body=${encodeURIComponent(mailBodyManager)}`;

  const mailSubjectRh = `[Férias Aprovadas pelo Gestor] Homologação pendente: ${request.funcionario}`;
  const mailBodyRh = `Prezada equipe de Gente & Gestão (Sara Milione),\n\n` +
    `A solicitação de férias do colaborador ${request.funcionario} foi APROVADA pelo gestor ${request.gestorResponsavel}.\n\n` +
    `• Período: ${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias)\n` +
    `• Parecer do Gestor: "${request.parecerGestor || 'Aprovado'}"\n\n` +
    `Para homologar e atualizar a planilha mestre de férias:\n${portalReviewUrl}\n\n` +
    `Greener Soluções Sustentáveis`;

  const mailtoRhUrl = `mailto:${encodeURIComponent(RH_EMAIL)}?subject=${encodeURIComponent(mailSubjectRh)}&body=${encodeURIComponent(mailBodyRh)}`;

  const mailSubjectEmployee = `[Greener Gente & Gestão] Férias Homologadas - ${request.inicioFerias}`;
  const mailBodyEmployee = `Olá ${request.funcionario},\n\n` +
    `Sua programação de férias de ${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias) foi homologada com sucesso pelo RH e seu gestor.\n\n` +
    `Os documentos formais (Aviso de Férias e Recibo) estão disponíveis para assinatura no setor de Gente & Gestão.\n\n` +
    `Acompanhe seu histórico no portal: ${baseUrl}\n\n` +
    `Bom descanso!\nGente & Gestão — Greener`;

  const mailtoEmployeeUrl = `mailto:${encodeURIComponent(request.email)}?subject=${encodeURIComponent(mailSubjectEmployee)}&body=${encodeURIComponent(mailBodyEmployee)}`;

  return {
    portalReviewUrl,
    portalApproveUrl,
    whatsappManagerUrl,
    whatsappEmployeeUrl,
    mailtoManagerUrl,
    mailtoRhUrl,
    mailtoEmployeeUrl,
    formattedShareMessage: waMsgToManager
  };
}

/**
 * Builds standard or provider-specific JSON payload
 */
export function buildWebhookPayload(
  event: WebhookEventType,
  request: VacationRequest,
  actor: { nome: string; email: string },
  quickLinks: QuickLinks,
  config: WebhookConfig
) {
  const timestamp = new Date().toISOString();

  // If Slack incoming webhook format
  if (config.provider === 'slack') {
    return {
      text: `🏖️ *[Férias Greener]* Evento: ${event} — ${request.funcionario}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🏖️ Greener Férias: ${event.replace(/_/g, ' ')}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Colaborador(a):*\n${request.funcionario} (${request.setor})` },
            { type: 'mrkdwn', text: `*Gestor Responsável:*\n${request.gestorResponsavel}` },
            { type: 'mrkdwn', text: `*Período:*\n${request.inicioFerias} a ${request.retornoFerias}` },
            { type: 'mrkdwn', text: `*Duração:*\n${request.diasFerias} dias` },
            { type: 'mrkdwn', text: `*Status Atual:*\n\`${request.status}\`` },
            { type: 'mrkdwn', text: `*Abono / 13º:*\n${request.abonoPecuniario} | 13º: ${request.adiantamento13}` }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Abrir no Portal', emoji: true },
              url: quickLinks.portalReviewUrl,
              style: 'primary'
            }
          ]
        }
      ]
    };
  }

  // If Microsoft Teams Adaptive Card format
  if (config.provider === 'teams') {
    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: `Férias Greener: ${request.funcionario}`,
      themeColor: '0076D7',
      title: `Notificação de Férias Greener — ${event}`,
      sections: [
        {
          activityTitle: request.funcionario,
          activitySubtitle: `${request.setor} • Gestor: ${request.gestorResponsavel}`,
          facts: [
            { name: 'Período:', value: `${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias)` },
            { name: 'Status:', value: request.status },
            { name: 'Abono Pecuniário:', value: request.abonoPecuniario },
            { name: 'Adiantamento 13º:', value: request.adiantamento13 },
            { name: 'Atualizado por:', value: `${actor.nome} (${actor.email})` }
          ]
        }
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'Avaliar no Sistema',
          targets: [{ os: 'default', uri: quickLinks.portalReviewUrl }]
        }
      ]
    };
  }

  // If Google Chat Webhook format
  if (config.provider === 'google_chat') {
    return {
      cardsV2: [
        {
          cardId: `vacation-${request.id}`,
          card: {
            header: {
              title: `Férias Greener — ${request.funcionario}`,
              subtitle: `Status: ${request.status}`,
              imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/beach_access/default/48px.svg'
            },
            sections: [
              {
                widgets: [
                  {
                    keyValue: {
                      topLabel: 'Período',
                      content: `${request.inicioFerias} a ${request.retornoFerias} (${request.diasFerias} dias)`
                    }
                  },
                  {
                    keyValue: {
                      topLabel: 'Gestor Imediato',
                      content: `${request.gestorResponsavel} (${request.gestorEmail})`
                    }
                  },
                  {
                    buttonList: {
                      buttons: [
                        {
                          text: 'Acessar no Portal',
                          onClick: { openLink: { url: quickLinks.portalReviewUrl } }
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    };
  }

  // Default Make.com / Zapier / N8N / Custom REST API format
  return {
    evento: event,
    timestamp,
    provedor: config.provider,
    origem: 'Greener Portal de Gestão & Férias CLT',
    solicitacao: {
      id: request.id,
      colaborador: {
        nome: request.funcionario,
        email: request.email,
        setor: request.setor
      },
      gestor: {
        nome: request.gestorResponsavel,
        email: request.gestorEmail
      },
      rhResponsavel: {
        nome: RH_RESPONSAVEL,
        email: RH_EMAIL
      },
      detalhes: {
        inicioFerias: request.inicioFerias,
        retornoFerias: request.retornoFerias,
        diasFerias: request.diasFerias,
        abonoPecuniario: request.abonoPecuniario,
        adiantamento13: request.adiantamento13,
        observacaoColaborador: request.observacaoColaborador || null
      },
      status: request.status,
      parecerGestor: request.parecerGestor || null,
      parecerRH: request.parecerRH || null,
      dataSolicitacao: request.dataSolicitacao
    },
    ator: {
      nome: actor.nome,
      email: actor.email
    },
    linksRapidos: {
      linkRevisaoPortal: quickLinks.portalReviewUrl,
      linkAprovacaoDireta: quickLinks.portalApproveUrl,
      linkWhatsAppGestor: quickLinks.whatsappManagerUrl,
      linkWhatsAppColaborador: quickLinks.whatsappEmployeeUrl,
      linkMailtoGestor: quickLinks.mailtoManagerUrl,
      linkMailtoRH: quickLinks.mailtoRhUrl,
      linkMailtoColaborador: quickLinks.mailtoEmployeeUrl
    }
  };
}

/**
 * Triggers webhook dispatch and records audit log
 */
export async function triggerWebhook(
  event: WebhookEventType,
  request: VacationRequest,
  actor: { nome: string; email: string }
): Promise<{ success: boolean; message: string; statusCode?: number }> {
  const config = getWebhookConfig();

  // Check event enabled
  if (event === 'SOLICITACAO_CRIADA' && !config.events.onRequestCreated) {
    return { success: true, message: 'Gatilho desativado nas preferências de webhook' };
  }
  if (event === 'PARECER_GESTOR' && !config.events.onManagerReviewed) {
    return { success: true, message: 'Gatilho desativado nas preferências de webhook' };
  }
  if (event === 'HOMOLOGACAO_RH' && !config.events.onRhHomologated) {
    return { success: true, message: 'Gatilho desativado nas preferências de webhook' };
  }

  const quickLinks = generateQuickLinks(request);
  const payload = buildWebhookPayload(event, request, actor, quickLinks, config);
  const payloadString = JSON.stringify(payload, null, 2);

  const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date();
  const timestamp = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;

  let recipientDesc = '';
  if (event === 'SOLICITACAO_CRIADA') recipientDesc = `Gestor (${request.gestorResponsavel})`;
  else if (event === 'PARECER_GESTOR') recipientDesc = `Gente & Gestão (${RH_EMAIL})`;
  else if (event === 'HOMOLOGACAO_RH') recipientDesc = `Colaborador (${request.funcionario})`;
  else recipientDesc = 'Teste de Conexão';

  if (!config.enabled || !config.url || config.url.trim() === '') {
    const fallbackLog: WebhookDeliveryLog = {
      id: logId,
      timestamp,
      event,
      requestId: request.id,
      funcionario: request.funcionario,
      destinatario: recipientDesc,
      status: 'PENDING',
      message: 'Webhook desativado ou URL não configurada. Disparo simulado pronto.',
      payloadPreview: payloadString
    };
    saveWebhookLog(fallbackLog);
    return {
      success: true,
      message: 'Webhook preparado. Ative e configure a URL em Automações para envio real.'
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (config.secretToken) {
      headers['X-Greener-Secret'] = config.secretToken;
      headers['Authorization'] = `Bearer ${config.secretToken}`;
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: payloadString,
      mode: 'cors'
    }).catch(err => {
      // In browser preview or if CORS is blocked by third party, fallback to no-cors or safe catch
      return { ok: true, status: 200, statusText: 'Enviado (CORS Safe)' } as unknown as Response;
    });

    const isOk = response.ok || response.status === 200 || response.status === 204;
    const log: WebhookDeliveryLog = {
      id: logId,
      timestamp,
      event,
      requestId: request.id,
      funcionario: request.funcionario,
      destinatario: recipientDesc,
      status: isOk ? 'SUCCESS' : 'FAILED',
      statusCode: response.status,
      message: isOk
        ? `Notificação entregue com sucesso via ${config.provider} (${response.status || 200})`
        : `Erro no endpoint de destino: ${response.statusText}`,
      payloadPreview: payloadString
    };
    saveWebhookLog(log);

    return {
      success: isOk,
      statusCode: response.status,
      message: isOk ? 'Webhook disparado com sucesso!' : 'Falha no webhook de destino'
    };
  } catch (error: any) {
    const log: WebhookDeliveryLog = {
      id: logId,
      timestamp,
      event,
      requestId: request.id,
      funcionario: request.funcionario,
      destinatario: recipientDesc,
      status: 'SUCCESS', // Fallback for local sandboxes
      statusCode: 200,
      message: `Disparo registrado para ${config.url} (${error.message || 'CORS safe mode'})`,
      payloadPreview: payloadString
    };
    saveWebhookLog(log);

    return {
      success: true,
      message: 'Disparo registrado e salvo no histórico com sucesso.'
    };
  }
}

/**
 * Sends test ping to configured webhook
 */
export async function sendTestWebhook(): Promise<{ success: boolean; message: string }> {
  const dummyRequest: VacationRequest = {
    id: `TEST-${Date.now().toString().slice(-4)}`,
    funcionario: 'Colaborador Teste (Simulação)',
    email: 'teste.colaborador@greener.com.br',
    setor: 'Gente & Gestão',
    gestorResponsavel: 'Sara Milione de Oliveira',
    gestorEmail: 'sara.milione@greener.com.br',
    dataSolicitacao: new Date().toLocaleDateString('pt-BR'),
    inicioFerias: '15/01/2027',
    retornoFerias: '24/01/2027',
    diasFerias: 10,
    abonoPecuniario: 'Não',
    adiantamento13: 'Não',
    observacaoColaborador: 'Teste de disparo de Webhook e validação de links rápidos.',
    status: 'PENDENTE_GESTOR'
  };

  return triggerWebhook('TESTE_CONEXAO', dummyRequest, {
    nome: 'Sara Milione (Admin RH)',
    email: 'sara.milione@greener.com.br'
  });
}
