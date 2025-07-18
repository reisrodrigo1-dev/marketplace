import { chatService } from '../firebase/firestore';
import { auth } from '../firebase/config';

// Serviço para gerenciar chats do Juri.AI
export const chatStorageService = {
  // Criar novo chat
  async createChat(promptType, title) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const chatData = {
        promptType,
        title,
        messages: [],
        collectedData: [],
        conversationPhase: 'questioning',
        isCompleted: false
      };

      const result = await chatService.createChat(user.uid, chatData);
      return result;
    } catch (error) {
      console.error('Erro ao criar chat:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter todos os chats do usuário
  async getChats() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const result = await chatService.getChats(user.uid);
      return result;
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar chat
  async updateChat(chatId, updates) {
    try {
      const result = await chatService.updateChat(chatId, updates);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar chat:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletar chat
  async deleteChat(chatId) {
    try {
      const result = await chatService.deleteChat(chatId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar título do chat
  async updateChatTitle(chatId, newTitle) {
    try {
      const result = await chatService.updateChat(chatId, { title: newTitle });
      return result;
    } catch (error) {
      console.error('Erro ao atualizar título do chat:', error);
      return { success: false, error: error.message };
    }
  },

  // Adicionar mensagem ao chat
  async addMessage(chatId, message) {
    try {
      const result = await chatService.addMessage(chatId, message);
      return result;
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar dados coletados
  async updateCollectedData(chatId, collectedData) {
    try {
      const result = await chatService.updateCollectedData(chatId, collectedData);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar dados coletados:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar fase da conversa
  async updateConversationPhase(chatId, phase) {
    try {
      const result = await chatService.updateConversationPhase(chatId, phase);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar fase da conversa:', error);
      return { success: false, error: error.message };
    }
  },

  // Salvar progresso completo do chat
  async saveProgress(chatId, messages, collectedData, conversationPhase, attachedDocuments = []) {
    try {
      console.log('Salvando progresso do chat:', {
        chatId,
        messagesCount: messages.length,
        collectedDataCount: collectedData.length,
        conversationPhase,
        documentsCount: attachedDocuments.length
      });

      const updates = {
        messages,
        collectedData,
        conversationPhase,
        isCompleted: conversationPhase === 'completed',
        attachedDocuments
      };
      
      const result = await chatService.updateChat(chatId, updates);
      
      if (result.success) {
        console.log('Chat salvo com sucesso no Firestore:', chatId);
      } else {
        console.error('Erro ao salvar chat no Firestore:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      return { success: false, error: error.message };
    }
  },

  // Escutar mudanças em tempo real
  onChatSnapshot(chatId, callback) {
    return chatService.onChatSnapshot(chatId, callback);
  },

  // Migrar chats do localStorage para Firestore
  async migrateFromLocalStorage() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const localChats = JSON.parse(localStorage.getItem('juriAI_chats') || '[]');
      
      if (localChats.length === 0) {
        return { success: true, migrated: 0 };
      }

      let migrated = 0;
      let errors = 0;

      for (const chat of localChats) {
        try {
          const chatData = {
            promptType: chat.promptType,
            title: chat.title,
            messages: chat.messages || [],
            collectedData: chat.collectedData || [],
            conversationPhase: chat.conversationPhase || 'questioning',
            isCompleted: chat.isCompleted || false
          };

          const result = await chatService.createChat(user.uid, chatData);
          
          if (result.success) {
            migrated++;
          } else {
            errors++;
            console.error('Erro ao migrar chat:', result.error);
          }
        } catch (error) {
          errors++;
          console.error('Erro ao migrar chat individual:', error);
        }
      }

      // Limpar localStorage após migração bem-sucedida
      if (migrated > 0 && errors === 0) {
        localStorage.removeItem('juriAI_chats');
      }

      return { success: true, migrated, errors };
    } catch (error) {
      console.error('Erro na migração:', error);
      return { success: false, error: error.message };
    }
  }
};
