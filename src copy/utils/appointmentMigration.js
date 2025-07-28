// Utilitário específico para migração de agendamentos pagos
// Este arquivo fornece funções para migrar agendamentos para o sistema financeiro

import { financialService } from '../firebase/firestore';

// Função para calcular data de liberação (D+30)
const calculateReleaseDate = (paymentDate) => {
  const date = paymentDate instanceof Date ? paymentDate : new Date(paymentDate);
  const releaseDate = new Date(date);
  releaseDate.setDate(releaseDate.getDate() + 30);
  return releaseDate;
};

export const migrateAppointmentsToFinancial = async (appointments, lawyerId) => {
  console.log('🔄 Iniciando migração de agendamentos para sistema financeiro...');
  console.log('📋 Agendamentos a processar:', appointments.length);
  
  // Primeiro, buscar registros financeiros existentes para evitar duplicatas
  const existingPayments = await financialService.getPaymentHistory(lawyerId);
  const existingAppointmentIds = existingPayments.success ? 
    existingPayments.data.map(payment => payment.appointmentId) : [];
  
  console.log('💰 Registros financeiros existentes:', existingAppointmentIds.length);
  
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors = [];
  const migrated = [];
  const skipped = [];
  
  for (const appointment of appointments) {
    try {
      // Verificar se já foi migrado
      if (existingAppointmentIds.includes(appointment.id)) {
        console.log(`⏭️ Agendamento ${appointment.id} já migrado, pulando...`);
        skippedCount++;
        skipped.push({
          id: appointment.id,
          clientName: appointment.clientName,
          amount: appointment.finalPrice,
          reason: 'Já existe no sistema financeiro'
        });
        continue;
      }
      
      // Validar dados obrigatórios
      if (!appointment.finalPrice || appointment.finalPrice <= 0) {
        console.warn(`⚠️ Agendamento ${appointment.id} sem valor válido, pulando...`);
        skippedCount++;
        skipped.push({
          id: appointment.id,
          clientName: appointment.clientName,
          amount: appointment.finalPrice,
          reason: 'Valor inválido ou zero'
        });
        continue;
      }
      
      // Preparar dados para migração
      const financialData = {
        appointmentId: appointment.id,
        clientId: appointment.clientId || '',
        clientName: appointment.clientName || 'Cliente não informado',
        clientEmail: appointment.clientEmail || '',
        amount: parseFloat(appointment.finalPrice),
        serviceDescription: 'Consulta jurídica (migração automática)',
        transactionId: appointment.transactionId || `MIGRATED_${appointment.id}_${Date.now()}`,
        pageId: appointment.paginaOrigem?.id || appointment.pageId || null, // Incluir página de origem se existir
        paidAt: appointment.updatedAt || appointment.createdAt || new Date(),
        date: appointment.updatedAt || appointment.createdAt || new Date(),
        isAvailable: false, // D+30 será calculado no frontend
        releaseDate: calculateReleaseDate(appointment.updatedAt || appointment.createdAt || new Date())
      };
      
      console.log(`💰 Migrando: ${financialData.clientName} - R$ ${financialData.amount} ${financialData.pageId ? `(Página: ${financialData.pageId})` : '(Sem página)'}`);
      
      // Executar migração
      const result = await financialService.recordPayment(lawyerId, financialData);
      
      if (result.success) {
        console.log(`✅ Migrado com sucesso: ${appointment.id}`);
        migratedCount++;
        migrated.push({
          id: appointment.id,
          clientName: appointment.clientName,
          amount: appointment.finalPrice,
          financialId: result.id
        });
      } else {
        console.error(`❌ Erro ao migrar ${appointment.id}:`, result.error);
        errorCount++;
        errors.push({
          id: appointment.id,
          clientName: appointment.clientName,
          amount: appointment.finalPrice,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error(`💥 Erro crítico ao migrar agendamento ${appointment.id}:`, error);
      errorCount++;
      errors.push({
        id: appointment.id,
        clientName: appointment.clientName || 'Nome não disponível',
        amount: appointment.finalPrice || 0,
        error: error.message
      });
    }
  }
  
  // Verificar resultado final
  const finalCheck = await financialService.getPaymentHistory(lawyerId);
  const finalCount = finalCheck.success ? finalCheck.data.length : 0;
  
  const result = {
    success: true,
    processed: appointments.length,
    migrated: migratedCount,
    skipped: skippedCount,
    errors: errorCount,
    finalFinancialRecords: finalCount,
    details: {
      migrated,
      skipped,
      errors
    }
  };
  
  console.log('📊 RESULTADO DA MIGRAÇÃO:', result);
  
  return result;
};

export const validateAppointmentForMigration = (appointment) => {
  const issues = [];
  
  if (!appointment.id) {
    issues.push('ID do agendamento ausente');
  }
  
  if (!appointment.clientName) {
    issues.push('Nome do cliente ausente');
  }
  
  if (!appointment.finalPrice || appointment.finalPrice <= 0) {
    issues.push('Valor inválido ou zero');
  }
  
  if (!['pago', 'confirmado', 'finalizado'].includes(appointment.status)) {
    issues.push(`Status não elegível: ${appointment.status}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

export const generateMigrationReport = (result) => {
  let report = `🎯 RELATÓRIO DE MIGRAÇÃO\n\n`;
  
  report += `📊 RESUMO:\n`;
  report += `• Agendamentos processados: ${result.processed}\n`;
  report += `• Migrados com sucesso: ${result.migrated}\n`;
  report += `• Pulados (já existiam): ${result.skipped}\n`;
  report += `• Erros: ${result.errors}\n`;
  report += `• Total no sistema financeiro: ${result.finalFinancialRecords}\n\n`;
  
  if (result.details.migrated.length > 0) {
    report += `✅ MIGRADOS COM SUCESSO:\n`;
    result.details.migrated.forEach(item => {
      report += `• ${item.clientName} - R$ ${item.amount?.toFixed(2) || '0,00'}\n`;
    });
    report += `\n`;
  }
  
  if (result.details.skipped.length > 0) {
    report += `⏭️ PULADOS:\n`;
    result.details.skipped.forEach(item => {
      report += `• ${item.clientName} - ${item.reason}\n`;
    });
    report += `\n`;
  }
  
  if (result.details.errors.length > 0) {
    report += `❌ ERROS:\n`;
    result.details.errors.forEach(item => {
      report += `• ${item.clientName} - ${item.error}\n`;
    });
    report += `\n`;
  }
  
  if (result.migrated > 0) {
    report += `🎉 Migração concluída! Verifique a tela financeiro para ver os valores.`;
  } else if (result.skipped > 0 && result.errors === 0) {
    report += `ℹ️ Todos os agendamentos já estavam migrados.`;
  } else {
    report += `⚠️ Migração concluída com problemas. Verifique os erros acima.`;
  }
  
  return report;
};
