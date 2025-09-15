import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';

export const BudgetOverview = () => {
  const { budgets } = useFinance();

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum orçamento configurado</p>
        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
          Criar primeiro orçamento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = (budget.spent / budget.limit) * 100;
        const isOverBudget = percentage > 100;
        const isNearLimit = percentage > 80;

        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{budget.category}</span>
              <span className="text-sm text-gray-600">
                €{budget.spent.toFixed(0)} / €{budget.limit.toFixed(0)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isOverBudget 
                    ? 'bg-red-500' 
                    : isNearLimit 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className={`font-medium ${
                isOverBudget 
                  ? 'text-red-600' 
                  : isNearLimit 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`}>
                {percentage.toFixed(1)}%
              </span>
              <span className="text-gray-500">
                €{(budget.limit - budget.spent).toFixed(0)} restante
              </span>
            </div>
          </div>
        );
      })}
      
      <div className="pt-3 border-t">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Gerir orçamentos →
        </button>
      </div>
    </div>
  );
};