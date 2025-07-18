// 📝 Exemplos de Uso dos Serviços Firebase
// Este arquivo demonstra como usar os serviços implementados

import { userService, clientService, caseService } from './firebase/firestore';
import { authService } from './firebase/auth';

// ============================================
// 🔐 EXEMPLOS DE AUTENTICAÇÃO
// ============================================

// Exemplo 1: Login com email/senha
const exemploLogin = async () => {
  const result = await authService.login('usuario@email.com', 'senha123');
  if (result.success) {
    console.log('Login realizado com sucesso!', result.user);
  } else {
    console.error('Erro no login:', result.error);
  }
};

// Exemplo 2: Registrar novo usuário
const exemploRegistro = async () => {
  const result = await authService.register(
    'novo@email.com', 
    'senha123', 
    'João Silva'
  );
  if (result.success) {
    console.log('Usuário registrado!', result.user);
  } else {
    console.error('Erro no registro:', result.error);
  }
};

// Exemplo 3: Login com Google
const exemploGoogleLogin = async () => {
  const result = await authService.loginWithGoogle();
  if (result.success) {
    console.log('Login com Google realizado!', result.user);
  } else {
    console.error('Erro no login com Google:', result.error);
  }
};

// ============================================
// 👤 EXEMPLOS DE GERENCIAMENTO DE USUÁRIOS
// ============================================

// Exemplo 4: Atualizar dados do usuário
const exemploAtualizarUsuario = async (userId) => {
  const result = await userService.updateUser(userId, {
    name: 'João Silva Santos',
    phone: '(11) 99999-9999',
    oab: '123456/SP',
    specialty: 'Direito Civil'
  });
  if (result.success) {
    console.log('Usuário atualizado com sucesso!');
  }
};

// Exemplo 5: Obter dados do usuário
const exemploObterUsuario = async (userId) => {
  const result = await userService.getUser(userId);
  if (result.success) {
    console.log('Dados do usuário:', result.data);
  }
};

// ============================================
// 🏢 EXEMPLOS DE GERENCIAMENTO DE CLIENTES
// ============================================

// Exemplo 6: Criar novo cliente
const exemploAdicionarCliente = async (userId) => {
  const clienteData = {
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    status: 'active'
  };

  const result = await clientService.createClient(userId, clienteData);
  if (result.success) {
    console.log('Cliente criado com ID:', result.id);
  }
};

// Exemplo 7: Listar clientes do usuário
const exemploListarClientes = async (userId) => {
  const result = await clientService.getClients(userId);
  if (result.success) {
    console.log('Clientes:', result.data);
    result.data.forEach(client => {
      console.log(`- ${client.name} (${client.email})`);
    });
  }
};

// Exemplo 8: Atualizar cliente
const exemploAtualizarCliente = async (clientId) => {
  const result = await clientService.updateClient(clientId, {
    phone: '(11) 77777-7777',
    status: 'inactive'
  });
  if (result.success) {
    console.log('Cliente atualizado!');
  }
};

// ============================================
// ⚖️ EXEMPLOS DE GERENCIAMENTO DE PROCESSOS
// ============================================

// Exemplo 9: Criar novo processo
const exemploAdicionarProcesso = async (userId) => {
  const processoData = {
    number: '1234567-89.2024.8.26.0001',
    title: 'Ação de Cobrança',
    description: 'Cobrança de honorários advocatícios',
    client: 'Maria Santos',
    clientId: 'cliente-id-123',
    court: '1ª Vara Cível de São Paulo',
    judge: 'Dr. João da Silva',
    status: 'Em andamento',
    priority: 'alta',
    startDate: new Date(),
    nextHearing: new Date('2024-08-15T14:00:00'),
    documents: [],
    notes: 'Processo em fase inicial'
  };

  const result = await caseService.createCase(userId, processoData);
  if (result.success) {
    console.log('Processo criado com ID:', result.id);
  }
};

// Exemplo 10: Listar processos do usuário
const exemploListarProcessos = async (userId) => {
  const result = await caseService.getCases(userId);
  if (result.success) {
    console.log('Processos:', result.data);
    result.data.forEach(processo => {
      console.log(`- ${processo.number}: ${processo.title} (${processo.status})`);
    });
  }
};

// ============================================
// 📊 EXEMPLOS DE QUERIES AVANÇADAS
// ============================================

// Exemplo 11: Buscar processos por status
const exemploProcessosPorStatus = async (userId, status) => {
  // Esta funcionalidade pode ser facilmente adicionada ao caseService
  // Exemplo de como seria implementada:
  
  /*
  const q = query(
    collection(db, 'cases'),
    where('userId', '==', userId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  */
};

// Exemplo 12: Buscar processos com prazo próximo
const exemploProcessosComPrazo = async (userId) => {
  // Exemplo de query para processos com audiência nos próximos 7 dias
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  /*
  const q = query(
    collection(db, 'cases'),
    where('userId', '==', userId),
    where('nextHearing', '<=', nextWeek),
    where('status', '==', 'Em andamento'),
    orderBy('nextHearing', 'asc')
  );
  */
};

// ============================================
// 🚀 COMO USAR NO COMPONENTE REACT
// ============================================

// Exemplo 13: Componente React usando os serviços
/*
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientService } from '../firebase/firestore';

const ClientesPage = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarClientes = async () => {
      if (user) {
        const result = await clientService.getClients(user.uid);
        if (result.success) {
          setClientes(result.data);
        }
        setLoading(false);
      }
    };

    carregarClientes();
  }, [user]);

  const adicionarCliente = async (clienteData) => {
    const result = await clientService.createClient(user.uid, clienteData);
    if (result.success) {
      // Recarregar lista de clientes
      const updatedResult = await clientService.getClientes(user.uid);
      if (updatedResult.success) {
        setClientes(updatedResult.data);
      }
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Meus Clientes</h1>
      {clientes.map(cliente => (
        <div key={cliente.id}>
          <h3>{cliente.name}</h3>
          <p>{cliente.email}</p>
          <p>{cliente.phone}</p>
        </div>
      ))}
    </div>
  );
};
*/

// ============================================
// 🔄 EXEMPLO DE LISTENER EM TEMPO REAL
// ============================================

// Exemplo 14: Escutar mudanças em tempo real
/*
import { onSnapshot, collection, query, where } from 'firebase/firestore';

const escutarClientes = (userId, callback) => {
  const q = query(
    collection(db, 'clients'),
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const clientes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(clientes);
  });

  return unsubscribe; // Chame esta função para parar de escutar
};
*/

export {
  exemploLogin,
  exemploRegistro,
  exemploGoogleLogin,
  exemploAtualizarUsuario,
  exemploObterUsuario,
  exemploAdicionarCliente,
  exemploListarClientes,
  exemploAtualizarCliente,
  exemploAdicionarProcesso,
  exemploListarProcessos
};
