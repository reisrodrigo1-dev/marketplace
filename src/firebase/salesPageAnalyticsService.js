import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';

const salesPageAnalyticsService = {
  // Registrar visualização
  async registerView(salesPageId) {
    await addDoc(collection(db, 'salesPageViews'), {
      salesPageId,
      timestamp: new Date(),
    });
  },

  // Registrar conversão
  async registerConversion(salesPageId) {
    await addDoc(collection(db, 'salesPageConversions'), {
      salesPageId,
      timestamp: new Date(),
    });
  },

  // Buscar total de visualizações
  async getViewsCount(salesPageId) {
    const q = query(collection(db, 'salesPageViews'), where('salesPageId', '==', salesPageId));
    const snap = await getDocs(q);
    return snap.size;
  },

  // Buscar total de conversões
  async getConversionsCount(salesPageId) {
    const q = query(collection(db, 'salesPageConversions'), where('salesPageId', '==', salesPageId));
    const snap = await getDocs(q);
    return snap.size;
  },
};

export { salesPageAnalyticsService };
