import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService, lawyerPageService, collaborationService } from '../firebase/firestore';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  User,
  FileText,
  Filter,
  Download,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const FinancesPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadFinancialData();
      loadUserPages();
    }
  }, [user?.uid]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Carregando dados financeiros...');

      // Primeiro, buscar páginas com acesso financeiro para validar permissões
      const pagesResult = await collaborationService.getPagesWithFinancialAccess(user.uid);
      
      if (!pagesResult.success) {
        throw new Error('Erro ao verificar permissões de acesso financeiro');
      }

      const authorizedPages = pagesResult.data;
      const authorizedPageIds = authorizedPages.map(page => page.id);
      
      console.log('📋 Páginas autorizadas para visualização financeira:', {
        total: authorizedPages.length,
        pages: authorizedPages.map(p => ({
          id: p.id,
          nome: p.nomePagina,
          accessType: p.accessType,
          role: p.role
        }))
      });

      // Carregar agendamentos das páginas com acesso financeiro
      console.log('🔍 Carregando agendamentos das páginas autorizadas...');
      let allAppointments = [];
      
      for (const page of authorizedPages) {
        console.log(`📋 Carregando agendamentos da página: ${page.nomePagina} (${page.id})`);
        
        // Para páginas próprias, usar o próprio userId
        // Para colaborações, usar o userId do proprietário da página
        const lawyerUserId = page.accessType === 'owner' ? user.uid : page.userId;
        
        const result = await appointmentService.getLawyerAppointments(lawyerUserId);
        
        if (result.success) {
          console.log(`✅ ${result.data.length} agendamentos carregados da página ${page.nomePagina}`);
          
          // Filtrar apenas agendamentos desta página específica
          const pageAppointments = result.data.filter(apt => 
            apt.paginaOrigem?.id === page.id || apt.selectedPageId === page.id
          );
          
          console.log(`📄 ${pageAppointments.length} agendamentos filtrados para esta página`);
          allAppointments = allAppointments.concat(pageAppointments);
        } else {
          console.error(`❌ Erro ao carregar agendamentos da página ${page.nomePagina}:`, result.error);
        }
      }
      
      console.log('✅ Total de agendamentos carregados de todas as páginas:', allAppointments.length);
      
      // Filtrar agendamentos com valores financeiros
      const financialAppointments = allAppointments.filter(apt => {
        const hasFinancialValue = apt.finalPrice && apt.finalPrice > 0;
        
        // Log para debug
        if (!hasFinancialValue) {
          console.log('⚠️ Agendamento sem valor financeiro:', {
            appointmentId: apt.id?.substring(0, 8),
            finalPrice: apt.finalPrice,
            pageId: apt.paginaOrigem?.id,
            pageName: apt.paginaOrigem?.nomePagina
          });
        }
        
        return hasFinancialValue;
      });
      
      console.log('💰 Agendamentos com valores financeiros:', financialAppointments.length);
      
      // Debug: Verificar campos de página nos agendamentos
      const withPaginaOrigem = financialAppointments.filter(apt => apt.paginaOrigem?.id).length;
      console.log('📄 Debug agendamentos financeiros:', {
        totalFinancial: financialAppointments.length,
        withPaginaOrigem,
        sample: financialAppointments.slice(0, 2).map(apt => ({
          id: apt.id?.substring(0, 8),
          paginaOrigemId: apt.paginaOrigem?.id,
          paginaOrigemNome: apt.paginaOrigem?.nomePagina,
          finalPrice: apt.finalPrice
        }))
      });
      
      setAppointments(financialAppointments);
    } catch (err) {
      console.error('❌ Erro ao carregar dados financeiros:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPages = async () => {
    try {
      console.log('📄 Carregando páginas do usuário para filtro...');
      
      // Buscar páginas com acesso financeiro
      const pagesResult = await collaborationService.getPagesWithFinancialAccess(user.uid);
      
      if (pagesResult.success) {
        console.log('✅ Páginas com acesso financeiro para filtro:', pagesResult.data.length);
        console.log('📋 Validação de permissões financeiras:', pagesResult.data.map(p => ({
          id: p.id,
          nome: p.nomePagina,
          accessType: p.accessType,
          role: p.role,
          canViewFinancial: p.accessType === 'owner' || p.role === 'lawyer' || p.role === 'financial'
        })));
        setUserPages(pagesResult.data);
      } else {
        console.error('❌ Erro ao carregar páginas:', pagesResult.error);
        setUserPages([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar páginas:', err);
      setUserPages([]);
    }
  };

  // Filtros aplicados
  const filteredAppointments = appointments.filter(apt => {
    // Debug: Log dos campos de página
    if (selectedPage !== 'all') {
      console.log('🔍 Debug filtro página:', {
        appointmentId: apt.id?.substring(0, 8),
        paginaOrigemId: apt.paginaOrigem?.id,
        selectedPageFilter: selectedPage,
        pageMatch: apt.paginaOrigem?.id === selectedPage
      });
    }
    
    // Filtro por página usando paginaOrigem.id
    const pageMatch = selectedPage === 'all' || apt.paginaOrigem?.id === selectedPage;
    
    // Filtro por data
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const aptDate = new Date(apt.appointmentDate);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          dateMatch = aptDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = aptDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = aptDate >= monthAgo;
          break;
      }
    }
    
    // Filtro por status
    const statusMatch = statusFilter === 'all' || apt.status === statusFilter;
    
    // Filtro por busca
    const searchMatch = searchTerm === '' || 
      apt.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return pageMatch && dateMatch && statusMatch && searchMatch;
  });

  // Cálculos financeiros
  const calculateFinancials = () => {
    const total = filteredAppointments.reduce((sum, apt) => sum + (apt.finalPrice || 0), 0);
    const paid = filteredAppointments
      .filter(apt => apt.status === 'pago')
      .reduce((sum, apt) => sum + (apt.finalPrice || 0), 0);
    const pending = filteredAppointments
      .filter(apt => apt.status === 'aguardando_pagamento')
      .reduce((sum, apt) => sum + (apt.finalPrice || 0), 0);
    const confirmed = filteredAppointments
      .filter(apt => apt.status === 'confirmado')
      .reduce((sum, apt) => sum + (apt.finalPrice || 0), 0);

    return { total, paid, pending, confirmed };
  };

  const financials = calculateFinancials();

  // Função para abrir modal de detalhes
  const openDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Função para fechar modal de detalhes
  const closeDetailsModal = () => {
    setSelectedAppointment(null);
    setShowDetailsModal(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'aguardando_pagamento': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmado': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'aguardando_pagamento': return 'Aguardando Pagamento';
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Finalizado';
      default: return status || 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'aguardando_pagamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      // Verificar se é um timestamp do Firestore
      if (date && typeof date === 'object' && date.toDate) {
        return date.toDate().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Se for uma string ou número, tentar converter para Date
      const parsedDate = new Date(date);
      
      // Verificar se a data é válida
      if (isNaN(parsedDate.getTime())) {
        console.warn('Data inválida recebida:', date);
        return 'Data inválida';
      }
      
      return parsedDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error, date);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Verificação de permissões de acesso
  if (!loading && userPages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h1>
            <p className="text-gray-600 mb-4">
              Você não possui permissão para acessar informações financeiras.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">Para ter acesso financeiro, você deve ser:</h3>
              <ul className="text-yellow-700 space-y-1">
                <li>• <strong>Proprietário</strong> de uma página de advocacia</li>
                <li>• <strong>Advogado</strong> colaborador com permissões financeiras</li>
                <li>• <strong>Financeiro</strong> associado a uma página</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Entre em contato com o proprietário da página para solicitar acesso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                Finanças
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie suas informações financeiras e acompanhe seus valores
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Métricas Financeiras */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Pago</p>
                  <p className="text-2xl font-bold">{formatCurrency(financials.paid)}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Aguardando</p>
                  <p className="text-2xl font-bold">{formatCurrency(financials.pending)}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Confirmado</p>
                  <p className="text-2xl font-bold">{formatCurrency(financials.confirmed)}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Geral</p>
                  <p className="text-2xl font-bold">{formatCurrency(financials.total)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Filtro por Página */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Página de Origem
              </label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as páginas</option>
                {userPages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.nomePagina}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="pago">Pago</option>
                <option value="aguardando_pagamento">Aguardando Pagamento</option>
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            {/* Campo de Busca */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Cliente
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite nome ou email do cliente..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de Transações Financeiras */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Transações Financeiras ({filteredAppointments.length})
            </h3>
          </div>
          
          {error ? (
            <div className="p-6 text-center text-red-600">
              <p>❌ Erro: {error}</p>
              <button 
                onClick={loadFinancialData}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tentar Novamente
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl mb-2">Nenhuma transação encontrada</p>
              <p>Não há transações financeiras com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((apt) => {
                
                return (
                  <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(apt.status)}
                        <div>
                          <h4 className="font-semibold text-gray-800">{apt.clientName}</h4>
                          <p className="text-sm text-gray-600">{apt.clientEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(apt.finalPrice)}
                        </p>
                        <p className="text-sm text-gray-500">{getStatusLabel(apt.status)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(apt.appointmentDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>
                          Página: {apt.paginaOrigem?.nomePagina || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {apt.paymentData?.method || 'Método não informado'}
                        </span>
                      </div>
                    </div>

                    {apt.caseDescription && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-700">{apt.caseDescription}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        ID: {apt.id.substring(0, 8)}...
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.paidAt && (
                          <span className="text-xs text-green-600">
                            Pago em: {formatDate(apt.paidAt)}
                          </span>
                        )}
                        <button 
                          onClick={() => openDetailsModal(apt)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Detalhes do Agendamento
              </h2>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Informações do Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome:</label>
                    <p className="text-gray-900">{selectedAppointment.clientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-gray-900">{selectedAppointment.clientEmail}</p>
                  </div>
                  {selectedAppointment.clientPhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone:</label>
                      <p className="text-gray-900">{selectedAppointment.clientPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações do Agendamento */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Informações do Agendamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data e Hora:</label>
                    <p className="text-gray-900">{formatDate(selectedAppointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status:</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedAppointment.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                        {getStatusLabel(selectedAppointment.status)}
                      </span>
                    </div>
                  </div>
                  {selectedAppointment.paginaOrigem && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Página:</label>
                      <p className="text-gray-900">{selectedAppointment.paginaOrigem.nomePagina}</p>
                    </div>
                  )}
                  {selectedAppointment.lawyerName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Advogado:</label>
                      <p className="text-gray-900">{selectedAppointment.lawyerName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Financeiras */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Informações Financeiras
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedAppointment.proposedPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Valor Proposto:</label>
                      <p className="text-gray-900">R$ {selectedAppointment.proposedPrice.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Valor Final:</label>
                    <p className="text-lg font-bold text-green-600">
                      R$ {(selectedAppointment.finalPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  {selectedAppointment.paidAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data do Pagamento:</label>
                      <p className="text-gray-900">{formatDate(selectedAppointment.paidAt)}</p>
                    </div>
                  )}
                  {selectedAppointment.confirmedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Confirmado em:</label>
                      <p className="text-gray-900">{formatDate(selectedAppointment.confirmedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição/Observações */}
              {selectedAppointment.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Descrição
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedAppointment.description}</p>
                </div>
              )}

              {/* Link da Videochamada */}
              {selectedAppointment.videoCallLink && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Link da Videochamada</h3>
                  <a 
                    href={selectedAppointment.videoCallLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {selectedAppointment.videoCallLink}
                  </a>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancesPage;
