import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { BalanceChart } from './charts/BalanceChart';
import { ExpensesByCategory } from './charts/ExpensesByCategory';
import { MonthlyTrend } from './charts/MonthlyTrend';
import { RecentTransactions } from './common/RecentTransactions';
import { BudgetOverview } from './common/BudgetOverview';
import { formatCurrencyPT, formatDateTimePT } from '../utils/dateUtils';

export const Dashboard = () => {
  const { 
    getTotalBalance, 
    getMonthlyIncome, 
    getMonthlyExpenses,
    savingsGoals,
    accounts,
    budgets,
    transactions 
  } = useFinance();

  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const netIncome = monthlyIncome - monthlyExpenses;
  const totalSavingsGoals = savingsGoals.filter(g => g.status === 'active').length;
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  const stats = [
    {
      title: 'Saldo Total',
      value: formatCurrencyPT(totalBalance),
      change: '+2.5%',
      changeType: 'positive' as const,
      icon: Wallet,
      color: 'bg-blue-500'
    },
    {
      title: 'Receitas (Mês)',
      value: formatCurrencyPT(monthlyIncome),
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Despesas (Mês)',
      value: formatCurrencyPT(monthlyExpenses),
      change: '-3.1%',
      changeType: 'positive' as const,
      icon: TrendingDown,
      color: 'bg-red-500'
    },
    {
      title: 'Resultado Líquido',
      value: formatCurrencyPT(netIncome),
      change: netIncome > 0 ? '+12.3%' : '-8.7%',
      changeType: netIncome > 0 ? 'positive' as const : 'negative' as const,
      icon: Target,
      color: netIncome > 0 ? 'bg-indigo-500' : 'bg-orange-500'
    }
  ];

  const alerts = [
    {
      type: 'warning',
      message: 'Orçamento de "Alimentação" excedeu 80% do limite',
      action: 'Ver Orçamentos'
    },
    {
      type: 'info',
      message: 'Seguro do veículo expira em 15 dias',
      action: 'Ver Ativos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas finanças pessoais</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Última atualização</p>
          <p className="text-sm font-medium">
            {formatDateTimePT(new Date())}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs. mês anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center mb-3">
            <AlertCircle size={20} className="text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Alertas e Notificações</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-yellow-700">{alert.message}</p>
                <button className="text-sm text-yellow-600 hover:text-yellow-800 font-medium">
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Saldo</h3>
          <BalanceChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
          <ExpensesByCategory />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência Mensal</h3>
          <MonthlyTrend />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orçamentos</h3>
          <BudgetOverview />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Objetivos de Poupança</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Objetivos Ativos</span>
              <span className="font-semibold text-blue-600">{totalSavingsGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Poupado</span>
              <span className="font-semibold text-green-600">€{totalSaved.toFixed(2)}</span>
            </div>
            {savingsGoals.filter(g => g.status === 'active').slice(0, 2).map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">{goal.name}</span>
                    <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todos os objetivos →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações Recentes</h3>
        <RecentTransactions />
      </div>
    </div>
  );
};