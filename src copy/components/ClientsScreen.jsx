import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientService, appointmentService, lawyerPageService, caseService } from '../firebase/firestore';
import ClientCodeDisplay from './ClientCodeDisplay';

const ClientsScreen = () => {
  const [clientProcesses, setClientProcesses] = useState([]);
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [clientsAppointments, setClientsAppointments] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // todos, ativo, inativo
  const [pageFilter, setPageFilter] = useState('todas'); // todas, ou ID da página específica
  const [lawyerPages, setLawyerPages] = useState([]); // páginas do advogado
  const [sortBy, setSortBy] = useState('recent'); // recent, name, appointments, spent
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientAppointments, setSelectedClientAppointments] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('ativo');

  useEffect(() => {
    if (user) {
      loadClients();
      loadLawyerPages();
    }
  }, [user]);

  // Carregar páginas do advogado
  const loadLawyerPages = async () => {
    try {
      const result = await lawyerPageService.getPagesByUser(user.uid);
      if (result.success) {
        setLawyerPages(result.data);
        console.log('Páginas do advogado carregadas:', result.data.length);
      } else {
        console.error('Erro ao carregar páginas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    }
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      // Carregar clientes
      const clientsResult = await clientService.getClients(user.uid);
      if (!clientsResult.success) {
        console.error('Erro ao carregar clientes:', clientsResult.error);
        return;
      }

      // Carregar todos os agendamentos do advogado
      const appointmentsResult = await appointmentService.getAppointmentsByLawyer(user.uid);
      if (!appointmentsResult.success) {
        console.error('Erro ao carregar agendamentos:', appointmentsResult.error);
        setClients(clientsResult.data);
        return;
      }

      // Debug: Verificar agendamentos pagos
      const paidAppointments = appointmentsResult.data.filter(apt => 
        apt.status === 'pago' || apt.status === 'confirmado' || apt.status === 'finalizado'
      );
      console.log('🔍 [ClientsScreen] Debug - Agendamentos pagos encontrados:', paidAppointments.length);
      paidAppointments.forEach(apt => {
        console.log(`📋 Agendamento pago: ${apt.id} - ${apt.clientName} - R$ ${apt.finalPrice} - Status: ${apt.status}`);
      });

      // Organizar agendamentos por email do cliente
      const appointmentsByClient = {};
      appointmentsResult.data.forEach(appointment => {
        const email = appointment.clientEmail;
        if (!appointmentsByClient[email]) {
          appointmentsByClient[email] = [];
        }
        appointmentsByClient[email].push(appointment);
      });

      // Calcular estatísticas para cada cliente
      const enrichedClients = clientsResult.data.map(client => {
        const clientAppointments = appointmentsByClient[client.email] || [];
        const paidAppointments = clientAppointments.filter(apt => 
          apt.status === 'pago' || apt.status === 'confirmado' || apt.status === 'finalizado'
        );

        const totalSpent = paidAppointments.reduce((total, apt) => {
          const value = parseFloat(apt.finalPrice || apt.estimatedPrice || 0);
          return total + value;
        }, 0);

        const lastAppointment = clientAppointments.length > 0 
          ? clientAppointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0]
          : null;

        return {
          ...client,
          totalAppointments: clientAppointments.length,
          totalSpent: totalSpent,
          lastContact: lastAppointment ? lastAppointment.appointmentDate : client.firstContactDate,
          lastAppointmentStatus: lastAppointment?.status
        };
      });

      setClients(enrichedClients);
      setClientsAppointments(appointmentsByClient);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar e ordenar clientes
  const filteredAndSortedClients = clients
    .filter(client => {
      // Filtro por status
      if (filter === 'ativo' && client.status !== 'ativo') return false;
      if (filter === 'inativo' && client.status !== 'inativo') return false;
      
      // Filtro por página de origem
      if (pageFilter !== 'todas') {
        const clientAppointments = clientsAppointments[client.email] || [];
        const hasAppointmentFromPage = clientAppointments.some(apt => 
          apt.paginaOrigem && apt.paginaOrigem.id === pageFilter
        );
        if (!hasAppointmentFromPage) return false;
      }
      
      // Filtro por busca
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          client.name?.toLowerCase().includes(search) ||
          client.email?.toLowerCase().includes(search) ||
          client.phone?.toLowerCase().includes(search)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'appointments':
          return (b.totalAppointments || 0) - (a.totalAppointments || 0);
        case 'spent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'recent':
        default:
          // Função auxiliar para converter data em timestamp comparável
          const getComparableDate = (dateValue) => {
            if (!dateValue) return 0;
            
            try {
              // Se for um Timestamp do Firestore
              if (dateValue && typeof dateValue.toDate === 'function') {
                return dateValue.toDate().getTime();
              }
              
              // Se for uma string ou Date
              const dateObj = new Date(dateValue);
              return isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
            } catch (error) {
              console.error('Erro ao processar data para ordenação:', error);
              return 0;
            }
          };
          
          const dateA = getComparableDate(a.lastContact);
          const dateB = getComparableDate(b.lastContact);
          return dateB - dateA;
      }
    });

  // Funções de formatação
  const formatCurrency = (value) => {
    if (!value || value === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    
    try {
      // Se for um Timestamp do Firestore
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('pt-BR');
      }
      
      // Se for uma string ou já um Date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'Não definido';
    
    try {
      // Se for um Timestamp do Firestore
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleString('pt-BR');
      }
      
      // Se for uma string ou já um Date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Data/hora inválida';
      }
      
      return dateObj.toLocaleString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data/hora:', error);
      return 'Data/hora inválida';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'aguardando_pagamento': 'Aguardando Pagamento',
      'pago': 'Pago',
      'confirmado': 'Confirmado',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === 'ativo') return 'bg-green-100 text-green-800';
    if (status === 'inativo') return 'bg-gray-100 text-gray-800';
    
    const statusColors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aguardando_pagamento': 'bg-orange-100 text-orange-800',
      'pago': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-green-100 text-green-800',
      'finalizado': 'bg-purple-100 text-purple-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const openClientModal = (client = null) => {
    setSelectedClient(client);
    if (client) {
      // Carregar agendamentos do cliente
      const appointments = clientsAppointments[client.email] || [];
      setSelectedClientAppointments(appointments.sort((a, b) => 
        new Date(b.appointmentDate) - new Date(a.appointmentDate)
      ));
      // Carregar processos associados via associação
      if (window.clientProcessService?.getAssociationsByClient) {
        window.clientProcessService.getAssociationsByClient(client.id).then(assocResult => {
          if (assocResult.success && assocResult.data.length > 0) {
            const processIds = assocResult.data.map(a => a.processoId);
            caseService.getCases(user.uid).then(procResult => {
              if (procResult.success) {
                const filtered = procResult.data.filter(proc => processIds.includes(proc.id));
                setClientProcesses(filtered);
              } else {
                setClientProcesses([]);
              }
            });
          } else {
            setClientProcesses([]);
          }
        });
      } else {
        setClientProcesses([]);
      }
    } else {
      setSelectedClientAppointments([]);
      setClientProcesses([]);
    }
    setShowClientModal(true);
  };

  const closeClientModal = () => {
    setSelectedClient(null);
    setShowClientModal(false);
    setEditingStatus(false);
    setNewStatus('ativo');
  };

  const handleStatusEdit = () => {
    setNewStatus(selectedClient.status || 'ativo');
    setEditingStatus(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedClient) return;
    
    try {
      const result = await clientService.updateClient(selectedClient.id, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      if (result.success) {
        // Atualizar o cliente na lista local
        setClients(clients.map(client => 
          client.id === selectedClient.id 
            ? { ...client, status: newStatus }
            : client
        ));
        
        // Atualizar o cliente selecionado
        setSelectedClient({ ...selectedClient, status: newStatus });
        setEditingStatus(false);
      } else {
        console.error('Erro ao atualizar status:', result.error);
        alert('Erro ao atualizar status do cliente');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do cliente');
    }
  };

  const cancelStatusEdit = () => {
    setEditingStatus(false);
    setNewStatus(selectedClient.status || 'ativo');
  };

  const handleClientSaved = () => {
    loadClients();
    closeClientModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Clientes</h1>
              <p className="text-gray-600 mt-2">Gerencie seus clientes e histórico de consultas</p>
            </div>
            <button
              onClick={() => openClientModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Adicionar Cliente
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{clients.length}</div>
              <div className="text-sm text-gray-600">Total de Clientes</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {clients.filter(c => c.status === 'ativo').length}
              </div>
              <div className="text-sm text-gray-600">Clientes Ativos</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {clients.reduce((sum, c) => sum + (c.totalAppointments || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Consultas</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Receita Total</div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Cliente
              </label>
              <input
                type="text"
                placeholder="Nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Mais Recente</option>
                <option value="name">Nome A-Z</option>
                <option value="appointments">Mais Consultas</option>
                <option value="spent">Maior Receita</option>
              </select>
            </div>
          </div>
          
          {/* Filtro por Página de Origem */}
          {lawyerPages.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Filtrar por Página de Origem</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Opção "Todas as páginas" */}
                <div
                  onClick={() => setPageFilter('todas')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                    pageFilter === 'todas'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg font-semibold">
                    {filteredAndSortedClients.length}
                  </div>
                  <div className="text-xs text-gray-600">Todas as páginas</div>
                </div>

                {/* Páginas específicas */}
                {lawyerPages.map((page) => {
                  const pageClients = clients.filter(client => {
                    const clientAppointments = clientsAppointments[client.email] || [];
                    return clientAppointments.some(apt => 
                      apt.paginaOrigem && apt.paginaOrigem.id === page.id
                    );
                  });
                  
                  if (pageClients.length === 0) return null;
                  
                  return (
                    <div
                      key={page.id}
                      onClick={() => setPageFilter(page.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                        pageFilter === page.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg font-semibold">
                        {pageClients.length}
                      </div>
                      <div className="text-xs text-gray-600 truncate" title={page.nomePagina}>
                        {page.nomePagina}
                      </div>
                      <div className="text-xs text-gray-400">
                        {page.tipoPagina === 'escritorio' ? 'Escritório' : 'Advogado'}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {pageFilter !== 'todas' && (
                <div className="mt-3">
                  <button
                    onClick={() => setPageFilter('todas')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Mostrar todos os clientes
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Botão de Debug Financeiro */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={async () => {
                console.log('🔍 Executando verificação de discrepâncias financeiras...');
                const paidAppointments = Object.values(clientsAppointments)
                  .flat()
                  .filter(apt => apt.status === 'pago' || apt.status === 'confirmado' || apt.status === 'finalizado');
                
                console.log(`📋 Agendamentos pagos na tela de clientes: ${paidAppointments.length}`);
                paidAppointments.forEach(apt => {
                  console.log(`- ${apt.id}: ${apt.clientName} - R$ ${apt.finalPrice} - Status: ${apt.status}`);
                });
                
                // Verificar registros financeiros
                try {
                  const { financialService } = await import('../firebase/firestore');
                  const paymentsResult = await financialService.getPaymentHistory(user.uid);
                  console.log(`💰 Registros financeiros: ${paymentsResult.success ? paymentsResult.data.length : 0}`);
                  
                  if (paymentsResult.success) {
                    paymentsResult.data.forEach(payment => {
                      console.log(`- ${payment.id}: ${payment.clientName} - R$ ${payment.amount} - Appointment: ${payment.appointmentId}`);
                    });
                    
                    const missingPayments = paidAppointments.filter(apt => 
                      !paymentsResult.data.some(payment => payment.appointmentId === apt.id)
                    );
                    
                    if (missingPayments.length > 0) {
                      console.log(`❌ PAGAMENTOS FALTANDO NO SISTEMA FINANCEIRO: ${missingPayments.length}`);
                      missingPayments.forEach(apt => {
                        console.log(`- FALTANDO: ${apt.id}: ${apt.clientName} - R$ ${apt.finalPrice}`);
                      });
                      
                      const migrate = confirm(
                        `Encontrados ${missingPayments.length} pagamentos que não estão no sistema financeiro.\n\n` +
                        `Deseja migrar estes pagamentos agora?`
                      );
                      
                      if (migrate) {
                        let migratedCount = 0;
                        for (const apt of missingPayments) {
                          try {
                            const financialData = {
                              appointmentId: apt.id,
                              clientId: apt.clientId || '',
                              clientName: apt.clientName,
                              clientEmail: apt.clientEmail,
                              amount: apt.finalPrice || 0,
                              serviceDescription: 'Consulta jurídica (migração)',
                              transactionId: apt.transactionId || `MIGRATED_${apt.id}`
                            };
                            
                            const result = await financialService.recordPayment(user.uid, financialData);
                            if (result.success) {
                              console.log(`✅ Migrado: ${apt.clientName} - R$ ${apt.finalPrice}`);
                              migratedCount++;
                            }
                          } catch (error) {
                            console.error(`❌ Erro ao migrar ${apt.id}:`, error);
                          }
                        }
                        alert(`Migração concluída! ${migratedCount} pagamentos migrados.`);
                      }
                    } else {
                      console.log('✅ Todos os pagamentos estão sincronizados!');
                      alert('✅ Todos os pagamentos estão sincronizados com o sistema financeiro!');
                    }
                  }
                } catch (error) {
                  console.error('💥 Erro ao verificar sistema financeiro:', error);
                }
              }}
              className="inline-flex items-center px-3 py-2 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Debug Sistema Financeiro
            </button>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Clientes ({filteredAndSortedClients.length})
            </h2>
          </div>

          {filteredAndSortedClients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Tente buscar com outros termos ou limpe o filtro.'
                  : 'Seus clientes aparecerão aqui quando realizarem agendamentos ou forem adicionados manualmente.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openClientModal()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Primeiro Cliente
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedClients.map((client) => (
                <div key={client.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {client.name}
                        </h3>
                        {client.userCode && (
                          <span className="px-2 py-1 text-xs font-mono font-semibold bg-blue-100 text-blue-800 rounded">
                            {client.userCode}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                          {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                        {client.source === 'agendamento' && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Via Agendamento
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {client.email}
                        </div>

                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {client.phone || 'Não informado'}
                        </div>

                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 002-2h4a2 2 0 012 2v4m0 4v10a1 1 0 01-1 1H9a1 1 0 01-1-1V11a1 1 0 011-1h6a1 1 0 011 1z" />
                          </svg>
                          {client.totalAppointments || 0} consultas
                        </div>

                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {formatCurrency(client.totalSpent)}
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-500">
                        <p><strong>Último contato:</strong> {formatDate(client.lastContact)}</p>
                        {client.caseTypes && client.caseTypes.length > 0 && (
                          <p><strong>Áreas:</strong> {client.caseTypes.join(', ')}</p>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => openClientModal(client)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cliente (placeholder) */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedClient ? 'Detalhes do Cliente' : 'Novo Cliente'}
              </h2>
              <button
                onClick={closeClientModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {selectedClient ? (
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">📋 Informações Básicas</h4>
                      {!editingStatus && (
                        <button
                          onClick={handleStatusEdit}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Editar Status</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        {/* Código do Cliente */}
                        {selectedClient.userCode && (
                          <div className="mb-3">
                            <ClientCodeDisplay 
                              clientCode={selectedClient.userCode}
                              clientName={selectedClient.name}
                              size="small"
                            />
                          </div>
                        )}
                        
                        <p><strong>Nome:</strong> {selectedClient.name}</p>
                        <p><strong>Email:</strong> {selectedClient.email}</p>
                        <p><strong>Telefone:</strong> {selectedClient.phone || selectedClient.whatsapp || 'Não informado'}</p>
                      </div>
                      <div>
                        <div className="mb-2">
                          <strong>Status:</strong>
                          {editingStatus ? (
                            <div className="mt-1 flex items-center space-x-2">
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                              </select>
                              <button
                                onClick={handleStatusUpdate}
                                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelStatusEdit}
                                className="text-xs bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedClient.status)}`}>
                              {selectedClient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                          )}
                        </div>
                        <p><strong>Origem:</strong> {selectedClient.source === 'agendamento' ? 'Agendamento Online' : 'Cadastro Manual'}</p>
                        <p><strong>Primeiro contato:</strong> {formatDate(selectedClient.firstContactDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedClient.totalAppointments || 0}</div>
                      <div className="text-sm text-blue-800">Total de Consultas</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedClient.totalSpent)}</div>
                      <div className="text-sm text-green-800">Total Pago</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedClientAppointments.filter(apt => apt.status === 'finalizado').length}
                      </div>
                      <div className="text-sm text-purple-800">Consultas Realizadas</div>
                    </div>
                  </div>

                  {/* Processos Associados */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">⚖️ Processos do Cliente</h4>
                    {clientProcesses.length > 0 ? (
                      <ul className="space-y-2">
                        {clientProcesses.map(proc => (
                          <li key={proc.id} className="bg-white border border-gray-200 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <span className="font-semibold text-blue-700">{proc.number}</span> — {proc.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 md:mt-0">{proc.status}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500 text-sm">Nenhum processo associado a este cliente.</div>
                    )}
                  </div>

                  {/* Histórico de Agendamentos */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">📅 Histórico de Agendamentos</h4>
                    {selectedClientAppointments.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedClientAppointments.map((appointment) => (
                          <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {formatDateTime(appointment.appointmentDate)}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                                  {getStatusText(appointment.status)}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.finalPrice 
                                  ? formatCurrency(appointment.finalPrice)
                                  : appointment.estimatedPrice 
                                    ? `~${formatCurrency(appointment.estimatedPrice)}`
                                    : 'Valor não definido'
                                }
                              </div>
                            </div>
                            
                            {appointment.caseDescription && (
                              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                                <strong>Caso:</strong> {appointment.caseDescription}
                              </div>
                            )}
                            
                            {/* Página de Origem */}
                            {appointment.paginaOrigem && (
                              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded mt-2">
                                <strong>Página de origem:</strong> {appointment.paginaOrigem.nomePagina}
                                <span className="text-gray-500 ml-1">
                                  ({appointment.paginaOrigem.tipoPagina === 'escritorio' ? 'Escritório' : 'Advogado'})
                                </span>
                                {appointment.paginaOrigem.slug && (
                                  <span className="text-xs text-gray-500 block">/{appointment.paginaOrigem.slug}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📅</div>
                        <p>Nenhum agendamento encontrado</p>
                      </div>
                    )}
                  </div>

                  {/* Informações LGPD */}
                  {selectedClient.lgpdConsent && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">� Informações de Proteção de Dados (LGPD)</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Consentimento:</strong> ✅ Concedido</p>
                        <p><strong>Data do consentimento:</strong> {formatDateTime(selectedClient.lgpdConsent.date)}</p>
                        <p><strong>Versão:</strong> {selectedClient.lgpdConsent.version}</p>
                        <p><strong>IP:</strong> {selectedClient.lgpdConsent.ipAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Formulário de novo cliente em desenvolvimento...</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>Dica:</strong> Os clientes são adicionados automaticamente quando realizam agendamentos e efetuam pagamento.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeClientModal}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsScreen;
