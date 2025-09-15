import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

export const RecentTransactions = () => {
  const { transactions } = useFinance();
  
  // Get the 5 most recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              transaction.type === 'income' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <p className="text-sm text-gray-600">{transaction.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${
              transaction.type === 'income' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString('pt-PT')}
            </p>
          </div>
        </div>
      ))}
      
      <div className="pt-3 border-t">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todas as transações →
        </button>
      </div>
    </div>
  );
};