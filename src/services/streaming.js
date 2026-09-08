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
    id: 'multiembed',
    name: 'Server 6: MultiEmbed (Multi-Audio & Hindi Fallback)',
    shortName: 'Server 6 (MultiEmbed)',
    badge: 'Multi-Audio Mirror',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      let url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      if (audioMode === 'hindi') url += '&audio=hi';
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      let url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`;
      if (audioMode === 'hindi') url += '&audio=hi';
      return url;
    }
  }
];

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english', isAnime = false) {
  if (!server) server = SERVERS[0];
  if (type === 'tv') {
    return server.getTvUrl(tmdbId, season, episode, audioMode, isAnime);
  }
  return server.getMovieUrl(tmdbId, audioMode, isAnime);
}

export function getDownloadUrl(tmdbId, type = 'movie', season = 1, episode = 1) {
  if (type === 'tv') {
    return 'https://dl.vidsrc.vip/tv/' + tmdbId + '/' + season + '/' + episode;
  }
  return 'https://dl.vidsrc.vip/movie/' + tmdbId;
}

