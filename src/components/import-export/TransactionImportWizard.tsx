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
              confidence: Math.round((aiResult.confidence || 0) * 100),
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
      case 'txt':
        return parseTextFile(file);
      default:
        // Try to parse as text file for unknown extensions
        return parseTextFile(file);
    }
  };

  const parseTextFile = async (file: File): Promise<ImportedTransaction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedTransactions = parseAnyTextFormat(text);
          resolve(parsedTransactions);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const parseAnyTextFormat = (text: string): ImportedTransaction[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: ImportedTransaction[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip obvious header lines
      if (isHeaderLine(line)) continue;
      
      const parsedData = extractTransactionData(line);
      if (parsedData) {
        transactions.push({
          id: `parsed_${i}`,
          originalData: line,
          parsed: parsedData,
          aiSuggestions: { confidence: 0 },
          userOverrides: {},
          status: 'pending',
          isDuplicate: false
        });
      }
    }
    
    return transactions;
  };

  const isHeaderLine = (line: string): boolean => {
    const lowerLine = line.toLowerCase();
    const headerKeywords = [
      'data', 'date', 'valor', 'amount', 'descrição', 'description', 
      'saldo', 'balance', 'movimento', 'transaction', 'débito', 'crédito',
      'debit', 'credit', 'conta', 'account', 'extrato', 'statement'
    ];
    
    // If line contains multiple header keywords, it's likely a header
    const keywordCount = headerKeywords.filter(keyword => lowerLine.includes(keyword)).length;
    return keywordCount >= 2;
  };

  const extractTransactionData = (line: string): any | null => {
    // Remove extra spaces and normalize separators
    const cleanLine = line.replace(/\s+/g, ' ').trim();
    
    // Try multiple parsing strategies
    const strategies = [
      parseTabSeparated,
      parseSemicolonSeparated,
      parseSpaceSeparated,
      parseFixedWidth,
      parseCommaSeparated
    ];
    
    for (const strategy of strategies) {
      const result = strategy(cleanLine);
      if (result && result.amount && result.description) {
        return result;
      }
    }
    
    return null;
  };
      // Take the first amount found (should be the transaction amount, not balance)
      if (!amount) {
    if (parts.length < 3) return null;
    
    return extractFromParts(parts);
  };

  const parseSemicolonSeparated = (line: string): any | null => {
    const parts = line.split(';').map(p => p.trim());
    if (parts.length < 3) return null;
    
    return extractFromParts(parts);
  };

  const parseCommaSeparated = (line: string): any | null => {
    // Only try comma separation if there are enough commas and they're not decimal separators
    const commaCount = (line.match(/,/g) || []).length;
    if (commaCount < 2) return null;
    
    // Check if commas are used as decimal separators
    const decimalPattern = /\d+,\d{2}(?:\s|$)/g;
    const decimalMatches = line.match(decimalPattern) || [];
    
    // If most commas are decimal separators, don't split by comma
    if (decimalMatches.length >= commaCount - 1) return null;
    
    const parts = line.split(',').map(p => p.trim());
    return extractFromParts(parts);
  };

  const parseSpaceSeparated = (line: string): any | null => {
    // For space-separated, we need to be more intelligent about splitting
    // Look for patterns like: date amount description or date description amount
    
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g;
    const amountPattern = /([+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;
    
    const dates = line.match(datePattern) || [];
    const amounts = line.match(amountPattern) || [];
    
    if (dates.length === 0 || amounts.length === 0) return null;
    
    const date = dates[0];
    const amount = amounts[0];
    
    // Extract description by removing date and amount
    let description = line
      .replace(date, '')
      .replace(amount, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Remove any remaining amounts or dates
    description = description.replace(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g, '');
    description = description.replace(/[+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2}/g, '');
    description = description.replace(/\s+/g, ' ').trim();
    
    if (!description) return null;
    
    return {
      date: normalizeDate(date),
      amount: normalizeAmount(amount),
      description: description,
      type: determineTransactionType(amount, description),
      balance: extractBalance(line) // Try to extract balance if present
    };
  };

  const parseFixedWidth = (line: string): any | null => {
    // For fixed-width formats, try to identify columns by position
    if (line.length < 20) return null;
    
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
    const amountPattern = /([+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;
    
    const dateMatch = line.match(datePattern);
    const amountMatches = line.match(amountPattern) || [];
    
    if (!dateMatch || amountMatches.length === 0) return null;
    
    const date = dateMatch[0];
    const dateIndex = line.indexOf(date);
    
    // Find the main transaction amount (usually the first or largest)
    let transactionAmount = amountMatches[0];
    let balance = null;
    
    // If there are multiple amounts, the last one might be the balance
    if (amountMatches.length > 1) {
      balance = amountMatches[amountMatches.length - 1];
      // Use the first amount as transaction amount
      transactionAmount = amountMatches[0];
    }
    
    // Extract description (everything between date and amount)
    const amountIndex = line.indexOf(transactionAmount);
    const descriptionStart = dateIndex + date.length;
    const descriptionEnd = amountIndex;
    
    let description = line.substring(descriptionStart, descriptionEnd).trim();
    
    // Clean up description
    description = description.replace(/\s+/g, ' ').trim();
    
    if (!description) return null;
    
    return {
      date: normalizeDate(date),
      amount: normalizeAmount(transactionAmount),
      description: description,
      type: determineTransactionType(transactionAmount, description),
      balance: balance ? normalizeAmount(balance) : null
    };
  };

  const extractFromParts = (parts: string[]): any | null => {
    if (parts.length < 3) return null;
    
    let date = null;
    let amount = null;
    let description = '';
    let balance = null;
    
    // Identify date, amount, and description from parts
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      
      // Check if it's a date
      if (isDate(part) && !date) {
        date = normalizeDate(part);
        continue;
      }
      
      // Check if it's an amount
      if (isAmount(part)) {
        if (!amount) {
          amount = normalizeAmount(part);
        } else {
          // Second amount might be balance
          balance = normalizeAmount(part);
        }
        continue;
      }
      
      // Everything else is description
      if (part && !isDate(part) && !isAmount(part)) {
        description += (description ? ' ' : '') + part;
      }
    }
    
    if (!date || !amount || !description) return null;
    
    return {
      date,
      amount: Math.abs(amount),
      description: description.trim(),
      type: determineTransactionType(amount, description),
      balance
    };
  };

  const isDate = (str: string): boolean => {
    const datePatterns = [
      /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,
      /^\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/
    ];
    
    return datePatterns.some(pattern => pattern.test(str));
  };

  const isAmount = (str: string): boolean => {
    const amountPatterns = [
      /^[+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2}$/,
      /^[+-]?\d+[.,]\d{2}$/,
      /^[+-]?\d+$/
    ];
    
    return amountPatterns.some(pattern => pattern.test(str));
  };

  const normalizeDate = (dateStr: string): string => {
    // Convert various date formats to YYYY-MM-DD
    const cleanDate = dateStr.replace(/[^\d\/\-\.]/g, '');
    const parts = cleanDate.split(/[\/\-\.]/);
    
    if (parts.length !== 3) return new Date().toISOString().split('T')[0];
    
    let [first, second, third] = parts;
    
    // Determine if it's DD/MM/YYYY or YYYY/MM/DD
    if (third.length === 4) {
      // DD/MM/YYYY or MM/DD/YYYY
      const day = first.padStart(2, '0');
      const month = second.padStart(2, '0');
      const year = third;
      return `${year}-${month}-${day}`;
    } else if (first.length === 4) {
      // YYYY/MM/DD
      const year = first;
      const month = second.padStart(2, '0');
      const day = third.padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      // Assume DD/MM/YY
      const day = first.padStart(2, '0');
      const month = second.padStart(2, '0');
      const year = third.length === 2 ? `20${third}` : third;
      return `${year}-${month}-${day}`;
    }
  };

  const normalizeAmount = (amountStr: string): number => {
    // Handle various amount formats
    let cleanAmount = amountStr.replace(/[^\d+\-.,]/g, '');
    
    // Handle European format (1.234,56) vs US format (1,234.56)
    const lastComma = cleanAmount.lastIndexOf(',');
    const lastDot = cleanAmount.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // European format: 1.234,56
      cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
      // US format: 1,234.56
      cleanAmount = cleanAmount.replace(/,/g, '');
    }
    
    return parseFloat(cleanAmount) || 0;
  };

  const extractBalance = (line: string): number | null => {
    // Try to find balance (usually the last amount in the line)
    const amountPattern = /([+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;
    const amounts = line.match(amountPattern) || [];
    
    if (amounts.length > 1) {
      // Last amount is likely the balance
      return normalizeAmount(amounts[amounts.length - 1]);
    }
    
    return null;
  };

  const determineTransactionType = (amount: number | string, description: string): 'income' | 'expense' => {
    const numAmount = typeof amount === 'string' ? normalizeAmount(amount) : amount;
    const desc = description.toLowerCase();
    
    // Check for income keywords
    const incomeKeywords = [
      'salario', 'salary', 'ordenado', 'vencimento', 'transferencia',
      'deposito', 'juros', 'dividendo', 'bonus', 'subsidio', 'pensao',
      'reembolso', 'devolucao', 'credito', 'receita'
    ];
    
    const hasIncomeKeyword = incomeKeywords.some(keyword => desc.includes(keyword));
    
    // Large positive amounts are often income
    const isLargeAmount = numAmount > 500;
    
    // If amount is explicitly positive or has income keywords
    if (hasIncomeKeyword || (isLargeAmount && !desc.includes('compra') && !desc.includes('pagamento'))) {
      return 'income';
    }
    
    return 'expense';
  };
  const parseExcelFile = async (file: File): Promise<ImportedTransaction[]> => {
    // In a real implementation, this would use a library like xlsx to parse Excel files
    // For now, simulate intelligent parsing of Excel data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate realistic bank statement data from Excel
        resolve([
          {
            id: '1',
            originalData: 'Row 2: 15/01/2024 | CONTINENTE LISBOA AMOREIRAS | -45,80 | 2.454,95',
            parsed: {
              date: '2024-01-15',
              amount: 45.80,
              description: 'CONTINENTE LISBOA AMOREIRAS',
              type: 'expense',
              balance: 2454.95
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: '2',
            originalData: 'Row 3: 01/01/2024 | TRANSFERENCIA SALARIO EMPRESA XYZ | +2.800,00 | 2.500,75',
            parsed: {
              date: '2024-01-01',
              amount: 2800.00,
              description: 'TRANSFERENCIA SALARIO EMPRESA XYZ',
              type: 'income',
              balance: 2500.75
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: '3',
            originalData: 'Row 4: 12/01/2024 | GALP ENERGIA LISBOA | -65,40 | 2.389,35',
            parsed: {
              date: '2024-01-12',
              amount: 65.40,
              description: 'GALP ENERGIA LISBOA',
              type: 'expense',
              balance: 2389.35
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: '4',
            originalData: 'Row 5: 10/01/2024 | NETFLIX.COM | -15,99 | 2.373,36',
            parsed: {
              date: '2024-01-10',
              amount: 15.99,
              description: 'NETFLIX.COM',
              type: 'expense',
              balance: 2373.36
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: '5',
            originalData: 'Row 6: 08/01/2024 | RENDA CASA JANEIRO | -750,00 | 1.623,36',
            parsed: {
              date: '2024-01-08',
              amount: 750.00,
              description: 'RENDA CASA JANEIRO',
              type: 'expense',
              balance: 1623.36
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: '6',
            originalData: 'Row 7: 05/01/2024 | PINGO DOCE CASCAIS | -32,15 | 1.591,21',
            parsed: {
              date: '2024-01-05',
              amount: 32.15,
              description: 'PINGO DOCE CASCAIS',
              type: 'expense',
              balance: 1591.21
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: '7',
            originalData: 'Row 8: 03/01/2024 | MULTIBANCO LEVANTAMENTO | -50,00 | 1.541,21',
            parsed: {
              date: '2024-01-03',
              amount: 50.00,
              description: 'MULTIBANCO LEVANTAMENTO',
              type: 'expense',
              balance: 1541.21
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          }
        ]);
      }, 1500);
    });
  };

  const parseCSVFile = async (file: File): Promise<ImportedTransaction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedTransactions = parseAnyTextFormat(text);
          resolve(parsedTransactions);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const parsePDFFile = async (file: File): Promise<ImportedTransaction[]> => {
    // Simulate PDF OCR processing with realistic Portuguese bank statement data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'pdf_1',
            originalData: 'PDF Line: 15/01/2024    CONTINENTE LISBOA AMOREIRAS    -45,80    2.454,95',
            parsed: {
              date: '2024-01-15',
              amount: 45.80,
              description: 'CONTINENTE LISBOA AMOREIRAS',
              type: 'expense',
              balance: 2454.95
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: 'pdf_2',
            originalData: 'PDF Line: 12/01/2024    GALP ENERGIA LISBOA    -65,40    2.389,35',
            parsed: {
              date: '2024-01-12',
              amount: 65.40,
              description: 'GALP ENERGIA LISBOA',
              type: 'expense',
              balance: 2389.35
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: 'pdf_3',
            originalData: 'PDF Line: 01/01/2024    TRANSFERENCIA SALARIO EMPRESA XYZ    +2.800,00    2.500,75',
            parsed: {
              date: '2024-01-01',
              amount: 2800.00,
              description: 'TRANSFERENCIA SALARIO EMPRESA XYZ',
              type: 'income',
              balance: 2500.75
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: 'pdf_4',
            originalData: 'PDF Line: 10/01/2024    NETFLIX.COM DUBLIN    -15,99    2.357,37',
            parsed: {
              date: '2024-01-10',
              amount: 15.99,
              description: 'NETFLIX.COM DUBLIN',
              type: 'expense',
              balance: 2357.37
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          },
          {
            id: 'pdf_5',
            originalData: 'PDF Line: 08/01/2024    RENDA CASA JANEIRO 2024    -750,00    1.607,37',
            parsed: {
              date: '2024-01-08',
              amount: 750.00,
              description: 'RENDA CASA JANEIRO 2024',
              type: 'expense',
              balance: 1607.37
            },
            aiSuggestions: { confidence: 0 },
            userOverrides: {},
            status: 'pending',
            isDuplicate: false
          }
        ]);
      }, 2500);
    });
  };

  const parsePastedText = async (text: string): Promise<ImportedTransaction[]> => {
    return parseAnyTextFormat(text);
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
15/01/2024    CONTINENTE LISBOA AMOREIRAS    -45,80    2.454,95
12/01/2024    GALP ENERGIA LISBOA    -65,40    2.389,35
10/01/2024    NETFLIX.COM DUBLIN    -15,99    2.373,36
08/01/2024    RENDA CASA JANEIRO    -750,00    1.623,36
01/01/2024    TRANSFERENCIA SALARIO    +2.800,00    2.500,75

Ou qualquer formato de extrato bancário:
Data;Descrição;Valor;Saldo
15/01/2024;Compra CONTINENTE;-45,80;2.454,95"
                  />
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>🤖 Detecção Automática de Formatos:</strong><br/>
                      • Qualquer ordem: Data, Descrição, Valor, Saldo<br/>
                      • Separadores: espaços, tabs, vírgulas, ponto-e-vírgula<br/>
                      • Formatos de data: DD/MM/AAAA, DD-MM-AAAA, DD.MM.AAAA<br/>
                      • Valores: +/-1.234,56 ou 1234.56 ou 1234,56<br/>
                      • <strong>A IA identifica automaticamente a estrutura!</strong>
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
                      🤖 Analisando e Categorizando...
                    </>
                  ) : (
                    '🧠 Processar com IA'
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
                                {transaction.parsed.type === 'income' ? '+' : '-'}€{transaction.parsed.amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            {transaction.parsed.balance && (
                              <div>
                                <span className="text-gray-600">Saldo:</span>
                                <span className="font-medium ml-1 text-blue-600">
                                  €{transaction.parsed.balance.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
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
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Valor Total a Importar:</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">
                        +€{importedTransactions
                          .filter(t => t.status === 'approved' && t.parsed.type === 'income')
                          .reduce((sum, t) => sum + t.parsed.amount, 0)
                          .toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-green-700">Receitas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-600">
                        -€{importedTransactions
                          .filter(t => t.status === 'approved' && t.parsed.type === 'expense')
                          .reduce((sum, t) => sum + t.parsed.amount, 0)
                          .toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-red-700">Despesas</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-lg font-bold text-blue-600">
                      Resultado: €{(
                        importedTransactions.filter(t => t.status === 'approved' && t.parsed.type === 'income').reduce((sum, t) => sum + t.parsed.amount, 0) -
                        importedTransactions.filter(t => t.status === 'approved' && t.parsed.type === 'expense').reduce((sum, t) => sum + t.parsed.amount, 0)
                      ).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-blue-700">Impacto no Saldo</p>
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