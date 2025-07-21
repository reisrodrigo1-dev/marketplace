import React, { useEffect, useState } from 'react';
import { fetchLegalNews } from '../services/newsService';

const UltimasNoticiasFlix = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.resolve(fetchLegalNews(12))
      .then(newsData => {
        setNews(newsData);
      })
      .catch(() => {
        setError('Erro ao carregar notícias jurídicas');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg mr-4">
            📰
          </span>
          Últimas Notícias Jurídicas
        </h1>
        <p className="text-gray-600 mt-1">Atualidades do mundo jurídico</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Notícias</h2>
          <p className="text-gray-600 mt-1">Principais manchetes jurídicas do momento</p>
        </div>
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando notícias...</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
          {!loading && !error && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {news.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative group cursor-pointer">
                    <img
                      src={article.image || 'https://via.placeholder.com/400x250?text=Notícia+Jurídica'}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={e => { e.target.src = 'https://via.placeholder.com/400x250?text=Notícia+Jurídica'; }}
                    />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      📰 Notícia
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {article.source}
                      </span>
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ler matéria
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && news.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <p className="text-gray-500 text-lg">Nenhuma notícia encontrada</p>
              <p className="text-gray-400 mt-2">Tente novamente mais tarde</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UltimasNoticiasFlix;
