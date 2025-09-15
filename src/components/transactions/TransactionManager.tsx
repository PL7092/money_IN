import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Tag, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionForm } from './TransactionForm';

export const TransactionManager = () => {
  const { transactions, deleteTransaction, categories, accounts, entities } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    entity: '',
    account: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = filters.search === '' || 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase())));
      
      const matchesType = filters.type === '' || t.type === filters.type;
      const matchesCategory = filters.category === '' || t.category === filters.category;
      const matchesEntity = filters.entity === '' || t.entity === filters.entity;
      const matchesAccount = filters.account === '' || t.account === filters.account || t.toAccount === filters.account;
      
      const matchesDateFrom = filters.dateFrom === '' || new Date(t.date) >= new Date(filters.dateFrom);
      const matchesDateTo = filters.dateTo === '' || new Date(t.date) <= new Date(filters.dateTo);
      
      const matchesAmountMin = filters.amountMin === '' || t.amount >= parseFloat(filters.amountMin);
      const matchesAmountMax = filters.amountMax === '' || t.amount <= parseFloat(filters.amountMax);

      return matchesSearch && matchesType && matchesCategory && matchesAccount && 
             matchesEntity &&
             matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransfers = filteredTransactions
    .filter(t => t.type === 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta transação?')) {
      deleteTransaction(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      account: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return ArrowUpRight;
      case 'expense': return ArrowDownRight;
      case 'transfer': return ArrowRightLeft;
      default: return ArrowRightLeft;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100';
      case 'expense': return 'bg-red-100';
      case 'transfer': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      case 'transfer': return 'Transferência';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Transações</h1>
          <p className="text-gray-600">Todas as suas transações financeiras num só local</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Transação
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-gray-900">€{totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3 mr-4">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-2xl font-bold text-gray-900">€{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transferências</p>
              <p className="text-2xl font-bold text-gray-900">€{totalTransfers.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-lg p-3 mr-4">
              <div className="w-6 h-6 bg-indigo-500 rounded"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Transações</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter size={20} className="mr-2" />
            Filtros
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Procurar transações..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="transfer">Transferências</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.filter(cat => cat.active).map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>

          {/* Entity Filter */}
          <select
            value={filters.entity}
            onChange={(e) => handleFilterChange('entity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as entidades</option>
            {entities.filter(e => e.active).map(entity => (
              <option key={entity.id} value={entity.name}>{entity.name}</option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={filters.account}
            onChange={(e) => handleFilterChange('account', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as contas</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>

          {/* Date From */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Data de início</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Data de fim</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Amount Min */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Valor mínimo</label>
            <input
              type="number"
              step="0.01"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="€0.00"
            />
          </div>

          {/* Amount Max */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Valor máximo</label>
            <input
              type="number"
              step="0.01"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="€0.00"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Transações ({filteredTransactions.length})
          </h3>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma transação encontrada com os filtros aplicados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Registar primeira transação
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => {
              const fromAccount = accounts.find(a => a.id === transaction.account);
              const toAccount = transaction.toAccount ? accounts.find(a => a.id === transaction.toAccount) : null;
              const Icon = getTransactionIcon(transaction.type);
              const colorClass = getTransactionColor(transaction.type);
              const bgColorClass = getTransactionBgColor(transaction.type);
              
              return (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`${bgColorClass} rounded-lg p-2 mr-4`}>
                        <Icon size={20} className={colorClass} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${bgColorClass} ${colorClass} font-medium`}>
                            {getTransactionLabel(transaction.type)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {transaction.entity && <span>👤 {transaction.entity}</span>}
                          <span>{transaction.category}</span>
                          {transaction.subcategory && <span>• {transaction.subcategory}</span>}
                          <span>
                            {fromAccount ? fromAccount.name : 'Conta não encontrada'}
                            {transaction.type === 'transfer' && toAccount && (
                              <> → {toAccount.name}</>
                            )}
                          </span>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-PT')}</span>
                          {transaction.location && (
                            <span>📍 {transaction.location}</span>
                          )}
                          {transaction.aiProcessed && (
                            <span className="text-blue-600 text-xs">🤖 AI</span>
                          )}
                        </div>
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="flex items-center mt-1">
                            <Tag size={14} className="text-gray-400 mr-1" />
                            <div className="flex space-x-1">
                              {transaction.tags.map(tag => (
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
                      <span className={`text-lg font-bold ${colorClass}`}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}€{transaction.amount.toFixed(2)}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
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
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};