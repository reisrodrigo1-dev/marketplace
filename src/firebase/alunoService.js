// Serviço para manipular acessos/alunos por página no Firestore
// Estrutura: alunosPorPagina/{paginaId}_{alunoId}

import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';

const COLLECTION = 'alunosPorPagina';

export const alunoService = {
  // Cria ou atualiza acesso do aluno a um curso em uma página
  async criarOuAtualizarAcesso({ paginaId, alunoId, nome, email, cursoId, cursoTitulo, cursoDescricao, linkAcesso }) {
    const docId = `${paginaId}_${alunoId}_${cursoId}`;
    const ref = doc(db, COLLECTION, docId);
    const data = {
      paginaId,
      alunoId,
      nome,
      email,
      cursoId,
      cursoTitulo,
      cursoDescricao,
      linkAcesso,
      dataAcesso: new Date().toISOString(),
    };
    await setDoc(ref, data, { merge: true });
    return { success: true };
  },

  // Busca todos os acessos de um aluno em uma página
  async getAcessosPorAluno(alunoId, paginaId) {
    const q = query(collection(db, COLLECTION), where('alunoId', '==', alunoId), where('paginaId', '==', paginaId));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  },

  // Busca todos os alunos de uma página
  async getAlunosPorPagina(paginaId) {
    const q = query(collection(db, COLLECTION), where('paginaId', '==', paginaId));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  },

  // Busca todos os cursos de um aluno em todas as páginas
  async getAcessosPorAlunoGlobal(alunoId) {
    const q = query(collection(db, COLLECTION), where('alunoId', '==', alunoId));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  }
};
