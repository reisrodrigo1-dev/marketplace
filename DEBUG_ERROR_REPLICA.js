/**
 * Script de Teste Prático para Debug do Erro da Réplica
 * 
 * Este script simula exatamente o fluxo que está causando o erro
 */

console.log('🔍 INICIANDO DEBUG DO ERRO DA RÉPLICA');
console.log('='.repeat(50));

// Simulação do estado atual baseado nos logs fornecidos
const mockState = {
  conversationPhase: 'questioning',
  collectedData: [],
  currentQuestionIndex: 0,
  messages: [
    { id: 1, role: 'assistant', content: 'Olá! Vou ajudá-lo...', timestamp: new Date() },
    { id: 2, role: 'user', content: 'Quero fazer uma réplica', timestamp: new Date() },
    { id: 3, role: 'assistant', content: 'Detectei que você quer...', timestamp: new Date() },
    { id: 4, role: 'user', content: 'sim', timestamp: new Date() },
    { id: 5, role: 'assistant', content: 'Por favor, anexe...', timestamp: new Date() },
    { id: 6, role: 'user', content: 'ok', timestamp: new Date() }
  ],
  promptType: { name: 'Réplica', filename: 'Replica.txt' },
  chatId: '86ETF9qgEgswAkhSBvHy',
  isInitialized: true,
  isLoading: false,
  isReplicaWorkflow: true,
  replicaPhase: 'document_upload',
  replicaState: null,
  attachedDocuments: []
};

// Função para simular o replicaWorkflowService
const mockReplicaWorkflowService = {
  processDocuments: (documents) => {
    console.log('📄 Processando documentos:', documents.length);
    
    if (!documents || documents.length === 0) {
      console.log('❌ Nenhum documento encontrado');
      return {
        success: false,
        message: '⚠️ **Documentos ainda não foram anexados**\n\nPor favor, use o botão "📎 Anexar Documentos" para carregar os documentos obrigatórios.'
      };
    }
    
    console.log('✅ Documentos processados com sucesso');
    return {
      success: true,
      message: '✅ Documentos processados. Iniciando elaboração das seções.'
    };
  },
  
  getCurrentState: () => {
    return {
      currentSection: 0,
      completedSections: [],
      documentsProcessed: false,
      documentsContent: null,
      sectionContents: {},
      userConfirmations: {}
    };
  },
  
  processUserConfirmation: (userInput, sectionIndex) => {
    console.log('👤 Processando confirmação:', { userInput, sectionIndex });
    
    const confirmations = ['sim', 'confirmo', 'ok', 'confirmar', 'continuar'];
    const isConfirmed = confirmations.some(word => userInput.includes(word));
    
    return {
      confirmed: isConfirmed,
      message: isConfirmed ? 
        'Confirmação recebida. Iniciando elaboração da seção.' :
        'Por favor, confirme digitando "SIM" para prosseguir.'
    };
  }
};

// Simulação da função handleReplicaWorkflow
async function simulateHandleReplicaWorkflow(userMessage, state) {
  console.log('\n📝 SIMULANDO handleReplicaWorkflow');
  console.log('Input:', {
    userMessage: userMessage.content,
    phase: state.replicaPhase,
    documentsCount: state.attachedDocuments.length
  });
  
  const userInput = userMessage.content.toLowerCase().trim();
  
  try {
    console.log('🔍 Estado do fluxo:', {
      replicaPhase: state.replicaPhase,
      attachedDocumentsLength: state.attachedDocuments.length,
      replicaStateExists: !!state.replicaState
    });
    
    // Verificar se serviço está disponível
    if (!mockReplicaWorkflowService) {
      console.error('❌ Serviço não disponível!');
      return {
        success: false,
        message: '❌ Erro de configuração: Serviço não foi carregado.'
      };
    }
    
    // Fase de upload de documentos
    if (state.replicaPhase === 'document_upload') {
      console.log('📄 Processando fase de upload...');
      
      if (state.attachedDocuments.length === 0) {
        console.log('⚠️ Nenhum documento anexado');
        return {
          success: true,
          message: '⚠️ **Documentos ainda não foram anexados**\n\nPor favor, use o botão "📎 Anexar Documentos" para carregar os documentos obrigatórios.'
        };
      }
      
      console.log('⚙️ Processando documentos...');
      const processResult = mockReplicaWorkflowService.processDocuments(state.attachedDocuments);
      
      console.log('📊 Resultado:', processResult);
      
      if (processResult.success) {
        console.log('✅ Avançando para section_work');
        // state.replicaPhase = 'section_work';  // Simulação
        // state.replicaState = mockReplicaWorkflowService.getCurrentState();
        return {
          success: true,
          message: processResult.message
        };
      } else {
        console.log('❌ Falha no processamento');
        return {
          success: true,
          message: processResult.message
        };
      }
    }
    
    // Outras fases...
    console.log('🔄 Outras fases não implementadas na simulação');
    return {
      success: true,
      message: 'Simulação concluída para fase: ' + state.replicaPhase
    };
    
  } catch (error) {
    console.error('❌ Erro capturado na simulação:', error);
    console.error('Stack:', error.stack);
    return {
      success: false,
      message: `❌ Erro interno: ${error.message}`
    };
  }
}

