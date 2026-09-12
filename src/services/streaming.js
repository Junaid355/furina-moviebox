// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated audio routing support for English Dub, Japanese Sub, and Hindi Audio
export const SERVERS = [
  {
    id: 'autoembed',
    name: 'Server 1: AutoEmbed Prime (Instant Play / 1080p HD)',
    shortName: '[ 🇮🇳 Server 1 (Hindi Dubbed) ]',
    badge: '1080p Ultra Fast',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  },
  {
    id: 'vidsrc_in',
    name: 'Server 2: VidSrc 4K (Ultra Fast 0.5s CDN / 4K UHD)',
    shortName: '[ 🎧 Server 2 (Multi-Audio / Dual) ]',
    badge: '4K Ultra HD',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.in/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidlink',
    name: 'Server 3: VidLink Pro (Verified English Dub & Multi-Audio 1080p)',
    shortName: '[ 🇬🇧 Server 3 (English Dub) ]',
    badge: 'Multi-Audio / Dub',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english', isAnime = false) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      let url = `https://vidlink.pro/movie/${cleanId}?primaryColor=06b6d4`;
      // CRITICAL: VidLink Next.js backend only accepts 'sub' or 'dub'.
      // Passing sub_dub=hindi causes fatal 500 Digest: 4082599258 exception!
      if (audioMode === 'sub') {
        url += '&sub_dub=sub';
      } else if (audioMode === 'english') {
        url += '&sub_dub=dub';
      }
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english', isAnime = false) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '95479';
      let url = `https://vidlink.pro/tv/${cleanId}/${s}/${e}?primaryColor=06b6d4`;
      if (audioMode === 'sub') {
        url += '&sub_dub=sub';
      } else if (audioMode === 'english') {
        url += '&sub_dub=dub';
      }
      return url;
    }
  },
  {
    id: 'vidsrc_to',
    name: 'Server 4: VidSrc TO (Cinema Master / Verified ID)',
    shortName: '[ 🇯🇵 Server 4 (Japanese) ]',
    badge: 'Cinema Master',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'twoembed_vip',
    name: 'Server 5: 2Embed VIP (Direct Playback / Verified)',
    shortName: '[ 🇬🇧 Server 5 (English Master) ]',
    badge: 'VIP Stream',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
  },
  {
    id: 'one23embed',
    name: 'Server 6: 123Embed (Multi-Audio & Dub Zero-Captcha)',
    shortName: '[ 🇮🇳 Server 6 (Hindi Dubbed) ]',
    badge: 'Multi-Audio 1080p',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '');
      let url = `https://play2.123embed.net/movie/${cleanId}`;
      if (audioMode === 'hindi') url += '?audio=hi';
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '');
      let url = `https://play2.123embed.net/tv/${cleanId}/${s}/${e}`;
      if (audioMode === 'hindi') url += '?audio=hi';
      return url;
    }
  },
  {
    id: 'smashy',
    name: 'Server 7: SmashyStream (Multi-Language & Hindi Audio)',
    shortName: '[ 🎧 Server 7 (Multi-Language) ]',
    badge: 'Multi-Language',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${s}&episode=${e}`
  },
  {
    id: 'animeworld_india',
    name: 'Server 8: Cinema Mirror 2 (Verified High-Speed CDN)',
    shortName: '[ 🇮🇳 Server 8 (Hindi CDN) ]',
    badge: 'High-Speed CDN',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://www.2embed.skin/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.skin/embedtv/${tmdbId}&s=${s}&e=${e}`
  },
  {
    id: 'multiembed',
    name: 'Server 9: VidSrc PM (Fast Multi-Audio & Dual Mirror)',
    shortName: '[ 🎧 Server 9 (Dual Audio) ]',
    badge: 'Dual Audio Mirror',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '');
      let url = `https://vidsrc.pm/embed/movie/${cleanId}`;
      if (audioMode === 'hindi') url += '?source=multiembed&audio=hi';
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '');
      let url = `https://vidsrc.pm/embed/tv/${cleanId}/${s}/${e}`;
      if (audioMode === 'hindi') url += '?source=multiembed&audio=hi';
      return url;
    }
  },
  {
    id: 'vidsrc_cc',
    name: 'Server 10: VidSrc PM 2 (Fast Multi-Server & Audio Dub)',
    shortName: '[ 🇬🇧 Server 10 (English Dub) ]',
    badge: 'Multi-Server Fast',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.pm/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'embed_su',
    name: 'Server 11: 123Embed VIP (VIP Multi-Language Stream)',
    shortName: '[ 🎧 Server 11 (Multi-Audio VIP) ]',
    badge: 'VIP Multi-Stream',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://play2.123embed.net/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://play2.123embed.net/tv/${tmdbId}/${s}/${e}`
  }
];

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english', isAnime = false, subLang = 'off') {
  if (!server) server = SERVERS[0];
  let url = '';
  if (type === 'tv') {
    url = server.getTvUrl(tmdbId, season, episode, audioMode, isAnime);
  } else {
    url = server.getMovieUrl(tmdbId, audioMode, isAnime);
  }
  if (subLang && subLang !== 'off') {
    const sep = url.includes('?') ? '&' : '?';
    if (!url.includes('sub_lang=') && !url.includes('sub=')) {
      url += `${sep}sub_lang=${subLang}`;
    }
  }
  return url;
}

