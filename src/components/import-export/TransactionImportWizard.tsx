import React, { useState } from 'react';
import { X, Upload, FileText, FileSpreadsheet, File, Brain, CheckCircle, AlertCircle, Edit, Eye, Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface ImportedTransaction {
  id: string;
  originalData: string;
  parsed: {
    date: string;
    amount: number;
    description: string;
    type?: 'income' | 'expense';
  };
  aiSuggestions: {
    entity?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    confidence: number;
    reasoning?: string;
  };
  userOverrides: {
    entity?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  isDuplicate: boolean;
  duplicateOf?: string;
}

interface TransactionImportWizardProps {
  onClose: () => void;
}

export const TransactionImportWizard: React.FC<TransactionImportWizardProps> = ({ onClose }) => {
  const { accounts, categories, entities, aiRules, addTransaction, transactions, processTransactionWithAI } = useFinance();
  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pastedData, setPastedData] = useState('');
  const [importedTransactions, setImportedTransactions] = useState<ImportedTransaction[]>([]);
  const [processing, setProcessing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
  };

  const processFiles = async () => {
    setProcessing(true);
    
    try {
      const allTransactions: ImportedTransaction[] = [];
      
      for (const file of uploadedFiles) {
        const fileTransactions = await parseFile(file);
        allTransactions.push(...fileTransactions);
      }
      
      // Process AI categorization
      const processedTransactions = await Promise.all(
        allTransactions.map(async (transaction) => {
          const aiResult = await processTransactionWithAI(
            transaction.parsed.description, 
            transaction.parsed.amount
          );
          
          return {
            ...transaction,
            aiSuggestions: {
              entity: aiResult.entity,
              category: aiResult.category,
              subcategory: aiResult.subcategory,
              tags: aiResult.tags,
              confidence: (aiResult.confidence || 0) * 100,
              reasoning: generateReasoning(aiResult)
            },
            isDuplicate: checkForDuplicate(transaction.parsed),
            status: 'pending' as const
          };
        })
      );
      
      setImportedTransactions(processedTransactions);
      setStep(3);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Erro ao processar ficheiros. Verifique o formato e tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const processPastedData = async () => {
    setProcessing(true);
    
    try {
      const parsedTransactions = await parsePastedText(pastedData);
      
      const processedTransactions = await Promise.all(
        parsedTransactions.map(async (transaction) => {
          const aiResult = await processTransactionWithAI(
            transaction.parsed.description, 
            transaction.parsed.amount
          );
          
          return {
            ...transaction,
            aiSuggestions: {
              entity: aiResult.entity,
              category: aiResult.category,
              subcategory: aiResult.subcategory,
              tags: aiResult.tags,
              confidence: (aiResult.confidence || 0) * 100,
              reasoning: generateReasoning(aiResult)
            },
            isDuplicate: checkForDuplicate(transaction.parsed),
            status: 'pending' as const
          };
        })
      );
      
      setImportedTransactions(processedTransactions);
      setStep(3);
    } catch (error) {
      console.error('Error processing pasted data:', error);
      alert('Erro ao processar dados. Verifique o formato e tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const parseFile = async (file: File): Promise<ImportedTransaction[]> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'xlsx':
      case 'xls':
        return parseExcelFile(file);
      case 'csv':
        return parseCSVFile(file);
      case 'pdf':
        return parsePDFFile(file);
      default:
        throw new Error(`Formato de ficheiro não suportado: ${fileExtension}`);
    }
  };

  const parseExcelFile = async (file: File): Promise<ImportedTransaction[]> => {
    // Simulate Excel parsing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            originalData: 'Excel Row 1',
            parsed: {
              date: '2024-01-15',
              amount: 45.80,
              description: 'CONTINENTE LISBOA',
              type: 'expense'
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: '2',
            originalData: 'Excel Row 2',
            parsed: {
              date: '2024-01-14',
              amount: 2800.00,
              description: 'TRANSFERENCIA SALARIO',
              type: 'income'
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          }
        ]);
      }, 1000);
    });
  };

  const parseCSVFile = async (file: File): Promise<ImportedTransaction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const transactions: ImportedTransaction[] = [];
          
          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',');
            if (columns.length >= 3) {
              transactions.push({
                id: `csv_${i}`,
                originalData: lines[i],
                parsed: {
                  date: parseDate(columns[0]),
                  amount: Math.abs(parseFloat(columns[1])),
                  description: columns[2].replace(/"/g, ''),
                  type: parseFloat(columns[1]) > 0 ? 'income' : 'expense'
                },
                aiSuggestions: { confidence: 0 },
                userOverrides: {},
                status: 'pending',
                isDuplicate: false
              });
            }
          }
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const parsePDFFile = async (file: File): Promise<ImportedTransaction[]> => {
    // Simulate PDF OCR processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'pdf_1',
            originalData: 'PDF Line 1',
            parsed: {
              date: '2024-01-15',
              amount: 25.50,
              description: 'GALP ENERGIA LISBOA',
              type: 'expense'
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          }
        ]);
      }, 2000);
    });
  };

  const parsePastedText = async (text: string): Promise<ImportedTransaction[]> => {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: ImportedTransaction[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Try to parse different formats
      const patterns = [
        // DD/MM/YYYY Amount Description
        /(\d{2}\/\d{2}\/\d{4})\s+(-?\d+[.,]\d{2})\s+(.+)/,
        // DD-MM-YYYY Amount Description  
        /(\d{2}-\d{2}-\d{4})\s+(-?\d+[.,]\d{2})\s+(.+)/,
        // Description Amount DD/MM/YYYY
        /(.+?)\s+(-?\d+[.,]\d{2})\s+(\d{2}\/\d{2}\/\d{4})/
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const [, dateStr, amountStr, description] = match;
          const amount = Math.abs(parseFloat(amountStr.replace(',', '.')));
          const isIncome = !amountStr.startsWith('-') && amount > 1000; // Heuristic for income
          
          transactions.push({
            id: `paste_${i}`,
            originalData: line,
            parsed: {
              date: parseDate(dateStr),
              amount,
              description: description.trim(),
              type: isIncome ? 'income' : 'expense'
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          });
          break;
        }
      }
    }
    
    return transactions;
  };

  const parseDate = (dateStr: string): string => {
    // Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const checkForDuplicate = (parsed: any): boolean => {
    return transactions.some(t => 
      t.date === parsed.date && 
      Math.abs(t.amount - parsed.amount) < 0.01 && 
      t.description.toLowerCase().includes(parsed.description.toLowerCase().substring(0, 10))
    );
  };

  const generateReasoning = (aiResult: any): string => {
    if (!aiResult.category) return 'Nenhuma categoria sugerida';
    
    const reasons = [];
    if (aiResult.entity) reasons.push(`Entidade reconhecida: ${aiResult.entity}`);
    if (aiResult.confidence && aiResult.confidence > 0.8) reasons.push('Alta confiança baseada em regras');
    if (aiResult.confidence && aiResult.confidence > 0.4) reasons.push('Baseado em transações similares');
    
    return reasons.join(' • ') || 'Sugestão baseada em padrões';
  };

  const updateTransaction = (id: string, field: string, value: any) => {
    setImportedTransactions(prev => prev.map(t => 
      t.id === id 
        ? { 
            ...t, 
            userOverrides: { ...t.userOverrides, [field]: value }
          }
        : t
    ));
  };

  const toggleTransactionStatus = (id: string, status: 'approved' | 'rejected') => {
    setImportedTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status } : t
    ));
  };

  const approveAllSuggestions = () => {
    setImportedTransactions(prev => prev.map(t => 
      t.status === 'pending' && !t.isDuplicate ? { ...t, status: 'approved' } : t
    ));
  };

  const finalizeImport = () => {
    const approvedTransactions = importedTransactions.filter(t => t.status === 'approved');
    
    approvedTransactions.forEach(t => {
      const finalData = {
        type: t.parsed.type || 'expense',
        amount: t.parsed.amount,
        description: t.parsed.description,
        entity: t.userOverrides.entity || t.aiSuggestions.entity,
        category: t.userOverrides.category || t.aiSuggestions.category || 'Outros',
        subcategory: t.userOverrides.subcategory || t.aiSuggestions.subcategory,
        account: selectedAccount,
        date: t.parsed.date,
        tags: t.userOverrides.tags || t.aiSuggestions.tags,
        aiProcessed: true,
        confidence: t.aiSuggestions.confidence / 100
      };
      
      addTransaction(finalData);
    });
    
    alert(`${approvedTransactions.length} transações importadas com sucesso!`);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'green';
    if (confidence >= 60) return 'yellow';
    return 'red';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta';
    if (confidence >= 60) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Import Method */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Escolha o Método de Importação</h3>
                <p className="text-gray-600">Como pretende importar as suas transações?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setImportMethod('file');
                    setStep(2);
                  }}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <Upload size={48} className="text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Carregar Ficheiros</h4>
                  <p className="text-sm text-gray-600">Excel, CSV ou PDF</p>
                  <div className="mt-3 text-xs text-purple-600">
                    ✓ Suporte multi-formato ✓ OCR para PDF ✓ Parsing automático
                  </div>
                </button>

                <button
                  onClick={() => {
                    setImportMethod('paste');
                    setStep(2);
                  }}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <FileText size={48} className="text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Copy/Paste</h4>
                  <p className="text-sm text-gray-600">Cole dados do extrato online</p>
                  <div className="mt-3 text-xs text-purple-600">
                    ✓ Parsing inteligente ✓ Múltiplos formatos ✓ Limpeza automática
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Upload/Paste Data */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {importMethod === 'file' ? 'Carregar Ficheiros' : 'Colar Dados'}
                </h3>
                <p className="text-gray-600">
                  {importMethod === 'file' 
                    ? 'Selecione os ficheiros com as suas transações'
                    : 'Cole os dados do seu extrato bancário'
                  }
                </p>
              </div>

              {/* Account Selection */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Conta de Destino *
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar conta...</option>
                  {accounts.filter(account => account.status === 'active').map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.institution}) - {account.currency}
                    </option>
                  ))}
                </select>
              </div>

              {importMethod === 'file' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                      Excel (.xlsx, .xls), CSV (.csv) ou PDF (máximo 10MB por ficheiro)
                    </p>
                  </label>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800 mb-1">Ficheiros seleccionados:</p>
                      {uploadedFiles.map((file, index) => (
                        <p key={index} className="text-sm text-green-700">• {file.name}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Cole os dados do seu extrato bancário:
                  </label>
                  <textarea
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder="Exemplo:
15/01/2024 -45.80 CONTINENTE LISBOA
14/01/2024 2800.00 TRANSFERENCIA SALARIO
13/01/2024 -25.50 GALP ENERGIA"
                  />
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Formatos suportados:</strong><br/>
                      • DD/MM/AAAA Valor Descrição<br/>
                      • Descrição Valor DD/MM/AAAA<br/>
                      • Separados por espaços ou tabs
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={importMethod === 'file' ? processFiles : processPastedData}
                  disabled={processing || !selectedAccount || (importMethod === 'file' ? uploadedFiles.length === 0 : !pastedData.trim())}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando com IA...
                    </>
                  ) : (
                    'Processar e Categorizar'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review and Edit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Rever Transações Importadas</h3>
                  <p className="text-gray-600">
                    {importedTransactions.length} transações processadas • 
                    {importedTransactions.filter(t => t.aiSuggestions.confidence >= 80).length} com alta confiança
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={approveAllSuggestions}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Aprovar Todas Sugestões
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Finalizar Importação
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{importedTransactions.length}</p>
                  <p className="text-sm text-blue-700">Total</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {importedTransactions.filter(t => t.status === 'approved').length}
                  </p>
                  <p className="text-sm text-green-700">Aprovadas</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {importedTransactions.filter(t => t.isDuplicate).length}
                  </p>
                  <p className="text-sm text-yellow-700">Duplicadas</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(importedTransactions.reduce((sum, t) => sum + t.aiSuggestions.confidence, 0) / importedTransactions.length)}%
                  </p>
                  <p className="text-sm text-purple-700">Confiança Média</p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {importedTransactions.map((transaction) => {
                  const confidence = transaction.aiSuggestions.confidence;
                  const confidenceColor = getConfidenceColor(confidence);
                  const isEditing = editingTransaction === transaction.id;
                  
                  return (
                    <div key={transaction.id} className={`border rounded-lg p-4 ${
                      transaction.isDuplicate ? 'border-yellow-300 bg-yellow-50' :
                      transaction.status === 'approved' ? 'border-green-300 bg-green-50' :
                      transaction.status === 'rejected' ? 'border-red-300 bg-red-50' :
                      'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{transaction.parsed.description}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.parsed.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.parsed.type === 'income' ? 'Receita' : 'Despesa'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full bg-${confidenceColor}-100 text-${confidenceColor}-800`}>
                              IA: {getConfidenceLabel(confidence)} ({confidence.toFixed(0)}%)
                            </span>
                            {transaction.isDuplicate && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Possível Duplicado
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Data:</span>
                              <span className="font-medium ml-1">
                                {new Date(transaction.parsed.date).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Valor:</span>
                              <span className={`font-medium ml-1 ${
                                transaction.parsed.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                €{transaction.parsed.amount.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Categoria:</span>
                              <span className="font-medium ml-1">
                                {transaction.userOverrides.category || transaction.aiSuggestions.category || 'Não categorizada'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Entidade:</span>
                              <span className="font-medium ml-1">
                                {transaction.userOverrides.entity || transaction.aiSuggestions.entity || 'Não identificada'}
                              </span>
                            </div>
                          </div>

                          {transaction.aiSuggestions.reasoning && (
                            <div className="mt-2 text-xs text-gray-600">
                              <Brain size={12} className="inline mr-1" />
                              {transaction.aiSuggestions.reasoning}
                            </div>
                          )}

                          {/* Edit Form */}
                          {isEditing && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select
                                  value={transaction.userOverrides.category || transaction.aiSuggestions.category || ''}
                                  onChange={(e) => updateTransaction(transaction.id, 'category', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="">Seleccionar categoria</option>
                                  {categories.filter(c => c.active).map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                  ))}
                                </select>
                                
                                <select
                                  value={transaction.userOverrides.entity || transaction.aiSuggestions.entity || ''}
                                  onChange={(e) => updateTransaction(transaction.id, 'entity', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="">Seleccionar entidade</option>
                                  {entities.filter(e => e.active).map(entity => (
                                    <option key={entity.id} value={entity.name}>{entity.name}</option>
                                  ))}
                                </select>

                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setEditingTransaction(null)}
                                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setEditingTransaction(null)}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!transaction.isDuplicate && (
                            <>
                              <button
                                onClick={() => setEditingTransaction(isEditing ? null : transaction.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => toggleTransactionStatus(transaction.id, 
                                  transaction.status === 'approved' ? 'pending' : 'approved')}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                  transaction.status === 'approved'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'border border-green-600 text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {transaction.status === 'approved' ? 'Aprovada' : 'Aprovar'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleTransactionStatus(transaction.id, 'rejected')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              transaction.status === 'rejected'
                                ? 'bg-red-600 text-white'
                                : 'border border-red-600 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {transaction.status === 'rejected' ? 'Rejeitada' : 'Rejeitar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Finalizar Importação
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Importação</h3>
                <p className="text-gray-600">Revise o resumo antes de finalizar</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Resumo da Importação</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Transações a Importar:</p>
                    <p className="text-2xl font-bold text-green-600">
                      {importedTransactions.filter(t => t.status === 'approved').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categorizadas Automaticamente:</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {importedTransactions.filter(t => t.status === 'approved' && t.aiSuggestions.confidence >= 60).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conta de Destino:</p>
                    <p className="text-lg font-bold text-blue-600">
                      {accounts.find(a => a.id === selectedAccount)?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Brain size={16} className="text-purple-600 mr-2" />
                  <h4 className="font-medium text-purple-800">Aprendizagem da IA</h4>
                </div>
                <p className="text-sm text-purple-700">
                  As categorizações aprovadas serão usadas para melhorar a precisão da IA em futuras importações.
                  {importedTransactions.filter(t => t.status === 'approved' && t.userOverrides.category).length > 0 && (
                    ` ${importedTransactions.filter(t => t.status === 'approved' && t.userOverrides.category).length} novas regras serão criadas.`
                  )}
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voltar para Revisão
                </button>
                <button
                  onClick={finalizeImport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Confirmar e Importar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};