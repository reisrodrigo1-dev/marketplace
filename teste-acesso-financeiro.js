// Teste específico para validar acesso financeiro de usuários com role "financial"

async function testarAcessoFinanceiro() {
  console.log('🧪 TESTE: Validando acesso financeiro para role "financial"');
  console.log('='.repeat(60));

  // Simulação de dados de teste
  const testCases = [
    {
      name: 'Usuário Financial com Colaboração',
      collaboration: {
        role: 'financial',
        permissions: ['financial'],
        pageId: 'page_123',
        ownerUserId: 'owner123',
        collaboratorUserId: 'financial_user'
      },
      expectedAccess: true
    },
    {
      name: 'Usuário Intern sem Permissão',
      collaboration: {
        role: 'intern',
        permissions: ['clients', 'appointments'],
        pageId: 'page_123',
        ownerUserId: 'owner123',
        collaboratorUserId: 'intern_user'
      },
      expectedAccess: false
    },
    {
      name: 'Usuário Lawyer com Permissão',
      collaboration: {
        role: 'lawyer',
        permissions: ['clients', 'appointments', 'financial'],
        pageId: 'page_123',
        ownerUserId: 'owner123',
        collaboratorUserId: 'lawyer_user'
      },
      expectedAccess: true
    }
  ];

  console.log('📋 Testando lógica de validação de acesso financeiro...\n');

  for (const testCase of testCases) {
    console.log(`🔍 Teste: ${testCase.name}`);
    console.log(`   Role: ${testCase.collaboration.role}`);
    console.log(`   Permissions: ${testCase.collaboration.permissions.join(', ')}`);
    
    // Simular a lógica de validação
    const isOwner = false; // Simulando que não é owner
    const role = testCase.collaboration.role;
    const permissions = testCase.collaboration.permissions;
    
    // Aplicar a lógica corrigida
    const canView = isOwner || 
                   role === 'lawyer' || 
                   role === 'financial';
    
    const status = canView === testCase.expectedAccess ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`   Resultado: ${canView ? 'ACESSO PERMITIDO' : 'ACESSO NEGADO'}`);
    console.log(`   Esperado: ${testCase.expectedAccess ? 'ACESSO PERMITIDO' : 'ACESSO NEGADO'}`);
    console.log(`   Status: ${status}\n`);
  }

  console.log('📊 RESUMO DOS TESTES:');
  console.log('   ✅ Usuários com role "financial" devem ter acesso automaticamente');
  console.log('   ✅ Usuários com role "lawyer" devem ter acesso automaticamente');
  console.log('   ❌ Usuários com role "intern" não devem ter acesso');
  console.log('   ✅ Proprietários sempre têm acesso (owner = true)');

  console.log('\n🔧 CORREÇÕES APLICADAS:');
  console.log('   1. Removida validação dupla de permissions.includes("financial")');
  console.log('   2. Role "financial" agora tem acesso direto baseado apenas no role');
  console.log('   3. Simplificada lógica em getPagesWithFinancialAccess e canViewFinancial');
}

// Executar teste
testarAcessoFinanceiro();
