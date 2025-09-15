import React, { useState } from 'react';
import { Brain, MessageSquare, TrendingUp, Target, AlertTriangle, Lightbulb } from 'lucide-react';

export const AIAdvisor = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'ai',
      message: 'Olá! Sou o seu conselheiro financeiro inteligente. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }
  ]);

  const insights = [
    {
      type: 'savings',
      icon: TrendingUp,
      title: 'Oportunidade de Poupança',
      description: 'Pode poupar €120/mês reduzindo despesas com entretenimento',
      action: 'Ver detalhes',
      priority: 'high'
    },
    {
      type: 'budget',
      icon: Target,
      title: 'Meta de Orçamento',
      description: 'Está 15% abaixo do orçamento de alimentação este mês',
      action: 'Ajustar orçamento',
      priority: 'medium'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Alerta de Gasto',
      description: 'Gasto atípico detetado: €350 em compras online',
      action: 'Rever transações',
      priority: 'high'
    },
    {
      type: 'tip',
      icon: Lightbulb,
      title: 'Dica de Investimento',
      description: 'Considere investir o excesso de €500 em poupança',
      action: 'Explorar opções',
      priority: 'low'
    }
  ];

  const financialGoals = [
    {
      id: 1,
      title: 'Fundo de Emergência',
      target: 5000,
      current: 3200,
      timeline: '6 meses',
      aiRecommendation: 'Aumente a poupança mensal em €300 para atingir o objetivo'
    },
    {
      id: 2,
      title: 'Entrada para Casa',
      target: 25000,
      current: 12000,
      timeline: '2 anos',
      aiRecommendation: 'Considere investir 60% em fundos de baixo risco'
    }
  ];

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      type: 'user',
      message: chatMessage,
      timestamp: new Date()
    };

    // Mock AI response
    const aiResponse = {
      type: 'ai',
      message: generateAIResponse(chatMessage),
      timestamp: new Date()
    };

    setChatHistory([...chatHistory, userMessage, aiResponse]);
    setChatMessage('');
  };

  const generateAIResponse = (message: string) => {
    const responses = [
      'Com base no seu histórico, recomendo reduzir despesas em entretenimento em 20% e aumentar a poupança.',
      'Analisando os seus padrões de gasto, identifico uma oportunidade de otimização no orçamento de transporte.',
      'Considerando os seus objetivos financeiros, sugiro diversificar os investimentos para reduzir riscos.',
      'Baseado na sua situação atual, seria prudente criar um fundo de emergência equivalente a 6 meses de despesas.',
      'Os dados indicam que pode melhorar o fluxo de caixa reorganizando os pagamentos recorrentes.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-3 text-purple-600" size={32} />
            Conselheiro Financeiro AI
          </h1>
          <p className="text-gray-600">Insights personalizados e recomendações inteligentes</p>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const priorityColor = getPriorityColor(insight.priority);
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`bg-${priorityColor}-100 rounded-lg p-2 mr-3`}>
                    <Icon className={`w-5 h-5 text-${priorityColor}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <button className={`text-sm font-medium text-${priorityColor}-600 hover:text-${priorityColor}-700`}>
                      {insight.action} →
                    </button>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full bg-${priorityColor}-500`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Goals Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Metas Financeiras</h3>
        <div className="space-y-4">
          {financialGoals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            
            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <p className="text-sm text-gray-600">Meta: {goal.timeline}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">€{goal.current.toLocaleString()} / €{goal.target.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{progress.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Recomendação AI:</strong> {goal.aiRecommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="mr-2" size={20} />
            Chat com Conselheiro AI
          </h3>
        </div>
        
        <div className="p-6">
          <div className="h-64 overflow-y-auto mb-4 space-y-3">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    chat.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{chat.message}</p>
                  <p className={`text-xs mt-1 ${
                    chat.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {chat.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Faça uma pergunta sobre as suas finanças..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Previsões Financeiras</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Próximo Mês</h4>
            <p className="text-2xl font-bold text-purple-600">€2,450</p>
            <p className="text-sm text-purple-700">Despesas previstas</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Poupança Potencial</h4>
            <p className="text-2xl font-bold text-purple-600">€380</p>
            <p className="text-sm text-purple-700">Com otimizações</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Meta Anual</h4>
            <p className="text-2xl font-bold text-purple-600">87%</p>
            <p className="text-sm text-purple-700">Probabilidade de sucesso</p>
          </div>
        </div>
      </div>
    </div>
  );
};