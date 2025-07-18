import React, { useState, useEffect } from 'react';
import { promptTypes } from '../services/promptService';
import { chatStorageService } from '../services/chatStorageService';
import { useAuth } from '../contexts/AuthContext';

// Função utilitária para normalizar timestamps de diferentes fontes
const normalizeTimestamp = (timestamp) => {
  if (timestamp instanceof Date) {
    return timestamp;
  } else if (timestamp && typeof timestamp.toDate === 'function') {
    // Firestore Timestamp
    return timestamp.toDate();
  } else if (timestamp && typeof timestamp === 'string') {
    // String ISO
    return new Date(timestamp);
  } else if (timestamp && typeof timestamp === 'number') {
    // Unix timestamp
    return new Date(timestamp);
  } else {
    // Fallback para timestamp atual
    return new Date();
  }
};

const ChatHistory = ({ onSelectChat, onDeleteChat, onChatUpdated }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [renamingChat, setRenamingChat] = useState(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  const { user } = useAuth();

  // Carregar histórico de chats do Firestore
  useEffect(() => {
    const loadChats = async () => {
      console.log('Loading chats for user:', user?.uid);
      
      if (!user) {
        console.log('No user, clearing chat history');
        setChatHistory([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('User authenticated, loading chats...');
        
        // Tentar migrar chats do localStorage primeiro
        const migrationResult = await chatStorageService.migrateFromLocalStorage();
        console.log('Migration result:', migrationResult);
        
        // Carregar chats do Firestore
        const result = await chatStorageService.getChats();
        console.log('Chats loaded result:', result);
        
        if (result.success) {
          console.log('Chats loaded successfully:', result.data);
          
          // Verificar se cada chat tem mensagens
          result.data.forEach(chat => {
            console.log(`Chat ${chat.id}:`, {
              title: chat.title,
              messagesCount: chat.messages?.length || 0,
              collectedDataCount: chat.collectedData?.length || 0,
              conversationPhase: chat.conversationPhase
            });
          });
          
          setChatHistory(result.data);
        } else {
          console.error('Error loading chats:', result.error);
          setChatHistory([]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setChatHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [user]);

  // Deletar chat
  const handleDeleteChat = async (chatId) => {
    try {
      const result = await chatStorageService.deleteChat(chatId);
      
      if (result.success) {
        const updatedChats = chatHistory.filter(chat => chat.id !== chatId);
        setChatHistory(updatedChats);
        onDeleteChat?.(chatId);
      } else {
        console.error('Erro ao deletar chat:', result.error);
      }
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
    }
  };

  // Renomear chat
  const handleRenameChat = async (chatId, newTitle) => {
    try {
      const result = await chatStorageService.updateChatTitle(chatId, newTitle);
      
      if (result.success) {
        const updatedChats = chatHistory.map(chat => 
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        );
        setChatHistory(updatedChats);
        setRenamingChat(null);
        setNewChatTitle('');
        onChatUpdated?.(chatId, newTitle);
      } else {
        console.error('Erro ao renomear chat:', result.error);
      }
    } catch (error) {
      console.error('Erro ao renomear chat:', error);
    }
  };

  // Iniciar renomeação
  const startRenaming = (chat) => {
    setRenamingChat(chat.id);
    setNewChatTitle(chat.title);
  };

  // Cancelar renomeação
  const cancelRenaming = () => {
    setRenamingChat(null);
    setNewChatTitle('');
  };

  // Confirmar renomeação
  const confirmRenaming = () => {
    if (renamingChat && newChatTitle.trim()) {
      handleRenameChat(renamingChat, newChatTitle.trim());
    }
  };

  // Filtrar chats baseado na pesquisa
  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.promptType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateValue) => {
    const date = normalizeTimestamp(dateValue);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Histórico de Chats</h2>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando histórico...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum chat encontrado' : 'Nenhum chat ainda'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Tente outros termos de pesquisa' : 'Crie seu primeiro chat para começar'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  console.log('ChatHistory: Selecionando chat (click no card):', {
                    id: chat.id,
                    title: chat.title,
                    messages: chat.messages?.length || 0,
                    promptType: chat.promptType,
                    conversationPhase: chat.conversationPhase,
                    fullChat: chat
                  });
                  onSelectChat(chat);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{chat.promptType.icon}</span>
                      {renamingChat === chat.id ? (
                        <input
                          type="text"
                          value={newChatTitle}
                          onChange={(e) => setNewChatTitle(e.target.value)}
                          onBlur={cancelRenaming}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              confirmRenaming();
                            } else if (e.key === 'Escape') {
                              cancelRenaming();
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="font-semibold text-gray-900 truncate">{chat.title}</h3>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{chat.promptType.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {chat.promptType.category}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(chat.lastUpdate)}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    {renamingChat === chat.id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmRenaming();
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Confirmar renomeação"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelRenaming();
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Cancelar renomeação"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('ChatHistory: Selecionando chat:', {
                              id: chat.id,
                              title: chat.title,
                              messages: chat.messages?.length || 0,
                              promptType: chat.promptType,
                              conversationPhase: chat.conversationPhase
                            });
                            onSelectChat(chat);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Abrir chat"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRenaming(chat);
                          }}
                          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Renomear chat"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Deletar chat"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
