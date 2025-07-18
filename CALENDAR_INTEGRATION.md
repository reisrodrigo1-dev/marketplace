# Integração com Calendário - DireitoHub

## Funcionalidade Implementada

A funcionalidade de integração com calendário permite que os usuários adicionem automaticamente as audiências dos processos aos seus calendários pessoais.

## Características Principais

### 1. **Detecção Automática de Audiências**
- O sistema detecta automaticamente processos que possuem data de audiência
- Mostra um indicador visual nos processos com audiência
- Exibe um dashboard com próximas audiências

### 2. **Múltiplas Opções de Calendário**
- **Google Calendar**: Link direto para adicionar evento
- **Outlook**: Integração com Outlook Web/Desktop
- **Arquivo .ics**: Compatível com qualquer calendário
- **Calendário Nativo**: Para dispositivos móveis

### 3. **Informações Completas do Evento**
- **Título**: "Audiência - [Nome do Processo]"
- **Data e Hora**: Baseada na data de audiência do processo
- **Duração**: 2 horas (padrão)
- **Localização**: Tribunal/Vara responsável
- **Descrição**: Detalhes completos do processo
- **Lembrete**: 30 minutos antes da audiência

## Como Usar

### 1. **Adicionar Audiência ao Calendário**
```jsx
// Botão disponível em processos com audiência
<button onClick={() => openCalendarModal(process)}>
  Adicionar ao Calendário
</button>
```

### 2. **Dashboard de Audiências Próximas**
- Mostra até 5 próximas audiências
- Ordenadas por data
- Botão rápido para adicionar ao calendário
- Informações resumidas do processo

### 3. **Sugestão Automática**
- Quando um processo com audiência é salvo
- Sistema pergunta se deseja adicionar ao calendário
- Facilita o fluxo de trabalho

## Componentes Criados

### 1. **CalendarService** (`/src/services/calendarService.js`)
```javascript
// Principais funções
- generateGoogleCalendarLink()
- generateOutlookLink()
- generateICSFile()
- criarEventoAudiencia()
- mostrarOpcoesCalendario()
```

### 2. **CalendarModal** (`/src/components/CalendarModal.jsx`)
- Modal com opções de calendário
- Prévia do evento
- Tratamento de erros
- Interface responsiva

### 3. **ProcessesScreen** (Atualizado)
- Botão de calendário nos processos
- Dashboard de audiências próximas
- Sugestão automática
- Indicadores visuais

## Exemplos de Uso

### Criar Evento de Audiência
```javascript
import { criarEventoAudiencia } from '../services/calendarService';

const processo = {
  id: '1',
  title: 'Ação de Cobrança',
  number: '1234567-89.2024.8.26.0001',
  client: 'Maria Silva',
  court: '1ª Vara Cível - SP',
  nextHearing: '2024-08-15T14:00:00'
};

const evento = criarEventoAudiencia(processo);
```

### Gerar Links de Calendário
```javascript
import { generateGoogleCalendarLink, generateOutlookLink } from '../services/calendarService';

const googleLink = generateGoogleCalendarLink(evento);
const outlookLink = generateOutlookLink(evento);

// Abrir em nova aba
window.open(googleLink, '_blank');
window.open(outlookLink, '_blank');
```

### Baixar Arquivo .ics
```javascript
import { downloadICSFile } from '../services/calendarService';

downloadICSFile(evento, 'audiencia-processo-123.ics');
```

## Formatos Suportados

### 1. **Google Calendar**
- URL com parâmetros codificados
- Timezone: America/Sao_Paulo
- Formato de data: YYYYMMDDTHHMMSSZ

### 2. **Outlook**
- URL para Outlook Web
- Compatível com Outlook Desktop
- Formato ISO 8601

### 3. **Arquivo .ics (iCalendar)**
- Padrão RFC 5545
- Compatível com:
  - Apple Calendar
  - Google Calendar
  - Outlook
  - Thunderbird
  - Calendários móveis

## Benefícios

### 1. **Automatização**
- Reduz trabalho manual
- Evita esquecimento de audiências
- Integra com workflow existente

### 2. **Flexibilidade**
- Suporta múltiplos calendários
- Funciona em qualquer dispositivo
- Formato universal (.ics)

### 3. **Experiência do Usuário**
- Interface intuitiva
- Feedback visual
- Processo simplificado

## Limitações e Considerações

### 1. **Dependências**
- Requer data de audiência válida
- Funciona apenas com processos que têm `nextHearing`
- Timezone fixo (America/Sao_Paulo)

### 2. **Dispositivos Móveis**
- Calendário nativo pode variar por dispositivo
- Fallback para arquivo .ics
- Testado em iOS e Android

### 3. **Privacidade**
- Informações são adicionadas ao calendário pessoal
- Dados não são enviados para serviços externos
- Arquivo .ics é gerado localmente

## Futuras Melhorias

1. **Notificações Push**
2. **Sincronização Bidirecional**
3. **Calendário Compartilhado**
4. **Lembretes Personalizados**
5. **Integração com Agenda do Escritório**

## Instalação

Não requer instalação adicional. A funcionalidade está integrada ao sistema existente.

## Suporte

Para dúvidas ou problemas, verifique:
1. Se o processo possui `nextHearing` válido
2. Se o navegador permite downloads (para .ics)
3. Se popup blockers estão desabilitados
4. Se o calendário de destino está funcionando

---

*Implementado para DireitoHub - Sistema de Gestão Jurídica*
