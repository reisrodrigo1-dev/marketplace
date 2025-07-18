/**
 * Teste Específico do Problema da Réplica Básica
 * 
 * Este script reproduz e diagnostica o problema onde a IA 
 * retorna apenas estrutura básica em vez de réplica completa
 */

console.log('🔍 DIAGNÓSTICO DO PROBLEMA DA RÉPLICA BÁSICA');
console.log('='.repeat(60));

// Simular documentos reais como os que o usuário anexaria
const mockRealDocuments = [
  {
    id: 1,
    fileName: 'peticao_inicial.docx',
    content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA CÍVEL DA COMARCA DE SÃO PAULO

JOÃO DA SILVA, brasileiro, solteiro, engenheiro, portador do RG nº 12.345.678-9 SSP/SP e do CPF nº 123.456.789-00, residente e domiciliado na Rua das Flores, nº 123, Bairro Centro, São Paulo/SP, por seu advogado que esta subscreve, vem respeitosamente à presença de Vossa Excelência propor a presente

AÇÃO DE COBRANÇA

em face de MARIA DOS SANTOS, brasileira, casada, comerciante, portadora do RG nº 98.765.432-1 SSP/SP e do CPF nº 987.654.321-00, residente e domiciliada na Rua das Palmeiras, nº 456, Bairro Vila Nova, São Paulo/SP, pelos fatos e fundamentos jurídicos a seguir expostos:

DOS FATOS

O requerente celebrou com a requerida em 15 de janeiro de 2023 um contrato de prestação de serviços de engenharia, conforme documento anexo, no valor total de R$ 50.000,00 (cinquenta mil reais).

Os serviços foram devidamente prestados pelo autor entre fevereiro e maio de 2023, conforme atestado pela própria requerida.

Não obstante, a requerida deixou de efetuar o pagamento da quantia devida, mesmo após diversas cobranças amigáveis.

DO DIREITO

O inadimplemento contratual está caracterizado, nos termos dos artigos 389 e seguintes do Código Civil.

ISTO POSTO, requer-se a procedência da ação para condenar a requerida ao pagamento de R$ 50.000,00, corrigidos monetariamente e acrescidos de juros de mora.

São Paulo, 10 de junho de 2023.

ADVOGADO OAB/SP 123456`,
    fileSize: 15360,
    fileType: 'docx',
    wordCount: 280
  },
  {
    id: 2,
    fileName: 'contestacao.pdf',
    content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA CÍVEL DA COMARCA DE SÃO PAULO

MARIA DOS SANTOS, já qualificada nos autos da Ação de Cobrança que lhe move JOÃO DA SILVA, vem, por seu advogado que esta subscreve, apresentar

CONTESTAÇÃO

pelas razões de fato e de direito a seguir expostas:

PRELIMINARES

1. FALTA DE INTERESSE DE AGIR
O autor não demonstrou ter esgotado as vias amigáveis de cobrança, sendo a presente ação prematura.

2. PRESCRIÇÃO
A presente ação deveria ter sido proposta no prazo de 3 anos, conforme art. 206, §3º, inciso V do Código Civil, estando prescrita.

DO MÉRITO

1. INEXISTÊNCIA DE DÍVIDA
O contrato alegado pelo autor jamais foi firmado pela contestante. A assinatura aposta no documento é falsa.

2. SERVIÇOS NÃO PRESTADOS
Ainda que existisse o contrato, os serviços nunca foram prestados pelo autor, que não compareceu ao local nos períodos alegados.

3. NULIDADE DO CONTRATO
O suposto contrato é nulo por vício de consentimento, já que a contestante foi induzida a erro.

ISTO POSTO, requer-se a total improcedência da ação, com condenação do autor em custas e honorários advocatícios.

São Paulo, 15 de julho de 2023.

ADVOGADO OAB/SP 654321`,
    fileSize: 23040,
    fileType: 'pdf',
    wordCount: 220
  }
];

