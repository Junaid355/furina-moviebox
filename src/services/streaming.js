// High-speed verified 4K/HD streaming servers with sub-second response times
export const SERVERS = [
  {
    id: 'vidlink',
    name: 'Server 1: VidLink Ultra HD (Zero Ads / Auto-Subtitles)',
    shortName: 'Server 1 (VidLink 4K)',
    badge: 'Fastest 4K',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}?primaryColor=06b6d4`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?primaryColor=06b6d4`
  },
  {
    id: 'multiembed',
    name: 'Server 2: MultiEmbed (🎙️ Hindi Dub & Anime 6-in-1)',
    shortName: 'Server 2 (Hindi Dub / Multi)',
    badge: 'Hindi Dub',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
  },
  {
    id: 'autoembed',
    name: 'Server 3: AutoEmbed Prime (Global Multi-Audio & 1080p)',
    shortName: 'Server 3 (AutoEmbed)',
    badge: 'Multi-Audio',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  },
  {
    id: 'vidsrc_in',
    name: 'Server 4: VidSrc 4K (Hollywood & Bollywood)',
    shortName: 'Server 4 (VidSrc 4K)',
    badge: 'Blockbusters',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.in/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 5: VidSrc PM Pro (Ultra HD CDN)',
    shortName: 'Server 5 (VidSrc PM)',
    badge: 'Ultra HD',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.pm/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'twoembed_vip',
    name: 'Server 6: 2Embed VIP Mirror',
    shortName: 'Server 6 (2Embed VIP)',
    badge: 'VIP Stream',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
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
