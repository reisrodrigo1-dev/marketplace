import React from "react";

// Card visual para exibir curso do aluno no dashboard
// Props: acesso (objeto do curso), onContinue (callback), progresso (0-100), concluido (bool), pageColors (objeto de cores)

export default function AlunoCourseCard({ acesso, onContinue, progresso = 0, concluido = false, pageColors = null }) {
  // Cores padrão caso não sejam fornecidas
  const colors = pageColors || {
    principal: '#1e40af',
    secundaria: '#3b82f6',
    destaque: '#059669'
  };

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
    <div 
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border transform hover:-translate-y-1"
      style={{ 
        borderColor: concluido ? colors.destaque : colors.principal + '30'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.principal;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = concluido ? colors.destaque : colors.principal + '30';
      }}
    >
      {/* Header do Card */}
      <div 
        className="p-4 border-b"
        style={{ 
          background: `linear-gradient(135deg, ${colors.principal}08, ${colors.secundaria}08)`,
          borderBottomColor: colors.principal + '20'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${colors.principal}, ${colors.secundaria})` 
            }}
          >
            {acesso.nomeProduto?.[0] || '📚'}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1 transition-colors group-hover:opacity-80">
              {acesso.nomeProduto || 'Curso sem nome'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {acesso.compradoEm ? 
                `Adquirido em ${new Date(acesso.compradoEm.seconds * 1000).toLocaleDateString('pt-BR')}` :
                'Data não disponível'
              }
            </p>
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
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progresso do Curso</span>
            <span 
              className="text-sm font-bold"
              style={{ color: concluido ? colors.destaque : colors.principal }}
            >
              {progresso}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(progresso, 100)}%`,
                background: concluido 
                  ? `linear-gradient(135deg, ${colors.destaque}, ${colors.destaque}dd)` 
                  : `linear-gradient(135deg, ${colors.principal}, ${colors.secundaria})`
              }}
            />
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
          onClick={() => onContinue && onContinue()}
          className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          style={{ 
            background: concluido
              ? `linear-gradient(135deg, ${colors.destaque}, ${colors.destaque}dd)`
              : progresso > 0
              ? `linear-gradient(135deg, ${colors.principal}, ${colors.secundaria})`
              : `linear-gradient(135deg, #6b7280, #4b5563)`
          }}
          onMouseEnter={(e) => {
            if (concluido) {
              e.target.style.background = `linear-gradient(135deg, ${colors.destaque}dd, ${colors.destaque}bb)`;
            } else if (progresso > 0) {
              e.target.style.background = `linear-gradient(135deg, ${colors.secundaria}, ${colors.principal})`;
            }
          }}
          onMouseLeave={(e) => {
            if (concluido) {
              e.target.style.background = `linear-gradient(135deg, ${colors.destaque}, ${colors.destaque}dd)`;
            } else if (progresso > 0) {
              e.target.style.background = `linear-gradient(135deg, ${colors.principal}, ${colors.secundaria})`;
            } else {
              e.target.style.background = `linear-gradient(135deg, #6b7280, #4b5563)`;
            }
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">
              {concluido ? '🎉' : progresso > 0 ? '📖' : '🚀'}
            </span>
            <span>
              {concluido ? 'Revisar Curso' : progresso > 0 ? 'Continuar Estudando' : 'Começar Curso'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};