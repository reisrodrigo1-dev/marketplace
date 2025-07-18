// Serviço para integração com APIs de notícias jurídicas
const NEWSAPI_URL = 'https://newsapi.org/v2/everything';
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY;

/**
 * Busca notícias jurídicas em português/Brasil usando NewsAPI.org
 * @param {number} limit - Número máximo de artigos para retornar
 * @returns {Promise<Array>} Lista de notícias jurídicas
 */
export const fetchLegalNews = async (limit = 12) => {
  if (!NEWSAPI_KEY) {
    console.warn('NewsAPI key não configurada');
    return getMockLegalNews(limit);
  }

  try {
    // Palavras-chave relacionadas ao direito e jurisprudência
    const keywords = [
      'direito',
      'jurídico',
      'advocacia',
      'tribunal',
      'supremo',
      'STF',
      'STJ',
      'TST',
      'juiz',
      'lei',
      'processo',
      'jurisprudência'
    ].join(' OR ');

    const params = new URLSearchParams({
      q: keywords,
      language: 'pt',
      sortBy: 'publishedAt',
      pageSize: limit,
      apiKey: NEWSAPI_KEY
    });

    const response = await fetch(`${NEWSAPI_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${data.message}`);
    }

    return data.articles.map(article => ({
      id: article.url,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name,
      author: article.author
    }));

  } catch (error) {
    console.error('Erro ao buscar notícias jurídicas:', error);
    return getMockLegalNews(limit);
  }
};

/**
 * Dados mock de notícias jurídicas para desenvolvimento/fallback
 */
const getMockLegalNews = (limit) => {
  const mockNews = [
    {
      id: '1',
      title: 'STF determina nova interpretação sobre direitos digitais',
      description: 'Supremo Tribunal Federal estabelece precedente importante sobre privacidade e proteção de dados na era digital.',
      content: 'Em decisão histórica, o STF reconheceu a necessidade de atualizar a interpretação constitucional para os direitos digitais...',
      url: 'https://example.com/stf-direitos-digitais',
      image: 'https://via.placeholder.com/400x250?text=STF+Decisão',
      publishedAt: '2025-01-16T10:30:00Z',
      source: 'Supremo Tribunal Federal',
      author: 'Assessoria de Imprensa'
    },
    {
      id: '2',
      title: 'Nova lei de startups entra em vigor',
      description: 'Marco legal das startups traz mudanças significativas para o empreendedorismo digital no Brasil.',
      content: 'A lei 14.195/2021, conhecida como Marco Legal das Startups, estabelece novas regras...',
      url: 'https://example.com/lei-startups',
      image: 'https://via.placeholder.com/400x250?text=Lei+Startups',
      publishedAt: '2025-01-15T14:20:00Z',
      source: 'Diário Oficial',
      author: 'Redação Jurídica'
    },
    {
      id: '3',
      title: 'TST publica nova súmula sobre trabalho remoto',
      description: 'Tribunal Superior do Trabalho estabelece diretrizes claras sobre direitos dos trabalhadores em home office.',
      content: 'A súmula 478 do TST esclarece pontos importantes sobre jornada de trabalho...',
      url: 'https://example.com/tst-trabalho-remoto',
      image: 'https://via.placeholder.com/400x250?text=TST+Súmula',
      publishedAt: '2025-01-14T09:15:00Z',
      source: 'Tribunal Superior do Trabalho',
      author: 'Gabinete de Comunicação'
    },
    {
      id: '4',
      title: 'LGPD: novas diretrizes da ANPD',
      description: 'Autoridade Nacional de Proteção de Dados divulga guia atualizado para compliance empresarial.',
      content: 'A ANPD publicou novas orientações sobre adequação à Lei Geral de Proteção de Dados...',
      url: 'https://example.com/anpd-lgpd-diretrizes',
      image: 'https://via.placeholder.com/400x250?text=LGPD+Diretrizes',
      publishedAt: '2025-01-13T16:45:00Z',
      source: 'ANPD',
      author: 'Assessoria Técnica'
    },
    {
      id: '5',
      title: 'CNJ aprova nova resolução sobre processo eletrônico',
      description: 'Conselho Nacional de Justiça moderniza procedimentos do processo judicial eletrônico.',
      content: 'A resolução 345/2022 do CNJ estabelece novos padrões para o PJe...',
      url: 'https://example.com/cnj-processo-eletronico',
      image: 'https://via.placeholder.com/400x250?text=CNJ+Resolução',
      publishedAt: '2025-01-12T11:30:00Z',
      source: 'Conselho Nacional de Justiça',
      author: 'Secretaria de Comunicação'
    },
    {
      id: '6',
      title: 'Advocacia 4.0: inteligência artificial no direito',
      description: 'Estudo revela crescimento do uso de IA em escritórios de advocacia brasileiros.',
      content: 'Pesquisa da OAB mostra que 65% dos escritórios já utilizam alguma forma de IA...',
      url: 'https://example.com/advocacia-inteligencia-artificial',
      image: 'https://via.placeholder.com/400x250?text=IA+Advocacia',
      publishedAt: '2025-01-11T08:20:00Z',
      source: 'OAB Nacional',
      author: 'Comissão de Tecnologia'
    }
  ];

  return mockNews.slice(0, limit);
};

export default {
  fetchLegalNews
};
