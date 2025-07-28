
import React from 'react';

const Blog = () => {
  const mockNews = [
    {
      id: '1',
      title: 'STF determina nova interpretação sobre direitos digitais',
      description: 'Supremo Tribunal Federal estabelece precedente importante sobre privacidade e proteção de dados na era digital.',
      url: 'https://example.com/stf-direitos-digitais',
      image: '/img/noticia-fallback.jpg',
      publishedAt: '2025-01-16T10:30:00Z',
      source: 'Supremo Tribunal Federal',
    },
    {
      id: '2',
      title: 'Nova lei de startups entra em vigor',
      description: 'Marco legal das startups traz mudanças significativas para o empreendedorismo digital no Brasil.',
      url: 'https://example.com/lei-startups',
      image: '/img/noticia-fallback.jpg',
      publishedAt: '2025-01-15T14:20:00Z',
      source: 'Diário Oficial',
    },
    {
      id: '3',
      title: 'TST publica nova súmula sobre trabalho remoto',
      description: 'Tribunal Superior do Trabalho estabelece diretrizes claras sobre direitos dos trabalhadores em home office.',
      url: 'https://example.com/tst-trabalho-remoto',
      image: '/img/noticia-fallback.jpg',
      publishedAt: '2025-01-14T09:15:00Z',
      source: 'Tribunal Superior do Trabalho',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Blog
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mantenha-se atualizado com as últimas novidades do direito
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockNews.map((article, idx) => (
            <article
              key={article.id || idx}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { if (e.target.src !== '/img/noticia-fallback.jpg') e.target.src = '/img/noticia-fallback.jpg'; }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {article.source}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {article.description}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium text-sm group-hover:underline"
                >
                  Ler matéria →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
