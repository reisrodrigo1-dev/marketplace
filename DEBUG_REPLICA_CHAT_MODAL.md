# Debug: Réplica Não Mostra Documento Obrigatório no "Criar Novo Chat"

## 🔍 Problema Atual
Mesmo após correções, o prompt "Réplica" não está mostrando que precisa de documentos na tela "Criar Novo Chat".

## 🔧 Debug Implementado

### 1. Logs Adicionados
- **ChatCreationModal.jsx**: Debug condicional para prompt "Réplica" 
- **promptDocumentConfig.js**: Debug da função `requiresMandatoryDocument`
- **ChatInterface.jsx**: Debug do `checkDocumentRequirement`

### 2. Scripts de Debug Criados
- `ATIVAR_DEBUG_CHAT_MODAL.js` ← **Use este primeiro**
- `DEBUG_CHAT_CREATION_MODAL.js` ← Debug detalhado do modal
- `TESTE_CORRECAO_REPLICA.js` ← Teste da correção anterior

## 🧪 Como Diagnosticar

### Passo 1: Ativar Debug
```javascript
// Execute no console ANTES de abrir "Novo Chat"
window.DEBUG_PROMPTS = true;
```

### Passo 2: Testar Modal
1. Ir para Dashboard > Juri.IA
2. Clicar em "Novo Chat"
3. Procurar prompt "Réplica"
4. Observar logs no console

### Passo 3: Analisar Logs

#### ✅ Logs Esperados (se funcionando):
```
🔍 requiresMandatoryDocument: { originalId: "replica", originalName: "Réplica" }
✅ MATCH encontrado: "replica" com prompt ID: "replica"
📊 Resultado final para "Réplica" (replica): OBRIGATÓRIO
🔍 DEBUG ChatCreationModal - getDocumentInfo para Réplica: { requiresMandatory: true }
✅ DocumentInfo criado para Réplica: { type: "mandatory", icon: "📄" }
```

#### ❌ Problemas Possíveis:
1. **Nenhum log aparece**: Prompt não está sendo carregado ou tem ID diferente
2. **Log aparece mas `requiresMandatory: false`**: Problema na função de detecção
3. **Log correto mas sem badge visual**: Problema de renderização/CSS

### Passo 4: Verificar Visualmente

#### ✅ Resultado Esperado:
- Badge vermelho "📄 Documento obrigatório" no canto do prompt
- Texto "Requer documento para funcionar" abaixo da descrição
- Fundo vermelho claro (bg-red-50)

#### ❌ Se Não Aparecer:
- Verificar se outro prompt (ex: "Analisar laudos médicos") mostra o badge
- Comparar comportamentos entre prompts que funcionam e que não funcionam

## 🔧 Possíveis Causas e Soluções

### 1. Cache do Navegador
**Problema**: Arquivos atualizados não carregaram
**Solução**: 
- Hard refresh: Ctrl+Shift+R
- Limpar cache do navegador
- Reabrir aba/navegador

### 2. ID do Prompt Diferente
**Problema**: Prompt "Réplica" tem ID diferente de "replica"
**Verificação**: Logs mostrarão o ID real
**Solução**: Ajustar lista MANDATORY_DOCUMENT

### 3. Ordem de Carregamento
**Problema**: Funções não estão disponíveis quando modal carrega
**Verificação**: Logs não aparecem ou aparecem null/undefined
**Solução**: Verificar imports e inicialização

### 4. Função de Detecção
**Problema**: `requiresMandatoryDocument` retorna false incorretamente
**Verificação**: Log mostra `requiresMandatory: false`
**Solução**: Debug detalhado da função de match

### 5. Renderização
**Problema**: Lógica funciona mas interface não mostra
**Verificação**: Logs corretos mas sem badge visual
**Solução**: Verificar CSS, condicionais de renderização

## 📊 Próximos Passos

1. **Execute `ATIVAR_DEBUG_CHAT_MODAL.js`** no console
2. **Teste o modal** "Criar Novo Chat"
3. **Colete os logs** que aparecem no console
4. **Reporte os resultados** - especialmente:
   - Se logs aparecem ou não
   - Qual o ID real do prompt Réplica
   - Se `requiresMandatory` é true ou false
   - Se badge aparece visualmente

5. **Com base nos logs**, faço correção específica

## 🎯 Fluxo de Debug

```
[1] Ativar Debug → [2] Abrir Modal → [3] Observar Logs → [4] Verificar Visual → [5] Reportar
```

---

**Status**: 🔄 Debug implementado, aguardando teste  
**Scripts**: 3 scripts de debug criados  
**Foco**: Identificar se é problema de detecção, carregamento ou renderização
