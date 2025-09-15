import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Tag, MapPin } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface TransactionFormProps {
  transaction?: any;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const { addTransaction, updateTransaction, categories, accounts, entities, assets, savingsGoals, processTransactionWithAI, addAIRule } = useFinance();
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'transfer',
    amount: '',
    description: '',
    entity: '',
    category: '',
    subcategory: '',
    account: '',
    toAccount: '',
    assetId: '',
    savingsGoalId: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    location: '',
    recurring: false
  });
  const [aiSuggestions, setAiSuggestions] = useState<Partial<Transaction> | null>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRule, setPendingRule] = useState<any>(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        entity: transaction.entity || '',
        category: transaction.category,
        subcategory: transaction.subcategory || '',
        account: transaction.account,
        toAccount: transaction.toAccount || '',
        assetId: transaction.assetId || '',
        savingsGoalId: transaction.savingsGoalId || '',
        date: transaction.date,
        tags: transaction.tags ? transaction.tags.join(', ') : '',
        location: transaction.location || '',
        recurring: transaction.recurring || false
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar subcategoria obrigatória para não-transferências
    if (formData.type !== 'transfer' && !formData.subcategory) {
      alert('Por favor, seleccione uma subcategoria.');
      return;
    }
    
    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      entity: formData.entity || undefined,
      category: formData.type === 'transfer' ? 'Transferência' : formData.category,
      subcategory: formData.subcategory || undefined,
      account: formData.account,
      toAccount: formData.type === 'transfer' ? formData.toAccount : undefined,
      assetId: formData.assetId || undefined,
      savingsGoalId: formData.savingsGoalId || undefined,
      date: formData.date,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      location: formData.location || undefined,
      recurring: formData.recurring
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target.value;
    setFormData(prev => ({ ...prev, description }));
    
    // Processar com AI se a descrição for suficientemente longa
    if (description.length > 3 && formData.amount && formData.type !== 'transfer') {
      try {
        const suggestions = await processTransactionWithAI(description, parseFloat(formData.amount));
        if (suggestions.aiProcessed && suggestions.confidence && suggestions.confidence > 0.7) {
          setAiSuggestions(suggestions);
          setShowAiSuggestions(true);
        } else if (suggestions.confidence && suggestions.confidence > 0.4) {
          // Sugestão com confiança média - pedir confirmação para aprender
          setPendingRule({
            description,
            amount: parseFloat(formData.amount),
            suggestions
          });
          setShowConfirmDialog(true);
        }
      } catch (error) {
        console.error('Erro no processamento AI:', error);
      }
    }
  };

  const handleConfirmLearning = (confirmed: boolean) => {
    if (confirmed && pendingRule) {
      // Aplicar sugestões
      setFormData(prev => ({
        ...prev,
        entity: pendingRule.suggestions.entity || prev.entity,
        category: pendingRule.suggestions.category || prev.category,
        subcategory: pendingRule.suggestions.subcategory || prev.subcategory,
        tags: pendingRule.suggestions.tags ? pendingRule.suggestions.tags.join(', ') : prev.tags
      }));
      
      // Criar nova regra AI para aprender
      const newRule = {
        name: `Regra automática - ${pendingRule.suggestions.entity || pendingRule.description}`,
        pattern: pendingRule.description.split(' ')[0], // Primeira palavra como padrão
        patternType: 'contains' as const,
        entity: pendingRule.suggestions.entity,
        category: pendingRule.suggestions.category,
        subcategory: pendingRule.suggestions.subcategory,
        tags: pendingRule.suggestions.tags || [],
        confidence: 0.8,
        priority: 5,
        active: true
      };
      
      addAIRule(newRule);
    }
    
    setShowConfirmDialog(false);
    setPendingRule(null);
  };
  const applyAiSuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        entity: aiSuggestions.entity || prev.entity,
        category: aiSuggestions.category || prev.category,
        subcategory: aiSuggestions.subcategory || prev.subcategory,
        tags: aiSuggestions.tags ? aiSuggestions.tags.join(', ') : prev.tags
      }));
      setShowAiSuggestions(false);
    }
  };

  const handleTypeChange = (type: 'income' | 'expense' | 'transfer') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'transfer' ? 'Transferência' : '',
      toAccount: type === 'transfer' ? prev.toAccount : ''
    }));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'green';
      case 'expense': return 'red';
      case 'transfer': return 'blue';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return ArrowUpRight;
      case 'expense': return ArrowDownRight;
      case 'transfer': return ArrowRightLeft;
      default: return ArrowRightLeft;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      case 'transfer': return 'Transferência';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Transação *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['income', 'expense', 'transfer'] as const).map((type) => {
                const Icon = getTypeIcon(type);
                const color = getTypeColor(type);
                const isSelected = formData.type === type;
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} className="mr-2" />
                    {getTypeLabel(type)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className={`w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  formData.type === 'income' ? 'focus:ring-green-500' :
                  formData.type === 'expense' ? 'focus:ring-red-500' :
                  'focus:ring-blue-500'
                }`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                formData.type === 'income' ? 'focus:ring-green-500' :
                formData.type === 'expense' ? 'focus:ring-red-500' :
                'focus:ring-blue-500'
              }`}
              placeholder={
                formData.type === 'income' ? 'Ex: Salário Mensal' :
                formData.type === 'expense' ? 'Ex: Supermercado Continente' :
                'Ex: Transferência para Poupança'
              }
            />
          </div>

          {/* AI Suggestions */}
          {showAiSuggestions && aiSuggestions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-blue-900 flex items-center">
                  🤖 Sugestões da IA (Confiança: {((aiSuggestions.confidence || 0) * 100).toFixed(0)}%)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAiSuggestions(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {aiSuggestions.entity && (
                  <p><strong>Entidade:</strong> {aiSuggestions.entity}</p>
                )}
                {aiSuggestions.category && (
                  <p><strong>Categoria:</strong> {aiSuggestions.category}</p>
                )}
                {aiSuggestions.subcategory && (
                  <p><strong>Subcategoria:</strong> {aiSuggestions.subcategory}</p>
                )}
                {aiSuggestions.tags && (
                  <p><strong>Tags:</strong> {aiSuggestions.tags.join(', ')}</p>
                )}
              </div>
              <button
                type="button"
                onClick={applyAiSuggestions}
                className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colours"
              >
                Aplicar Sugestões
              </button>
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog && pendingRule && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <h4 className="text-sm font-medium text-yellow-900 flex items-center">
                  🤔 A IA encontrou algo semelhante
                </h4>
              </div>
              <div className="space-y-2 text-sm mb-3">
                {pendingRule.suggestions.entity && (
                  <p><strong>Entidade:</strong> {pendingRule.suggestions.entity}</p>
                )}
                {pendingRule.suggestions.category && (
                  <p><strong>Categoria:</strong> {pendingRule.suggestions.category}</p>
                )}
                {pendingRule.suggestions.subcategory && (
                  <p><strong>Subcategoria:</strong> {pendingRule.suggestions.subcategory}</p>
                )}
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Deseja aplicar estas sugestões e ensinar a IA a reconhecer transações semelhantes no futuro?
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleConfirmLearning(true)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colours"
                >
                  Sim, aplicar e aprender
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmLearning(false)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colours"
                >
                  Não, obrigado
                </button>
              </div>
            </div>
          )}
          {/* Entity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entidade
            </label>
            <select
              name="entity"
              value={formData.entity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                formData.type === 'income' ? 'focus:ring-green-500' :
                formData.type === 'expense' ? 'focus:ring-red-500' :
                'focus:ring-blue-500'
              }`}
            >
              <option value="">Seleccionar entidade (opcional)</option>
              {entities.filter(e => e.active).map(entity => (
                <option key={entity.id} value={entity.name}>{entity.name}</option>
              ))}
            </select>
          </div>

          {/* Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.type === 'transfer' ? 'Conta de Origem *' : 'Conta *'}
              </label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  formData.type === 'income' ? 'focus:ring-green-500' :
                  formData.type === 'expense' ? 'focus:ring-red-500' :
                  'focus:ring-blue-500'
                }`}
              >
                <option value="">Seleccionar conta</option>
                {accounts.filter(a => a.status === 'active').map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>

            {formData.type === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conta de Destino *
                </label>
                <select
                  name="toAccount"
                  value={formData.toAccount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar conta</option>
                  {accounts
                    .filter(a => a.status === 'active' && a.id !== formData.account)
                    .map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Asset and Savings Goal Association */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ativo Associado
              </label>
              <select
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  formData.type === 'income' ? 'focus:ring-green-500' :
                  formData.type === 'expense' ? 'focus:ring-red-500' :
                  'focus:ring-blue-500'
                }`}
              >
                <option value="">Nenhum ativo (opcional)</option>
                {assets.filter(a => a.active).map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.type === 'vehicle' ? '🚗' : asset.type === 'property' ? '🏠' : asset.type === 'equipment' ? '💻' : '📦'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objetivo de Poupança
              </label>
              <select
                name="savingsGoalId"
                value={formData.savingsGoalId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  formData.type === 'income' ? 'focus:ring-green-500' :
                  formData.type === 'expense' ? 'focus:ring-red-500' :
                  'focus:ring-blue-500'
                }`}
              >
                <option value="">Nenhum objetivo (opcional)</option>
                {savingsGoals.filter(g => g.status === 'active').map(goal => (
                  <option key={goal.id} value={goal.id}>
                    🎯 {goal.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.type !== 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                    formData.type === 'income' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                  }`}
                >
                  <option value="">Seleccionar categoria</option>
                  {categories
                    .filter(cat => cat.active && (cat.type === formData.type || cat.type === 'both'))
                    .map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  formData.type === 'income' ? 'focus:ring-green-500' :
                  formData.type === 'expense' ? 'focus:ring-red-500' :
                  'focus:ring-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Subcategory (only for non-transfers) */}
          {formData.type !== 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoria *
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  formData.type === 'income' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                }`}
              >
                <option value="">Seleccionar subcategoria</option>
                {formData.category && categories
                  .find(cat => cat.name === formData.category)
                  ?.subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                formData.type === 'income' ? 'focus:ring-green-500' :
                formData.type === 'expense' ? 'focus:ring-red-500' :
                'focus:ring-blue-500'
              }`}
              placeholder="Ex: essencial, mensal (separadas por vírgulas)"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="inline mr-1" />
              Local
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                formData.type === 'income' ? 'focus:ring-green-500' :
                formData.type === 'expense' ? 'focus:ring-red-500' :
                'focus:ring-blue-500'
              }`}
              placeholder="Ex: Lisboa, Porto"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="recurring"
              id="recurring"
              checked={formData.recurring}
              onChange={handleChange}
              className={`h-4 w-4 focus:ring-2 border-gray-300 rounded ${
                formData.type === 'income' ? 'text-green-600 focus:ring-green-500' :
                formData.type === 'expense' ? 'text-red-600 focus:ring-red-500' :
                'text-blue-600 focus:ring-blue-500'
              }`}
            />
            <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
              Transação recorrente
            </label>
          </div>

          {/* Transfer Info */}
          {formData.type === 'transfer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> As transferências movem dinheiro entre as suas contas e não afectam 
                os orçamentos ou cálculos de receitas/despesas. O valor será subtraído da conta de origem 
                e adicionado à conta de destino.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            {!transaction && (
              <button
                type="button"
                onClick={() => {
                  // Convert to recurring transaction
                  const recurringData = {
                    name: formData.description,
                    frequency: 'monthly' as const,
                    nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    autoIncludeInBudget: formData.type === 'expense',
                    alertOnVariation: true,
                    variationThreshold: 20
                  };
                  
                  // In a real implementation, this would open a recurring form with pre-filled data
                  console.log('Convert to recurring:', recurringData);
                  alert('Funcionalidade de conversão para recorrente será implementada');
                }}
                className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Tornar Recorrente
              </button>
            )}
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' :
                formData.type === 'expense' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {transaction ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};