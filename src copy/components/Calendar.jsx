import React, { useState, useEffect } from 'react';
import { calendarStorageService } from '../services/calendarService';
import { useAuth } from '../contexts/AuthContext';
import EventModal from './EventModal';
import ProcessModal from './ProcessModal';
import calendarService from '../services/calendarService';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Carregar eventos e processos ao montar o componente
  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user, currentDate]);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const [eventsResult, processesResult] = await Promise.all([
        calendarStorageService.getEvents(user.uid, currentDate),
        calendarStorageService.getProcesses(user.uid, currentDate)
      ]);

      if (eventsResult.success) {
        setEvents(eventsResult.data);
      }
      if (processesResult.success) {
        setProcesses(processesResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Gerar dias do mês para visualização
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  // Obter eventos de um dia específico
  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  // Obter processos de um dia específico
  const getProcessesForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return processes.filter(process => process.date === dateStr);
  };

  // Manipular clique em uma data
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Criar novo compromisso
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // Editar compromisso
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Criar novo processo
  const handleCreateProcess = () => {
    setSelectedProcess(null);
    setShowProcessModal(true);
  };

  // Editar processo
  const handleEditProcess = (process) => {
    setSelectedProcess(process);
    setShowProcessModal(true);
  };

  // Salvar compromisso
  const handleSaveEvent = async (eventData) => {
    try {
      let result;
      if (selectedEvent) {
        result = await calendarStorageService.updateEvent(selectedEvent.id, eventData);
      } else {
        result = await calendarStorageService.createEvent(user.uid, eventData);
      }

      if (result.success) {
        setShowEventModal(false);
        setSelectedEvent(null);
        loadCalendarData();
      }
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);
    }
  };

  // Salvar processo
  const handleSaveProcess = async (processData) => {
    try {
      let result;
      if (selectedProcess) {
        result = await calendarStorageService.updateProcess(selectedProcess.id, processData);
      } else {
        result = await calendarStorageService.createProcess(user.uid, processData);
      }

      if (result.success) {
        setShowProcessModal(false);
        setSelectedProcess(null);
        loadCalendarData();
      }
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
    }
  };

  // Excluir compromisso
  const handleDeleteEvent = async (eventId) => {
    try {
      const result = await calendarStorageService.deleteEvent(eventId);
      if (result.success) {
        loadCalendarData();
      }
    } catch (error) {
      console.error('Erro ao excluir compromisso:', error);
    }
  };

  // Excluir processo
  const handleDeleteProcess = async (processId) => {
    try {
      const result = await calendarStorageService.deleteProcess(processId);
      if (result.success) {
        loadCalendarData();
      }
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
    }
  };

  // Exportar evento para agenda pessoal
  const handleExportToPersonalCalendar = (event) => {
    const eventData = {
      id: event.id,
      titulo: event.title,
      dataInicio: new Date(`${event.date}T${event.time}`),
      dataFim: new Date(`${event.date}T${event.endTime || event.time}`),
      descricao: event.description || '',
      local: event.type === 'consulta' ? 'Videochamada' : ''
    };

    const opcoes = calendarService.mostrarOpcoesCalendario(eventData);
    
    // Criar modal personalizado para escolher a opção
    const modalDiv = document.createElement('div');
    modalDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modalDiv.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Adicionar à Agenda Pessoal</h3>
        <p class="text-gray-600 mb-4">Escolha como deseja adicionar este evento à sua agenda:</p>
        <div class="space-y-3">
          ${opcoes.map((opcao, index) => `
            <button 
              onclick="window.exportOption${index}()" 
              class="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="text-2xl mr-3">${opcao.icone}</span>
              <span class="font-medium text-gray-900">${opcao.nome}</span>
            </button>
          `).join('')}
        </div>
        <button 
          onclick="document.body.removeChild(this.closest('.fixed'))" 
          class="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
      </div>
    `;

    // Adicionar event listeners para as opções
    opcoes.forEach((opcao, index) => {
      window[`exportOption${index}`] = () => {
        opcao.acao();
        document.body.removeChild(modalDiv);
      };
    });

    document.body.appendChild(modalDiv);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const calendarDays = generateCalendarDays();

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                📅 Agenda
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hoje
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Novo Compromisso
              </button>
              <button
                onClick={handleCreateProcess}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Novo Processo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg">
            {dayNames.map(day => (
              <div key={day} className="bg-gray-50 py-3 px-4 text-center text-sm font-medium text-gray-900">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const dayEvents = getEventsForDay(date);
              const dayProcesses = getProcessesForDay(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    min-h-[120px] p-2 cursor-pointer bg-white hover:bg-gray-50 transition-colors
                    ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                    ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`
                      text-sm font-medium
                      ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                    `}>
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className={`
                          text-xs px-2 py-1 rounded truncate cursor-pointer relative
                          ${event.type === 'consulta' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            event.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}
                        `}
                      >
                        {event.type === 'consulta' ? '�' : '�📅'} {event.title}
                        {event.type === 'consulta' && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" title="Nova consulta"></span>
                        )}
                      </div>
                    ))}

                    {/* Processes */}
                    {dayProcesses.slice(0, 2).map(process => (
                      <div
                        key={process.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProcess(process);
                        }}
                        className="text-xs px-2 py-1 rounded truncate cursor-pointer bg-green-100 text-green-800"
                      >
                        ⚖️ {process.title}
                      </div>
                    ))}

                    {/* Show more indicator */}
                    {(dayEvents.length + dayProcesses.length) > 2 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{(dayEvents.length + dayProcesses.length) - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Events */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Compromissos</h4>
                <div className="space-y-2">
                  {getEventsForDay(selectedDate).map(event => (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        event.type === 'consulta' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">{event.title}</p>
                          {event.type === 'consulta' && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              Consulta
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{event.time}</p>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        {event.type === 'consulta' && event.clientEmail && (
                          <div className="text-xs text-gray-500 mt-2 space-y-1">
                            <p><strong>Cliente:</strong> {event.clientName}</p>
                            <p><strong>Email:</strong> {event.clientEmail}</p>
                            {event.amount && <p><strong>Valor:</strong> R$ {event.amount.toFixed(2).replace('.', ',')}</p>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {event.type === 'consulta' && event.videoCallLink && (
                          <a
                            href={event.videoCallLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            title="Entrar na videochamada"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Entrar na Chamada
                          </a>
                        )}
                        {event.type === 'consulta' && (
                          <button
                            onClick={() => handleExportToPersonalCalendar(event)}
                            className="text-green-600 hover:text-green-800"
                            title="Adicionar à agenda pessoal"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 4v10a1 1 0 01-1 1H9a1 1 0 01-1-1V11a1 1 0 011-1h6a1 1 0 011 1z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processes */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Processos</h4>
                <div className="space-y-2">
                  {getProcessesForDay(selectedDate).map(process => (
                    <div
                      key={process.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{process.title}</p>
                        <p className="text-sm text-gray-500">Processo: {process.processNumber}</p>
                        <p className="text-sm text-gray-500">Tribunal: {process.court}</p>
                        {process.description && (
                          <p className="text-sm text-gray-600 mt-1">{process.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProcess(process)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProcess(process.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          selectedDate={selectedDate}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {showProcessModal && (
        <ProcessModal
          process={selectedProcess}
          selectedDate={selectedDate}
          onSave={handleSaveProcess}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedProcess(null);
          }}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-900">Carregando...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
