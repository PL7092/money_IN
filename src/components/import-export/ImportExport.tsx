import React, { useState } from 'react';
import { Upload, Download, FileText, FileSpreadsheet, File, CheckCircle, AlertCircle, Brain, Eye, Edit } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionImportWizard } from './TransactionImportWizard';

export const ImportExport = () => {
  const { accounts } = useFinance();
  const [activeTab, setActiveTab] = useState('import');
  const [showImportWizard, setShowImportWizard] = useState(false);

  const handleStartImport = () => {
    setShowImportWizard(true);
  };

  const supportedFormats = [
    {
      type: 'Excel',
      icon: FileSpreadsheet,
      extensions: '.xlsx, .xls',
      description: 'Ficheiros Excel com transações organizadas por colunas'
    },
    {
      type: 'CSV',
      icon: FileText,
      extensions: '.csv',
      description: 'Ficheiros CSV separados por vírgulas'
    },
    {
      type: 'PDF',
      icon: File,
      extensions: '.pdf',
      description: 'Extratos bancários em PDF (com OCR automático)',
      features: ['OCR inteligente', 'Detecção automática de padrões', 'Suporte multi-banco']
    },
    {
      type: 'Copy/Paste',
      icon: FileText,
      extensions: 'Texto',
      description: 'Cole dados diretamente do extrato online',
      features: ['Parsing inteligente', 'Detecção de formato', 'Limpeza automática']
    }
  ];

  const exportOptions = [
    {
      id: 'transactions',
      label: 'Todas as Transações',
      description: 'Exportar histórico completo de transações',
      formats: ['Excel', 'CSV', 'PDF']
    },
    {
      id: 'budgets',
      label: 'Relatório de Orçamentos',
      description: 'Performance de orçamentos e análise de gastos',
      formats: ['Excel', 'PDF']
    },
    {
      id: 'investments',
      label: 'Portfolio de Investimentos',
      description: 'Relatório completo de investimentos e returns',
      formats: ['Excel', 'PDF']
    },
    {
      id: 'monthly',
      label: 'Relatório Mensal',
      description: 'Resumo mensal com gráficos e análises',
      formats: ['PDF']
    }
  ];

  const handleExport = (optionId: string, format: string) => {
    // Simulate export process
    console.log(`Exporting ${optionId} in ${format} format`);
    
    // In a real app, this would trigger the actual export
    const link = document.createElement('a');
    link.href = '#';
    link.download = `financeflow_${optionId}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Importar & Exportar</h1>
          <p className="text-gray-600">Gerencie os seus dados financeiros</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload size={18} className="mr-2" />
            Importar Dados
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download size={18} className="mr-2" />
            Exportar Dados
          </button>
        </nav>
      </div>

      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Carregar Ficheiros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Importação de Ficheiros
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Excel, CSV, PDF (máximo 10MB)
                </p>
                <button
                  onClick={handleStartImport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Iniciar Importação
                </button>
              </div>

              {/* Copy/Paste Import */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Copy/Paste
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Cole dados diretamente do extrato
                </p>
                <button
                  onClick={() => setShowImportWizard(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Colar Dados
                </button>
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Formatos Suportados</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {supportedFormats.map((format, index) => {
                const Icon = format.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Icon size={24} className="text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-900">{format.type}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{format.extensions}</p>
                    <p className="text-xs text-gray-500">{format.description}</p>
                    {format.features && (
                      <div className="mt-2">
                        {format.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs text-blue-600 mt-1">
                            <CheckCircle size={12} className="mr-1" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Processing Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
              <Brain className="mr-2" size={20} />
              Processamento Inteligente com IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">🤖 Categorização Automática</h4>
                <p className="text-sm text-purple-700">
                  IA analisa descrições e aplica regras para categorizar automaticamente
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">🔍 Detecção de Duplicados</h4>
                <p className="text-sm text-purple-700">
                  Sistema inteligente previne importação de transações duplicadas
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">📊 Análise de Padrões</h4>
                <p className="text-sm text-purple-700">
                  Identifica padrões em transações similares do histórico
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">✅ Revisão Inteligente</h4>
                <p className="text-sm text-purple-700">
                  Interface de aprovação com sugestões e nível de confiança
                </p>
              </div>
            </div>
          </div>

          {/* Recent Imports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Importações Recentes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">extrato_janeiro_2024.xlsx</p>
                    <p className="text-xs text-gray-600">45 transações • 89% categorizadas automaticamente</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Concluída</p>
                  <p className="text-xs text-gray-500">15 Jan 2024, 14:30</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Brain size={16} className="text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">extrato_dezembro_2023.pdf</p>
                    <p className="text-xs text-gray-600">32 transações • 76% categorizadas automaticamente</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">Processada</p>
                  <p className="text-xs text-gray-500">31 Dez 2023, 16:45</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Wizard Modal */}
      {showImportWizard && (
        <TransactionImportWizard
          onClose={() => setShowImportWizard(false)}
        />
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Quick Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportação Rápida</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleExport('transactions', 'Excel')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FileSpreadsheet size={24} className="text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Excel Completo</h4>
                <p className="text-sm text-gray-600">Todas as transações em Excel</p>
              </button>
              
              <button
                onClick={() => handleExport('monthly', 'PDF')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <File size={24} className="text-red-600 mb-2" />
                <h4 className="font-medium text-gray-900">Relatório PDF</h4>
                <p className="text-sm text-gray-600">Relatório mensal formatado</p>
              </button>
              
              <button
                onClick={() => handleExport('transactions', 'CSV')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FileText size={24} className="text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">CSV Simples</h4>
                <p className="text-sm text-gray-600">Dados em formato CSV</p>
              </button>
            </div>
          </div>

          {/* Detailed Export Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opções de Exportação</h3>
            
            {/* Account Filter for Export */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Filtrar por Conta</h4>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Todas as contas</option>
                {accounts.filter(account => account.status === 'active').map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.institution})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Seleccione uma conta específica ou deixe em branco para exportar todas
              </p>
            </div>

            <div className="space-y-4">
              {exportOptions.map((option) => (
                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{option.label}</h4>
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      <div className="flex space-x-2">
                        {option.formats.map((format) => (
                          <button
                            key={format}
                            onClick={() => handleExport(option.id, format)}
                            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Download size={20} className="text-gray-400 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Exportações</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileSpreadsheet size={16} className="text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">transacoes_2024_janeiro.xlsx</p>
                    <p className="text-xs text-gray-600">15 Jan 2024, 14:30</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Baixar novamente
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <File size={16} className="text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">relatorio_mensal_dezembro.pdf</p>
                    <p className="text-xs text-gray-600">31 Dez 2023, 16:45</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Baixar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};