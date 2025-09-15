import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, CheckCircle, Clock, Pause, Edit, Trash2, DollarSign } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { SavingsGoalForm } from './SavingsGoalForm';
import { SavingsTransactionForm } from './SavingsTransactionForm';

export const SavingsManager = () => {
  const { savingsGoals, deleteSavingsGoal, updateSavingsGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const activeGoals = savingsGoals.filter(g => g.status === 'active');
  const completedGoals = savingsGoals.filter(g => g.status === 'completed');
  const pausedGoals = savingsGoals.filter(g => g.status === 'paused');

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const monthlyContributions = activeGoals.reduce((sum, goal) => sum + (goal.monthlyContribution || 0), 0);

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este objetivo de poupança?')) {
      deleteSavingsGoal(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'paused') => {
    updateSavingsGoal(id, { status: newStatus });
  };

  const handleAddTransaction = (goal: any) => {
    setSelectedGoal(goal);
    setShowTransactionForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleTransactionFormClose = () => {
    setShowTransactionForm(false);
    setSelectedGoal(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'paused': return Pause;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'paused': return 'yellow';
      default: return 'blue';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'vacation': return '✈️';
      case 'house': return '🏠';
      case 'car': return '🚗';
      case 'education': return '🎓';
      case 'retirement': return '👴';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  const getDisplayGoals = () => {
    switch (activeTab) {
      case 'completed': return completedGoals;
      case 'paused': return pausedGoals;
      default: return activeGoals;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Poupanças por Objetivos</h1>
          <p className="text-gray-600">Defina e acompanhe as suas metas financeiras</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo Objetivo
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Objetivos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Poupado</p>
              <p className="text-2xl font-bold text-gray-900">€{totalSaved.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Meta Total</p>
              <p className="text-2xl font-bold text-gray-900">€{totalTarget.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-lg p-3 mr-4">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contribuição Mensal</p>
              <p className="text-2xl font-bold text-gray-900">€{monthlyContributions.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {totalTarget > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso Geral</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">€{totalSaved.toFixed(2)} de €{totalTarget.toFixed(2)}</span>
              <span className="text-sm font-medium text-blue-600">
                {((totalSaved / totalTarget) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock size={18} className="mr-2" />
            Ativos ({activeGoals.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle size={18} className="mr-2" />
            Concluídos ({completedGoals.length})
          </button>
          <button
            onClick={() => setActiveTab('paused')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'paused'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Pause size={18} className="mr-2" />
            Pausados ({pausedGoals.length})
          </button>
        </nav>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {getDisplayGoals().length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'active' && 'Nenhum objetivo ativo'}
              {activeTab === 'completed' && 'Nenhum objetivo concluído'}
              {activeTab === 'paused' && 'Nenhum objetivo pausado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'active' && 'Crie o seu primeiro objetivo de poupança para começar'}
              {activeTab === 'completed' && 'Os objetivos concluídos aparecerão aqui'}
              {activeTab === 'paused' && 'Os objetivos pausados aparecerão aqui'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeiro Objetivo
              </button>
            )}
          </div>
        ) : (
          getDisplayGoals().map((goal) => {
            const StatusIcon = getStatusIcon(goal.status);
            const statusColor = getStatusColor(goal.status);
            const priorityColor = getPriorityColor(goal.priority);
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0 && goal.status === 'active';

            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div className="text-3xl mr-4 mt-1">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">{goal.name}</h3>
                        <div className={`flex items-center px-2 py-1 rounded-full bg-${statusColor}-100 text-${statusColor}-800 text-xs font-medium mr-2`}>
                          <StatusIcon size={12} className="mr-1" />
                          {goal.status === 'active' ? 'Ativo' : goal.status === 'completed' ? 'Concluído' : 'Pausado'}
                        </div>
                        <div className={`w-2 h-2 rounded-full bg-${priorityColor}-500`} title={`Prioridade ${goal.priority}`}></div>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Meta: {new Date(goal.targetDate).toLocaleDateString('pt-PT')}</span>
                        {goal.status === 'active' && (
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {isOverdue ? `${Math.abs(daysLeft)} dias em atraso` : `${daysLeft} dias restantes`}
                          </span>
                        )}
                        {goal.monthlyContribution && (
                          <span>€{goal.monthlyContribution}/mês</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {goal.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAddTransaction(goal)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          + Adicionar
                        </button>
                        <button
                          onClick={() => handleStatusChange(goal.id, 'paused')}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Pausar objetivo"
                        >
                          <Pause size={16} />
                        </button>
                      </>
                    )}
                    {goal.status === 'paused' && (
                      <button
                        onClick={() => handleStatusChange(goal.id, 'active')}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Reativar
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      €{goal.currentAmount.toFixed(2)} / €{goal.targetAmount.toFixed(2)}
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Marcos</h4>
                  <div className="flex space-x-2">
                    {goal.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`flex-1 p-2 rounded text-center text-xs ${
                          milestone.achievedAt
                            ? 'bg-green-100 text-green-800'
                            : goal.currentAmount >= milestone.amount
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <div className="font-medium">{milestone.percentage}%</div>
                        <div>€{milestone.amount.toFixed(0)}</div>
                        {milestone.achievedAt && (
                          <div className="text-xs mt-1">
                            ✓ {new Date(milestone.achievedAt).toLocaleDateString('pt-PT')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                {goal.transactions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Últimas Transações</h4>
                    <div className="space-y-1">
                      {goal.transactions.slice(-3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{transaction.description}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                            </span>
                            <span className="text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
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

      {/* Form Modals */}
      {showForm && (
        <SavingsGoalForm
          goal={editingGoal}
          onClose={handleFormClose}
        />
      )}

      {showTransactionForm && selectedGoal && (
        <SavingsTransactionForm
          goal={selectedGoal}
          onClose={handleTransactionFormClose}
        />
      )}
    </div>
  );
};