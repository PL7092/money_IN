import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  account: string;
  toAccount?: string; // For transfers
  date: string;
  recurring?: boolean;
  recurringId?: string;
  tags?: string[];
  location?: string;
  receipt?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  initialBalance: number;
  initialBalanceDate: string;
  currency: string;
  institution: string;
  color: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: 'active' | 'archived';
    date: string;
    reason?: string;
  }>;
  uploadConfig?: {
    preferredFormat: 'pdf' | 'excel' | 'csv';
    pdfConfig?: {
      datePattern: string;
      amountPattern: string;
      descriptionPattern: string;
      dateFormat: string;
      amountColumn: string;
      descriptionColumn: string;
      skipLines: number;
      encoding: string;
    };
    excelConfig?: {
      sheetName: string;
      headerRow: number;
      dateColumn: string;
      amountColumn: string;
      descriptionColumn: string;
      categoryColumn?: string;
      dateFormat: string;
      skipRows: number;
    };
    csvConfig?: {
      delimiter: string;
      headerRow: number;
      dateColumn: number;
      amountColumn: number;
      descriptionColumn: number;
      categoryColumn?: number;
      dateFormat: string;
      encoding: string;
    };
    autoCategorizationRules?: Array<{
      id: string;
      pattern: string;
      category: string;
      subcategory?: string;
      type: 'income' | 'expense';
      priority: number;
      active: boolean;
    }>;
  };
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  alerts: boolean;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDate: string;
  endDate?: string;
  active: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: 'vehicle' | 'property' | 'equipment';
  value: number;
  purchaseDate: string;
  documents: string[];
  insurance?: {
    company: string;
    policy: string;
    expiryDate: string;
  };
  maintenance?: Array<{
    date: string;
    description: string;
    cost: number;
    nextDue?: string;
  }>;
}