// Função principal de teste
async function runErrorDebugTest() {
  console.log('\n🧪 EXECUTANDO TESTE DE DEBUG');
  
  // Simular a mensagem do usuário que está causando o erro
  const userMessage = {
    id: 7,
    role: 'user', 
    content: 'ok',
    timestamp: new Date()
  };
  
  console.log('📨 Mensagem do usuário:', userMessage);
  console.log('🗃️ Estado atual:', {
    phase: mockState.replicaPhase,
    documentsCount: mockState.attachedDocuments.length,
    messagesCount: mockState.messages.length
  });
  
  // Executar a simulação
  try {
    const result = await simulateHandleReplicaWorkflow(userMessage, mockState);
    
    console.log('\n📋 RESULTADO DA SIMULAÇÃO:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (!result.success) {
      console.log('❌ ERRO REPRODUZIDO!');
      console.log('Esse pode ser o problema que está causando o erro.');
    } else {
      console.log('✅ Simulação executada sem erros');
      console.log('O problema pode estar em outro lugar...');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NA SIMULAÇÃO:', error);
    console.error('Stack:', error.stack);
    return {
      success: false,
      message: `Erro crítico: ${error.message}`
    };
  }
}

// Função para testar cenários específicos
async function testSpecificScenarios() {
  console.log('\n🎯 TESTANDO CENÁRIOS ESPECÍFICOS');
  
  const scenarios = [
    {
      name: 'Usuário sem documentos',
      state: { ...mockState, attachedDocuments: [] },
      userInput: 'ok'
    },
    {
      name: 'Usuário com documentos',
      state: { 
        ...mockState, 
        attachedDocuments: [
          { name: 'doc1.pdf', content: 'conteudo...', type: 'application/pdf' }
        ] 
      },
      userInput: 'prosseguir'
    },
    {
      name: 'Fase diferente',
      state: { ...mockState, replicaPhase: 'section_work' },
      userInput: 'sim'
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n📋 Cenário: ${scenario.name}`);
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: scenario.userInput,
      timestamp: new Date()
    };
    
    try {
      const result = await simulateHandleReplicaWorkflow(userMessage, scenario.state);
      console.log(`✅ ${scenario.name}: ${result.success ? 'SUCESSO' : 'ERRO'}`);
      console.log(`📝 Mensagem: ${result.message.substring(0, 100)}...`);
    } catch (error) {
      console.error(`❌ ${scenario.name}: ERRO - ${error.message}`);
    }
  }
}

// Executar todos os testes
async function runAllDebugTests() {
  try {
    console.log('🚀 INICIANDO TODOS OS TESTES DE DEBUG\n');
    
    await runErrorDebugTest();
    await testSpecificScenarios();
    
    console.log('\n🏁 TESTES DE DEBUG CONCLUÍDOS');
    console.log('='.repeat(50));
    
    // Sugestões baseadas nos testes
    console.log('\n💡 SUGESTÕES PARA RESOLVER O ERRO:');
    console.log('1. Verificar se replicaWorkflowService está sendo importado corretamente');
    console.log('2. Verificar se setState está sendo chamado corretamente'); 
    console.log('3. Verificar se há problemas de async/await');
    console.log('4. Verificar logs do browser em tempo real');
    console.log('5. Verificar se há problemas com o Firebase/Firestore');
    
  } catch (error) {
    console.error('❌ ERRO GERAL NOS TESTES:', error);
  }
}

// Executar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllDebugTests };
} else {
  runAllDebugTests();
}
