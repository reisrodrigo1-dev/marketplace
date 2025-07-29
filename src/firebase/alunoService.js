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
  },

  // Verifica se um aluno tem acesso a uma página específica
  async verificarAcessoAluno(alunoId, paginaId) {
    const q = query(collection(db, COLLECTION), where('alunoId', '==', alunoId), where('paginaId', '==', paginaId));
    const snap = await getDocs(q);
    return { success: true, temAcesso: !snap.empty, totalCursos: snap.size };
  },

  // Lista todos os alunos únicos de uma página (para gestão)
  async getAlunosUnicosPorPagina(paginaId) {
    const q = query(collection(db, COLLECTION), where('paginaId', '==', paginaId));
    const snap = await getDocs(q);
    const acessos = snap.docs.map(doc => doc.data());
    
    // Agrupa por aluno para evitar duplicatas
    const alunosMap = new Map();
    acessos.forEach(acesso => {
      if (!alunosMap.has(acesso.alunoId)) {
        alunosMap.set(acesso.alunoId, {
          alunoId: acesso.alunoId,
          nome: acesso.nome,
          email: acesso.email,
          totalCursos: 0,
          primeiroAcesso: acesso.dataAcesso,
          ultimoAcesso: acesso.dataAcesso
        });
      }
      const aluno = alunosMap.get(acesso.alunoId);
      aluno.totalCursos++;
      
      // Atualiza datas
      if (acesso.dataAcesso < aluno.primeiroAcesso) {
        aluno.primeiroAcesso = acesso.dataAcesso;
      }
      if (acesso.dataAcesso > aluno.ultimoAcesso) {
        aluno.ultimoAcesso = acesso.dataAcesso;
      }
    });
    
    return { success: true, data: Array.from(alunosMap.values()) };
  }
};
