import React, { useState } from 'react';
import { mostrarOpcoesCalendario, criarEventoAudiencia, criarEventoLembrete, criarEventoPrazo } from '../services/calendarService';

const CalendarModal = ({ isOpen, onClose, processo, tipo = 'audiencia' }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCalendarAction = async (opcao) => {
    setLoading(true);
    try {
      let evento;
      
      if (tipo === 'audiencia') {
        evento = criarEventoAudiencia(processo);
      } else if (tipo === 'prazo') {
        // Para prazos, seria necessário passar o prazo específico
        // Por enquanto, vamos usar a data de audiência como exemplo
        evento = criarEventoAudiencia(processo);
      }
      
      await opcao.acao();
      
      // Feedback visual
      const originalNome = opcao.nome;
      opcao.nome = '✅ Adicionado!';
      setTimeout(() => {
        opcao.nome = originalNome;
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao adicionar ao calendário:', error);
      alert('Erro ao adicionar ao calendário. Verifique se o processo possui data de audiência.');
    } finally {
      setLoading(false);
    }
  };

  const criarEvento = () => {
    try {
      if (tipo === 'audiencia' && processo.nextHearing) {
        return criarEventoAudiencia(processo);
      } else {
        // Criar evento de lembrete para processos sem audiência
        return criarEventoLembrete(processo);
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return null;
    }
  };

  const evento = criarEvento();
  
  if (!evento) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Adicionar ao Calendário
            </h3>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Erro ao criar evento para este processo.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const opcoes = mostrarOpcoesCalendario(evento);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {processo?.nextHearing ? 'Adicionar Audiência ao Calendário' : 'Adicionar Lembrete ao Calendário'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Informações do evento */}
          <div className={`mb-6 p-4 rounded-lg ${processo?.nextHearing ? 'bg-blue-50' : 'bg-green-50'}`}>
            <h4 className={`font-semibold mb-2 ${processo?.nextHearing ? 'text-blue-900' : 'text-green-900'}`}>
              {evento.titulo}
            </h4>
            <div className={`text-sm space-y-1 ${processo?.nextHearing ? 'text-blue-700' : 'text-green-700'}`}>
              <p><strong>Data:</strong> {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {new Date(evento.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Processo:</strong> {processo.number}</p>
              <p><strong>Cliente:</strong> {processo.client}</p>
              {evento.local && <p><strong>Local:</strong> {evento.local}</p>}
              {!processo?.nextHearing && (
                <p className="text-sm text-green-600 mt-2">
                  <strong>Tipo:</strong> Lembrete de acompanhamento (próxima segunda-feira)
                </p>
              )}
            </div>
          </div>

          {/* Opções de calendário */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              {processo?.nextHearing 
                ? 'Escolha onde deseja adicionar esta audiência:' 
                : 'Escolha onde deseja adicionar este lembrete:'}
            </p>
            
            {opcoes.map((opcao, index) => (
              <button
                key={index}
                onClick={() => handleCalendarAction(opcao)}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{opcao.icone}</span>
                  <span className="font-medium text-gray-900">{opcao.nome}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Dicas:</p>
                <ul className="space-y-1">
                  <li>• O evento incluirá um lembrete 30 minutos antes</li>
                  <li>• O arquivo .ics funciona com qualquer calendário</li>
                  <li>• Para dispositivos móveis, use "Calendário do dispositivo"</li>
                  {!processo?.nextHearing && (
                    <li>• Lembretes são agendados para a próxima segunda-feira às 9h</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
