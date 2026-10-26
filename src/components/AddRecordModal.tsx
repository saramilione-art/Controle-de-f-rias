import React, { useState, useEffect } from 'react';
import { VacationRecord, NoticeStatus, ReceiptStatus, Adiantamento13Status } from '../types';
import { calculateExpirationDate, calculateLimitDate, calculateDaysBetween } from '../utils/cltFormulas';
import { X, Sparkles, Calendar, User, Plus, Mail, Building2, UserCheck, DollarSign } from 'lucide-react';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (newRecord: VacationRecord) => void;
  existingEmployees: string[];
  existingRecords?: VacationRecord[];
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  existingEmployees,
  existingRecords = []
}) => {
  const [funcionario, setFuncionario] = useState<string>('');
  const [isNewEmployee, setIsNewEmployee] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [gestorResponsavel, setGestorResponsavel] = useState<string>('');
  const [setor, setSetor] = useState<string>('');
  const [abonoPecuniario, setAbonoPecuniario] = useState<string>('Não');
  const [adiantamento13, setAdiantamento13] = useState<Adiantamento13Status>('Não');
  const [dataContratacao, setDataContratacao] = useState<string>('');
  const [inicioPeriodoAquisitivo, setInicioPeriodoAquisitivo] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [inicioFerias, setInicioFerias] = useState<string>('');
  const [retornoFerias, setRetornoFerias] = useState<string>('');
  const [diasFerias, setDiasFerias] = useState<number>(0);
  const [dataLimite, setDataLimite] = useState<string>('');
  const [avisoFerias, setAvisoFerias] = useState<NoticeStatus | ''>('');
  const [reciboFerias, setReciboFerias] = useState<ReceiptStatus | ''>('');

  // Auto-fill existing employee info when selecting from list
  const handleSelectEmployee = (name: string) => {
    setFuncionario(name);
    if (!name) return;
    const match = existingRecords.find(r => r.funcionario === name);
    if (match) {
      if (match.email) setEmail(match.email);
      if (match.gestorResponsavel) setGestorResponsavel(match.gestorResponsavel);
      if (match.setor) setSetor(match.setor);
      if (match.dataContratacao) setDataContratacao(match.dataContratacao);
    }
  };

  // Auto-calculate expiration and limit dates when inicioPeriodoAquisitivo changes
  useEffect(() => {
    if (inicioPeriodoAquisitivo) {
      const exp = calculateExpirationDate(inicioPeriodoAquisitivo);
      if (exp) {
        setDataVencimento(exp);
        const lim = calculateLimitDate(exp);
        if (lim) {
          setDataLimite(lim);
        }
      }
    }
  }, [inicioPeriodoAquisitivo]);

  // Auto-calculate vacation days when inicio and retorno change
  useEffect(() => {
    if (inicioFerias && retornoFerias) {
      const days = calculateDaysBetween(inicioFerias, retornoFerias);
      setDiasFerias(days);
    }
  }, [inicioFerias, retornoFerias]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcionario.trim() || !inicioPeriodoAquisitivo.trim()) {
      alert('Por favor, preencha o nome do funcionário e o início do período aquisitivo.');
      return;
    }

    const newRec: VacationRecord = {
      id: String(Date.now()),
      funcionario: funcionario.trim(),
      email: email.trim() || undefined,
      gestorResponsavel: gestorResponsavel.trim() || undefined,
      setor: setor.trim() || undefined,
      abonoPecuniario: abonoPecuniario.trim() || 'Não',
      adiantamento13: adiantamento13 || 'Não',
      dataContratacao: dataContratacao.trim() || inicioPeriodoAquisitivo.trim(),
      inicioPeriodoAquisitivo: inicioPeriodoAquisitivo.trim(),
      dataVencimento: dataVencimento || calculateExpirationDate(inicioPeriodoAquisitivo.trim()),
      inicioFerias: inicioFerias.trim(),
      retornoFerias: retornoFerias.trim(),
      diasFerias: diasFerias || 0,
      dataLimite: dataLimite || calculateLimitDate(dataVencimento),
      situacao: 'Dentro do Prazo', // Will be recalculated by main state engine
      saldoFerias: Math.max(0, 30 - diasFerias),
      avisoFerias,
      reciboFerias
    };

    onAddRecord(newRec);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Adicionar Registro de Férias</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Employee Selection */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold flex items-center justify-between">
              <span>Nome do Funcionário *</span>
              <button
                type="button"
                onClick={() => {
                  setIsNewEmployee(!isNewEmployee);
                  setFuncionario('');
                }}
                className="text-indigo-600 hover:underline text-[11px] font-bold"
              >
                {isNewEmployee ? 'Selecionar Existente' : '+ Cadastrar Novo'}
              </button>
            </label>

            {isNewEmployee ? (
              <input
                type="text"
                required
                value={funcionario}
                onChange={(e) => setFuncionario(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <select
                required
                value={funcionario}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg focus:ring-1 focus:ring-indigo-500 font-sans"
              >
                <option value="">-- Selecione o Colaborador --</option>
                {existingEmployees.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            )}
          </div>

          {/* Identification Grid: Email, Gestor, Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">E-mail do Colaborador</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@empresa.com.br"
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Setor / Área</label>
              <input
                type="text"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                placeholder="Ex: Financeiro, TI, RH"
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Gestor Responsável</label>
              <input
                type="text"
                value={gestorResponsavel}
                onChange={(e) => setGestorResponsavel(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg"
              />
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Data de Contratação</label>
              <input
                type="text"
                value={dataContratacao}
                onChange={(e) => setDataContratacao(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Início Período Aquisitivo *</label>
              <input
                type="text"
                required
                value={inicioPeriodoAquisitivo}
                onChange={(e) => setInicioPeriodoAquisitivo(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Calculated Auto Preview Banner */}
          {dataVencimento && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-indigo-900">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span className="font-semibold">Cálculo Automático de Prazos CLT:</span>
              </div>
              <div className="text-right font-mono font-bold text-[11px]">
                <div>Vencimento: {dataVencimento}</div>
                <div className="text-indigo-700">Data Limite: {dataLimite}</div>
              </div>
            </div>
          )}

          {/* Vacation Period Section */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Período de Gozo de Férias (Opcional)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Início Férias</label>
                <input
                  type="text"
                  value={inicioFerias}
                  onChange={(e) => setInicioFerias(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Retorno Férias</label>
                <input
                  type="text"
                  value={retornoFerias}
                  onChange={(e) => setRetornoFerias(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Dias de Gozo</label>
                <input
                  type="number"
                  value={diasFerias}
                  onChange={(e) => setDiasFerias(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-white border border-slate-300 text-indigo-700 font-bold p-2.5 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Abono Pecuniário e Adiantamento 13º */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Venda de Férias (Abono Pecuniário)
              </label>
              <select
                value={abonoPecuniario}
                onChange={(e) => setAbonoPecuniario(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg"
              >
                <option value="Não">Não (Gozo integral)</option>
                <option value="10 dias">10 dias (Conversão de 1/3 - CLT Art. 143)</option>
                <option value="5 dias">5 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Adiantamento de 13º Salário (Sim/Não)
              </label>
              <select
                value={adiantamento13}
                onChange={(e) => setAdiantamento13(e.target.value as Adiantamento13Status)}
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg"
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim (Adiantar 1ª parcela)</option>
              </select>
            </div>
          </div>

          {/* Notice & Receipt Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Aviso de Férias</label>
              <select
                value={avisoFerias}
                onChange={(e) => setAvisoFerias(e.target.value as NoticeStatus)}
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg"
              >
                <option value="">Nenhum / Pendente</option>
                <option value="Não enviado">Não enviado</option>
                <option value="Enviado">Enviado</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Recibo de Férias</label>
              <select
                value={reciboFerias}
                onChange={(e) => setReciboFerias(e.target.value as ReceiptStatus)}
                className="w-full bg-white border border-slate-300 text-slate-800 p-2.5 rounded-lg"
              >
                <option value="">Nenhum / Pendente</option>
                <option value="Enviado">Enviado</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
