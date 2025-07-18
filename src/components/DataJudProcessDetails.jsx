import React, { useState } from 'react';

const DataJudProcessDetails = ({ processData }) => {
  const [expandedSections, setExpandedSections] = useState({});

  if (!processData || !processData.dataJudOriginal) {
    return null;
  }

  const data = processData.dataJudOriginal;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const formatProcessNumber = (number) => {
    if (!number) return '';
    const digits = number.replace(/\D/g, '');
    if (digits.length === 20) {
      return `${digits.substring(0, 7)}-${digits.substring(7, 9)}.${digits.substring(9, 13)}.${digits.substring(13, 14)}.${digits.substring(14, 16)}.${digits.substring(16)}`;
    }
    return number;
  };

  const SectionHeader = ({ title, sectionKey, count }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center">
        <svg
          className={`w-5 h-5 mr-2 transform transition-transform ${
            expandedSections[sectionKey] ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">{title}</span>
        {count !== undefined && (
          <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
            {count}
          </span>
        )}
      </div>
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Detalhes do DataJud
      </h3>

      <div className="space-y-4">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Número do Processo</label>
            <p className="text-gray-900 font-mono">{formatProcessNumber(data.numeroProcesso)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tribunal</label>
            <p className="text-gray-900">{data.tribunalNome || data.tribunal}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Grau</label>
            <p className="text-gray-900">{data.grau}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Ajuizamento</label>
            <p className="text-gray-900">{formatDate(data.dataAjuizamento)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
            <p className="text-gray-900">{formatDate(data.dataHoraUltimaAtualizacao)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nível de Sigilo</label>
            <p className="text-gray-900">{data.nivelSigilo === 0 ? 'Público' : `Nível ${data.nivelSigilo}`}</p>
          </div>
        </div>

        {/* Classe Processual */}
        {data.classe && (
          <div>
            <SectionHeader title="Classe Processual" sectionKey="classe" />
            {expandedSections.classe && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Código</label>
                    <p className="text-gray-900">{data.classe.codigo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-gray-900">{data.classe.nome}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Órgão Julgador */}
        {data.orgaoJulgador && (
          <div>
            <SectionHeader title="Órgão Julgador" sectionKey="orgao" />
            {expandedSections.orgao && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Código</label>
                    <p className="text-gray-900">{data.orgaoJulgador.codigo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-gray-900">{data.orgaoJulgador.nome}</p>
                  </div>
                  {data.orgaoJulgador.codigoMunicipioIBGE && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código Município IBGE</label>
                      <p className="text-gray-900">{data.orgaoJulgador.codigoMunicipioIBGE}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assuntos */}
        {data.assuntos && data.assuntos.length > 0 && (
          <div>
            <SectionHeader title="Assuntos" sectionKey="assuntos" count={data.assuntos.length} />
            {expandedSections.assuntos && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  {data.assuntos.map((assunto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-gray-900">{assunto.nome}</p>
                        <p className="text-sm text-gray-600">Código: {assunto.codigo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Movimentos */}
        {data.movimentos && data.movimentos.length > 0 && (
          <div>
            <SectionHeader title="Movimentos Processuais" sectionKey="movimentos" count={data.movimentos.length} />
            {expandedSections.movimentos && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  {data.movimentos.map((movimento, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{movimento.nome}</h4>
                        <span className="text-sm text-gray-500">Código: {movimento.codigo}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{formatDate(movimento.dataHora)}</p>
                      
                      {movimento.complementosTabelados && movimento.complementosTabelados.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Complementos:</p>
                          <div className="space-y-1">
                            {movimento.complementosTabelados.map((complemento, compIndex) => (
                              <div key={compIndex} className="text-sm text-gray-600">
                                <span className="font-medium">{complemento.nome}</span>
                                {complemento.descricao && (
                                  <span className="text-gray-500"> - {complemento.descricao}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sistema e Formato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.sistema && (
            <div>
              <SectionHeader title="Sistema" sectionKey="sistema" />
              {expandedSections.sistema && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código</label>
                      <p className="text-gray-900">{data.sistema.codigo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <p className="text-gray-900">{data.sistema.nome}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {data.formato && (
            <div>
              <SectionHeader title="Formato" sectionKey="formato" />
              {expandedSections.formato && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código</label>
                      <p className="text-gray-900">{data.formato.codigo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <p className="text-gray-900">{data.formato.nome}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataJudProcessDetails;
