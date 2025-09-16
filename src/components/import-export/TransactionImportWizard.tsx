import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Brain, Eye, EyeOff, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Edit, Save, Undo, Tag, Users, Car, Target, Repeat, MapPin } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { toInputDate, configureDateInput } from '../../utils/dateUtils';

interface TransactionImportWizardProps {
  onClose: () => void;
}

interface ParsedTransaction {
  id: string;
  originalText: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  entity?: string;
  category?: string;
  subcategory?: string;
  tags: string[];
  location?: string;
  account?: string;
  toAccount?: string;
  assetId?: string;
  savingsGoalId?: string;
  recurringTransactionId?: string;
  aiProcessed: boolean;
  confidence: number;
  reasoning: string;
}

export const TransactionImportWizard: React.FC<TransactionImportWizardProps> = ({ onClose }) => {
  const { 
    addTransaction, 
    categories, 
    accounts, 
    entities, 
    assets, 
    savingsGoals, 
    recurringTransactions,
    processTransactionWithAI 
  } = useFinance();
  
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showOriginalText, setShowOriginalText] = useState<{ [key: number]: boolean }>({});

  // Configure date inputs for Portuguese locale
  useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input) => {
      configureDateInput(input as HTMLInputElement);
    });
  }, [step]);

  const parseTransactionData = async (text: string): Promise<ParsedTransaction[]> => {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: ParsedTransaction[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip headers
      if (line.toLowerCase().includes('data') && line.toLowerCase().includes('valor')) continue;
      if (line.toLowerCase().includes('date') && line.toLowerCase().includes('amount')) continue;

      const transaction = await parseTransactionLine(line, i);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  };

  const parseTransactionLine = async (line: string, index: number): Promise<ParsedTransaction | null> => {
    try {
      // Patterns for Portuguese banking data
      const patterns = [
        // DD/MM/YYYY format with various separators
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\s*[;\t,\s]+(.+?)\s*[;\t,\s]+([\+\-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/,
        // YYYY-MM-DD format
        /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\s*[;\t,\s]+(.+?)\s*[;\t,\s]+([\+\-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/,
        // Flexible format - any date, description, amount
        /(\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s+(.+?)\s+([\+\-]?\s*\d+[.,]\d{2})/,
        // Simple format with spaces
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\s+(.+?)\s+([\+\-]?\d+[.,]\d{2})/
      ];

      let match = null;
      for (const pattern of patterns) {
        match = line.match(pattern);
        if (match) break;
      }

      if (!match) {
        console.warn('Could not parse line:', line);
        return null;
      }

      const [, dateStr, description, amountStr] = match;

      // Parse date
      let date = '';
      const dateParts = dateStr.split(/[\/\-\.]/);
      if (dateParts.length === 3) {
        if (dateParts[0].length === 4) {
          // YYYY-MM-DD format
          date = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
        } else {
          // DD/MM/YYYY format
          date = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
        }
      }

      // Parse amount
      const cleanAmount = amountStr.replace(/\s/g, '').replace(',', '.');
      const amount = parseFloat(cleanAmount);
      
      if (isNaN(amount)) {
        console.warn('Could not parse amount:', amountStr);
        return null;
      }

      // Clean description
      const cleanDescription = description.trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\-\.]/g, ' ')
        .trim();

      // Process with AI
      const aiResult = await processTransactionWithAI(cleanDescription, Math.abs(amount));

      const transaction: ParsedTransaction = {
        id: `import_${index}_${Date.now()}`,
        originalText: line,
        date: date,
        description: cleanDescription,
        amount: Math.abs(amount),
        type: amount >= 0 ? 'income' : 'expense',
        entity: aiResult.entity,
        category: aiResult.category,
        subcategory: aiResult.subcategory,
        tags: aiResult.tags || [],
        location: aiResult.location,
        account: selectedAccount,
        toAccount: '',
        assetId: '',
        savingsGoalId: '',
        recurringTransactionId: '',
        aiProcessed: aiResult.aiProcessed,
        confidence: aiResult.confidence || 0,
        reasoning: aiResult.reasoning || 'Categorização automática baseada na descrição'
      };

      return transaction;
    } catch (error) {
      console.error('Error parsing transaction line:', error);
      return null;
    }
  };

  const handleProcessData = async () => {
    if (!inputText.trim() || !selectedAccount) return;

    setIsProcessing(true);
    try {
      const transactions = await parseTransactionData(inputText);
      setParsedTransactions(transactions);
      setStep(3);
    } catch (error) {
      console.error('Error processing data:', error);
      alert('Erro ao processar dados. Verifique o formato e tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTransaction = (index: number, field: string, value: any) => {
    setParsedTransactions(prev => prev.map((t, i) => 
      i === index ? { ...t, [field]: value } : t
    ));
  };

  const convertToTransfer = (index: number) => {
    updateTransaction(index, 'type', 'transfer');
    updateTransaction(index, 'category', 'Transferência');
    updateTransaction(index, 'subcategory', '');
    updateTransaction(index, 'entity', '');
    updateTransaction(index, 'assetId', '');
    updateTransaction(index, 'savingsGoalId', '');
    updateTransaction(index, 'recurringTransactionId', '');
  };

  const toggleOriginalText = (index: number) => {
    setShowOriginalText(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleImportAll = () => {
    parsedTransactions.forEach(transaction => {
      const transactionData = {
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        entity: transaction.entity || undefined,
        category: transaction.category || 'Outros',
        subcategory: transaction.subcategory || undefined,
        account: transaction.account,
        toAccount: transaction.type === 'transfer' ? transaction.toAccount : undefined,
        assetId: transaction.assetId || undefined,
        savingsGoalId: transaction.savingsGoalId || undefined,
        recurringTransactionId: transaction.recurringTransactionId || undefined,
        date: transaction.date,
        tags: transaction.tags.length > 0 ? transaction.tags : undefined,
        location: transaction.location || undefined,
        aiProcessed: transaction.aiProcessed,
        confidence: transaction.confidence
      };

      addTransaction(transactionData);
    });

    alert(`${parsedTransactions.length} transações importadas com sucesso!`);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return ArrowUpRight;
      case 'expense': return ArrowDownRight;
      case 'transfer': return ArrowRightLeft;
      default: return ArrowRightLeft;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100';
      case 'expense': return 'bg-red-100';
      case 'transfer': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-2 text-purple-600" size={24} />
            Assistente de Importação Inteligente
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Input Data */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cole os Dados Bancários</h3>
              <p className="text-gray-600 mb-4">
                Cole qualquer formato de extrato bancário. A IA identificará automaticamente as transações.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conta de Destino *
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar conta</option>
                {accounts.filter(a => a.status === 'active').map(account => (
                  <option key={account.id} value={account.id}>{account.name} ({account.institution})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dados Bancários
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="Cole aqui os dados do seu extrato bancário...

Exemplos suportados:
15/01/2024    CONTINENTE LISBOA    -45,80
12/01/2024    GALP ENERGIA PORTO   -65,40
01/01/2024    SALARIO EMPRESA XYZ  +2.800,00

Ou formato CSV:
Data;Descrição;Valor
15/01/2024;PINGO DOCE CASCAIS;-32,15

Ou qualquer outro formato - a IA identifica automaticamente!"
              />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">🤖 IA Inteligente</h4>
              <p className="text-sm text-purple-700">
                A IA identifica automaticamente datas, valores, descrições e categoriza baseado em padrões portugueses.
                Suporta qualquer formato de dados bancários.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessData}
                disabled={!inputText.trim() || !selectedAccount || isProcessing}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Brain size={16} className="mr-2" />
                    Processar com IA
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review and Edit */}
        {step === 3 && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Rever e Editar Transações</h3>
                <p className="text-gray-600">
                  {parsedTransactions.length} transações identificadas. Reveja e edite conforme necessário.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-semibold">€{parsedTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0).toFixed(2)}</span>
                </div>
                <button
                  onClick={handleImportAll}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Importar Todas ({parsedTransactions.length})
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-600">
                  {parsedTransactions.filter(t => t.type === 'income').length}
                </p>
                <p className="text-xs text-green-700">Receitas</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-red-600">
                  {parsedTransactions.filter(t => t.type === 'expense').length}
                </p>
                <p className="text-xs text-red-700">Despesas</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-600">
                  {parsedTransactions.filter(t => t.type === 'transfer').length}
                </p>
                <p className="text-xs text-blue-700">Transferências</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-purple-600">
                  {parsedTransactions.filter(t => t.aiProcessed).length}
                </p>
                <p className="text-xs text-purple-700">Processadas IA</p>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {parsedTransactions.map((transaction, index) => {
                const Icon = getTypeIcon(transaction.type);
                const isEditing = editingIndex === index;
                const selectedCategory = categories.find(cat => cat.name === transaction.category);

                return (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    {/* Header with original text toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`${getTypeBgColor(transaction.type)} rounded-lg p-1.5`}>
                          <Icon size={14} className={getTypeColor(transaction.type)} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{transaction.description}</h4>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span>{new Date(transaction.date).toLocaleDateString('pt-PT')}</span>
                            <span className={`font-medium ${getTypeColor(transaction.type)}`}>
                              {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}€{transaction.amount.toFixed(2)}
                            </span>
                            {transaction.aiProcessed && (
                              <span className={`px-1.5 py-0.5 rounded-full bg-purple-100 ${getConfidenceColor(transaction.confidence)}`}>
                                IA: {getConfidenceLabel(transaction.confidence)} ({(transaction.confidence * 100).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleOriginalText(index)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                          title="Ver texto original"
                        >
                          {showOriginalText[index] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => setEditingIndex(isEditing ? null : index)}
                          className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                          title="Editar transação"
                        >
                          {isEditing ? <Save size={14} /> : <Edit size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Original Text */}
                    {showOriginalText[index] && (
                      <div className="mb-3 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
                        <strong>Texto original:</strong> {transaction.originalText}
                      </div>
                    )}

                    {/* AI Reasoning */}
                    {transaction.reasoning && (
                      <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                        <strong>Reasoning IA:</strong> {transaction.reasoning}
                      </div>
                    )}

                    {/* Editing Interface */}
                    {isEditing ? (
                      <div className="space-y-3">
                        {/* Type Selection */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['income', 'expense', 'transfer'] as const).map((type) => {
                              const TypeIcon = getTypeIcon(type);
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    if (type === 'transfer') {
                                      convertToTransfer(index);
                                    } else {
                                      updateTransaction(index, 'type', type);
                                    }
                                  }}
                                  className={`flex items-center justify-center p-1.5 rounded border text-xs ${
                                    transaction.type === type
                                      ? `border-${type === 'income' ? 'green' : type === 'expense' ? 'red' : 'blue'}-500 bg-${type === 'income' ? 'green' : type === 'expense' ? 'red' : 'blue'}-50`
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <TypeIcon size={12} className="mr-1" />
                                  {type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : 'Transferência'}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {/* Entity */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <Users size={10} className="inline mr-1" />
                              Entidade
                            </label>
                            <select
                              value={transaction.entity || ''}
                              onChange={(e) => updateTransaction(index, 'entity', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="">Seleccionar</option>
                              {entities.filter(e => e.active).map(entity => (
                                <option key={entity.id} value={entity.name}>{entity.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Category */}
                          {transaction.type !== 'transfer' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                              <select
                                value={transaction.category || ''}
                                onChange={(e) => {
                                  updateTransaction(index, 'category', e.target.value);
                                  updateTransaction(index, 'subcategory', '');
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Seleccionar</option>
                                {categories
                                  .filter(cat => cat.active && (cat.type === transaction.type || cat.type === 'both'))
                                  .map(category => (
                                    <option key={category.id} value={category.name}>{category.name}</option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {/* Subcategory */}
                          {transaction.type !== 'transfer' && transaction.category && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Subcategoria</label>
                              <select
                                value={transaction.subcategory || ''}
                                onChange={(e) => updateTransaction(index, 'subcategory', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Seleccionar</option>
                                {selectedCategory?.subcategories.map(subcategory => (
                                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* To Account (for transfers) */}
                          {transaction.type === 'transfer' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Conta Destino</label>
                              <select
                                value={transaction.toAccount || ''}
                                onChange={(e) => updateTransaction(index, 'toAccount', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Seleccionar</option>
                                {accounts
                                  .filter(a => a.status === 'active' && a.id !== transaction.account)
                                  .map(account => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            <Tag size={10} className="inline mr-1" />
                            Tags
                          </label>
                          <input
                            type="text"
                            value={transaction.tags.join(', ')}
                            onChange={(e) => updateTransaction(index, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                            placeholder="essencial, mensal (separadas por vírgulas)"
                          />
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            <MapPin size={10} className="inline mr-1" />
                            Localização
                          </label>
                          <input
                            type="text"
                            value={transaction.location || ''}
                            onChange={(e) => updateTransaction(index, 'location', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                            placeholder="Lisboa, Porto, etc."
                          />
                        </div>

                        {/* Associations */}
                        {transaction.type !== 'transfer' && (
                          <div className="grid grid-cols-3 gap-2">
                            {/* Asset Association */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                <Car size={10} className="inline mr-1" />
                                Ativo
                              </label>
                              <select
                                value={transaction.assetId || ''}
                                onChange={(e) => updateTransaction(index, 'assetId', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Nenhum</option>
                                {assets.filter(a => a.active).map(asset => (
                                  <option key={asset.id} value={asset.id}>
                                    {asset.type === 'vehicle' ? '🚗' : asset.type === 'property' ? '🏠' : asset.type === 'equipment' ? '💻' : '📦'} {asset.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Savings Goal Association */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                <Target size={10} className="inline mr-1" />
                                Poupança
                              </label>
                              <select
                                value={transaction.savingsGoalId || ''}
                                onChange={(e) => updateTransaction(index, 'savingsGoalId', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Nenhum</option>
                                {savingsGoals.filter(g => g.status === 'active').map(goal => (
                                  <option key={goal.id} value={goal.id}>
                                    🎯 {goal.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Recurring Transaction Association */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                <Repeat size={10} className="inline mr-1" />
                                Recorrente
                              </label>
                              <select
                                value={transaction.recurringTransactionId || ''}
                                onChange={(e) => updateTransaction(index, 'recurringTransactionId', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Nenhum</option>
                                {recurringTransactions.filter(r => r.active && r.type === transaction.type).map(recurring => (
                                  <option key={recurring.id} value={recurring.id}>
                                    🔄 {recurring.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-gray-600">Categoria:</span>
                            <span className="ml-1 font-medium">{transaction.category || 'Não definida'}</span>
                          </div>
                          {transaction.subcategory && (
                            <div>
                              <span className="text-gray-600">Subcategoria:</span>
                              <span className="ml-1 font-medium">{transaction.subcategory}</span>
                            </div>
                          )}
                          {transaction.entity && (
                            <div>
                              <span className="text-gray-600">Entidade:</span>
                              <span className="ml-1 font-medium">{transaction.entity}</span>
                            </div>
                          )}
                          {transaction.location && (
                            <div>
                              <span className="text-gray-600">Local:</span>
                              <span className="ml-1 font-medium">{transaction.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {transaction.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag size={10} className="text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {transaction.tags.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Associations */}
                        <div className="flex items-center space-x-2">
                          {transaction.assetId && (
                            <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded flex items-center">
                              {assets.find(a => a.id === transaction.assetId)?.type === 'vehicle' ? '🚗' : 
                               assets.find(a => a.id === transaction.assetId)?.type === 'property' ? '🏠' : 
                               assets.find(a => a.id === transaction.assetId)?.type === 'equipment' ? '💻' : '📦'} 
                              {assets.find(a => a.id === transaction.assetId)?.name}
                            </span>
                          )}
                          {transaction.savingsGoalId && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded flex items-center">
                              🎯 {savingsGoals.find(g => g.id === transaction.savingsGoalId)?.name}
                            </span>
                          )}
                          {transaction.recurringTransactionId && (
                            <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded flex items-center">
                              🔄 {recurringTransactions.find(r => r.id === transaction.recurringTransactionId)?.name}
                            </span>
                          )}
                          {transaction.type === 'transfer' && transaction.toAccount && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded flex items-center">
                              → {accounts.find(a => a.id === transaction.toAccount)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingIndex(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar Edição
                </button>
                <button
                  onClick={handleImportAll}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Importar {parsedTransactions.length} Transações
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};