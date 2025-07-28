import React from "react";

// Card visual para exibir curso do aluno no dashboard
// Props: acesso (objeto do curso), onContinue (callback), progresso (0-100), concluido (bool)
const AlunoCourseCard = ({ acesso, onContinue, progresso = 0, concluido = false }) => {
  return (
    <div className={
      `relative bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl overflow-hidden` +
      (concluido ? ' ring-2 ring-green-400' : '')
    }>
      {/* Capa do curso (se houver) */}
      {/* <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
        Capa
      </div> */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 font-semibold">
            {concluido ? 'Concluído' : progresso >= 1 ? 'Em andamento' : 'Novo'}
          </span>
          {concluido && <span className="material-icons text-green-500 text-base ml-1">check_circle</span>}
        </div>
        <h3 className="text-lg font-bold text-blue-900 mb-1 line-clamp-2">{acesso.cursoTitulo}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{acesso.cursoDescricao}</p>
        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium mb-2">
          Acesso em {new Date(acesso.dataAcesso).toLocaleDateString('pt-BR')}
        </span>
        {/* Barra de progresso */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progresso}%`, background: concluido ? '#22c55e' : '#0ea5e9' }}></div>
          </div>
          <span className="text-xs font-bold text-blue-700 w-10 text-right">{progresso}%</span>
        </div>
        {/* Botão continuar */}
        <button
          className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full"
          onClick={onContinue}
        >
          {concluido ? 'Ver Certificado' : progresso > 0 ? 'Continuar' : 'Começar curso'}
        </button>
      </div>
      {/* Selo de conquista */}
      {concluido && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow font-bold animate-bounce">
          🎉 Concluído
        </div>
      )}
    </div>
  );
};

export default AlunoCourseCard;
