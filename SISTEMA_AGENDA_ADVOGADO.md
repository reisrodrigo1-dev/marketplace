# Sistema de Agenda do Advogado - DireitoHub

## Visão Geral

Este documento descreve a implementação do sistema de agenda automática para advogados no DireitoHub, que integra com o sistema de agendamentos e permite que consultas pagas sejam automaticamente adicionadas à agenda do advogado.

## Funcionalidades Implementadas

### 1. Adição Automática à Agenda

Quando um cliente efetua o pagamento de uma consulta:
- O agendamento é automaticamente inserido na agenda do advogado
- Um evento é criado na collection `events` do Firestore
- O evento contém todas as informações da consulta
- O agendamento é marcado com `addedToCalendar: true`

### 2. Visualização na Agenda

Na tela **Agenda** do advogado (AdminDashboard):
- Consultas aparecem com um ícone especial (👥)
- Cor diferenciada (roxo) para destacar consultas
- Indicador verde para novas consultas
- Informações detalhadas quando o evento é selecionado

### 3. Exportação para Agenda Pessoal

O advogado pode exportar qualquer consulta para sua agenda pessoal através de:
- **Google Calendar**: Link direto para adicionar evento
- **Outlook**: Link direto para Outlook online
- **Arquivo .ics**: Download para importar em qualquer agenda
- **Calendário do dispositivo**: Uso da API nativa quando disponível

## Arquitetura Técnica

### Estrutura de Dados

#### Collection: `events`
```javascript
{
  id: "event_id",
  userId: "lawyer_id", // ID do advogado
  title: "Consulta - Nome do Cliente",
  description: "Detalhes da consulta...",
  date: "2025-01-15", // Data no formato YYYY-MM-DD
  time: "14:00", // Horário de início
  endTime: "15:00", // Horário de fim
  type: "consulta", // Tipo do evento
  appointmentId: "appointment_id", // Referência ao agendamento
  clientName: "Nome do Cliente",
  clientEmail: "cliente@email.com",
  videoCallLink: "https://meet.google.com/...",
  amount: 150.00, // Valor da consulta
  status: "confirmado",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Campo adicional em `appointments`
```javascript
{
  // ... campos existentes
  calendarEventId: "event_id", // Referência ao evento na agenda
  addedToCalendar: true // Flag indicando se foi adicionado
}
```

### Fluxo de Dados

1. **Cliente efetua pagamento** → `PaymentModal`
2. **Pagamento confirmado** → `appointmentService.confirmPayment()`
3. **Evento criado automaticamente** → `addToLawyerCalendar()`
4. **Evento aparece na agenda** → `Calendar` component
5. **Advogado pode exportar** → `handleExportToPersonalCalendar()`

## Componentes Modificados

### 1. `src/firebase/firestore.js`

**Método adicionado:**
- `addToLawyerCalendar()`: Cria evento na agenda do advogado

**Método modificado:**
- `confirmPayment()`: Agora chama automaticamente `addToLawyerCalendar()`

### 2. `src/components/Calendar.jsx`

**Funcionalidades adicionadas:**
- Visualização especial para consultas
- Botão de exportação para agenda pessoal
- Modal de seleção de calendário
- Indicadores visuais para novas consultas

### 3. `src/components/PaymentModal.jsx`

**Adição:**
- Informação sobre adição automática à agenda
- Esclarecimentos sobre o fluxo pós-pagamento

## Como Usar

### Para o Cliente

1. Agendar consulta através da página do advogado
2. Aguardar aprovação do advogado
3. Efetuar pagamento quando solicitado
4. Receber confirmação de que a consulta foi adicionada à agenda do advogado

### Para o Advogado

1. Aprovar agendamentos pendentes
2. Aguardar pagamento do cliente
3. Verificar na aba **Agenda** as novas consultas
4. Clicar no ícone de exportação (📅) para adicionar à agenda pessoal
5. Escolher entre Google Calendar, Outlook, arquivo .ics ou calendário nativo

## Configurações de Exportação

### Google Calendar
- URL: `https://calendar.google.com/calendar/render?action=TEMPLATE`
- Parâmetros: título, data/hora, descrição, localização
- Timezone: America/Sao_Paulo

### Outlook
- URL: `https://outlook.live.com/calendar/0/deeplink/compose`
- Formato de data: ISO 8601
- Suporte a lembretes automáticos

### Arquivo .ics
- Padrão: RFC 5545 (iCalendar)
- Compatível com: Apple Calendar, Thunderbird, etc.
- Inclui: VALARM para lembretes

## Melhorias Futuras

### Funcionalidades Planejadas

1. **Notificações Automáticas**
   - Email para advogado quando nova consulta é adicionada
   - Push notifications no navegador
   - SMS/WhatsApp (opcional)

2. **Sincronização Bidirecional**
   - Importar eventos da agenda pessoal
   - Detectar conflitos de horário
   - Sugestão de reagendamento

3. **Integração com Calendários Corporativos**
   - Microsoft Exchange
   - Google Workspace
   - Caldav/CardDAV

4. **Analytics de Agenda**
   - Relatório de consultas realizadas
   - Tempo médio de consulta
   - Receita por período

### Otimizações Técnicas

1. **Performance**
   - Cache de eventos frequentes
   - Paginação para agendas extensas
   - Lazy loading de componentes

2. **Segurança**
   - Validação adicional de permissões
   - Logs de auditoria
   - Criptografia de dados sensíveis

3. **UX/UI**
   - Drag-and-drop para reagendar
   - Visualização em semana/dia
   - Filtros avançados

## Troubleshooting

### Problemas Comuns

1. **Evento não aparece na agenda**
   - Verificar se pagamento foi confirmado
   - Checar logs do Firebase
   - Validar permissões do usuário

2. **Exportação não funciona**
   - Verificar bloqueador de pop-ups
   - Testar em navegador diferente
   - Verificar permissões de download

3. **Dados inconsistentes**
   - Verificar integridade da collection `events`
   - Checar sincronização entre `appointments` e `events`
   - Executar script de limpeza se necessário

### Logs e Monitoramento

- Logs no console do navegador
- Firebase Console para erros de Firestore
- Google Analytics para métricas de uso

## Conclusão

O sistema de agenda automática melhora significativamente a experiência do advogado ao:

1. **Automatizar** a adição de consultas pagas
2. **Centralizar** todos os compromissos em uma única interface
3. **Facilitar** a exportação para agendas pessoais
4. **Reduzir** erros manuais e esquecimentos
5. **Aumentar** a produtividade e organização

A implementação é robusta, escalável e segue as melhores práticas de desenvolvimento, proporcionando uma base sólida para futuras expansões do sistema.
