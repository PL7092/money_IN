import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface BudgetFormProps {
  budget?: any;
  onClose: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onClose }) => {
  const { addBudget, updateBudget, categories, getCurrentMonthBudgets } = useFinance();
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    alerts: true
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
        period: budget.period,
        month: budget.month,
        year: budget.year,
        startDate: budget.startDate,
        endDate: budget.endDate,
        alerts: budget.alerts
      });
    } else {
      // Auto-set end date based on period
      updateDateRange();
    }
  }, [budget]);

  const updateDateRange = () => {
    const now = new Date();
    const startDate = new Date(formData.year, formData.month, 1);
    const endDate = new Date(formData.year, formData.month + 1, 0);

    setFormData(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se já existe orçamento para esta categoria no mês/ano
    const existingBudgets = getCurrentMonthBudgets();
    const categoryExists = existingBudgets.some(b => 
      b.category === formData.category && 
      b.month === formData.month && 
      b.year === formData.year &&
      (!budget || b.id !== budget.id)
    );
    
    if (categoryExists) {
      alert('Já existe um orçamento para esta categoria neste mês.');
      return;
    }
    
    const budgetData = {
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period,
      month: formData.month,
      year: formData.year,
      startDate: formData.startDate,
      endDate: formData.endDate,
      alerts: formData.alerts
    };

    if (budget) {
      updateBudget(budget.id, budgetData);
    } else {
      addBudget(budgetData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'month' || name === 'year') {
      const newValue = name === 'year' ? parseInt(value) : parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
      
      // Update date range after state change
      setTimeout(() => updateDateRange(), 0);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Target className="mr-2 text-blue-600" size={24} />
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <option value="">Seleccionar categoria</option>
              {categories.map(category => (
                <option key={typeof category === 'string' ? category : category.id} value={typeof category === 'string' ? category : category.name}>
                  {typeof category === 'string' ? category : category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite de Orçamento *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                name="limit"
                value={formData.limit}
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
              Mês e Ano *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2024, i, 1).toLocaleDateString('pt-PT', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i - 1;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Fim *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="alerts"
              id="budget-alerts"
              checked={formData.alerts}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="budget-alerts" className="ml-2 text-sm text-gray-700">
              Receber alertas quando atingir 80% do limite
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> Configure orçamentos realistas baseados no seu histórico de gastos. 
              Os alertas ajudam-no a manter-se dentro dos limites definidos.
            </p>
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
              {budget ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};