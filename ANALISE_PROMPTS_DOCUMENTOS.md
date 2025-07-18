# ANÁLISE DE PROMPTS - NECESSIDADE DE DOCUMENTOS

## Resumo da Análise

Baseado na análise dos arquivos de prompt disponíveis no sistema DireitoHub, identifiquei três categorias de prompts em relação à necessidade de documentos:

---

## ✅ PROMPTS QUE **OBRIGATORIAMENTE** PRECISAM DE DOCUMENTOS (26 prompts)

### 📋 Análise de Documentos Existentes
- **Analisar laudos médicos** - Precisa dos laudos para análise
- **Analisar PEC** - Precisa do texto da PEC
- **Analisar PEC - Defensoria** - Precisa do texto da PEC
- **Depoimento da vítima x laudo médico** - Precisa de ambos documentos
- **Vítima x depoimento** - Precisa dos depoimentos

### ✏️ Correção e Revisão de Textos
- **Correção do Português e Sugestões para peças** - Precisa do texto original
- **Corrigir o Português e Deixar mais claro** - Precisa do texto original
- **Português mantendo a escrita** - Precisa do texto original

### 📝 Memoriais (baseados em processos existentes)
- **Memoriais - Ministério Público** - Precisa das peças processuais
- **Memoriais cível-consumidor** - Precisa das peças processuais
- **Memoriais criminais** - Precisa das peças processuais
- **Memoriais Previdenciários** - Precisa das peças processuais
- **Memoriais Trabalhistas** - Precisa das peças processuais

### 📊 Relatórios e Resumos
- **Relatório Criminal** - Precisa dos documentos do processo
- **Relatório para Contestação ou Réplica** - Precisa das peças processuais
- **Resumir processos criminais para a Defesa** - Precisa dos documentos do processo
- **Resume processos de família para audiências** - Precisa dos documentos do processo
- **Resumo para assistidos - DPE** - Precisa dos documentos do caso
- **Resumo para cliente** - Precisa dos documentos do caso

### 🎯 Análise e Estratégia
- **Encontrar contradições nos relatos das testemunhas** - Precisa dos depoimentos
- **Acrescentar Argumentos** - Precisa da peça original
- **Rebater argumentos** - Precisa dos argumentos a serem rebatidos
- **Maximizar o impacto retórico** - Precisa do texto original
- **Dosimetria da pena** - Precisa dos documentos do processo

### 🏛️ Ementas e Preparação
- **Ementa** - Precisa da decisão judicial
- **Ementa CNJ** - Precisa da decisão judicial
- **Preparação de audiência trabalhista - Reclamando** - Precisa dos documentos
- **Preparação de audiência trabalhista - reclamante** - Precisa dos documentos

---

## 📋 PROMPTS QUE **PODEM SE BENEFICIAR** DE DOCUMENTOS (17 prompts)

### ⚖️ Peças Processuais Principais
- **Contestação** - Pode usar a petição inicial como base
- **Habeas Corpus** - Pode usar decisões ou documentos do processo
- **Liberdade Provisória** - Pode usar documentos do processo
- **Inicial de Alimentos** - Pode usar documentos financeiros

### 🔄 Recursos
- **Agravo de instrumento** - Pode usar a decisão agravada
- **Apelação (Dir. Privado, exceto trabalhista)** - Pode usar a sentença
- **Apelação Criminal** - Pode usar a sentença
- **Apelação trabalhista** - Pode usar a sentença

### 📝 Contrarrazões
- **Contrarrazões cível-família** - Pode usar as razões da parte contrária
- **Contrarrazões de Apelação Criminal** - Pode usar as razões da apelação
- **Contrarrazões de Recurso Especial** - Pode usar o recurso especial
- **Contrarrazões de Recurso Extraordinário** - Pode usar o recurso extraordinário

### 🎯 Outras Peças
- **Réplica** - Pode usar a tríplica ou contestação
- **Razões de RESE** - Pode usar documentos processuais
- **Quesitos** - Pode usar documentos técnicos
- **Projeto de Lei** - Pode usar referências legislativas
- **Perguntas parte contrária ou testemunhas** - Pode usar depoimentos existentes

---

## ❌ PROMPTS QUE **GERALMENTE NÃO PRECISAM** DE DOCUMENTOS (8 prompts)

### 🔍 Pesquisa e Consulta
- **Busca de Jurisprudência** - Baseado em critérios de busca
- **Inserir fundamentos legais** - Baseado no tipo de caso
- **Inserir fundamentos legais - cpc** - Baseado no tipo de caso

### 🛠️ Ferramentas Auxiliares
- **Linguagem Simples** - Conversão de linguagem jurídica
- **Localizador de endereço** - Ferramenta de localização
- **Atualizar Valores pelo CC** - Cálculo automático
- **Despacho Judicial** - Modelo baseado em critérios

---

## 🔧 IMPLEMENTAÇÃO NO SISTEMA

### Funcionalidades Implementadas:

1. **Detecção Automática**: O sistema identifica automaticamente se um prompt precisa de documento
2. **Upload Inteligente**: Interface de upload aparece automaticamente para prompts obrigatórios
3. **Sugestão Opcional**: Para prompts que podem se beneficiar, mostra sugestão opcional
4. **Mensagens Personalizadas**: Cada tipo de prompt tem uma mensagem específica explicando que documento é necessário
5. **Validação de Arquivos**: Aceita .txt e .docx (máx. 10MB)
6. **Integração com IA**: Documentos anexados são incluídos no contexto enviado para a OpenAI

### Como Funciona:

1. **Usuário seleciona prompt** → Sistema verifica se precisa de documento
2. **Se obrigatório** → Mostra mensagem solicitando upload antes de prosseguir
3. **Se opcional** → Mostra dica sobre possível benefício e permite continuar
4. **Se não precisa** → Prossegue normalmente com perguntas
5. **Durante o chat** → IA pode solicitar documentos se achar necessário
6. **Na geração final** → Todos os documentos anexados são considerados

---

## 📊 ESTATÍSTICAS

- **Total de prompts analisados**: 51
- **Precisam obrigatoriamente de documentos**: 26 (51%)
- **Podem se beneficiar de documentos**: 17 (33%)
- **Não precisam de documentos**: 8 (16%)

**Conclusão**: A maioria dos prompts (84%) pode se beneficiar de documentos anexados, sendo que mais da metade (51%) realmente precisa de documentos para funcionar adequadamente.

---

*Análise realizada em 17/07/2025 - Sistema DireitoHub*
