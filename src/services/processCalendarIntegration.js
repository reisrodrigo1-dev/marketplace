import { calendarStorageService } from './calendarService';

// Serviço para integrar processos com o calendário
export const processCalendarIntegration = {
  
  // Extrair datas importantes de um processo
  extractImportantDates(processData) {
    const dates = [];
    
    // Audiência marcada
    if (processData.nextHearing) {
      dates.push({
        type: 'hearing',
        date: processData.nextHearing,
        title: `Audiência - ${processData.title}`,
        description: `Audiência do processo ${processData.number}\nCliente: ${processData.client}\nTribunal: ${processData.court}`,
        processNumber: processData.number,
        client: processData.client,
        court: processData.court,
        priority: processData.priority || 'medium',
        category: 'hearing'
      });
    }
    
    // Prazos do DataJud (se disponível)
    if (processData.dataJudOriginal && processData.dataJudOriginal.movimentacoes) {
      processData.dataJudOriginal.movimentacoes.forEach(mov => {
        // Verificar se a movimentação tem prazo
        if (mov.prazo && mov.prazo.length > 0) {
          mov.prazo.forEach(prazo => {
            if (prazo.dataLimite) {
              dates.push({
                type: 'deadline',
                date: prazo.dataLimite,
                title: `Prazo - ${prazo.tipo || 'Prazo processual'}`,
                description: `Prazo do processo ${processData.number}\n${mov.nome}\nTribunal: ${processData.court}`,
                processNumber: processData.number,
                client: processData.client,
                court: processData.court,
                priority: 'high', // Prazos sempre alta prioridade
                category: 'deadline'
              });
            }
          });
        }
        
        // Verificar se a movimentação tem data importante
        if (mov.dataHora && this.isImportantMovement(mov)) {
          const futureDate = new Date(mov.dataHora);
          const today = new Date();
          
          // Só adicionar se for uma data futura
          if (futureDate > today) {
            dates.push({
              type: 'movement',
              date: mov.dataHora.split('T')[0], // Formato YYYY-MM-DD
              title: `${mov.nome} - ${processData.title}`,
              description: `Movimentação do processo ${processData.number}\n${mov.nome}\nTribunal: ${processData.court}`,
              processNumber: processData.number,
              client: processData.client,
              court: processData.court,
              priority: 'medium',
              category: 'movement'
            });
          }
        }
      });
    }
    
    return dates;
  },
  
  // Verificar se uma movimentação é importante para o calendário
  isImportantMovement(movement) {
    const importantMovements = [
      'audiência',
      'julgamento',
      'sentença',
      'decisão',
      'prazo',
      'intimação',
      'citação',
      'mandado',
      'perícia',
      'despacho'
    ];
    
    const movementName = movement.nome.toLowerCase();
    return importantMovements.some(keyword => movementName.includes(keyword));
  },
  
  // Sincronizar um processo com o calendário
  async syncProcessWithCalendar(userId, processData) {
    try {
      console.log('Sincronizando processo com calendário:', processData.number);
      
      const importantDates = this.extractImportantDates(processData);
      const results = [];
      
      for (const dateInfo of importantDates) {
        // Verificar se já existe um evento para esta data e processo
        const existingEvent = await this.findExistingCalendarEvent(userId, dateInfo);
        
        if (!existingEvent) {
          // Criar novo evento no calendário
          const eventData = {
            title: dateInfo.title,
            description: dateInfo.description,
            date: dateInfo.date,
            time: dateInfo.time || '09:00', // Hora padrão se não especificada
            category: dateInfo.category,
            priority: dateInfo.priority,
            processNumber: dateInfo.processNumber,
            client: dateInfo.client,
            court: dateInfo.court,
            reminder: '60', // 1 hora antes por padrão
            isFromProcess: true // Flag para identificar que veio de processo
          };
          
          const result = await calendarStorageService.createProcess(userId, eventData);
          results.push(result);
          
          if (result.success) {
            console.log(`Evento criado no calendário: ${dateInfo.title}`);
          } else {
            console.error(`Erro ao criar evento: ${result.error}`);
          }
        } else {
          console.log(`Evento já existe no calendário: ${dateInfo.title}`);
        }
      }
      
      return {
        success: true,
        eventsCreated: results.filter(r => r.success).length,
        totalDates: importantDates.length
      };
      
    } catch (error) {
      console.error('Erro ao sincronizar processo com calendário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Buscar evento existente no calendário
  async findExistingCalendarEvent(userId, dateInfo) {
    try {
      // Buscar eventos por termo (número do processo)
      const searchResult = await calendarStorageService.searchItems(userId, dateInfo.processNumber);
      
      if (searchResult.success) {
        // Verificar se há um evento na mesma data
        const existingEvent = searchResult.data.find(item => 
          item.date === dateInfo.date && 
          item.processNumber === dateInfo.processNumber &&
          item.title.includes(dateInfo.title.split(' - ')[0]) // Comparar tipo de evento
        );
        
        return existingEvent;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar evento existente:', error);
      return null;
    }
  },
  
  // Sincronizar todos os processos de um usuário
  async syncAllProcesses(userId, processes) {
    try {
      console.log(`Sincronizando ${processes.length} processos com calendário`);
      
      const results = [];
      
      for (const process of processes) {
        const result = await this.syncProcessWithCalendar(userId, process);
        results.push(result);
      }
      
      const successful = results.filter(r => r.success).length;
      const totalEvents = results.reduce((sum, r) => sum + (r.eventsCreated || 0), 0);
      
      return {
        success: true,
        processesSync: successful,
        totalProcesses: processes.length,
        eventsCreated: totalEvents
      };
      
    } catch (error) {
      console.error('Erro ao sincronizar todos os processos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Remover eventos de um processo do calendário
  async removeProcessFromCalendar(userId, processNumber) {
    try {
      const searchResult = await calendarStorageService.searchItems(userId, processNumber);
      
      if (searchResult.success) {
        const eventsToDelete = searchResult.data.filter(item => 
          item.processNumber === processNumber && item.isFromProcess
        );
        
        for (const event of eventsToDelete) {
          if (event.type === 'event') {
            await calendarStorageService.deleteEvent(event.id);
          } else if (event.type === 'process') {
            await calendarStorageService.deleteProcess(event.id);
          }
        }
        
        return {
          success: true,
          eventsDeleted: eventsToDelete.length
        };
      }
      
      return { success: false, error: 'Não foi possível buscar eventos' };
    } catch (error) {
      console.error('Erro ao remover processo do calendário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default processCalendarIntegration;
