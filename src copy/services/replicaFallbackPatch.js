/**
 * PATCH TEMPORÁRIO PARA RESOLVER O ERRO DA RÉPLICA
 * 
 * Este patch adiciona verificações robustas e fallbacks
 * para garantir que o fluxo da Réplica funcione corretamente
 */

// Função para verificar se o serviço está funcionando
export const verifyReplicaService = () => {
  try {
    // Tentar importar diretamente
    const replicaService = require('./replicaWorkflowService');
    
    if (!replicaService || !replicaService.replicaWorkflowService) {
      console.log('❌ replicaWorkflowService não encontrado no import');
      return {
        valid: false,
        error: 'Serviço não encontrado no import',
        fallback: false // SEMPRE tentar usar o serviço principal primeiro
      };
    }
    
    const service = replicaService.replicaWorkflowService;
    
    // Verificar métodos essenciais
    const requiredMethods = [
      'initializeWorkflow',
      'processDocuments', 
      'getCurrentState',
      'processUserConfirmation',
      'generateSectionPrompt'
    ];
    
    const missingMethods = requiredMethods.filter(method => 
      typeof service[method] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      console.log('❌ Métodos ausentes no serviço:', missingMethods);
      return {
        valid: false,
        error: `Métodos ausentes: ${missingMethods.join(', ')}`,
        fallback: false // Tentar usar o serviço mesmo assim
      };
    }
    
    console.log('✅ Serviço da Réplica verificado com sucesso');
    return {
      valid: true,
      service: service,
      detector: replicaService.shouldUseReplicaWorkflow
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar serviço da Réplica:', error);
    return {
      valid: false,
      error: error.message,
      fallback: false // NÃO usar fallback por padrão
    };
  }
};

// Fallback simplificado para quando o serviço principal falha
export const replicaFallbackService = {
  processDocuments: (documents) => {
    if (!documents || documents.length === 0) {
      return {
        success: false,
        message: '⚠️ **Documentos ainda não foram anexados**\n\nPor favor, anexe os documentos obrigatórios (petição inicial, contestação, etc.) antes de prosseguir.'
      };
    }
    
    return {
      success: true,
      message: `✅ ${documents.length} documento(s) processado(s). O sistema está funcionando em modo simplificado. Prossiga com "SIM".`
    };
  },
  
  getCurrentState: () => ({
    currentSection: 0,
    completedSections: [],
    documentsProcessed: true,
    documentsContent: 'Processado em modo fallback',
    sectionContents: {},
    userConfirmations: {}
  }),
  
  processUserConfirmation: (userInput) => {
    const confirmations = ['sim', 'confirmo', 'ok', 'confirmar', 'continuar', 'prosseguir'];
    const isConfirmed = confirmations.some(word => userInput.includes(word));
    
    return {
      confirmed: isConfirmed,
      message: isConfirmed ? 
        'Confirmação recebida. Gerando réplica em modo simplificado...' :
        'Por favor, confirme digitando "SIM" para prosseguir.'
    };
  },
  
  generateSectionPrompt: () => {
    return `
Você é um especialista em Direito e está elaborando uma RÉPLICA JURÍDICA.

INSTRUÇÕES GERAIS:
- Elabore uma réplica completa e fundamentada
- Use linguagem jurídica formal
- Estruture em seções organizadas (Relatório, Pontos Controvertidos, Refutação, Pedidos)
- Base-se nos documentos que foram anexados pelo usuário
- Seja preciso, objetivo e técnico

CONTEXTO:
O usuário anexou documentos (petição inicial, contestação, etc.) e precisa de uma réplica bem estruturada.

ESTRUTURA SUGERIDA:
I – DO RELATÓRIO
II – DOS PONTOS CONTROVERTIDOS  
III – DA REFUTAÇÃO DOS ARGUMENTOS DA CONTESTAÇÃO
IV – DOS PEDIDOS

Elabore agora uma réplica completa e bem fundamentada:
    `.trim();
  }
};

// Função principal com fallback integrado
export const handleReplicaWorkflowWithFallback = async (userMessage, state, dependencies) => {
  console.log('🛡️ Executando handleReplicaWorkflow com fallback integrado');
  
  const { replicaPhase, attachedDocuments, setReplicaPhase, setReplicaState, replicaState } = state;
  const { sendMessageToAI } = dependencies;
  
  try {
    // PRIMEIRO: Tentar usar o serviço principal importado diretamente
    let service = null;
    let useFallback = false;
    
    try {
      const { replicaWorkflowService } = require('./replicaWorkflowService');
      if (replicaWorkflowService && typeof replicaWorkflowService.processDocuments === 'function') {
        service = replicaWorkflowService;
        console.log('✅ Usando serviço principal da Réplica');
      } else {
        throw new Error('Serviço principal não disponível');
      }
    } catch (serviceError) {
      console.warn('⚠️ Serviço principal falhou, usando fallback:', serviceError.message);
      service = replicaFallbackService;
      useFallback = true;
    }
    
    const userInput = userMessage.content.toLowerCase().trim();
    
    // Fase de upload de documentos
    if (replicaPhase === 'document_upload') {
      console.log('📄 Processando documentos...');
      
      const processResult = service.processDocuments(attachedDocuments);
      
      if (processResult.success) {
        setReplicaPhase('section_work');
        if (!useFallback && service.getCurrentState) {
          setReplicaState(service.getCurrentState());
        }
        return {
          success: true,
          message: processResult.message + (useFallback ? '\n\n⚠️ Sistema em modo simplificado.' : '')
        };
      } else {
        return {
          success: true,
          message: processResult.message
        };
      }
    }
    
    // Fase de trabalho em seções  
    if (replicaPhase === 'section_work') {
      console.log('🔧 Processando confirmação...');
      
      const confirmation = service.processUserConfirmation(userInput, replicaState?.currentSection || 0);
      
      if (confirmation.confirmed) {
        console.log('✅ Confirmação recebida, gerando réplica...');
        
        let prompt;
        if (!useFallback && service.generateSectionPrompt) {
          // Usar prompt específico do serviço principal
          const sectionIndex = replicaState?.currentSection || 0;
          prompt = service.generateSectionPrompt(sectionIndex);
        } else {
          // Usar prompt básico do fallback MAS com documentos reais
          prompt = generateAdvancedReplicaPrompt(attachedDocuments);
        }
        
        console.log('📝 Prompt gerado:', {
          length: prompt.length,
          useFallback,
          documentsCount: attachedDocuments.length
        });
        
        try {
          // Formatar prompt como mensagem para a IA
          const aiMessages = [
            {
              role: 'user',
              content: prompt
            }
          ];
          
          console.log('📤 Enviando prompt para IA:', {
            messageLength: prompt.length,
            documentsCount: attachedDocuments.length
          });
          
          const aiResponse = await sendMessageToAI(aiMessages);
          
          if (aiResponse && aiResponse.success && aiResponse.message) {
            console.log('✅ IA respondeu com sucesso:', {
              responseLength: aiResponse.message.length,
              hasContent: aiResponse.message.length > 100
            });
            
            return {
              success: true,
              message: aiResponse.message + '\n\n✅ **Réplica elaborada com sucesso!**'
            };
          } else {
            console.error('❌ Resposta da IA inválida:', aiResponse);
            throw new Error('Resposta da IA inválida ou vazia');
          }
          
        } catch (aiError) {
          console.warn('❌ Erro na IA:', aiError.message);
          
          return {
            success: true,
            message: `❌ Erro ao comunicar com a IA: ${aiError.message}\n\nTente novamente ou verifique sua conexão.`
          };
        }
      } else {
        return {
          success: true,
          message: confirmation.message
        };
      }
    }
    
    // Estado inválido
    return {
      success: true,
      message: '❌ Estado inválido do fluxo. Digite "SIM" para continuar ou recarregue a página.'
    };
    
  } catch (error) {
    console.error('❌ Erro crítico no fluxo da Réplica:', error);
    
    return {
      success: true,
      message: `❌ Erro no processamento: ${error.message}\n\nTente recarregar a página ou entre em contato com o suporte.\n\n🔧 **Solução temporária**: Digite "GERAR" para tentar o fluxo normal.`
    };
  }
};

// Função para gerar prompt avançado com documentos reais
function generateAdvancedReplicaPrompt(documents) {
  let documentsText = '';
  if (documents && documents.length > 0) {
    documentsText = documents.map((doc, index) => 
      `=== DOCUMENTO ${index + 1}: ${doc.name || doc.fileName} ===\nTIPO: ${doc.fileType?.toUpperCase() || 'TXT'}\nTAMANHO: ${Math.round(doc.content?.length / 1000) || 0}k caracteres\n\nCONTEÚDO COMPLETO:\n${doc.content}\n\n`
    ).join('');
  }

  return `Você é um assistente jurídico especializado em elaboração de réplicas processuais.

**IMPORTANTE: ELABORE CONTEÚDO COMPLETO E ESPECÍFICO, NÃO APENAS ESTRUTURA OU MODELO**

**TAREFA:** Elaborar uma RÉPLICA JURÍDICA COMPLETA baseada nos documentos anexados.

**TODOS OS DOCUMENTOS ANEXADOS PARA ANÁLISE:**
${documentsText}

**ESTRUTURA OBRIGATÓRIA:**

I – DO RELATÓRIO
- Resumir os fatos da petição inicial
- Resumir os argumentos da contestação
- Identificar cronologia dos fatos

II – DOS PONTOS CONTROVERTIDOS
- Identificar questões de fato em disputa
- Identificar questões de direito em disputa
- Delimitar objeto da lide

III – DA REFUTAÇÃO DOS ARGUMENTOS DA CONTESTAÇÃO
- Analisar cada argumento da contestação
- Refutar argumentos defensivos
- Demonstrar inconsistências
- Reforçar argumentos da inicial

IV – DOS PEDIDOS
- Reiterar pedidos da inicial
- Fundamentar procedência
- Incluir pedidos processuais

**INSTRUÇÕES ESPECÍFICAS:**
• Analise TODOS os ${documents?.length || 0} documentos anexados
• Use informações ESPECÍFICAS dos documentos (nomes, valores, datas, fatos)
• Cross-reference informações entre os documentos
• Use linguagem jurídica formal e técnica
• Nomes de pessoas em MAIÚSCULAS
• Base-se exclusivamente nos documentos fornecidos
• Seja específico e fundamentado
• NÃO use jurisprudência genérica
• Elabore conteúdo substancial para cada seção
• ELABORE TEXTO COMPLETO, NÃO APENAS TÓPICOS OU ESTRUTURA

**CRÍTICO:** Elabore uma réplica COMPLETA e DETALHADA com base nos fatos específicos dos documentos anexados, NÃO retorne apenas estrutura, modelo ou tópicos.

Elabore agora a réplica jurídica completa:`;
}

export default {
  verifyReplicaService,
  replicaFallbackService,
  handleReplicaWorkflowWithFallback
};
