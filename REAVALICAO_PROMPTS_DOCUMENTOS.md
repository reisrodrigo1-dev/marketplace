# Reavaliação de Prompts do Juri.IA - Documentos Obrigatórios

## 📋 Análise Realizada

Reavaliamos todos os prompts da pasta `public/prompts` e identificamos vários que precisam **obrigatoriamente** de documentos mas não estavam configurados para solicitá-los.

## 🔧 Correções Implementadas

### 1. Prompts Movidos para "DOCUMENTO OBRIGATÓRIO"

| Prompt | Problema Anterior | Correção |
|--------|-------------------|----------|
| **Réplica** | Era opcional | ✅ Agora obrigatório - precisa da contestação |
| **Contrarrazões Cível-Família** | Era opcional | ✅ Agora obrigatório - precisa das razões de apelação |
| **Contrarrazões de Apelação Criminal** | Era opcional | ✅ Agora obrigatório - precisa das razões de apelação |
| **Contrarrazões de Recurso Especial** | Era opcional | ✅ Agora obrigatório - precisa do recurso especial |
| **Contrarrazões de Recurso Extraordinário** | Era opcional | ✅ Agora obrigatório - precisa do recurso extraordinário |
| **Razões de RESE** | Era opcional | ✅ Agora obrigatório - precisa do acórdão e documentos |
| **Despacho Judicial** | Não precisava | ✅ Agora obrigatório - precisa das petições para despachar |
| **Correções e Sugestões de Peças** | Não estava listado | ✅ Agora obrigatório - precisa da peça original |

### 2. Mensagens Específicas Adicionadas

```javascript
// Réplica
"Para elaborar uma réplica eficaz, preciso dos documentos da contestação:
- Contestação da parte contrária
- Petição inicial original
- Documentos juntados pela defesa
- Provas apresentadas"

// Contrarrazões
"Para elaborar contrarrazões consistentes, preciso do recurso da parte contrária:
- Recurso (apelação/especial/extraordinário)
- Razões de recurso
- Acórdão recorrido
- Documentos relevantes do processo"

// Despacho Judicial
"Para elaborar despacho adequado, preciso das petições e documentos:
- Petições das partes
- Documentos juntados
- Manifestações processuais
- Histórico do processo"
```

## 📊 Configuração Final

### 🔴 DOCUMENTOS OBRIGATÓRIOS (33 prompts)
- Análise de laudos médicos
- Análise de PECs
- Correção de português
- Memoriais (todos os tipos)
- Relatórios e resumos
- **Réplica** ← NOVO
- **Contrarrazões** (todos os tipos) ← NOVO
- **Razões de RESE** ← NOVO
- **Despacho Judicial** ← NOVO
- Acrescentar/rebater argumentos
- Maximizar impacto retórico
- Ementas e dosimetria

### 🟡 DOCUMENTOS OPCIONAIS (11 prompts)
- Contestação
- Habeas Corpus
- Liberdade Provisória
- Apelações
- Agravo de Instrumento
- Inicial de Alimentos
- Quesitos
- Projeto de Lei
- Perguntas para audiência

### 🟢 SEM DOCUMENTOS (6 prompts)
- Busca de Jurisprudência
- Inserir Fundamentos Legais
- Linguagem Simples
- Localizar Endereços
- Atualizar Valores pelo CC

## 🎯 Impacto das Mudanças

### ✅ Benefícios
1. **Réplica agora funcional** - Antes gerava texto genérico, agora analisa a contestação específica
2. **Contrarrazões eficazes** - Agora rebate especificamente os argumentos do recurso
3. **Despachos precisos** - Baseados nas petições reais apresentadas
4. **Melhor qualidade** - Respostas mais específicas e fundamentadas

### 🔄 Funcionamento
- **Automatismo**: Sistema detecta automaticamente e solicita documentos
- **Mensagens específicas**: Cada tipo de prompt tem orientação personalizada
- **Validação**: Impede prosseguir sem documento quando obrigatório
- **Flexibilidade**: Mantém opcionais onde faz sentido

## 🧪 Como Testar

### 1. Teste Réplica
1. Vá em Juri.IA > Novo Chat
2. Selecione "Réplica"
3. ✅ Deve solicitar upload da contestação
4. Anexe um documento de contestação
5. ✅ Deve gerar réplica específica baseada no documento

### 2. Teste Contrarrazões
1. Selecione qualquer tipo de "Contrarrazões"
2. ✅ Deve solicitar o recurso da parte contrária
3. Anexe documento do recurso
4. ✅ Deve gerar contrarrazões específicas

### 3. Teste Despacho Judicial
1. Selecione "Despacho Judicial"
2. ✅ Deve solicitar as petições
3. Anexe petições do processo
4. ✅ Deve gerar despacho fundamentado

## 📁 Arquivos Modificados

- ✅ `src/services/promptDocumentConfig.js` - Configuração atualizada
- ✅ Mensagens específicas para novos prompts obrigatórios
- ✅ `TESTE_PROMPTS_DOCUMENTOS.js` - Script de validação

## 🔍 Validação

Execute o script `TESTE_PROMPTS_DOCUMENTOS.js` no console do navegador para verificar que todos os prompts estão corretamente configurados.

---

**Status:** ✅ Implementado e testado  
**Data:** 18/07/2025  
**Prompts corrigidos:** Réplica, Contrarrazões, Razões de RESE, Despacho Judicial  
**Impacto:** Sistema agora solicita documentos corretamente para todos os prompts que precisam
