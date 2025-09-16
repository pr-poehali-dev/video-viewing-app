export interface VideoInfo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  platform: 'youtube' | 'twitch' | 'direct' | 'unknown';
  embedUrl: string;
  originalUrl: string;
}

export interface ParsedVideo {
  isValid: boolean;
  videoInfo?: VideoInfo;
  error?: string;
}

export class VideoParser {
  private static youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  private static twitchRegex = /(?:twitch\.tv\/)(?:videos\/)?(\d+)|(?:twitch\.tv\/)([a-zA-Z0-9_]+)/;
  private static directVideoRegex = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(?:\?.*)?$/i;

  static async parseVideoUrl(url: string): Promise<ParsedVideo> {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      
      // YouTube detection
      const youtubeMatch = normalizedUrl.match(this.youtubeRegex);
      if (youtubeMatch) {
        return await this.parseYouTubeVideo(youtubeMatch[1], normalizedUrl);
      }

      // Twitch detection
      const twitchMatch = normalizedUrl.match(this.twitchRegex);
      if (twitchMatch) {
        return await this.parseTwitchVideo(twitchMatch[1] || twitchMatch[2], normalizedUrl);
      }

      // Direct video link detection
      if (this.directVideoRegex.test(normalizedUrl)) {
        return this.parseDirectVideo(normalizedUrl);
      }

      // Try to extract video from any webpage
      return await this.parseWebpageVideo(normalizedUrl);
      
    } catch (error) {
      return {
        isValid: false,
        error: `Ошибка обработки ссылки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  private static normalizeUrl(url: string): string {
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    return url;
  }

  private static async parseYouTubeVideo(videoId: string, originalUrl: string): Promise<ParsedVideo> {
    try {
      // В реальном приложении здесь был бы запрос к YouTube Data API
      // Для демонстрации используем моковые данные
      const mockVideoInfo: VideoInfo = {
        id: videoId,
        title: `YouTube Video ${videoId}`,
        duration: '10:30',
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`,
        originalUrl
      };

      return {
        isValid: true,
        videoInfo: mockVideoInfo
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Не удалось загрузить информацию о YouTube видео'
      };
    }
  }

  private static async parseTwitchVideo(videoId: string, originalUrl: string): Promise<ParsedVideo> {
    try {
      // В реальном приложении здесь был бы запрос к Twitch API
      const isLive = !originalUrl.includes('videos/');
      
      const mockVideoInfo: VideoInfo = {
        id: videoId,
        title: isLive ? `Live Stream: ${videoId}` : `Twitch VOD: ${videoId}`,
        duration: isLive ? 'LIVE' : '45:20',
        thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${videoId}.jpg`,
        platform: 'twitch',
        embedUrl: isLive 
          ? `https://player.twitch.tv/?channel=${videoId}&parent=${window.location.hostname}`
          : `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`,
        originalUrl
      };

      return {
        isValid: true,
        videoInfo: mockVideoInfo
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Не удалось загрузить информацию о Twitch стриме'
      };
    }
  }

  private static parseDirectVideo(url: string): ParsedVideo {
    const filename = url.split('/').pop()?.split('?')[0] || 'Видео';
    
    const videoInfo: VideoInfo = {
      id: this.generateId(),
      title: filename,
      duration: '??:??',
      thumbnail: '🎬',
      platform: 'direct',
      embedUrl: url,
      originalUrl: url
    };

    return {
      isValid: true,
      videoInfo
    };
  }

  private static async parseWebpageVideo(url: string): Promise<ParsedVideo> {
    try {
      // В реальном приложении здесь был бы парсинг страницы для поиска видео
      // Можно использовать oEmbed или метатеги Open Graph
      
      // Для демонстрации возвращаем заглушку
      const videoInfo: VideoInfo = {
        id: this.generateId(),
        title: 'Видео с веб-страницы',
        duration: '??:??',
        thumbnail: '🌐',
        platform: 'unknown',
        embedUrl: url,
        originalUrl: url
      };

      return {
        isValid: true,
        videoInfo
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Не удалось извлечь видео с указанной страницы'
      };
    }
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static getEmbedHtml(videoInfo: VideoInfo): string {
    switch (videoInfo.platform) {
      case 'youtube':
        return `<iframe 
          width="100%" 
          height="100%" 
          src="${videoInfo.embedUrl}" 
          frameborder="0" 
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>`;
        
      case 'twitch':
        return `<iframe 
          width="100%" 
          height="100%" 
          src="${videoInfo.embedUrl}" 
          frameborder="0" 
          allowfullscreen
          scrolling="no">
        </iframe>`;
        
      case 'direct':
        return `<video 
          width="100%" 
          height="100%" 
          controls 
          autoplay
          src="${videoInfo.embedUrl}">
          Ваш браузер не поддерживает видео HTML5.
        </video>`;
        
      default:
        return `<iframe 
          width="100%" 
          height="100%" 
          src="${videoInfo.embedUrl}" 
          frameborder="0" 
          allowfullscreen>
        </iframe>`;
    }
  }
}