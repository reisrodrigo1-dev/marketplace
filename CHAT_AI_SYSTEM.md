# Sistema de Chat AI - Juri.AI

## Visão Geral

O sistema de Chat AI do DireitoHub permite aos advogados criarem chats especializados baseados em prompts jurídicos específicos. Cada chat utiliza inteligência artificial avançada com contexto especializado para diferentes áreas e necessidades jurídicas.

## Funcionalidades Implementadas

### 1. Dashboard Principal
- **Visão geral**: Estatísticas de chats ativos, assistentes disponíveis e tecnologia utilizada
- **Assistentes populares**: Grid com os 6 assistentes mais utilizados
- **Chats recentes**: Lista dos últimos 3 chats criados
- **Navegação**: Botões para criar novo chat e acessar histórico

### 2. Criação de Chats
- **Modal de seleção**: Interface para escolher tipo de assistente
- **Filtros**: Busca por nome/descrição e filtro por categoria
- **Carregamento dinâmico**: Sistema que carrega prompts baseado nos arquivos disponíveis
- **Visualização**: Cards com ícones, descrições e categorias

### 3. Interface de Chat
- **Chat individual**: Interface dedicada para cada conversa
- **Integração IA**: Conexão com inteligência artificial usando prompts especializados
- **Histórico**: Persistência de mensagens no localStorage
- **UX otimizada**: Scroll automático, indicadores de loading, suporte a Shift+Enter

### 4. Histórico de Chats
- **Listagem**: Todos os chats criados pelo usuário
- **Pesquisa**: Busca por título ou tipo de assistente
- **Gerenciamento**: Opções para abrir ou deletar chats
- **Informações**: Data/hora de criação e última atualização

## Arquitetura

### Componentes

#### 1. `JuriAI.jsx` (Principal)
- Gerencia o estado principal da aplicação
- Controla navegação entre views (dashboard, chat, histórico)
- Integra todos os sub-componentes

#### 2. `ChatCreationModal.jsx`
- Modal para seleção de assistente
- Filtros e busca
- Carregamento dinâmico de prompts

#### 3. `ChatInterface.jsx`
- Interface de chat individual
- Integração com IA
- Gerenciamento de mensagens

#### 4. `ChatHistory.jsx`
- Listagem de chats salvos
- Funcionalidades de pesquisa e exclusão

### Serviços

#### 1. `promptService.js`
- **`loadPromptFiles()`**: Carrega prompts dinamicamente baseado em arquivos
- **`createPromptFromFileName()`**: Cria objeto prompt a partir do nome do arquivo
- **Funções auxiliares**: Geração de descrições, ícones e categorias

#### 2. `aiService.js`
- **`sendMessageToAI()`**: Interface com API de IA
- **Configuração**: Modelo avançado, tokens e parâmetros
- **Contexto**: Sistema de prompts especializados por tipo

## Tipos de Assistentes

### Categorias Disponíveis
1. **Criminal**: Habeas Corpus, Liberdade Provisória, Apelação Criminal
2. **Trabalhista**: Apelação Trabalhista, Preparação de Audiência
3. **Cível**: Contestação, Réplica, Apelação Cível
4. **Família**: Alimentos, Processos de Família
5. **Recursos**: Apelação, Agravo, Contrarrazões
6. **Análise**: Laudos Médicos, PEC, Contradições
7. **Revisão**: Correção de Português, Linguagem Simples
8. **Pesquisa**: Jurisprudência, Busca Legal
9. **Memoriais**: Cível, Criminal, Trabalhista, Previdenciário
10. **Utilitários**: Localização de Endereços, Cálculos

### Exemplos de Prompts Especializados
- **Habeas Corpus**: Especializado em fundamentação constitucional e processual penal
- **Análise de Laudos**: Foco em medicina legal e interpretação técnica
- **Busca de Jurisprudência**: Pesquisa inteligente com filtros por tribunal e matéria
- **Correção de Português**: Revisão mantendo linguagem jurídica adequada

## Persistência de Dados

### localStorage
- **Chats**: Armazenados em `juriAI_chats` com estrutura:
  ```json
  {
    "id": 1234567890,
    "title": "Chat Habeas Corpus",
    "promptType": { /* objeto do tipo de prompt */ },
    "messages": [ /* array de mensagens */ ],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "lastUpdate": "2024-01-01T10:30:00.000Z"
  }
  ```

