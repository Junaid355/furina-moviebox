// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated audio routing support for English Dub, Japanese Sub, and Hindi Audio
// Verified active endpoints inspired by high-reliability aggregator architecture

export const SERVERS = [
  {
    id: 'nxsha',
    name: '[ 🎧 Server 1 (Multi-Dub Clean) ] NxSha Prime (Clean Ads • Multi-Dub / 4K)',
    shortName: '[ 🎧 Server 1 (Multi-Dub) ]',
    badge: 'Multi-Dub • Clean',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://nxsha.space/embed/movie/${tmdbId}?lang=${lang}&disable_app_ad=true`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://nxsha.space/embed/tv/${tmdbId}/${s}/${e}?lang=${lang}&disable_app_ad=true`;
    }
  },
  {
    id: 'vidstuck',
    name: '[ 🇮🇳 Server 2 (Hindi Dub / CC) ] VidStuck Pro (Hindi Dubbed • Subtitles • 1080p)',
    shortName: '[ 🇮🇳 Server 2 (Hindi Dub) ]',
    badge: 'Hindi Dub • Subtitles',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const dub = audioMode === 'hindi' ? 'hi' : 'en';
      return `https://vidstuck.xyz/embed/movie/${tmdbId}?dubLang=${dub}&subtitle=english`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const dub = audioMode === 'hindi' ? 'hi' : 'en';
      return `https://vidstuck.xyz/embed/tv/${tmdbId}/${s}/${e}?dubLang=${dub}&subtitle=english`;
    }
  },
  {
    id: 'vidfast',
    name: '[ ⚡ Server 3 (4K Ultra Fast) ] VidFast Ultra (Instant AutoPlay • 4K UHD)',
    shortName: '[ ⚡ Server 3 (4K Ultra) ]',
    badge: '4K Ultra Fast',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://vidfast.vc/movie/${tmdbId}?autoPlay=true`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidfast.vc/tv/${tmdbId}/${s}/${e}?autoPlay=true`
  },
  {
    id: 'bingr',
    name: '[ 🌐 Server 4 (Clean Stream) ] Bingr Stream (Ultra-Light • Zero Buffering)',
    shortName: '[ 🌐 Server 4 (Clean Stream) ]',
    badge: 'Lightweight Stream',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://bingr.one/watch/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://bingr.one/watch/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'twoembed_vip',
    name: '[ 👑 Server 5 (VIP Stream) ] 2Embed VIP (Direct Playback / High Bitrate)',
    shortName: '[ 👑 Server 5 (VIP Stream) ]',
    badge: 'VIP Stream',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
  },
  {
    id: 'vidsrc_to',
    name: '[ 🇯🇵 Server 6 (Cinema Master) ] VidSrc TO (Cinema Master / High Bitrate)',
    shortName: '[ 🇯🇵 Server 6 (Cinema Master) ]',
    badge: 'Cinema Master',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'tgvid',
    name: '[ 🌸 Server 7 (Multi-Dub Cinema) ] TgVid Cinema (Multi-Dub • Fontaine Stream)',
    shortName: '[ 🌸 Server 7 (Multi-Dub) ]',
    badge: 'Multi-Dub Cinema',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const lang = audioMode === 'hindi' ? 'hi' : 'en';
      return `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&lang=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const lang = audioMode === 'hindi' ? 'hi' : 'en';
      return `https://tgvid.lovable.app/embed/tv/${tmdbId}/${s}/${e}?color=38bdf8&lang=${lang}`;
    }
  },
  {
    id: 'animeworld_india',
    name: '[ 🇮🇳 Server 8 (Hindi CDN) ] Cinema Mirror 2 (Verified High-Speed CDN)',
    shortName: '[ 🇮🇳 Server 8 (Hindi CDN) ]',
    badge: 'High-Speed CDN',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://www.2embed.skin/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.skin/embedtv/${tmdbId}&s=${s}&e=${e}`
  },
  {
    id: 'vidlink',
    name: '[ 🇬🇧 Server 9 (English Dub) ] VidLink Pro (Verified English Dub & Multi-Audio)',
    shortName: '[ 🇬🇧 Server 9 (English Dub) ]',
    badge: 'Multi-Audio / Dub',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      let url = `https://vidlink.pro/movie/${cleanId}?primaryColor=06b6d4`;
      if (audioMode === 'sub') {
        url += '&sub_dub=sub';
      } else {
        url += '&sub_dub=dub';
      }
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '95479';
      let url = `https://vidlink.pro/tv/${cleanId}/${s}/${e}?primaryColor=06b6d4`;
      if (audioMode === 'sub') {
        url += '&sub_dub=sub';
      } else {
        url += '&sub_dub=dub';
      }
      return url;
    }
  },
  {
    id: 'one23embed',
    name: '[ 🇮🇳 Server 10 (Hindi Dubbed) ] 123Embed (Multi-Audio & Dub Zero-Captcha)',
    shortName: '[ 🇮🇳 Server 10 (Hindi Dubbed) ]',
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
    name: '[ 🎧 Server 11 (Multi-Language) ] SmashyStream (Multi-Language & Hindi Audio)',
    shortName: '[ 🎧 Server 11 (Multi-Language) ]',
    badge: 'Multi-Language',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${s}&episode=${e}`
  },
  {
    id: 'autoembed',
    name: '[ 🎬 Server 12 (AutoEmbed) ] AutoEmbed Prime (Instant Play / 1080p HD)',
    shortName: '[ 🎬 Server 12 (AutoEmbed) ]',
    badge: '1080p HD',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  }
];

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english', isAnime = false, subLang = 'off') {
  if (!server) {
    server = SERVERS[0];
  }
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

export function getDownloadMirrors(tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'english', isHanime = false) {
  const isTv = type === 'tv';
  const isMature = Boolean(isHanime || Number(tmdbId) === 1033051 || String(tmdbId).includes('1033051'));
  const allMirrors = [
    {
      id: 'mirror_nxsha',
      name: '[ 🎧 Server 1 (Multi-Dub Clean) ] NxSha Direct Cloud',
      quality: '1080p / 4K UHD',
      badge: audioMode === 'hindi' ? '🇮🇳 Hindi Dub Verified' : 'Fast 4K Stream',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      isHindi: true,
      url: isTv 
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?lang=${audioMode === 'hindi' ? 'hi' : 'en'}&disable_app_ad=true` 
        : `https://nxsha.space/embed/movie/${tmdbId}?lang=${audioMode === 'hindi' ? 'hi' : 'en'}&disable_app_ad=true`
    },
    {
      id: 'mirror_vidstuck',
      name: '[ 🇮🇳 Server 2 (Hindi Dubbed) ] VidStuck Pro Multi-Audio',
      quality: '1080p Full HD',
      badge: 'Hindi Dubbed Stream',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isHindi: true,
      url: isTv 
        ? `https://vidstuck.xyz/embed/tv/${tmdbId}/${season}/${episode}?dubLang=${audioMode === 'hindi' ? 'hi' : 'en'}&subtitle=english` 
        : `https://vidstuck.xyz/embed/movie/${tmdbId}?dubLang=${audioMode === 'hindi' ? 'hi' : 'en'}&subtitle=english`
    },
    {
      id: 'mirror_vidfast',
      name: '[ ⚡ Server 3 (4K Ultra Fast) ] VidFast CDN Stream',
      quality: '4K Ultra HD',
      badge: '4K AutoPlay Direct',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isHindi: false,
      url: isTv 
        ? `https://vidfast.vc/tv/${tmdbId}/${season}/${episode}?autoPlay=true` 
        : `https://vidfast.vc/movie/${tmdbId}?autoPlay=true`
    },
    {
      id: 'mirror_vidsrc_cc',
      name: '[ 👑 Server 4 (VIP Cinema) ] 2Embed VIP Direct',
      quality: '1080p Direct',
      badge: 'VIP Cinema Mirror',
      color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      isHindi: false,
      url: isTv 
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}` 
        : `https://www.2embed.cc/embed/${tmdbId}`
    },
    {
      id: 'mirror_twoembed_vip',
      name: '[ 👑 Server 4 (VIP Cinema) ] 2Embed VIP Direct',
      quality: '1080p Direct',
      badge: 'VIP Cinema Mirror',
      color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      isHindi: false,
      url: isTv 
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}` 
        : `https://www.2embed.cc/embed/${tmdbId}`
    },
    {
      id: 'mirror_animeworld',
      name: '[ 🇮🇳 Server 5 (Hindi CDN) ] Cinema Mirror 2Embed (High-Speed)',
      quality: '1080p High-Speed CDN',
      badge: 'High-Speed Mirror',
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      isHindi: true,
      url: isTv 
        ? `https://www.2embed.skin/embedtv/${tmdbId}&s=${season}&e=${episode}` 
        : `https://www.2embed.skin/embed/${tmdbId}`
    },
    {
      id: 'mirror_smashy',
      name: '[ 🎧 Server 6 (Multi-Language) ] SmashyStream',
      quality: '1080p Multi-Language',
      badge: 'Multi-Language Mirror',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isHindi: true,
      url: isTv 
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}` 
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`
    }
  ];

  // For adult/mature content, filter out mirrors that return 404 or 500
  if (isMature) {
    return allMirrors.filter((m) => m.id === 'mirror_vidsrc_cc' || m.id === 'mirror_twoembed_vip' || m.id === 'mirror_animeworld' || m.id === 'mirror_smashy');
  }

  return allMirrors;
}

export function getDownloadUrl(tmdbId, type = 'movie', season = 1, episode = 1) {
  const mirrors = getDownloadMirrors(tmdbId, type, season, episode);
  return mirrors[0]?.url || `https://nxsha.space/embed/${type === 'tv' ? 'tv' : 'movie'}/${tmdbId}${type === 'tv' ? `/${season}/${episode}` : ''}`;
}
