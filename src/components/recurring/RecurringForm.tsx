import React, { useState, useEffect } from 'react';
import { X, Repeat, Calendar, Target, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { toInputDate, configureDateInput } from '../../utils/dateUtils';

interface RecurringFormProps {
  recurring?: any;
  onClose: () => void;
}

const frequencies = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' }
];

export const RecurringForm: React.FC<RecurringFormProps> = ({ recurring, onClose }) => {
  const { addRecurringTransaction, updateRecurringTransaction, categories, accounts } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    expectedAmount: '',
    maxAcceptableAmount: '',
    minAcceptableAmount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    subcategory: '',
    account: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    nextDate: '',
    endDate: '',
    active: true,
    autoIncludeInBudget: true,
    alertOnVariation: true,
    variationThreshold: 20
  });

  useEffect(() => {
    if (recurring) {
      setFormData({
        name: recurring.name,
        amount: recurring.amount.toString(),
        expectedAmount: recurring.expectedAmount.toString(),
        maxAcceptableAmount: recurring.maxAcceptableAmount?.toString() || '',
        minAcceptableAmount: recurring.minAcceptableAmount?.toString() || '',
        type: recurring.type,
        category: recurring.category,
        subcategory: recurring.subcategory || '',
        account: recurring.account,
        frequency: recurring.frequency,
        nextDate: recurring.nextDate,
        endDate: recurring.endDate || '',
        active: recurring.active,
        autoIncludeInBudget: recurring.autoIncludeInBudget,
        alertOnVariation: recurring.alertOnVariation,
        variationThreshold: recurring.variationThreshold
      });
    } else {
      // Set default next date based on frequency
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setFormData(prev => ({
        ...prev,
        nextDate: toInputDate(nextMonth)
      }));
    }
  }, [recurring]);

  // Configure date inputs for Portuguese locale
  useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input) => {
      configureDateInput(input as HTMLInputElement);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recurringData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      expectedAmount: parseFloat(formData.expectedAmount || formData.amount),
      maxAcceptableAmount: formData.maxAcceptableAmount ? parseFloat(formData.maxAcceptableAmount) : undefined,
      minAcceptableAmount: formData.minAcceptableAmount ? parseFloat(formData.minAcceptableAmount) : undefined,
      type: formData.type,
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      account: formData.account,
      frequency: formData.frequency,
      nextDate: formData.nextDate,
      endDate: formData.endDate || undefined,
      active: formData.active,
      autoIncludeInBudget: formData.autoIncludeInBudget,
      alertOnVariation: formData.alertOnVariation,
      variationThreshold: formData.variationThreshold
    };

    if (recurring) {
      updateRecurringTransaction(recurring.id, recurringData);
    } else {
      addRecurringTransaction(recurringData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? (value === '' ? '' : value) : value
    }));
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Repeat className="mr-2 text-purple-600" size={24} />
            {recurring ? 'Editar Pagamento Recorrente' : 'Novo Pagamento Recorrente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Pagamento *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Renda da Casa, Salário Mensal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transação *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'income'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Despesa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência *
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Valores e Limites</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Atual *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Esperado
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="expectedAmount"
                    value={formData.expectedAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Mesmo que valor atual"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Deixe vazio para usar o valor atual como esperado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Máximo Aceitável
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="maxAcceptableAmount"
                    value={formData.maxAcceptableAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mínimo Aceitável
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="minAcceptableAmount"
                    value={formData.minAcceptableAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite de Variação para Alertas (%)
              </label>
              <input
                type="number"
                name="variationThreshold"
                value={formData.variationThreshold}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Alertar quando a variação ultrapassar esta percentagem
              </p>
            </div>
          </div>

          {/* Category and Account */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Categorização</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoria</option>
                  {categories
                    .filter(cat => cat.active && (cat.type === formData.type || cat.type === 'both'))
                    .map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoria
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!formData.category}
                >
                  <option value="">Seleccionar subcategoria (opcional)</option>
                  {selectedCategory?.subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conta *
              </label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar conta</option>
                {accounts.filter(a => a.status === 'active').map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Agendamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Próxima Data *
                </label>
                <div className="date-input-pt" data-placeholder="DD/MM/AAAA">
                  <input
                    type="date"
                    name="nextDate"
                    value={formData.nextDate}
                    onChange={handleChange}
                    required
                    lang="pt-PT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim (Opcional)
                </label>
                <div className="date-input-pt" data-placeholder="DD/MM/AAAA">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    lang="pt-PT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  id="recurring-active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring-active" className="ml-2 text-sm text-gray-700">
                  Pagamento ativo
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="autoIncludeInBudget"
                  id="auto-budget"
                  checked={formData.autoIncludeInBudget}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-budget" className="ml-2 text-sm text-gray-700">
                  Incluir automaticamente nos orçamentos mensais
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="alertOnVariation"
                  id="alert-variation"
                  checked={formData.alertOnVariation}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="alert-variation" className="ml-2 text-sm text-gray-700">
                  Alertar sobre variações significativas
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Resumo da Configuração</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-purple-700">
                  <strong>Pagamento:</strong> {formData.name || 'Nome do pagamento'}
                </p>
                <p className="text-purple-700">
                  <strong>Valor:</strong> €{formData.amount || '0.00'} ({formData.type === 'income' ? 'Receita' : 'Despesa'})
                </p>
                <p className="text-purple-700">
                  <strong>Frequência:</strong> {frequencies.find(f => f.value === formData.frequency)?.label}
                </p>
              </div>
              <div>
                <p className="text-purple-700">
                  <strong>Categoria:</strong> {formData.category || 'Não selecionada'}
                </p>
                <p className="text-purple-700">
                  <strong>Próximo:</strong> {formData.nextDate ? new Date(formData.nextDate).toLocaleDateString('pt-PT') : 'Não definido'}
                </p>
                <p className="text-purple-700">
                  <strong>Orçamento:</strong> {formData.autoIncludeInBudget ? 'Incluído automaticamente' : 'Manual'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {recurring ? 'Atualizar' : 'Criar'} Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};