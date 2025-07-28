// Script de migração para converter agendamentos pagos existentes 
// para registros no sistema financeiro

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

export const migrateExistingPayments = async () => {
  console.log('🔄 Iniciando migração de pagamentos existentes...');
  
  try {
    // Buscar todos os agendamentos pagos
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('status', '==', 'pago')
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    console.log(`📋 Encontrados ${appointmentsSnapshot.size} agendamentos pagos`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointmentData = appointmentDoc.data();
      const appointmentId = appointmentDoc.id;
      
      try {
        // Verificar se já existe registro financeiro para este agendamento
        const existingPayments = await financialService.getPaymentHistory(appointmentData.lawyerId);
        const alreadyExists = existingPayments.success && 
          existingPayments.data.some(payment => payment.appointmentId === appointmentId);
        
        if (alreadyExists) {
          console.log(`⏭️ Agendamento ${appointmentId} já migrado, pulando...`);
          skippedCount++;
          continue;
        }
        
        // Criar registro financeiro
        const financialData = {
          appointmentId: appointmentId,
          clientId: appointmentData.clientId || '',
          clientName: appointmentData.clientName || 'Cliente não informado',
          clientEmail: appointmentData.clientEmail || '',
          amount: appointmentData.finalPrice || 0,
          serviceDescription: 'Consulta jurídica (migração)',
          transactionId: appointmentData.transactionId || `MIGRATED_${appointmentId}`
        };
        
        const result = await financialService.recordPayment(appointmentData.lawyerId, financialData);
        
        if (result.success) {
          console.log(`✅ Migrado agendamento ${appointmentId} - R$ ${appointmentData.finalPrice}`);
          migratedCount++;
        } else {
          console.error(`❌ Erro ao migrar ${appointmentId}:`, result.error);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`💥 Erro ao processar agendamento ${appointmentId}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 RELATÓRIO DA MIGRAÇÃO:');
    console.log(`✅ Migrados: ${migratedCount}`);
    console.log(`⏭️ Pulados (já existiam): ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📋 Total processados: ${appointmentsSnapshot.size}`);
    
    return {
      success: true,
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      total: appointmentsSnapshot.size
    };
    
  } catch (error) {
    console.error('💥 Erro geral durante a migração:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para executar a migração com confirmação
export const runMigrationWithConfirmation = async () => {
  const confirmed = confirm(
    'Esta operação irá migrar todos os agendamentos pagos existentes para o sistema financeiro.\n\n' +
    'Tem certeza de que deseja continuar?\n\n' +
    'ATENÇÃO: Execute esta operação apenas uma vez!'
  );
  
  if (!confirmed) {
    console.log('❌ Migração cancelada pelo usuário');
    return;
  }
  
  const result = await migrateExistingPayments();
  
  if (result.success) {
    alert(`Migração concluída!\n\nMigrados: ${result.migrated}\nPulados: ${result.skipped}\nErros: ${result.errors}`);
  } else {
    alert(`Erro durante a migração: ${result.error}`);
  }
  
  return result;
};

// Instruções de uso
console.log(`
MIGRAÇÃO DE PAGAMENTOS EXISTENTES

Para executar a migração:

1. Abra o Console do navegador (F12)
2. Vá para a página do dashboard do advogado
3. Execute: runMigrationWithConfirmation()

Esta migração irá:
- Buscar todos os agendamentos com status 'pago'
- Criar registros correspondentes na coleção 'payments'
- Evitar duplicatas verificando se já existe registro
- Mostrar relatório detalhado do processo

IMPORTANTE: Execute apenas uma vez!
`);
