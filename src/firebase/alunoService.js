// Serviço para manipular acessos/alunos por página no Firestore
// Estrutura: alunosPorPagina/{paginaId}_{alunoId}

import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';

const COLLECTION = 'alunosPorPagina';

export const alunoService = {
  // Cria ou atualiza acesso do aluno a um curso em uma página
  async criarOuAtualizarAcesso({ paginaId, alunoId, nome, email, cpf, dataNascimento, endereco, cursoId, cursoTitulo, cursoDescricao, linkAcesso }) {
    const docId = `${paginaId}_${alunoId}_${cursoId}`;
    const ref = doc(db, COLLECTION, docId);
    const data = {
      paginaId,
      alunoId,
      nome,
      email,
      cpf: cpf || '',
      dataNascimento: dataNascimento || '',
      endereco: endereco || '',
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
          telefone: acesso.telefone || '',
          cpf: acesso.cpf || '',
          dataNascimento: acesso.dataNascimento || '',
          endereco: acesso.endereco || '',
          totalCursos: 0,
          primeiroAcesso: acesso.dataAcesso,
          ultimoAcesso: acesso.dataAcesso,
          cursosMatriculados: []
        });
      }
      const aluno = alunosMap.get(acesso.alunoId);
      aluno.totalCursos++;
      aluno.cursosMatriculados.push({
        cursoId: acesso.cursoId,
        cursoTitulo: acesso.cursoTitulo,
        dataAcesso: acesso.dataAcesso
      });
      
      // Atualiza datas
      if (acesso.dataAcesso < aluno.primeiroAcesso) {
        aluno.primeiroAcesso = acesso.dataAcesso;
      }
      if (acesso.dataAcesso > aluno.ultimoAcesso) {
        aluno.ultimoAcesso = acesso.dataAcesso;
      }
    });

    // Buscar informações adicionais dos usuários no Firebase Auth/Firestore
    const alunosComDetalhes = [];
    for (const aluno of Array.from(alunosMap.values())) {
      try {
        // Buscar informações do usuário na collection 'users'
        const userRef = doc(db, 'users', aluno.alunoId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          aluno.nome = userData.name || aluno.nome;
          aluno.telefone = userData.telefone || aluno.telefone || '';
          aluno.cpf = userData.cpf || aluno.cpf || '';
          aluno.dataNascimento = userData.dataNascimento || aluno.dataNascimento || '';
          aluno.endereco = userData.endereco || aluno.endereco || '';
        }
        
        alunosComDetalhes.push(aluno);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        alunosComDetalhes.push(aluno);
      }
    }
    
    return { success: true, data: alunosComDetalhes };
  },

  // Atualiza informações do perfil do aluno
  async atualizarPerfilAluno(alunoId, dadosAtualizados) {
    try {
      // Atualiza na collection users
      const userRef = doc(db, 'users', alunoId);
      await setDoc(userRef, dadosAtualizados, { merge: true });

      // Atualiza todos os acessos do aluno
      const q = query(collection(db, COLLECTION), where('alunoId', '==', alunoId));
      const snap = await getDocs(q);
      
      const updatePromises = snap.docs.map(docSnapshot => {
        const docRef = doc(db, COLLECTION, docSnapshot.id);
        return setDoc(docRef, dadosAtualizados, { merge: true });
      });

      await Promise.all(updatePromises);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil do aluno:', error);
      return { success: false, error: error.message };
    }
  }
};
