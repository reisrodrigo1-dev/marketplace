// DEBUG ESPECÍFICO - CHAT CREATION MODAL RÉPLICA
// Execute no console após abrir "Novo Chat"

(async function debugChatCreationModal() {
  console.log('🔍 DEBUG CHAT CREATION MODAL - RÉPLICA');
  console.log('=====================================');
  
  // 1. Simular carregamento de prompts
  console.log('\n📋 1. SIMULANDO CARREGAMENTO DE PROMPTS:');
  
  // Simular função createPromptFromFileName
  const fileName = 'Réplica';
  const id = fileName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const promptReplica = {
    id: id,
    name: fileName,
    description: 'Elaboração de tréplicas processuais',
    icon: '📝',
    category: 'Defesa'
  };
  
  console.log('  Prompt criado:', promptReplica);
  console.log('  ID gerado:', promptReplica.id);
  
  // 2. Testar função requiresMandatoryDocument
  console.log('\n🔍 2. TESTANDO requiresMandatoryDocument:');
  
  // Simular a função
  const MANDATORY_DOCUMENT = [
    'analisar-laudos-medicos', 'analisar-pec', 'analisar-pec-defensoria', 
    'correcao-portugues', 'corrigir-portugues-deixar-claro', 'corrigir-portugues-mantendo-escrita',
    'depoimento-vitima-laudo-medico', 'encontrar-contradicoes-testemunhas',
    'memoriais-ministerio-publico', 'memoriais-civel-consumidor', 'memoriais-criminais',
    'memoriais-previdenciarios', 'memoriais-trabalhistas', 'relatorio-criminal',
    'relatorio-contestacao-replica', 'resumir-processos-criminais-defesa',
    'resumir-processos-familia-audiencias', 'resumo-assistidos-dpe', 'resumo-cliente',
    'vitima-depoimento', 'preparacao-audiencia-trabalhista-reclamando',
    'preparacao-audiencia-trabalhista-reclamante', 'acrescentar-argumentos',
    'rebater-argumentos', 'maximizar-impacto-retorico', 'ementa', 'ementa-cnj',
    'dosimetria-pena', 'replica', 'contrarrazoes-civel-familia',
    'contrarrazoes-apelacao-criminal', 'contrarrazoes-recurso-especial',
    'contrarrazoes-recurso-extraordinario', 'razoes-rese', 'despacho-judicial',
    'correicoes-e-sugestoes-pecas'
  ];
  
  function testRequiresMandatory(promptId, promptName) {
    const id = (promptId || '').toLowerCase().replace(/\s+/g, '-');
    const name = (promptName || '').toLowerCase().replace(/\s+/g, '-');
    
    console.log('    ID processado:', id);
    console.log('    Nome processado:', name);
    
    const result = MANDATORY_DOCUMENT.some(required => {
      const match = id.includes(required) || name.includes(required) || 
             required.includes(id) || required.includes(name);
      
      if (match) {
        console.log(`    ✅ MATCH: "${required}"`);
      }
      
      return match;
    });
    
    return result;
  }
  
  const requiresDoc = testRequiresMandatory(promptReplica.id, promptReplica.name);
  console.log('  Resultado requiresMandatoryDocument:', requiresDoc ? '✅ SIM' : '❌ NÃO');
  
  // 3. Simular função getDocumentInfo
  console.log('\n📄 3. SIMULANDO getDocumentInfo:');
  
  let documentInfo = null;
  if (requiresDoc) {
    documentInfo = {
      type: 'mandatory',
      icon: '📄',
      text: 'Documento obrigatório',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    };
    console.log('  ✅ DocumentInfo criado:', documentInfo);
  } else {
    console.log('  ❌ DocumentInfo é null - não detectou necessidade de documento');
  }
  
  // 4. Verificar se o prompt apareceria na interface
  console.log('\n🎨 4. VERIFICANDO INTERFACE:');
  
  if (documentInfo) {
    console.log('  ✅ Badge "Documento obrigatório" deveria aparecer');
    console.log('  ✅ Texto "Requer documento para funcionar" deveria aparecer');
    console.log('  ✅ Cor vermelha (bg-red-50) deveria aparecer');
  } else {
    console.log('  ❌ Nenhuma indicação de documento aparecerá');
  }
  
  // 5. Verificar no DOM se estamos na página correta
  console.log('\n🖥️ 5. VERIFICANDO DOM:');
  
  const modalElement = document.querySelector('[role="dialog"]') || 
                      document.querySelector('.fixed.inset-0') ||
                      document.querySelector('h2:contains("Criar Novo Chat")');
  
  if (modalElement) {
    console.log('  ✅ Modal "Criar Novo Chat" detectado no DOM');
    
    // Procurar por prompts de réplica
    const replicaElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.toLowerCase().includes('réplica')
    );
    
    console.log(`  📋 Elementos contendo "réplica" encontrados: ${replicaElements.length}`);
    
    replicaElements.forEach((el, index) => {
      console.log(`    ${index + 1}. ${el.tagName}: "${el.textContent.trim().substring(0, 50)}..."`);
    });
    
    // Procurar por badges de documento
    const documentBadges = document.querySelectorAll('.bg-red-50, .text-red-600');
    console.log(`  🏷️ Badges de documento obrigatório encontrados: ${documentBadges.length}`);
    
  } else {
    console.log('  ❌ Modal "Criar Novo Chat" não encontrado');
    console.log('  💡 Certifique-se de estar na tela "Novo Chat"');
  }
  
  console.log('\n📝 CONCLUSÃO:');
  if (requiresDoc && documentInfo) {
    console.log('  🎉 A lógica está CORRETA - Réplica deveria mostrar como obrigatório');
    console.log('  🔍 Se não está aparecendo, pode ser:');
    console.log('    • Cache do navegador');
    console.log('    • Prompt não sendo carregado');
    console.log('    • CSS não aplicado');
    console.log('    • ID do prompt diferente do esperado');
  } else {
    console.log('  ❌ A lógica está INCORRETA - precisa verificar implementação');
  }
  
})();

console.log('📖 INSTRUÇÕES:');
console.log('1. Vá para Dashboard > Juri.IA');
console.log('2. Clique em "Novo Chat"');
console.log('3. Abra DevTools (F12) > Console');
console.log('4. Cole e execute este código');
console.log('5. Analise os resultados');
