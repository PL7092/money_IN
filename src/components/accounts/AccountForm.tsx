import React, { useState, useEffect } from 'react';
import { X, Palette, Upload, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface AccountFormProps {
  account?: any;
  onClose: () => void;
}

const accountTypes = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Conta Poupança' },
  { value: 'credit', label: 'Cartão de Crédito' },
  { value: 'investment', label: 'Conta de Investimento' }
];

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#6B7280', '#84CC16'
];

export const AccountForm: React.FC<AccountFormProps> = ({ account, onClose }) => {
  const { addAccount, updateAccount } = useFinance();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'credit' | 'investment',
    balance: '',
    initialBalance: '',
    initialBalanceDate: new Date().toISOString().split('T')[0],
    currency: 'EUR',
    institution: '',
    color: colorOptions[0],
    status: 'active' as 'active' | 'archived',
    uploadConfig: {
      preferredFormat: 'pdf' as 'pdf' | 'excel' | 'csv',
      pdfConfig: {
        datePattern: '',
        amountPattern: '',
        descriptionPattern: '',
        dateFormat: 'dd/mm/yyyy',
        amountColumn: '',
        descriptionColumn: '',
        skipLines: 0,
        encoding: 'utf-8'
      },
      excelConfig: {
        sheetName: 'Sheet1',
        headerRow: 1,
        dateColumn: 'A',
        amountColumn: 'B',
        descriptionColumn: 'C',
        categoryColumn: '',
        dateFormat: 'dd/mm/yyyy',
        skipRows: 0
      },
      csvConfig: {
        delimiter: ',',
        headerRow: 1,
        dateColumn: 1,
        amountColumn: 2,
        descriptionColumn: 3,
        categoryColumn: 0,
        dateFormat: 'dd/mm/yyyy',
        encoding: 'utf-8'
      },
      autoCategorizationRules: []
    }
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        initialBalance: account.initialBalance.toString(),
        initialBalanceDate: account.initialBalanceDate,
        currency: account.currency,
        institution: account.institution,
        color: account.color,
        status: account.status,
        uploadConfig: account.uploadConfig || {
          preferredFormat: 'pdf',
          pdfConfig: {
            datePattern: '',
            amountPattern: '',
            descriptionPattern: '',
            dateFormat: 'dd/mm/yyyy',
            amountColumn: '',
            descriptionColumn: '',
            skipLines: 0,
            encoding: 'utf-8'
          },
          excelConfig: {
            sheetName: 'Sheet1',
            headerRow: 1,
            dateColumn: 'A',
            amountColumn: 'B',
            descriptionColumn: 'C',
            categoryColumn: '',
            dateFormat: 'dd/mm/yyyy',
            skipRows: 0
          },
          csvConfig: {
            delimiter: ',',
            headerRow: 1,
            dateColumn: 1,
            amountColumn: 2,
            descriptionColumn: 3,
            categoryColumn: 0,
            dateFormat: 'dd/mm/yyyy',
            encoding: 'utf-8'
          },
          autoCategorizationRules: []
        }
      });
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData = {
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance),
      initialBalance: parseFloat(formData.initialBalance),
      initialBalanceDate: formData.initialBalanceDate,
      currency: formData.currency,
      institution: formData.institution,
      color: formData.color,
      status: formData.status,
      ...(formData.type === 'investment' && {
        investmentType: formData.investmentType,
        investmentDetails: {
          symbol: formData.symbol || undefined,
          quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
          averageCost: formData.averageCost ? parseFloat(formData.averageCost) : undefined,
          currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined,
          lastPriceUpdate: formData.currentPrice ? new Date().toISOString() : undefined,
          broker: formData.broker || undefined,
          notes: formData.notes || undefined
        }
      })
    };

    if (account) {
      updateAccount(account.id, accountData);
    } else {
      addAccount(accountData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        uploadConfig: {
          ...prev.uploadConfig,
          [section]: {
            ...prev.uploadConfig[section],
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUploadConfigChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      uploadConfig: {
        ...prev.uploadConfig,
        [section]: {
          ...prev.uploadConfig[section],
          [field]: value
        }
      }
    }));
  };

  const addCategorizationRule = () => {
    const newRule = {
      id: Date.now().toString(),
      pattern: '',
      category: '',
      subcategory: '',
      type: 'expense' as 'income' | 'expense',
      priority: 1,
      active: true
    };
    
    setFormData(prev => ({
      ...prev,
      uploadConfig: {
        ...prev.uploadConfig,
        autoCategorizationRules: [...prev.uploadConfig.autoCategorizationRules, newRule]
      }
    }));
  };

  const removeCategorizationRule = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      uploadConfig: {
        ...prev.uploadConfig,
        autoCategorizationRules: prev.uploadConfig.autoCategorizationRules.filter(rule => rule.id !== ruleId)
      }
    }));
  };

  const updateCategorizationRule = (ruleId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      uploadConfig: {
        ...prev.uploadConfig,
        autoCategorizationRules: prev.uploadConfig.autoCategorizationRules.map(rule =>
          rule.id === ruleId ? { ...rule, [field]: value } : rule
        )
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {account ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm mr-6 ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={16} className="mr-2" />
              Informações Básicas
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload size={16} className="mr-2" />
              Configuração de Upload
            </button>
          </nav>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'basic' && (
            <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Conta *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Conta Corrente Principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conta *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo Atual *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                step="0.01"
                required
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saldo Inicial *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  name="initialBalance"
                  value={formData.initialBalance}
                  onChange={handleChange}
                  step="0.01"
                  required
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Saldo Inicial *
              </label>
              <input
                type="date"
                name="initialBalanceDate"
                value={formData.initialBalanceDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moeda *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instituição *
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Banco Exemplo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Palette size={16} className="mr-1" />
              Cor da Conta
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Status Management - Only for existing accounts */}
          {account && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado da Conta
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'archived' }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ativa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="archived"
                    checked={formData.status === 'archived'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'archived' }))}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Arquivada</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contas arquivadas não aparecem nas listas principais mas mantêm o histórico
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> O saldo inicial representa o valor que tinha na conta na data especificada. 
              O saldo atual será automaticamente atualizado com as suas transações. Para cartões de crédito, 
              use valores negativos para representar dívidas.
            </p>
          </div>
            </>
          )}

          {activeTab === 'upload' && (
            <>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Configuração de Upload de Dados</h3>
                
                {/* Preferred Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato Preferido de Upload *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleUploadConfigChange('', 'preferredFormat', 'pdf')}
                      className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        formData.uploadConfig.preferredFormat === 'pdf'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText size={18} className="mr-2" />
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUploadConfigChange('', 'preferredFormat', 'excel')}
                      className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        formData.uploadConfig.preferredFormat === 'excel'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileSpreadsheet size={18} className="mr-2" />
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUploadConfigChange('', 'preferredFormat', 'csv')}
                      className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        formData.uploadConfig.preferredFormat === 'csv'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText size={18} className="mr-2" />
                      CSV
                    </button>
                  </div>
                </div>

                {/* PDF Configuration */}
                {formData.uploadConfig.preferredFormat === 'pdf' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-red-900 mb-3">Configuração PDF</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Padrão de Data
                        </label>
                        <input
                          type="text"
                          name="pdfConfig.datePattern"
                          value={formData.uploadConfig.pdfConfig.datePattern}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ex: \d{2}/\d{2}/\d{4}"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Padrão de Valor
                        </label>
                        <input
                          type="text"
                          name="pdfConfig.amountPattern"
                          value={formData.uploadConfig.pdfConfig.amountPattern}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ex: \d+[,\.]\d{2}"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Formato de Data
                        </label>
                        <select
                          name="pdfConfig.dateFormat"
                          value={formData.uploadConfig.pdfConfig.dateFormat}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="dd/mm/yyyy">DD/MM/AAAA</option>
                          <option value="mm/dd/yyyy">MM/DD/AAAA</option>
                          <option value="yyyy-mm-dd">AAAA-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Linhas a Ignorar
                        </label>
                        <input
                          type="number"
                          name="pdfConfig.skipLines"
                          value={formData.uploadConfig.pdfConfig.skipLines}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Excel Configuration */}
                {formData.uploadConfig.preferredFormat === 'excel' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-green-900 mb-3">Configuração Excel</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome da Folha
                        </label>
                        <input
                          type="text"
                          name="excelConfig.sheetName"
                          value={formData.uploadConfig.excelConfig.sheetName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Sheet1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Linha do Cabeçalho
                        </label>
                        <input
                          type="number"
                          name="excelConfig.headerRow"
                          value={formData.uploadConfig.excelConfig.headerRow}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coluna da Data
                        </label>
                        <input
                          type="text"
                          name="excelConfig.dateColumn"
                          value={formData.uploadConfig.excelConfig.dateColumn}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coluna do Valor
                        </label>
                        <input
                          type="text"
                          name="excelConfig.amountColumn"
                          value={formData.uploadConfig.excelConfig.amountColumn}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: B"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coluna da Descrição
                        </label>
                        <input
                          type="text"
                          name="excelConfig.descriptionColumn"
                          value={formData.uploadConfig.excelConfig.descriptionColumn}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: C"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coluna da Categoria (Opcional)
                        </label>
                        <input
                          type="text"
                          name="excelConfig.categoryColumn"
                          value={formData.uploadConfig.excelConfig.categoryColumn}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: D"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CSV Configuration */}
                {formData.uploadConfig.preferredFormat === 'csv' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-blue-900 mb-3">Configuração CSV</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delimitador
                        </label>
                        <select
                          name="csvConfig.delimiter"
                          value={formData.uploadConfig.csvConfig.delimiter}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value=",">Vírgula (,)</option>
                          <option value=";">Ponto e vírgula (;)</option>
                          <option value="\t">Tab</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Linha do Cabeçalho
                        </label>
                        <input
                          type="number"
                          name="csvConfig.headerRow"
                          value={formData.uploadConfig.csvConfig.headerRow}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coluna da Data (Número)
                        </label>
                        <input
                          type="number"
                          name="csvConfig.dateColumn"
                          value={formData.uploadConfig.csvConfig.dateColumn}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coluna do Valor (Número)
                        </label>
                        <input
                          type="number"
                          name="csvConfig.amountColumn"
                          value={formData.uploadConfig.csvConfig.amountColumn}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-Categorization Rules */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-900">Regras de Categorização Automática</h4>
                    <button
                      type="button"
                      onClick={addCategorizationRule}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      + Adicionar Regra
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.uploadConfig.autoCategorizationRules.map((rule, index) => (
                      <div key={rule.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Padrão de Texto
                            </label>
                            <input
                              type="text"
                              value={rule.pattern}
                              onChange={(e) => updateCategorizationRule(rule.id, 'pattern', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Ex: CONTINENTE"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Categoria
                            </label>
                            <input
                              type="text"
                              value={rule.category}
                              onChange={(e) => updateCategorizationRule(rule.id, 'category', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Ex: Alimentação"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tipo
                            </label>
                            <select
                              value={rule.type}
                              onChange={(e) => updateCategorizationRule(rule.id, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="expense">Despesa</option>
                              <option value="income">Receita</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeCategorizationRule(rule.id)}
                              className="px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {formData.uploadConfig.autoCategorizationRules.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Nenhuma regra de categorização configurada
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Dica:</strong> As configurações de upload permitem que a aplicação interprete automaticamente 
                    os ficheiros enviados desta conta. Configure os padrões e colunas de acordo com o formato dos extratos 
                    do seu banco para uma importação mais eficiente.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {account ? 'Actualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};