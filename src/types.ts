export type VacationStatus =
  | 'Dentro do Prazo'
  | 'Férias em Dobro'
  | 'Férias não vencidas'
  | 'Em Férias'
  | 'Atenção (A Vencer)'
  | 'Concluído';

export type AlertStatus =
  | '🚨 CRÍTICO (Férias em Dobro)'
  | '🔴 URGENTE (< 30 dias)'
  | '🟠 ALERTA (< 60 dias)'
  | '🟡 ATENÇÃO (< 90 dias)'
  | '⏳ Vencendo Período (< 30d)'
  | '🟢 Regular (Em Dia)'
  | 'OK (Não Vencido)'
  | '✅ Concluído';

export type NoticeStatus = 'Enviado' | 'Não enviado' | 'Finalizado' | 'Pendente';
export type ReceiptStatus = 'Enviado' | 'Finalizado' | 'Pendente' | 'Não enviado';
export type Adiantamento13Status = 'Sim' | 'Não' | '';

export interface VacationRecord {
  id: string;
  funcionario: string;
  email?: string;
  gestorResponsavel?: string;
  setor?: string;
  abonoPecuniario?: string; // ex: 'Não', '10 dias', '5 dias'
  adiantamento13?: Adiantamento13Status;
  dataContratacao: string; // YYYY-MM-DD or DD/MM/YYYY
  inicioPeriodoAquisitivo: string;
  dataVencimento: string;
  inicioFerias?: string;
  retornoFerias?: string;
  diasFerias: number;
  dataLimite: string;
  situacao: VacationStatus;
  statusAlerta?: AlertStatus;
  saldoFerias: number;
  avisoFerias: NoticeStatus | '';
  reciboFerias: ReceiptStatus | '';
  observacao?: string;
  isAutoCalculated?: boolean;
}

export interface EmployeeSummary {
  nome: string;
  email?: string;
  gestorResponsavel?: string;
  setor?: string;
  dataContratacao: string;
  totalPeriodos: number;
  saldoTotalDias: number;
  temFeriasEmDobro: boolean;
  temAtencao: boolean;
  proximoVencimento: string;
  registros: VacationRecord[];
}

export interface SheetFormulaInfo {
  coluna: string;
  nomeColuna: string;
  formulaExcel: string;
  descricao: string;
  exemploLogica: string;
}

export type FilterStatus = 'TODOS' | VacationStatus | 'ALERTAS' | 'URGENTE_30' | 'ALERTA_60' | 'ATENCAO_90';

export type VacationRequestStatus =
  | 'PENDENTE_GESTOR'
  | 'APROVADO_GESTOR'
  | 'HOMOLOGADO_RH'
  | 'REPROVADO_GESTOR'
  | 'REPROVADO_RH';

export interface VacationRequest {
  id: string;
  funcionario: string;
  email: string;
  setor: string;
  gestorResponsavel: string;
  gestorEmail: string;
  dataSolicitacao: string;
  inicioFerias: string;
  retornoFerias: string;
  diasFerias: number;
  abonoPecuniario: string; // 'Não' | '10 dias' | '5 dias'
  adiantamento13: Adiantamento13Status;
  observacaoColaborador?: string;
  status: VacationRequestStatus;
  aprovadoGestorEm?: string;
  aprovadoGestorPor?: string;
  parecerGestor?: string;
  homologadoRHEm?: string;
  homologadoRHPor?: string;
  parecerRH?: string;
  avisoEmitido?: boolean;
  reciboEmitido?: boolean;
}

export type UserRole = 'RH' | 'GESTOR' | 'COLABORADOR';

export interface UserProfile {
  nome: string;
  email: string;
  setor: string;
  cargo: string;
  role: UserRole;
  gestorResponsavel?: string;
  gestorEmail?: string;
}

export type WebhookProvider = 'make_zapier' | 'slack' | 'teams' | 'google_chat' | 'custom';

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  provider: WebhookProvider;
  secretToken?: string;
  channelOrTeam?: string;
  events: {
    onRequestCreated: boolean;   // Colaborador submete pedido -> Notifica Gestor
    onManagerReviewed: boolean;  // Gestor aprova ou reprova -> Notifica RH
    onRhHomologated: boolean;    // RH homologa ou reprova -> Notifica Colaborador e Gestor
  };
}

export type WebhookEventType = 
  | 'SOLICITACAO_CRIADA' 
  | 'PARECER_GESTOR' 
  | 'HOMOLOGACAO_RH' 
  | 'SOLICITACAO_REPROVADA'
  | 'TESTE_CONEXAO';

export interface WebhookDeliveryLog {
  id: string;
  timestamp: string;
  event: WebhookEventType;
  requestId?: string;
  funcionario?: string;
  destinatario?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  statusCode?: number;
  message: string;
  payloadPreview?: string;
}

