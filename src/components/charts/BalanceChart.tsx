import React from 'react';

export const BalanceChart = () => {
  // Mock data for demonstration
  const data = [
    { month: 'Jan', balance: 15000 },
    { month: 'Fev', balance: 16200 },
    { month: 'Mar', balance: 15800 },
    { month: 'Abr', balance: 17500 },
    { month: 'Mai', balance: 18200 },
    { month: 'Jun', balance: 17800 },
  ];

  const maxBalance = Math.max(...data.map(d => d.balance));
  const minBalance = Math.min(...data.map(d => d.balance));

  return (
    <div className="h-64 w-full">
      <div className="flex items-end justify-between h-48 px-4">
        {data.map((item, index) => {
          const height = ((item.balance - minBalance) / (maxBalance - minBalance)) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex justify-center mb-2">
                <div
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">{item.month}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>€{minBalance.toLocaleString()}</span>
        <span>€{maxBalance.toLocaleString()}</span>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          Crescimento médio: <span className="font-semibold text-green-600">+4.2%</span>
        </p>
      </div>
    </div>
  );
};