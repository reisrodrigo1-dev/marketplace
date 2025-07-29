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

  // Busca acessos de um aluno para uma página específica
  async getAcessosPorAluno(alunoId, paginaId) {
    try {
      console.log(`Buscando acessos para aluno: ${alunoId}, página: ${paginaId}`);

      const q = query(
        collection(db, 'acessos'),
        where('alunoId', '==', alunoId),
        where('paginaId', '==', paginaId)
      );
      const querySnapshot = await getDocs(q);
      const acessos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Acesso encontrado:', { id: doc.id, ...data });
        return { id: doc.id, ...data };
      });

      console.log(`Total de acessos encontrados: ${acessos.length}`);
      return { success: true, data: acessos };
    } catch (error) {
      console.error('Erro ao buscar acessos do aluno:', error);
      return { success: false, error: error.message };
    }
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
  async atualizarPerfilAluno(alunoId, dadosAtualizacao) {
    try {
      console.log('Atualizando perfil do aluno:', alunoId, dadosAtualizacao);

      // Atualiza na coleção users
      const alunoRef = doc(db, 'users', alunoId);
      await updateDoc(alunoRef, {
        name: dadosAtualizacao.name,
        endereco: dadosAtualizacao.endereco,
        updatedAt: serverTimestamp()
      });

      // Também atualiza todos os acessos do aluno
      const acessosQuery = query(
        collection(db, 'acessos'),
        where('alunoId', '==', alunoId)
      );
      const acessosSnapshot = await getDocs(acessosQuery);

      const updatePromises = acessosSnapshot.docs.map(doc => {
        return updateDoc(doc.ref, {
          nome: dadosAtualizacao.name,
          endereco: dadosAtualizacao.endereco,
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(updatePromises);

      console.log('Perfil atualizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil do aluno:', error);
      return { success: false, error: error.message };
    }
  },

  // Adiciona um produto/curso ao aluno
  async adicionarProdutoAluno(alunoData) {
    try {
      console.log('Criando acesso para aluno:', alunoData);

      const acessoRef = await addDoc(collection(db, 'acessos'), {
        ...alunoData,
        dataAcesso: serverTimestamp(),
        ativo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Acesso criado com ID:', acessoRef.id);
      return { success: true, id: acessoRef.id };
    } catch (error) {
      console.error('Erro ao adicionar produto ao aluno:', error);
      return { success: false, error: error.message };
    }
  },

  // Função para testar criação de acesso (usar apenas para debug)
  async criarAcessoTeste(alunoId, paginaId, cursoId, nomeProduto) {
    try {
      const acessoData = {
        alunoId: alunoId,
        paginaId: paginaId,
        cursoId: cursoId,
        nomeProduto: nomeProduto,
        nome: 'Aluno Teste',
        email: 'teste@example.com',
        telefone: '(11) 99999-9999',
        cpf: '000.000.000-00',
        endereco: 'Endereço teste',
        dataNascimento: new Date('1990-01-01'),
        compradoEm: serverTimestamp(),
        dataAcesso: serverTimestamp(),
        ativo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const result = await this.adicionarProdutoAluno(acessoData);
      console.log('Acesso de teste criado:', result);
      return result;
    } catch (error) {
      console.error('Erro ao criar acesso de teste:', error);
      return { success: false, error: error.message };
    }
  },
};