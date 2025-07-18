# Sistema de Calendário/Agenda - DireitoHub

## Visão Geral

O sistema de calendário/agenda foi desenvolvido para permitir que os usuários do DireitoHub gerenciem seus compromissos e processos de forma organizada e eficiente. 

## Componentes Criados

### 1. Calendar.jsx
- **Função**: Componente principal do calendário
- **Recursos**:
  - Visualização mensal do calendário
  - Navegação entre meses
  - Clique em datas para selecionar
  - Exibição de eventos e processos por data
  - Botões para criar novos compromissos e processos
  - Detalhes da data selecionada

### 2. EventModal.jsx
- **Função**: Modal para criar/editar compromissos
- **Campos**:
  - Título (obrigatório)
  - Categoria (reunião, audiência, prazo, cliente, pessoal, outro)
  - Data e hora (obrigatórios)
  - Prioridade (baixa, média, alta)
  - Local
  - Participantes
  - Lembrete (15min, 30min, 1h, 1dia, 1semana)
  - Descrição

### 3. ProcessModal.jsx
- **Função**: Modal para criar/editar processos
- **Campos**:
  - Título (obrigatório)
  - Número do processo (obrigatório)
  - Tribunal (obrigatório)
  - Tipo (audiência, prazo, protocolo, julgamento, recurso, sentença)
  - Status (pendente, em andamento, concluído, cancelado, adiado)
  - Data e hora
  - Cliente
  - Parte contrária
  - Advogado responsável
  - Juiz
  - Assunto
  - Prioridade
  - Lembrete
  - Observações

## Serviços

### calendarService.js
- **Função**: Serviço para integrações externas e gerenciamento local
- **Funcionalidades existentes**:
  - Geração de links para Google Calendar
  - Geração de links para Outlook
  - Geração de arquivos .ics
  - Integração com calendários nativos

- **Funcionalidades adicionadas**:
  - `calendarStorageService`: Gerenciamento no Firestore
  - CRUD completo para eventos e processos
  - Busca por termos
  - Estatísticas do calendário
  - Itens próximos (lembretes)

## Firestore

### Estrutura do Banco de Dados

#### Coleção: `events`
```javascript
{
  id: string,
  userId: string,
  title: string,
  description: string,
  date: string, // YYYY-MM-DD
  time: string, // HH:MM
  category: string,
  priority: string,
  location: string,
  attendees: string,
  reminder: string, // minutos
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Coleção: `processes`
```javascript
{
  id: string,
  userId: string,
  title: string,
  processNumber: string,
  court: string,
  description: string,
  date: string, // YYYY-MM-DD
  time: string, // HH:MM
  type: string,
  status: string,
  client: string,
  opposingParty: string,
  lawyer: string,
  judge: string,
  subject: string,
  priority: string,
  reminder: string, // minutos
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Funcionalidades Implementadas

### 1. Visualização do Calendário
- ✅ Calendário mensal com grid de 7x6
- ✅ Navegação entre meses (anterior/próximo)
- ✅ Botão "Hoje" para voltar ao mês atual
- ✅ Destacar dia atual
- ✅ Exibir eventos e processos em cada dia
- ✅ Indicador de "mais itens" quando há muitos eventos

### 2. Gestão de Compromissos
- ✅ Criar novo compromisso
- ✅ Editar compromisso existente
- ✅ Excluir compromisso
- ✅ Categorização por tipo
- ✅ Definição de prioridade
- ✅ Sistema de lembretes

### 3. Gestão de Processos
- ✅ Criar novo processo
- ✅ Editar processo existente
- ✅ Excluir processo
- ✅ Controle de status
- ✅ Informações detalhadas (cliente, tribunal, etc.)
- ✅ Sistema de lembretes

### 4. Interação com Datas
- ✅ Clique em data para seleção
- ✅ Exibição detalhada da data selecionada
- ✅ Lista de eventos e processos por data
- ✅ Ações rápidas (editar/excluir)

### 5. Persistência de Dados
- ✅ Armazenamento no Firestore
- ✅ Sincronização em tempo real
- ✅ Suporte a múltiplos usuários
- ✅ Backup automático

## Integração com o Sistema

### AdminDashboard.jsx
- O calendário foi integrado como uma nova aba "Agenda"
- Acessível através do menu lateral
- Componente carregado dinamicamente quando selecionado

### Autenticação
- Sistema integrado com o contexto de autenticação existente
- Dados separados por usuário
- Verificação de permissões

## Recursos Avançados (Preparados para Implementação)

### 1. Estatísticas
- Contagem de eventos por mês
- Contagem de processos por mês
- Itens do dia atual
- Métricas de produtividade

### 2. Busca e Filtros
- Busca por título, descrição, número do processo
- Filtros por categoria, status, prioridade
- Busca por cliente ou tribunal

### 3. Lembretes e Notificações
- Sistema de lembretes configuráveis
- Notificações próximas ao vencimento
- Integração com calendários externos

### 4. Relatórios
- Relatório de atividades por período
- Estatísticas de processos
- Exportação para PDF/Excel

## Como Usar

### 1. Acessar o Calendário
1. Entre no sistema DireitoHub
2. No menu lateral, clique em "Agenda"
3. O calendário será carregado com o mês atual

### 2. Criar Compromisso
1. Clique no botão "Novo Compromisso"
2. Preencha os campos obrigatórios (título, data, hora)
3. Configure categoria, prioridade e lembretes
4. Clique em "Criar Compromisso"

### 3. Criar Processo
1. Clique no botão "Novo Processo"
2. Preencha os campos obrigatórios (título, número, tribunal, data)
3. Configure tipo, status e informações adicionais
4. Clique em "Criar Processo"

### 4. Editar/Excluir Itens
1. Clique no item desejado no calendário
2. Ou selecione uma data e veja os detalhes
3. Use os botões de editar (✏️) ou excluir (🗑️)

### 5. Navegação
- Use as setas ← → para navegar entre meses
- Clique em "Hoje" para voltar ao mês atual
- Clique em qualquer data para ver detalhes

## Próximos Passos

1. **Implementar notificações**: Sistema de alertas para lembretes
2. **Visualizações alternativas**: Semana, dia, lista
3. **Sincronização externa**: Google Calendar, Outlook
4. **Relatórios avançados**: Dashboards e métricas
5. **App mobile**: Versão para dispositivos móveis
6. **Compartilhamento**: Calendários colaborativos
7. **Importação**: Importar eventos de arquivos .ics

## Tecnologias Utilizadas

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase Firestore
- **Autenticação**: Firebase Auth
- **Estado**: React Hooks (useState, useEffect)
- **Componentes**: Modais, Formulários, Calendário

## Segurança

- Dados isolados por usuário
- Validação de entrada
- Proteção contra SQL injection
- Autenticação obrigatória
- Regras de segurança do Firestore

---

*Sistema desenvolvido para o DireitoHub - Plataforma de Gestão Jurídica*
