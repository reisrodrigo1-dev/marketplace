class YouTubeService {
  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Verificar se a API está configurada
  isConfigured() {
    return !!this.apiKey;
  }

  // Buscar vídeos de uma playlist
  async getPlaylistVideos(playlistId, maxResults = 50) {
    if (!this.isConfigured()) {
      console.warn('⚠️ YouTube API não configurada');
      return {
        success: false,
        error: 'API do YouTube não configurada - adicione VITE_YOUTUBE_API_KEY no arquivo .env'
      };
    }

    try {
      console.log(`🎬 Buscando vídeos da playlist: ${playlistId}`);

      // Buscar itens da playlist
      const playlistResponse = await fetch(
        `${this.baseUrl}/playlistItems?` +
        `part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!playlistResponse.ok) {
        throw new Error(`Erro na API do YouTube: ${playlistResponse.status}`);
      }

      const playlistData = await playlistResponse.json();
      
      if (!playlistData.items || playlistData.items.length === 0) {
        return {
          success: true,
          data: [],
          message: 'Nenhum vídeo encontrado na playlist'
        };
      }

      // Extrair IDs dos vídeos
      const videoIds = playlistData.items
        .map(item => item.snippet.resourceId.videoId)
        .filter(id => id)
        .join(',');

      // Buscar detalhes dos vídeos (duração, visualizações, etc.)
      const videosResponse = await fetch(
        `${this.baseUrl}/videos?` +
        `part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error(`Erro ao buscar detalhes dos vídeos: ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();

      // Processar e formatar dados
      const processedVideos = videosData.items.map(video => ({
        id: video.id,
        title: this.cleanTitle(video.snippet.title),
        description: video.snippet.description,
        thumbnail: this.getBestThumbnail(video.snippet.thumbnails),
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${video.id}`
      }));

      console.log(`✅ ${processedVideos.length} vídeos carregados da playlist`);

      return {
        success: true,
        data: processedVideos,
        metadata: {
          totalVideos: processedVideos.length,
          playlistId: playlistId
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar vídeos do YouTube:', error);
      
      let errorMessage = 'Erro ao carregar vídeos do YouTube';
      
      if (error.message.includes('403')) {
        errorMessage = 'Chave da API do YouTube inválida ou expirada';
      } else if (error.message.includes('404')) {
        errorMessage = 'Playlist não encontrada';
      } else if (error.message.includes('400')) {
        errorMessage = 'Parâmetros inválidos na requisição';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Limpar título do vídeo removendo caracteres desnecessários
  cleanTitle(title) {
    return title
      .replace(/\[.*?\]/g, '') // Remove [tags]
      .replace(/\(.*?\)/g, '') // Remove (info)
      .replace(/\|.*$/, '') // Remove texto após |
      .replace(/^\d+\.?\s*/, '') // Remove numeração no início
      .trim();
  }

  // Escolher a melhor thumbnail disponível
  getBestThumbnail(thumbnails) {
    if (thumbnails.maxres) return thumbnails.maxres.url;
    if (thumbnails.high) return thumbnails.high.url;
    if (thumbnails.medium) return thumbnails.medium.url;
    if (thumbnails.default) return thumbnails.default.url;
    return '/api/placeholder/400/300'; // Fallback
  }

  // Buscar informações de um canal específico
  async getChannelInfo(channelId) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'API do YouTube não configurada'
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/channels?` +
        `part=snippet,statistics&id=${channelId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: 'Canal não encontrado'
        };
      }

      const channel = data.items[0];
      
      return {
        success: true,
        data: {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: this.getBestThumbnail(channel.snippet.thumbnails),
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar informações do canal:', error);
      return {
        success: false,
        error: 'Erro ao carregar informações do canal'
      };
    }
  }

  // Extrair ID da playlist de uma URL do YouTube
  extractPlaylistId(url) {
    const match = url.match(/[&?]list=([^&]+)/);
    return match ? match[1] : null;
  }

  // Extrair ID do vídeo de uma URL do YouTube
  extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }
}

// Instância única do serviço
export const youtubeService = new YouTubeService();
