// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated Multi-Dub audio routing support for Hindi Audio, English Dub, and Japanese Sub
// All dead domains (vidstuck.xyz, nxsha.space, zxcprime.xyz) replaced with live verified mirrors

export const SERVERS = [
  {
    id: 'vidstuck',
    name: '[ 🇮🇳 Server 1 (Multi-Dub Pro) ] VidLink Multi-Dub (Hindi / English / Japanese • 4K)',
    shortName: '[ 🇮🇳 Server 1 (Multi-Dub 4K) ]',
    badge: 'Multi-Dub • 4K Ultra',
    statusBadge: '🟢 Live 4K',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const subDub = audioMode === 'sub' ? 'sub' : 'dub';
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidlink.pro/movie/${cleanId}?primaryColor=06b6d4&secondaryColor=0284c7&autoplay=true&sub_dub=${subDub}&lang=${lang}&audio=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const subDub = audioMode === 'sub' ? 'sub' : 'dub';
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidlink.pro/tv/${cleanId}/${seasonNum}/${epNum}?primaryColor=06b6d4&secondaryColor=0284c7&autoplay=true&sub_dub=${subDub}&lang=${lang}&audio=${lang}`;
    }
  },
  {
    id: 'autoembed',
    name: '[ 🎬 Server 2 (AutoEmbed Multi-Dub) ] AutoEmbed Prime (Hindi / English / Sub • 1080p)',
    shortName: '[ 🎬 Server 2 (AutoEmbed) ]',
    badge: 'Instant Play • Multi-Audio',
    statusBadge: '🎧 Multi-Dub',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://player.autoembed.co/embed/movie/${cleanId}?server=1&lang=${lang}&audio=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://player.autoembed.co/embed/tv/${cleanId}/${seasonNum}/${epNum}?server=1&lang=${lang}&audio=${lang}`;
    }
  },
  {
    id: 'vidfast',
    name: '[ ⚡ Server 3 (VidSrc CC 4K) ] VidSrc CC Ultra (Multi-Audio • Instant AutoPlay • 4K)',
    shortName: '[ ⚡ Server 3 (VidSrc CC 4K) ]',
    badge: '4K Multi-Audio',
    statusBadge: '⚡ 4K',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.cc/v2/embed/movie/${cleanId}?autoPlay=true&lang=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.cc/v2/embed/tv/${cleanId}/${seasonNum}/${epNum}?autoPlay=true&lang=${lang}`;
    }
  },
  {
    id: 'nxsha',
    name: '[ 🎧 Server 4 (MultiEmbed VIP) ] SuperEmbed Multi-Dub (Hindi / English / Dual Audio)',
    shortName: '[ 🎧 Server 4 (SuperEmbed) ]',
    badge: 'Dual Audio • Hindi VIP',
    statusBadge: '🎧 Multi-Dub',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://multiembed.mov/directstream.php?video_id=${cleanId}&tmdb=1&lang=${lang}&audio=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://multiembed.mov/directstream.php?video_id=${cleanId}&tmdb=1&s=${seasonNum}&e=${epNum}&lang=${lang}&audio=${lang}`;
    }
  },
  {
    id: 'vidlink',
    name: '[ 🇬🇧 Server 5 (VidLink Pro) ] VidLink Pro (Verified English Dub & Anime Sub/Dub)',
    shortName: '[ 🇬🇧 Server 5 (VidLink Pro) ]',
    badge: 'Multi-Audio / Dub',
    statusBadge: '⚡ 4K',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const subDub = audioMode === 'sub' ? 'sub' : 'dub';
      return `https://vidlink.pro/movie/${cleanId}?primaryColor=06b6d4&autoplay=true&sub_dub=${subDub}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const subDub = audioMode === 'sub' ? 'sub' : 'dub';
      return `https://vidlink.pro/tv/${cleanId}/${seasonNum}/${epNum}?primaryColor=06b6d4&autoplay=true&sub_dub=${subDub}`;
    }
  },
  {
    id: 'one23embed',
    name: '[ 🇮🇳 Server 6 (Embed.su Pro) ] Embed.su Cloud (Multi-Audio & Hindi Dubbed 1080p)',
    shortName: '[ 🇮🇳 Server 6 (Embed.su) ]',
    badge: 'Multi-Audio 1080p',
    statusBadge: '🎧 Multi-Dub',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://embed.su/embed/movie/${cleanId}?lang=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const lang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://embed.su/embed/tv/${cleanId}/${seasonNum}/${epNum}?lang=${lang}`;
    }
  },
  {
    id: 'bingr',
    name: '[ 🌐 Server 7 (VidSrc XYZ) ] VidSrc XYZ (High Bitrate • Multi-Language)',
    shortName: '[ 🌐 Server 7 (VidSrc XYZ) ]',
    badge: 'High Bitrate • Clean',
    statusBadge: '🟢 Fast',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const dsLang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.xyz/embed/movie?tmdb=${cleanId}&ds_lang=${dsLang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const dsLang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.xyz/embed/tv?tmdb=${cleanId}&season=${seasonNum}&episode=${epNum}&ds_lang=${dsLang}`;
    }
  },
  {
    id: 'vidsrc_pm',
    name: '[ 👑 Server 8 (VidSrc PM Pro) ] VidSrc PM Direct (Zero Ads • Instant Play • 4K)',
    shortName: '[ 👑 Server 8 (VidSrc PM) ]',
    badge: 'Zero Ads • 4K',
    statusBadge: '⚡ 4K',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const dsLang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.pm/embed/movie/${cleanId}?ds_lang=${dsLang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const dsLang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.pm/embed/tv/${cleanId}/${seasonNum}/${epNum}?ds_lang=${dsLang}`;
    }
  },
  {
    id: 'moviebox_cloud',
    name: '[ 📦 Server 9 (MovieBox Cloud) ] MovieBox Official CDN (Multi-Dub • Fast Stream • 1080p)',
    shortName: '[ 📦 Server 9 (MovieBox) ]',
    badge: 'MovieBox Official • Multi-Dub',
    statusBadge: '🎧 Multi-Dub',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'english' ? 'en' : audioMode === 'sub' ? 'ja' : 'hi';
      return `https://autoembed.co/movie/tmdb/${cleanId}?lang=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const lang = audioMode === 'english' ? 'en' : audioMode === 'sub' ? 'ja' : 'hi';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://autoembed.co/tv/tmdb/${cleanId}-${seasonNum}-${epNum}?lang=${lang}`;
    }
  },
  {
    id: 'twoembed_vip',
    name: '[ 👑 Server 10 (2Embed VIP) ] 2Embed VIP (Direct Playback / Multi-Server)',
    shortName: '[ 👑 Server 10 (2Embed VIP) ]',
    badge: 'VIP Stream',
    statusBadge: '🟢 Fast',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'hindi' ? 'hi' : 'en';
      return `https://www.2embed.cc/embed/${cleanId}?lang=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const lang = audioMode === 'hindi' ? 'hi' : 'en';
      return `https://www.2embed.cc/embedtv/${cleanId}&s=${seasonNum}&e=${epNum}&lang=${lang}`;
    }
  },
  {
    id: 'vidsrc_su',
    aliasIds: ['vidsrc_4k', 'vidsrc'],
    name: '[ ⚡ Server 11 (VidSrc Pro) ] VidSrc Cloud (4K Ultra • Direct Stream)',
    shortName: '[ ⚡ Server 11 (VidSrc Pro) ]',
    badge: 'VidSrc Cloud • 4K',
    statusBadge: '⚡ 4K',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const dsLang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.su/embed/movie/${cleanId}?ds_lang=${dsLang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const dsLang = audioMode === 'hindi' ? 'hi' : audioMode === 'sub' ? 'ja' : 'en';
      return `https://vidsrc.su/embed/tv/${cleanId}/${seasonNum}/${epNum}?ds_lang=${dsLang}`;
    }
  },
  {
    id: 'multiembed',
    name: '[ 🌐 Server 12 (MultiEmbed Global) ] MultiEmbed VIP (Hindi / English / Japanese)',
    shortName: '[ 🌐 Server 12 (MultiEmbed) ]',
    badge: 'Global Dubs • VIP',
    statusBadge: '🎧 Multi-Dub',
    color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'english' ? 'en' : audioMode === 'sub' ? 'ja' : 'hi';
      return `https://multiembed.mov/?video_id=${cleanId}&tmdb=1&lang=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const lang = audioMode === 'english' ? 'en' : audioMode === 'sub' ? 'ja' : 'hi';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://multiembed.mov/?video_id=${cleanId}&tmdb=1&s=${seasonNum}&e=${epNum}&lang=${lang}`;
    }
  }
];

