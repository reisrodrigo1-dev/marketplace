import React, { useState, useEffect } from 'react';
import ChatCreationModal from './ChatCreationModal';
import ChatInterface from './ChatInterface';
import ChatHistory from './ChatHistory';
import { loadPromptFiles } from '../services/promptService';
import { chatStorageService } from '../services/chatStorageService';
import { useAuth } from '../contexts/AuthContext';
import { requiresMandatoryDocument, canBenefitFromDocument } from '../services/promptDocumentConfig';

const JuriAI = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'chat', 'history'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [promptTypes, setPromptTypes] = useState([]);
  const [chatHistoryKey, setChatHistoryKey] = useState(0); // Para forçar re-render do ChatHistory
  const { user } = useAuth();

  // Carregar chats salvos e prompts
  useEffect(() => {
    // Carregar prompts dinamicamente
    const loadPrompts = async () => {
      try {
        const prompts = await loadPromptFiles();
        setPromptTypes(prompts);
      } catch (error) {
        console.error('Erro ao carregar prompts:', error);
      }
    };
    
    // Carregar chats ativos
    const loadChats = async () => {
      if (user) {
        try {
          const result = await chatStorageService.getChats();
          if (result.success) {
            setChats(result.data);
          }
        } catch (error) {
          console.error('Erro ao carregar chats:', error);
        }
      }
    };
    
    loadPrompts();
    loadChats();
  }, [user]);

  // Criar novo chat
  const handleCreateChat = (promptType) => {
    // O chat será criado diretamente no ChatInterface
    setCurrentChat({ promptType }); // Passamos apenas o promptType
    setCurrentView('chat');
    setShowCreateModal(false);
  };

  // Selecionar chat existente
  const handleSelectChat = (chat) => {
    console.log('JuriAI: Selecionando chat:', {
      id: chat.id,
      title: chat.title,
      messagesCount: chat.messages?.length || 0,
      promptType: chat.promptType,
      conversationPhase: chat.conversationPhase
    });
    setCurrentChat(chat);
    setCurrentView('chat');
  };

  // Deletar chat (será tratado no ChatHistory)
  const handleDeleteChat = (chatId) => {
    // Implementado no ChatHistory
  };

  // Voltar para dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentChat(null);
    // Forçar recarregamento do histórico de chats
    setChatHistoryKey(prev => prev + 1);
  };

  // Voltar para histórico (usado quando completa um chat)
  const handleBackToHistory = () => {
    setCurrentView('history');
    setCurrentChat(null);
    // Forçar recarregamento do histórico de chats
    setChatHistoryKey(prev => prev + 1);
  };

  // Callback chamado quando um novo chat é criado
  const handleChatCreated = (chatId) => {
    console.log('Novo chat criado:', chatId);
    // Forçar recarregamento do histórico de chats
    setChatHistoryKey(prev => prev + 1);
    // Recarregar lista de chats no dashboard
    loadChatsData();
  };

  // Callback chamado quando um chat é atualizado
  const handleChatUpdated = (chatId, newTitle) => {
    console.log('Chat atualizado:', chatId, 'Novo título:', newTitle);
    
    // Atualizar o chat atual se for o mesmo que foi atualizado
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(prev => ({
        ...prev,
        title: newTitle
      }));
    }
    
    // Forçar recarregamento do histórico de chats
    setChatHistoryKey(prev => prev + 1);
    // Recarregar lista de chats no dashboard
    loadChatsData();
  };

  // Callback chamado quando um chat é excluído
  const handleChatDeleted = (chatId) => {
    console.log('Chat excluído:', chatId);
    // Forçar recarregamento do histórico de chats
    setChatHistoryKey(prev => prev + 1);
    // Recarregar lista de chats no dashboard
    loadChatsData();
  };

  // Função para carregar dados dos chats
  const loadChatsData = async () => {
    if (user) {
      try {
        const result = await chatStorageService.getChats();
        if (result.success) {
          setChats(result.data);
        }
      } catch (error) {
        console.error('Erro ao carregar chats:', error);
      }
    }
  };

  // Função para testar salvamento de chats
  const testChatSaving = async () => {
    if (!user) {
      alert('Você precisa estar logado para testar o salvamento de chats.');
      return;
    }

    try {
      console.log('Testando salvamento de chats...');
      
      // Criar um chat de teste
      const testPromptType = {
        id: 'test-chat',
        name: 'Chat de Teste',
        icon: '🧪',
        description: 'Chat para teste de funcionalidade',
        category: 'Teste'
      };
      
      const testTitle = `Chat de Teste - ${new Date().toLocaleString()}`;
      const createResult = await chatStorageService.createChat(testPromptType, testTitle);
      
      if (createResult.success) {
        console.log('Chat de teste criado com sucesso:', createResult.id);
        
        // Salvar algumas mensagens de teste
        const testMessages = [
          {
            id: 1,
            role: 'assistant',
            content: 'Esta é uma mensagem de teste para verificar o salvamento no Firestore.',
            timestamp: new Date()
          },
          {
            id: 2,
            role: 'user',
            content: 'Resposta do usuário para teste.',
            timestamp: new Date()
          }
        ];
        
        await chatStorageService.saveProgress(
          createResult.id,
          testMessages,
          [],
          'questioning'
        );
        
        alert('Chat de teste criado com sucesso! Verifique o histórico de chats.');
        setChatHistoryKey(prev => prev + 1);
        loadChatsData(); // Recarregar dados do dashboard
      } else {
        console.error('Erro ao criar chat de teste:', createResult.error);
        alert('Erro ao criar chat de teste: ' + createResult.error);
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      alert('Erro no teste: ' + error.message);
    }
  };

  // Função para obter informações sobre documentos necessários
  const getDocumentInfo = (prompt) => {
    const requiresMandatory = requiresMandatoryDocument(prompt.id, prompt.name);
    const canBenefit = canBenefitFromDocument(prompt.id, prompt.name);
    
    if (requiresMandatory) {
      return {
        type: 'mandatory',
        icon: '📄',
        text: 'Documento obrigatório',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      };
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
    return null;
  };

  // Renderizar diferentes views
  if (currentView === 'chat' && currentChat) {
    console.log('JuriAI: Renderizando ChatInterface com:', {
      promptType: currentChat.promptType,
      existingChat: currentChat.id ? currentChat : null,
      hasId: !!currentChat.id
    });
    
    return (
      <div className="h-full">
        <ChatInterface
          promptType={currentChat.promptType}
          existingChat={currentChat.id ? currentChat : null}
          onBack={handleBackToDashboard}
          onClose={handleBackToDashboard}
          onBackToHistory={handleBackToHistory}
          onChatCreated={handleChatCreated}
          onChatUpdated={handleChatUpdated}
          onChatDeleted={handleChatDeleted}
        />
      </div>
    );
  }

  if (currentView === 'history') {
    return (
      <div className="h-full">
        <ChatHistory
          key={chatHistoryKey}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onChatUpdated={handleChatUpdated}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Juri.AI
          <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium">
            IA
          </span>
        </h1>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView('history')}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Histórico
          </button>
          
          {/* Botão de teste - remover em produção */}
          {user && (
            <button
              onClick={testChatSaving}
              className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Testar DB
            </button>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Chat
          </button>
        </div>
      </div>
      
      {/* Seção de boas-vindas */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Bem-vindo ao Juri.AI</h2>
            <p className="text-purple-100">
              Sua assistente jurídica inteligente para análise de processos, pesquisa legal e automação de tarefas.
            </p>
          </div>
          <div className="hidden md:block">
            <svg className="w-16 h-16 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chats Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {chats.filter(chat => !chat.isCompleted).length} em andamento
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assistentes Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">{promptTypes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documentos Gerados</p>
              <p className="text-2xl font-bold text-gray-900">
                {chats.filter(chat => chat.isCompleted).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {chats.filter(chat => chat.conversationPhase === 'completed').length} finalizados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chats Recentes */}
      {chats.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chats Recentes</h3>
            <button
              onClick={() => setCurrentView('history')}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.slice(0, 3).map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">{chat.promptType.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{chat.title}</h4>
                    <p className="text-sm text-gray-600">{chat.promptType.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    chat.isCompleted 
                      ? 'bg-green-100 text-green-700' 
                      : chat.conversationPhase === 'ready'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {chat.isCompleted ? 'Concluído' : 
                     chat.conversationPhase === 'ready' ? 'Pronto' : 'Em andamento'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.lastUpdate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assistentes em destaque */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assistentes Populares</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promptTypes.slice(0, 6).map(prompt => {
            const documentInfo = getDocumentInfo(prompt);
            return (
              <div
                key={prompt.id}
                onClick={() => handleCreateChat(prompt)}
                className="bg-white p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group relative"
              >
                {/* Indicador de documento no canto superior direito */}
                {documentInfo && (
                  <div className={`absolute top-2 right-2 ${documentInfo.bgColor} ${documentInfo.textColor} ${documentInfo.borderColor} border text-xs px-2 py-1 rounded-full flex items-center space-x-1`}>
                    <span>{documentInfo.icon}</span>
                    <span className="hidden sm:inline">{documentInfo.text}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{prompt.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {prompt.name}
                    </h4>
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {prompt.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                
                {/* Informação sobre documento na parte inferior */}
                {documentInfo && (
                  <div className={`mb-3 p-2 rounded-md ${documentInfo.bgColor} ${documentInfo.borderColor} border`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{documentInfo.icon}</span>
                      <span className={`text-xs font-medium ${documentInfo.textColor}`}>
                        {documentInfo.type === 'mandatory' 
                          ? 'Requer documento para funcionar' 
                          : 'Funciona melhor com documento'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Powered by BIPETech
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chats recentes */}
      {chats.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chats Recentes</h3>
          <div className="space-y-3">
            {chats.slice(-3).reverse().map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{chat.promptType.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{chat.title}</h4>
                      <p className="text-sm text-gray-600">{chat.promptType.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {chat.promptType.category}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(chat.lastUpdate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de criação de chat */}
      <ChatCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
};

export default JuriAI;
