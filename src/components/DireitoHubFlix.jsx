import React, { useState, useEffect } from 'react';
import { youtubeService } from '../services/youtubeService';
import { fetchLegalNews } from '../services/newsService';

const DireitoHubFlix = () => {
  const [activeCategory, setActiveCategory] = useState('podcasts');
  const [podcasts, setPodcasts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    {
      id: 'podcasts',
      name: 'Podcasts',
      icon: '🎙️',
      description: 'Conversas e debates jurídicos'
    },
    {
      id: 'aulas',
      name: 'Aulas',
      icon: '📚',
      description: 'Conteúdo educacional'
    },
    {
      id: 'pratica',
      name: 'Prática',
      icon: '⚖️',
      description: 'Casos práticos e tutoriais'
    },
    {
      id: 'noticias',
      name: 'Notícias',
      icon: '📰',
      description: 'Atualidades do mundo jurídico'
    }
  ];

  useEffect(() => {
    if (activeCategory === 'podcasts') {
      loadPodcasts();
    } else if (activeCategory === 'noticias') {
      loadNews();
    }
  }, [activeCategory]);

  const loadPodcasts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Playlist ID do link fornecido
      const playlistId = 'PLT4MVOUvZvO3UcUYCkUf2lVJ4-Gl9UqyW';
      const result = await youtubeService.getPlaylistVideos(playlistId);
      
      if (result.success) {
        setPodcasts(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao carregar podcasts');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newsData = await fetchLegalNews(12);
      setNews(newsData);
    } catch (err) {
      setError('Erro ao carregar notícias jurídicas');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    
    // Converter duração ISO 8601 (PT4M13S) para formato legível
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'N/A';
    
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (viewCount) => {
    if (!viewCount) return 'N/A';
    const views = parseInt(viewCount);
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M visualizações`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K visualizações`;
    }
    return `${views} visualizações`;
  };

  const formatDate = (publishedAt) => {
    if (!publishedAt) return 'N/A';
    return new Date(publishedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg mr-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.8 8s-.195-1.377-.795-1.984c-.76-.797-1.613-.8-2.004-.847-2.799-.203-6.996-.203-6.996-.203h-.01s-4.197 0-6.996.203c-.391.047-1.243.05-2.004.847C2.395 6.623 2.2 8 2.2 8S2 9.62 2 11.24v1.517c0 1.618.2 3.237.2 3.237s.195 1.378.795 1.985c.761.796 1.76.77 2.205.855 1.6.154 6.8.202 6.8.202s4.203-.006 7.001-.209c.391-.047 1.243-.05 2.004-.847.6-.607.795-1.985.795-1.985s.2-1.618.2-3.237v-1.517C22 9.62 21.8 8 21.8 8zM9.935 14.595V9.405l5.403 2.595-5.403 2.595z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DireitoHub Flix</h1>
            <p className="text-gray-600 mt-1">Sua plataforma de conteúdo jurídico</p>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-2">{category.icon}</span>
              <div className="text-left">
                <div className="font-medium">{category.name}</div>
                <div className="text-xs opacity-75">{category.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header da Categoria */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {categories.find(c => c.id === activeCategory)?.description}
              </p>
            </div>
            {activeCategory === 'podcasts' && podcasts.length > 0 && (
              <div className="text-sm text-gray-500">
                {podcasts.length} episódios disponíveis
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo da Categoria */}
        <div className="p-6">
          {activeCategory === 'podcasts' && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Carregando podcasts...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                  <div className="mt-2 text-sm text-red-600">
                    <p>Para usar esta funcionalidade, configure sua chave da API do YouTube no arquivo .env:</p>
                    <p className="font-mono mt-1">VITE_YOUTUBE_API_KEY=sua_chave_aqui</p>
                  </div>
                </div>
              )}

              {!loading && !error && podcasts.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">Nenhum podcast encontrado</p>
                  <p className="text-gray-400 mt-2">Configure a API do YouTube para ver o conteúdo</p>
                </div>
              )}

              {!loading && !error && podcasts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {podcasts.map((video) => (
                    <div
                      key={video.id}
                      className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openVideo(video.id)}
                    >
                      {/* Thumbnail */}
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <svg className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {video.title}
                        </h3>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{formatViews(video.viewCount)}</p>
                          <p>{formatDate(video.publishedAt)}</p>
                        </div>

                        {video.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Categoria Notícias */}
          {activeCategory === 'noticias' && (
            <>
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
                      {/* Imagem */}
                      <div className="relative group cursor-pointer">
                        <img
                          src={article.image || 'https://via.placeholder.com/400x250?text=Notícia+Jurídica'}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x250?text=Notícia+Jurídica';
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          📰 Notícia
                        </div>
                      </div>

                      {/* Conteúdo */}
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
                  <p className="text-gray-400 mt-2">
                    Tente novamente mais tarde
                  </p>
                </div>
              )}
            </>
          )}

          {/* Outras categorias (placeholder) */}
          {activeCategory !== 'podcasts' && activeCategory !== 'noticias' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {categories.find(c => c.id === activeCategory)?.icon}
              </div>
              <p className="text-gray-500 text-lg">Em desenvolvimento</p>
              <p className="text-gray-400 mt-2">
                Esta categoria será implementada em breve
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DireitoHubFlix;
