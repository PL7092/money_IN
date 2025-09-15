import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface EntityFormProps {
  entity?: any;
  onClose: () => void;
}

const entityTypes = [
  { value: 'person', label: 'Pessoa' },
  { value: 'company', label: 'Empresa' },
  { value: 'government', label: 'Governo/Estado' },
  { value: 'other', label: 'Outro' }
];

export const EntityForm: React.FC<EntityFormProps> = ({ entity, onClose }) => {
  const { addEntity, updateEntity, categories } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    type: 'company' as 'person' | 'company' | 'government' | 'other',
    category: '',
    aliases: '',
    defaultCategory: '',
    defaultSubcategory: '',
    active: true
  });

  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name,
        type: entity.type,
        category: entity.category || '',
        aliases: entity.aliases.join(', '),
        defaultCategory: entity.defaultCategory || '',
        defaultSubcategory: entity.defaultSubcategory || '',
        active: entity.active
      });
    }
  }, [entity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entityData = {
      name: formData.name,
      type: formData.type,
      category: formData.category || undefined,
      aliases: formData.aliases ? formData.aliases.split(',').map(alias => alias.trim()).filter(Boolean) : [],
      defaultCategory: formData.defaultCategory || undefined,
      defaultSubcategory: formData.defaultSubcategory || undefined,
      active: formData.active
    };

    if (entity) {
      updateEntity(entity.id, entityData);
    } else {
      addEntity(entityData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const selectedCategory = categories.find(cat => cat.name === formData.defaultCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2 text-blue-600" size={24} />
            {entity ? 'Editar Entidade' : 'Nova Entidade'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Entidade *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Continente, Galp, João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Entidade *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {entityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria da Entidade
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Supermercado, Combustível, Empregador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aliases/Variações do Nome
            </label>
            <input
              type="text"
              name="aliases"
              value={formData.aliases}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: CONTINENTE, CONT., SONAE MC (separados por vírgulas)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Diferentes formas como esta entidade pode aparecer nos extratos bancários
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria Padrão
              </label>
              <select
                name="defaultCategory"
                value={formData.defaultCategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoria (opcional)</option>
                {categories.filter(cat => cat.active).map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoria Padrão
              </label>
              <select
                name="defaultSubcategory"
                value={formData.defaultSubcategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.defaultCategory}
              >
                <option value="">Seleccionar subcategoria (opcional)</option>
                {selectedCategory?.subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="entity-active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="entity-active" className="ml-2 text-sm text-gray-700">
              Entidade ativa
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> As entidades ajudam a organizar e categorizar automaticamente 
              as transações. Configure aliases para que a AI reconheça diferentes variações do nome 
              nos extratos bancários.
            </p>
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
              {entity ? 'Actualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};