/**
 * SERVIÇO PARA GERAÇÃO E GERENCIAMENTO DE CÓDIGOS ÚNICOS DE USUÁRIO
 * 
 * Este serviço é responsável por:
 * - Gerar códigos únicos de 8 caracteres (números e letras)
 * - Verificar se um código já existe
 * - Atribuir códigos para advogados e clientes
 * - Buscar usuários por código
 */

import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export class UserCodeService {
  constructor() {
    this.CODE_LENGTH = 8;
    this.CHARACTERS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Excluindo O, 0 para evitar confusão
  }

  /**
   * Gera um código único de 8 caracteres
   */
  generateUserCode() {
    let code = '';
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * this.CHARACTERS.length);
      code += this.CHARACTERS[randomIndex];
    }
    return code;
  }

  /**
   * Verifica se um código já existe no banco de dados
   */
  async checkCodeExists(code) {
    try {
      // Verificar na coleção users
      const usersQuery = query(
        collection(db, 'users'),
        where('userCode', '==', code)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        return { exists: true, collection: 'users' };
      }

      // Verificar na coleção clients
      const clientsQuery = query(
        collection(db, 'clients'),
        where('userCode', '==', code)
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      
      if (!clientsSnapshot.empty) {
        return { exists: true, collection: 'clients' };
      }

      return { exists: false };
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return { exists: false, error: error.message };
    }
  }

  /**
   * Gera um código único garantindo que não existe duplicação
   */
  async generateUniqueUserCode() {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = this.generateUserCode();
      const checkResult = await this.checkCodeExists(code);
      
      if (checkResult.error) {
        console.warn('Erro ao verificar código, tentando novamente...', checkResult.error);
        attempts++;
        continue;
      }
      
      if (!checkResult.exists) {
        return { success: true, code };
      }
      
      attempts++;
    }

    // Se após 10 tentativas não conseguir gerar um código único, usar timestamp
    const fallbackCode = this.generateCodeWithTimestamp();
    return { success: true, code: fallbackCode, fallback: true };
  }

  /**
   * Gera código com timestamp como fallback
   */
  generateCodeWithTimestamp() {
    const timestamp = Date.now().toString();
    const randomPart = this.generateUserCode().substring(0, 4);
    const timestampPart = timestamp.slice(-4);
    return (randomPart + timestampPart).toUpperCase();
  }

  /**
   * Atribui um código único a um usuário existente
   */
  async assignCodeToUser(userId, userType = 'cliente') {
    try {
      const codeResult = await this.generateUniqueUserCode();
      
      if (!codeResult.success) {
        return { success: false, error: 'Erro ao gerar código único' };
      }

      // Determinar coleção baseada no tipo de usuário
      const collectionName = userType === 'advogado' ? 'users' : 'users';
      
      // Atualizar usuário com o código
      await updateDoc(doc(db, collectionName, userId), {
        userCode: codeResult.code,
        codeGeneratedAt: new Date(),
        codeGeneratedBy: 'system'
      });

      return { 
        success: true, 
        code: codeResult.code,
        fallback: codeResult.fallback || false
      };
    } catch (error) {
      console.error('Erro ao atribuir código ao usuário:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca usuário por código
   */
  async getUserByCode(code) {
    try {
      // Buscar em users
      const usersQuery = query(
        collection(db, 'users'),
        where('userCode', '==', code.toUpperCase())
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        return { 
          success: true, 
          data: { 
            id: userDoc.id, 
            ...userDoc.data(),
            collection: 'users'
          } 
        };
      }

      // Buscar em clients  
      const clientsQuery = query(
        collection(db, 'clients'),
        where('userCode', '==', code.toUpperCase())
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      
      if (!clientsSnapshot.empty) {
        const clientDoc = clientsSnapshot.docs[0];
        return { 
          success: true, 
          data: { 
            id: clientDoc.id, 
            ...clientDoc.data(),
            collection: 'clients'
          } 
        };
      }

      return { success: false, error: 'Código não encontrado' };
    } catch (error) {
      console.error('Erro ao buscar usuário por código:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualiza códigos de usuários existentes (migração)
   */
  async migrateExistingUsers() {
    try {
      console.log('🔄 Iniciando migração de códigos de usuário...');
      
      // Buscar todos os usuários sem código
      const usersQuery = query(
        collection(db, 'users'),
        where('userCode', '==', null)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      let updated = 0;
      let errors = 0;

      for (const userDoc of usersSnapshot.docs) {
        try {
          const userData = userDoc.data();
          const assignResult = await this.assignCodeToUser(
            userDoc.id, 
            userData.userType || 'cliente'
          );
          
          if (assignResult.success) {
            updated++;
            console.log(`✅ Código ${assignResult.code} atribuído ao usuário ${userData.name || userDoc.id}`);
          } else {
            errors++;
            console.error(`❌ Erro ao atribuir código ao usuário ${userDoc.id}:`, assignResult.error);
          }
        } catch (error) {
          errors++;
          console.error(`❌ Erro ao processar usuário ${userDoc.id}:`, error);
        }
      }

      console.log(`✅ Migração concluída: ${updated} usuários atualizados, ${errors} erros`);
      return { success: true, updated, errors };
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Formata código para exibição (com separador)
   */
  formatCodeForDisplay(code) {
    if (!code || code.length !== 8) return code;
    return `${code.substring(0, 4)}-${code.substring(4, 8)}`;
  }

  /**
   * Remove formatação do código
   */
  cleanCode(code) {
    return code.replace(/[^A-Z0-9]/g, '').toUpperCase();
  }

  /**
   * Valida formato do código
   */
  validateCodeFormat(code) {
    const cleanedCode = this.cleanCode(code);
    const isValid = /^[A-Z0-9]{8}$/.test(cleanedCode);
    
    return {
      isValid,
      cleanedCode,
      formatted: this.formatCodeForDisplay(cleanedCode)
    };
  }
}

// Instância singleton do serviço
export const userCodeService = new UserCodeService();

// Funções utilitárias para uso direto
export const generateUniqueUserCode = () => userCodeService.generateUniqueUserCode();
export const assignCodeToUser = (userId, userType) => userCodeService.assignCodeToUser(userId, userType);
export const getUserByCode = (code) => userCodeService.getUserByCode(code);
export const formatUserCode = (code) => userCodeService.formatCodeForDisplay(code);
export const validateUserCode = (code) => userCodeService.validateCodeFormat(code);

export default userCodeService;
