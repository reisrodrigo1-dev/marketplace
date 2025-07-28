import React from 'react';

const ProcessDetails = ({ process, onClose }) => {
  if (!process) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSimpleDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderMovimentos = () => {
    if (!process.movimentos || process.movimentos.length === 0) {
      return (
        <div className="text-gray-500 text-center py-4">
          Nenhum movimento processual registrado
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {process.movimentos.map((movimento, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{movimento.nome}</p>
                <p className="text-sm text-gray-600">Código: {movimento.codigo}</p>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(movimento.dataHora)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAssuntos = () => {
    if (!process.assuntos || process.assuntos.length === 0) {
      return <span className="text-gray-500">Não informado</span>;
    }

    return (
      <div className="space-y-1">
        {process.assuntos.map((assunto, index) => (
          <div key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-1">
            {assunto.nome} (#{assunto.codigo})
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{process.title}</h2>
            <p className="text-gray-600 mt-1">Processo: {process.number}</p>
            {process.dataJudOriginal && (
              <div className="flex items-center mt-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm mr-2">
                  DataJud
                </span>
                <span className="text-sm text-gray-600">
                  {process.tribunalNome || process.tribunal}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Informações Básicas */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <p className="text-gray-900">{process.client}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tribunal/Vara</label>
                <p className="text-gray-900">{process.court}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  process.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' :
                  process.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {process.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  process.priority === 'alta' ? 'bg-red-100 text-red-800' :
                  process.priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {process.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Ajuizamento</label>
                <p className="text-gray-900">{formatSimpleDate(process.startDate || process.dataAjuizamento)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Audiência</label>
                <p className="text-gray-900">{formatSimpleDate(process.nextHearing)}</p>
              </div>
            </div>
          </section>

          {/* Descrição */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{process.description || 'Nenhuma descrição disponível'}</p>
            </div>
          </section>

          {/* Informações do DataJud */}
          {process.dataJudOriginal && (
            <>
              {/* Classe Processual */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Classe Processual
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-900 font-medium">{process.classe?.nome || 'Não informado'}</p>
                  <p className="text-blue-700 text-sm">Código: {process.classe?.codigo || 'N/A'}</p>
                </div>
              </section>

              {/* Assuntos */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Assuntos
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {renderAssuntos()}
                </div>
              </section>

              {/* Órgão Julgador */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Órgão Julgador
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-900 font-medium">{process.orgaoJulgador?.nome || 'Não informado'}</p>
                  <div className="text-green-700 text-sm space-y-1 mt-2">
                    <p>Código: {process.orgaoJulgador?.codigo || 'N/A'}</p>
                    <p>Município IBGE: {process.orgaoJulgador?.codigoMunicipioIBGE || 'N/A'}</p>
                    <p>Grau: {process.grau || 'N/A'}</p>
                  </div>
                </div>
              </section>

              {/* Sistema e Formato */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Sistema e Formato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-purple-900 font-medium">Sistema</p>
                    <p className="text-purple-700">{process.sistema?.nome || 'Não informado'}</p>
                    <p className="text-purple-600 text-sm">Código: {process.sistema?.codigo || 'N/A'}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-indigo-900 font-medium">Formato</p>
                    <p className="text-indigo-700">{process.formato?.nome || 'Não informado'}</p>
                    <p className="text-indigo-600 text-sm">Código: {process.formato?.codigo || 'N/A'}</p>
                  </div>
                </div>
              </section>

              {/* Movimentos Processuais */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Movimentos Processuais
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {renderMovimentos()}
                </div>
              </section>

              {/* Informações Técnicas */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Informações Técnicas
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nível de Sigilo:</span>
                      <p className="text-gray-600">{process.nivelSigilo || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Última Atualização DataJud:</span>
                      <p className="text-gray-600">{formatDate(process.dataHoraUltimaAtualizacao)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ID DataJud:</span>
                      <p className="text-gray-600 font-mono text-xs">{process.dataJudOriginal._id || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Score de Relevância:</span>
                      <p className="text-gray-600">{process.dataJudOriginal._score || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        <div className="flex justify-end gap-4 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetails;
