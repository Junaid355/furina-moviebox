// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated audio routing support for English Dub, Japanese Sub, and Hindi Audio
export const SERVERS = [
  {
    id: 'vidlink',
    name: 'Server 1: VidLink Pro (Verified English Dub & Multi-Audio 1080p)',
    shortName: 'Server 1 (VidLink Pro)',
    badge: 'Multi-Audio / Dub',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const dubParam = audioMode === 'sub' ? '&sub_dub=sub' : '&sub_dub=dub';
      return 'https://vidlink.pro/movie/' + tmdbId + '?primaryColor=06b6d4' + dubParam;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const dubParam = audioMode === 'sub' ? '&sub_dub=sub' : '&sub_dub=dub';
      return 'https://vidlink.pro/tv/' + tmdbId + '/' + s + '/' + e + '?primaryColor=06b6d4' + dubParam;
    }
  },
  {
    id: 'multiembed',
    name: 'Server 2: MultiEmbed (Hindi Dub & Multi-Audio Blockbusters)',
    shortName: 'Server 2 (MultiEmbed)',
    badge: '🇮🇳 Hindi / Multi-Audio',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1',
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://multiembed.mov/?video_id=' + tmdbId + '&tmdb=1&s=' + s + '&e=' + e
  },
  {
    id: 'vidsrc_in',
    name: 'Server 3: VidSrc 4K (Ultra Fast 0.5s CDN / 4K UHD)',
    shortName: 'Server 3 (VidSrc 4K)',
    badge: '4K Ultra HD',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    supportedAudios: ['sub', 'english'],
    getMovieUrl: (tmdbId) => 'https://vidsrc.in/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.in/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'vidsrc_me',
    name: 'Server 4: VidSrc ME (Fast Direct Stream / Multi-Host)',
    shortName: 'Server 4 (VidSrc ME)',
    badge: 'Fast Stream',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    supportedAudios: ['sub', 'english'],
    getMovieUrl: (tmdbId) => 'https://vidsrc.me/embed/movie?tmdb=' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.me/embed/tv?tmdb=' + tmdbId + '&season=' + s + '&episode=' + e
  },
  {
    id: 'vidsrc_cc',
    name: 'Server 5: VidSrc CC (1080p Cloud Mirror)',
    shortName: 'Server 5 (VidSrc CC)',
    badge: '1080p Cloud',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    supportedAudios: ['sub', 'english'],
    getMovieUrl: (tmdbId) => 'https://vidsrc.cc/v2/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.cc/v2/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'twoembed_vip',
    name: 'Server 6: 2Embed VIP (Direct Playback / Verified)',
    shortName: 'Server 6 (2Embed VIP)',
    badge: 'VIP Stream',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    supportedAudios: ['sub', 'english'],
    getMovieUrl: (tmdbId) => 'https://www.2embed.cc/embed/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://www.2embed.cc/embedtv/' + tmdbId + '&s=' + s + '&e=' + e
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 7: VidSrc PM Pro (Ultra HD 1080p Mirror)',
    shortName: 'Server 7 (VidSrc PM)',
    badge: 'Ultra HD',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    supportedAudios: ['sub', 'english'],
    getMovieUrl: (tmdbId) => 'https://vidsrc.pm/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.pm/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'vidsrc_to',
    name: 'Server 8: VidSrc TO (Cinema Master / Verified ID)',
    shortName: 'Server 8 (VidSrc TO)',
    badge: 'Cinema Master',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    supportedAudios: ['sub', 'english'],
    getMovieUrl: (tmdbId) => 'https://vidsrc.to/embed/movie/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://vidsrc.to/embed/tv/' + tmdbId + '/' + s + '/' + e
  },
  {
    id: 'autoembed',
    name: 'Server 9: AutoEmbed Prime (Instant Play / 1080p HD)',
    shortName: 'Server 9 (AutoEmbed)',
    badge: '1080p HD',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['sub', 'english'],
    getMovieUrl: (tmdbId) => 'https://autoembed.co/movie/tmdb/' + tmdbId,
    getTvUrl: (tmdbId, s = 1, e = 1) => 'https://autoembed.co/tv/tmdb/' + tmdbId + '-' + s + '-' + e
  }
];

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english') {
  if (!server) server = SERVERS[0];
  if (type === 'tv') {
    return server.getTvUrl(tmdbId, season, episode, audioMode);
  }
  return server.getMovieUrl(tmdbId, audioMode);
}

export function getDownloadUrl(tmdbId, type = 'movie', season = 1, episode = 1) {
  if (type === 'tv') {
    return 'https://dl.vidsrc.vip/tv/' + tmdbId + '/' + season + '/' + episode;
  }
  return 'https://dl.vidsrc.vip/movie/' + tmdbId;
}

