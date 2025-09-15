import React, { useState } from 'react';
import { Plus, Repeat, Calendar, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

export const RecurringManager = () => {
  const { recurringTransactions, updateRecurringTransaction, deleteRecurringTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);

  // Mock data for demonstration since we don't have recurring transactions in context yet
  const mockRecurringTransactions = [
    {
      id: '1',
      name: 'Salário Mensal',
      amount: 2800,
      type: 'income',
      category: 'Salário',
      account: '1',
      frequency: 'monthly',
      nextDate: '2024-02-01',
      active: true
    },
    {
      id: '2',
      name: 'Renda da Casa',
      amount: 750,
      type: 'expense',
      category: 'Habitação',
      account: '1',
      frequency: 'monthly',
      nextDate: '2024-01-28',
      active: true
    },
    {
      id: '3',
      name: 'Netflix',
      amount: 15.99,
      type: 'expense',
      category: 'Entretenimento',
      account: '1',
      frequency: 'monthly',
      nextDate: '2024-02-15',
      active: true
    },
    {
      id: '4',
      name: 'Seguro do Carro',
      amount: 85,
      type: 'expense',
      category: 'Seguros',
      account: '1',
      frequency: 'monthly',
      nextDate: '2024-02-10',
      active: false
    }
  ];

  const activeRecurring = mockRecurringTransactions.filter(t => t.active);
  const totalMonthlyIncome = activeRecurring
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyExpenses = activeRecurring
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const toggleActive = (id: string, currentStatus: boolean) => {
    // In a real app, this would update the recurring transaction
    console.log(`Toggle ${id} to ${!currentStatus}`);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'yearly': return 'Anual';
      default: return frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos Recorrentes</h1>
          <p className="text-gray-600">Gerencie receitas e despesas automáticas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Recorrência
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <Repeat className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas Mensais</p>
              <p className="text-2xl font-bold text-gray-900">€{totalMonthlyIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3 mr-4">
              <Repeat className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas Mensais</p>
              <p className="text-2xl font-bold text-gray-900">€{totalMonthlyExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transações Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{activeRecurring.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Transações</h3>
        <div className="space-y-3">
          {mockRecurringTransactions
            .filter(t => t.active)
            .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
            .slice(0, 3)
            .map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{transaction.name}</p>
                    <p className="text-sm text-gray-600">
                      {getFrequencyLabel(transaction.frequency)} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.nextDate).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* All Recurring Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Todas as Recorrências</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockRecurringTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  } rounded-lg p-2 mr-4`}>
                    <Repeat className={`w-5 h-5 ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{transaction.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">{transaction.category}</span>
                      <span className="text-sm text-gray-600">
                        {getFrequencyLabel(transaction.frequency)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Próximo: {new Date(transaction.nextDate).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => toggleActive(transaction.id, transaction.active)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {transaction.active ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  
                  <div className="flex space-x-1">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">Dicas de Gestão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Configure Alertas</h4>
            <p className="text-sm text-purple-700">
              Receba notificações antes dos pagamentos para evitar surpresas no orçamento
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Revise Regularmente</h4>
            <p className="text-sm text-purple-700">
              Desative ou ajuste transações que já não se aplicam à sua situação atual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};