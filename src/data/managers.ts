export interface ManagerInfo {
  nome: string;
  email: string;
  setor: string;
  cargo: string;
}

export const MANAGERS_DIRECTORY: Record<string, ManagerInfo> = {
  'Luiza Bertazzoli': {
    nome: 'Luiza Bertazzoli',
    email: 'luiza.bertazzoli@greener.com.br',
    setor: 'Operações / Inteligência de Mercado / Mkt',
    cargo: 'Gestora Executiva'
  },
  'Marcio Takata': {
    nome: 'Marcio Takata',
    email: 'marcio@greener.com.br',
    setor: 'Diretoria Executiva',
    cargo: 'Diretor / Sócio'
  },
  'Daniella Souza Oliveira': {
    nome: 'Daniella Souza Oliveira',
    email: 'daniella.souza@greener.com.br',
    setor: 'Financeiro / RH',
    cargo: 'Gestora Financeiro e RH'
  },
  'Laura Rinaldi Magrin': {
    nome: 'Laura Rinaldi Magrin',
    email: 'laura.magrin@greener.com.br',
    setor: 'Marketing',
    cargo: 'Coordenadora de Marketing'
  },
  'Silvana Maria Silva Silvestre': {
    nome: 'Silvana Maria Silva Silvestre',
    email: 'silvana.silvestre@greener.com.br',
    setor: 'Relacionamento/Comercial',
    cargo: 'Coordenadora de Relacionamento/Comercial'
  },
  'Sara Milione de Oliveira': {
    nome: 'Sara Milione de Oliveira',
    email: 'sara.milione@greener.com.br',
    setor: 'Gente & Gestão (RH)',
    cargo: 'Gente & Gestão (RH)'
  }
};

export const RH_EMAIL = 'sara.milione@greener.com.br';
export const RH_RESPONSAVEL = 'Sara Milione de Oliveira (Gente & Gestão)';

export function getManagerEmail(managerName: string | undefined): string {
  if (!managerName) return 'rh@greener.com.br';
  const manager = MANAGERS_DIRECTORY[managerName];
  if (manager) return manager.email;

  // Fallback if name has slight variation
  const key = Object.keys(MANAGERS_DIRECTORY).find(
    k => k.toLowerCase().includes(managerName.toLowerCase()) || managerName.toLowerCase().includes(k.toLowerCase())
  );
  if (key) return MANAGERS_DIRECTORY[key].email;

  return `${managerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@greener.com.br`;
}
