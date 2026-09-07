// High-speed verified 4K/HD streaming servers with sub-second response times
// VidSrc 4K is Server 1 by default: zero 404s on Anime & Movies, instant CDN playback
export const SERVERS = [
  {
    id: 'vidsrc_in',
    name: 'Server 1: VidSrc 4K (Ultra Fast 0.5s CDN / 4K UHD)',
    shortName: 'Server 1 (VidSrc 4K)',
    badge: '4K Ultra HD',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    getMovieUrl: (tmdbId) => 'https://vidsrc.in/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.in/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'vidlink',
    name: 'Server 2: VidLink Pro (Fast 1080p / Multi-Audio & Dub)',
    shortName: 'Server 2 (VidLink Pro)',
    badge: 'Multi-Audio',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    getMovieUrl: (tmdbId) => 'https://vidlink.pro/movie/' + tmdbId + '?primaryColor=06b6d4',
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidlink.pro/tv/' + tmdbId + '/' + s + '/' + e + '?primaryColor=06b6d4'
  },
  {
    id: 'vidsrc_cc',
    name: 'Server 3: VidSrc CC (1080p Cloud Mirror)',
    shortName: 'Server 3 (VidSrc CC)',
    badge: '1080p Cloud',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    getMovieUrl: (tmdbId) => 'https://vidsrc.cc/v2/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.cc/v2/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'autoembed',
    name: 'Server 4: AutoEmbed Prime (Instant Play / 1080p HD)',
    shortName: 'Server 4 (AutoEmbed)',
    badge: '1080p HD',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    getMovieUrl: (tmdbId) => 'https://autoembed.co/movie/tmdb/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://autoembed.co/tv/tmdb/' + tmdbId + '-' + s + '-' + e
  },
  {
    id: 'twoembed_vip',
    name: 'Server 5: 2Embed VIP (Direct Playback / Verified)',
    shortName: 'Server 5 (2Embed VIP)',
    badge: 'VIP Stream',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    getMovieUrl: (tmdbId) => 'https://www.2embed.cc/embed/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://www.2embed.cc/embedtv/' + tmdbId + '&s=' + s + '&e=' + e
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 6: VidSrc PM Pro (Ultra HD 1080p Mirror)',
    shortName: 'Server 6 (VidSrc PM)',
    badge: 'Ultra HD',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    getMovieUrl: (tmdbId) => 'https://vidsrc.pm/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.pm/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'vidsrc_to',
    name: 'Server 7: VidSrc TO (Cinema Master / Verified ID)',
    shortName: 'Server 7 (VidSrc TO)',
    badge: 'Cinema Master',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    getMovieUrl: (tmdbId) => 'https://vidsrc.to/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.to/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'multiembed',
    name: 'Server 8: MultiEmbed Global (Multi-Mirror & Alternate Audio)',
    shortName: 'Server 8 (MultiEmbed)',
    badge: 'Multi-Mirror',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    getMovieUrl: (tmdbId) => 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1',
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1&s=' + s + '&e=' + e
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
    return 'https://dl.vidsrc.vip/tv/' + tmdbId + '/' + season + '/' + episode;
  }
  return 'https://dl.vidsrc.vip/movie/' + tmdbId;
}
