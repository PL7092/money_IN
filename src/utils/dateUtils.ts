// Utilities for Portuguese date formatting
export const formatDatePT = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTimePT = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatMonthYearPT = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric'
  });
};

export const formatMonthPT = (monthIndex: number): string => {
  const date = new Date(2024, monthIndex, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long' });
};

export const formatCurrencyPT = (amount: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumberPT = (amount: number): string => {
  return amount.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Convert date to input format (YYYY-MM-DD)
export const toInputDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

// Get current month and year for Portuguese display
export const getCurrentMonthYearPT = (): string => {
  return formatMonthYearPT(new Date());
};

// Get month names in Portuguese
export const getMonthNamesPT = (): string[] => {
  return Array.from({ length: 12 }, (_, i) => formatMonthPT(i));
};

// Configure date input to use Portuguese locale
export const configureDateInput = (element: HTMLInputElement) => {
  // Set locale attributes for better browser support
  element.setAttribute('lang', 'pt-PT');
  element.setAttribute('data-locale', 'pt-PT');
};