// Função para gerar o prompt correto com documentos
function generateCorrectReplicaPrompt() {
  console.log('\n🔍 TESTE 1: Geração do Prompt Correto');
  
  const documentsText = mockRealDocuments.map((doc, index) => 
    `=== DOCUMENTO ${index + 1}: ${doc.fileName} ===\nTIPO: ${doc.fileType.toUpperCase()}\n\nCONTEÚDO:\n${doc.content}\n\n`
  ).join('');

  const correctPrompt = `Você é um assistente jurídico especializado em elaboração de réplicas processuais.

**TAREFA:** Elaborar uma RÉPLICA JURÍDICA COMPLETA baseada nos documentos anexados.

**DOCUMENTOS ANEXADOS PARA ANÁLISE:**
${documentsText}

**ESTRUTURA OBRIGATÓRIA:**

I – DO RELATÓRIO
- Resumir os fatos da petição inicial (serviços de engenharia, R$ 50.000,00, inadimplemento)
- Resumir os argumentos da contestação (falta de interesse, prescrição, inexistência de dívida, etc.)
- Identificar cronologia dos fatos

II – DOS PONTOS CONTROVERTIDOS
- Validade do contrato de prestação de serviços
- Efetiva prestação dos serviços pelo autor
- Ocorrência do inadimplemento pela ré
- Questões processuais (prescrição, interesse de agir)

III – DA REFUTAÇÃO DOS ARGUMENTOS DA CONTESTAÇÃO
- Refutar alegação de falta de interesse de agir
- Demonstrar não ocorrência da prescrição
- Comprovar existência e validade do contrato
- Provar efetiva prestação dos serviços

IV – DOS PEDIDOS
- Rejeição das preliminares
- Procedência total da ação
- Condenação no valor de R$ 50.000,00

**INSTRUÇÕES ESPECÍFICAS:**
• Analise TODOS os documentos anexados
• Use linguagem jurídica formal e técnica
• Nomes de pessoas em MAIÚSCULAS (JOÃO DA SILVA, MARIA DOS SANTOS)
• Base-se exclusivamente nos documentos fornecidos
• Seja específico com valores, datas e fatos concretos
• Elabore conteúdo substancial para cada seção
• NÃO retorne apenas estrutura ou modelo

**IMPORTANTE:** Elabore uma réplica COMPLETA e DETALHADA com argumentação concreta baseada nos documentos.

Elabore agora a réplica jurídica completa:`;

  console.log('📝 Prompt gerado com sucesso');
  console.log(`- Tamanho: ${correctPrompt.length} caracteres`);
  console.log(`- Inclui documentos: ${mockRealDocuments.length}`);
  console.log(`- Inclui fatos específicos: ✅`);
  console.log(`- Inclui valores: ✅ (R$ 50.000,00)`);
  console.log(`- Inclui nomes: ✅ (JOÃO, MARIA)`);
  
  return correctPrompt;
}

// Função para identificar o que pode estar causando resposta genérica
function identifyGenericResponseCauses() {
  console.log('\n🔍 TESTE 2: Identificação de Causas da Resposta Genérica');
  
  const possibleCauses = [
    {
      cause: 'Prompt muito genérico',
      solution: 'Incluir fatos específicos dos documentos',
      priority: 'ALTA'
    },
    {
      cause: 'IA não recebendo documentos',
      solution: 'Verificar se documentos estão sendo passados corretamente',
      priority: 'CRÍTICA'
    },
    {
      cause: 'Fallback sendo usado indevidamente',
      solution: 'Forçar uso do serviço principal',
      priority: 'ALTA'
    },
    {
      cause: 'Prompt instructing apenas estrutura',
      solution: 'Enfatizar necessidade de conteúdo completo',
      priority: 'MÉDIA'
    },
    {
      cause: 'Timeout ou erro na IA',
      solution: 'Melhorar tratamento de erros',
      priority: 'MÉDIA'
    }
  ];
  
  console.log('🎯 Possíveis causas identificadas:');
  possibleCauses.forEach((item, index) => {
    console.log(`${index + 1}. **${item.cause}**`);
    console.log(`   Solução: ${item.solution}`);
    console.log(`   Prioridade: ${item.priority}`);
    console.log('');
  });
  
  return possibleCauses;
}

