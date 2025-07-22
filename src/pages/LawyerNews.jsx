import React, { useEffect, useState } from 'react';
import { fetchLegalNews } from '../services/newsService';
import LegalDebateModal from './LegalDebateModal';

const LawyerNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebateModal, setShowDebateModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const newsData = await fetchLegalNews(12);
        setNews(newsData);
      } catch (err) {
        setError('Erro ao carregar notícias jurídicas');
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const handleOpenDebate = (article) => {
    setSelectedNews(article);
    setShowDebateModal(true);
  };

  const handleCloseDebate = () => {
    setShowDebateModal(false);
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Últimas notícias</h1>
          <p className="text-lg text-gray-600">Acompanhe as principais nosvidades do mundo jurídico</p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Carregando notícias...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {news.map((article, idx) => (
              <article
                key={article.id || idx}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={article.image || 'https://via.placeholder.com/400x250?text=Notícia+Jurídica'}
                    alt={article.title}
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://via.placeholder.com/400x250?text=Notícia+Jurídica'; }}
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {article.source}
                    </span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('pt-BR') : ''}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 hover:text-blue-700 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-700 text-base mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex gap-2 mt-auto">
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
                    <button
                      className="px-4 py-2 bg-yellow-400 text-blue-900 font-semibold rounded shadow hover:bg-yellow-300 transition text-sm"
                      onClick={() => handleOpenDebate(article)}
                    >
                      O QUE VC FARIA?
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {showDebateModal && selectedNews && (
          <LegalDebateModal
            news={selectedNews}
            onClose={handleCloseDebate}
          />
        )}
      </div>
    </div>
  );
};

export default LawyerNews;
