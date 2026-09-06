// High-speed verified 4K/HD streaming servers with sub-second response times
export const SERVERS = [
  {
    id: 'vidlink_hindi',
    name: 'Server 1: VidLink Multi-Audio (🎙️ Hindi Dubbed & Multi-Language)',
    shortName: '🎙️ Hindi Dub (VidLink)',
    badge: '🎙️ Hindi Dubbed',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}?multiLang=true`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?multiLang=true`
  },
  {
    id: 'autoembed',
    name: 'Server 2: AutoEmbed Prime (Instant Play / 1080p HD)',
    shortName: 'Server 2 (AutoEmbed)',
    badge: '1080p HD',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  },
  {
    id: 'vidsrc_in',
    name: 'Server 3: VidSrc 4K (Ultra Fast 0.5s CDN / 4K UHD)',
    shortName: 'Server 3 (VidSrc 4K)',
    badge: '4K Ultra HD',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.in/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'smashystream',
    name: 'Server 4: Smashy AnyEmbed (🌐 Multi-Audio & Subtitles)',
    shortName: '🌐 Multi-Audio (Smashy)',
    badge: 'Dual-Audio & Subs',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://embed.smashystream.com/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 5: VidSrc PM Pro (Ultra HD 1080p Mirror)',
    shortName: 'Server 5 (VidSrc PM)',
    badge: 'Ultra HD',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.pm/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidsrc_to',
    name: 'Server 6: VidSrc TO (Cinema Master / Verified ID)',
    shortName: 'Server 6 (VidSrc TO)',
    badge: 'Cinema Master',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidsrc_su',
    name: 'Server 7: VidSrc SU (Global Mirror / Verified ID)',
    shortName: 'Server 7 (VidSrc SU)',
    badge: 'Global Mirror',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.su/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.su/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'twoembed_vip',
    name: 'Server 8: 2Embed VIP (Direct Playback / Verified)',
    shortName: 'Server 8 (2Embed VIP)',
    badge: 'VIP Stream',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
  }
];

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1) {
  if (!server) server = SERVERS[0];
  if (type === 'tv') {
    return server.getTvUrl(tmdbId, season, episode);
  }
  return server.getMovieUrl(tmdbId);
}

export function getDownloadUrl(tmdbId, type = 'movie', season = 1, episode = 1) {
  if (type === 'tv') {
    return `https://dl.vidsrc.vip/tv/${tmdbId}/${season}/${episode}`;
  }
  return `https://dl.vidsrc.vip/movie/${tmdbId}`;
}
