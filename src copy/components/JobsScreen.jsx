import React, { useState, useEffect } from 'react';
import { jobsService } from '../services/jobsService';

const JobsScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('advogado');
  const [location, setLocation] = useState('São Paulo');
  const [metadata, setMetadata] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filters, setFilters] = useState({
    experienceLevel: 'all',
    contractType: 'all',
    salaryRange: 'all'
  });

  useEffect(() => {
    searchJobs();
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const searchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Buscando vagas jurídicas:', { searchTerm, location, filters });
      
      const result = await jobsService.searchLegalJobs(location, searchTerm, filters);
      
      if (result.success) {
        console.log('✅ Vagas encontradas:', result.data);
        setJobs(result.data);
        setMetadata(result.metadata);
        
        // Notificar usuário sobre o status da busca
        if (result.metadata?.failedSources > 0) {
          showNotification(
            `Algumas APIs falharam (${result.metadata.failedSources}/${result.metadata.totalSources}), mas encontramos ${result.data.length} vagas`,
            'warning'
          );
        } else {
          showNotification(
            `Busca concluída com sucesso! ${result.data.length} vagas encontradas`,
            'success'
          );
        }
      } else {
        console.error('❌ Erro ao buscar vagas:', result.error);
        setError(result.error);
        setMetadata(result.metadata);
        setJobs([]);
        
        if (result.metadata?.configurationRequired) {
          showNotification(
            'APIs não configuradas. Configure as chaves no arquivo .env para acessar vagas reais.',
            'error'
          );
        } else {
          showNotification(
            'Erro ao buscar vagas. Verifique sua conexão e configurações das APIs.',
            'error'
          );
        }
      }
    } catch (err) {
      console.error('❌ Erro na busca de vagas:', err);
      setError('Erro interno na busca de vagas.');
      setJobs([]);
      showNotification('Erro inesperado na busca. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchJobs();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Salário não informado';
    if (typeof salary === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(salary);
    }
    return salary;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getJobIcon = (source) => {
    switch (source) {
      case 'adzuna':
        return '🔍';
      case 'jsearch':
        return '💼';
      case 'jooble':
        return '🚀';
      default:
        return '📋';
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'adzuna':
        return 'Adzuna';
      case 'jsearch':
        return 'JSearch';
      case 'jooble':
        return 'Jooble';
      default:
        return 'API';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getNotificationTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-blue-700';
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Buscando vagas jurídicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Notificação */}
      {notification && (
        <div className={`${getNotificationBgColor(notification.type)} border rounded-lg p-4 mb-6`}>
          <div className="flex items-center">
            {getNotificationIcon(notification.type)}
            <p className={`ml-3 ${getNotificationTextColor(notification.type)}`}>
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vagas de Emprego</h1>
          <p className="text-gray-600 mt-2">Oportunidades na área jurídica</p>
          {metadata && metadata.totalSources > 0 && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>APIs configuradas: {metadata.totalSources}</span>
              <span>Funcionando: {metadata.successfulSources}</span>
              {metadata.failedSources > 0 && (
                <span className="text-red-600">
                  Com problema: {metadata.failedSources}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={searchJobs}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Buscando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar Vagas
            </>
          )}
        </button>
        
        {metadata?.configurationRequired && (
          <div className="text-center ml-4">
            <div className="text-sm text-red-600 mb-1">
              ⚠️ APIs não configuradas
            </div>
            <button
              onClick={() => showNotification('Configure as APIs no arquivo .env: VITE_ADZUNA_APP_ID, VITE_ADZUNA_APP_KEY, VITE_JSEARCH_API_KEY, VITE_JOOBLE_API_KEY', 'info')}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Como configurar as APIs?
            </button>
          </div>
        )}
      </div>

      {/* Painel de Status das APIs */}
      {metadata && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das APIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metadata.successfulSources}
              </div>
              <div className="text-sm text-gray-500">APIs Funcionando</div>
              {metadata.successfulAPIs && metadata.successfulAPIs.length > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  {metadata.successfulAPIs.join(', ')}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metadata.failedSources}
              </div>
              <div className="text-sm text-gray-500">APIs com Problema</div>
              {metadata.failedAPIs && metadata.failedAPIs.length > 0 && (
                <div className="text-xs text-red-600 mt-1">
                  {metadata.failedAPIs.map(api => api.name).join(', ')}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metadata.totalJobs}
              </div>
              <div className="text-sm text-gray-500">Vagas Encontradas</div>
              {metadata.configurationRequired && (
                <div className="text-xs text-red-600 mt-1">
                  Configuração necessária
                </div>
              )}
            </div>
          </div>
          
          {metadata.configurationRequired && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="text-sm font-medium text-red-800 mb-2">Configuração necessária:</h4>
              <p className="text-sm text-red-700 mb-2">
                Para usar as vagas de emprego, você precisa configurar pelo menos uma API no arquivo .env:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• VITE_ADZUNA_APP_ID e VITE_ADZUNA_APP_KEY (Adzuna API)</li>
                <li>• VITE_JSEARCH_API_KEY (JSearch via RapidAPI)</li>
                <li>• VITE_JOOBLE_API_KEY (Jooble API)</li>
              </ul>
            </div>
          )}
          
          {metadata.failedAPIs && metadata.failedAPIs.length > 0 && !metadata.configurationRequired && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Problemas detectados:</h4>
              <ul className="text-sm text-yellow-700 space-y-2">
                {metadata.failedAPIs.map((api, index) => (
                  <li key={index} className="flex flex-col">
                    <span>• {api.name}: {api.error}</span>
                    {api.error.includes('400') || api.error.includes('bad request') || api.error.includes('Parâmetros de busca inválidos') ? (
                      <span className="text-xs text-blue-600 mt-1 ml-4">
                        💡 Parâmetros inválidos. Tente termos de busca mais simples ou remova filtros específicos.
                      </span>
                    ) : api.error.includes('429') || api.error.includes('rate limit') || api.error.includes('Too Many Requests') ? (
                      <span className="text-xs text-blue-600 mt-1 ml-4">
                        💡 Limite de requisições atingido. Tente novamente em alguns minutos ou considere um plano premium.
                      </span>
                    ) : api.error.includes('403') || api.error.includes('Forbidden') ? (
                      <span className="text-xs text-blue-600 mt-1 ml-4">
                        💡 Acesso negado. Verifique se sua chave API é válida e se você tem permissões.
                      </span>
                    ) : api.error.includes('401') || api.error.includes('Unauthorized') ? (
                      <span className="text-xs text-blue-600 mt-1 ml-4">
                        💡 Chave API inválida. Verifique suas credenciais no arquivo .env
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Filtros de Busca */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo / Palavra-chave
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: advogado, jurídico, legal..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, Rio de Janeiro..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Experiência
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os níveis</option>
                <option value="entry">Júnior / Iniciante</option>
                <option value="mid">Pleno / Intermediário</option>
                <option value="senior">Sênior / Experiente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contrato
              </label>
              <select
                value={filters.contractType}
                onChange={(e) => handleFilterChange('contractType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="full_time">Tempo integral</option>
                <option value="part_time">Meio período</option>
                <option value="contract">Contrato</option>
                <option value="internship">Estágio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa Salarial
              </label>
              <select
                value={filters.salaryRange}
                onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as faixas</option>
                <option value="0-3000">Até R$ 3.000</option>
                <option value="3000-6000">R$ 3.000 - R$ 6.000</option>
                <option value="6000-10000">R$ 6.000 - R$ 10.000</option>
                <option value="10000+">Acima de R$ 10.000</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar Vagas
            </button>
          </div>
        </form>
      </div>

      {/* Estatísticas */}
      {jobs.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {jobs.length} vagas encontradas
              </h2>
              <p className="text-gray-600">
                Resultados para "{searchTerm}" em {location}
              </p>
              {metadata && (
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Fontes ativas: {metadata.successfulSources}</span>
                  {metadata.failedSources > 0 && (
                    <span className="text-yellow-600">
                      {metadata.failedSources} fonte(s) indisponível(is)
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </p>
              {metadata?.usingMockData && (
                <p className="text-xs text-yellow-600 mt-1">
                  Dados de demonstração
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tratamento de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de Vagas */}
      <div className="space-y-4">
        {jobs.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
            </svg>
            <p className="text-gray-500 text-lg">Nenhuma vaga encontrada</p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-400">Sugestões para melhorar sua busca:</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Tente termos mais gerais como "advogado", "jurídico", "direito"</p>
                <p>• Remova filtros de localização muito específicos</p>
                <p>• Experimente buscar em horários diferentes (algumas APIs têm mais vagas durante o dia)</p>
                {metadata && metadata.failedSources > 0 && (
                  <p className="text-yellow-600">• {metadata.failedSources} fonte(s) temporariamente indisponível(is) - tente novamente mais tarde</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {jobs.length === 0 && !loading && error && metadata?.configurationRequired && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500 text-lg">APIs não configuradas</p>
            <p className="text-red-400 mt-2">Configure as chaves das APIs no arquivo .env para buscar vagas reais</p>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-red-700 mb-2 font-medium">Variáveis necessárias:</p>
              <ul className="text-xs text-red-600 text-left space-y-1">
                <li>• VITE_ADZUNA_APP_ID</li>
                <li>• VITE_ADZUNA_APP_KEY</li>
                <li>• VITE_JSEARCH_API_KEY</li>
                <li>• VITE_JOOBLE_API_KEY</li>
              </ul>
            </div>
          </div>
        )}

        {jobs.map((job, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <span className="text-lg">{getJobIcon(job.source)}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {getSourceLabel(job.source)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {formatSalary(job.salary)}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Publicado em: {formatDate(job.publishedDate)}</span>
                    {job.contractType && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {job.contractType}
                      </span>
                    )}
                    {job.experienceLevel && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {job.experienceLevel}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    Ver Vaga
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(job.url);
                      alert('Link copiado para a área de transferência!');
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Copiar Link
                  </button>
                </div>
              </div>
              
              {/* Tags/Habilidades */}
              {job.tags && job.tags.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Habilidades:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading durante busca adicional */}
      {loading && jobs.length > 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Buscando mais vagas...</p>
        </div>
      )}
    </div>
  );
};

export default JobsScreen;