### Estrutura de Mensagens
```json
{
  "id": 1234567890,
  "role": "user|assistant",
  "content": "Texto da mensagem",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## Integração com IA

### Configuração
- **Modelo**: Juri.IA v1
- **Tokens máximos**: 4000
- **Temperatura**: 0.7 (equilibrio entre criatividade e precisão)
- **Sistema de prompts**: Contextualizado por tipo de assistente
- **Powered by**: BIPETech

### Exemplo de Prompt de Sistema
```
Você é um assistente jurídico especializado em Habeas Corpus. 
Você deve fornecer respostas precisas sobre direito processual penal, 
fundamentação constitucional e jurisprudência do STF/STJ. 
Sempre cite as leis, artigos e precedentes relevantes.
```

## Fluxo de Uso

### 1. Criação de Chat
1. Usuário clica em "Novo Chat"
2. Sistema carrega assistentes disponíveis
3. Usuário filtra/pesquisa assistente desejado
4. Sistema cria novo chat e redireciona para interface

### 2. Conversa
1. Usuário digita mensagem
2. Sistema envia para OpenAI com contexto especializado
3. Resposta é exibida na interface
4. Conversa é salva no localStorage

### 3. Gestão de Chats
1. Usuário acessa histórico
2. Pode pesquisar, abrir ou deletar chats
3. Sistema mantém persistência local

## Novo Fluxo de Execução de Prompts

### 1. Análise Inicial do Prompt
Quando um chat é criado, o sistema:
1. Carrega o conteúdo do arquivo de prompt específico
2. Envia para a IA analisar e solicitar informações necessárias
3. Apresenta ao advogado quais dados são necessários

### 2. Processamento com Prompt Específico
Na primeira mensagem do usuário:
1. Sistema captura as informações fornecidas
2. Combina com o template/prompt do arquivo
3. Envia para IA processar com contexto específico
4. Retorna resultado baseado no prompt especializado

### 3. Chat Contínuo
Após a primeira execução:
- Chat funciona normalmente
- Mantém contexto da especialização
- Permite refinamentos e ajustes

### Exemplo de Fluxo

#### Habeas Corpus
1. **Análise**: "Para elaborar seu habeas corpus, preciso dos dados do paciente, informações do processo, situação jurídica atual e fundamentos para o HC..."
2. **Informações do Usuário**: "Paciente: João Silva, CPF: 123.456.789-00, preso em flagrante por tráfico..."
3. **Processamento**: Sistema usa template de HC + informações fornecidas
4. **Resultado**: Petição completa de habeas corpus formatada e fundamentada

#### Contestação
1. **Análise**: "Para sua contestação, preciso dos dados do processo, informações do réu, resumo da inicial e estratégia defensiva..."
2. **Informações do Usuário**: "Processo nº 123, autor alega danos morais, réu: Empresa XYZ..."
3. **Processamento**: Sistema usa template de contestação + informações
4. **Resultado**: Contestação completa com preliminares e mérito

## Estrutura dos Arquivos de Prompt

### Formato Recomendado
```
# TÍTULO DO ASSISTENTE

## OBJETIVO
Descrição clara do que o prompt faz

## INFORMAÇÕES NECESSÁRIAS DO ADVOGADO
Lista detalhada de dados necessários

## ESTRUTURA DO RESULTADO
Como o resultado deve ser formatado

## FUNDAMENTAÇÃO JURÍDICA
Leis, artigos e jurisprudências aplicáveis

## MODELO DE RESPOSTA
Instruções específicas para a IA
```

### Benefícios do Novo Sistema
1. **Precisão**: Prompts específicos geram resultados mais precisos
2. **Estrutura**: Resultados seguem templates profissionais
3. **Eficiência**: Coleta de informações direcionada
4. **Consistência**: Padronização de respostas por área
5. **Especialização**: Cada assistente tem expertise específica

## Arquivos de Prompt Disponíveis

### Implementados
- `Habeas Corpus.txt` - Template para habeas corpus
- `contestacao.txt` - Template para contestações

### Em Desenvolvimento
- Todos os arquivos da pasta `/public/prompts/`
- Sistema carrega automaticamente novos arquivos
- Mapeamento automático de ID para nome do arquivo

## Melhorias Futuras

### Funcionalidades Planejadas
1. **Anexos**: Suporte a upload de documentos
2. **Exportação**: Salvar conversas em PDF/Word
3. **Colaboração**: Compartilhar chats com equipe
4. **Templates**: Modelos de perguntas por área
5. **Métricas**: Estatísticas de uso e eficácia

### Otimizações Técnicas
1. **Cache**: Sistema de cache para respostas frequentes
2. **Streaming**: Resposta em tempo real (OpenAI Streaming)
3. **Backup**: Sincronização com Firebase
4. **Offline**: Funcionalidades básicas offline

## Segurança e Privacidade

### Dados Sensíveis
- Chats são armazenados apenas localmente
- Não há sincronização automática com servidores
- Comunicação com IA é criptografada (HTTPS)

### Recomendações
- Não incluir dados pessoais sensíveis nas conversas
- Revisar periodicamente chats salvos
- Fazer backup manual de conversas importantes

## Suporte e Manutenção

### Logs e Debugging
- Erros são logados no console do navegador
- Sistema de fallback para lista estática de prompts
- Tratamento de erros de conexão com IA

### Atualizações
- Novos assistentes podem ser adicionados via arquivos na pasta `/public/prompts`
- Sistema carrega automaticamente novos prompts disponíveis
- Versioning mantém compatibilidade com chats existentes

## Sistema de Validação e Qualidade

### Validações Implementadas

#### 1. Validação de Input do Usuário
```javascript
// Validações básicas
- Comprimento mínimo: 20 caracteres
- Comprimento máximo: 5000 caracteres
- Tipo de dados: string válida

