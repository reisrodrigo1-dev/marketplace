// Serviço para integração com calendários
// Suporta Google Calendar, Outlook e calendários nativos do dispositivo

// Função para gerar link do Google Calendar
export const generateGoogleCalendarLink = (evento) => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  
  const params = new URLSearchParams({
    text: evento.titulo,
    dates: `${formatDateForCalendar(evento.dataInicio)}/${formatDateForCalendar(evento.dataFim)}`,
    details: evento.descricao,
    location: evento.local || '',
    ctz: 'America/Sao_Paulo'
  });
  
  return `${baseUrl}&${params.toString()}`;
};

// Função para gerar link do Outlook
export const generateOutlookLink = (evento) => {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  
  const params = new URLSearchParams({
    subject: evento.titulo,
    startdt: formatDateForOutlook(evento.dataInicio),
    enddt: formatDateForOutlook(evento.dataFim),
    body: evento.descricao,
    location: evento.local || ''
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Função para gerar arquivo .ics (padrão universal)
export const generateICSFile = (evento) => {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DireitoHub//Processo Calendar//PT
BEGIN:VEVENT
UID:${evento.id}@direitohub.com
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(evento.dataInicio)}
DTEND:${formatDateForICS(evento.dataFim)}
SUMMARY:${evento.titulo}
DESCRIPTION:${evento.descricao}
LOCATION:${evento.local || ''}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${evento.titulo}
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

// Função para baixar arquivo .ics
export const downloadICSFile = (evento, nomeArquivo) => {
  const icsContent = generateICSFile(evento);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo || `audiencia-${evento.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Função para detectar calendário nativo do dispositivo
export const addToNativeCalendar = (evento) => {
  // Tenta usar a API nativa do navegador se disponível
  if ('calendar' in navigator) {
    return navigator.calendar.createEvent({
      title: evento.titulo,
      start: evento.dataInicio,
      end: evento.dataFim,
      description: evento.descricao,
      location: evento.local || ''
    });
  }
  
  // Fallback para arquivo .ics
  downloadICSFile(evento);
};

// Função para criar evento de audiência a partir de um processo
export const criarEventoAudiencia = (processo) => {
  if (!processo.nextHearing) {
    throw new Error('Processo não possui data de audiência');
  }

  const dataAudiencia = new Date(processo.nextHearing);
  const dataFim = new Date(dataAudiencia.getTime() + 2 * 60 * 60 * 1000); // 2 horas de duração padrão

  return {
    id: processo.id,
    titulo: `Audiência - ${processo.title}`,
    dataInicio: dataAudiencia,
    dataFim: dataFim,
    descricao: `Audiência do processo ${processo.number}
    
Cliente: ${processo.client}
Tribunal: ${processo.court}
Status: ${processo.status}
Prioridade: ${processo.priority}

Descrição: ${processo.description}

Gerado automaticamente pelo DireitoHub`,
    local: processo.court || 'A definir'
  };
};

// Função para criar evento de prazo processual
export const criarEventoPrazo = (processo, prazo) => {
  const dataPrazo = new Date(prazo.data);
  const dataFim = new Date(dataPrazo.getTime() + 1 * 60 * 60 * 1000); // 1 hora de duração padrão

  return {
    id: `${processo.id}-prazo-${prazo.id}`,
    titulo: `Prazo - ${prazo.descricao}`,
    dataInicio: dataPrazo,
    dataFim: dataFim,
    descricao: `Prazo processual - ${processo.title}
    
Processo: ${processo.number}
Cliente: ${processo.client}
Tribunal: ${processo.court}
Prazo: ${prazo.descricao}

Gerado automaticamente pelo DireitoHub`,
    local: processo.court || 'A definir'
  };
};

// Função para criar evento de lembrete para processos sem audiência
export const criarEventoLembrete = (processo) => {
  const agora = new Date();
  const proximaSegunda = new Date(agora);
  proximaSegunda.setDate(agora.getDate() + (1 + 7 - agora.getDay()) % 7);
  proximaSegunda.setHours(9, 0, 0, 0);
  
  const dataFim = new Date(proximaSegunda.getTime() + 1 * 60 * 60 * 1000);

  return {
    id: `${processo.id}-lembrete`,
    titulo: `Lembrete - ${processo.title}`,
    dataInicio: proximaSegunda,
    dataFim: dataFim,
    descricao: `Lembrete para acompanhar o processo ${processo.number}
    
Cliente: ${processo.client}
Tribunal: ${processo.court}
Status: ${processo.status}
Prioridade: ${processo.priority}

Descrição: ${processo.description}

Sugestão: Verificar andamento do processo e próximos passos.

Gerado automaticamente pelo DireitoHub`,
    local: processo.court || 'A definir'
  };
};

// Função para criar evento de consulta jurídica
export const criarEventoConsulta = (agendamento) => {
  const dataConsulta = new Date(agendamento.appointmentDate);
  const dataFim = new Date(dataConsulta.getTime() + 1 * 60 * 60 * 1000); // 1 hora de duração padrão

  return {
    id: `consulta-${agendamento.id}`,
    titulo: `Consulta Jurídica - ${agendamento.clientName}`,
    dataInicio: dataConsulta,
    dataFim: dataFim,
    descricao: `Consulta Jurídica Agendada
    
Cliente: ${agendamento.clientName}
Email: ${agendamento.clientEmail}
Telefone: ${agendamento.clientPhone || 'Não informado'}
Valor: R$ ${agendamento.finalPrice || agendamento.estimatedPrice}

Descrição do caso:
${agendamento.caseDescription}

${agendamento.videoCallLink ? `Link da videochamada: ${agendamento.videoCallLink}` : ''}

Status: ${agendamento.status}
Gerado automaticamente pelo DireitoHub`,
    local: agendamento.videoCallLink ? 'Online - Videochamada' : 'A definir'
  };
};

// Funções auxiliares para formatação de datas

// Formato para Google Calendar (YYYYMMDDTHHMMSSZ)
const formatDateForCalendar = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Formato para Outlook
const formatDateForOutlook = (date) => {
  return new Date(date).toISOString();
};

// Formato para ICS (YYYYMMDDTHHMMSSZ)
const formatDateForICS = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Função para abrir opções de calendário
export const mostrarOpcoesCalendario = (evento) => {
  const opcoes = [
    {
      nome: 'Google Calendar',
      acao: () => window.open(generateGoogleCalendarLink(evento), '_blank'),
      icone: '📅'
    },
    {
      nome: 'Outlook',
      acao: () => window.open(generateOutlookLink(evento), '_blank'),
      icone: '📧'
    },
    {
      nome: 'Baixar .ics',
      acao: () => downloadICSFile(evento),
      icone: '📁'
    },
    {
      nome: 'Calendário do dispositivo',
      acao: () => addToNativeCalendar(evento),
      icone: '📱'
    }
  ];
  
  return opcoes;
};

// Função para verificar se um processo tem audiência
export const temAudiencia = (processo) => {
  return processo.nextHearing && new Date(processo.nextHearing) > new Date();
};

// Função para verificar se um processo tem prazos
export const temPrazos = (processo) => {
  return processo.prazos && processo.prazos.length > 0;
};

// Export default
export default {
  generateGoogleCalendarLink,
  generateOutlookLink,
  generateICSFile,
  downloadICSFile,
  addToNativeCalendar,
  criarEventoAudiencia,
  criarEventoLembrete,
  criarEventoPrazo,
  criarEventoConsulta,
  mostrarOpcoesCalendario,
  temAudiencia,
  temPrazos
};

// Importar o serviço do Firestore
import { calendarFirestore } from '../firebase/firestore';

// Serviço para gerenciar calendário e agenda no Firestore
export const calendarStorageService = {
  // Criar novo evento/compromisso
  async createEvent(userId, eventData) {
    try {
      const result = await calendarFirestore.createEvent(userId, eventData);
      return result;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter eventos do usuário
  async getEvents(userId, date) {
    try {
      const result = await calendarFirestore.getEvents(userId, date);
      return result;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar evento
  async updateEvent(eventId, eventData) {
    try {
      const result = await calendarFirestore.updateEvent(eventId, eventData);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletar evento
  async deleteEvent(eventId) {
    try {
      const result = await calendarFirestore.deleteEvent(eventId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      return { success: false, error: error.message };
    }
  },

  // Criar novo processo
  async createProcess(userId, processData) {
    try {
      const result = await calendarFirestore.createProcess(userId, processData);
      return result;
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter processos do usuário
  async getProcesses(userId, date) {
    try {
      const result = await calendarFirestore.getProcesses(userId, date);
      return result;
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar processo
  async updateProcess(processId, processData) {
    try {
      const result = await calendarFirestore.updateProcess(processId, processData);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletar processo
  async deleteProcess(processId) {
    try {
      const result = await calendarFirestore.deleteProcess(processId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar processo:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter eventos e processos próximos (lembretes)
  async getUpcomingItems(userId, daysAhead = 7) {
    try {
      const result = await calendarFirestore.getUpcomingItems(userId, daysAhead);
      return result;
    } catch (error) {
      console.error('Erro ao buscar itens próximos:', error);
      return { success: false, error: error.message };
    }
  },

  // Buscar eventos e processos por termo
  async searchItems(userId, searchTerm) {
    try {
      const result = await calendarFirestore.searchItems(userId, searchTerm);
      return result;
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter estatísticas do calendário
  async getCalendarStats(userId) {
    try {
      const result = await calendarFirestore.getCalendarStats(userId);
      return result;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { success: false, error: error.message };
    }
  }
};
