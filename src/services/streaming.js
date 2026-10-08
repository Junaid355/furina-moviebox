// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated audio routing support for English Dub, Japanese Sub, and Hindi Audio
// Verified active endpoints inspired by high-reliability aggregator architecture

export const SERVERS = [
  {
    id: 'tgvid',
    name: '[ 🌸 Server 1 (Ad-Free Cinema) ] TgVid Prime (Ad-Free • Multi-Language / HD)',
    shortName: '[ 🌸 Server 1 (Ad-Free) ]',
    badge: 'Ad-Free • Multi-Lang',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi', isAnime = false) => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      let url = `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&back=true&lang=${lang}`;
      if (audioMode === 'sub' || isAnime) {
        url += '&sub_lang=ja';
      }
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi', isAnime = false) => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      let url = `https://tgvid.lovable.app/embed/tv/${tmdbId}/${s}/${e}?color=38bdf8&back=true&lang=${lang}&episodeSelector=false&autoplayNextEp=false`;
      if (audioMode === 'sub' || isAnime) {
        url += '&sub_lang=ja';
      }
      return url;
    }
  },
  {
    id: 'vidstuck',
    name: '[ 🇮🇳 Server 2 (Hindi Dub / CC) ] VidStuck Pro (Centaurus • Multi-Dub • 1080p)',
    shortName: '[ 🇮🇳 Server 2 (Hindi Dub) ]',
    badge: 'Multi-Dub • Centaurus',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const dub = audioMode === 'english' ? 'en' : 'hi';
      return `https://vidstuck.xyz/embed/movie/${tmdbId}?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=${dub}&subtitle=english&loading=2`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const dub = audioMode === 'english' ? 'en' : 'hi';
      return `https://vidstuck.xyz/embed/tv/${tmdbId}/${s}/${e}?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=${dub}&subtitle=english&loading=2`;
    }
  },
  {
    id: 'bingr',
    name: '[ 🌐 Server 3 (Clean Stream) ] Bingr Stream (High Bitrate • Ultra-Light)',
    shortName: '[ 🌐 Server 3 (Clean Stream) ]',
    badge: 'High Bitrate • Light',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://bingr.one/watch/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://bingr.one/watch/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'zxcstream',
    name: '[ ⚡ Server 4 (Roxy Stream) ] ZXC Roxy (Fast Streams • Zero Captcha)',
    shortName: '[ ⚡ Server 4 (Roxy) ]',
    badge: 'Fast Streams',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      return `https://zxcstream.xyz/player/movie/${tmdbId}?dubLang=${lang}&server=0`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      return `https://zxcstream.xyz/player/tv/${tmdbId}/${s}/${e}?dubLang=${lang}&server=0`;
    }
  },
  {
    id: 'vidfast',
    name: '[ ⚡ Server 5 (4K Ultra Fast) ] VidFast Ultra (Instant AutoPlay • 4K UHD)',
    shortName: '[ ⚡ Server 5 (4K Ultra) ]',
    badge: '4K Ultra Fast',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://vidfast.vc/movie/${tmdbId}?autoPlay=true`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidfast.vc/tv/${tmdbId}/${s}/${e}?autoPlay=true`
  },
  {
    id: 'nxsha',
    name: '[ 🎧 Server 6 (Dual Audio) ] NxSha Prime (Clean Ads • Dual Audio / 4K)',
    shortName: '[ 🎧 Server 6 (Dual Audio) ]',
    badge: 'Dual Audio • 4K',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : audioMode === 'sub' ? 'ja' : 'hi';
      return `https://nxsha.space/embed/movie/${tmdbId}?lang=${lang}&disable_app_ad=true`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : audioMode === 'sub' ? 'ja' : 'hi';
      return `https://nxsha.space/embed/tv/${tmdbId}/${s}/${e}?lang=${lang}&disable_app_ad=true`;
    }
  },
  {
    id: 'twoembed_vip',
    name: '[ 👑 Server 7 (VIP Stream) ] 2Embed VIP (Direct Playback / High Bitrate)',
    shortName: '[ 👑 Server 7 (VIP Stream) ]',
    badge: 'VIP Stream',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
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

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'hindi', isAnime = false, subLang = 'off') {
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

export function getDownloadMirrors(tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'hindi', isHanime = false) {
  const isTv = type === 'tv';
  const isMature = Boolean(isHanime || Number(tmdbId) === 1033051 || String(tmdbId).includes('1033051'));
  const allMirrors = [
    {
      id: 'mirror_tgvid',
      name: '[ 🌸 Server 1 (Ad-Free Cinema) ] TgVid Direct Cloud',
      quality: '1080p Full HD',
      badge: audioMode === 'hindi' ? '🌸 Ad-Free • Hindi Dub' : '🌸 Ad-Free Multi-Lang',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isHindi: true,
      url: isTv 
        ? `https://tgvid.lovable.app/embed/tv/${tmdbId}/${season}/${episode}?color=38bdf8&back=true&lang=${audioMode === 'english' ? 'en' : 'hi'}` 
        : `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&back=true&lang=${audioMode === 'english' ? 'en' : 'hi'}`
    },
    {
      id: 'mirror_vidstuck',
      name: '[ 🇮🇳 Server 2 (Hindi Dubbed) ] VidStuck Centaurus Cloud',
      quality: '1080p Full HD',
      badge: 'Hindi Dubbed • Centaurus',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isHindi: true,
      url: isTv 
        ? `https://vidstuck.xyz/embed/tv/${tmdbId}/${season}/${episode}?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=${audioMode === 'english' ? 'en' : 'hi'}&subtitle=english&loading=2` 
        : `https://vidstuck.xyz/embed/movie/${tmdbId}?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=${audioMode === 'english' ? 'en' : 'hi'}&subtitle=english&loading=2`
    },
    {
      id: 'mirror_nxsha',
      name: '[ 🎧 Server 3 (Dual Audio) ] NxSha Direct Cloud',
      quality: '1080p / 4K UHD',
      badge: audioMode === 'hindi' ? '🇮🇳 Hindi Dub Verified' : 'Fast 4K Stream',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      isHindi: true,
      url: isTv 
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?lang=${audioMode === 'english' ? 'en' : 'hi'}&disable_app_ad=true` 
        : `https://nxsha.space/embed/movie/${tmdbId}?lang=${audioMode === 'english' ? 'en' : 'hi'}&disable_app_ad=true`
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
    },
    {
      id: 'mirror_megaplay',
      name: '[ 🌸 Server 7 (MegaPlay Multi-Dub) ] MegaPlay Direct',
      quality: '1080p Multi-Dub',
      badge: 'MegaPlay Sub/Dub',
      color: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      isHindi: false,
      url: isTv
        ? `https://megaplay.buzz/stream/ani/${tmdbId}/${episode}/${audioMode === 'english' ? 'dub' : 'sub'}?autoplay=true`
        : `https://megaplay.buzz/stream/ani/${tmdbId}/1/${audioMode === 'english' ? 'dub' : 'sub'}?autoplay=true`
    },
    {
      id: 'mirror_zokoanime',
      name: '[ ⚡ Server 8 (ZokoAnime Multi-Dub) ] ZokoAnime Direct',
      quality: '1080p Ultra',
      badge: 'Zoko Direct Stream',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isHindi: false,
      url: isTv
        ? `https://zokoanime.video/stream/ani/${tmdbId}/${episode}/${audioMode === 'english' ? 'dub' : 'sub'}`
        : `https://zokoanime.video/stream/ani/${tmdbId}/1/${audioMode === 'english' ? 'dub' : 'sub'}`
    },
    {
      id: 'mirror_4animo',
      name: '[ 🎬 Server 9 (4Animo HD-3) ] 4Animo Multi-Dub CDN',
      quality: '1080p HD-3',
      badge: '4Animo Multi-Dub',
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      isHindi: false,
      url: isTv
        ? `https://cdn.4animo.xyz/embed/hd-3/ani/${tmdbId}/${episode}/${audioMode === 'english' ? 'dub' : 'sub'}?k=1&autoplay=1`
        : `https://cdn.4animo.xyz/embed/hd-3/ani/${tmdbId}/1/${audioMode === 'english' ? 'dub' : 'sub'}?k=1&autoplay=1`
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
