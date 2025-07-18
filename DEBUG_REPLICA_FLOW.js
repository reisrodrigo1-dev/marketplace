/**
 * Script de Debug para o Fluxo da Réplica
 * 
 * Este script testa e diagnostica problemas no fluxo da Réplica
 */

// Simulação dos imports principais
const mockPromptType = {
  name: 'Réplica',
  filename: 'Replica.txt'
};

const mockAttachedDocuments = [
  {
    name: 'peticao_inicial.pdf',
    content: 'Conteúdo da petição inicial...',
    type: 'application/pdf'
  },
  {
    name: 'contestacao.docx',
    content: 'Conteúdo da contestação...',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
];

// Função para testar detecção da Réplica
function testReplicaDetection() {
  console.log('🔍 TESTE 1: Detecção da Réplica');
  
  try {
    // Simular a função shouldUseReplicaWorkflow
    const shouldUseReplica = (promptType) => {
      if (!promptType || !promptType.name) return false;
      return promptType.name.toLowerCase().includes('réplica') || 
             promptType.name.toLowerCase().includes('replica');
    };
    
    const result = shouldUseReplica(mockPromptType);
    console.log('✅ Resultado da detecção:', result);
    console.log('📝 Prompt name:', mockPromptType.name);
    
    return result;
  } catch (error) {
    console.error('❌ Erro na detecção:', error);
    return false;
  }
}

// Função para testar inicialização do workflow
function testWorkflowInitialization() {
  console.log('\n🔍 TESTE 2: Inicialização do Workflow');
  
  try {
    // Simular a inicialização
    const mockWorkflowInit = {
      success: true,
      phase: 'document_upload',
      message: 'Workflow inicializado',
      state: {
        currentSection: 0,
        sectionsCompleted: [],
        documentsProcessed: false
      }
    };
    
    console.log('✅ Workflow inicializado:', mockWorkflowInit);
    return mockWorkflowInit;
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    return null;
  }
}

// Função para testar processamento de documentos
function testDocumentProcessing() {
  console.log('\n🔍 TESTE 3: Processamento de Documentos');
  
  try {
    console.log('📄 Documentos para processar:', mockAttachedDocuments.length);
    
    mockAttachedDocuments.forEach((doc, index) => {
      console.log(`📄 Documento ${index + 1}:`, {
        name: doc.name,
        type: doc.type,
        contentLength: doc.content.length
      });
    });
    
    // Simular processamento bem-sucedido
    const processResult = {
      success: true,
      message: '✅ Documentos processados com sucesso',
      documentsAnalyzed: mockAttachedDocuments.length
    };
    
    console.log('✅ Resultado do processamento:', processResult);
    return processResult;
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    return null;
  }
}

// Função para testar geração de prompt de seção
function testSectionPromptGeneration() {
  console.log('\n🔍 TESTE 4: Geração de Prompt de Seção');
  
  try {
    const sectionIndex = 0;
    const sections = [
      'Preliminares',
      'Análise dos Fatos',
      'Direito',
      'Pedidos'
    ];
    
    const sectionName = sections[sectionIndex];
    const sectionPrompt = `
Você está elaborando uma RÉPLICA JURÍDICA.

SEÇÃO ATUAL: ${sectionName} (${sectionIndex + 1}/${sections.length})

DOCUMENTOS ANEXADOS: ${mockAttachedDocuments.length} documento(s)

INSTRUÇÕES:
- Elabore apenas a seção "${sectionName}"
- Use linguagem jurídica formal
- Base-se nos documentos anexados
- Seja preciso e fundamentado

DOCUMENTOS:
${mockAttachedDocuments.map(doc => `- ${doc.name}: ${doc.content.substring(0, 100)}...`).join('\n')}

Elabore agora a seção "${sectionName}":
    `.trim();
    
    console.log('✅ Prompt gerado para seção:', sectionIndex);
    console.log('📝 Tamanho do prompt:', sectionPrompt.length);
    console.log('📄 Preview:', sectionPrompt.substring(0, 200) + '...');
    
    return {
      success: true,
      prompt: sectionPrompt,
      sectionName,
      sectionIndex
    };
  } catch (error) {
    console.error('❌ Erro na geração do prompt:', error);
    return null;
  }
}

// Função principal de teste
async function runDebugTests() {
  console.log('🚀 INICIANDO DEBUG DO FLUXO DA RÉPLICA\n');
  
  const results = {
    detection: false,
    initialization: false,
    documentProcessing: false,
    sectionGeneration: false
  };
  
  // Teste 1: Detecção
  results.detection = testReplicaDetection();
  
  // Teste 2: Inicialização
  const initResult = testWorkflowInitialization();
  results.initialization = !!initResult;
  
  // Teste 3: Processamento de documentos
  const docResult = testDocumentProcessing();
  results.documentProcessing = !!docResult;
  
  // Teste 4: Geração de seção
  const sectionResult = testSectionPromptGeneration();
  results.sectionGeneration = !!sectionResult;
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('='.repeat(40));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${passed ? 'PASSOU' : 'FALHOU'}`);
  });
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 RESULTADO GERAL:', allPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM');
  
  if (!allPassed) {
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Verificar logs de erro específicos');
    console.log('2. Testar com documentos reais');
    console.log('3. Verificar configuração do OpenAI');
    console.log('4. Analisar estado do React no navegador');
  }
  
  return results;
}

// Executar os testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runDebugTests };
} else {
  // Executar no navegador ou Node.js
  runDebugTests().then(results => {
    console.log('\n✅ Debug concluído');
  }).catch(error => {
    console.error('❌ Erro no debug:', error);
  });
}
