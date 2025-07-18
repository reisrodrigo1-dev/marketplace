// Script de migração urgente para resolver o problema financeiro

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { financialService } from '../firebase/firestore';

// Função de migração urgente
export const migratePaymentsUrgent = async (lawyerId) => {
  console.log('🚨 MIGRAÇÃO URGENTE - Iniciando...');
  console.log('👤 Advogado ID:', lawyerId);
  
  try {
    // 1. Buscar todos os agendamentos pagos
    console.log('📋 Buscando agendamentos pagos...');
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('lawyerId', '==', lawyerId),
      where('status', 'in', ['pago', 'confirmado', 'finalizado'])
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    console.log(`📊 Agendamentos pagos encontrados: ${appointmentsSnapshot.size}`);
    
    if (appointmentsSnapshot.size === 0) {
      console.log('⚠️ Nenhum agendamento pago encontrado');
      return {
        success: true,
        message: 'Nenhum agendamento pago para migrar',
        migrated: 0
      };
    }
    
    const paidAppointments = [];
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Agendamento encontrado: ${doc.id} - ${data.clientName} - R$ ${data.finalPrice} - Status: ${data.status}`);
      paidAppointments.push({
        id: doc.id,
        ...data
      });
    });
    
    // 2. Migrar cada agendamento para o sistema financeiro
    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('🔄 Iniciando migração...');
    
    for (const appointment of paidAppointments) {
      try {
        console.log(`💰 Migrando: ${appointment.clientName} - R$ ${appointment.finalPrice}`);
        
        const financialData = {
          appointmentId: appointment.id,
          clientId: appointment.clientId || '',
          clientName: appointment.clientName || 'Cliente não informado',
          clientEmail: appointment.clientEmail || '',
          amount: parseFloat(appointment.finalPrice) || 0,
          serviceDescription: 'Consulta jurídica (migração urgente)',
          transactionId: appointment.transactionId || `MIGRATED_${appointment.id}`
        };
        
        const result = await financialService.recordPayment(lawyerId, financialData);
        
        if (result.success) {
          console.log(`✅ Migrado com sucesso: ${appointment.clientName} - R$ ${appointment.finalPrice}`);
          migratedCount++;
        } else {
          console.error(`❌ Erro ao migrar ${appointment.id}:`, result.error);
          errorCount++;
          errors.push(`${appointment.clientName}: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`💥 Erro crítico ao migrar agendamento ${appointment.id}:`, error);
        errorCount++;
        errors.push(`${appointment.clientName}: ${error.message}`);
      }
    }
    
    // 3. Verificar se a migração funcionou
    console.log('🔍 Verificando resultado da migração...');
    const verificationResult = await financialService.getPaymentHistory(lawyerId);
    
    console.log('\n📊 RELATÓRIO DA MIGRAÇÃO:');
    console.log(`✅ Agendamentos encontrados: ${paidAppointments.length}`);
    console.log(`✅ Migrados com sucesso: ${migratedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`💰 Registros financeiros após migração: ${verificationResult.success ? verificationResult.data.length : 'Erro ao verificar'}`);
    
    if (errors.length > 0) {
      console.log('❌ Erros detalhados:', errors);
    }
    
    const result = {
      success: true,
      appointmentsFound: paidAppointments.length,
      migrated: migratedCount,
      errors: errorCount,
      errorDetails: errors,
      finalCount: verificationResult.success ? verificationResult.data.length : 0
    };
    
    console.log('🎯 Resultado final:', result);
    
    return result;
    
  } catch (error) {
    console.error('💥 Erro crítico na migração:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para executar no console do navegador
window.executeMigrationUrgent = async () => {
  try {
    // Tentar obter o usuário do contexto de autenticação
    let userId = null;
    
    // Método 1: localStorage
    const authData = localStorage.getItem('authUser');
    if (authData) {
      const parsed = JSON.parse(authData);
      userId = parsed.uid;
    }
    
    // Método 2: Firebase Auth atual
    if (!userId && window.firebase?.auth?.().currentUser) {
      userId = window.firebase.auth().currentUser.uid;
    }
    
    if (!userId) {
      alert('❌ Não foi possível identificar o usuário logado.\n\nVá para a tela de Clientes e use o botão "Debug Sistema Financeiro".');
      return;
    }
    
    console.log('👤 Usuário identificado:', userId);
    
    const confirm = window.confirm(
      '🚨 MIGRAÇÃO URGENTE DO SISTEMA FINANCEIRO\n\n' +
      'Esta operação irá migrar todos os agendamentos pagos para o sistema financeiro.\n\n' +
      'Deseja continuar?'
    );
    
    if (!confirm) {
      console.log('❌ Migração cancelada pelo usuário');
      return;
    }
    
    console.log('🚀 Iniciando migração...');
    const result = await migratePaymentsUrgent(userId);
    
    if (result.success) {
      const message = `🎉 MIGRAÇÃO CONCLUÍDA!\n\n` +
        `📋 Agendamentos encontrados: ${result.appointmentsFound}\n` +
        `✅ Migrados com sucesso: ${result.migrated}\n` +
        `❌ Erros: ${result.errors}\n` +
        `💰 Total no sistema financeiro: ${result.finalCount}\n\n` +
        `Recarregue a página e verifique a tela financeiro!`;
      
      alert(message);
      
      // Recarregar a página após migração
      if (result.migrated > 0) {
        const reload = confirm('Deseja recarregar a página para ver os resultados?');
        if (reload) {
          window.location.reload();
        }
      }
    } else {
      alert(`❌ Erro na migração: ${result.error}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 Erro ao executar migração:', error);
    alert(`💥 Erro ao executar migração: ${error.message}`);
  }
};

console.log(`
🚨 MIGRAÇÃO URGENTE DISPONÍVEL

Para resolver o problema da tela financeiro:

1. Abra o Console do navegador (F12)
2. Execute: executeMigrationUrgent()
3. Confirme a migração
4. Aguarde a conclusão
5. Recarregue a página

OU

Use o botão "Debug Sistema Financeiro" na tela de Clientes.
`);

export { migratePaymentsUrgent };
