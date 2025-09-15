import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface SavingsGoalFormProps {
  goal?: any;
  onClose: () => void;
}

const goalCategories = [
  { value: 'emergency', label: 'Fundo de Emergência', icon: '🚨' },
  { value: 'vacation', label: 'Férias', icon: '✈️' },
  { value: 'house', label: 'Casa', icon: '🏠' },
  { value: 'car', label: 'Carro', icon: '🚗' },
  { value: 'education', label: 'Educação', icon: '🎓' },
  { value: 'retirement', label: 'Reforma', icon: '👴' },
  { value: 'other', label: 'Outro', icon: '🎯' }
];

const priorities = [
  { value: 'low', label: 'Baixa', color: 'green' },
  { value: 'medium', label: 'Média', color: 'yellow' },
  { value: 'high', label: 'Alta', color: 'red' }
];

export const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ goal, onClose }) => {
  const { addSavingsGoal, updateSavingsGoal, accounts } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'other' as any,
    priority: 'medium' as any,
    linkedAccount: '',
    monthlyContribution: '',
    autoTransfer: false
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description || '',
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: goal.targetDate,
        category: goal.category,
        priority: goal.priority,
        linkedAccount: goal.linkedAccount || '',
        monthlyContribution: goal.monthlyContribution?.toString() || '',
        autoTransfer: goal.autoTransfer
      });
    } else {
      // Set default target date to 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setFormData(prev => ({
        ...prev,
        targetDate: nextYear.toISOString().split('T')[0],
        currentAmount: '0'
      }));
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      name: formData.name,
      description: formData.description || undefined,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      targetDate: formData.targetDate,
      category: formData.category,
      priority: formData.priority,
      status: 'active' as const,
      linkedAccount: formData.linkedAccount || undefined,
      monthlyContribution: formData.monthlyContribution ? parseFloat(formData.monthlyContribution) : undefined,
      autoTransfer: formData.autoTransfer
    };

    if (goal) {
      updateSavingsGoal(goal.id, goalData);
    } else {
      addSavingsGoal(goalData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const calculateMonthsToTarget = () => {
    const targetDate = new Date(formData.targetDate);
    const now = new Date();
    const monthsDiff = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
    return Math.max(1, monthsDiff);
  };

  const suggestedMonthlyAmount = () => {
    const remaining = parseFloat(formData.targetAmount) - parseFloat(formData.currentAmount || '0');
    const months = calculateMonthsToTarget();
    return remaining > 0 ? (remaining / months).toFixed(2) : '0';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Target className="mr-2 text-blue-600" size={24} />
            {goal ? 'Editar Objetivo' : 'Novo Objetivo de Poupança'}
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
                Nome do Objetivo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Fundo de Emergência"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o objetivo da poupança..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {goalCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Financeiras</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Objetivo *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Atual
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="currentAmount"
                    value={formData.currentAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Objetivo *
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Suggestion */}
            {formData.targetAmount && formData.targetDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign size={16} className="text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-blue-800">Sugestão de Poupança</span>
                </div>
                <p className="text-sm text-blue-700">
                  Para atingir o objetivo, precisa de poupar aproximadamente{' '}
                  <strong>€{suggestedMonthlyAmount()}/mês</strong> durante {calculateMonthsToTarget()} meses.
                </p>
              </div>
            )}
          </div>

          {/* Automation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Configurações de Automação</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conta Associada
              </label>
              <select
                name="linkedAccount"
                value={formData.linkedAccount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar conta (opcional)</option>
                {accounts.filter(a => a.status === 'active').map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contribuição Mensal
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  name="monthlyContribution"
                  value={formData.monthlyContribution}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoTransfer"
                id="autoTransfer"
                checked={formData.autoTransfer}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoTransfer" className="ml-2 text-sm text-gray-700">
                Transferência automática mensal (requer conta associada)
              </label>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {goal ? 'Actualizar' : 'Criar Objetivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};