// Validações específicas por prompt
- Habeas Corpus: Dados do paciente obrigatórios
- Contestação: Dados do processo e autor obrigatórios
- Apelação: Informações sobre sentença/decisão obrigatórias
- Busca Jurisprudência: Tema/assunto obrigatório
```

#### 2. Sugestões Inteligentes
- Sistema sugere informações adicionais quando pertinente
- Considera contexto específico do tipo de prompt
- Orienta sobre urgência, prazos e documentos relevantes

#### 3. Tratamento de Erros
- Mensagens de erro claras e específicas
- Orientação sobre como corrigir informações
- Fallback para prompts não disponíveis

### Componentes de Interface

#### 1. LoadingSpinner
- Componente reutilizável para estados de carregamento
- Diferentes tamanhos e mensagens personalizadas
- Animação profissional

#### 2. Indicadores de Status
- Badge "Aguardando informações" durante primeira interação
- Mensagens contextuais no input
- Feedback visual para diferentes estados

#### 3. Validação em Tempo Real
- Validação antes de enviar para OpenAI
- Economia de tokens da API
- Experiência do usuário otimizada

### Configuração Centralizada

#### 1. aiConfig.js
```javascript
// Configurações OpenAI
- API Key e URL
- Modelos e parâmetros
- Tokens e temperatura por tipo de operação

// Configurações de Prompts
- Caminhos e extensões suportadas
- Cache e fallback

// Configurações de Storage
- Chaves do localStorage
- Limites e intervalos

// Configurações de Interface
- Limites de caracteres
- Timeouts e tentativas
```

### Arquivos de Prompt Estruturados

#### 1. Formato Padronizado
```
# TÍTULO DO ASSISTENTE
## OBJETIVO
## INFORMAÇÕES NECESSÁRIAS
## ESTRUTURA DO RESULTADO
## FUNDAMENTAÇÃO JURÍDICA
## MODELO DE RESPOSTA
```

#### 2. Exemplos Implementados
- `Habeas Corpus.txt` - Template completo
- `contestacao.txt` - Template completo
- Estrutura replicável para todos os tipos

### Benefícios da Implementação

#### 1. Qualidade Garantida
- Validação prévia evita resultados inadequados
- Templates específicos garantem estrutura profissional
- Contextualização adequada por área jurídica

#### 2. Eficiência Operacional
- Redução de tokens desperdiçados
- Processo direcionado de coleta de informações
- Reutilização de templates especializados

#### 3. Experiência do Usuário
- Orientação clara sobre informações necessárias
- Feedback imediato sobre adequação do input
- Interface intuitiva e profissional

#### 4. Escalabilidade
- Sistema modular e expansível
- Adição de novos prompts sem modificar código
- Configuração centralizada facilita manutenção

### Próximas Evoluções

#### 1. Funcionalidades Avançadas
- Upload de documentos para análise
- Integração com sistemas jurídicos
- Versionamento de templates
- Colaboração em equipe

#### 2. Melhorias Técnicas
- Cache inteligente de respostas
- Backup automático na nuvem
- Métricas de uso e eficácia
- Otimização de performance

#### 3. Expansão do Sistema
- Mais tipos de assistentes especializados
- Integração com jurisprudência em tempo real
- Sistema de aprovação de resultados
- Modelos fine-tuned para direito brasileiro

## Conclusão Final

O sistema de Chat AI do DireitoHub representa uma solução completa e profissional para assistência jurídica inteligente. Combina a flexibilidade da IA com a precisão de templates especializados, garantindo resultados de alta qualidade e experiência do usuário otimizada.

A implementação modular permite crescimento orgânico, enquanto as validações e configurações centralizadas garantem consistência e confiabilidade. O sistema está preparado para evoluir conforme as necessidades dos usuários e as possibilidades tecnológicas.

### Impacto Esperado
- **Produtividade**: Redução significativa no tempo de elaboração de peças
- **Qualidade**: Padronização e fundamentação adequada
- **Acessibilidade**: Democratização de ferramentas jurídicas avançadas
- **Inovação**: Pioneirismo na aplicação de IA no direito brasileiro

O DireitoHub está posicionado para transformar a prática jurídica através da inteligência artificial, mantendo sempre os padrões de qualidade e ética profissional.
