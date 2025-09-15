import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Tag, MapPin, Car, Target, Repeat, Users, Brain, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { toInputDate, configureDateInput } from '../../utils/dateUtils';

interface TransactionFormProps {
  transaction?: any;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const { 
    addTransaction, 
    updateTransaction, 
    categories, 
    accounts, 
    entities, 
    assets, 
    savingsGoals, 
    recurringTransactions,
    processTransactionWithAI, 
    addAIRule 
  } = useFinance();
  
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
    recurringTransactionId: '',
    date: toInputDate(new Date()),
    tags: '',
    location: '',
    recurring: false
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
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
        recurringTransactionId: transaction.recurringTransactionId || '',
        date: toInputDate(transaction.date),
        tags: transaction.tags ? transaction.tags.join(', ') : '',
        location: transaction.location || '',
        recurring: transaction.recurring || false
      });
    }
  }, [transaction]);

  // Configure date inputs for Portuguese locale
  useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input) => {
      configureDateInput(input as HTMLInputElement);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios baseados no tipo
    if (formData.type === 'transfer') {
      if (!formData.toAccount) {
        alert('Por favor, seleccione a conta de destino para a transferência.');
        return;
      }
      if (formData.account === formData.toAccount) {
        alert('A conta de origem e destino não podem ser iguais.');
        return;
      }
    } else {
      if (!formData.category) {
        alert('Por favor, seleccione uma categoria.');
        return;
      }
      if (!formData.subcategory) {
        alert('Por favor, seleccione uma subcategoria.');
        return;
      }
    }
    
    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      entity: formData.entity || undefined,
      category: formData.type === 'transfer' ? 'Transferência' : formData.category,
      subcategory: formData.type === 'transfer' ? undefined : formData.subcategory,
      account: formData.account,
      toAccount: formData.type === 'transfer' ? formData.toAccount : undefined,
      assetId: formData.assetId || undefined,
      savingsGoalId: formData.savingsGoalId || undefined,
      recurringTransactionId: formData.recurringTransactionId || undefined,
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
    
    // Processar com AI se a descrição for suficientemente longa e não for transferência
    if (description.length > 3 && formData.amount && formData.type !== 'transfer') {
      try {
        const suggestions = await processTransactionWithAI(description, parseFloat(formData.amount));
        if (suggestions.aiProcessed && suggestions.confidence && suggestions.confidence > 0.7) {
          setAiSuggestions(suggestions);
          setShowAiSuggestions(true);
        } else if (suggestions.confidence && suggestions.confidence > 0.4) {
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
      setFormData(prev => ({
        ...prev,
        entity: pendingRule.suggestions.entity || prev.entity,
        category: pendingRule.suggestions.category || prev.category,
        subcategory: pendingRule.suggestions.subcategory || prev.subcategory,
        tags: pendingRule.suggestions.tags ? pendingRule.suggestions.tags.join(', ') : prev.tags
      }));
      
      const newRule = {
        name: `Regra automática - ${pendingRule.suggestions.entity || pendingRule.description}`,
        pattern: pendingRule.description.split(' ')[0],
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
      category: type === 'transfer' ? 'Transferência' : prev.category,
      subcategory: type === 'transfer' ? '' : prev.subcategory,
      toAccount: type === 'transfer' ? prev.toAccount : '',
      // Limpar associações que não fazem sentido para transferências
      assetId: type === 'transfer' ? '' : prev.assetId,
      savingsGoalId: type === 'transfer' ? '' : prev.savingsGoalId,
      recurringTransactionId: type === 'transfer' ? '' : prev.recurringTransactionId
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

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Transaction Type Selection - Compact */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tipo de Transação *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['income', 'expense', 'transfer'] as const).map((type) => {
                const Icon = getTypeIcon(type);
                const color = getTypeColor(type);
                const isSelected = formData.type === type;
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`flex items-center justify-center p-2 rounded-lg border-2 transition-colors text-sm ${
                      isSelected
                        ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} className="mr-1" />
                    {getTypeLabel(type)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Info - Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">€</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                lang="pt-PT"
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <MapPin size={12} className="inline mr-1" />
                Local
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Lisboa, Porto"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                formData.type === 'income' ? 'Ex: Salário Mensal' :
                formData.type === 'expense' ? 'Ex: Supermercado Continente' :
                'Ex: Transferência para Poupança'
              }
            />
          </div>

          {/* AI Suggestions - Compact */}
          {showAiSuggestions && aiSuggestions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-blue-900 flex items-center">
                  <Brain size={12} className="mr-1" />
                  Sugestões IA ({((aiSuggestions.confidence || 0) * 100).toFixed(0)}%)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAiSuggestions(false)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                {aiSuggestions.entity && <p><strong>Entidade:</strong> {aiSuggestions.entity}</p>}
                {aiSuggestions.category && <p><strong>Categoria:</strong> {aiSuggestions.category}</p>}
                {aiSuggestions.subcategory && <p><strong>Subcategoria:</strong> {aiSuggestions.subcategory}</p>}
                {aiSuggestions.tags && <p><strong>Tags:</strong> {aiSuggestions.tags.join(', ')}</p>}
              </div>
              <button
                type="button"
                onClick={applyAiSuggestions}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Aplicar Sugestões
              </button>
            </div>
          )}

          {/* Confirmation Dialog - Compact */}
          {showConfirmDialog && pendingRule && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <AlertTriangle size={12} className="text-yellow-600 mr-1" />
                <h4 className="text-xs font-medium text-yellow-900">IA encontrou padrão similar</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                {pendingRule.suggestions.entity && <p><strong>Entidade:</strong> {pendingRule.suggestions.entity}</p>}
                {pendingRule.suggestions.category && <p><strong>Categoria:</strong> {pendingRule.suggestions.category}</p>}
              </div>
              <p className="text-xs text-yellow-700 mb-2">Aplicar e ensinar IA?</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleConfirmLearning(true)}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmLearning(false)}
                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  Não
                </button>
              </div>
            </div>
          )}

          {/* Accounts - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {formData.type === 'transfer' ? 'Conta Origem *' : 'Conta *'}
              </label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar conta</option>
                {accounts.filter(a => a.status === 'active').map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>

            {formData.type === 'transfer' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Conta Destino *
                </label>
                <select
                  name="toAccount"
                  value={formData.toAccount}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Entity and Category - Only for non-transfers */}
          {formData.type !== 'transfer' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Users size={12} className="inline mr-1" />
                  Entidade
                </label>
                <select
                  name="entity"
                  value={formData.entity}
                  onChange={handleChange}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar entidade</option>
                  {entities.filter(e => e.active).map(entity => (
                    <option key={entity.id} value={entity.name}>{entity.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoria</option>
                  {categories
                    .filter(cat => cat.active && (cat.type === formData.type || cat.type === 'both'))
                    .map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subcategoria *
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.category}
                >
                  <option value="">Seleccionar subcategoria</option>
                  {selectedCategory?.subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Associations - Compact Grid */}
          {formData.type !== 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Associações (Opcional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    <Car size={12} className="inline mr-1" />
                    Ativo
                  </label>
                  <select
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nenhum ativo</option>
                    {assets.filter(a => a.active).map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.type === 'vehicle' ? '🚗' : asset.type === 'property' ? '🏠' : asset.type === 'equipment' ? '💻' : '📦'} {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    <Target size={12} className="inline mr-1" />
                    Poupança
                  </label>
                  <select
                    name="savingsGoalId"
                    value={formData.savingsGoalId}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nenhum objetivo</option>
                    {savingsGoals.filter(g => g.status === 'active').map(goal => (
                      <option key={goal.id} value={goal.id}>
                        🎯 {goal.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    <Repeat size={12} className="inline mr-1" />
                    Recorrente
                  </label>
                  <select
                    name="recurringTransactionId"
                    value={formData.recurringTransactionId}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Não recorrente</option>
                    {recurringTransactions.filter(r => r.active && r.type === formData.type).map(recurring => (
                      <option key={recurring.id} value={recurring.id}>
                        🔄 {recurring.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tags - Compact */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Tag size={12} className="inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: essencial, mensal (separadas por vírgulas)"
            />
          </div>

          {/* Transfer Info - Compact */}
          {formData.type === 'transfer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Transferência:</strong> Move dinheiro entre contas sem afetar orçamentos.
              </p>
            </div>
          )}

          {/* Current Associations Display */}
          {transaction && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Associações Atuais</h4>
              <div className="flex flex-wrap gap-1">
                {transaction.assetId && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {assets.find(a => a.id === transaction.assetId)?.name || 'Ativo'}
                  </span>
                )}
                {transaction.savingsGoalId && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {savingsGoals.find(g => g.id === transaction.savingsGoalId)?.name || 'Poupança'}
                  </span>
                )}
                {transaction.recurringTransactionId && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                    Recorrente
                  </span>
                )}
                {transaction.tags && transaction.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons - Compact */}
          <div className="flex space-x-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            {!transaction && (
              <button
                type="button"
                onClick={() => {
                  const recurringData = {
                    name: formData.description,
                    frequency: 'monthly' as const,
                    nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    autoIncludeInBudget: formData.type === 'expense',
                    alertOnVariation: true,
                    variationThreshold: 20
                  };
                  console.log('Convert to recurring:', recurringData);
                  alert('Funcionalidade de conversão para recorrente será implementada');
                }}
                className="px-3 py-2 text-sm border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Repeat size={14} className="inline mr-1" />
                Recorrente
              </button>
            )}
            
            <button
              type="submit"
              className={`flex-1 px-3 py-2 text-sm text-white rounded-lg transition-colors ${
                formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' :
                formData.type === 'expense' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {transaction ? 'Atualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};