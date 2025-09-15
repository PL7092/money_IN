import React, { useState } from 'react';
import { Plus, Repeat, Calendar, ToggleLeft, ToggleRight, Edit, Trash2, TrendingUp, AlertTriangle, CheckCircle, Target, BarChart3 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { RecurringForm } from './RecurringForm';

export const RecurringManager = () => {
  const { 
    recurringTransactions, 
    updateRecurringTransaction, 
    deleteRecurringTransaction,
    getRecurringRecommendations,
    updateRecurringBudgetIntegration
  } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for demonstration since we don't have recurring transactions in context yet
  const mockRecurringTransactions = [
    {
      id: '1',
      name: 'Salário Mensal',
      amount: 2800,
      expectedAmount: 2800,
      maxAcceptableAmount: 3000,
      minAcceptableAmount: 2700,
      type: 'income',
      category: 'Salário',
      subcategory: 'Salário Base',
      account: '1',
      frequency: 'monthly',
      nextDate: '2024-02-01',
      active: true,
      autoIncludeInBudget: false,
      alertOnVariation: true,
      variationThreshold: 5,
      history: [
        { id: '1', transactionId: 't1', amount: 2800, date: '2024-01-01', variance: 0, variancePercentage: 0 },
        { id: '2', transactionId: 't2', amount: 2850, date: '2023-12-01', variance: 50, variancePercentage: 1.8 },
        { id: '3', transactionId: 't3', amount: 2780, date: '2023-11-01', variance: -20, variancePercentage: -0.7 },
        { id: '4', transactionId: 't4', amount: 2900, date: '2023-10-01', variance: 100, variancePercentage: 3.6 },
        { id: '5', transactionId: 't5', amount: 2800, date: '2023-09-01', variance: 0, variancePercentage: 0 },
        { id: '6', transactionId: 't6', amount: 2820, date: '2023-08-01', variance: 20, variancePercentage: 0.7 }
      ],
      statistics: {
        averageAmount: 2825,
        lastSixMonthsAverage: 2825,
        totalVariance: 190,
        timesOverExpected: 3,
        timesUnderExpected: 1
      }
    },
    {
      id: '2',
      name: 'Renda da Casa',
      amount: 750,
      expectedAmount: 750,
      maxAcceptableAmount: 800,
      type: 'expense',
      category: 'Habitação',
      subcategory: 'Renda',
      account: '1',
      frequency: 'monthly',
      nextDate: '2024-01-28',
      active: true,
      autoIncludeInBudget: true,
      alertOnVariation: true,
      variationThreshold: 10,
      history: [
        { id: '1', transactionId: 't7', amount: 750, date: '2024-01-01', variance: 0, variancePercentage: 0 },
        { id: '2', transactionId: 't8', amount: 750, date: '2023-12-01', variance: 0, variancePercentage: 0 },
        { id: '3', transactionId: 't9', amount: 780, date: '2023-11-01', variance: 30, variancePercentage: 4.0 },
        { id: '4', transactionId: 't10', amount: 750, date: '2023-10-01', variance: 0, variancePercentage: 0 }
      ],
      statistics: {
        averageAmount: 757.5,
        lastSixMonthsAverage: 757.5,
        totalVariance: 30,
        timesOverExpected: 1,
        timesUnderExpected: 0
      }
    },
    {
      id: '3',
      name: 'Netflix',
      amount: 15.99,
      expectedAmount: 15.99,
      maxAcceptableAmount: 20,
      type: 'expense',
      category: 'Entretenimento',
      subcategory: 'Streaming',
      account: '1',
      frequency: 'monthly',
      nextDate: '2024-02-15',
      active: true,
      autoIncludeInBudget: true,
      alertOnVariation: false,
      variationThreshold: 15,
      history: [
        { id: '1', transactionId: 't11', amount: 15.99, date: '2024-01-15', variance: 0, variancePercentage: 0 },
        { id: '2', transactionId: 't12', amount: 17.99, date: '2023-12-15', variance: 2, variancePercentage: 12.5 },
        { id: '3', transactionId: 't13', amount: 15.99, date: '2023-11-15', variance: 0, variancePercentage: 0 }
      ],
      statistics: {
        averageAmount: 16.66,
        lastSixMonthsAverage: 16.66,
        totalVariance: 2,
        timesOverExpected: 1,
        timesUnderExpected: 0,
        lastRecommendationDate: '2024-01-01'
      }
    }
  ];

  const activeRecurring = mockRecurringTransactions.filter(t => t.active);
  const totalMonthlyIncome = activeRecurring
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.expectedAmount, 0);
  const totalMonthlyExpenses = activeRecurring
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.expectedAmount, 0);

  const recommendations = [
    {
      recurringId: '3',
      type: 'update_expected',
      message: 'Netflix: Valor médio (€16.66) difere do esperado (€15.99). Atualizar?',
      suggestedValue: 16.66
    }
  ];

  const toggleActive = (id: string, currentStatus: boolean) => {
    console.log(`Toggle ${id} to ${!currentStatus}`);
  };

  const handleEdit = (recurring: any) => {
    setEditingRecurring(recurring);
    setShowForm(true);
  };

  const handleViewDetails = (recurring: any) => {
    setSelectedRecurring(recurring);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecurring(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedRecurring(null);
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

  const getVarianceStatus = (variance: number, threshold: number) => {
    const absVariance = Math.abs(variance);
    if (absVariance > threshold) return { status: 'high', color: 'red' };
    if (absVariance > threshold * 0.5) return { status: 'medium', color: 'yellow' };
    return { status: 'low', color: 'green' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos Recorrentes</h1>
          <p className="text-gray-600">Gerencie receitas e despesas automáticas com análise de evolução</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas Esperadas</p>
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
              <p className="text-sm text-gray-600">Despesas Esperadas</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-lg p-3 mr-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recomendações</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle size={20} className="text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-900">Recomendações Inteligentes</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 mb-2">{rec.message}</p>
                    {rec.suggestedValue && (
                      <p className="text-sm font-medium text-yellow-900">
                        Valor sugerido: €{rec.suggestedValue.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                      Aplicar
                    </button>
                    <button className="px-3 py-1 text-sm border border-yellow-600 text-yellow-600 rounded hover:bg-yellow-50 transition-colors">
                      Ignorar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Transações</h3>
        <div className="space-y-3">
          {mockRecurringTransactions
            .filter(t => t.active)
            .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
            .slice(0, 5)
            .map((transaction) => {
              const variance = transaction.statistics.lastSixMonthsAverage - transaction.expectedAmount;
              const variancePercentage = transaction.expectedAmount > 0 ? (variance / transaction.expectedAmount) * 100 : 0;
              const varianceStatus = getVarianceStatus(variancePercentage, transaction.variationThreshold);
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => handleViewDetails(transaction)}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{transaction.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{getFrequencyLabel(transaction.frequency)}</span>
                        <span>• {transaction.category}</span>
                        {transaction.subcategory && <span>• {transaction.subcategory}</span>}
                        <div className={`flex items-center px-2 py-1 rounded-full bg-${varianceStatus.color}-100`}>
                          <span className={`text-xs font-medium text-${varianceStatus.color}-800`}>
                            Variação: {variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}€{transaction.expectedAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.nextDate).toLocaleDateString('pt-PT')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Média: €{transaction.statistics.lastSixMonthsAverage.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* All Recurring Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Todas as Recorrências</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockRecurringTransactions.map((transaction) => {
            const variance = transaction.statistics.lastSixMonthsAverage - transaction.expectedAmount;
            const variancePercentage = transaction.expectedAmount > 0 ? (variance / transaction.expectedAmount) * 100 : 0;
            const varianceStatus = getVarianceStatus(variancePercentage, transaction.variationThreshold);
            
            return (
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
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">{transaction.name}</h4>
                        {transaction.autoIncludeInBudget && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Auto-Orçamento
                          </span>
                        )}
                        <div className={`flex items-center px-2 py-1 rounded-full bg-${varianceStatus.color}-100`}>
                          <span className={`text-xs font-medium text-${varianceStatus.color}-800`}>
                            Variação: {variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{transaction.category}</span>
                        {transaction.subcategory && <span className="text-sm text-gray-600">• {transaction.subcategory}</span>}
                        <span className="text-sm text-gray-600">
                          {getFrequencyLabel(transaction.frequency)}
                        </span>
                        <span className="text-sm text-gray-600">
                          Próximo: {new Date(transaction.nextDate).toLocaleDateString('pt-PT')}
                        </span>
                        <span className="text-sm text-gray-600">
                          {transaction.history.length} registos
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Esperado: €{transaction.expectedAmount.toFixed(2)}</span>
                        <span>Média 6M: €{transaction.statistics.lastSixMonthsAverage.toFixed(2)}</span>
                        {transaction.maxAcceptableAmount && (
                          <span>Máx: €{transaction.maxAcceptableAmount.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}€{transaction.expectedAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Real: €{transaction.statistics.lastSixMonthsAverage.toFixed(2)}
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
                      <button 
                        onClick={() => handleViewDetails(transaction)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Ver detalhes e evolução"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed View Modal */}
      {showDetails && selectedRecurring && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="mr-2 text-purple-600" size={24} />
                Evolução: {selectedRecurring.name}
              </h2>
              <button
                onClick={handleDetailsClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">€{selectedRecurring.expectedAmount.toFixed(2)}</p>
                  <p className="text-sm text-blue-700">Valor Esperado</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">€{selectedRecurring.statistics.lastSixMonthsAverage.toFixed(2)}</p>
                  <p className="text-sm text-green-700">Média 6 Meses</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedRecurring.history.length}</p>
                  <p className="text-sm text-purple-700">Total Registos</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">€{selectedRecurring.statistics.totalVariance.toFixed(2)}</p>
                  <p className="text-sm text-orange-700">Variação Total</p>
                </div>
              </div>

              {/* Evolution Chart */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Evolução dos Valores</h4>
                <div className="h-64 flex items-end justify-between px-4">
                  {selectedRecurring.history.slice(-12).map((entry, index) => {
                    const maxAmount = Math.max(...selectedRecurring.history.map(h => h.amount));
                    const height = (entry.amount / maxAmount) * 100;
                    const isOverExpected = entry.amount > selectedRecurring.expectedAmount;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="w-full flex justify-center mb-2">
                          <div
                            className={`w-6 rounded-t-sm transition-all hover:opacity-80 ${
                              isOverExpected ? 'bg-red-400' : 'bg-green-400'
                            }`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`€${entry.amount.toFixed(2)} em ${new Date(entry.date).toLocaleDateString('pt-PT')}`}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium transform -rotate-45 origin-center">
                          {new Date(entry.date).toLocaleDateString('pt-PT', { month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex justify-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded mr-2" />
                    <span className="text-sm text-gray-600">Dentro do esperado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded mr-2" />
                    <span className="text-sm text-gray-600">Acima do esperado</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 mx-2" />
                  <span className="text-sm text-gray-600">
                    Linha esperada: €{selectedRecurring.expectedAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Histórico Detalhado</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Real</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Esperado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variação</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedRecurring.history.slice(-10).reverse().map((entry) => {
                        const varianceStatus = getVarianceStatus(entry.variancePercentage, selectedRecurring.variationThreshold);
                        
                        return (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(entry.date).toLocaleDateString('pt-PT')}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              €{entry.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              €{selectedRecurring.expectedAmount.toFixed(2)}
                            </td>
                            <td className={`px-4 py-3 text-sm font-medium ${
                              entry.variance >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {entry.variance >= 0 ? '+' : ''}€{entry.variance.toFixed(2)}
                            </td>
                            <td className={`px-4 py-3 text-sm font-medium ${
                              entry.variancePercentage >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {entry.variancePercentage >= 0 ? '+' : ''}{entry.variancePercentage.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${varianceStatus.color}-100 text-${varianceStatus.color}-800`}>
                                {varianceStatus.status === 'high' ? 'Alta' : 
                                 varianceStatus.status === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Configurações</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Limite de Variação:</span>
                      <span className="font-medium">±{selectedRecurring.variationThreshold}%</span>
                    </div>
                    {selectedRecurring.maxAcceptableAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Máximo:</span>
                        <span className="font-medium">€{selectedRecurring.maxAcceptableAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedRecurring.minAcceptableAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Mínimo:</span>
                        <span className="font-medium">€{selectedRecurring.minAcceptableAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alertas:</span>
                      <span className="font-medium">{selectedRecurring.alertOnVariation ? 'Ativados' : 'Desativados'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Estatísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vezes acima esperado:</span>
                      <span className="font-medium text-red-600">{selectedRecurring.statistics.timesOverExpected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vezes abaixo esperado:</span>
                      <span className="font-medium text-green-600">{selectedRecurring.statistics.timesUnderExpected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Variação total acumulada:</span>
                      <span className="font-medium">€{selectedRecurring.statistics.totalVariance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <RecurringForm
          recurring={editingRecurring}
          onClose={handleFormClose}
        />
      )}

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">Funcionalidades Inteligentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">📊 Análise de Evolução</h4>
            <p className="text-sm text-purple-700">
              Acompanhe como os valores reais comparam com os esperados ao longo do tempo
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">🔔 Alertas Inteligentes</h4>
            <p className="text-sm text-purple-700">
              Receba notificações quando valores ultrapassam limites ou padrões mudam
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">🎯 Integração Orçamental</h4>
            <p className="text-sm text-purple-700">
              Pagamentos recorrentes são automaticamente incluídos nos orçamentos mensais
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};