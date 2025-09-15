import React, { useState } from 'react';
import { X, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface InvestmentValueUpdateProps {
  investment: any;
  onClose: () => void;
}

export const InvestmentValueUpdate: React.FC<InvestmentValueUpdateProps> = ({ investment, onClose }) => {
  const { updateInvestmentValue } = useFinance();
  const [formData, setFormData] = useState({
    newValue: investment.balance.toString(),
    currentPrice: investment.investmentDetails?.currentPrice?.toString() || '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newValue = parseFloat(formData.newValue);
    const currentPrice = formData.currentPrice ? parseFloat(formData.currentPrice) : undefined;
    
    updateInvestmentValue(investment.id, newValue, currentPrice);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const currentValue = parseFloat(formData.newValue || '0');
  const previousValue = investment.balance;
  const difference = currentValue - previousValue;
  const percentageChange = previousValue > 0 ? (difference / previousValue) * 100 : 0;

  const totalReturn = currentValue - investment.initialBalance;
  const totalReturnPercentage = investment.initialBalance > 0 ? (totalReturn / investment.initialBalance) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <RefreshCw className="mr-2 text-blue-600" size={24} />
            Atualizar Valor
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Investment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{investment.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Valor Atual:</p>
                <p className="font-semibold">€{investment.balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Investido:</p>
                <p className="font-semibold">€{investment.initialBalance.toFixed(2)}</p>
              </div>
              {investment.investmentDetails?.currentPrice && (
                <div>
                  <p className="text-gray-600">Preço Atual:</p>
                  <p className="font-semibold">€{investment.investmentDetails.currentPrice.toFixed(2)}</p>
                </div>
              )}
              {investment.investmentDetails?.quantity && (
                <div>
                  <p className="text-gray-600">Quantidade:</p>
                  <p className="font-semibold">{investment.investmentDetails.quantity}</p>
                </div>
              )}
            </div>
          </div>

          {/* New Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Novo Valor Total *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                name="newValue"
                value={formData.newValue}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Current Price (optional) */}
          {investment.investmentDetails?.quantity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço por Unidade (Opcional)
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
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Se preenchido, será usado para calcular o preço por unidade
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas da Atualização
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Atualização baseada em cotação de mercado..."
            />
          </div>

          {/* Change Preview */}
          {formData.newValue && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pré-visualização da Alteração</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alteração no Valor:</span>
                  <div className="flex items-center">
                    {difference >= 0 ? (
                      <TrendingUp size={16} className="text-green-600 mr-1" />
                    ) : (
                      <TrendingDown size={16} className="text-red-600 mr-1" />
                    )}
                    <span className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {difference >= 0 ? '+' : ''}€{difference.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Variação %:</span>
                  <span className={`font-semibold ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                  </span>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retorno Total:</span>
                    <span className={`font-semibold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalReturn >= 0 ? '+' : ''}€{totalReturn.toFixed(2)} ({totalReturnPercentage >= 0 ? '+' : ''}{totalReturnPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Esta atualização não criará uma transação. 
              O valor será atualizado diretamente para refletir a cotação atual do investimento.
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Atualizar Valor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};