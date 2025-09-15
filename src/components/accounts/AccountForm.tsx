import React, { useState, useEffect } from 'react';
import { X, Palette, Upload, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatDatePT, toInputDate, configureDateInput } from '../../utils/dateUtils';

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

const investmentTypes = [
  { value: 'stocks', label: 'Ações' },
  { value: 'etf', label: 'ETF' },
  { value: 'bonds', label: 'Obrigações' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'fund', label: 'Fundo de Investimento' },
  { value: 'other', label: 'Outro' }
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
    initialBalanceDate: toInputDate(new Date()),
    currency: 'EUR',
    institution: '',
    color: colorOptions[0],
    status: 'active' as 'active' | 'archived',
    investmentType: 'stocks' as 'stocks' | 'etf' | 'bonds' | 'crypto' | 'fund' | 'other',
    symbol: '',
    quantity: '',
    averageCost: '',
    currentPrice: '',
    broker: '',
    notes: '',
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
        initialBalanceDate: toInputDate(account.initialBalanceDate),
        currency: account.currency,
        institution: account.institution,
        color: account.color,
        status: account.status,
        investmentType: account.investmentType || 'stocks',
        symbol: account.investmentDetails?.symbol || '',
        quantity: account.investmentDetails?.quantity?.toString() || '',
        averageCost: account.investmentDetails?.averageCost?.toString() || '',
        currentPrice: account.investmentDetails?.currentPrice?.toString() || '',
        broker: account.investmentDetails?.broker || '',
        notes: account.investmentDetails?.notes || '',
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

  // Configure date inputs for Portuguese locale
  useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input) => {
      configureDateInput(input as HTMLInputElement);
    });
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Informações Básicas
            </button>
            {formData.type === 'investment' && (
              <button
                type="button"
                onClick={() => setActiveTab('investment')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'investment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Detalhes de Investimento
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuração de Upload
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Basic form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Conta
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saldo Atual
                  </label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saldo Inicial
                  </label>
                  <input
                    type="number"
                    name="initialBalance"
                    value={formData.initialBalance}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Saldo Inicial
                  </label>
                  <input
                    type="date"
                    name="initialBalanceDate"
                    value={formData.initialBalanceDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instituição
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {account && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Estado da Conta
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Ativa</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="archived"
                        checked={formData.status === 'archived'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Arquivada</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Contas arquivadas não aparecem nas listas principais mas mantêm o histórico
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'investment' && formData.type === 'investment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Investimento
                  </label>
                  <select
                    name="investmentType"
                    value={formData.investmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {investmentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Símbolo/Ticker
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleChange}
                    placeholder="Ex: AAPL, TSLA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    step="0.000001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Médio de Compra
                  </label>
                  <input
                    type="number"
                    name="averageCost"
                    value={formData.averageCost}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Atual
                  </label>
                  <input
                    type="number"
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corretora
                  </label>
                  <input
                    type="text"
                    name="broker"
                    value={formData.broker}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {account ? 'Atualizar' : 'Criar'} Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};