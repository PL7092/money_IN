import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Tag, Brain, Search, Filter } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { EntityForm } from './EntityForm';
import { CategoryForm } from './CategoryForm';
import { AIRuleForm } from './AIRuleForm';

export const DataManagement = () => {
  const { entities, categories, aiRules, deleteEntity, deleteCategory, deleteAIRule } = useFinance();
  const [activeTab, setActiveTab] = useState('entities');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'entities', label: 'Entidades', icon: Users, count: entities.filter(e => e.active).length },
    { id: 'categories', label: 'Categorias', icon: Tag, count: categories.filter(c => c.active).length },
    { id: 'ai-rules', label: 'Regras AI', icon: Brain, count: aiRules.filter(r => r.active).length }
  ];

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string, type: string) => {
    const confirmMessage = `Tem a certeza que deseja eliminar este(a) ${type}?`;
    if (confirm(confirmMessage)) {
      switch (type) {
        case 'entidade':
          deleteEntity(id);
          break;
        case 'categoria':
          deleteCategory(id);
          break;
        case 'regra':
          deleteAIRule(id);
          break;
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const getFilteredItems = () => {
    let items: any[] = [];
    
    switch (activeTab) {
      case 'entities':
        items = entities.filter(e => 
          e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
      case 'categories':
        items = categories.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
      case 'ai-rules':
        items = aiRules.filter(r => 
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.pattern.toLowerCase().includes(searchTerm.toLowerCase())
        );
        break;
    }
    
    return items;
  };

  const renderFormComponent = () => {
    switch (activeTab) {
      case 'entities':
        return <EntityForm entity={editingItem} onClose={handleFormClose} />;
      case 'categories':
        return <CategoryForm category={editingItem} onClose={handleFormClose} />;
      case 'ai-rules':
        return <AIRuleForm rule={editingItem} onClose={handleFormClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Dados</h1>
          <p className="text-gray-600">Gerencie entidades, categorias e regras de AI</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo {activeTab === 'entities' ? 'Entidade' : activeTab === 'categories' ? 'Categoria' : 'Regra'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Procurar ${activeTab === 'entities' ? 'entidades' : activeTab === 'categories' ? 'categorias' : 'regras'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'entities' ? 'Entidades' : 
             activeTab === 'categories' ? 'Categorias' : 'Regras de AI'}
          </h3>
        </div>

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <div className="divide-y divide-gray-200">
            {getFilteredItems().length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p>Nenhuma entidade encontrada</p>
              </div>
            ) : (
              getFilteredItems().map((entity) => (
                <div key={entity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-lg p-2 mr-4">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{entity.name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="capitalize">{entity.type}</span>
                          {entity.category && <span>• {entity.category}</span>}
                          {entity.defaultCategory && <span>• Categoria padrão: {entity.defaultCategory}</span>}
                        </div>
                        {entity.aliases.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Aliases: </span>
                            {entity.aliases.map((alias, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-1">
                                {alias}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entity.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {entity.active ? 'Ativa' : 'Inativa'}
                      </span>
                      <button
                        onClick={() => handleEdit(entity)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(entity.id, 'entidade')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="divide-y divide-gray-200">
            {getFilteredItems().length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p>Nenhuma categoria encontrada</p>
              </div>
            ) : (
              getFilteredItems().map((category) => (
                <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="rounded-lg p-2 mr-4"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <span className="text-lg">{category.icon || '📂'}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="capitalize">{category.type === 'both' ? 'Receita/Despesa' : category.type === 'income' ? 'Receita' : 'Despesa'}</span>
                          <span>• {category.subcategories.length} subcategorias</span>
                        </div>
                        {category.subcategories.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Subcategorias: </span>
                            {category.subcategories.slice(0, 3).map((sub, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-1">
                                {sub}
                              </span>
                            ))}
                            {category.subcategories.length > 3 && (
                              <span className="text-xs text-gray-500">+{category.subcategories.length - 3} mais</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.active ? 'Ativa' : 'Inativa'}
                      </span>
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, 'categoria')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* AI Rules Tab */}
        {activeTab === 'ai-rules' && (
          <div className="divide-y divide-gray-200">
            {getFilteredItems().length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p>Nenhuma regra de AI encontrada</p>
              </div>
            ) : (
              getFilteredItems().map((rule) => (
                <div key={rule.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 rounded-lg p-2 mr-4">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Padrão: "{rule.pattern}"</span>
                          <span>• Tipo: {rule.patternType}</span>
                          <span>• Confiança: {(rule.confidence * 100).toFixed(0)}%</span>
                          <span>• Prioridade: {rule.priority}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {rule.entity && <span>Entidade: {rule.entity} • </span>}
                          {rule.category && <span>Categoria: {rule.category} • </span>}
                          {rule.subcategory && <span>Subcategoria: {rule.subcategory}</span>}
                        </div>
                        {rule.tags && rule.tags.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Tags: </span>
                            {rule.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.active ? 'Ativa' : 'Inativa'}
                      </span>
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id, 'regra')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && renderFormComponent()}
    </div>
  );
};