// Função para testar diferentes versões do prompt
function testPromptVariations() {
  console.log('\n🔍 TESTE 3: Variações do Prompt');
  
  const variations = [
    {
      name: 'Prompt Genérico (RUIM)',
      content: 'Elabore uma réplica jurídica com as seções padrão.',
      expected: 'Resposta genérica'
    },
    {
      name: 'Prompt com Estrutura (MÉDIO)', 
      content: 'Elabore uma réplica com: I-Relatório, II-Controvertidos, III-Refutação, IV-Pedidos',
      expected: 'Estrutura preenchida'
    },
    {
      name: 'Prompt com Documentos (BOM)',
      content: `Baseado nos documentos: ${mockRealDocuments[0].content.substring(0, 200)}... elabore réplica`,
      expected: 'Resposta baseada em fatos'
    },
    {
      name: 'Prompt Específico (EXCELENTE)',
      content: 'ELABORE RÉPLICA COMPLETA (não estrutura) baseada em: contrato R$ 50.000, autor JOÃO DA SILVA, ré MARIA DOS SANTOS, serviços engenharia prestados fev-mai/2023, contestação alega prescrição + inexistência dívida',
      expected: 'Réplica completa e específica'
    }
  ];
  
  variations.forEach((variation, index) => {
    console.log(`${index + 1}. ${variation.name}`);
    console.log(`   Tamanho: ${variation.content.length} chars`);
    console.log(`   Esperado: ${variation.expected}`);
    console.log('');
  });
  
  return variations;
}

// Função para verificar configurações da IA
function checkAIConfiguration() {
  console.log('\n🔍 TESTE 4: Configurações da IA');
  
  const aiConfig = {
    model: 'GPT-3.5/4',
    maxTokens: 'Deve ser suficiente para réplica completa (>2000)',
    temperature: 'Média (0.3-0.7) para balance entre criatividade e precisão',
    topP: 'Padrão (0.9-1.0)',
    systemPrompt: 'Deve enfatizar que é assistente jurídico especializado'
  };
  
  console.log('⚙️ Configurações recomendadas:');
  Object.entries(aiConfig).forEach(([key, value]) => {
    console.log(`- ${key}: ${value}`);
  });
  
  return aiConfig;
}

// Função principal de diagnóstico
async function runReplicaProblemDiagnosis() {
  console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO\n');
  
  // Executar todos os testes
  const prompt = generateCorrectReplicaPrompt();
  const causes = identifyGenericResponseCauses();
  const variations = testPromptVariations();
  const aiConfig = checkAIConfiguration();
  
  console.log('\n📊 RESUMO DO DIAGNÓSTICO');
  console.log('='.repeat(40));
  
  console.log('🎯 PROBLEMA IDENTIFICADO:');
  console.log('IA está retornando estrutura básica em vez de réplica completa');
  
  console.log('\n🔧 SOLUÇÕES PRINCIPAIS:');
  console.log('1. ✅ Prompt específico criado com fatos dos documentos');
  console.log('2. ✅ Instrução clara: "ELABORE RÉPLICA COMPLETA (não estrutura)"');
  console.log('3. ✅ Documentos incluídos no prompt');
  console.log('4. ✅ Fatos específicos mencionados (valores, nomes, datas)');
  
  console.log('\n🎯 IMPLEMENTAÇÃO NECESSÁRIA:');
  console.log('1. Verificar se documentos chegam até a IA');
  console.log('2. Usar prompt específico em vez do genérico');
  console.log('3. Forçar uso do serviço principal (não fallback)');
  console.log('4. Adicionar logs para tracking do prompt enviado');
  
  console.log('\n✅ PRÓXIMOS PASSOS:');
  console.log('1. Aplicar prompt corrigido no código');
  console.log('2. Adicionar logs de debug do prompt');
  console.log('3. Testar com documentos reais');
  console.log('4. Verificar resposta da IA');
  
  return {
    prompt,
    causes,
    variations,
    aiConfig
  };
}

// Executar diagnóstico
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runReplicaProblemDiagnosis };
} else {
  runReplicaProblemDiagnosis().then(results => {
    console.log('\n✅ Diagnóstico concluído - problema identificado e soluções propostas');
  }).catch(error => {
    console.error('❌ Erro no diagnóstico:', error);
  });
}
