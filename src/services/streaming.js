// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated audio routing support for English Dub, Japanese Sub, and Hindi Audio
// Verified active endpoints inspired by high-reliability aggregator architecture

export const SERVERS = [
  {
    id: 'autoembed',
    aliasIds: ['autoembed_co', 'autoembed_cdn'],
    name: '[ 🇮🇳 Server 1 (Multi-Dub Prime) ] AutoEmbed Prime (Hindi / English / Japanese • 1080p Ultra)',
    shortName: '[ 🇮🇳 Server 1 (Multi-Dub) ]',
    badge: 'Multi-Dub • Instant Play',
    statusBadge: '🎧 Multi-Dub',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    supportsAudioSwitching: true,
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'english' ? 'en' : (audioMode === 'sub' ? 'ja' : 'hi');
      return `https://player.autoembed.co/embed/movie/${cleanId}?lang=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const lang = audioMode === 'english' ? 'en' : (audioMode === 'sub' ? 'ja' : 'hi');
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://player.autoembed.co/embed/tv/${cleanId}/${seasonNum}/${epNum}?lang=${lang}`;
    }
  },
  {
    id: 'vidsrc_pm',
    aliasIds: ['vidsrcpm'],
    name: '[ 👑 Server 2 (VidSrc PM Pro) ] VidSrc PM Direct (Zero Ads • Instant Play • 4K)',
    shortName: '[ 👑 Server 2 (VidSrc PM) ]',
    badge: 'Zero Ads • 4K UHD',
    statusBadge: '⚡ 4K',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    supportsAudioSwitching: true,
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://vidsrc.pm/embed/movie/${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://vidsrc.pm/embed/tv/${cleanId}/${seasonNum}/${epNum}`;
    }
  },
  {
    id: 'vidfast',
    aliasIds: ['vidfast_vc'],
    name: '[ ⚡ Server 3 (4K Ultra Fast) ] VidFast Ultra (Instant AutoPlay • 4K UHD)',
    shortName: '[ ⚡ Server 3 (4K Ultra) ]',
    badge: '4K Ultra Fast',
    statusBadge: '⚡ 4K',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    supportsAudioSwitching: true,
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://vidfast.vc/movie/${cleanId}?autoPlay=true`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://vidfast.vc/tv/${cleanId}/${seasonNum}/${epNum}?autoPlay=true`;
    }
  },
  {
    id: 'vidlink',
    aliasIds: ['vidlink_pro'],
    name: '[ 🎧 Server 4 (VidLink Multi-Dub) ] VidLink Pro (Verified Multi-Dub & English • 4K)',
    shortName: '[ 🎧 Server 4 (VidLink Pro) ]',
    badge: 'Multi-Audio / Dub',
    statusBadge: '🎧 Multi-Dub',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    supportsAudioSwitching: true,
    getMovieUrl: (tmdbId, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const subDub = audioMode === 'sub' ? 'sub' : 'dub';
      return `https://vidlink.pro/movie/${cleanId}?primaryColor=06b6d4&sub_dub=${subDub}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'english') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      const subDub = audioMode === 'sub' ? 'sub' : 'dub';
      return `https://vidlink.pro/tv/${cleanId}/${seasonNum}/${epNum}?primaryColor=06b6d4&sub_dub=${subDub}`;
    }
  },
  {
    id: 'vidsrc_su',
    aliasIds: ['vidsrc_4k', 'vidsrcsu'],
    name: '[ 🚀 Server 5 (VidSrc Cloud 4K) ] VidSrc Cloud (Ultra-Fast 0.5s • Direct 4K)',
    shortName: '[ 🚀 Server 5 (VidSrc 4K) ]',
    badge: 'VidSrc Cloud • 4K Direct',
    statusBadge: '🟢 Fast',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    supportsAudioSwitching: true,
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://vidsrc.su/embed/movie/${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://vidsrc.su/embed/tv/${cleanId}/${seasonNum}/${epNum}`;
    }
  },
  {
    id: 'one23embed',
    aliasIds: ['vidstuck', '123embed'],
    name: '[ 🎬 Server 6 (123Embed Direct V2) ] 123Embed Direct Player (Zero-Timeout • 1080p HD)',
    shortName: '[ 🎬 Server 6 (123Embed) ]',
    badge: 'Direct Stream • 1080p',
    statusBadge: '🟢 Fast',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    supportsAudioSwitching: true,
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://play.123embed.net/mv/${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://play.123embed.net/tv/${cleanId}/${seasonNum}/${epNum}`;
    }
  },
  {
    id: 'smashy',
    aliasIds: ['smashystream'],
    name: '[ 🌐 Server 7 (SmashyStream Clean) ] SmashyStream Direct (Clean Stream • High Bitrate)',
    shortName: '[ 🌐 Server 7 (Clean Stream) ]',
    badge: 'Clean Stream • 1080p',
    statusBadge: '🛡️ Ad-Free',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    supportsAudioSwitching: true,
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://embed.smashystream.com/playere.php?tmdb=${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://embed.smashystream.com/playere.php?tmdb=${cleanId}&season=${seasonNum}&episode=${epNum}`;
    }
  },
  {
    id: 'twoembed_vip',
    aliasIds: ['twoembed', '2embed'],
    name: '[ 👑 Server 8 (2Embed VIP) ] 2Embed VIP (Direct Playback • High Bitrate)',
    shortName: '[ 👑 Server 8 (VIP Stream) ]',
    badge: 'VIP Cinema Stream',
    statusBadge: '🟢 Fast',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    supportedAudios: ['english', 'sub'],
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://www.2embed.cc/embed/${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://www.2embed.cc/embedtv/${cleanId}&s=${seasonNum}&e=${epNum}`;
    }
  },
  {
    id: 'vidsrc_to',
    aliasIds: ['vidsrcto'],
    name: '[ ⚡ Server 9 (VidSrc TO Direct) ] VidSrc TO (Reliable 1080p HD)',
    shortName: '[ ⚡ Server 9 (VidSrc TO) ]',
    badge: '1080p HD • Fast',
    statusBadge: '⚡ 4K',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://vidsrc.to/embed/movie/${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://vidsrc.to/embed/tv/${cleanId}/${seasonNum}/${epNum}`;
    }
  },
  {
    id: 'vidsrc_net',
    aliasIds: ['vidsrcnet'],
    name: '[ 🌐 Server 10 (VidSrc Net) ] VidSrc Net (High Bitrate Mirror)',
    shortName: '[ 🌐 Server 10 (VidSrc Net) ]',
    badge: 'High Bitrate Mirror',
    statusBadge: '🟢 Fast',
    color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://vidsrc.net/embed/movie/${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://vidsrc.net/embed/tv/${cleanId}/${seasonNum}/${epNum}`;
    }
  },
  {
    id: 'tgvid',
    aliasIds: ['tgvid_prime'],
    name: '[ 🌸 Server 11 (TgVid Ad-Free) ] TgVid Direct (Ad-Free • Multi-Language)',
    shortName: '[ 🌸 Server 11 (TgVid) ]',
    badge: 'Ad-Free Mirror',
    statusBadge: '🛡️ Ad-Free',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi', isAnime = false) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'english' ? 'en' : 'hi';
      const serverParam = audioMode === 'hindi' ? '&server=hindi' : (audioMode === 'english' ? '&server=english' : '');
      let url = `https://tgvid.lovable.app/embed/movie/${cleanId}?color=38bdf8&back=true${serverParam}&lang=${lang}`;
      if (audioMode === 'sub' || isAnime) {
        url += '&sub_lang=ja';
      }
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi', isAnime = false) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const lang = audioMode === 'english' ? 'en' : 'hi';
      const serverParam = audioMode === 'hindi' ? '&server=hindi' : (audioMode === 'english' ? '&server=english' : '');
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      let url = `https://tgvid.lovable.app/embed/tv/${cleanId}/${seasonNum}/${epNum}?color=38bdf8&back=true${serverParam}&lang=${lang}&episodeSelector=false&autoplayNextEp=false`;
      if (audioMode === 'sub' || isAnime) {
        url += '&sub_lang=ja';
      }
      return url;
    }
  },
  {
    id: 'zxcstream',
    aliasIds: ['vidjoy'],
    name: '[ ⚡ Server 12 (VidJoy 4K) ] VidJoy Cloud (Fast Streams • Zero Captcha • 1080p)',
    shortName: '[ ⚡ Server 12 (VidJoy 4K) ]',
    badge: 'Fast Streams • 4K',
    statusBadge: '🟢 Fast',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      return `https://vidjoy.pro/embed/movie/${cleanId}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1) => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '66732';
      const seasonNum = Math.max(1, Number(s) || 1);
      const epNum = Math.max(1, Number(e) || 1);
      return `https://vidjoy.pro/embed/tv/${cleanId}/${seasonNum}/${epNum}`;
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
    url = (typeof server.getTvUrl === 'function') 
      ? server.getTvUrl(cleanId, s, e, audioMode, isAnime) 
      : server.getMovieUrl(cleanId, audioMode, isAnime);
  } else {
    url = (typeof server.getMovieUrl === 'function')
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
  const allMirrors = [
    {
      id: 'mirror_tgvid',
      name: '[ 🌸 Server 1 (Ad-Free Cinema) ] TgVid Direct Cloud',
      quality: '1080p Full HD',
      badge: audioMode === 'hindi' ? '🌸 Ad-Free • Hindi Dub' : '🌸 Ad-Free Multi-Lang',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isHindi: true,
      url: isTv 
        ? `https://tgvid.lovable.app/embed/tv/${tmdbId}/${season}/${episode}?color=38bdf8&back=true&server=${audioMode === 'english' ? 'english' : 'hindi'}&lang=${audioMode === 'english' ? 'en' : 'hi'}` 
        : `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&back=true&server=${audioMode === 'english' ? 'english' : 'hindi'}&lang=${audioMode === 'english' ? 'en' : 'hi'}`
    },
    {
      id: 'mirror_vidstuck',
      name: '[ 🇮🇳 Server 2 (Hindi Dubbed) ] 123Embed Multi-Dub Cloud',
      quality: '1080p Full HD',
      badge: 'Hindi Dubbed • 1080p Ultra',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isHindi: true,
      url: isTv 
        ? `https://play2.123embed.net/tv/${tmdbId}/${season}/${episode}?audio=${audioMode === 'english' ? 'en' : 'hi'}` 
        : `https://play2.123embed.net/movie/${tmdbId}?audio=${audioMode === 'english' ? 'en' : 'hi'}`
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
    },
    {
      id: 'mirror_moviebox',
      name: '[ 📦 Server 10 (MovieBox CDN) ] MovieBox Direct High-Speed Cloud',
      quality: '4K / 1080p Ultra',
      badge: 'MovieBox Direct CDN',
      color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      isHindi: true,
      url: isTv
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?lang=${audioMode === 'english' ? 'en' : 'hi'}&disable_app_ad=true`
        : `https://nxsha.space/embed/movie/${tmdbId}?lang=${audioMode === 'english' ? 'en' : 'hi'}&disable_app_ad=true`
    },
    {
      id: 'mirror_vidsrc',
      name: '[ ⚡ Server 11 (VidSrc Cloud) ] VidSrc 4K High-Speed Cloud',
      quality: '4K Ultra Stream',
      badge: 'VidSrc Direct Stream',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      isHindi: false,
      url: isTv
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${tmdbId}`
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
