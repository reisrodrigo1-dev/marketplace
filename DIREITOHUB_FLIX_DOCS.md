# DireitoHub Flix - Documentação

## Visão Geral

O **DireitoHub Flix** é uma plataforma de conteúdo jurídico integrada que permite visualizar podcasts, aulas e outros materiais educacionais diretamente na aplicação. Similar ao Netflix, mas focado em conteúdo jurídico.

## Funcionalidades

### 🎙️ Podcasts
- Integração com playlist do YouTube
- Visualização de thumbnails e metadados
- Reprodução direta no YouTube
- Informações de duração, visualizações e data

### 📚 Categorias Implementadas
1. **Podcasts** ✅ - Integração completa com YouTube
2. **Aulas** 🚧 - Em desenvolvimento
3. **Prática** 🚧 - Em desenvolvimento  
4. **Notícias** 🚧 - Em desenvolvimento

## Configuração da API do YouTube

### 1. Obter Chave da API
1. Acesse [Google Cloud Console](https://console.developers.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**
4. Crie credenciais (API Key)
5. Configure restrições (opcional mas recomendado)

### 2. Configurar no Projeto
Adicione a chave no arquivo `.env`:
```bash
VITE_YOUTUBE_API_KEY=sua_chave_da_api_aqui
```

### 3. Limites da API
- **Gratuito**: 10.000 unidades/dia
- **Custo por operação**:
  - Lista de playlist: ~3 unidades
  - Detalhes do vídeo: ~1 unidade por vídeo
- **Renovação**: Diária às 00:00 PST

## Arquitetura

### Componentes
- **DireitoHubFlix.jsx**: Componente principal da interface
- **youtubeService.js**: Serviço de integração com YouTube API

### Fluxo de Dados
1. Usuário seleciona categoria "Podcasts"
2. Sistema busca vídeos da playlist configurada
3. API retorna metadados dos vídeos
4. Interface exibe cards com thumbnails
5. Click abre vídeo no YouTube

## Playlist Configurada

### Meu Curso Educacional - Podcasts Jurídicos
- **URL**: https://www.youtube.com/playlist?list=PLT4MVOUvZvO3UcUYCkUf2lVJ4-Gl9UqyW
- **Canal**: Meu Curso Educacional
- **Playlist ID**: `PLT4MVOUvZvO3UcUYCkUf2lVJ4-Gl9UqyW`
- **Conteúdo**: Podcasts sobre direito e legislação

## Interface

### Design
- **Inspiração**: Netflix/YouTube
- **Cores**: Vermelho para destaque (tema de vídeo)
- **Layout**: Grid responsivo de cards
- **Navegação**: Abas por categoria

### Recursos Visuais
- Thumbnails em alta qualidade
- Duração dos vídeos
- Contador de visualizações
- Data de publicação
- Hover effects para interação

## Funcionalidades Técnicas

### YouTubeService
```javascript
// Buscar vídeos de playlist
await youtubeService.getPlaylistVideos(playlistId, maxResults);

// Informações do canal
await youtubeService.getChannelInfo(channelId);

// Utilitários
youtubeService.extractPlaylistId(url);
youtubeService.extractVideoId(url);
```

### Tratamento de Erros
- API não configurada
- Limite de requisições excedido
- Playlist não encontrada
- Problemas de rede

## Roadmap

### Próximas Funcionalidades
1. **Múltiplas Playlists**: Suporte a várias fontes
2. **Categorias Avançadas**: Filtros por área do direito
3. **Player Integrado**: Reprodução sem sair da aplicação
4. **Favoritos**: Sistema de marcação de conteúdo
5. **Histórico**: Controle de progresso de visualização
6. **Pesquisa**: Busca por título e descrição
7. **Recomendações**: Sugestões baseadas no perfil

### Integrações Futuras
- **Vimeo**: Plataforma alternativa de vídeos
- **Podcast APIs**: Spotify, Apple Podcasts
- **Streaming**: Twitch para lives jurídicas
- **Cursos**: Udemy, Coursera com filtro jurídico

## Segurança

### Restrições de API
- Configurar restrições de IP (produção)
- Limitar por aplicação web
- Monitorar uso de quota

### Dados Sensíveis
- Chaves de API não expostas no frontend
- Logs de debugging desabilitados em produção

## Monitoramento

### Métricas Importantes
- Uso de quota da YouTube API
- Tempo de resposta das requisições
- Taxa de erro de carregamento
- Engagement dos usuários

### Alertas
- Limite de quota próximo (80%)
- Falhas consecutivas na API
- Playlist indisponível

## Status Atual

### ✅ Implementado
- Interface completa do DireitoHub Flix
- Integração com YouTube Data API v3
- Busca de vídeos por playlist
- Cards responsivos com metadados
- Tratamento de erros e estados de loading
- Integração no menu principal

### 🚧 Em Desenvolvimento
- Outras categorias de conteúdo
- Player integrado
- Sistema de favoritos

### 📋 Planejado
- Múltiplas fontes de conteúdo
- Recomendações personalizadas
- Analytics de uso
