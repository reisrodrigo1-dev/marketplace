import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Serviço para gerenciar páginas de vendas
const salesPageService = {
  // Criar página de vendas
  async createSalesPage(userId, pageData) {
    try {
      const pageRef = doc(collection(db, 'salesPages'));
      await setDoc(pageRef, {
        ...pageData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: pageRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Buscar páginas de vendas do usuário
  async getUserSalesPages(userId) {
    try {
      const q = query(collection(db, 'salesPages'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const pages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: pages };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Buscar página de vendas por slug
  async getSalesPageBySlug(slug) {
    try {
      const q = query(collection(db, 'salesPages'), where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { success: true, data: querySnapshot.docs[0].data() };
      }
      return { success: false, error: 'Página não encontrada.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar página de vendas
  async updateSalesPage(pageId, pageData) {
    try {
      await updateDoc(doc(db, 'salesPages', pageId), {
        ...pageData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Excluir página de vendas
  async deleteSalesPage(pageId) {
    try {
      await deleteDoc(doc(db, 'salesPages', pageId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export { salesPageService };
