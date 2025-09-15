import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Palette } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface InvestmentFormProps {
  investment?: any;
  onClose: () => void;
}

const investmentTypes = [
  { value: 'stocks', label: 'Ações' },
  { value: 'bonds', label: 'Obrigações' },
  { value: 'etf', label: 'ETF' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'real_estate', label: 'Imobiliário' },
  { value: 'commodities', label: 'Commodities' },
  { value: 'other', label: 'Outro' }
];

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#6B7280', '#84CC16',
  '#F97316', '#06B6D4', '#8B5A2B', '#DC2626'
];

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ investment, onClose }) => {
  const { addAccount, updateAccount } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    currency: 'EUR',
    color: colorOptions[0],
    initialBalance: '',
    balance: '',
    initialBalanceDate: new Date().toISOString().split('T')[0],
    investmentType: 'stocks' as any,
    symbol: '',
    quantity: '',
    averageCost: '',
    currentPrice: '',
    broker: '',
    notes: ''
  });

  useEffect(() => {
    if (investment) {
      const details = investment.investmentDetails || {};
      setFormData({
        name: investment.name,
        institution: investment.institution,
        currency: investment.currency,
        color: investment.color,
        initialBalance: investment.initialBalance.toString(),
        balance: investment.balance.toString(),
        initialBalanceDate: investment.initialBalanceDate,
        investmentType: investment.investmentType || 'stocks',
        symbol: details.symbol || '',
        quantity: details.quantity?.toString() || '',
        averageCost: details.averageCost?.toString() || '',
        currentPrice: details.currentPrice?.toString() || '',
        broker: details.broker || '',
        notes: details.notes || ''
      });
    }
  }, [investment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData = {
      name: formData.name,
      type: 'investment' as const,
      balance: parseFloat(formData.balance),
      initialBalance: parseFloat(formData.initialBalance),
      initialBalanceDate: formData.initialBalanceDate,
      currency: formData.currency,
      institution: formData.institution,
      color: formData.color,
      status: 'active' as const,
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
    };

    if (investment) {
      updateAccount(investment.id, accountData);
    } else {
      addAccount(accountData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={24} />
            {investment ? 'Editar Investimento' : 'Novo Investimento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Investimento *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: ETF Global, Ações Apple"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Investimento *
                </label>
                <select
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {investmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Símbolo/Ticker
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: AAPL, VWCE"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instituição/Broker *
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: XTB, Degiro, Interactive Brokers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moeda *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Detalhes do Investimento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  step="0.001"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custo Médio
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="averageCost"
                    value={formData.averageCost}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Atual
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Investido Inicial *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="initialBalance"
                    value={formData.initialBalance}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Atual *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Investimento Inicial *
              </label>
              <input
                type="date"
                name="initialBalanceDate"
                value={formData.initialBalanceDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Adicionais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Broker Específico
              </label>
              <input
                type="text"
                name="broker"
                value={formData.broker}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Conta específica ou plataforma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Notas adicionais sobre este investimento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Palette size={16} className="mr-1" />
                Cor do Investimento
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
          </div>

          {/* Performance Preview */}
          {formData.initialBalance && formData.balance && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Pré-visualização de Performance</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    €{(parseFloat(formData.balance) - parseFloat(formData.initialBalance)).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">Retorno Absoluto</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${
                    parseFloat(formData.balance) >= parseFloat(formData.initialBalance) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {parseFloat(formData.initialBalance) > 0 ? 
                      (((parseFloat(formData.balance) - parseFloat(formData.initialBalance)) / parseFloat(formData.initialBalance)) * 100).toFixed(2) : 0
                    }%
                  </p>
                  <p className="text-xs text-gray-600">Retorno %</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">
                    €{parseFloat(formData.balance || '0').toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">Valor Atual</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              <strong>Nota:</strong> Este investimento será criado como uma conta de investimento. 
              Pode atualizar o valor atual a qualquer momento sem criar transações, 
              permitindo acompanhar a performance real do investimento.
            </p>
          </div>

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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {investment ? 'Atualizar' : 'Criar'} Investimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};