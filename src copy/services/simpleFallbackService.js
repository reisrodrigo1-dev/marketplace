// Serviço simplificado para gerar resultados sem dependência da API OpenAI
// Temporário para resolver o problema do "undefined"

export const generateSimpleFinalResult = (promptType, collectedData) => {
  console.log('🎯 Gerando resultado simplificado...', {
    promptType: promptType?.name,
    collectedDataLength: collectedData?.length || 0
  });

  try {
    if (!collectedData || !Array.isArray(collectedData) || collectedData.length === 0) {
      return {
        success: true,
        message: `# ${promptType?.name || 'Documento Jurídico'}

## ⚠️ Nenhuma Informação Coletada

Não foram coletadas informações suficientes para gerar o resultado.

**Recomendação:** Reinicie a conversa e forneça as informações solicitadas.`,
        isFallback: true
      };
    }

    const promptTypeName = promptType?.name || 'Documento Jurídico';
    const date = new Date().toLocaleDateString('pt-BR');

    // Organizar as informações coletadas
    const formattedInfo = collectedData.map((item, index) => {
      const question = item.question || `Pergunta ${index + 1}`;
      const answer = item.answer || 'Não informado';
      return `### ${index + 1}. ${question.replace(/^Pergunta \d+:\s*/, '')}
**Resposta:** ${answer}`;
    }).join('\n\n');

    // Criar resumo das informações
    const summary = collectedData.map(item => `• ${item.answer || 'Não informado'}`).join('\n');

    const result = `# ${promptTypeName}
*Gerado em ${date}*

## 📋 Informações Coletadas

${formattedInfo}

---

## 📝 Resumo das Informações

${summary}

---

## 🎯 Próximos Passos

Com base nas informações coletadas acima, você pode:

1. **Revisar todas as informações** fornecidas
2. **Consultar a legislação** específica aplicável
3. **Pesquisar jurisprudência** relevante
4. **Elaborar o documento** conforme o modelo padrão
5. **Adaptar o conteúdo** às especificidades do caso

---

## ⚙️ Configuração da IA

Para obter um resultado mais detalhado e personalizado:

1. **Obtenha uma API Key** da OpenAI em: https://platform.openai.com/api-keys
2. **Configure no arquivo .env**: \`VITE_OPENAI_API_KEY=sua_chave_aqui\`
3. **Reinicie o servidor** e tente novamente

---

*Resultado gerado pelo DireitoHub - Sistema Jurídico Inteligente*`;

    console.log('✅ Resultado simplificado gerado com sucesso');

    return {
      success: true,
      message: result,
      isFallback: true
    };

  } catch (error) {
    console.error('❌ Erro ao gerar resultado simplificado:', error);
    
    return {
      success: true,
      message: `# Erro ao Processar Informações

Ocorreu um erro inesperado ao processar as informações coletadas.

**Erro:** ${error.message}

**Recomendação:** 
- Tente reiniciar a conversa
- Verifique se todas as informações foram fornecidas corretamente

**Suporte:** Consulte a documentação do sistema ou entre em contato com o suporte técnico.

---

*Sistema DireitoHub - ${new Date().toLocaleDateString('pt-BR')}*`,
      isFallback: true,
      isError: true
    };
  }
};
