import React from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Target,
  CreditCard,
  BarChart3,
  Repeat,
  Car,
  FileText,
  Brain,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transações', icon: CreditCard },
  { id: 'budget', label: 'Orçamentos', icon: Target },
  { id: 'accounts', label: 'Contas', icon: CreditCard },
  { id: 'savings', label: 'Poupanças por Objetivos', icon: Target },
  { id: 'investments', label: 'Investimentos', icon: BarChart3 },
  { id: 'recurring', label: 'Pagamentos Recorrentes', icon: Repeat },
  { id: 'assets', label: 'Gestão de Ativos', icon: Car },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'ai-advisor', label: 'Conselheiro AI', icon: Brain },
  { id: 'import-export', label: 'Importar/Exportar', icon: Download },
  { id: 'data-management', label: 'Gestão de Dados', icon: Settings },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse
}) => {
  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800">FinanceFlow</h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-3 py-2 mb-1 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} className={`${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};