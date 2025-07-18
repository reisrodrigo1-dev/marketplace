// Script para verificar e migrar pagamentos confirmados que estão faltando no sistema financeiro

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

// Função para verificar discrepâncias entre agendamentos pagos e registros financeiros
export const checkPaymentDiscrepancies = async (lawyerId) => {
  console.log('🔍 Verificando discrepâncias de pagamentos para advogado:', lawyerId);
  
  try {
    // 1. Buscar agendamentos pagos
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('lawyerId', '==', lawyerId),
      where('status', 'in', ['pago', 'confirmado', 'finalizado'])
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    console.log(`📋 Agendamentos pagos encontrados: ${appointmentsSnapshot.size}`);
    
    const paidAppointments = [];
    appointmentsSnapshot.forEach(doc => {
      const data = doc.data();
      paidAppointments.push({
        id: doc.id,
        ...data,
        appointmentDate: data.appointmentDate?.toDate?.() || new Date(data.appointmentDate),
        paymentConfirmed: data.paymentConfirmed?.toDate?.() || (data.paymentConfirmed ? new Date(data.paymentConfirmed) : null)
      });
    });
    
    // 2. Buscar registros financeiros
    const paymentsResult = await financialService.getPaymentHistory(lawyerId);
    console.log(`💰 Registros financeiros encontrados: ${paymentsResult.success ? paymentsResult.data.length : 0}`);
    
    if (!paymentsResult.success) {
      console.error('❌ Erro ao buscar registros financeiros:', paymentsResult.error);
      return;
    }
    
    const financialRecords = paymentsResult.data;
    
    // 3. Identificar agendamentos sem registro financeiro
    const missingPayments = paidAppointments.filter(appointment => {
      return !financialRecords.some(payment => payment.appointmentId === appointment.id);
    });
    
    console.log(`🔍 ANÁLISE DETALHADA:`);
    console.log(`📊 Total agendamentos pagos: ${paidAppointments.length}`);
    console.log(`💰 Total registros financeiros: ${financialRecords.length}`);
    console.log(`❌ Agendamentos sem registro financeiro: ${missingPayments.length}`);
    
    // 4. Mostrar detalhes dos agendamentos pagos
    console.log('\n📋 AGENDAMENTOS PAGOS:');
    paidAppointments.forEach(apt => {
      console.log(`- ${apt.id}: ${apt.clientName} - R$ ${apt.finalPrice} - Status: ${apt.status}`);
    });
    
    // 5. Mostrar detalhes dos registros financeiros
    console.log('\n💰 REGISTROS FINANCEIROS:');
    financialRecords.forEach(payment => {
      console.log(`- ${payment.id}: ${payment.clientName} - R$ ${payment.amount} - Appointment: ${payment.appointmentId}`);
    });
    
    // 6. Mostrar agendamentos que precisam ser migrados
    if (missingPayments.length > 0) {
      console.log('\n❌ AGENDAMENTOS SEM REGISTRO FINANCEIRO:');
      missingPayments.forEach(apt => {
        console.log(`- ${apt.id}: ${apt.clientName} - R$ ${apt.finalPrice} - Status: ${apt.status} - Data: ${apt.appointmentDate?.toLocaleDateString()}`);
      });
      
      console.log('\n🔧 Para corrigir, execute: migrateSpecificPayments()');
    } else {
      console.log('\n✅ Todos os agendamentos pagos têm registros financeiros correspondentes!');
    }
    
    return {
      paidAppointments: paidAppointments.length,
      financialRecords: financialRecords.length,
      missingPayments: missingPayments.length,
      missing: missingPayments
    };
    
  } catch (error) {
    console.error('💥 Erro ao verificar discrepâncias:', error);
    return null;
  }
};

