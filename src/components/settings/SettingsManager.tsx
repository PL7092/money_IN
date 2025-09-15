import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Globe, Brain, Key, Eye, EyeOff } from 'lucide-react';
import { DatabaseManager } from './DatabaseManager';

export const SettingsManager = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Utilizador Demo',
      email: 'demo@financas.com',
      phone: '',
      avatar: ''
    },
    notifications: {
      budgetAlerts: true,
      transactionNotifications: true,
      monthlyReports: true,
      expiredDocuments: true,
      emailNotifications: true,
      pushNotifications: false
    },
    preferences: {
      currency: 'EUR',
      language: 'pt-PT',
      dateFormat: 'dd/mm/yyyy',
      theme: 'light',
      defaultAccount: '1'
    },
    security: {
      twoFactorAuth: false,
      biometricAuth: false,
      sessionTimeout: 30,
      backupEnabled: true
    },
    aiApis: {
      gemini: {
        enabled: false,
        apiKey: '',
        model: 'gemini-pro',
        maxTokens: 1000,
        temperature: 0.7
      },
      openai: {
        enabled: false,
        apiKey: '',
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7
      },
      defaultProvider: 'gemini',
      features: {
        categorization: true,
        advisor: true,
        predictions: true,
        insights: true
      }
    }
  });

  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    openai: false
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'preferences', label: 'Preferências', icon: Palette },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'ai-apis', label: 'APIs de AI', icon: Brain },
    { id: 'database', label: 'Base de Dados', icon: Settings },
  ];

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const toggleApiKeyVisibility = (provider: 'gemini' | 'openai') => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const testApiConnection = async (provider: 'gemini' | 'openai') => {
    // Simulate API test
    console.log(`Testing ${provider} API connection...`);
    // In a real app, this would make a test call to the API
    alert(`Teste de conexão ${provider.toUpperCase()} simulado com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 text-gray-600" size={32} />
            Configurações
          </h1>
          <p className="text-gray-600">Personalize a sua experiência financeira</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Informações do Perfil</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={settings.profile.phone}
                  onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                  placeholder="+351 xxx xxx xxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Alterar Foto
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-3">
                Guardar Alterações
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Preferências de Notificações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Alertas de Orçamento</h4>
                  <p className="text-sm text-gray-600">Receber alertas quando orçamentos atingem 80%</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.budgetAlerts}
                    onChange={(e) => updateSetting('notifications', 'budgetAlerts', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications.budgetAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.budgetAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificações de Transações</h4>
                  <p className="text-sm text-gray-600">Notificar sobre novas transações</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.transactionNotifications}
                    onChange={(e) => updateSetting('notifications', 'transactionNotifications', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications.transactionNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.transactionNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Relatórios Mensais</h4>
                  <p className="text-sm text-gray-600">Receber resumo mensal por email</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.monthlyReports}
                    onChange={(e) => updateSetting('notifications', 'monthlyReports', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications.monthlyReports ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.monthlyReports ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Documentos Expirados</h4>
                  <p className="text-sm text-gray-600">Alertar sobre seguros e garantias a expirar</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.expiredDocuments}
                    onChange={(e) => updateSetting('notifications', 'expiredDocuments', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications.expiredDocuments ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.expiredDocuments ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Preferências do Sistema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moeda Padrão
                </label>
                <select
                  value={settings.preferences.currency}
                  onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="GBP">Libra (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pt-PT">Português (PT)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español (ES)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato de Data
                </label>
                <select
                  value={settings.preferences.dateFormat}
                  onChange={(e) => updateSetting('preferences', 'dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dd/mm/yyyy">DD/MM/AAAA</option>
                  <option value="mm/dd/yyyy">MM/DD/AAAA</option>
                  <option value="yyyy-mm-dd">AAAA-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tema
                </label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configurações de Segurança</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</h4>
                  <p className="text-sm text-gray-600">Adicionar uma camada extra de segurança</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Autenticação Biométrica</h4>
                  <p className="text-sm text-gray-600">Usar impressão digital ou Face ID</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.biometricAuth}
                    onChange={(e) => updateSetting('security', 'biometricAuth', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.security.biometricAuth ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.security.biometricAuth ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout da Sessão (minutos)
                </label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Ações de Segurança</h4>
                <div className="space-y-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Alterar Palavra-passe
                  </button>
                  <br />
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver Dispositivos Conectados
                  </button>
                  <br />
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Terminar Todas as Sessões
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-apis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Configuração de APIs de Inteligência Artificial</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Fornecedor Padrão:</span>
                <select
                  value={settings.aiApis.defaultProvider}
                  onChange={(e) => updateSetting('aiApis', 'defaultProvider', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>
            </div>

            {/* Gemini Configuration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Google Gemini</h4>
                    <p className="text-sm text-gray-600">API do Google para processamento de linguagem natural</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.aiApis.gemini.enabled}
                    onChange={(e) => updateSetting('aiApis', 'gemini', { ...settings.aiApis.gemini, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.aiApis.gemini.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.aiApis.gemini.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              {settings.aiApis.gemini.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Key size={16} className="inline mr-1" />
                      Chave da API *
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys.gemini ? 'text' : 'password'}
                        value={settings.aiApis.gemini.apiKey}
                        onChange={(e) => updateSetting('aiApis', 'gemini', { ...settings.aiApis.gemini, apiKey: e.target.value })}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Insira a sua chave da API do Gemini"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility('gemini')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showApiKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => testApiConnection('gemini')}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          disabled={!settings.aiApis.gemini.apiKey}
                        >
                          Testar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modelo
                      </label>
                      <select
                        value={settings.aiApis.gemini.model}
                        onChange={(e) => updateSetting('aiApis', 'gemini', { ...settings.aiApis.gemini, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gemini-pro-vision">Gemini Pro Vision</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={settings.aiApis.gemini.maxTokens}
                        onChange={(e) => updateSetting('aiApis', 'gemini', { ...settings.aiApis.gemini, maxTokens: parseInt(e.target.value) })}
                        min="100"
                        max="4000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature
                      </label>
                      <input
                        type="number"
                        value={settings.aiApis.gemini.temperature}
                        onChange={(e) => updateSetting('aiApis', 'gemini', { ...settings.aiApis.gemini, temperature: parseFloat(e.target.value) })}
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OpenAI Configuration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-2 mr-3">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">OpenAI</h4>
                    <p className="text-sm text-gray-600">API da OpenAI para GPT e outros modelos</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.aiApis.openai.enabled}
                    onChange={(e) => updateSetting('aiApis', 'openai', { ...settings.aiApis.openai, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.aiApis.openai.enabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.aiApis.openai.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              {settings.aiApis.openai.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Key size={16} className="inline mr-1" />
                      Chave da API *
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKeys.openai ? 'text' : 'password'}
                        value={settings.aiApis.openai.apiKey}
                        onChange={(e) => updateSetting('aiApis', 'openai', { ...settings.aiApis.openai, apiKey: e.target.value })}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Insira a sua chave da API da OpenAI"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility('openai')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showApiKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => testApiConnection('openai')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          disabled={!settings.aiApis.openai.apiKey}
                        >
                          Testar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modelo
                      </label>
                      <select
                        value={settings.aiApis.openai.model}
                        onChange={(e) => updateSetting('aiApis', 'openai', { ...settings.aiApis.openai, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={settings.aiApis.openai.maxTokens}
                        onChange={(e) => updateSetting('aiApis', 'openai', { ...settings.aiApis.openai, maxTokens: parseInt(e.target.value) })}
                        min="100"
                        max="4000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature
                      </label>
                      <input
                        type="number"
                        value={settings.aiApis.openai.temperature}
                        onChange={(e) => updateSetting('aiApis', 'openai', { ...settings.aiApis.openai, temperature: parseFloat(e.target.value) })}
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Features Configuration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Funcionalidades de AI Ativas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Categorização Automática</h5>
                    <p className="text-sm text-gray-600">Classificar transações automaticamente</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.aiApis.features.categorization}
                      onChange={(e) => updateSetting('aiApis', 'features', { ...settings.aiApis.features, categorization: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.aiApis.features.categorization ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.aiApis.features.categorization ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Conselheiro Financeiro</h5>
                    <p className="text-sm text-gray-600">Recomendações personalizadas</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.aiApis.features.advisor}
                      onChange={(e) => updateSetting('aiApis', 'features', { ...settings.aiApis.features, advisor: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.aiApis.features.advisor ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.aiApis.features.advisor ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Previsões Financeiras</h5>
                    <p className="text-sm text-gray-600">Projeções de gastos e receitas</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.aiApis.features.predictions}
                      onChange={(e) => updateSetting('aiApis', 'features', { ...settings.aiApis.features, predictions: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.aiApis.features.predictions ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.aiApis.features.predictions ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Insights Inteligentes</h5>
                    <p className="text-sm text-gray-600">Análises automáticas de padrões</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.aiApis.features.insights}
                      onChange={(e) => updateSetting('aiApis', 'features', { ...settings.aiApis.features, insights: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.aiApis.features.insights ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.aiApis.features.insights ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Estatísticas de Uso (Este Mês)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-gray-600">Categorizações</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">89</p>
                  <p className="text-sm text-gray-600">Consultas ao Conselheiro</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">€12.50</p>
                  <p className="text-sm text-gray-600">Custo Estimado</p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-blue-900 mb-3">Como Obter as Chaves da API</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-blue-800">Google Gemini:</h5>
                  <p className="text-sm text-blue-700">
                    1. Aceda a <a href="https://makersuite.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a><br/>
                    2. Crie um novo projeto ou selecione um existente<br/>
                    3. Gere uma nova chave da API<br/>
                    4. Copie e cole a chave no campo acima
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800">OpenAI:</h5>
                  <p className="text-sm text-blue-700">
                    1. Aceda a <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">OpenAI Platform</a><br/>
                    2. Faça login na sua conta<br/>
                    3. Clique em "Create new secret key"<br/>
                    4. Copie e cole a chave no campo acima
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <DatabaseManager />
        )}

        {/* Save Button for all tabs except profile (which has its own) */}
        {activeTab !== 'profile' && activeTab !== 'database' && (
          <div className="pt-6 border-t">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Guardar Configurações
            </button>
          </div>
        )}
      </div>
    </div>
  );
};