import React from 'react';

export const MonthlyTrend = () => {
  // Mock data for demonstration
  const data = [
    { month: 'Jan', income: 2800, expenses: 2100 },
    { month: 'Fev', income: 2850, expenses: 2250 },
    { month: 'Mar', income: 2800, expenses: 1980 },
    { month: 'Abr', income: 3100, expenses: 2300 },
    { month: 'Mai', income: 2900, expenses: 2150 },
    { month: 'Jun', income: 2800, expenses: 2400 },
  ];

  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]));

  return (
    <div className="h-64 w-full">
      <div className="flex items-end justify-between h-48 px-4">
        {data.map((item, index) => {
          const incomeHeight = (item.income / maxValue) * 100;
          const expenseHeight = (item.expenses / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center space-x-1 mb-2">
                <div
                  className="w-4 bg-green-500 rounded-t-sm"
                  style={{ height: `${incomeHeight}%` }}
                  title={`Receitas: €${item.income}`}
                />
                <div
                  className="w-4 bg-red-500 rounded-t-sm"
                  style={{ height: `${expenseHeight}%` }}
                  title={`Despesas: €${item.expenses}`}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">{item.month}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2" />
          <span className="text-sm text-gray-600">Receitas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2" />
          <span className="text-sm text-gray-600">Despesas</span>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          Poupança média: <span className="font-semibold text-blue-600">€650/mês</span>
        </p>
      </div>
    </div>
  );
};