// Função para migrar agendamentos específicos que estão faltando
export const migrateSpecificPayments = async (lawyerId) => {
  console.log('🔄 Iniciando migração de pagamentos específicos...');
  
  try {
    const analysis = await checkPaymentDiscrepancies(lawyerId);
    if (!analysis || analysis.missingPayments === 0) {
      console.log('✅ Não há pagamentos para migrar!');
      return;
    }
    
    const confirmed = confirm(
      `Foram encontrados ${analysis.missingPayments} agendamentos pagos sem registro financeiro.\n\n` +
      `Deseja migrar estes pagamentos agora?`
    );
    
    if (!confirmed) {
      console.log('❌ Migração cancelada pelo usuário');
      return;
    }
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const appointment of analysis.missing) {
      try {
        const financialData = {
          appointmentId: appointment.id,
          clientId: appointment.clientId || '',
          clientName: appointment.clientName || 'Cliente não informado',
          clientEmail: appointment.clientEmail || '',
          amount: appointment.finalPrice || 0,
          serviceDescription: 'Consulta jurídica (migração)',
          transactionId: appointment.transactionId || `MIGRATED_${appointment.id}`
        };
        
        const result = await financialService.recordPayment(lawyerId, financialData);
        
        if (result.success) {
          console.log(`✅ Migrado: ${appointment.clientName} - R$ ${appointment.finalPrice}`);
          migratedCount++;
        } else {
          console.error(`❌ Erro ao migrar ${appointment.id}:`, result.error);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`💥 Erro ao processar agendamento ${appointment.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 RELATÓRIO DA MIGRAÇÃO:');
    console.log(`✅ Migrados: ${migratedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    
    // Verificar novamente após a migração
    console.log('\n🔍 Verificando resultado...');
    await checkPaymentDiscrepancies(lawyerId);
    
    alert(`Migração concluída!\n\nMigrados: ${migratedCount}\nErros: ${errorCount}`);
    
    return {
      migrated: migratedCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('💥 Erro durante a migração:', error);
    alert(`Erro durante a migração: ${error.message}`);
  }
};

// Função automática para executar a verificação com o usuário logado
export const autoCheckCurrentUser = async () => {
  try {
    // Tentar obter o usuário do contexto
    const userContext = window.React?.useContext?.();
    let userId = null;
    
    // Método alternativo: buscar no localStorage
    const authData = localStorage.getItem('authUser');
    if (authData) {
      const parsed = JSON.parse(authData);
      userId = parsed.uid;
    }
    
    // Método alternativo 2: buscar no Firebase Auth atual
    if (!userId && window.firebase?.auth?.().currentUser) {
      userId = window.firebase.auth().currentUser.uid;
    }
    
    if (!userId) {
      console.error('❌ Não foi possível identificar o usuário logado');
      console.log('💡 Execute manualmente: checkPaymentDiscrepancies("SEU_USER_ID")');
      return;
    }
    
    console.log('👤 Usuário identificado:', userId);
    return await checkPaymentDiscrepancies(userId);
    
  } catch (error) {
    console.error('💥 Erro ao identificar usuário:', error);
    console.log('💡 Execute manualmente: checkPaymentDiscrepancies("SEU_USER_ID")');
  }
};

// Instruções de uso
console.log(`
🔍 VERIFICAÇÃO DE DISCREPÂNCIAS NO SISTEMA FINANCEIRO

Para usar estes scripts:

1. Abra o Console do navegador (F12)
2. Vá para a página do dashboard do advogado
3. Execute um dos comandos:

   // Verificação automática (tenta identificar usuário logado)
   autoCheckCurrentUser()
   
   // Verificação manual (substitua pelo ID do advogado)
   checkPaymentDiscrepancies("ID_DO_ADVOGADO")
   
   // Migração dos pagamentos faltantes
   migrateSpecificPayments("ID_DO_ADVOGADO")

4. Siga as instruções mostradas no console

Este script irá:
✅ Comparar agendamentos pagos com registros financeiros
✅ Identificar discrepâncias 
✅ Migrar automaticamente os pagamentos faltantes
✅ Validar o resultado da migração
`);

export { checkPaymentDiscrepancies, migrateSpecificPayments, autoCheckCurrentUser };
