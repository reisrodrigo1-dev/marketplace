import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { financialService, lawyerPageService } from '../firebase/firestore';
import { migrateAppointmentsToFinancial } from '../utils/appointmentMigration';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const FinancialDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pageFilter, setPageFilter] = useState('todas'); // todas, ou ID da página específica
  const [lawyerPages, setLawyerPages] = useState([]); // páginas do advogado
  const [financialData, setFinancialData] = useState({
    totalReceived: 0,
    availableForWithdrawal: 0,
    pendingAmount: 0,
    totalWithdrawn: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankData, setBankData] = useState({
    bank: '',
    agency: '',
    account: '',
    accountType: 'corrente',
    pixKey: ''
  });
  const [activeTab, setActiveTab] = useState('overview'); // overview, payments, withdrawals

  useEffect(() => {
    if (user) {
      console.log('🔄 FinancialDashboard useEffect triggered for user:', user.uid);
      loadFinancialData();
      loadLawyerPages();
    } else {
      console.log('❌ FinancialDashboard: Usuário não encontrado');
    }
  }, [user]);

  // Recarregar dados quando o filtro de página mudar
  useEffect(() => {
    if (user && lawyerPages.length > 0) {
      loadFinancialData();
    }
  }, [pageFilter]);

  // Carregar páginas do advogado
  const loadLawyerPages = async () => {
    try {
      const result = await lawyerPageService.getPagesByUser(user.uid);
      if (result.success) {
        setLawyerPages(result.data);
        console.log('📄 Páginas do advogado carregadas na tela financeiro:', result.data.length);
      } else {
        console.error('Erro ao carregar páginas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    }
  };

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Carregando dados financeiros para usuário:', user.uid);
      console.log('🔧 Filtro por página:', pageFilter);
      console.log('🔧 FinancialService disponível:', typeof financialService);
      console.log('🔧 Métodos disponíveis:', Object.keys(financialService));
      
      const [paymentsResult, withdrawalsResult, summaryResult] = await Promise.all([
        financialService.getPaymentHistory(user.uid),
        financialService.getWithdrawalHistory(user.uid),
        financialService.getFinancialSummary(user.uid)
      ]);

      console.log('💰 Resultado pagamentos:', paymentsResult);
      console.log('🏦 Resultado saques:', withdrawalsResult);
      console.log('📊 Resultado resumo:', summaryResult);

      if (paymentsResult.success) {
        // Log detalhado de todos os pagamentos para debug
        console.log('🔍 TODOS OS PAGAMENTOS CARREGADOS:');
        (paymentsResult.data || []).forEach((payment, index) => {
          console.log(`📄 Pagamento ${index + 1}:`, {
            id: payment.id,
            amount: payment.amount,
            pageId: payment.pageId || 'VAZIO',
            appointmentId: payment.appointmentId,
            clientName: payment.clientName,
            date: payment.date,
            hasPageId: !!payment.pageId
          });
        });
        
        // Aplicar filtro por página nos pagamentos
        let filteredPayments = paymentsResult.data;
        if (pageFilter !== 'todas') {
          filteredPayments = paymentsResult.data.filter(payment => {
            const hasValidPageId = payment.pageId && payment.pageId !== '';
            const pageMatch = hasValidPageId && payment.pageId === pageFilter;
            
            if (hasValidPageId && !pageMatch) {
              console.log(`❌ Pagamento ${payment.id} não corresponde ao filtro:`, {
                pagamentoPageId: payment.pageId,
                filtroPageId: pageFilter,
                clientName: payment.clientName
              });
            } else if (pageMatch) {
              console.log(`✅ Pagamento ${payment.id} incluído no filtro:`, {
                pageId: payment.pageId,
                clientName: payment.clientName,
                amount: payment.amount
              });
            } else if (!hasValidPageId) {
              console.log(`⚠️ Pagamento ${payment.id} sem pageId válido:`, {
                pageId: payment.pageId,
                clientName: payment.clientName
              });
            }
            
            return pageMatch;
          });
          
          console.log(`🔽 Filtro aplicado: ${filteredPayments.length} de ${paymentsResult.data.length} pagamentos para página ${pageFilter}`);
        }
        setRecentPayments(filteredPayments);
        console.log(`✅ ${filteredPayments.length} pagamentos carregados (filtrados)`);
      } else {
        console.error('❌ Erro ao carregar pagamentos:', paymentsResult.error);
      }

      if (withdrawalsResult.success) {
        setWithdrawalHistory(withdrawalsResult.data);
        console.log(`✅ ${withdrawalsResult.data.length} saques carregados`);
      } else {
        console.error('❌ Erro ao carregar saques:', withdrawalsResult.error);
      }

      if (summaryResult.success) {
        // Para o resumo financeiro, sempre mostrar todos os dados ou filtrar?
        // Vou manter todos os dados no resumo para ter visão geral
        setFinancialData(summaryResult.data);
        console.log('✅ Resumo financeiro carregado:', summaryResult.data);
      } else {
        console.error('❌ Erro ao carregar resumo:', summaryResult.error);
      }
    } catch (error) {
      console.error('💥 Erro geral ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      alert('Digite um valor válido para saque.');
      return;
    }

    if (parseFloat(withdrawalAmount) > financialData.availableForWithdrawal) {
      alert('Valor solicitado maior que o disponível para saque.');
      return;
    }

    if (!bankData.bank || !bankData.agency || !bankData.account) {
      alert('Preencha todos os dados bancários.');
      return;
    }

    try {
      const withdrawalData = {
        amount: parseFloat(withdrawalAmount),
        bankData: bankData,
        requestedAt: new Date(),
        status: 'pending'
      };

      const result = await financialService.requestWithdrawal(user.uid, withdrawalData);
      
      if (result.success) {
        alert('Solicitação de saque enviada com sucesso! Processamento em até 2 dias úteis.');
        setShowWithdrawalModal(false);
        setWithdrawalAmount('');
        loadFinancialData();
      } else {
        alert('Erro ao solicitar saque: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      alert('Erro ao solicitar saque.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Função para migrar agendamentos pagos para o sistema financeiro
  const handleMigrationFromAppointments = async () => {
    if (!confirm('🔄 MIGRAÇÃO SISTEMA FINANCEIRO\n\nEsta operação irá:\n• Buscar todos os agendamentos com status "pago", "confirmado" ou "finalizado"\n• Migrar para o sistema financeiro (sem duplicatas)\n• Atualizar os valores na tela\n\nDeseja continuar?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Iniciando migração de agendamentos para sistema financeiro...');
      
      // Buscar agendamentos pagos
      const q = query(
        collection(db, 'appointments'),
        where('lawyerId', '==', user.uid),
        where('status', 'in', ['pago', 'confirmado', 'finalizado'])
      );
      
      const snapshot = await getDocs(q);
      const paidAppointments = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.finalPrice && data.finalPrice > 0) {
          paidAppointments.push({
            id: doc.id,
            ...data
          });
        }
      });

      console.log(`📋 Encontrados ${paidAppointments.length} agendamentos pagos para migrar`);

      if (paidAppointments.length === 0) {
        alert('✅ Nenhum agendamento pago encontrado para migrar.\n\nTodos os pagamentos já estão no sistema financeiro ou não há pagamentos registrados.');
        setLoading(false);
        return;
      }

      // Executar migração
      const migrationResult = await migrateAppointmentsToFinancial(paidAppointments, user.uid);
      
      console.log('📊 Resultado da migração:', migrationResult);

      // Mostrar resultado detalhado
      const {
        migratedCount,
        skippedCount,
        errorCount,
        migrated,
        skipped,
        errors
      } = migrationResult;

      let resultMessage = `🎉 MIGRAÇÃO CONCLUÍDA!\n\n`;
      resultMessage += `✅ Migrados: ${migratedCount} pagamentos\n`;
      resultMessage += `⏭️ Já existiam: ${skippedCount} pagamentos\n`;
      if (errorCount > 0) {
        resultMessage += `❌ Erros: ${errorCount} pagamentos\n`;
      }

      if (migrated.length > 0) {
        resultMessage += `\n📋 PAGAMENTOS MIGRADOS:\n`;
        migrated.slice(0, 5).forEach(item => {
          resultMessage += `• ${item.clientName}: ${formatCurrency(item.amount)}\n`;
        });
        if (migrated.length > 5) {
          resultMessage += `... e mais ${migrated.length - 5} pagamentos\n`;
        }
      }

      if (errors.length > 0) {
        resultMessage += `\n❌ ERROS:\n`;
        errors.slice(0, 3).forEach(error => {
          resultMessage += `• ${error.reason}\n`;
        });
      }

      alert(resultMessage);

      // Recarregar dados financeiros
      await loadFinancialData();

    } catch (error) {
      console.error('❌ Erro na migração:', error);
      alert(`❌ Erro na migração: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Central Financeira</h1>
            <p className="text-gray-600 mt-2">Gerencie seus recebimentos e saques</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-4">
            {/* Filtro por Página */}
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por página:
              </label>
              <select
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas as páginas</option>
                {lawyerPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.nomePagina || 'Página sem nome'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={handleMigrationFromAppointments}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Sincronizando...' : 'Sincronizar Pagamentos'}
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialData.totalReceived)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponível para Saque</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(financialData.availableForWithdrawal)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bloqueado (D+30)</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {formatCurrency(financialData.pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sacado</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(financialData.totalWithdrawn)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Saque */}
        <div className="mb-8">
          <button
            onClick={() => setShowWithdrawalModal(true)}
            disabled={financialData.availableForWithdrawal <= 0}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Solicitar Saque
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Recebimentos
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'withdrawals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Histórico de Saques
              </button>
            </nav>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6">
            {/* Tab Visão Geral */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Os pagamentos ficam bloqueados por 30 dias após a confirmação</li>
                    <li>• Após D+30, o valor fica disponível para saque</li>
                    <li>• Saques são processados em até 2 dias úteis</li>
                    <li>• Você pode acompanhar o status dos seus saques nesta tela</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recebimentos Recentes</h3>
                  {recentPayments.length > 0 ? (
                    <div className="space-y-3">
                      {recentPayments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{payment.clientName}</p>
                            <p className="text-sm text-gray-600">
                              {payment.serviceDescription || 'Consulta jurídica'}
                            </p>
                            {payment.pageId && (
                              <p className="text-xs text-blue-600">
                                📄 {lawyerPages.find(page => page.id === payment.pageId)?.title || 
                                     lawyerPages.find(page => page.id === payment.pageId)?.specialization || 
                                     'Página não encontrada'}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Pago em: {formatDate(payment.paidAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.isAvailable ? 'Disponível' : `Liberação: ${formatDate(payment.releaseDate)}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Nenhum recebimento encontrado.</p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                        <h4 className="font-semibold text-yellow-800 mb-2">🔍 Debug - Possíveis causas:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Ainda não houve pagamentos confirmados</li>
                          <li>• Os pagamentos não foram migrados para o sistema financeiro</li>
                          <li>• Problema na consulta ao banco de dados</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-yellow-300">
                          <p className="text-xs text-yellow-600">
                            <strong>ID do usuário:</strong> {user?.uid || 'N/A'}
                          </p>
                          <p className="text-xs text-yellow-600">
                            <strong>Dados carregados:</strong> {recentPayments.length} pagamentos
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Recebimentos */}
            {activeTab === 'payments' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Recebimentos</h3>
                {recentPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Serviço
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Página de Origem
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data Pagamento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.clientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.serviceDescription || 'Consulta jurídica'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {payment.pageId ? (
                                lawyerPages.find(page => page.id === payment.pageId)?.title || 
                                lawyerPages.find(page => page.id === payment.pageId)?.specialization || 
                                'Página não encontrada'
                              ) : (
                                <span className="text-gray-400 italic">Sem página</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.paidAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                payment.isAvailable 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.isAvailable ? 'Disponível' : 'Bloqueado'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhum recebimento encontrado.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 O que fazer?</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Verifique se há agendamentos com status "pago"</li>
                        <li>• Execute a migração de pagamentos existentes</li>
                        <li>• Confirme novos pagamentos para testar o sistema</li>
                      </ul>
                      <button 
                        onClick={() => window.open('/testes-scripts/TESTE_SISTEMA_FINANCEIRO.js', '_blank')}
                        className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Abrir Script de Debug
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Histórico de Saques */}
            {activeTab === 'withdrawals' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Saques</h3>
                {withdrawalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {withdrawalHistory.map((withdrawal) => (
                      <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-lg text-gray-900">
                            {formatCurrency(withdrawal.amount)}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(withdrawal.status)}`}>
                            {getStatusText(withdrawal.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Solicitado em:</strong> {formatDate(withdrawal.requestedAt)}</p>
                            {withdrawal.processedAt && (
                              <p><strong>Processado em:</strong> {formatDate(withdrawal.processedAt)}</p>
                            )}
                          </div>
                          <div>
                            <p><strong>Banco:</strong> {withdrawal.bankData?.bank}</p>
                            <p><strong>Agência:</strong> {withdrawal.bankData?.agency}</p>
                            <p><strong>Conta:</strong> {withdrawal.bankData?.account}</p>
                          </div>
                          <div>
                            {withdrawal.transactionId && (
                              <p><strong>ID Transação:</strong> {withdrawal.transactionId}</p>
                            )}
                            {withdrawal.fee && (
                              <p><strong>Taxa:</strong> {formatCurrency(withdrawal.fee)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum saque solicitado ainda.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Saque */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Solicitar Saque
                </h2>
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Disponível para saque:</strong> {formatCurrency(financialData.availableForWithdrawal)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Saque *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={financialData.availableForWithdrawal}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Dados Bancários</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banco *
                    </label>
                    <input
                      type="text"
                      value={bankData.bank}
                      onChange={(e) => setBankData({...bankData, bank: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agência *
                      </label>
                      <input
                        type="text"
                        value={bankData.agency}
                        onChange={(e) => setBankData({...bankData, agency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conta *
                      </label>
                      <input
                        type="text"
                        value={bankData.account}
                        onChange={(e) => setBankData({...bankData, account: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="00000-0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Conta *
                    </label>
                    <select
                      value={bankData.accountType}
                      onChange={(e) => setBankData({...bankData, accountType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="corrente">Conta Corrente</option>
                      <option value="poupanca">Conta Poupança</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chave PIX (opcional)
                    </label>
                    <input
                      type="text"
                      value={bankData.pixKey}
                      onChange={(e) => setBankData({...bankData, pixKey: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CPF, email ou chave aleatória"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> O saque será processado em até 2 dias úteis. 
                    Verifique se os dados bancários estão corretos.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleWithdrawalRequest}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Solicitar Saque
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;
