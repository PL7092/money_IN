import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#6B7280', '#84CC16'
];

export const ExpensesByCategory = () => {
  const { getCategoryExpenses } = useFinance();
  const categoryData = getCategoryExpenses();
  
  if (categoryData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Sem dados de despesas para mostrar</p>
      </div>
    );
  }

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="h-64">
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          {/* Simple donut chart simulation */}
          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
          {categoryData.map((item, index) => {
            const percentage = (item.amount / totalExpenses) * 100;
            const color = colors[index % colors.length];
            
            return (
              <div
                key={index}
                className="absolute inset-2 rounded-full border-4 opacity-80"
                style={{
                  borderColor: color,
                  transform: `rotate(${index * 45}deg)`,
                  borderTopColor: 'transparent',
                  borderRightColor: percentage > 25 ? color : 'transparent',
                  borderBottomColor: percentage > 50 ? color : 'transparent',
                  borderLeftColor: percentage > 75 ? color : 'transparent',
                }}
              />
            );
          })}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">€{totalExpenses.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {categoryData.slice(0, 4).map((item, index) => {
          const percentage = (item.amount / totalExpenses) * 100;
          const color = colors[index % colors.length];
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">{item.category}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  €{item.amount.toFixed(0)}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};