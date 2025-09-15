import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface SavingsTransactionFormProps {
  goal: any;
  onClose: () => void;
}

export const SavingsTransactionForm: React.FC<SavingsTransactionFormProps> = ({ goal, onClose }) => {
  const { addSavingsTransaction } = useFinance();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      date: formData.date,
      description: formData.description || (formData.type === 'deposit' ? 'Depósito' : 'Levantamento')
    };

    addSavingsTransaction(goal.id, transactionData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const maxWithdrawal = goal.currentAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Nova Transação - {goal.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Goal Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Valor Atual:</span>
              <span className="font-semibold">€{goal.currentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Falta para a meta:</span>
              <span className="font-semibold text-blue-600">€{remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transação *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'deposit' }))}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'deposit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plus size={18} className="mr-2" />
                Depósito
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'withdrawal' }))}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'withdrawal'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minus size={18} className="mr-2" />
                Levantamento
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                max={formData.type === 'withdrawal' ? maxWithdrawal : undefined}
                required
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                  formData.type === 'deposit'
                    ? 'border-gray-300 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-red-500'
                }`}
                placeholder="0.00"
              />
            </div>
            {formData.type === 'withdrawal' && (
              <p className="text-xs text-gray-600 mt-1">
                Máximo disponível: €{maxWithdrawal.toFixed(2)}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={formData.type === 'deposit' ? 'Ex: Poupança mensal' : 'Ex: Emergência médica'}
            />
          </div>

          {/* Quick Amount Buttons for Deposits */}
          {formData.type === 'deposit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valores Rápidos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {goal.monthlyContribution && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: goal.monthlyContribution.toString() }))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    €{goal.monthlyContribution}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: '100' }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  €100
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: '500' }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  €500
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {formData.amount && (
            <div className={`p-3 rounded-lg ${
              formData.type === 'deposit' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-sm font-medium mb-1">
                {formData.type === 'deposit' ? 'Após o depósito:' : 'Após o levantamento:'}
              </p>
              <p className={`text-lg font-bold ${
                formData.type === 'deposit' ? 'text-green-700' : 'text-red-700'
              }`}>
                €{(formData.type === 'deposit' 
                  ? goal.currentAmount + parseFloat(formData.amount)
                  : goal.currentAmount - parseFloat(formData.amount)
                ).toFixed(2)}
              </p>
              {formData.type === 'deposit' && (
                <p className="text-sm text-green-600">
                  Progresso: {(((goal.currentAmount + parseFloat(formData.amount)) / goal.targetAmount) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          )}

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
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                formData.type === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {formData.type === 'deposit' ? 'Adicionar Depósito' : 'Registar Levantamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};