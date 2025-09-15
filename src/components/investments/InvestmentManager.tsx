import React from 'react';
import { TrendingUp, DollarSign, PieChart, Calendar, Plus, Edit, RefreshCw, AlertCircle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentValueUpdate } from './InvestmentValueUpdate';

export const InvestmentManager = () => {
  const { getInvestmentAccounts, getInvestmentPerformance } = useFinance();
  const [showForm, setShowForm] = React.useState(false);
  const [showValueUpdate, setShowValueUpdate] = React.useState(false);
  const [editingInvestment, setEditingInvestment] = React.useState(null);
  const [selectedInvestment, setSelectedInvestment] = React.useState(null);

  const investments = getInvestmentAccounts();
  const performance = getInvestmentPerformance();

  const getInvestmentTypeLabel = (type: string) => {
    const types = {
      stocks: 'Ações',
      bonds: 'Obrigações',
      etf: 'ETF',
      crypto: 'Criptomoedas',
      real_estate: 'Imobiliário',
      commodities: 'Commodities',
      other: 'Outro'
    };
    return types[type] || type;
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleUpdateValue = (investment: any) => {
    setSelectedInvestment(investment);
    setShowValueUpdate(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInvestment(null);
  };

  const handleValueUpdateClose = () => {
    setShowValueUpdate(false);
    setSelectedInvestment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Investimentos</h1>
          <p className="text-gray-600">Acompanhe o desempenho dos seus investimentos</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo Investimento
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Atual</p>
              <p className="text-2xl font-bold text-gray-900">€{performance.currentValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Investido</p>
              <p className="text-2xl font-bold text-gray-900">€{performance.totalInvested.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`${performance.totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg p-3 mr-4`}>
              <TrendingUp className={`w-6 h-6 ${performance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Retorno Total</p>
              <p className={`text-2xl font-bold ${performance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{performance.totalReturn.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`${performance.returnPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg p-3 mr-4`}>
              <div className={`w-6 h-6 rounded ${performance.returnPercentage >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Retorno %</p>
              <p className={`text-2xl font-bold ${performance.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performance.returnPercentage >= 0 ? '+' : ''}{performance.returnPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Portfolio</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de evolução (em desenvolvimento)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Tipo</h3>
          <div className="h-64">
            {investments.length > 0 ? (
              <div className="space-y-3">
                {investments.map((investment) => {
                  const percentage = performance.currentValue > 0 ? (investment.balance / performance.currentValue) * 100 : 0;
                  return (
                    <div key={investment.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: investment.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {getInvestmentTypeLabel(investment.investmentType || 'other')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          €{investment.balance.toFixed(0)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Nenhum investimento encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Carteira de Investimentos</h3>
        </div>
        
        {investments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum investimento encontrado</h3>
            <p className="text-gray-600 mb-4">
              Crie contas de investimento para acompanhar o desempenho dos seus investimentos
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Criar Primeiro Investimento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {investments.map((investment) => {
              const returnValue = investment.balance - investment.initialBalance;
              const returnPercentage = investment.initialBalance > 0 ? (returnValue / investment.initialBalance) * 100 : 0;
              const details = investment.investmentDetails;
              
              return (
                <div key={investment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="rounded-lg p-3 mr-4"
                        style={{ backgroundColor: investment.color + '20' }}
                      >
                        <TrendingUp 
                          className="w-6 h-6"
                          style={{ color: investment.color }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{investment.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {getInvestmentTypeLabel(investment.investmentType || 'other')}
                          </span>
                          <span className="text-sm text-gray-600">{investment.institution}</span>
                          {details?.symbol && (
                            <span className="text-sm text-gray-600 font-mono">{details.symbol}</span>
                          )}
                          {details?.lastPriceUpdate && (
                            <span className="text-sm text-gray-600 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(details.lastPriceUpdate).toLocaleDateString('pt-PT')}
                            </span>
                          )}
                        </div>
                        {details && (
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            {details.quantity && details.currentPrice && (
                              <>
                                <span>{details.quantity} unidades</span>
                                <span>€{details.currentPrice.toFixed(2)}/unidade</span>
                                {details.averageCost && (
                                  <span>Custo médio: €{details.averageCost.toFixed(2)}</span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-6">
                          <div>
                            <p className="text-sm text-gray-600">Valor Atual</p>
                            <p className="font-semibold text-gray-900">€{investment.balance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Investido</p>
                            <p className="font-semibold text-gray-600">€{investment.initialBalance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Retorno</p>
                            <p className={`font-semibold ${
                              returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
                            </p>
                            <p className={`text-sm ${
                              returnValue >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {returnValue >= 0 ? '+' : ''}€{returnValue.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateValue(investment)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Atualizar valor"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(investment)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar investimento"
                        >
                          <Edit size={16} />
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

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Acções Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left">
            onClick={() => setShowForm(true)}
            <h4 className="font-medium">Adicionar Investimento</h4>
            <p className="text-sm text-blue-600">Registar novo investimento</p>
          </button>
          <button className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <h4 className="font-medium">Atualizar Valores</h4>
            <p className="text-sm text-blue-600">Sincronizar preços atuais</p>
          </button>
          <button className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <h4 className="font-medium">Relatório Performance</h4>
            <p className="text-sm text-blue-600">Análise detalhada</p>
          </button>
        </div>
      </div>

      {/* Form Modals */}
      {showForm && (
        <InvestmentForm
          investment={editingInvestment}
          onClose={handleFormClose}
        />
      )}

      {showValueUpdate && selectedInvestment && (
        <InvestmentValueUpdate
          investment={selectedInvestment}
          onClose={handleValueUpdateClose}
        />
      )}
    </div>
  );
};