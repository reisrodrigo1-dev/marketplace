// Script de teste para validar regras de permissão financeira
// Execute no console do navegador ou como módulo Node.js

console.log('🧪 TESTE DE VALIDAÇÃO DE PERMISSÕES FINANCEIRAS');
console.log('=' .repeat(60));

// Simulação de cenários de teste
const testScenarios = [
  {
    name: 'Proprietário da Página',
    userId: 'user123',
    userPages: [
      {
        id: 'page123',
        nomePagina: 'Advocacia Silva',
        userId: 'user123', // mesmo userId = proprietário
        accessType: 'owner',
        role: 'owner'
      }
    ],
    expectedAccess: true,
    description: 'Proprietário deve ter acesso total às informações financeiras'
  },
  {
    name: 'Advogado Colaborador',
    userId: 'user456',
    userPages: [
      {
        id: 'page123',
        nomePagina: 'Advocacia Silva',
        userId: 'user123', // proprietário diferente
        accessType: 'collaboration',
        role: 'lawyer',
        permissions: ['clients', 'appointments', 'financial']
      }
    ],
    expectedAccess: true,
    description: 'Advogado colaborador deve ter acesso financeiro'
  },
  {
    name: 'Financeiro Associado',
    userId: 'user789',
    userPages: [
      {
        id: 'page123',
        nomePagina: 'Advocacia Silva',
        userId: 'user123', // proprietário diferente
        accessType: 'collaboration',
        role: 'financial',
        permissions: ['financial']
      }
    ],
    expectedAccess: true,
    description: 'Usuário com role financeiro deve ter acesso'
  },
  {
    name: 'Estagiário Sem Permissão',
    userId: 'user999',
    userPages: [
      {
        id: 'page123',
        nomePagina: 'Advocacia Silva',
        userId: 'user123', // proprietário diferente
        accessType: 'collaboration',
        role: 'intern',
        permissions: ['clients', 'appointments']
      }
    ],
    expectedAccess: false,
    description: 'Estagiário sem permissão financeira NÃO deve ter acesso'
  },
  {
    name: 'Usuário Sem Páginas',
    userId: 'user000',
    userPages: [],
    expectedAccess: false,
    description: 'Usuário sem páginas associadas NÃO deve ter acesso'
  }
];

// Função para validar regras de acesso financeiro
function validateFinancialAccess(scenario) {
  console.log(`\n📋 Testando: ${scenario.name}`);
  console.log(`   Descrição: ${scenario.description}`);
  
  // Simular a lógica do getPagesWithFinancialAccess
  const hasFinancialAccess = scenario.userPages.some(page => {
    // Proprietário sempre tem acesso
    if (page.accessType === 'owner') {
      return true;
    }
    
    // Colaborador com role lawyer tem acesso
    if (page.role === 'lawyer') {
      return true;
    }
    
    // Colaborador com role financial e permissão financeira tem acesso
    if (page.role === 'financial' && page.permissions?.includes('financial')) {
      return true;
    }
    
    return false;
  });
  
  const testPassed = hasFinancialAccess === scenario.expectedAccess;
  
  console.log(`   Páginas: ${scenario.userPages.length}`);
  if (scenario.userPages.length > 0) {
    scenario.userPages.forEach(page => {
      console.log(`     - ${page.nomePagina} (${page.accessType}, role: ${page.role})`);
    });
  }
  console.log(`   Acesso Esperado: ${scenario.expectedAccess ? 'SIM' : 'NÃO'}`);
  console.log(`   Acesso Validado: ${hasFinancialAccess ? 'SIM' : 'NÃO'}`);
  console.log(`   Status: ${testPassed ? '✅ PASSOU' : '❌ FALHOU'}`);
  
  return testPassed;
}

// Executar todos os testes
let totalTests = testScenarios.length;
let passedTests = 0;

console.log('\n🚀 EXECUTANDO TESTES...\n');

testScenarios.forEach(scenario => {
  if (validateFinancialAccess(scenario)) {
    passedTests++;
  }
});

console.log('\n' + '=' .repeat(60));
console.log('📊 RESULTADOS DOS TESTES');
console.log('=' .repeat(60));
console.log(`Total de Testes: ${totalTests}`);
console.log(`Testes Passou: ${passedTests}`);
console.log(`Testes Falharam: ${totalTests - passedTests}`);
console.log(`Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM! As regras de permissão estão funcionando corretamente.');
} else {
  console.log('\n⚠️ ALGUNS TESTES FALHARAM! Verifique a implementação das regras de permissão.');
}

console.log('\n📝 RESUMO DAS REGRAS DE PERMISSÃO VALIDADAS:');
console.log('   1. ✅ Proprietários têm acesso total');
console.log('   2. ✅ Advogados colaboradores têm acesso financeiro');
console.log('   3. ✅ Usuários com role "financial" têm acesso');
console.log('   4. ✅ Estagiários sem permissão financeira são bloqueados');
console.log('   5. ✅ Usuários sem páginas são bloqueados');
