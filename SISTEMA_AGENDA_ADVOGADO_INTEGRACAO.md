# Sistema de Integração com Agenda do Advogado

## Visão Geral

Sistema para permitir que advogados adicionem agendamentos confirmados/pagos diretamente às suas agendas pessoais (Google Calendar, Outlook, calendário nativo do dispositivo).

## Funcionalidades Implementadas

### 1. Botão "Adicionar à Agenda"

- **Localização**: Tela de agendamentos do advogado (`LawyerAppointments.jsx`)
- **Visibilidade**: Aparece apenas para agendamentos com status `pago` ou `confirmado`
- **Função**: Abrir modal com opções de integração com diferentes calendários

### 2. Modal de Integração com Calendário

**Componente**: Modal dentro de `LawyerAppointments.jsx`

**Opções Disponíveis**:
- Google Calendar (link direto)
- Microsoft Outlook (link direto)
- Download de arquivo .ics (compatível com qualquer calendário)

**Informações do Evento**:
- Título: "Consulta Jurídica - [Nome do Cliente]"
- Data/Hora: Data e hora do agendamento
- Duração: 1 hora (padrão)
- Descrição: Dados completos do cliente e descrição do caso
- Local: Link da videochamada (se disponível)

### 3. Serviço de Calendário Atualizado

**Arquivo**: `src/services/calendarService.js`

**Nova Função**: `criarEventoConsulta(agendamento)`
- Cria objeto de evento formatado para consultas jurídicas
- Inclui informações completas do cliente e do caso
- Formata descrição com dados estruturados
- Define local como "Online - Videochamada" quando há link

## Integração com Calendários

### Google Calendar
```javascript
const evento = criarEventoConsulta(agendamento);
const googleLink = generateGoogleCalendarLink(evento);
window.open(googleLink, '_blank');
```

### Microsoft Outlook
```javascript
const evento = criarEventoConsulta(agendamento);
const outlookLink = generateOutlookLink(evento);
window.open(outlookLink, '_blank');
```

### Arquivo .ics (Universal)
```javascript
const evento = criarEventoConsulta(agendamento);
const icsContent = generateICSFile(evento);
downloadICSFile(icsContent, `consulta-${cliente}.ics`);
```

## Fluxo de Uso

1. **Advogado acessa** lista de agendamentos
2. **Visualiza agendamentos** com status `pago` ou `confirmado`
3. **Clica em "Adicionar à Agenda"** no agendamento desejado
4. **Escolhe plataforma** de calendário (Google, Outlook ou arquivo)
5. **Evento é criado** automaticamente com todas as informações
6. **Confirmação** e fechamento do modal

## Estrutura do Evento Criado

```
Título: Consulta Jurídica - [Nome do Cliente]
Data/Hora: [Data e hora do agendamento]
Duração: 1 hora
Local: Online - Videochamada (se há link) ou "A definir"

Descrição:
Consulta Jurídica Agendada

Cliente: [Nome]
Email: [Email]
Telefone: [Telefone]
Valor: R$ [Valor]

Descrição do caso:
[Descrição fornecida pelo cliente]

Link da videochamada: [Link se disponível]

Status: [Status atual]
Gerado automaticamente pelo DireitoHub
```

## Benefícios

### Para o Advogado
- **Organização**: Todos os compromissos em um só lugar
- **Lembretes**: Notificações automáticas do calendário
- **Sincronização**: Integração com agenda pessoal/profissional
- **Mobilidade**: Acesso via dispositivos móveis
- **Backup**: Informações salvas na nuvem

### Para o Workflow
- **Eficiência**: Processo automatizado de agendamento
- **Redução de Erros**: Informações copiadas automaticamente
- **Consistência**: Formato padronizado de eventos
- **Flexibilidade**: Múltiplas opções de calendário

## Implementação Técnica

### Arquivos Modificados
- `src/components/LawyerAppointments.jsx`: Adição do botão e modal
- `src/services/calendarService.js`: Nova função `criarEventoConsulta`

### Dependências
- Funções existentes do `calendarService`
- Estados de agendamento já implementados
- Modal system do React

### Estados Adicionados
```javascript
const [showCalendarModal, setShowCalendarModal] = useState(false);
const [selectedAppointmentForCalendar, setSelectedAppointmentForCalendar] = useState(null);
```

### Funções Adicionadas
```javascript
const handleAddToCalendar = (appointment) => { ... }
const closeCalendarModal = () => { ... }
```

## Próximas Melhorias

### Funcionalidades Futuras
1. **Duração personalizada**: Permitir alterar duração da consulta
2. **Lembretes customizados**: Configurar lembretes específicos
3. **Recorrência**: Agendamentos recorrentes
4. **Sincronização bidirecional**: Atualizar status quando evento for modificado no calendário
5. **Agenda integrada**: Visualizar agenda diretamente no DireitoHub

### Integrações Avançadas
1. **API Google Calendar**: Integração direta (requer autenticação)
2. **API Outlook**: Integração direta via Microsoft Graph
3. **Webhooks**: Notificações automáticas de mudanças
4. **CalDAV**: Protocolo universal de calendários

## Considerações de Segurança

### Dados Sensíveis
- Informações do cliente são incluídas na descrição do evento
- Links de videochamada são expostos no calendário
- Dados ficam salvos na conta de calendário do advogado

### Privacidade
- Advogado tem controle total sobre quais eventos adicionar
- Informações só são enviadas quando advogado confirma ação
- Dados não são armazenados em serviços terceiros pelo DireitoHub

## Status de Implementação

✅ **Concluído**:
- Botão "Adicionar à Agenda" na lista de agendamentos
- Modal com opções de calendário
- Integração com Google Calendar
- Integração com Outlook
- Download de arquivo .ics
- Função `criarEventoConsulta` no calendarService

🔄 **Em desenvolvimento**: Nenhum item pendente

📋 **Planejado**:
- Melhorias de UX baseadas em feedback
- Integrações avançadas com APIs
- Funcionalidades adicionais conforme necessidade

---

**Documentação criada em**: 17 de julho de 2025  
**Última atualização**: 17 de julho de 2025  
**Versão**: 1.0  
**Status**: Implementado e funcional
