import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionManager } from './components/transactions/TransactionManager';
import { BudgetManager } from './components/budget/BudgetManager';
import { AccountsManager } from './components/accounts/AccountsManager';
import { InvestmentManager } from './components/investments/InvestmentManager';
import { RecurringManager } from './components/recurring/RecurringManager';
import { AssetsManager } from './components/assets/AssetsManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { AIAdvisor } from './components/ai/AIAdvisor';
import { SettingsManager } from './components/settings/SettingsManager';
import { ImportExport } from './components/import-export/ImportExport';
import { SavingsManager } from './components/savings/SavingsManager';
import { DataManagement } from './components/data-management/DataManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { Login } from './components/auth/Login';

const AppContent = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionManager />;
      case 'budget':
        return <BudgetManager />;
      case 'accounts':
        return <AccountsManager />;
      case 'savings':
        return <SavingsManager />;
      case 'investments':
        return <InvestmentManager />;
      case 'recurring':
        return <RecurringManager />;
      case 'assets':
        return <AssetsManager />;
      case 'reports':
        return <ReportsManager />;
      case 'ai-advisor':
        return <AIAdvisor />;
      case 'import-export':
        return <ImportExport />;
      case 'data-management':
        return <DataManagement />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <FinanceProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            user={user}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </FinanceProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;