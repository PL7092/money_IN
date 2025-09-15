import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { IncomeForm } from './IncomeForm';

export const IncomeManager = () => {
  const { transactions, deleteTransaction, accounts } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const incomeTransactions = transactions
    .filter(t => t.type === 'income')
    .filter(t => 
      searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = incomeTransactions.reduce((sum, income) => sum + income.amount, 0);
  const currentMonthIncome = incomeTransactions.filter(income => {
    const incomeDate = new Date(income.date);
    const currentDate = new Date();
    return incomeDate.getMonth() === currentDate.getMonth() && 
           incomeDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, income) => sum + income.amount, 0);

  const averageIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0;

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta receita?')) {
      deleteTransaction(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Receitas</h1>
          <p className="text-gray-600">Gerencie todas as suas fontes de rendimento</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Receita
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Receitas</p>
              <p className="text-2xl font-bold text-gray-900">€{totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">€{currentMonthIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-lg p-3 mr-4">
              <div className="w-6 h-6 bg-indigo-500 rounded"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Média por Transação</p>
              <p className="text-2xl font-bold text-gray-900">€{averageIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Procurar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Receitas</h3>
        </div>
        
        {incomeTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma receita encontrada</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-green-600 hover:text-green-700 font-medium"
            >
              Registar primeira receita
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {incomeTransactions.map((income) => {
              const account = accounts.find(a => a.id === income.account);
              
              return (
                <div key={income.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-lg p-2 mr-4">
                        <TrendingUp size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{income.description}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">{income.category}</span>
                          <span className="text-sm text-gray-600">
                            {account ? account.name : 'Conta não encontrada'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(income.date).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-green-600">
                        +€{income.amount.toFixed(2)}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(income)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <IncomeForm
          transaction={editingTransaction}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};