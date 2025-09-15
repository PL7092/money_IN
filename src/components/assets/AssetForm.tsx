import React, { useState, useEffect } from 'react';
import { X, Car, Home, Smartphone, Palette, Calendar, FileText } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { toInputDate, configureDateInput } from '../../utils/dateUtils';

interface AssetFormProps {
  asset?: any;
  onClose: () => void;
}

const assetTypes = [
  { value: 'vehicle', label: 'Veículo', icon: Car },
  { value: 'property', label: 'Propriedade', icon: Home },
  { value: 'equipment', label: 'Equipamento', icon: Smartphone },
  { value: 'other', label: 'Outro', icon: FileText }
];

const assetCategories = {
  vehicle: ['Automóvel', 'Motociclo', 'Bicicleta', 'Barco', 'Outro'],
  property: ['Casa', 'Apartamento', 'Terreno', 'Garagem', 'Armazém', 'Outro'],
  equipment: ['Informática', 'Eletrodomésticos', 'Ferramentas', 'Mobiliário', 'Outro'],
  other: ['Joias', 'Arte', 'Coleções', 'Outro']
};

const conditions = [
  { value: 'excellent', label: 'Excelente', color: 'green' },
  { value: 'good', label: 'Bom', color: 'blue' },
  { value: 'fair', label: 'Razoável', color: 'yellow' },
  { value: 'poor', label: 'Mau', color: 'red' }
];

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#6B7280', '#84CC16'
];

export const AssetForm: React.FC<AssetFormProps> = ({ asset, onClose }) => {
  const { addAsset, updateAsset } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    type: 'vehicle' as 'vehicle' | 'property' | 'equipment' | 'other',
    category: '',
    value: '',
    purchaseDate: toInputDate(new Date()),
    purchasePrice: '',
    depreciationRate: '0',
    currentCondition: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    location: '',
    serialNumber: '',
    model: '',
    brand: '',
    yearManufactured: '',
    notes: '',
    color: colorOptions[0],
    insurance: {
      company: '',
      policy: '',
      expiryDate: '',
      premium: '',
      coverage: ''
    },
    maintenance: [] as Array<{
      date: string;
      description: string;
      cost: string;
      nextDue: string;
      type: string;
    }>,
    documents: [] as string[]
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        type: asset.type,
        category: asset.category || '',
        value: asset.value.toString(),
        purchaseDate: toInputDate(asset.purchaseDate),
        purchasePrice: asset.purchasePrice?.toString() || '',
        depreciationRate: asset.depreciationRate?.toString() || '0',
        currentCondition: asset.currentCondition || 'good',
        location: asset.location || '',
        serialNumber: asset.serialNumber || '',
        model: asset.model || '',
        brand: asset.brand || '',
        yearManufactured: asset.yearManufactured?.toString() || '',
        notes: asset.notes || '',
        color: asset.color || colorOptions[0],
        insurance: asset.insurance || {
          company: '',
          policy: '',
          expiryDate: '',
          premium: '',
          coverage: ''
        },
        maintenance: asset.maintenance || [],
        documents: asset.documents || []
      });
    }
  }, [asset]);

  // Configure date inputs for Portuguese locale
  useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input) => {
      configureDateInput(input as HTMLInputElement);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assetData = {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      value: parseFloat(formData.value),
      purchaseDate: formData.purchaseDate,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      depreciationRate: parseFloat(formData.depreciationRate),
      currentCondition: formData.currentCondition,
      location: formData.location || undefined,
      serialNumber: formData.serialNumber || undefined,
      model: formData.model || undefined,
      brand: formData.brand || undefined,
      yearManufactured: formData.yearManufactured ? parseInt(formData.yearManufactured) : undefined,
      notes: formData.notes || undefined,
      color: formData.color,
      insurance: Object.values(formData.insurance).some(v => v) ? formData.insurance : undefined,
      maintenance: formData.maintenance.length > 0 ? formData.maintenance.map(m => ({
        ...m,
        cost: parseFloat(m.cost)
      })) : undefined,
      documents: formData.documents.length > 0 ? formData.documents : undefined
    };

    if (asset) {
      updateAsset(asset.id, assetData);
    } else {
      addAsset(assetData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('insurance.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addMaintenanceRecord = () => {
    setFormData(prev => ({
      ...prev,
      maintenance: [
        ...prev.maintenance,
        {
          date: new Date().toISOString().split('T')[0],
          description: '',
          cost: '',
          nextDue: '',
          type: 'maintenance'
        }
      ]
    }));
  };

  const updateMaintenanceRecord = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      maintenance: prev.maintenance.map((m, i) => 
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };

  const removeMaintenanceRecord = (index: number) => {
    setFormData(prev => ({
      ...prev,
      maintenance: prev.maintenance.filter((_, i) => i !== index)
    }));
  };

  const addDocument = () => {
    const docName = prompt('Nome do documento:');
    if (docName) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, docName]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {asset ? 'Editar Ativo' : 'Novo Ativo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Ativo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: BMW Serie 3, MacBook Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Ativo *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {assetTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoria</option>
                  {assetCategories[formData.type].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Atual *
                </label>
                <select
                  name="currentCondition"
                  value={formData.currentCondition}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: BMW, Apple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Serie 3, MacBook Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano de Fabrico
                </label>
                <input
                  type="number"
                  name="yearManufactured"
                  value={formData.yearManufactured}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Financeiras</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Atual *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço de Compra
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Depreciação (% anual)
                </label>
                <input
                  type="number"
                  name="depreciationRate"
                  value={formData.depreciationRate}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="0.00"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Compra *
                </label>
                <div className="date-input-pt" data-placeholder="DD/MM/AAAA">
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    required
                    lang="pt-PT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Garagem, Escritório"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Série
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de série ou identificação única"
              />
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações de Seguro</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seguradora
                </label>
                <input
                  type="text"
                  name="insurance.company"
                  value={formData.insurance.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Allianz, Zurich"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Apólice
                </label>
                <input
                  type="text"
                  name="insurance.policy"
                  value={formData.insurance.policy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número da apólice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Expiração
                </label>
                <input
                  type="date"
                  name="insurance.expiryDate"
                  value={formData.insurance.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prémio Anual
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="insurance.premium"
                    value={formData.insurance.premium}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cobertura
              </label>
              <input
                type="text"
                name="insurance.coverage"
                value={formData.insurance.coverage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Completa, Terceiros, Garantia"
              />
            </div>
          </div>

          {/* Maintenance Records */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Registos de Manutenção</h3>
              <button
                type="button"
                onClick={addMaintenanceRecord}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                + Adicionar
              </button>
            </div>
            
            {formData.maintenance.map((maintenance, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
                    <input
                      type="date"
                      value={maintenance.date}
                      onChange={(e) => updateMaintenanceRecord(index, 'date', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                    <input
                      type="text"
                      value={maintenance.description}
                      onChange={(e) => updateMaintenanceRecord(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="Ex: Mudança de óleo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Custo (€)</label>
                    <input
                      type="number"
                      value={maintenance.cost}
                      onChange={(e) => updateMaintenanceRecord(index, 'cost', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeMaintenanceRecord(index)}
                      className="w-full px-2 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
              <button
                type="button"
                onClick={addDocument}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                + Adicionar
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.documents.map((doc, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <FileText size={14} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{doc}</span>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Adicionais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionais sobre este ativo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette size={16} className="inline mr-1" />
                Cor do Ativo
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {asset ? 'Atualizar' : 'Criar'} Ativo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};