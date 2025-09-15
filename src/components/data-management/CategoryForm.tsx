import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface CategoryFormProps {
  category?: any;
  onClose: () => void;
}

const categoryTypes = [
  { value: 'income', label: 'Receita' },
  { value: 'expense', label: 'Despesa' },
  { value: 'both', label: 'Ambos' }
];

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#6B7280', '#84CC16',
  '#F97316', '#06B6D4', '#8B5A2B', '#DC2626'
];

const iconOptions = [
  '🍽️', '🚗', '🏠', '💰', '🎓', '🏥', '🎮', '🛒',
  '⚡', '📱', '✈️', '🎬', '💊', '🔧', '📚', '🎯'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose }) => {
  const { addCategory, updateCategory } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense' | 'both',
    subcategories: [''],
    color: colorOptions[0],
    icon: '📂',
    active: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        subcategories: category.subcategories.length > 0 ? category.subcategories : [''],
        color: category.color,
        icon: category.icon || '📂',
        active: category.active
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: formData.name,
      type: formData.type,
      subcategories: formData.subcategories.filter(sub => sub.trim() !== ''),
      color: formData.color,
      icon: formData.icon,
      active: formData.active
    };

    if (category) {
      updateCategory(category.id, categoryData);
    } else {
      addCategory(categoryData);
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

  const handleSubcategoryChange = (index: number, value: string) => {
    const newSubcategories = [...formData.subcategories];
    newSubcategories[index] = value;
    setFormData(prev => ({ ...prev, subcategories: newSubcategories }));
  };

  const addSubcategory = () => {
    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, '']
    }));
  };

  const removeSubcategory = (index: number) => {
    if (formData.subcategories.length > 1) {
      const newSubcategories = formData.subcategories.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, subcategories: newSubcategories }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Tag className="mr-2 text-blue-600" size={24} />
            {category ? 'Editar Categoria' : 'Nova Categoria'}
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
              Nome da Categoria *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Alimentação, Transporte, Salário"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Categoria *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categoryTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategorias
            </label>
            <div className="space-y-2">
              {formData.subcategories.map((subcategory, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Supermercado, Restaurantes"
                  />
                  {formData.subcategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubcategory(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSubcategory}
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus size={16} className="mr-1" />
                Adicionar Subcategoria
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor da Categoria
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone da Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`w-10 h-10 text-lg border-2 rounded-lg transition-all ${
                      formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="category-active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="category-active" className="ml-2 text-sm text-gray-700">
              Categoria ativa
            </label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pré-visualização</h4>
            <div className="flex items-center">
              <div 
                className="rounded-lg p-2 mr-3"
                style={{ backgroundColor: formData.color + '20' }}
              >
                <span className="text-lg">{formData.icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{formData.name || 'Nome da categoria'}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {formData.type === 'both' ? 'Receita/Despesa' : formData.type === 'income' ? 'Receita' : 'Despesa'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> As categorias ajudam a organizar e analisar as suas transações. 
              Use subcategorias para maior detalhe e escolha cores e ícones que facilitem a identificação visual.
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
              {category ? 'Actualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};