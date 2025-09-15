import React, { useState } from 'react';
import { Plus, CreditCard, Wallet, PiggyBank, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { AccountForm } from './AccountForm';

const accountTypeIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp
};

const accountTypeNames = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit: 'Cartão de Crédito',
  investment: 'Investimento'
};

export const AccountsManager = () => {
  const { accounts, deleteAccount, getTotalBalance } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeAccounts = accounts.filter(a => a.status === 'active');
  const archivedAccounts = accounts.filter(a => a.status === 'archived');
  const displayAccounts = showArchived ? archivedAccounts : activeAccounts;

  const totalBalance = getTotalBalance();
  const totalAssets = activeAccounts.filter(a => a.type !== 'credit').reduce((sum, account) => sum + account.balance, 0);
  const totalDebt = Math.abs(activeAccounts.filter(a => a.type === 'credit').reduce((sum, account) => sum + Math.min(account.balance, 0), 0));

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta conta permanentemente? Todas as transações associadas permanecerão, mas a referência à conta será perdida.')) {
      deleteAccount(id);
    }
  };

  const handleArchiveToggle = (account: any) => {
    const newStatus = account.status === 'active' ? 'archived' : 'active';
    const action = newStatus === 'archived' ? 'arquivar' : 'reativar';
    
    if (confirm(`Tem a certeza que deseja ${action} esta conta?`)) {
      updateAccount(account.id, { status: newStatus });
    }
  };
  const handleFormClose = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking': return 'blue';
      case 'savings': return 'green';
      case 'credit': return 'red';
      case 'investment': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Contas</h1>
          <p className="text-gray-600">Gerencie todas as suas contas bancárias e cartões</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Conta
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo Total (Ativas)</p>
              <p className="text-2xl font-bold text-gray-900">€{totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Ativos</p>
              <p className="text-2xl font-bold text-gray-900">€{totalAssets.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3 mr-4">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Dívidas</p>
              <p className="text-2xl font-bold text-gray-900">€{totalDebt.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showArchived
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Contas Ativas ({activeAccounts.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showArchived
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Contas Arquivadas ({archivedAccounts.length})
            </button>
          </div>
        </div>
      </div>
      {/* Accounts List */}
      <div className="space-y-4">
        {displayAccounts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchived ? 'Nenhuma conta arquivada' : 'Nenhuma conta ativa'}
            </h3>
            <p className="text-gray-600 mb-4">
              {showArchived 
                ? 'As contas arquivadas aparecerão aqui'
                : 'Adicione suas contas bancárias e cartões para começar a gerir as suas finanças'
              }
            </p>
            {!showArchived && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Primeira Conta
              </button>
            )}
          </div>
        ) : (
          displayAccounts.map((account) => {
            const IconComponent = accountTypeIcons[account.type];
            const color = getAccountTypeColor(account.type);
            const isNegative = account.balance < 0;
            const isArchived = account.status === 'archived';

            return (
              <div key={account.id} className={`bg-white rounded-xl shadow-sm border p-6 ${
                isArchived ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`bg-${color}-100 rounded-lg p-3 mr-4`}
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <IconComponent 
                        className={`w-6 h-6 ${isArchived ? 'opacity-50' : ''}`}
                        style={{ color: account.color }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className={`text-lg font-semibold ${isArchived ? 'text-gray-600' : 'text-gray-900'}`}>
                          {account.name}
                        </h3>
                        {isArchived && (
                          <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                            Arquivada
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-sm ${isArchived ? 'text-gray-500' : 'text-gray-600'}`}>
                          {accountTypeNames[account.type]}
                        </span>
                        <span className={`text-sm ${isArchived ? 'text-gray-500' : 'text-gray-600'}`}>
                          {account.institution}
                        </span>
                        <span className={`text-sm ${isArchived ? 'text-gray-500' : 'text-gray-600'}`}>
                          {account.currency}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          Criada: {new Date(account.createdAt).toLocaleDateString('pt-PT')}
                        </span>
                        <span className="text-xs text-gray-500">
                          Saldo inicial: €{account.initialBalance.toFixed(2)} 
                          ({new Date(account.initialBalanceDate).toLocaleDateString('pt-PT')})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        isArchived ? 'text-gray-500' : 
                        isNegative ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isNegative ? '-' : ''}€{Math.abs(account.balance).toFixed(2)}
                      </p>
                      {account.type === 'credit' && account.balance < 0 && (
                        <p className={`text-sm ${isArchived ? 'text-gray-500' : 'text-red-600'}`}>
                          Dívida pendente
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleArchiveToggle(account)}
                        className={`p-2 rounded-lg transition-colors ${
                          isArchived 
                            ? 'text-gray-400 hover:text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                        }`}
                        title={isArchived ? 'Reativar conta' : 'Arquivar conta'}
                      >
                        {isArchived ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 4-4" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(account)}
                        className={`p-2 rounded-lg transition-colors ${
                          isArchived 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        disabled={isArchived}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Balance Progress (for credit cards) */}
                {account.type === 'credit' && account.balance < 0 && !isArchived && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Utilização do cartão</span>
                      <span>{Math.abs(account.balance).toFixed(2)}€</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: '60%' }} // This could be calculated based on credit limit
                      />
                    </div>
                  </div>
                )}

                {/* Status History for archived accounts */}
                {isArchived && account.statusHistory.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Histórico de Estado</h4>
                    <div className="space-y-1">
                      {account.statusHistory.slice(-2).map((history, index) => (
                        <div key={index} className="flex justify-between text-xs text-gray-500">
                          <span className="capitalize">{history.status === 'active' ? 'Ativada' : 'Arquivada'}</span>
                          <span>{new Date(history.date).toLocaleDateString('pt-PT')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <AccountForm
          account={editingAccount}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};