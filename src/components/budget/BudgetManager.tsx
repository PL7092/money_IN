import React, { useState } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { BudgetForm } from './BudgetForm';

export const BudgetManager = () => {
  const { budgets, deleteBudget } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este orçamento?')) {
      deleteBudget(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const getBudgetStatus = (budget: any) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'red', icon: AlertTriangle };
    if (percentage >= 80) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'good', color: 'green', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Orçamentos</h1>
          <p className="text-gray-600">Defina e monitore os seus limites de gastos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo Orçamento
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Orçamentos</p>
              <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dentro do Limite</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgets.filter(b => (b.spent / b.limit) * 100 < 80).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3 mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Excedidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgets.filter(b => (b.spent / b.limit) * 100 >= 100).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento definido</h3>
            <p className="text-gray-600 mb-4">
              Comece por criar orçamentos para controlar os seus gastos por categoria
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeiro Orçamento
            </button>
          </div>
        ) : (
          budgets.map((budget) => {
            const { status, color, icon: StatusIcon } = getBudgetStatus(budget);
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const remaining = budget.limit - budget.spent;

            return (
              <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`bg-${color}-100 rounded-lg p-2 mr-3`}>
                      <StatusIcon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                      <p className="text-sm text-gray-600 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      €{budget.spent.toFixed(2)} / €{budget.limit.toFixed(2)}
                    </span>
                    <span className={`text-sm font-medium ${
                      status === 'exceeded' ? 'text-red-600' :
                      status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        status === 'exceeded' ? 'bg-red-500' :
                        status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {remaining >= 0 ? 'Restante:' : 'Excedido:'} €{Math.abs(remaining).toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      {new Date(budget.startDate).toLocaleDateString('pt-PT')} - {new Date(budget.endDate).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};