import React, { useState } from 'react';
import { Plus, Car, Home, Smartphone, FileText, Calendar, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { AssetForm } from './AssetForm';

export const AssetsManager = () => {
  const { assets, deleteAsset } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');

  const vehicles = assets.filter(a => a.type === 'vehicle' && a.active);
  const properties = assets.filter(a => a.type === 'property' && a.active);
  const equipment = assets.filter(a => a.type === 'equipment' && a.active);
  const otherAssets = assets.filter(a => a.type === 'other' && a.active);

  const totalValue = assets.filter(a => a.active).reduce((sum, asset) => sum + asset.value, 0);

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', color: 'red', message: 'Expirado' };
    if (diffDays <= 30) return { status: 'warning', color: 'yellow', message: `${diffDays} dias` };
    return { status: 'valid', color: 'green', message: 'Válido' };
  };

  const handleEdit = (asset: any) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este ativo? As transações associadas permanecerão mas perderão a ligação ao ativo.')) {
      deleteAsset(id);
    }
  };

  const handleViewDetails = (asset: any) => {
    setSelectedAsset(asset);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedAsset(null);
  };

  const tabs = [
    { id: 'vehicles', label: 'Frota Automóvel', icon: Car },
    { id: 'properties', label: 'Propriedades', icon: Home },
    { id: 'equipment', label: 'Equipamentos', icon: Smartphone },
    { id: 'other', label: 'Outros', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Ativos</h1>
          <p className="text-gray-600">Gerencie veículos, equipamentos e garantias</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
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
              <p className="text-2xl font-bold text-gray-900">{assets.filter(a => a.active).length}</p>
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
              <p className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
            const insuranceStatus = vehicle.insurance?.expiryDate ? getExpiryStatus(vehicle.insurance.expiryDate) : null;
            
            return (
              <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="rounded-lg p-3 mr-4"
                      style={{ backgroundColor: vehicle.color + '20' }}
                    >
                      <Car className="w-6 h-6" style={{ color: vehicle.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.brand} {vehicle.model} {vehicle.yearManufactured && `(${vehicle.yearManufactured})`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Adquirido: {new Date(vehicle.purchaseDate).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">€{vehicle.value.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-gray-600">Valor atual</p>
                    {vehicle.purchasePrice && (
                      <p className="text-xs text-gray-500">
                        Compra: €{vehicle.purchasePrice.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {vehicle.location && (
                      <span className="text-sm text-gray-600">📍 {vehicle.location}</span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      vehicle.currentCondition === 'excellent' ? 'bg-green-100 text-green-800' :
                      vehicle.currentCondition === 'good' ? 'bg-blue-100 text-blue-800' :
                      vehicle.currentCondition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.currentCondition === 'excellent' ? 'Excelente' :
                       vehicle.currentCondition === 'good' ? 'Bom' :
                       vehicle.currentCondition === 'fair' ? 'Razoável' : 'Mau'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(vehicle)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar ativo"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar ativo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Insurance */}
                  {vehicle.insurance && (
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
                        {insuranceStatus && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Validade:</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full bg-${insuranceStatus.color}-100 text-${insuranceStatus.color}-800`}>
                              {insuranceStatus.message}
                            </span>
                          </div>
                        )}
                        {vehicle.insurance.premium && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Prémio:</span>
                            <span className="text-sm font-medium">€{parseFloat(vehicle.insurance.premium).toFixed(2)}/ano</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Maintenance */}
                  {vehicle.maintenance && vehicle.maintenance.length > 0 && (
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
                              <span className="text-sm font-medium text-gray-900">€{parseFloat(maintenance.cost).toFixed(2)}</span>
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
                  )}
                </div>

                {/* Documents */}
                {vehicle.documents && vehicle.documents.length > 0 && (
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
                )}
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
                onClick={() => setShowForm(true)}
                Adicionar Primeiro Veículo
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {equipment.map((item) => {
            const warrantyStatus = item.insurance?.expiryDate ? getExpiryStatus(item.insurance.expiryDate) : null;
            
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="rounded-lg p-3 mr-4"
                      style={{ backgroundColor: item.color + '20' }}
                    >
                      <Smartphone className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.brand} {item.model} {item.yearManufactured && `(${item.yearManufactured})`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Adquirido: {new Date(item.purchaseDate).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">€{item.value.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-gray-600">Valor atual</p>
                      {item.purchasePrice && (
                        <p className="text-xs text-gray-500">
                          Compra: €{item.purchasePrice.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {item.insurance && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Garantia/Seguro</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fornecedor:</span>
                          <span className="text-sm font-medium">{item.insurance.company}</span>
                        </div>
                        {warrantyStatus && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Validade:</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full bg-${warrantyStatus.color}-100 text-${warrantyStatus.color}-800`}>
                              {warrantyStatus.message}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {item.documents && item.documents.length > 0 && (
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
                )}
              </div>
            );
          })}

          {equipment.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum equipamento cadastrado</h3>
              <p className="text-gray-600 mb-4">
                Adicione equipamentos para acompanhar garantias e manutenções
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Adicionar Primeiro Equipamento
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <AssetForm
          asset={editingAsset}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};