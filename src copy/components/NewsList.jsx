import React, { useState, useEffect } from 'react';
import LegalDebateModal from './LegalDebateModal';
import { fetchLegalNews } from '../services/newsService';

const NewsList = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showDebateModal, setShowDebateModal] = useState(false);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      const news = await fetchLegalNews(10);
      setNewsList(news);
      setLoading(false);
    }
    loadNews();
  }, []);

  const handleOpenDebate = (news) => {
    setSelectedNews(news);
    setShowDebateModal(true);
  };

  const handleCloseDebate = () => {
    setShowDebateModal(false);
    setSelectedNews(null);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Últimas Notícias</h1>
      {loading ? (
        <div className="text-gray-500">Carregando notícias...</div>
      ) : (
        <div className="space-y-4">
          {newsList.map(news => (
            <div key={news.id} className="bg-white shadow rounded p-4">
              <h2 className="text-lg font-semibold mb-1">{news.title}</h2>
              <p className="text-gray-700 mb-2">{news.description || news.summary}</p>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => handleOpenDebate(news)}
              >
                O que você faria?
              </button>
            </div>
          ))}
        </div>
      )}
      {showDebateModal && (
        <LegalDebateModal news={selectedNews} onClose={handleCloseDebate} />
      )}
    </div>
  );
};

export default NewsList;
