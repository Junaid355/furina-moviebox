// High-speed verified 4K/HD streaming servers with sub-second response times
export const SERVERS = [
  {
    id: 'vidsrc_in',
    name: 'Server 1 (VidSrc Fast 4K / Sub-second)',
    shortName: 'Server 1 (VidSrc 4K)',
    badge: 'Fast 4K',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.in/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'twoembed_vip',
    name: 'Server 2 (2Embed Global Fast Mirror)',
    shortName: 'Server 2 (2Embed)',
    badge: 'Global Fast',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 3 (VidSrc PM / Ultra HD Mirror)',
    shortName: 'Server 3 (VidSrc PM)',
    badge: 'Ultra HD',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.pm/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidsrc_me',
    name: 'Server 4 (VidSrc ME / CDN Stream)',
    shortName: 'Server 4 (VidSrc ME)',
    badge: 'CDN Mirror',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}`
  },
  {
    id: 'vidlink_hd',
    name: 'Server 5 (VidLink HD / Subtitles)',
    shortName: 'Server 5 (VidLink HD)',
    badge: '1080p CC',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
  }
];

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1) {
  if (!server) server = SERVERS[0];
  if (type === 'tv') {
    return server.getTvUrl(tmdbId, season, episode);
  }
  return server.getMovieUrl(tmdbId);
}
