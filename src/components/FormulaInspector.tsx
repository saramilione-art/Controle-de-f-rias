import React, { useState } from 'react';
import { EXCEL_FORMULAS_INFO } from '../utils/cltFormulas';
import { FileCode, Sparkles, Copy, Check, Info, ShieldAlert, Calendar, Scale, Users, CheckCircle2, AlertTriangle } from 'lucide-react';

export const FormulaInspector: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyFormula = (formula: string, index: number) => {
    navigator.clipboard.writeText(formula);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center">
              Fórmulas de Automação & Regras CLT
              <Sparkles className="w-4 h-4 ml-2 text-indigo-600" />
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Veja abaixo a especificação matemática e lógica de cada fórmula automatizada nesta planilha.
              Você pode copiar estas fórmulas diretamente para o Google Sheets ou Microsoft Excel para reproduzir o comportamento.
            </p>
          </div>
        </div>
      </div>

      {/* Formula List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXCEL_FORMULAS_INFO.map((info, index) => (
          <div
            key={info.coluna}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-mono text-xs font-bold flex items-center justify-center border border-indigo-200">
                  {info.coluna}
                </span>
                <h3 className="text-sm font-bold text-slate-800">{info.nomeColuna}</h3>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Fórmula Automática
              </span>
            </div>

            {/* Formula Code Box */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-xs text-indigo-900 flex items-center justify-between group-hover:border-indigo-300 transition-colors">
              <span className="truncate pr-2">{info.formulaExcel}</span>
              <button
                onClick={() => handleCopyFormula(info.formulaExcel, index)}
                className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-200 transition-colors flex-shrink-0"
                title="Copiar Fórmula"
              >
                {copiedIndex === index ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {info.descricao}
            </p>

            {/* Practical Example */}
            <div className="bg-slate-50/80 p-2.5 rounded-lg text-[11px] text-slate-600 border border-slate-200/80">
              <strong className="text-slate-800 block mb-0.5 font-sans">Exemplo Prático:</strong>
              {info.exemploLogica}
            </div>
          </div>
        ))}
      </div>

      {/* CLT Legal Rules Explanation Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <Scale className="w-4 h-4 text-indigo-600 mr-2" />
          Resumo Legislação Trabalhista Brasileira (CLT)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center text-indigo-700 font-semibold space-x-1.5">
              <Calendar className="w-4 h-4" />
              <span>1. Período Aquisitivo</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Cada 12 meses de trabalho consecutivo concede ao colaborador o direito de gozo de 30 dias de férias (Art. 130 CLT).
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center text-blue-700 font-semibold space-x-1.5">
              <Info className="w-4 h-4" />
              <span>2. Período Concessivo & Limite</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              A empresa tem os 12 meses subsequentes para conceder o descanso. O término do gozo deve ocorrer antes de vencer o 2º ano.
            </p>
          </div>

          <div className="bg-red-50/50 p-3.5 rounded-lg border border-red-200 space-y-1.5">
            <div className="flex items-center text-red-700 font-semibold space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>3. Férias em Dobro (Art. 137)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Se as férias forem concedidas após o período concessivo (Data Limite), o empregador é obrigado a pagar a remuneração das férias em dobro.
            </p>
          </div>
        </div>

        {/* Artigo 140 da CLT - Férias Coletivas com Menos de 12 Meses */}
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center space-x-2 text-slate-800">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Users className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              4. Férias Coletivas & Ajuste Condicional de Período Aquisitivo (Art. 140 da CLT)
            </h4>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Para colaboradores admitidos há menos de 12 meses na ocasião de férias coletivas, a contagem proporcional é de <strong>2,5 dias por mês trabalhado</strong> (ou fração &gt; 14 dias). A alteração do período aquisitivo é aplicada <strong>condicionalmente</strong> conforme a relação entre o saldo adquirido e os dias de coletivas:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Caso 1: Saldo < Coletivas */}
            <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200 space-y-2">
              <div className="flex items-center text-amber-900 font-semibold text-xs space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Saldo Acumulado MENOR que as Coletivas</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>
                  <strong>Ajuste da Lei 140 CLT:</strong> O período anterior é cancelado e a <strong>nova data-base</strong> de início do período aquisitivo passa a ser o primeiro dia das férias coletivas.
                </li>
                <li>
                  <strong>Licença Remunerada:</strong> Os dias que excederem o direito adquirido são pagos como licença remunerada pela empresa (sem descontos).
                </li>
              </ul>
            </div>

            {/* Caso 2: Saldo >= Coletivas (ex: Viviane Custódio) */}
            <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200 space-y-2">
              <div className="flex items-center text-emerald-900 font-semibold text-xs space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Saldo Acumulado MAIOR OU IGUAL às Coletivas</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>
                  <strong>Mantém Admissão Original:</strong> O período aquisitivo <strong>NÃO</strong> é alterado e continua contando da data de contratação original (ex: Viviane Custódio com 12,5d acumulados &gt;= 10d coletivas mantém início em 07/07/2026).
                </li>
                <li>
                  <strong>Desconto no Saldo:</strong> Os dias de coletivas são deduzidos normalmente do período aquisitivo vigente.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
