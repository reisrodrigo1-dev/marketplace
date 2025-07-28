import { collection, doc, setDoc, serverTimestamp, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db } from './config';

// Serviço de associação Cliente-Processo
export const clientProcessService = {
  async associateClientToProcess({
    clienteId,
    processoId,
    advogadoId,
    nomeAdvogado,
    nomeProcesso,
    paginaOrigemId: paginaOrigemIdFromFrontend
  }) {
    try {
      const assocId = `${clienteId}_${processoId}`;
      // Buscar dados do cliente para salvar nome e página de origem
      let clienteNome = '';
      let paginaOrigemId = paginaOrigemIdFromFrontend || '';
      let paginaOrigemNome = '';
      try {
        const clientDoc = await getDoc(doc(db, 'clients', clienteId));
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          clienteNome = data.nome || data.name || '';
          // Só sobrescreve se não veio do frontend
          if (!paginaOrigemId) {
            paginaOrigemId = data.paginaId || data.paginaOrigemId || '';
          }
          paginaOrigemNome = data.nomePagina || data.paginaOrigemNome || '';
        }
      } catch (e) {
        console.warn('[Firestore] Não foi possível buscar dados do cliente para associação:', e);
      }
      await setDoc(doc(db, 'cliente_processo', assocId), {
        processoId,
        nomeProcesso: nomeProcesso || '',
        clienteId,
        clienteNome,
        advogadoId: advogadoId || '',
        nomeAdvogado: nomeAdvogado || '',
        paginaOrigemId,
        paginaOrigemNome,
        dataAssociacao: serverTimestamp()
      });
      console.log('[Firestore] Associação salva:', {
        assocId,
        processoId,
        nomeProcesso,
        clienteId,
        clienteNome,
        advogadoId,
        nomeAdvogado,
        paginaOrigemId,
        paginaOrigemNome
      });
      return { success: true };
    } catch (error) {
      console.error('[Firestore] Erro ao salvar associação:', error);
      return { success: false, error: error.message };
    }
  },
  async getAssociationsByClient(clienteId) {
    try {
      const q = query(collection(db, 'cliente_processo'), where('clienteId', '==', clienteId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  async getAssociations(userId) {
    // Busca todas as associações de cliente-processo (pode ser filtrado por userId se existir esse campo)
    try {
      const q = collection(db, 'cliente_processo');
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
