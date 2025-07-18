# Debug: Prompt Réplica Não Solicita Documentos

## 🔍 Problema Reportado
O prompt de "Réplica" não está avisando que precisa de documentos, mesmo após as correções implementadas.

## 🔧 Investigação Realizada

### 1. Verificação da Configuração
✅ **Prompt "replica" está na lista MANDATORY_DOCUMENT**
- Localização: `src/services/promptDocumentConfig.js`
- Lista: `'replica'` está incluído nos prompts obrigatórios
- Função: `requiresMandatoryDocument` implementada corretamente

### 2. Verificação do Fluxo
✅ **Funções de verificação estão conectadas**
- `promptRequiresDocument` → `requiresMandatoryDocument`
- `ChatInterface.checkDocumentRequirement` → `promptRequiresDocument`
- Fluxo de chamadas está correto

### 3. Implementação de Debug
🔧 **Logs de debug adicionados:**
- `promptDocumentConfig.js`: Logs condicionais com `window.DEBUG_PROMPTS`
- `ChatInterface.jsx`: Logs de verificação de estado
- Debug não polui console em produção (apenas se ativado)

## 🧪 Scripts de Teste Criados

### 1. `ATIVAR_DEBUG_REPLICA.js`
- Ativa debug: `window.DEBUG_PROMPTS = true`
- Instruções para teste manual
- Função para desativar: `window.disableDebug()`

### 2. `TESTE_FLUXO_REPLICA_COMPLETO.js`
- Teste completo do fluxo de identificação
- Simulação da criação do prompt
- Verificação manual da função `requiresMandatoryDocument`

### 3. `TESTE_REPLICA_DEBUG.js`
- Teste específico para o prompt Réplica
- Debug detalhado da função de verificação
- Análise de cada condição de match

## 🎯 Como Diagnosticar

### Passo 1: Ativar Debug
```javascript
// No console do navegador
window.DEBUG_PROMPTS = true;
```

### Passo 2: Teste Manual
1. Ir para Dashboard > Juri.IA
2. Clicar em "Novo Chat"
3. Procurar por "Réplica"
4. Selecionar o prompt
5. Observar logs no console

### Passo 3: Analisar Logs
**Logs esperados:**
```
🔍 requiresMandatoryDocument: { originalId: "replica", originalName: "Réplica", ... }
✅ MATCH encontrado: "replica" com prompt ID: "replica", Nome: "réplica"
📊 Resultado final para "Réplica" (replica): OBRIGATÓRIO
🔍 ChatInterface checkDocumentRequirement chamada para: { id: "replica", name: "Réplica", ... }
📊 Resultados das verificações: { requiresDocument: true, ... }
✅ Documento obrigatório detectado, configurando estados...
✅ Exibindo upload de documento
```

## 🔧 Possíveis Causas se Não Funcionar

### 1. ID do Prompt Diferente
- **Verificar**: O ID gerado pode ser diferente de "replica"
- **Solução**: Verificar `createPromptFromFileName` no `promptService.js`

### 2. Cache do Navegador
- **Verificar**: Arquivo atualizado pode não ter carregado
- **Solução**: Hard refresh (Ctrl+Shift+R) ou limpar cache

### 3. Ordem de Carregamento
- **Verificar**: Funções podem não estar disponíveis na inicialização
- **Solução**: Verificar imports e ordem de execução

### 4. Estado Inicial
- **Verificar**: Chat existente pode ter estados conflitantes
- **Solução**: Sempre testar com "Novo Chat"

## 📊 Resultado Esperado

### ✅ Comportamento Correto
1. **Seleção do prompt "Réplica"**
2. **Sistema detecta documento obrigatório**
3. **Exibe automaticamente campo de upload**
4. **Mostra mensagem específica:**
   ```
   📝 Elaboração de Tríplica/Réplica
   
   Para elaborar uma réplica eficaz, preciso dos documentos da contestação:
   - Contestação da parte contrária
   - Petição inicial original
   - Documentos juntados pela defesa
   - Provas apresentadas
   ```

### ❌ Se Não Funcionar
- Campo de upload não aparece
- Sem mensagem específica sobre documento
- Logs de debug mostram `requiresDocument: false`

## 🚀 Próximos Passos

1. **Execute o debug** usando os scripts fornecidos
2. **Analise os logs** para identificar onde está falhando
3. **Reporte os resultados** dos logs para diagnóstico adicional
4. **Se necessário**, ajustes específicos serão feitos baseados nos logs

---

**Status:** 🔄 Debug implementado, aguardando teste manual  
**Scripts:** 3 scripts de teste criados  
**Logs:** Sistema de debug condicional implementado  
**Próximo:** Executar teste manual com debug ativo