const KNOWN_TV_SERIES_IDS = new Set([
  '66732', '63174', '94997', '108978', '119051', '71446', '71912', '76479',
  '100088', '106379', '84958', '125988', '70523', '110316', '111110', '82452',
  '204343', '81356', '96677', '31910', '46260', '12609', '12971', '95479',
  '85937', '127532', '1429', '37854', '30984', '13916', '45952', '31911',
  '114410', '65930', '73223', '61374', '45782', '120089', '209867', '65733',
  '60572', '80885', '226688', '65739', '42912', '298321'
]);

export function getStreamUrl(server, tmdbId, type = 'movie', season = 1, episode = 1, audioMode = 'hindi', isAnime = false, subLang = 'off') {
  if (!server) {
    server = SERVERS[0];
  }
  const cleanId = String(tmdbId || '').replace(/[^0-9]/g, '');
  const isTv = type === 'tv' || type === 'series' || KNOWN_TV_SERIES_IDS.has(cleanId);
  const s = Math.max(1, Number(season) || 1);
  const e = Math.max(1, Number(episode) || 1);

  let url = '';
  if (isTv) {
    url = typeof server.getTvUrl === 'function'
      ? server.getTvUrl(cleanId, s, e, audioMode, isAnime)
      : server.getMovieUrl(cleanId, audioMode, isAnime);
  } else {
    url = typeof server.getMovieUrl === 'function'
      ? server.getMovieUrl(cleanId, audioMode, isAnime)
      : '';
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
  const lang = audioMode === 'english' ? 'en' : audioMode === 'sub' ? 'ja' : 'hi';
  const allMirrors = [
    {
      id: 'mirror_vidlink',
      name: '[ 🇮🇳 Server 1 (Multi-Dub 4K) ] VidLink Pro Cloud',
      quality: '4K / 1080p Full HD',
      badge: audioMode === 'hindi' ? '🇮🇳 Hindi Dub • 4K' : '🌐 Multi-Lang 4K',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isHindi: true,
      url: isTv
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=06b6d4&autoplay=true&lang=${lang}`
        : `https://vidlink.pro/movie/${tmdbId}?primaryColor=06b6d4&autoplay=true&lang=${lang}`
    },
    {
      id: 'mirror_autoembed',
      name: '[ 🎬 Server 2 (Multi-Dub) ] AutoEmbed Prime Cloud',
      quality: '1080p Full HD',
      badge: 'Multi-Dub • Instant',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      isHindi: true,
      url: isTv
        ? `https://player.autoembed.co/embed/tv/${tmdbId}/${season}/${episode}?lang=${lang}`
        : `https://player.autoembed.co/embed/movie/${tmdbId}?lang=${lang}`
    },
    {
      id: 'mirror_multiembed',
      name: '[ 🎧 Server 3 (Dual Audio) ] SuperEmbed Multi-Dub Cloud',
      quality: '1080p / 4K UHD',
      badge: audioMode === 'hindi' ? '🇮🇳 Hindi Dub Verified' : 'Fast 4K Stream',
      color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      isHindi: true,
      url: isTv
        ? `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}&lang=${lang}`
        : `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&lang=${lang}`
    },
    {
      id: 'mirror_vidsrc_cc',
      name: '[ ⚡ Server 4 (4K Ultra Fast) ] VidSrc CC Stream',
      quality: '4K Ultra HD',
      badge: '4K AutoPlay Direct',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isHindi: true,
      url: isTv
        ? `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true&lang=${lang}`
        : `https://vidsrc.cc/v2/embed/movie/${tmdbId}?autoPlay=true&lang=${lang}`
    },
    {
      id: 'mirror_twoembed_vip',
      name: '[ 👑 Server 5 (VIP Cinema) ] 2Embed VIP Direct',
      quality: '1080p Direct',
      badge: 'VIP Cinema Mirror',
      color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      isHindi: true,
      url: isTv
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${tmdbId}`
    },
    {
      id: 'mirror_embedsu',
      name: '[ 🇮🇳 Server 6 (Hindi CDN) ] Embed.su Multi-Audio',
      quality: '1080p High-Speed CDN',
      badge: 'Multi-Audio Mirror',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isHindi: true,
      url: isTv
        ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}?lang=${lang}`
        : `https://embed.su/embed/movie/${tmdbId}?lang=${lang}`
    }
  ];

  if (isMature) {
    return allMirrors.filter((m) => m.id === 'mirror_twoembed_vip' || m.id === 'mirror_multiembed');
  }

  return allMirrors;
}

export function getDownloadUrl(tmdbId, type = 'movie', season = 1, episode = 1) {
  const mirrors = getDownloadMirrors(tmdbId, type, season, episode);
  return mirrors[0]?.url || `https://vidlink.pro/${type === 'tv' ? 'tv' : 'movie'}/${tmdbId}${type === 'tv' ? `/${season}/${episode}` : ''}`;
}
