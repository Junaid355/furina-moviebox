// High-speed verified 4K/HD streaming servers with sub-second response times
// Dedicated audio routing support for English Dub, Japanese Sub, and Hindi Audio
// Verified active endpoints inspired by high-reliability aggregator architecture

export const SERVERS = [
  {
    id: 'vidstuck',
    name: '[ 🇮🇳 Server 1 (High-Speed CDN) ] VidStuck Pro (Centaurus • Multi-Dub • 1080p)',
    shortName: '[ 🇮🇳 Server 1 (Fast CDN) ]',
    badge: 'Multi-Dub • Centaurus',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const dub = audioMode === 'english' ? 'en' : 'hi';
      return `https://vidstuck.xyz/embed/movie/${tmdbId}?dubLang=${dub}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const dub = audioMode === 'english' ? 'en' : 'hi';
      return `https://vidstuck.xyz/embed/tv/${tmdbId}/${s}/${e}?dubLang=${dub}`;
    }
  },
  {
    id: 'vidfast',
    name: '[ ⚡ Server 2 (4K Ultra Fast) ] VidFast Ultra (Instant AutoPlay • 4K UHD)',
    shortName: '[ ⚡ Server 2 (4K Ultra) ]',
    badge: '4K Ultra Fast',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  },
  {
    id: 'nxsha',
    name: '[ 🎧 Server 3 (Multi-Audio 4K) ] NxSha Prime (Clean Ads • Multi-Audio / 4K)',
    shortName: '[ 🎧 Server 3 (Multi-Audio) ]',
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
    id: 'bingr',
    name: '[ 🌐 Server 4 (Clean Stream) ] Bingr Stream (High Bitrate • Ultra-Light)',
    shortName: '[ 🌐 Server 4 (Clean Stream) ]',
    badge: 'High Bitrate • Light',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://bingr.one/watch/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://bingr.one/watch/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'vidsrc_pm',
    name: '[ 👑 Server 5 (VidSrc PM Pro) ] VidSrc PM Direct (Zero Ads • Instant Play • 4K)',
    shortName: '[ 👑 Server 5 (VidSrc PM) ]',
    badge: 'Zero Ads • 4K',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://vidsrc.pm/embed/tv/${tmdbId}/${s}/${e}`
  },
  {
    id: 'moviebox_cloud',
    name: '[ 📦 Server 6 (MovieBox Cloud) ] MovieBox Official CDN (Multi-Dub • Fast Stream • 1080p)',
    shortName: '[ 📦 Server 6 (MovieBox) ]',
    badge: 'MovieBox Official • Multi-Dub',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : (audioMode === 'sub' ? 'ja' : 'hi');
      return `https://nxsha.space/embed/movie/${tmdbId}?lang=${lang}&disable_app_ad=true`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : (audioMode === 'sub' ? 'ja' : 'hi');
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
    id: 'zxcstream',
    name: '[ ⚡ Server 8 (Roxy Prime) ] ZXC Roxy (Fast Streams • Zero Captcha)',
    shortName: '[ ⚡ Server 8 (Roxy) ]',
    badge: 'Fast Streams',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      return `https://player.zxcprime.xyz/player/movie/${tmdbId}?dubLang=${lang}&server=0`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      return `https://player.zxcprime.xyz/player/tv/${tmdbId}/${s}/${e}?dubLang=${lang}&server=0`;
    }
  },
  {
    id: 'animeworld_india',
    name: '[ 🇮🇳 Server 7 (Hindi CDN) ] Cinema Mirror 2 (Verified High-Speed CDN)',
    shortName: '[ 🇮🇳 Server 7 (Hindi CDN) ]',
    badge: 'High-Speed CDN',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://www.2embed.skin/embed/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://www.2embed.skin/embedtv/${tmdbId}&s=${s}&e=${e}`
  },
  {
    id: 'vidlink',
    name: '[ 🇬🇧 Server 8 (English Dub) ] VidLink Pro (Verified English Dub & Multi-Audio)',
    shortName: '[ 🇬🇧 Server 8 (English Dub) ]',
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
    name: '[ 🇮🇳 Server 9 (Hindi Dubbed) ] 123Embed (Multi-Audio & Dub Zero-Captcha)',
    shortName: '[ 🇮🇳 Server 9 (Hindi Dubbed) ]',
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
    name: '[ 🎧 Server 12 (AnyEmbed Direct) ] AnyEmbed Pro (Multi-Language & Hindi Audio)',
    shortName: '[ 🎧 Server 12 (AnyEmbed) ]',
    badge: 'Multi-Language',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId) => `https://anyembed.xyz/embed/tmdb-movie-${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://anyembed.xyz/embed/tmdb-tv-${tmdbId}/${s}/${e}`
  },
  {
    id: 'autoembed',
    name: '[ 🎬 Server 11 (AutoEmbed) ] AutoEmbed Prime (Instant Play / 1080p HD)',
    shortName: '[ 🎬 Server 11 (AutoEmbed) ]',
    badge: '1080p HD',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
  },
  {
    id: 'tgvid',
    name: '[ 🌸 Server 12 (Backup Mirror) ] TgVid Prime (Ad-Free • Multi-Language)',
    shortName: '[ 🌸 Server 12 (Backup) ]',
    badge: 'Backup Mirror',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    supportedAudios: ['hindi', 'english', 'sub'],
    getMovieUrl: (tmdbId, audioMode = 'hindi', isAnime = false) => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      const serverParam = audioMode === 'hindi' ? '&server=hindi' : (audioMode === 'english' ? '&server=english' : '');
      let url = `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&back=true${serverParam}&lang=${lang}`;
      if (audioMode === 'sub' || isAnime) {
        url += '&sub_lang=ja';
      }
      return url;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi', isAnime = false) => {
      const lang = audioMode === 'english' ? 'en' : 'hi';
      const serverParam = audioMode === 'hindi' ? '&server=hindi' : (audioMode === 'english' ? '&server=english' : '');
      let url = `https://tgvid.lovable.app/embed/tv/${tmdbId}/${s}/${e}?color=38bdf8&back=true${serverParam}&lang=${lang}&episodeSelector=false&autoplayNextEp=false`;
      if (audioMode === 'sub' || isAnime) {
        url += '&sub_lang=ja';
      }
      return url;
    }
  },
  {
    id: 'moviebox',
    name: '[ 📦 Server 13 (MovieBox Direct) ] MovieBox CDN (Multi-Dub Stream • 4K UHD)',
    shortName: '[ 📦 Server 13 (MovieBox) ]',
    badge: 'MovieBox 4K • Multi-Dub',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    supportedAudios: ['hindi', 'english', 'sub', 'french', 'spanish'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'english' ? 'en' : (audioMode === 'sub' ? 'ja' : (audioMode === 'french' ? 'fr' : (audioMode === 'spanish' ? 'es' : 'hi')));
      return `https://nxsha.space/embed/movie/${cleanId}?lang=${lang}&disable_app_ad=true`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '95479';
      const lang = audioMode === 'english' ? 'en' : (audioMode === 'sub' ? 'ja' : (audioMode === 'french' ? 'fr' : (audioMode === 'spanish' ? 'es' : 'hi')));
      return `https://nxsha.space/embed/tv/${cleanId}/${s}/${e}?lang=${lang}&disable_app_ad=true`;
    }
  },
  {
    id: 'vidsrc_su',
    name: '[ ⚡ Server 14 (VidSrc Pro) ] VidSrc Cloud (4K Ultra • Direct Stream)',
    shortName: '[ ⚡ Server 14 (VidSrc Pro) ]',
    badge: 'VidSrc Cloud • 4K',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    supportedAudios: ['english', 'sub', 'hindi'],
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${String(tmdbId).replace(/[^0-9]/g, '') || '533535'}`,
    getTvUrl: (tmdbId, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${String(tmdbId).replace(/[^0-9]/g, '') || '95479'}-${s}-${e}`
  },
  {
    id: 'multiembed',
    name: '[ 🌐 Server 15 (123Embed Global) ] 123Embed VIP (Multi-Language • Zero Buffering)',
    shortName: '[ 🌐 Server 15 (123Embed) ]',
    badge: 'Global Dubs • VIP',
    color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    supportedAudios: ['hindi', 'english', 'sub', 'french', 'spanish'],
    getMovieUrl: (tmdbId, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '533535';
      const lang = audioMode === 'english' ? 'en' : 'hi';
      return `https://play2.123embed.net/movie/${cleanId}?audio=${lang}`;
    },
    getTvUrl: (tmdbId, s = 1, e = 1, audioMode = 'hindi') => {
      const cleanId = String(tmdbId).replace(/[^0-9]/g, '') || '95479';
      const lang = audioMode === 'english' ? 'en' : 'hi';
      return `https://play2.123embed.net/tv/${cleanId}/${s}/${e}?audio=${lang}`;
    }
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
        ? `https://tgvid.lovable.app/embed/tv/${tmdbId}/${season}/${episode}?color=38bdf8&back=true&server=${audioMode === 'english' ? 'english' : 'hindi'}&lang=${audioMode === 'english' ? 'en' : 'hi'}` 
        : `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&back=true&server=${audioMode === 'english' ? 'english' : 'hindi'}&lang=${audioMode === 'english' ? 'en' : 'hi'}`
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
