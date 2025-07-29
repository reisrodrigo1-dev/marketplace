// Serviço para manipular acessos/alunos por página no Firestore
// Estrutura: alunosPorPagina/{paginaId}_{alunoId}

import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';

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
      console.log(`🔍 [DEBUG] Iniciando busca de acessos:`);
      console.log(`   - Aluno ID: ${alunoId}`);
      console.log(`   - Página ID: ${paginaId}`);
      console.log(`   - Timestamp: ${new Date().toISOString()}`);

      // Primeiro tenta buscar na coleção 'acessos'
      console.log(`🔍 [DEBUG] Tentativa 1: Buscando na coleção 'acessos'...`);
      let q = query(
        collection(db, 'acessos'),
        where('alunoId', '==', alunoId),
        where('paginaId', '==', paginaId)
      );
      let querySnapshot = await getDocs(q);
      
      console.log(`📊 [DEBUG] Documentos encontrados na coleção 'acessos': ${querySnapshot.docs.length}`);
      
      if (querySnapshot.docs.length > 0) {
        querySnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📄 [DEBUG] Acesso ${index + 1}:`, {
            id: doc.id,
            cursoId: data.cursoId,
            cursoTitulo: data.cursoTitulo || data.nomeProduto,
            nome: data.nome,
            email: data.email,
            dataAcesso: data.dataAcesso,
            ativo: data.ativo
          });
        });
      }

      // Se não encontrar, tenta na coleção legada 'alunosPorPagina'
      if (querySnapshot.docs.length === 0) {
        console.log(`🔍 [DEBUG] Tentativa 2: Buscando na coleção 'alunosPorPagina'...`);
        q = query(
          collection(db, 'alunosPorPagina'),
          where('alunoId', '==', alunoId),
          where('paginaId', '==', paginaId)
        );
        querySnapshot = await getDocs(q);
        console.log(`📊 [DEBUG] Documentos encontrados na coleção 'alunosPorPagina': ${querySnapshot.docs.length}`);
        
        if (querySnapshot.docs.length > 0) {
          querySnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`📄 [DEBUG] Acesso legado ${index + 1}:`, {
              id: doc.id,
              cursoId: data.cursoId,
              cursoTitulo: data.cursoTitulo || data.nomeProduto,
              nome: data.nome,
              email: data.email,
              dataAcesso: data.dataAcesso
            });
          });
        }
      }

      // Se ainda não encontrou, tenta buscar com base no documento composto (formato antigo)
      if (querySnapshot.docs.length === 0) {
        console.log(`🔍 [DEBUG] Tentativa 3: Buscando documento composto...`);
        const compositeId = `${paginaId}_${alunoId}`;
        console.log(`🔍 [DEBUG] ID composto: ${compositeId}`);
        
        try {
          const docRef = doc(db, 'alunosPorPagina', compositeId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log(`✅ [DEBUG] Documento composto encontrado!`, docSnap.data());
            querySnapshot = { docs: [docSnap] };
          } else {
            console.log(`❌ [DEBUG] Documento composto não existe`);
          }
        } catch (docError) {
          console.log(`❌ [DEBUG] Erro ao buscar documento composto:`, docError);
        }
      }

      const acessos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`✅ [DEBUG] Processando acesso final:`, { id: doc.id, ...data });
        return { id: doc.id, ...data };
      });

      console.log(`📊 [DEBUG] RESULTADO FINAL: ${acessos.length} acessos encontrados`);
      
      // Se ainda não encontrou, faz debug mais detalhado
      if (acessos.length === 0) {
        console.log(`🚨 [DEBUG] NENHUM ACESSO ENCONTRADO! Iniciando debug detalhado...`);
        
        // Busca todos os acessos do aluno (sem filtro de página)
        console.log(`🔍 [DEBUG] Buscando TODOS os acessos do aluno ${alunoId}...`);
        const debugQuery = query(
          collection(db, 'acessos'),
          where('alunoId', '==', alunoId)
        );
        const debugSnapshot = await getDocs(debugQuery);
        console.log(`📊 [DEBUG] Total de acessos do aluno em TODAS as páginas: ${debugSnapshot.docs.length}`);
        
        debugSnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📄 [DEBUG] Acesso global ${index + 1}:`, {
            id: doc.id,
            paginaId: data.paginaId,
            cursoId: data.cursoId,
            cursoTitulo: data.cursoTitulo || data.nomeProduto,
            nome: data.nome,
            email: data.email,
            dataAcesso: data.dataAcesso,
            ativo: data.ativo
          });
          
          // Destaca se a página for diferente da procurada
          if (data.paginaId !== paginaId) {
            console.log(`⚠️ [DEBUG] Este acesso é de uma página diferente! Página atual: ${data.paginaId}, Procurada: ${paginaId}`);
          }
        });

        // Também busca na coleção alunosPorPagina sem filtros
        console.log(`🔍 [DEBUG] Buscando na coleção legada 'alunosPorPagina'...`);
        const debugQueryLegacy = query(
          collection(db, 'alunosPorPagina'),
          where('alunoId', '==', alunoId)
        );
        const debugSnapshotLegacy = await getDocs(debugQueryLegacy);
        console.log(`📊 [DEBUG] Total de acessos legados do aluno: ${debugSnapshotLegacy.docs.length}`);
        
        debugSnapshotLegacy.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📄 [DEBUG] Acesso legado global ${index + 1}:`, {
            id: doc.id,
            paginaId: data.paginaId,
            cursoId: data.cursoId,
            cursoTitulo: data.cursoTitulo || data.nomeProduto,
            nome: data.nome,
            email: data.email,
            dataAcesso: data.dataAcesso
          });
          
          if (data.paginaId !== paginaId) {
            console.log(`⚠️ [DEBUG] Este acesso legado é de uma página diferente! Página atual: ${data.paginaId}, Procurada: ${paginaId}`);
          }
        });

        // Busca todas as páginas existentes para comparar
        console.log(`🔍 [DEBUG] Verificando páginas de vendas existentes...`);
        try {
          const salesPagesSnapshot = await getDocs(collection(db, 'salesPages'));
          console.log(`📊 [DEBUG] Total de páginas de vendas no sistema: ${salesPagesSnapshot.docs.length}`);
          
          salesPagesSnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`📄 [DEBUG] Página ${index + 1}:`, {
              id: doc.id,
              titulo: data.titulo,
              slug: data.slug,
              ownerId: data.ownerId
            });
            
            if (doc.id === paginaId) {
              console.log(`✅ [DEBUG] Esta é a página que estamos procurando!`);
            }
          });
        } catch (pageError) {
          console.log(`❌ [DEBUG] Erro ao buscar páginas:`, pageError);
        }
      }

      return { success: true, data: acessos };
    } catch (error) {
      console.error(`❌ [DEBUG] ERRO FATAL ao buscar acessos do aluno:`, error);
      console.error(`❌ [DEBUG] Stack trace:`, error.stack);
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

  // Atualiza perfil de um aluno específico
  async atualizarPerfilAluno(alunoId, dadosAtualizacao) {
    try {
      console.log('📝 Atualizando perfil do aluno:', alunoId, dadosAtualizacao);

      // Atualizar todos os acessos do aluno
      const acessosQuery = query(
        collection(db, 'acessos'),
        where('alunoId', '==', alunoId)
      );
      const acessosSnapshot = await getDocs(acessosQuery);

      const updatePromises = acessosSnapshot.docs.map(doc => {
        return updateDoc(doc.ref, {
          nome: dadosAtualizacao.nome || dadosAtualizacao.name,
          telefone: dadosAtualizacao.telefone,
          cpf: dadosAtualizacao.cpf,
          dataNascimento: dadosAtualizacao.dataNascimento,
          endereco: dadosAtualizacao.endereco,
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(updatePromises);

      console.log('✅ Perfil do aluno atualizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil do aluno:', error);
      return { success: false, error: error.message };
    }
  },

  // Busca dados detalhados de um aluno específico
  async getAlunoDetalhado(alunoId, paginaId) {
    try {
      console.log('🔍 Buscando dados detalhados do aluno:', alunoId, 'Página:', paginaId);

      const acessosQuery = query(
        collection(db, 'acessos'),
        where('alunoId', '==', alunoId),
        where('paginaId', '==', paginaId)
      );
      const acessosSnapshot = await getDocs(acessosQuery);

      if (acessosSnapshot.empty) {
        return { success: false, error: 'Aluno não encontrado' };
      }

      // Pega o primeiro acesso (todos devem ter os mesmos dados do aluno)
      const alunoData = acessosSnapshot.docs[0].data();

      return {
        success: true,
        data: {
          alunoId: alunoData.alunoId,
          nome: alunoData.nome,
          email: alunoData.email,
          telefone: alunoData.telefone || '',
          cpf: alunoData.cpf || '',
          dataNascimento: alunoData.dataNascimento || '',
          endereco: alunoData.endereco || ''
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados do aluno:', error);
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
      // Busca informações do usuário para usar dados reais
      let nomeAluno = 'Aluno Teste';
      let emailAluno = 'teste@example.com';
      
      try {
        const userRef = doc(db, 'users', alunoId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          nomeAluno = userData.name || userData.displayName || 'Aluno Teste';
          emailAluno = userData.email || 'teste@example.com';
        }
      } catch (userError) {
        console.log('Erro ao buscar dados do usuário, usando dados padrão:', userError);
      }

      const acessoData = {
        alunoId: alunoId,
        paginaId: paginaId,
        cursoId: cursoId || 'curso-teste-' + Date.now(),
        nomeProduto: nomeProduto || 'Curso de Teste - Direito Digital',
        cursoTitulo: nomeProduto || 'Curso de Teste - Direito Digital',
        cursoDescricao: 'Curso criado automaticamente para teste do sistema. Inclui módulos sobre legislação digital, LGPD e mais.',
        nome: nomeAluno,
        email: emailAluno,
        telefone: '(11) 99999-9999',
        cpf: '000.000.000-00',
        endereco: 'Rua das Flores, 123 - Centro - São Paulo/SP',
        dataNascimento: new Date('1990-01-01'),
        compradoEm: serverTimestamp(),
        dataAcesso: serverTimestamp(),
        ativo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Criando acesso de teste com dados:', acessoData);
      const acessoRef = await addDoc(collection(db, 'acessos'), acessoData);
      console.log('Acesso de teste criado com ID:', acessoRef.id);
      
      return { success: true, id: acessoRef.id };
    } catch (error) {
      console.error('Erro ao criar acesso de teste:', error);
      return { success: false, error: error.message };
    }
  },

  // Função para verificar se existem dados de teste e criar se necessário
  async verificarECriarDadosTeste(alunoId, paginaId) {
    try {
      console.log('Verificando dados de teste para:', { alunoId, paginaId });
      
      const acessosResult = await this.getAcessosPorAluno(alunoId, paginaId);
      
      if (acessosResult.success && acessosResult.data.length === 0) {
        console.log('Nenhum acesso encontrado. Criando dados de teste...');
        
        const testeResult = await this.criarAcessoTeste(alunoId, paginaId);
        
        if (testeResult.success) {
          console.log('Dados de teste criados. Buscando novamente...');
          return await this.getAcessosPorAluno(alunoId, paginaId);
        }
      }
      
      return acessosResult;
    } catch (error) {
      console.error('Erro ao verificar/criar dados de teste:', error);
      return { success: false, error: error.message };
    }
  },
};