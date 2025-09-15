import React from 'react';
import { TrendingUp, DollarSign, PieChart, Calendar } from 'lucide-react';

export const InvestmentManager = () => {
  // Mock investment data
  const investments = [
    {
      id: '1',
      name: 'ETF Global',
      type: 'ETF',
      value: 5000,
      invested: 4500,
      return: 11.11,
      returnValue: 500,
      lastUpdate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Ações Apple',
      type: 'Ações',
      value: 2800,
      invested: 3000,
      return: -6.67,
      returnValue: -200,
      lastUpdate: '2024-01-15'
    },
    {
      id: '3',
      name: 'Certificados de Tesouro',
      type: 'Obrigações',
      value: 1200,
      invested: 1000,
      return: 20.0,
      returnValue: 200,
      lastUpdate: '2024-01-15'
    }
  ];

  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const totalReturn = totalValue - totalInvested;
  const totalReturnPercent = (totalReturn / totalInvested) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Investimentos</h1>
          <p className="text-gray-600">Acompanhe o desempenho dos seus investimentos</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
          <TrendingUp size={20} className="mr-2" />
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
              <p className="text-2xl font-bold text-gray-900">€{totalValue.toFixed(2)}</p>
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
              <p className="text-2xl font-bold text-gray-900">€{totalInvested.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`${totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg p-3 mr-4`}>
              <TrendingUp className={`w-6 h-6 ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Retorno Total</p>
              <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{totalReturn.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`${totalReturnPercent >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg p-3 mr-4`}>
              <div className={`w-6 h-6 rounded ${totalReturnPercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Retorno %</p>
              <p className={`text-2xl font-bold ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
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
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de distribuição (em desenvolvimento)</p>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Carteira de Investimentos</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {investments.map((investment) => (
            <div key={investment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{investment.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">{investment.type}</span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(investment.lastUpdate).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-sm text-gray-600">Valor Actual</p>
                      <p className="font-semibold text-gray-900">€{investment.value.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Investido</p>
                      <p className="font-semibold text-gray-600">€{investment.invested.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Retorno</p>
                      <p className={`font-semibold ${
                        investment.return >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.return >= 0 ? '+' : ''}{investment.return.toFixed(2)}%
                      </p>
                      <p className={`text-sm ${
                        investment.returnValue >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.returnValue >= 0 ? '+' : ''}€{investment.returnValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Acções Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left">
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
    </div>
  );
};