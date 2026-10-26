import { VacationRecord, VacationStatus, AlertStatus, SheetFormulaInfo } from '../types';

/**
 * Utility functions for Brazilian CLT Vacation Calculations & Formulas
 */

// Parse DD/MM/YYYY or YYYY-MM-DD string into Date
export function parseBRDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '' || dateStr === '---') return null;
  const cleanStr = dateStr.trim();
  
  // If YYYY-MM-DD
  if (cleanStr.includes('-')) {
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  
  // If DD/MM/YYYY
  if (cleanStr.includes('/')) {
    const parts = cleanStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  
  const d = new Date(cleanStr);
  return isNaN(d.getTime()) ? null : d;
}

// Format Date object to DD/MM/YYYY
export function formatBRDate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Format Date object to YYYY-MM-DD for <input type="date">
export function formatISODate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// Calculate days between two dates inclusive (excluding Dec 25 Christmas holiday)
export function calculateDaysBetween(startDateStr?: string, endDateStr?: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = parseBRDate(startDateStr);
  const end = parseBRDate(endDateStr);
  if (!start || !end) return 0;
  
  const diffTime = end.getTime() - start.getTime();
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start and return

  // Christmas holiday (Dec 25) does not count towards vacation days
  if (diffDays > 0) {
    const xmas = new Date(start.getFullYear(), 11, 25);
    if (xmas >= start && xmas <= end) {
      diffDays -= 1;
    }
  }

  return diffDays > 0 ? diffDays : 0;
}

// Auto-calculate expiration date (1 year after vesting start)
export function calculateExpirationDate(startDateStr: string): string {
  const start = parseBRDate(startDateStr);
  if (!start) return '';
  const exp = new Date(start);
  exp.setFullYear(exp.getFullYear() + 1);
  return formatBRDate(exp);
}

// Auto-calculate Limit Date (Data Limite CLT): 11 months after expiration date or expiration + 1 year - 30 days
export function calculateLimitDate(expDateStr: string): string {
  const exp = parseBRDate(expDateStr);
  if (!exp) return '';
  // Limit date is 1 year after expiration date minus 30 days (so employee completes 30 days before 2 years)
  const limit = new Date(exp);
  limit.setFullYear(limit.getFullYear() + 1);
  limit.setDate(limit.getDate() - 30);
  return formatBRDate(limit);
}

/**
 * Regra CLT Artigo 140 - Ajuste Condicional de Período Aquisitivo em Férias Coletivas:
 * Aplicável para colaboradores com menos de 12 meses de empresa.
 * - Se saldo acumulado < dias a serem gozados de coletivas:
 *     Aplica ajuste da Lei 140: encerra período anterior, nova data-base inicia no 1º dia das coletivas.
 *     Dias excedentes são pagos como licença remunerada.
 * - Se saldo acumulado >= dias a serem gozados de coletivas (ex: Viviane Custódio):
 *     Mantém período aquisitivo na data de admissão original. Saldo é deduzido normalmente.
 */
export function calculateCollectiveVacationCLT(
  admissionDateStr: string,
  collectiveStartDateStr: string,
  collectiveDays: number
): {
  mesesTrabalhados: number;
  diasProporcionaisDireito: number;
  saldoMenorQueColetivas: boolean;
  ajustarPeriodoAquisitivo: boolean;
  diasFeriasGozados: number;
  diasLicencaRemunerada: number;
  saldoRestante: number;
  inicioPeriodoAquisitivoRecomendado: string;
} {
  const admission = parseBRDate(admissionDateStr);
  const collectiveStart = parseBRDate(collectiveStartDateStr);

  if (!admission || !collectiveStart) {
    return {
      mesesTrabalhados: 0,
      diasProporcionaisDireito: 0,
      saldoMenorQueColetivas: false,
      ajustarPeriodoAquisitivo: false,
      diasFeriasGozados: collectiveDays,
      diasLicencaRemunerada: 0,
      saldoRestante: 0,
      inicioPeriodoAquisitivoRecomendado: admissionDateStr
    };
  }

  // Calculate full months worked + fraction > 14 days
  let months = (collectiveStart.getFullYear() - admission.getFullYear()) * 12 + (collectiveStart.getMonth() - admission.getMonth());
  const dayDiff = collectiveStart.getDate() - admission.getDate();
  if (dayDiff > 14) {
    months += 1;
  } else if (dayDiff < 0) {
    const daysInPrevMonth = new Date(collectiveStart.getFullYear(), collectiveStart.getMonth(), 0).getDate();
    if (daysInPrevMonth - admission.getDate() + collectiveStart.getDate() > 14) {
      // Fraction > 14 days
    } else {
      months = Math.max(0, months - 1);
    }
  }
  months = Math.min(12, Math.max(0, months));

  // 2.5 days per month
  const diasProporcionais = months * 2.5;
  const saldoMenor = diasProporcionais < collectiveDays;

  if (saldoMenor) {
    // Caso 1: Saldo menor que as coletivas -> Aplica Art. 140 CLT (nova data base)
    const licenca = collectiveDays - diasProporcionais;
    return {
      mesesTrabalhados: months,
      diasProporcionaisDireito: diasProporcionais,
      saldoMenorQueColetivas: true,
      ajustarPeriodoAquisitivo: true,
      diasFeriasGozados: diasProporcionais,
      diasLicencaRemunerada: licenca,
      saldoRestante: 0,
      inicioPeriodoAquisitivoRecomendado: collectiveStartDateStr
    };
  } else {
    // Caso 2: Saldo maior ou igual às coletivas (ex: Viviane) -> Mantém admissão original
    return {
      mesesTrabalhados: months,
      diasProporcionaisDireito: diasProporcionais,
      saldoMenorQueColetivas: false,
      ajustarPeriodoAquisitivo: false,
      diasFeriasGozados: collectiveDays,
      diasLicencaRemunerada: 0,
      saldoRestante: diasProporcionais - collectiveDays,
      inicioPeriodoAquisitivoRecomendado: admissionDateStr
    };
  }
}

// Recalculate status and balance for a record
export function recalculateRecord(
  record: VacationRecord,
  allRecordsForSameEmployeePeriod: VacationRecord[],
  refDateStr: string = '28/07/2026'
): VacationRecord {
  const refDate = parseBRDate(refDateStr) || new Date(2026, 6, 28);
  
  // 1. Calculate expiration date if empty
  let dataVencimento = record.dataVencimento;
  if (!dataVencimento && record.inicioPeriodoAquisitivo) {
    dataVencimento = calculateExpirationDate(record.inicioPeriodoAquisitivo);
  }
  
  // 2. Calculate limit date if empty
  let dataLimite = record.dataLimite;
  if (!dataLimite && dataVencimento) {
    dataLimite = calculateLimitDate(dataVencimento);
  }

  // 3. Days taken for this row
  let diasFerias = record.diasFerias;
  if (record.inicioFerias && record.retornoFerias) {
    const calcDays = calculateDaysBetween(record.inicioFerias, record.retornoFerias);
    if (calcDays > 0) {
      diasFerias = calcDays;
    }
  }

  // 4. Saldo de Férias calculation (Standard 30 days entitlement per period)
  const periodStart = record.inicioPeriodoAquisitivo;
  let totalTakenInPeriod = 0;
  
  if (periodStart && allRecordsForSameEmployeePeriod) {
    const matchingRows = allRecordsForSameEmployeePeriod.filter(
      r => r.funcionario === record.funcionario && r.inicioPeriodoAquisitivo === periodStart
    );
    // Determine row index order
    for (const r of matchingRows) {
      totalTakenInPeriod += (r.diasFerias || 0);
      if (r.id === record.id) {
        break; // Stop at current row for progressive balance
      }
    }
  } else {
    totalTakenInPeriod = diasFerias;
  }

  const totalEntitlement = 30;
  const saldoFerias = Math.max(0, totalEntitlement - totalTakenInPeriod);

  // 5. Determine Situacao (Status)
  let situacao: VacationStatus = record.situacao;

  const vencimentoDate = parseBRDate(dataVencimento);
  const limiteDate = parseBRDate(dataLimite);
  const inicioFeriasDate = parseBRDate(record.inicioFerias || '');
  const retornoFeriasDate = parseBRDate(record.retornoFerias || '');

  if (vencimentoDate && refDate < vencimentoDate) {
    situacao = 'Férias não vencidas';
  } else if (
    inicioFeriasDate &&
    retornoFeriasDate &&
    refDate >= inicioFeriasDate &&
    refDate <= retornoFeriasDate
  ) {
    situacao = 'Em Férias';
  } else if (limiteDate && refDate > limiteDate && saldoFerias > 0) {
    situacao = 'Férias em Dobro';
  } else if (
    limiteDate &&
    refDate <= limiteDate &&
    saldoFerias > 0 &&
    (limiteDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24) <= 60
  ) {
    situacao = 'Atenção (A Vencer)';
  } else if (saldoFerias === 0) {
    situacao = 'Concluído';
  } else {
    situacao = 'Dentro do Prazo';
  }

  // 6. Determine Status de Alerta (Próximos Vencimentos 30 / 60 / 90 dias)
  let statusAlerta: AlertStatus = '🟢 Regular (Em Dia)';

  if (limiteDate) {
    const diffDaysToLimit = Math.ceil((limiteDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));

    if (situacao === 'Férias em Dobro' || (saldoFerias > 0 && diffDaysToLimit < 0)) {
      statusAlerta = '🚨 CRÍTICO (Férias em Dobro)';
    } else if (saldoFerias > 0 && diffDaysToLimit <= 30) {
      statusAlerta = '🔴 URGENTE (< 30 dias)';
    } else if (saldoFerias > 0 && diffDaysToLimit <= 60) {
      statusAlerta = '🟠 ALERTA (< 60 dias)';
    } else if (saldoFerias > 0 && diffDaysToLimit <= 90) {
      statusAlerta = '🟡 ATENÇÃO (< 90 dias)';
    } else if (saldoFerias === 0) {
      statusAlerta = '✅ Concluído';
    } else if (vencimentoDate && refDate < vencimentoDate) {
      const diffDaysToVenc = Math.ceil((vencimentoDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDaysToVenc <= 30) {
        statusAlerta = '⏳ Vencendo Período (< 30d)';
      } else {
        statusAlerta = 'OK (Não Vencido)';
      }
    } else {
      statusAlerta = '🟢 Regular (Em Dia)';
    }
  }

  return {
    ...record,
    dataVencimento,
    dataLimite,
    diasFerias,
    saldoFerias,
    situacao,
    statusAlerta,
    isAutoCalculated: true
  };
}

// Formulas definitions for documentation and inspector
export const EXCEL_FORMULAS_INFO: SheetFormulaInfo[] = [
  {
    coluna: 'D',
    nomeColuna: 'Data Vencimento',
    formulaExcel: '=EDATE(C5; 12)',
    descricao: 'Adiciona 12 meses (1 ano) à data de início do período aquisitivo.',
    exemploLogica: 'Se Início = 07/07/2024 -> Data Vencimento = 07/07/2025'
  },
  {
    coluna: 'G',
    nomeColuna: 'Dias de Férias',
    formulaExcel: '=IF(ISBLANK(E5); 0; F5 - E5 + 1)',
    descricao: 'Calcula a quantidade de dias entre o início das férias e a data de retorno (inclusive).',
    exemploLogica: 'Início 22/12/2025 até 01/01/2026 = 10 dias de gozo'
  },
  {
    coluna: 'H',
    nomeColuna: 'Data Limite (CLT)',
    formulaExcel: '=DATE(YEAR(D5)+1; MONTH(D5); DAY(D5)) - 30',
    descricao: 'A CLT exige que as férias terminem antes de completar 2 anos da contratação/período. Subtrai 30 dias do final do período concessivo.',
    exemploLogica: 'Data Vencimento 07/07/2025 -> Data Limite = 07/06/2026'
  },
  {
    coluna: 'I',
    nomeColuna: 'Situação (Status)',
    formulaExcel: '=IF($A$3<D5; "Férias não vencidas"; IF(J5=0; "Concluído"; IF($A$3>H5; "Férias em Dobro"; IF(H5-$A$3<=60; "Atenção (A Vencer)"; "Dentro do Prazo"))))',
    descricao: 'Fórmula dinâmica baseada na Data Atual ($A$3). Identifica risco de multa por Férias em Dobro (Artigo 137 da CLT) se passar da Data Limite.',
    exemploLogica: 'Se Data Atual (28/07/2026) > Data Limite (07/06/2026) e Saldo > 0 -> "Férias em Dobro"'
  },
  {
    coluna: 'J',
    nomeColuna: 'Saldo de Férias',
    formulaExcel: '=30 - SUMIFS(G:G; A:A; A5; C:C; C5)',
    descricao: 'Subtrai do direito total de 30 dias todos os dias já gozados para o mesmo funcionário e período aquisitivo.',
    exemploLogica: 'Direito: 30 dias. Gozados: 10 + 20 = 30. Saldo Restante: 0'
  },
  {
    coluna: 'K',
    nomeColuna: 'Status de Alerta (Próximos Vencimentos)',
    formulaExcel: '=IF(I5="Férias em Dobro"; "🚨 CRÍTICO (Férias em Dobro)"; IF(J5=0; "✅ Concluído"; IF(H5-$A$3<=30; "🔴 URGENTE (< 30 dias)"; IF(H5-$A$3<=60; "🟠 ALERTA (< 60 dias)"; IF(H5-$A$3<=90; "🟡 ATENÇÃO (< 90 dias)"; "🟢 Regular")))))',
    descricao: 'Monitora continuamente a proximidade do vencimento da Data Limite ($A$3 x H5) emitindo alertas visuais de 30, 60 e 90 dias para prevenção prévia de Férias em Dobro.',
    exemploLogica: 'Se Faltam 22 dias para a Data Limite -> "🔴 URGENTE (< 30 dias)"'
  }
];