export function getDownloadMirrors(tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english') {
  const isTv = type === 'tv';
  const allMirrors = [
    {
      id: 'mirror_vidsrc',
      name: 'Server 1: VidSrc Cloud (Verified 4K UHD & Multi-Audio)',
      quality: '1080p / 4K UHD',
      badge: audioMode === 'hindi' ? '🇮🇳 Hindi Dub Verified' : 'Fast 4K CDN',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      isHindi: true,
      url: isTv 
        ? `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}` 
        : `https://vidsrc.in/embed/movie/${tmdbId}`
    },
    {
      id: 'mirror_autoembed',
      name: 'Server 2: AutoEmbed Direct Stream Hub',
      quality: '1080p Full HD',
      badge: 'Multi-Thread Instant Play',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      isHindi: true,
      url: isTv 
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}` 
        : `https://autoembed.co/movie/tmdb/${tmdbId}`
    },
    {
      id: 'mirror_smashy',
      name: 'Server 3: SmashyStream (Multi-Language & Hindi Audio)',
      quality: '1080p Multi-Language',
      badge: '🇮🇳 Hindi Dub Mirror',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isHindi: true,
      url: isTv 
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}` 
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`
    },
    {
      id: 'mirror_animeworld',
      name: 'Server 4: Cinema Mirror 2Embed (High-Speed CDN)',
      quality: '1080p High-Speed CDN',
      badge: 'High-Speed Mirror',
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      isHindi: true,
      url: isTv 
        ? `https://www.2embed.skin/embedtv/${tmdbId}&s=${season}&e=${episode}` 
        : `https://www.2embed.skin/embed/${tmdbId}`
    },
    {
      id: 'mirror_embed_su',
      name: 'Server 5: VidSrc PM (VIP Multi-Language Stream)',
      quality: '1080p VIP Stream',
      badge: 'VIP Multi-Stream',
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      isHindi: true,
      url: isTv 
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}` 
        : `https://vidsrc.pm/embed/movie/${tmdbId}`
    },
    {
      id: 'mirror_vidsrc_cc',
      name: 'Server 6: 2Embed VIP Fast Multi-Server Hub',
      quality: '1080p High Speed',
      badge: 'Multi-Server',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      isHindi: true,
      url: isTv 
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}` 
        : `https://www.2embed.cc/embed/${tmdbId}`
    },
    {
      id: 'mirror_vidlink',
      name: 'Server 7: VidLink Pro Downloader',
      quality: '1080p Ultra Clear',
      badge: 'Dub & Sub',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isHindi: false,
      url: isTv 
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}` 
        : `https://vidlink.pro/movie/${tmdbId}`
    }
  ];

  if (audioMode === 'hindi') {
    return [
      ...allMirrors.filter((m) => m.isHindi),
      ...allMirrors.filter((m) => !m.isHindi)
    ];
  }

  return allMirrors;
}

export function getDownloadUrl(tmdbId, type = 'movie', season = 1, episode = 1) {
  if (type === 'tv') {
    return `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}`;
  }
  return `https://vidsrc.in/embed/movie/${tmdbId}`;
}