export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'emergency' | 'vacation' | 'house' | 'car' | 'education' | 'retirement' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  linkedAccount?: string;
  monthlyContribution?: number;
  autoTransfer: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  milestones: Array<{
    percentage: number;
    amount: number;
    achievedAt?: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    date: string;
    description: string;
  }>;
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  assets: Asset[];
  savingsGoals: SavingsGoal[];
  categories: string[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'transactions'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addSavingsTransaction: (goalId: string, transaction: Omit<SavingsGoal['transactions'][0], 'id'>) => void;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getCategoryExpenses: () => Array<{ category: string; amount: number }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  const categories = [
    'Alimentação', 'Transporte', 'Habitação', 'Saúde', 'Educação',
    'Entretenimento', 'Compras', 'Seguros', 'Investimentos', 'Outros'
  ];

  // Initialize with mock data
  useEffect(() => {
    const mockAccounts: Account[] = [
      {
        id: '1',
        name: 'Conta Corrente Principal',
        type: 'checking',
        balance: 2500.75,
        initialBalance: 1000.00,
        initialBalanceDate: '2023-01-01',
        currency: 'EUR',
        institution: 'Banco Exemplo',
        color: '#3B82F6',
        status: 'active',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        statusHistory: [
          { status: 'active', date: '2023-01-01T10:00:00Z' }
        ]
      },
      {
        id: '2',
        name: 'Poupança',
        type: 'savings',
        balance: 15000.00,
        initialBalance: 10000.00,
        initialBalanceDate: '2023-02-15',
        currency: 'EUR',
        institution: 'Banco Exemplo',
        color: '#059669',
        status: 'active',
        createdAt: '2023-02-15T09:15:00Z',
        updatedAt: '2023-02-15T09:15:00Z',
        statusHistory: [
          { status: 'active', date: '2023-02-15T09:15:00Z' }
        ]
      },
      {
        id: '3',
        name: 'Cartão de Crédito',
        type: 'credit',
        balance: -850.25,
        initialBalance: 0.00,
        initialBalanceDate: '2023-03-01',
        currency: 'EUR',
        institution: 'Banco Crédito',
        color: '#DC2626',
        status: 'active',
        createdAt: '2023-03-01T11:20:00Z',
        updatedAt: '2024-01-10T16:45:00Z',
        statusHistory: [
          { status: 'active', date: '2023-03-01T11:20:00Z' }
        ]
      },
      {
        id: '4',
        name: 'Conta Antiga',
        type: 'checking',
        balance: 0.00,
        initialBalance: 500.00,
        initialBalanceDate: '2022-06-01',
        currency: 'EUR',
        institution: 'Banco Antigo',
        color: '#6B7280',
        status: 'archived',
        createdAt: '2022-06-01T08:00:00Z',
        updatedAt: '2023-12-31T23:59:00Z',
        statusHistory: [
          { status: 'active', date: '2022-06-01T08:00:00Z' },
          { status: 'archived', date: '2023-12-31T23:59:00Z', reason: 'Conta encerrada' }
        ]
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'expense',
        amount: 45.80,
        description: 'Supermercado Continente',
        category: 'Alimentação',
        account: '1',
        date: new Date().toISOString().split('T')[0],
        tags: ['supermercado', 'essencial']
      },
      {
        id: '2',
        type: 'income',
        amount: 2800.00,
        description: 'Salário Mensal',
        category: 'Salário',
        account: '1',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: '3',
        type: 'expense',
        amount: 25.00,
        description: 'Combustível',
        category: 'Transporte',
        account: '1',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    const mockBudgets: Budget[] = [
      {
        id: '1',
        category: 'Alimentação',
        limit: 400.00,
        spent: 245.80,
        period: 'monthly',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        alerts: true
      },
      {
        id: '2',
        category: 'Transporte',
        limit: 200.00,
        spent: 125.00,
        period: 'monthly',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        alerts: true
      }
    ];

    setAccounts(mockAccounts);
    setTransactions(mockTransactions);
    setBudgets(mockBudgets);

    // Mock savings goals
    const mockSavingsGoals: SavingsGoal[] = [
      {
        id: '1',
        name: 'Fundo de Emergência',
        description: 'Reserva para emergências equivalente a 6 meses de despesas',
        targetAmount: 15000,
        currentAmount: 8500,
        targetDate: '2024-12-31',
        category: 'emergency',
        priority: 'high',
        status: 'active',
        linkedAccount: '2',
        monthlyContribution: 500,
        autoTransfer: true,
        createdAt: '2023-06-01T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        milestones: [
          { percentage: 25, amount: 3750, achievedAt: '2023-08-15T10:00:00Z' },
          { percentage: 50, amount: 7500, achievedAt: '2023-11-20T10:00:00Z' },
          { percentage: 75, amount: 11250 }
        ],
        transactions: [
          {
            id: '1',
            amount: 500,
            type: 'deposit',
            date: '2024-01-15',
            description: 'Contribuição mensal automática'
          },
          {
            id: '2',
            amount: 300,
            type: 'deposit',
            date: '2024-01-10',
            description: 'Bónus de fim de ano'
          }
        ]
      },
      {
        id: '2',
        name: 'Férias na Tailândia',
        description: 'Viagem de 2 semanas para a Tailândia',
        targetAmount: 3500,
        currentAmount: 1200,
        targetDate: '2024-08-15',
        category: 'vacation',
        priority: 'medium',
        status: 'active',
        linkedAccount: '2',
        monthlyContribution: 300,
        autoTransfer: false,
        createdAt: '2023-10-01T10:00:00Z',
        updatedAt: '2024-01-10T16:20:00Z',
        milestones: [
          { percentage: 25, amount: 875, achievedAt: '2023-12-01T10:00:00Z' },
          { percentage: 50, amount: 1750 },
          { percentage: 75, amount: 2625 }
        ],
        transactions: [
          {
            id: '1',
            amount: 300,
            type: 'deposit',
            date: '2024-01-01',
            description: 'Poupança mensal'
          }
        ]
      },
      {
        id: '3',
        name: 'Entrada para Casa',
        description: 'Entrada para compra de habitação própria',
        targetAmount: 50000,
        currentAmount: 50000,
        targetDate: '2023-12-31',
        category: 'house',
        priority: 'high',
        status: 'completed',
        linkedAccount: '2',
        monthlyContribution: 800,
        autoTransfer: true,
        createdAt: '2021-01-01T10:00:00Z',
        updatedAt: '2023-12-31T23:59:00Z',
        completedAt: '2023-12-31T23:59:00Z',
        milestones: [
          { percentage: 25, amount: 12500, achievedAt: '2021-08-15T10:00:00Z' },
          { percentage: 50, amount: 25000, achievedAt: '2022-06-20T10:00:00Z' },
          { percentage: 75, amount: 37500, achievedAt: '2023-04-10T10:00:00Z' },
          { percentage: 100, amount: 50000, achievedAt: '2023-12-31T23:59:00Z' }
        ],
        transactions: []
      }
    ];

    setSavingsGoals(mockSavingsGoals);
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [...prev, newTransaction]);

    // Update account balances
    if (transaction.type === 'transfer') {
      // For transfers, subtract from source account and add to destination account
      setAccounts(prev => prev.map(account => {
        if (account.id === transaction.account) {
          return { ...account, balance: account.balance - transaction.amount };
        }
        if (account.id === transaction.toAccount) {
          return { ...account, balance: account.balance + transaction.amount };
        }
        return account;
      }));
    } else {
      // For income/expense, update single account
      const isIncome = transaction.type === 'income';
      setAccounts(prev => prev.map(account => 
        account.id === transaction.account
          ? { ...account, balance: account.balance + (isIncome ? transaction.amount : -transaction.amount) }
          : account
      ));
    }

    // Update budget spent amount (only for expenses, not transfers)
    if (transaction.type === 'expense') {
      setBudgets(prev => prev.map(budget =>
        budget.category === transaction.category
          ? { ...budget, spent: budget.spent + transaction.amount }
          : budget
      ));
    }
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction =>
      transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
    ));
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Revert account balances
      if (transaction.type === 'transfer') {
        // For transfers, revert both accounts
        setAccounts(prev => prev.map(account => {
          if (account.id === transaction.account) {
            return { ...account, balance: account.balance + transaction.amount };
          }
          if (account.id === transaction.toAccount) {
            return { ...account, balance: account.balance - transaction.amount };
          }
          return account;
        }));
      } else {
        // For income/expense, revert single account
        const isIncome = transaction.type === 'income';
        setAccounts(prev => prev.map(account => 
          account.id === transaction.account
            ? { ...account, balance: account.balance - (isIncome ? transaction.amount : -transaction.amount) }
            : account
        ));
      }

      // Revert budget spent amount (only for expenses, not transfers)
      if (transaction.type === 'expense') {
        setBudgets(prev => prev.map(budget =>
          budget.category === transaction.category
            ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
            : budget
        ));
      }
    }
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        { status: 'active', date: new Date().toISOString() }
      ]
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (id: string, updatedAccount: Partial<Account>) => {
    const now = new Date().toISOString();
    setAccounts(prev => prev.map(account =>
      account.id === id ? { 
        ...account, 
        ...updatedAccount, 
        updatedAt: now,
        statusHistory: updatedAccount.status && updatedAccount.status !== account.status
          ? [...account.statusHistory, { status: updatedAccount.status, date: now }]
          : account.statusHistory
      } : account
    ));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id: string, updatedBudget: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget =>
      budget.id === id ? { ...budget, ...updatedBudget } : budget
    ));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  };

  const addRecurringTransaction = (transaction: Omit<RecurringTransaction, 'id'>) => {
    const newTransaction: RecurringTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setRecurringTransactions(prev => [...prev, newTransaction]);
  };

  const updateRecurringTransaction = (id: string, updatedTransaction: Partial<RecurringTransaction>) => {
    setRecurringTransactions(prev => prev.map(transaction =>
      transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
    ));
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const addAsset = (asset: Omit<Asset, 'id'>) => {
    const newAsset: Asset = {
      ...asset,
      id: Date.now().toString()
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const updateAsset = (id: string, updatedAsset: Partial<Asset>) => {
    setAssets(prev => prev.map(asset =>
      asset.id === id ? { ...asset, ...updatedAsset } : asset
    ));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'transactions'>) => {
    const now = new Date().toISOString();
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      milestones: [
        { percentage: 25, amount: goal.targetAmount * 0.25 },
        { percentage: 50, amount: goal.targetAmount * 0.5 },
        { percentage: 75, amount: goal.targetAmount * 0.75 },
        { percentage: 100, amount: goal.targetAmount }
      ],
      transactions: []
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updatedGoal: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const updated = { ...goal, ...updatedGoal, updatedAt: new Date().toISOString() };
        
        // Update milestones if target amount changed
        if (updatedGoal.targetAmount && updatedGoal.targetAmount !== goal.targetAmount) {
          updated.milestones = updated.milestones.map(milestone => ({
            ...milestone,
            amount: updatedGoal.targetAmount! * (milestone.percentage / 100)
          }));
        }
        
        // Check if goal is completed
        if (updated.currentAmount >= updated.targetAmount && updated.status !== 'completed') {
          updated.status = 'completed';
          updated.completedAt = new Date().toISOString();
        }
        
        // Update milestone achievements
        updated.milestones = updated.milestones.map(milestone => {
          if (updated.currentAmount >= milestone.amount && !milestone.achievedAt) {
            return { ...milestone, achievedAt: new Date().toISOString() };
          }
          return milestone;
        });
        
        return updated;
      }
      return goal;
    }));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const addSavingsTransaction = (goalId: string, transaction: Omit<SavingsGoal['transactions'][0], 'id'>) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newTransaction = {
          ...transaction,
          id: Date.now().toString()
        };
        
        const updatedGoal = {
          ...goal,
          transactions: [...goal.transactions, newTransaction],
          currentAmount: transaction.type === 'deposit' 
            ? goal.currentAmount + transaction.amount
            : goal.currentAmount - transaction.amount,
          updatedAt: new Date().toISOString()
        };
        
        // Check milestones and completion
        updatedGoal.milestones = updatedGoal.milestones.map(milestone => {
          if (updatedGoal.currentAmount >= milestone.amount && !milestone.achievedAt) {
            return { ...milestone, achievedAt: new Date().toISOString() };
          }
          return milestone;
        });
        
        if (updatedGoal.currentAmount >= updatedGoal.targetAmount && updatedGoal.status !== 'completed') {
          updatedGoal.status = 'completed';
          updatedGoal.completedAt = new Date().toISOString();
        }
        
        return updatedGoal;
      }
      return goal;
    }));
  };

  const getTotalBalance = () => {
    return accounts
      .filter(account => account.status === 'active')
      .reduce((total, account) => total + account.balance, 0);
  };

  const getMonthlyIncome = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, t) => total + t.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, t) => total + t.amount, 0);
  };

  const getCategoryExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const categoryMap = new Map<string, number>();
    
    transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      accounts,
      budgets,
      recurringTransactions,
      assets,
      savingsGoals,
      categories,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addAccount,
      updateAccount,
      deleteAccount,
      addBudget,
      updateBudget,
      deleteBudget,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      addAsset,
      updateAsset,
      deleteAsset,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addSavingsTransaction,
      getTotalBalance,
      getMonthlyIncome,
      getMonthlyExpenses,
      getCategoryExpenses
    }}>
      {children}
    </FinanceContext.Provider>
  );
};