
import React from "react";

// Card visual para exibir curso do aluno no dashboard
// Props: acesso (objeto do curso), onContinue (callback), progresso (0-100), concluido (bool)
const AlunoCourseCard = ({ acesso, progresso, concluido, onContinue }) => {
  const getProgressColor = () => {
    if (concluido) return 'bg-green-500';
    if (progresso > 50) return 'bg-blue-500';
    if (progresso > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusText = () => {
    if (concluido) return 'Concluído';
    if (progresso > 0) return 'Em progresso';
    return 'Não iniciado';
  };

  const getStatusColor = () => {
    if (concluido) return 'text-green-700 bg-green-100';
    if (progresso > 0) return 'text-blue-700 bg-blue-100';
    return 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group">
      {/* Imagem/Thumbnail do curso */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        {acesso.thumbnail ? (
          <img 
            src={acesso.thumbnail} 
            alt={acesso.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-6xl opacity-80">
            📚
          </div>
        )}
        
        {/* Badge de Status */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </div>

        {/* Ícone de Play no centro */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-20">
          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {acesso.titulo || 'Curso sem título'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {acesso.descricao || 'Descrição não disponível'}
        </p>

        {/* Barra de Progresso */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso</span>
            <span className="text-sm font-bold text-gray-800">{progresso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Acesso liberado</span>
          </div>
          {acesso.dataAcesso && (
            <span>
              Desde {new Date(acesso.dataAcesso.toDate()).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {/* Botão de Ação */}
        <button
          onClick={onContinue}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            concluido 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : progresso > 0 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-900 text-white'
          } hover:shadow-lg transform hover:-translate-y-0.5`}
        >
          {concluido ? '✅ Revisar Curso' : progresso > 0 ? '▶️ Continuar' : '🚀 Iniciar Curso'}
        </button>
      </div>
    </div>
  );
};

export default AlunoCourseCard;
