import React, { useState, useEffect } from 'react';
import { X, Brain, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface AIRuleFormProps {
  rule?: any;
  onClose: () => void;
}

const patternTypes = [
  { value: 'contains', label: 'Contém' },
  { value: 'startsWith', label: 'Começa com' },
  { value: 'endsWith', label: 'Termina com' },
  { value: 'regex', label: 'Expressão Regular' }
];

export const AIRuleForm: React.FC<AIRuleFormProps> = ({ rule, onClose }) => {
  const { addAIRule, updateAIRule, entities, categories } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    pattern: '',
    patternType: 'contains' as 'contains' | 'startsWith' | 'endsWith' | 'regex',
    entity: '',
    category: '',
    subcategory: '',
    tags: [''],
    confidence: 0.8,
    priority: 1,
    active: true
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        pattern: rule.pattern,
        patternType: rule.patternType,
        entity: rule.entity || '',
        category: rule.category || '',
        subcategory: rule.subcategory || '',
        tags: rule.tags && rule.tags.length > 0 ? rule.tags : [''],
        confidence: rule.confidence,
        priority: rule.priority,
        active: rule.active
      });
    }
  }, [rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ruleData = {
      name: formData.name,
      pattern: formData.pattern,
      patternType: formData.patternType,
      entity: formData.entity || undefined,
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      tags: formData.tags.filter(tag => tag.trim() !== ''),
      confidence: formData.confidence,
      priority: formData.priority,
      active: formData.active
    };

    if (rule) {
      updateAIRule(rule.id, ruleData);
    } else {
      addAIRule(ruleData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    if (formData.tags.length > 1) {
      const newTags = formData.tags.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, tags: newTags }));
    }
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-2 text-purple-600" size={24} />
            {rule ? 'Editar Regra AI' : 'Nova Regra AI'}
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
              Nome da Regra *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Continente - Supermercado"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padrão de Texto *
              </label>
              <input
                type="text"
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: CONTINENTE"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Padrão *
              </label>
              <select
                name="patternType"
                value={formData.patternType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {patternTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entidade
              </label>
              <select
                name="entity"
                value={formData.entity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar entidade (opcional)</option>
                {entities.filter(e => e.active).map(entity => (
                  <option key={entity.id} value={entity.name}>{entity.name}</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoria (opcional)</option>
                {categories.filter(cat => cat.active).map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoria
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!formData.category}
              >
                <option value="">Seleccionar subcategoria (opcional)</option>
                {selectedCategory?.subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: supermercado, essencial"
                  />
                  {formData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                <Plus size={16} className="mr-1" />
                Adicionar Tag
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confiança (0.0 - 1.0) *
              </label>
              <input
                type="number"
                name="confidence"
                value={formData.confidence}
                onChange={handleChange}
                min="0"
                max="1"
                step="0.1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nível de confiança da regra (0.8 = 80%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade *
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                min="1"
                max="10"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Prioridade de aplicação (1 = mais alta)
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="rule-active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="rule-active" className="ml-2 text-sm text-gray-700">
              Regra ativa
            </label>
          </div>

          {/* Test Pattern */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Teste do Padrão</h4>
            <input
              type="text"
              placeholder="Digite um texto para testar o padrão..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onChange={(e) => {
                const testText = e.target.value;
                const pattern = formData.pattern;
                let matches = false;
                
                if (testText && pattern) {
                  switch (formData.patternType) {
                    case 'contains':
                      matches = testText.toUpperCase().includes(pattern.toUpperCase());
                      break;
                    case 'startsWith':
                      matches = testText.toUpperCase().startsWith(pattern.toUpperCase());
                      break;
                    case 'endsWith':
                      matches = testText.toUpperCase().endsWith(pattern.toUpperCase());
                      break;
                    case 'regex':
                      try {
                        const regex = new RegExp(pattern, 'i');
                        matches = regex.test(testText);
                      } catch (e) {
                        matches = false;
                      }
                      break;
                  }
                }
                
                const indicator = e.target.nextElementSibling;
                if (indicator) {
                  indicator.textContent = testText && pattern ? 
                    (matches ? '✅ Corresponde' : '❌ Não corresponde') : '';
                  indicator.className = matches ? 'text-green-600 text-sm mt-1' : 'text-red-600 text-sm mt-1';
                }
              }}
            />
            <div className="text-sm mt-1"></div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-700">
              <strong>Dica:</strong> As regras de AI são aplicadas por ordem de prioridade. 
              Use padrões específicos para maior precisão e teste sempre antes de ativar.
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {rule ? 'Actualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};