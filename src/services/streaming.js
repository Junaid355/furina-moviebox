// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated audio routing support for English Dub, Japanese Sub, and Hindi Audio
export const SERVERS = [
  {
    id: 'autoembed',
    name: 'Server 1: AutoEmbed Prime (Instant Play / 1080p HD)',
    shortName: 'Server 1 (AutoEmbed)',
    badge: '1080p Ultra Fast',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  },
  {
    id: 'vidsrc_in',
    name: 'Server 2: VidSrc 4K (Ultra Fast 0.5s CDN / 4K UHD)',
    shortName: 'Server 2 (VidSrc 4K)',
    badge: '4K Ultra HD',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.in/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidlink',
    name: 'Server 3: VidLink Pro (Verified English Dub & Multi-Audio 1080p)',
    shortName: 'Server 3 (VidLink Pro)',
    badge: 'Multi-Audio / Dub',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english', isAnime = false) => {
      let url = `https://vidlink.pro/movie/${tmdbId}?primaryColor=06b6d4`;
      if (isAnime) {
        if (audioMode === 'sub') {
          url += '&sub_dub=sub';
        } else if (audioMode === 'hindi') {
          url += '&sub_dub=hindi';
        } else {
          url += '&sub_dub=dub';
        }
      }
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english', isAnime = false) => {
      let url = `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?primaryColor=06b6d4`;
      if (isAnime) {
        if (audioMode === 'sub') {
          url += '&sub_dub=sub';
        } else if (audioMode === 'hindi') {
          url += '&sub_dub=hindi';
        } else {
          url += '&sub_dub=dub';
        }
      }
      return url;
    }
  },
  {
    id: 'vidsrc_to',
    name: 'Server 4: VidSrc TO (Cinema Master / Verified ID)',
    shortName: 'Server 4 (VidSrc TO)',
    badge: 'Cinema Master',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'twoembed_vip',
    name: 'Server 5: 2Embed VIP (Direct Playback / Verified)',
    shortName: 'Server 5 (2Embed VIP)',
    badge: 'VIP Stream',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
  },
  {
    id: 'one23embed',
    name: 'Server 6: 123Embed (Multi-Audio & Dub Zero-Captcha)',
    shortName: 'Server 6 (123Embed)',
    badge: 'Multi-Audio 1080p',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://play2.123embed.net/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://play2.123embed.net/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'smashy',
    name: 'Server 7: SmashyStream (Multi-Language & Hindi Audio)',
    shortName: 'Server 7 (SmashyStream)',
    badge: 'Multi-Language',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${s}&episode=${e}`
  },
  {
    id: 'animeworld_india',
    name: 'Server 8: AnimeWorld India & Tatakai (High-Speed CDN)',
    shortName: 'Server 8 (AnimeWorld/Tatakai)',
    badge: '🇮🇳 High-Speed CDN',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.in/embed/tv/${tmdbId}/${s}/${e}`
  }
];

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english', isAnime = false) {
  if (!server) server = SERVERS[0];
  if (type === 'tv') {
    return server.getTvUrl(tmdbId, season, episode, audioMode, isAnime);
  }
  return server.getMovieUrl(tmdbId, audioMode, isAnime);
}

export function getDownloadMirrors(tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english') {
  const isTv = type === 'tv';
  return [
    {
      id: 'mirror_vidsrc',
      name: 'Server 1: VidSrc Cloud Downloader',
      quality: '1080p / 4K UHD',
      badge: 'Fast CDN',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      url: isTv 
        ? `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}` 
        : `https://vidsrc.in/embed/movie/${tmdbId}`
    },
    {
      id: 'mirror_autoembed',
      name: 'Server 2: AutoEmbed Direct Stream Hub',
      quality: '1080p Full HD',
      badge: 'Multi-Thread',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      url: isTv 
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}` 
        : `https://autoembed.co/movie/tmdb/${tmdbId}`
    },
    {
      id: 'mirror_123embed',
      name: 'Server 3: 123Embed (Multi-Audio & Hindi Dub)',
      quality: '1080p Multi-Audio',
      badge: 'Hindi Dub Mirror',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      url: isTv 
        ? `https://play2.123embed.net/tv/${tmdbId}/${season}/${episode}` 
        : `https://play2.123embed.net/movie/${tmdbId}`
    },
    {
      id: 'mirror_vidlink',
      name: 'Server 4: VidLink Pro Downloader',
      quality: '1080p Ultra Clear',
      badge: 'Dub & Sub',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      url: isTv 
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}` 
        : `https://vidlink.pro/movie/${tmdbId}`
    }
  ];
}

export function getDownloadUrl(tmdbId, type = 'movie', season = 1, episode = 1) {
  if (type === 'tv') {
    return `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}`;
  }
  return `https://vidsrc.in/embed/movie/${tmdbId}`;
}

