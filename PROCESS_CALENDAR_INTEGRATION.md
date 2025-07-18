# Integração Automática de Processos com Calendário

## Funcionalidade Implementada

A integração automática permite que as datas importantes dos processos sejam automaticamente adicionadas ao calendário do sistema, eliminando a necessidade de entrada manual.

## Como Funciona

### 1. Sincronização Automática
- **Ao carregar processos**: Quando os processos são carregados do Firebase, o sistema automaticamente sincroniza com o calendário
- **Ao salvar processo**: Quando um processo é criado ou atualizado, suas datas são automaticamente adicionadas ao calendário
- **Ao importar do DataJud**: Processos importados do DataJud têm suas movimentações e prazos automaticamente sincronizados

### 2. Tipos de Eventos Criados

#### Audiências
- **Origem**: Campo `nextHearing` do processo
- **Tipo**: Processo no calendário
- **Categoria**: 'hearing'
- **Título**: "Audiência - [Título do Processo]"
- **Prioridade**: Baseada na prioridade do processo

#### Prazos Processuais
- **Origem**: Prazos nas movimentações do DataJud
- **Tipo**: Processo no calendário
- **Categoria**: 'deadline'
- **Título**: "Prazo - [Tipo do Prazo]"
- **Prioridade**: Sempre alta (prazos são críticos)

#### Movimentações Importantes
- **Origem**: Movimentações do DataJud com palavras-chave importantes
- **Tipo**: Processo no calendário
- **Categoria**: 'movement'
- **Título**: "[Nome da Movimentação] - [Título do Processo]"
- **Prioridade**: Média

### 3. Palavras-chave para Movimentações Importantes
- audiência
- julgamento
- sentença
- decisão
- prazo
- intimação
- citação
- mandado
- perícia
- despacho

## Interface do Usuário

### 1. Botão Global
- **Localização**: Barra de ferramentas superior
- **Ação**: "Sincronizar Calendário"
- **Função**: Sincroniza todos os processos com o calendário

### 2. Botões Individuais
- **Localização**: Cada card de processo
- **Ação**: Ícone de sincronização
- **Função**: Sincroniza apenas aquele processo específico

### 3. Sincronização Automática
- **Carregar processos**: Automático após carregar da base de dados
- **Salvar processo**: Automático após criar/atualizar
- **Importar DataJud**: Automático após importar

## Estrutura dos Dados

### Evento de Audiência
```javascript
{
  title: "Audiência - Ação de Cobrança",
  description: "Audiência do processo 1234567-89.2024.8.26.0001\nCliente: Maria Silva\nTribunal: 1ª Vara Cível - SP",
  date: "2024-08-15",
  time: "14:00",
  category: "hearing",
  priority: "high",
  processNumber: "1234567-89.2024.8.26.0001",
  client: "Maria Silva",
  court: "1ª Vara Cível - SP",
  reminder: "60",
  isFromProcess: true
}
```

### Evento de Prazo
```javascript
{
  title: "Prazo - Contestação",
  description: "Prazo do processo 1234567-89.2024.8.26.0001\nContestação\nTribunal: 1ª Vara Cível - SP",
  date: "2024-07-30",
  time: "09:00",
  category: "deadline",
  priority: "high",
  processNumber: "1234567-89.2024.8.26.0001",
  client: "Maria Silva",
  court: "1ª Vara Cível - SP",
  reminder: "60",
  isFromProcess: true
}
```

## Prevenção de Duplicatas

### Verificação de Eventos Existentes
- O sistema verifica se já existe um evento para a mesma data e processo
- Compara: data + número do processo + tipo de evento
- Não cria duplicatas se já existir

### Flag de Identificação
- Eventos criados automaticamente têm `isFromProcess: true`
- Permite identificar e gerenciar eventos vindos de processos
- Facilita remoção quando processo é excluído

## Funções do Serviço

### `extractImportantDates(processData)`
- Extrai todas as datas importantes de um processo
- Retorna array com informações formatadas para o calendário

### `syncProcessWithCalendar(userId, processData)`
- Sincroniza um processo específico com o calendário
- Verifica duplicatas antes de criar eventos
- Retorna estatísticas de sincronização

### `syncAllProcesses(userId, processes)`
- Sincroniza todos os processos de uma vez
- Processa em lote para melhor performance
- Retorna estatísticas globais

### `removeProcessFromCalendar(userId, processNumber)`
- Remove todos os eventos de um processo do calendário
- Usado quando processo é excluído
- Identifica eventos pela flag `isFromProcess`

## Configurações Padrão

### Lembretes
- **Audiências**: 1 hora antes (60 minutos)
- **Prazos**: 1 hora antes (60 minutos)
- **Movimentações**: 1 hora antes (60 minutos)

### Horários
- **Audiências**: Usa horário da movimentação do DataJud
- **Prazos**: 09:00 (padrão)
- **Movimentações**: 09:00 (padrão)

### Prioridades
- **Audiências**: Baseada na prioridade do processo
- **Prazos**: Sempre alta
- **Movimentações**: Média

## Feedback ao Usuário

### Mensagens de Sucesso
- "✅ X eventos foram adicionados ao calendário automaticamente!"
- "✅ X eventos criados no calendário para o processo [número]"

### Mensagens de Informação
- "📅 Sincronização concluída: X eventos criados de Y processos"
- "🗑️ X eventos do processo foram removidos do calendário!"

### Logs de Debug
- Todos os logs usam emojis para fácil identificação
- Informações detalhadas no console para desenvolvimento

## Benefícios

### 1. Automação
- Eliminação de entrada manual de datas
- Sincronização automática ao importar do DataJud
- Atualização automática quando processos mudam

### 2. Organização
- Todas as datas importantes em um só lugar
- Visão unificada de audiências e prazos
- Lembretes automáticos

### 3. Eficiência
- Redução de erros humanos
- Economia de tempo
- Melhor gestão de prazos

### 4. Integração
- Conecta processos com calendário
- Dados consistentes entre sistemas
- Sincronização bidirecional

## Limitações Atuais

### 1. DataJud
- Depende da estrutura de dados do DataJud
- Nem todos os tribunais têm dados completos
- Movimentações podem não ter datas futuras

### 2. Formatos de Data
- Assume formato padrão do DataJud
- Pode precisar ajustes para outros formatos
- Fuso horário padrão Brasil

### 3. Duplicatas
- Verificação básica por data + processo + tipo
- Não detecta mudanças de horário
- Pode criar duplicatas se processo for reimportado

## Próximos Passos

### 1. Melhorias
- Detectar mudanças de horário/data
- Sincronização bidirecional (calendário → processo)
- Notificações push para prazos

### 2. Configurações
- Permitir personalizar horários padrão
- Configurar tipos de lembrete
- Escolher quais movimentações sincronizar

### 3. Relatórios
- Dashboard de prazos perdidos
- Estatísticas de audiências
- Análise de produtividade

---

*Sistema desenvolvido para automatizar a gestão de datas processuais no DireitoHub*
