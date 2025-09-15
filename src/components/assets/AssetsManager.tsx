import React, { useState } from 'react';
import { Plus, Car, Home, Smartphone, FileText, Calendar, AlertCircle } from 'lucide-react';

export const AssetsManager = () => {
  const [activeTab, setActiveTab] = useState('vehicles');

  // Mock data
  const vehicles = [
    {
      id: '1',
      name: 'BMW Serie 3',
      type: 'vehicle',
      value: 25000,
      purchaseDate: '2021-03-15',
      insurance: {
        company: 'Allianz',
        policy: 'AUTO-2021-1234',
        expiryDate: '2024-03-15'
      },
      maintenance: [
        {
          date: '2024-01-10',
          description: 'Inspeção Anual',
          cost: 120,
          nextDue: '2025-01-10'
        },
        {
          date: '2023-12-05',
          description: 'Mudança de óleo',
          cost: 85,
          nextDue: '2024-06-05'
        }
      ],
      documents: ['registo_veiculo.pdf', 'seguro_2024.pdf']
    }
  ];

  const equipment = [
    {
      id: '2',
      name: 'MacBook Pro 16"',
      type: 'equipment',
      value: 2800,
      purchaseDate: '2023-06-20',
      warranty: {
        company: 'Apple',
        expiryDate: '2026-06-20'
      },
      documents: ['garantia_apple.pdf', 'fatura_compra.pdf']
    }
  ];

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', color: 'red', message: 'Expirado' };
    if (diffDays <= 30) return { status: 'warning', color: 'yellow', message: `${diffDays} dias` };
    return { status: 'valid', color: 'green', message: 'Válido' };
  };

  const tabs = [
    { id: 'vehicles', label: 'Frota Automóvel', icon: Car },
    { id: 'equipment', label: 'Equipamentos', icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Ativos</h1>
          <p className="text-gray-600">Gerencie veículos, equipamentos e garantias</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
          <Plus size={20} className="mr-2" />
          Novo Ativo
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-lg p-3 mr-4">
              <Car className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length + equipment.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                €{[...vehicles, ...equipment].reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-3 mr-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">A Expirar</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <AlertCircle size={20} className="text-yellow-600 mr-2" />
          <h3 className="text-sm font-medium text-yellow-800">Alertas de Vencimento</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-700">Seguro do BMW Serie 3 expira em 45 dias</span>
            <button className="text-yellow-600 hover:text-yellow-800 font-medium">
              Renovar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          {vehicles.map((vehicle) => {
            const insuranceStatus = getExpiryStatus(vehicle.insurance.expiryDate);
            
            return (
              <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                      <p className="text-sm text-gray-600">
                        Adquirido em {new Date(vehicle.purchaseDate).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">€{vehicle.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Valor atual</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Insurance */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Seguro</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Seguradora:</span>
                        <span className="text-sm font-medium">{vehicle.insurance.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Apólice:</span>
                        <span className="text-sm font-medium">{vehicle.insurance.policy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Validade:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full bg-${insuranceStatus.color}-100 text-${insuranceStatus.color}-800`}>
                          {insuranceStatus.message}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Manutenção</h4>
                    <div className="space-y-2">
                      {vehicle.maintenance.slice(0, 2).map((maintenance, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{maintenance.description}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(maintenance.date).toLocaleDateString('pt-PT')}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-gray-900">€{maintenance.cost}</span>
                          </div>
                          {maintenance.nextDue && (
                            <p className="text-xs text-blue-600 mt-1">
                              Próxima: {new Date(maintenance.nextDue).toLocaleDateString('pt-PT')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Documentos</h4>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.documents.map((doc, index) => (
                      <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <FileText size={14} className="text-gray-500 mr-1" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {vehicles.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo cadastrado</h3>
              <p className="text-gray-600 mb-4">
                Adicione veículos para acompanhar seguros, manutenções e documentos
              </p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Adicionar Primeiro Veículo
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {equipment.map((item) => {
            const warrantyStatus = getExpiryStatus(item.warranty.expiryDate);
            
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-lg p-3 mr-4">
                      <Smartphone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Adquirido em {new Date(item.purchaseDate).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">€{item.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Valor de compra</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Garantia</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fornecedor:</span>
                        <span className="text-sm font-medium">{item.warranty.company}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Validade:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full bg-${warrantyStatus.color}-100 text-${warrantyStatus.color}-800`}>
                          {warrantyStatus.message}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Documentos</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.documents.map((doc, index) => (
                      <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <FileText size={14} className="text-gray-500 mr-1" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};