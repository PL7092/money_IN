import React, { useState } from 'react';
import { Upload, Download, FileText, FileSpreadsheet, File, CheckCircle, AlertCircle } from 'lucide-react';

export const ImportExport = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
    
    // Simulate upload process
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
    }, 2000);
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
      description: 'Extratos bancários em PDF (com OCR automático)'
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
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Clique para carregar ou arraste ficheiros aqui
                </p>
                <p className="text-sm text-gray-600">
                  Suporte para Excel, CSV e PDF (máximo 10MB por ficheiro)
                </p>
              </label>
            </div>

            {/* Upload Status */}
            {uploadStatus !== 'idle' && (
              <div className="mt-4">
                {uploadStatus === 'uploading' && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Processando ficheiros...
                  </div>
                )}
                {uploadStatus === 'success' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle size={16} className="mr-2" />
                    {uploadedFiles.length} ficheiro(s) processado(s) com sucesso!
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle size={16} className="mr-2" />
                    Erro ao processar ficheiros. Tente novamente.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Formatos Suportados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Processing Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Processamento Inteligente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Categorização Automática</h4>
                <p className="text-sm text-blue-700">
                  A AI identifica automaticamente categorias e subcategorias das transações
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Detecção de Duplicados</h4>
                <p className="text-sm text-blue-700">
                  Sistema inteligente previne importação de transações duplicadas
                </p>
              </div>
            </div>
          </div>
        </div>
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