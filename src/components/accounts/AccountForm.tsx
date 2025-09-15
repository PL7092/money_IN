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
      color: formData.color
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> O saldo inicial representa o valor que tinha na conta na data especificada. 
              O saldo atual será automaticamente atualizado com as suas transações. Para cartões de crédito, 
              use valores negativos para representar dívidas.
            </p>
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