import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Tag } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { ExpenseForm } from './ExpenseForm';

export const ExpenseManager = () => {
  const { transactions, deleteTransaction, categories, accounts } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .filter(t => 
      (searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === '' || t.category === filterCategory) &&
      (filterAccount === '' || t.account === filterAccount)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const currentDate = new Date();
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta despesa?')) {
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
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Despesas</h1>
          <p className="text-gray-600">Controle e categorize todas as suas despesas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Despesa
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3 mr-4">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Despesas</p>
              <p className="text-2xl font-bold text-gray-900">€{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-lg p-3 mr-4">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">€{currentMonthExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nº Transações</p>
              <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Procurar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todas as contas</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Despesas</h3>
        </div>
        
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma despesa encontrada</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Registar primeira despesa
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {expenses.map((expense) => {
              const account = accounts.find(a => a.id === expense.account);
              
              return (
                <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-red-100 rounded-lg p-2 mr-4">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">{expense.category}</span>
                          <span className="text-sm text-gray-600">
                            {account ? account.name : 'Conta não encontrada'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        {expense.tags && expense.tags.length > 0 && (
                          <div className="flex items-center mt-1">
                            <Tag size={14} className="text-gray-400 mr-1" />
                            <div className="flex space-x-1">
                              {expense.tags.map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-red-600">
                        -€{expense.amount.toFixed(2)}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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
        <ExpenseForm
          transaction={editingTransaction}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};