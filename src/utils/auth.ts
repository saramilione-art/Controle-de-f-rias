import { UserProfile, UserRole, VacationRecord } from '../types';
import { MANAGERS_DIRECTORY, RH_EMAIL, RH_RESPONSAVEL, getManagerEmail } from '../data/managers';
import { INITIAL_VACATION_RECORDS } from '../data/initialData';

export const PRESET_ACCOUNTS: UserProfile[] = [
  // RH
  {
    nome: 'Sara Milione de Oliveira',
    email: 'sara.milione@greener.com.br',
    setor: 'Gente & Gestão (RH)',
    cargo: 'RH / Gente & Gestão',
    role: 'RH'
  },
  // Gestores
  {
    nome: 'Luiza Bertazzoli',
    email: 'luiza.bertazzoli@greener.com.br',
    setor: 'Operações / Inteligência / Mkt',
    cargo: 'Gestora Executiva',
    role: 'GESTOR'
  },
  {
    nome: 'Marcio Takata',
    email: 'marcio@greener.com.br',
    setor: 'Diretoria Executiva',
    cargo: 'Diretor / Sócio',
    role: 'GESTOR'
  },
  {
    nome: 'Laura Rinaldi Magrin',
    email: 'laura.magrin@greener.com.br',
    setor: 'Marketing',
    cargo: 'Coordenadora de Marketing',
    role: 'GESTOR',
    gestorResponsavel: 'Luiza Bertazzoli',
    gestorEmail: 'luiza.bertazzoli@greener.com.br'
  },
  {
    nome: 'Silvana Maria Silva Silvestre',
    email: 'silvana.silvestre@greener.com.br',
    setor: 'Relacionamento/Comercial',
    cargo: 'Coordenadora Comercial',
    role: 'GESTOR',
    gestorResponsavel: 'Marcio Takata',
    gestorEmail: 'marcio@greener.com.br'
  },
  {
    nome: 'Daniella Souza Oliveira',
    email: 'daniella.souza@greener.com.br',
    setor: 'Financeiro / RH',
    cargo: 'Gestora Financeiro e RH',
    role: 'GESTOR',
    gestorResponsavel: 'Luiza Bertazzoli',
    gestorEmail: 'luiza.bertazzoli@greener.com.br'
  },
  // Colaboradores Comuns
  {
    nome: 'Tamíris Aparecida da Silva Santos',
    email: 'tamiris.santos@greener.com.br',
    setor: 'Relacionamento/Comercial',
    cargo: 'Analista de Relacionamento',
    role: 'COLABORADOR',
    gestorResponsavel: 'Silvana Maria Silva Silvestre',
    gestorEmail: 'silvana.silvestre@greener.com.br'
  },
  {
    nome: 'Heloísa Pereira Burin',
    email: 'heloisa.burin@greener.com.br',
    setor: 'Inteligência de Mercado',
    cargo: 'Analista de Inteligência',
    role: 'COLABORADOR',
    gestorResponsavel: 'Luiza Bertazzoli',
    gestorEmail: 'luiza.bertazzoli@greener.com.br'
  },
  {
    nome: 'Viviane Custódio',
    email: 'viviane.custodio@greener.com.br',
    setor: 'Marketing',
    cargo: 'Designer / Marketing',
    role: 'COLABORADOR',
    gestorResponsavel: 'Laura Rinaldi Magrin',
    gestorEmail: 'laura.magrin@greener.com.br'
  },
  {
    nome: 'Natanea Caroline Guimarães',
    email: 'natanea.guimaraes@greener.com.br',
    setor: 'Inteligência de Mercado',
    cargo: 'Analista de Inteligência',
    role: 'COLABORADOR',
    gestorResponsavel: 'Luiza Bertazzoli',
    gestorEmail: 'luiza.bertazzoli@greener.com.br'
  }
];

export function resolveUserProfile(emailInput: string, records: VacationRecord[] = INITIAL_VACATION_RECORDS): UserProfile {
  const cleanEmail = emailInput.trim().toLowerCase();

  // Check preset accounts first for direct match
  const preset = PRESET_ACCOUNTS.find(p => p.email.toLowerCase() === cleanEmail);
  if (preset) return preset;

  // Check if it is Sara (RH)
  if (cleanEmail === RH_EMAIL.toLowerCase() || cleanEmail.startsWith('sara.milione') || cleanEmail.startsWith('sara@')) {
    return {
      nome: 'Sara Milione de Oliveira',
      email: RH_EMAIL,
      setor: 'Gente & Gestão (RH)',
      cargo: 'Gente & Gestão (RH)',
      role: 'RH'
    };
  }

  // Check if it is any manager in the directory
  for (const [mgrName, info] of Object.entries(MANAGERS_DIRECTORY)) {
    if (info.email.toLowerCase() === cleanEmail) {
      if (mgrName.toLowerCase().includes('sara')) {
        return {
          nome: info.nome,
          email: info.email,
          setor: info.setor,
          cargo: info.cargo,
          role: 'RH'
        };
      }
      return {
        nome: info.nome,
        email: info.email,
        setor: info.setor,
        cargo: info.cargo,
        role: 'GESTOR'
      };
    }
  }

  // Check if it matches an employee in records
  const employeeRec = records.find(r => r.email && r.email.toLowerCase() === cleanEmail);
  if (employeeRec) {
    const mgrName = employeeRec.gestorResponsavel || 'Luiza Bertazzoli';
    return {
      nome: employeeRec.funcionario,
      email: cleanEmail,
      setor: employeeRec.setor || 'Operações',
      cargo: 'Colaborador(a)',
      role: 'COLABORADOR',
      gestorResponsavel: mgrName,
      gestorEmail: getManagerEmail(mgrName)
    };
  }

  // Fallback for any corporate email @greener.com.br or name
  const namePart = cleanEmail.split('@')[0] || 'colaborador';
  const formattedName = namePart
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    nome: formattedName || 'Colaborador Greener',
    email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@greener.com.br`,
    setor: 'Geral',
    cargo: 'Colaborador(a)',
    role: 'COLABORADOR',
    gestorResponsavel: 'Luiza Bertazzoli',
    gestorEmail: 'luiza.bertazzoli@greener.com.br'
  };
}
