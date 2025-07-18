/**
 * SCRIPT DE MIGRAÇÃO - CÓDIGOS DE USUÁRIO
 * 
 * Este script adiciona códigos únicos para todos os usuários existentes
 * que ainda não possuem código no sistema.
 */

import { userCodeService } from '../services/userCodeService.js';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Função para migrar usuários existentes
async function migrateExistingUsers() {
  console.log('🔄 Iniciando migração de códigos de usuário...');
  
  try {
    // Buscar todos os usuários sem código
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    console.log(`📋 Encontrados ${usersSnapshot.size} usuários para verificar`);
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        
        // Verificar se já tem código
        if (userData.userCode) {
          console.log(`⏭️ Usuário ${userData.name || userDoc.id} já tem código: ${userData.userCode}`);
          skipped++;
          continue;
        }
        
        // Gerar código único
        const codeResult = await userCodeService.generateUniqueUserCode();
        
        if (!codeResult.success) {
          console.error(`❌ Erro ao gerar código para usuário ${userDoc.id}:`, codeResult.error);
          errors++;
          continue;
        }
        
        // Atualizar usuário com código
        await updateDoc(doc(db, 'users', userDoc.id), {
          userCode: codeResult.code,
          codeGeneratedAt: new Date(),
          codeGeneratedBy: 'migration'
        });
        
        console.log(`✅ Código ${codeResult.code} atribuído ao usuário ${userData.name || userDoc.id} (${userData.userType || 'cliente'})`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${userDoc.id}:`, error);
        errors++;
      }
    }
    
    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    console.log(`✅ Usuários atualizados: ${updated}`);
    console.log(`⏭️ Usuários já tinham código: ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📋 Total processados: ${usersSnapshot.size}`);
    
    return {
      success: true,
      updated,
      skipped,
      errors,
      total: usersSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Erro crítico na migração:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para migrar clientes existentes
async function migrateExistingClients() {
  console.log('🔄 Iniciando migração de códigos de clientes...');
  
  try {
    // Buscar todos os clientes sem código
    const clientsQuery = query(collection(db, 'clients'));
    const clientsSnapshot = await getDocs(clientsQuery);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    console.log(`📋 Encontrados ${clientsSnapshot.size} clientes para verificar`);
    
    for (const clientDoc of clientsSnapshot.docs) {
      try {
        const clientData = clientDoc.data();
        
        // Verificar se já tem código
        if (clientData.userCode) {
          console.log(`⏭️ Cliente ${clientData.name || clientDoc.id} já tem código: ${clientData.userCode}`);
          skipped++;
          continue;
        }
        
        // Gerar código único
        const codeResult = await userCodeService.generateUniqueUserCode();
        
        if (!codeResult.success) {
          console.error(`❌ Erro ao gerar código para cliente ${clientDoc.id}:`, codeResult.error);
          errors++;
          continue;
        }
        
        // Atualizar cliente com código
        await updateDoc(doc(db, 'clients', clientDoc.id), {
          userCode: codeResult.code,
          codeGeneratedAt: new Date(),
          codeGeneratedBy: 'migration'
        });
        
        console.log(`✅ Código ${codeResult.code} atribuído ao cliente ${clientData.name || clientDoc.id}`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Erro ao processar cliente ${clientDoc.id}:`, error);
        errors++;
      }
    }
    
    console.log('\n📊 RESUMO DA MIGRAÇÃO DE CLIENTES:');
    console.log(`✅ Clientes atualizados: ${updated}`);
    console.log(`⏭️ Clientes já tinham código: ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📋 Total processados: ${clientsSnapshot.size}`);
    
    return {
      success: true,
      updated,
      skipped,
      errors,
      total: clientsSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Erro crítico na migração de clientes:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função principal de migração
export async function runUserCodeMigration() {
  console.log('🚀 INICIANDO MIGRAÇÃO COMPLETA DE CÓDIGOS DE USUÁRIO');
  console.log('=' .repeat(60));
  
  try {
    // Migrar usuários
    const userResults = await migrateExistingUsers();
    
    // Migrar clientes
    const clientResults = await migrateExistingClients();
    
    console.log('\n🎉 MIGRAÇÃO COMPLETA FINALIZADA!');
    console.log('=' .repeat(60));
    console.log('👥 USUÁRIOS:');
    console.log(`   ✅ Atualizados: ${userResults.updated || 0}`);
    console.log(`   ⏭️ Já tinham código: ${userResults.skipped || 0}`);
    console.log(`   ❌ Erros: ${userResults.errors || 0}`);
    
    console.log('\n👤 CLIENTES:');
    console.log(`   ✅ Atualizados: ${clientResults.updated || 0}`);
    console.log(`   ⏭️ Já tinham código: ${clientResults.skipped || 0}`);
    console.log(`   ❌ Erros: ${clientResults.errors || 0}`);
    
    const totalUpdated = (userResults.updated || 0) + (clientResults.updated || 0);
    const totalErrors = (userResults.errors || 0) + (clientResults.errors || 0);
    
    console.log('\n📊 TOTAIS GERAIS:');
    console.log(`   ✅ Total atualizado: ${totalUpdated}`);
    console.log(`   ❌ Total de erros: ${totalErrors}`);
    
    if (totalErrors === 0) {
      console.log('\n🎯 MIGRAÇÃO 100% CONCLUÍDA SEM ERROS!');
    } else {
      console.log(`\n⚠️ MIGRAÇÃO CONCLUÍDA COM ${totalErrors} ERRO(S)`);
    }
    
    return {
      success: true,
      users: userResults,
      clients: clientResults,
      totalUpdated,
      totalErrors
    };
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NA MIGRAÇÃO COMPLETA:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para executar migração via console (para debugging)
export function executeMigrationFromConsole() {
  if (typeof window !== 'undefined') {
    console.log('🔧 Executando migração de códigos de usuário...');
    console.log('⚠️ Esta operação pode demorar alguns minutos dependendo do número de usuários.');
    
    const confirmed = confirm(
      'Deseja executar a migração de códigos de usuário?\n\n' +
      'Esta operação irá:\n' +
      '• Adicionar códigos únicos para todos os usuários sem código\n' +
      '• Adicionar códigos únicos para todos os clientes sem código\n' +
      '• Não alterar usuários que já possuem código\n\n' +
      'Confirma a execução?'
    );
    
    if (confirmed) {
      runUserCodeMigration()
        .then(result => {
          if (result.success) {
            alert(`Migração concluída!\n\nUsuários atualizados: ${result.totalUpdated}\nErros: ${result.totalErrors}`);
          } else {
            alert(`Erro na migração: ${result.error}`);
          }
        })
        .catch(error => {
          alert(`Erro crítico: ${error.message}`);
        });
    }
  } else {
    console.error('❌ Esta função só pode ser executada no navegador');
  }
}

// Disponibilizar função globalmente para debug
if (typeof window !== 'undefined') {
  window.runUserCodeMigration = executeMigrationFromConsole;
}

console.log('📋 Script de migração de códigos carregado.');
console.log('💡 Para executar a migração manualmente, digite no console: runUserCodeMigration()');

export default {
  runUserCodeMigration,
  migrateExistingUsers,
  migrateExistingClients,
  executeMigrationFromConsole
};
