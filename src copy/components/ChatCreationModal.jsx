import React, { useState, useEffect } from 'react';
import { loadPromptFiles } from '../services/promptService';
import LoadingSpinner from './LoadingSpinner';
import { requiresMandatoryDocument, canBenefitFromDocument } from '../services/promptDocumentConfig';

const ChatCreationModal = ({ isOpen, onClose, onCreateChat }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all'); // 'all', 'mandatory', 'optional', 'none'
  const [promptTypes, setPromptTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar prompts dinamicamente
  useEffect(() => {
    const loadPrompts = async () => {
      setIsLoading(true);
      try {
        const prompts = await loadPromptFiles();
        setPromptTypes(prompts);
      } catch (error) {
        console.error('Erro ao carregar prompts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadPrompts();
    }
  }, [isOpen]);

  // Resetar seleção quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedPrompt(null);
      setSearchTerm('');
      setSelectedCategory('all');
      setDocumentFilter('all');
    }
  }, [isOpen]);

  // Obter categorias únicas
  const categories = [...new Set(promptTypes.map(p => p.category))];

  // Filtrar prompts baseado na pesquisa, categoria e necessidade de documento
  const filteredPrompts = promptTypes.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    
    // Filtro por necessidade de documento
    let matchesDocument = true;
    if (documentFilter !== 'all') {
      const requiresMandatory = requiresMandatoryDocument(prompt.id, prompt.name);
      const canBenefit = canBenefitFromDocument(prompt.id, prompt.name);
      
      if (documentFilter === 'mandatory') {
        matchesDocument = requiresMandatory;
      } else if (documentFilter === 'optional') {
        matchesDocument = canBenefit && !requiresMandatory;
      } else if (documentFilter === 'none') {
        matchesDocument = !requiresMandatory && !canBenefit;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDocument;
  });

  // Função para obter informações sobre documentos necessários
  const getDocumentInfo = (prompt) => {
    const requiresMandatory = requiresMandatoryDocument(prompt.id, prompt.name);
    const canBenefit = canBenefitFromDocument(prompt.id, prompt.name);
    
    // Debug condicional
    if (window.DEBUG_PROMPTS && prompt.name === 'Réplica') {
      console.log('🔍 DEBUG ChatCreationModal - getDocumentInfo para Réplica:', {
        promptId: prompt.id,
        promptName: prompt.name,
        requiresMandatory,
        canBenefit
      });
    }
    
    if (requiresMandatory) {
      const docInfo = {
        type: 'mandatory',
        icon: '📄',
        text: 'Documento obrigatório',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      };
      
      if (window.DEBUG_PROMPTS && prompt.name === 'Réplica') {
        console.log('✅ DocumentInfo criado para Réplica:', docInfo);
      }
      
      return docInfo;
    } else if (canBenefit) {
      return {
        type: 'optional',
        icon: '📎',
        text: 'Documento opcional',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-200'
      };
    }
    
    if (window.DEBUG_PROMPTS && prompt.name === 'Réplica') {
      console.log('❌ Nenhum documentInfo criado para Réplica');
    }
    
    return null;
  };

  const handleCreateChat = () => {
    if (selectedPrompt) {
      onCreateChat(selectedPrompt);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-lg bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Criar Novo Chat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar assistente
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome ou descrição do assistente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por necessidade de documento
            </label>
            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos os assistentes</option>
              <option value="mandatory">📄 Requerem documento obrigatório</option>
              <option value="optional">📎 Funcionam melhor com documento</option>
              <option value="none">✅ Não precisam de documento</option>
            </select>
          </div>
        </div>

        {/* Lista de prompts */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Escolha seu assistente jurídico 
            {!isLoading && `(${filteredPrompts.length} disponíveis)`}
          </h3>
          
          {isLoading ? (
            <LoadingSpinner message="Carregando assistentes especializados" size="lg" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredPrompts.map(prompt => {
                const documentInfo = getDocumentInfo(prompt);
                return (
                  <div
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                      selectedPrompt?.id === prompt.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Indicador de documento no canto superior direito */}
                    {documentInfo && (
                      <div className={`absolute top-2 right-2 ${documentInfo.bgColor} ${documentInfo.textColor} ${documentInfo.borderColor} border text-xs px-2 py-1 rounded-full flex items-center space-x-1`}>
                        <span>{documentInfo.icon}</span>
                        <span className="hidden lg:inline">{documentInfo.text}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{prompt.icon}</div>
                      <div className="flex-1 mr-8"> {/* Margem para não sobrepor o indicador */}
                        <h4 className="font-semibold text-gray-900 mb-1">{prompt.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                        
                        {/* Informação sobre documento */}
                        {documentInfo && (
                          <div className={`mb-2 p-2 rounded-md ${documentInfo.bgColor} ${documentInfo.borderColor} border`}>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs">{documentInfo.icon}</span>
                              <span className={`text-xs font-medium ${documentInfo.textColor}`}>
                                {documentInfo.type === 'mandatory' 
                                  ? 'Requer documento para funcionar' 
                                  : 'Funciona melhor com documento'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {prompt.category}
                        </span>
                      </div>
                      {selectedPrompt?.id === prompt.id && (
                        <div className="text-purple-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informações do prompt selecionado */}
        {selectedPrompt && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">
              {selectedPrompt.icon} {selectedPrompt.name}
            </h4>
            <p className="text-purple-800 text-sm mb-3">{selectedPrompt.description}</p>
            
            {/* Informação sobre documento necessário */}
            {(() => {
              const documentInfo = getDocumentInfo(selectedPrompt);
              if (documentInfo) {
                return (
                  <div className={`mb-3 p-3 rounded-md ${documentInfo.bgColor} ${documentInfo.borderColor} border`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{documentInfo.icon}</span>
                      <span className={`text-sm font-semibold ${documentInfo.textColor}`}>
                        {documentInfo.text}
                      </span>
                    </div>
                    <p className={`text-xs ${documentInfo.textColor}`}>
                      {documentInfo.type === 'mandatory' 
                        ? 'Este assistente precisa de um documento para funcionar corretamente. Você poderá anexá-lo durante a conversa.'
                        : 'Este assistente funciona melhor quando você fornece documentos relacionados ao caso.'}
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="flex items-center justify-between">
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {selectedPrompt.category}
              </span>
              <span className="text-sm text-purple-600">
                Assistente especializado pronto para usar
              </span>
            </div>

            {/* Informações sobre documentos */}
            <div className="mt-4">
              {getDocumentInfo(selectedPrompt) && (
                <div className={`flex items-center p-3 rounded-lg border ${getDocumentInfo(selectedPrompt).borderColor} ${getDocumentInfo(selectedPrompt).bgColor}`}>
                  <span className="text-lg mr-2">{getDocumentInfo(selectedPrompt).icon}</span>
                  <span className={`text-sm ${getDocumentInfo(selectedPrompt).textColor}`}>
                    {getDocumentInfo(selectedPrompt).text}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateChat}
            disabled={!selectedPrompt}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedPrompt
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Criar Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatCreationModal;
