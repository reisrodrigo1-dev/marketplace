// Teste direto do sistema financeiro
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { financialService } from '../firebase/firestore';

const FinancialTest = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    if (!user) {
      alert('Usuário não logado');
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Iniciando teste do sistema financeiro...');
      console.log('👤 Usuário:', user.uid);
      console.log('🔧 FinancialService:', typeof financialService);
      
      // Teste 1: Verificar se o financialService existe
      if (!financialService) {
        throw new Error('FinancialService não está disponível');
      }

      // Teste 2: Verificar métodos
      const methods = Object.keys(financialService);
      console.log('📋 Métodos disponíveis:', methods);

      // Teste 3: Verificar coleção payments diretamente
      console.log('🔍 Verificando coleção payments...');
      const { 
        collection, 
        getDocs, 
        query, 
        where 
      } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      // Busca direta na coleção
      const directQuery = query(
        collection(db, 'payments'),
        where('lawyerId', '==', user.uid)
      );
      const directSnapshot = await getDocs(directQuery);
      console.log('📊 Busca direta na coleção payments:', directSnapshot.size, 'documentos');

      // Teste 4: Testar getPaymentHistory
      console.log('💰 Testando getPaymentHistory...');
      const paymentsResult = await financialService.getPaymentHistory(user.uid);
      console.log('💰 Resultado:', paymentsResult);

      // Teste 5: Testar getWithdrawalHistory
      console.log('🏦 Testando getWithdrawalHistory...');
      const withdrawalsResult = await financialService.getWithdrawalHistory(user.uid);
      console.log('🏦 Resultado:', withdrawalsResult);

      // Teste 6: Testar getFinancialSummary
      console.log('📊 Testando getFinancialSummary...');
      const summaryResult = await financialService.getFinancialSummary(user.uid);
      console.log('📊 Resultado:', summaryResult);

      const result = {
        methods: methods,
        directQuery: {
          success: true,
          count: directSnapshot.size
        },
        payments: paymentsResult,
        withdrawals: withdrawalsResult,
        summary: summaryResult,
        success: true
      };

      setTestResult(result);
      console.log('✅ Teste concluído:', result);

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const runAdvancedTest = async () => {
    if (!user) {
      alert('Usuário não logado');
      return;
    }

    try {
      // Funcionalidade de teste desabilitada para produção
      console.log('🚧 Teste avançado desabilitado em produção');
      alert('Funcionalidade de teste desabilitada em produção');
      // const { runFullFinancialTest } = await import('../../testes-scripts/TESTE_COMPLETO_FINANCEIRO.js');
      // await runFullFinancialTest(user.uid);
    } catch (error) {
      console.error('❌ Erro no teste avançado:', error);
      alert(`Erro no teste avançado: ${error.message}`);
    }
  };

  const runUrgentMigration = async () => {
    if (!user) {
      alert('Usuário não logado');
      return;
    }

    const confirm = window.confirm(
      '🚨 MIGRAÇÃO URGENTE\n\n' +
      'Esta operação irá migrar TODOS os agendamentos pagos para o sistema financeiro.\n\n' +
      'Baseado no teste, você tem 0 registros financeiros mas há pagamentos na tela de consultas.\n\n' +
      'Deseja continuar com a migração?'
    );

    if (!confirm) {
      return;
    }

    setLoading(true);
    try {
      console.log('🚨 Iniciando migração urgente...');

      // Importar funções necessárias
      const { 
        collection, 
        getDocs, 
        query, 
        where 
      } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');

      // 1. Buscar agendamentos pagos
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('lawyerId', '==', user.uid),
        where('status', 'in', ['pago', 'confirmado', 'finalizado'])
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      console.log(`📋 Agendamentos pagos encontrados: ${appointmentsSnapshot.size}`);

      if (appointmentsSnapshot.size === 0) {
        alert('Nenhum agendamento pago encontrado para migrar.');
        return;
      }

      // 2. Migrar cada agendamento
      let migratedCount = 0;
      let errorCount = 0;

      const appointments = [];
      appointmentsSnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });

      for (const appointment of appointments) {
        try {
          const financialData = {
            appointmentId: appointment.id,
            clientId: appointment.clientId || '',
            clientName: appointment.clientName || 'Cliente não informado',
            clientEmail: appointment.clientEmail || '',
            amount: parseFloat(appointment.finalPrice) || 0,
            serviceDescription: 'Consulta jurídica (migração urgente)',
            transactionId: appointment.transactionId || `MIGRATED_${appointment.id}`
          };

          const result = await financialService.recordPayment(user.uid, financialData);

          if (result.success) {
            console.log(`✅ Migrado: ${appointment.clientName} - R$ ${appointment.finalPrice}`);
            migratedCount++;
          } else {
            console.error(`❌ Erro ao migrar ${appointment.id}:`, result.error);
            errorCount++;
          }
        } catch (error) {
          console.error(`💥 Erro ao migrar ${appointment.id}:`, error);
          errorCount++;
        }
      }

      // 3. Verificar resultado
      const verificationResult = await financialService.getPaymentHistory(user.uid);

      const message = `🎉 MIGRAÇÃO CONCLUÍDA!\n\n` +
        `📋 Agendamentos encontrados: ${appointments.length}\n` +
        `✅ Migrados com sucesso: ${migratedCount}\n` +
        `❌ Erros: ${errorCount}\n` +
        `💰 Total no sistema financeiro: ${verificationResult.success ? verificationResult.data.length : 'Erro ao verificar'}\n\n` +
        `A tela financeiro deve mostrar os valores agora!`;

      alert(message);

      // Atualizar resultado do teste
      setTestResult(prevResult => ({
        ...prevResult,
        migrationResult: {
          appointmentsFound: appointments.length,
          migrated: migratedCount,
          errors: errorCount,
          finalCount: verificationResult.success ? verificationResult.data.length : 0
        }
      }));

    } catch (error) {
      console.error('💥 Erro na migração urgente:', error);
      alert(`Erro na migração: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Usuário não logado. Faça login para testar o sistema financeiro.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Teste do Sistema Financeiro</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Usuário: {user.uid}</p>
        <p className="text-sm text-gray-600">Email: {user.email}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={runTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testando...' : 'Teste Básico'}
        </button>
        
        <button
          onClick={runAdvancedTest}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Teste Completo
        </button>

        {testResult && testResult.directQuery && testResult.directQuery.count === 0 && (
          <button
            onClick={runUrgentMigration}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
          >
            🚨 Migração Urgente
          </button>
        )}
      </div>

      {testResult && testResult.directQuery && testResult.directQuery.count === 0 && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Sistema Financeiro Vazio Detectado
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>A coleção de pagamentos está vazia, mas há consultas pagas no sistema.</p>
                <p className="font-semibold mt-1">Clique em "🚨 Migração Urgente" para resolver!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Resultado do Teste:</h3>
          
          {testResult.success ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-green-800">✅ Métodos Disponíveis:</h4>
                <p className="text-sm text-gray-600">{testResult.methods.join(', ')}</p>
              </div>
              
              {testResult.directQuery && (
                <div>
                  <h4 className="font-medium text-orange-800">🔍 Busca Direta na Coleção:</h4>
                  <p className="text-sm text-gray-600">
                    Documentos encontrados: {testResult.directQuery.count}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-blue-800">💰 Pagamentos (via financialService):</h4>
                <p className="text-sm text-gray-600">
                  Success: {testResult.payments.success ? 'Sim' : 'Não'} | 
                  Count: {testResult.payments.data ? testResult.payments.data.length : 0}
                  {testResult.payments.error && ` | Erro: ${testResult.payments.error}`}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-purple-800">🏦 Saques:</h4>
                <p className="text-sm text-gray-600">
                  Success: {testResult.withdrawals.success ? 'Sim' : 'Não'} | 
                  Count: {testResult.withdrawals.data ? testResult.withdrawals.data.length : 0}
                  {testResult.withdrawals.error && ` | Erro: ${testResult.withdrawals.error}`}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-green-800">📊 Resumo:</h4>
                <p className="text-sm text-gray-600">
                  Success: {testResult.summary.success ? 'Sim' : 'Não'}
                  {testResult.summary.success && testResult.summary.data && (
                    <span> | Total: R$ {testResult.summary.data.totalReceived?.toFixed(2) || '0,00'}</span>
                  )}
                  {testResult.summary.error && ` | Erro: ${testResult.summary.error}`}
                </p>
              </div>
              
              {testResult.directQuery && testResult.directQuery.count !== (testResult.payments.data?.length || 0) && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800">⚠️ DISCREPÂNCIA DETECTADA:</h4>
                  <p className="text-sm text-red-700">
                    Busca direta encontrou {testResult.directQuery.count} documentos, 
                    mas financialService retornou {testResult.payments.data?.length || 0} pagamentos.
                  </p>
                </div>
              )}

              {testResult.migrationResult && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">✅ RESULTADO DA MIGRAÇÃO:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>📋 Agendamentos encontrados: {testResult.migrationResult.appointmentsFound}</p>
                    <p>✅ Migrados com sucesso: {testResult.migrationResult.migrated}</p>
                    <p>❌ Erros: {testResult.migrationResult.errors}</p>
                    <p>💰 Total no sistema financeiro: {testResult.migrationResult.finalCount}</p>
                  </div>
                  {testResult.migrationResult.migrated > 0 && (
                    <p className="text-sm text-green-800 font-medium mt-2">
                      🎉 Recarregue a página para ver os valores na tela financeiro!
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-800">
              <h4 className="font-medium">❌ Erro:</h4>
              <p className="text-sm">{testResult.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Dica:</strong> Abra o Console do navegador (F12) para ver logs detalhados do teste.
        </p>
      </div>
    </div>
  );
};

export default FinancialTest;
