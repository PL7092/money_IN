import React, { useState } from 'react';
import { BarChart3, Calendar, Download, TrendingUp, PieChart } from 'lucide-react';

export const ReportsManager = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('expenses');

  const reportTypes = [
    { id: 'expenses', label: 'Análise de Despesas', icon: BarChart3 },
    { id: 'income', label: 'Análise de Receitas', icon: TrendingUp },
    { id: 'budget', label: 'Performance Orçamental', icon: PieChart },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: Calendar },
  ];

  const periods = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
  ];

  const mockData = {
    totalIncome: 8400,
    totalExpenses: 6200,
    savings: 2200,
    topCategories: [
      { category: 'Alimentação', amount: 1850, percentage: 29.8 },
      { category: 'Transporte', amount: 1200, percentage: 19.4 },
      { category: 'Habitação', amount: 1100, percentage: 17.7 },
      { category: 'Entretenimento', amount: 800, percentage: 12.9 },
      { category: 'Saúde', amount: 650, percentage: 10.5 },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
          <p className="text-gray-600">Insights detalhados sobre as suas finanças</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download size={20} className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <Icon size={24} className={`mb-2 ${
                selectedReport === report.id ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <h3 className="font-medium">{report.label}</h3>
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receitas Totais</p>
              <p className="text-2xl font-bold text-green-600">€{mockData.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-green-600 font-medium">+12.3%</span>
            <span className="text-sm text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Despesas Totais</p>
              <p className="text-2xl font-bold text-red-600">€{mockData.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-red-600 font-medium">+8.7%</span>
            <span className="text-sm text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Poupança</p>
              <p className="text-2xl font-bold text-blue-600">€{mockData.savings.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-blue-600 font-medium">26.2%</span>
            <span className="text-sm text-gray-500 ml-1">da receita total</span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedReport === 'expenses' ? 'Evolução de Despesas' : 'Tendência de Receitas'}
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico interativo (em desenvolvimento)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categorias</h3>
          <div className="space-y-4">
            {mockData.topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3" 
                       style={{ backgroundColor: `hsl(${index * 72}, 70%, 50%)` }}></div>
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                  <span className="text-sm font-semibold text-gray-900">€{category.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise Detalhada</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">73.8%</p>
            <p className="text-sm text-gray-600">Taxa de Poupança</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">€920</p>
            <p className="text-sm text-gray-600">Média Mensal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">5.2%</p>
            <p className="text-sm text-gray-600">Crescimento YoY</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">€2.1k</p>
            <p className="text-sm text-gray-600">Maior Despesa</p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
          Insights Inteligentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">📈 Tendência Positiva</h4>
            <p className="text-sm text-blue-700">
              As suas despesas com alimentação diminuíram 15% este mês. Continue assim!
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Recomendação</h4>
            <p className="text-sm text-blue-700">
              Considere aumentar o orçamento de entretenimento baseado no padrão dos últimos 3 meses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};