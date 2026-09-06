// High-speed 4K/HD multi-server embed provider with verified servers
export const SERVERS = [
  {
    id: 'vidlink_hd',
    name: 'Server 1 (VidLink HD / Ad-Clean & Subtitles)',
    shortName: 'Server 1 (VidLink HD)',
    badge: 'Ad-Clean 4K',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidsrc_vip',
    name: 'Server 2 (VidSrc VIP / 4K Ultra)',
    shortName: 'Server 2 (VidSrc VIP)',
    badge: '4K Ultra',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.pm/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'autoembed_multi',
    name: 'Server 3 (AutoEmbed Hindi Dubbed & Multi-Audio)',
    shortName: 'Server 3 (Hindi Dubbed)',
    badge: 'Hindi + Multi',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  },
  {
    id: 'multiembed_vip',
    name: 'Server 4 (MultiEmbed Dual-Audio 4K)',
    shortName: 'Server 4 (MultiEmbed)',
    badge: 'Dual-Audio',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
  },
  {
    id: 'twoembed_vip',
    name: 'Server 5 (2Embed Global Fast Mirror)',
    shortName: 'Server 5 (2Embed)',
    badge: 'Global Fast',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
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
