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
    initialBalanceDate: new Date().toISOString().split('T')[0],
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
        initialBalanceDate: account.initialBalanceDate,
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