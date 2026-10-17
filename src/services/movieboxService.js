// src/services/movieboxService.js
// Unified MovieBox Hub Service with verified TMDB ID mapping, live BFF API integration,
// on-demand TMDB Title+Year resolver, multi-dub metadata, and HD trailer previews.

import { searchContent, isHindiAvailable } from './tmdb';

const MOVIEBOX_API_BASE = 'https://h5-api.aoneroom.com/wefeed-h5api-bff';
const MB_TMDB_CACHE_KEY = 'furina_mb_tmdb_map_v2';

// High-reliability curated MovieBox 4K & Multi-Dub catalog with verified TMDB numeric IDs and valid poster assets
export const CURATED_MOVIEBOX_TITLES = [
  {
    id: 'mb_deadpool_wolverine',
    tmdbId: 533535,
    tmdb_id: 533535,
    subjectId: 'deadpool-wolverine-mb-4k',
    detailPath: 'deadpool-and-wolverine',
    title: 'Deadpool & Wolverine',
    type: 'movie',
    media_type: 'movie',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. When his homeworld faces an existential threat, Wade must reluctantly suit-up again with Wolverine.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    vote_average: 7.8,
    release_date: '2024-07-24',
    year: 2024,
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    corner: '4K IMAX • Multi-Dub',
    qualityBadge: '4K IMAX',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Japanese', 'Spanish'],
    trailerUrl: 'https://macdn.aoneroom.com/media/vone/2024/03/19/57a6d508dc68df94cd4084c8a1893352-sd.mp4'
  },
  {
    id: 'mb_lucifer',
    tmdbId: 63174,
    tmdb_id: 63174,
    subjectId: '1035271946885366496',
    detailPath: 'lucifer-hindi-Aq2Bzbvyte1',
    title: 'Lucifer',
    type: 'tv',
    media_type: 'tv',
    overview: 'Bored and unhappy as the Lord of Hell, Lucifer Morningstar abandoned his throne and retired to Los Angeles, where he has teamed up with LAPD detective Chloe Decker to take down criminals.',
    poster_path: '/ekZobS8isE6mA53RAiGDG93hBxL.jpg',
    backdrop_path: '/aDBRtunw49UF4XmqfyNuD9nlYIu.jpg',
    vote_average: 8.5,
    release_date: '2016-01-25',
    first_air_date: '2016-01-25',
    year: 2016,
    genres: ['Crime', 'Drama', 'Fantasy'],
    corner: '🇮🇳 Hindi Dub',
    qualityBadge: 'Multi-Dub HD',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'French', 'Spanish'],
    trailerUrl: 'https://macdn.aoneroom.com/media/vone/2024/03/19/57a6d508dc68df94cd4084c8a1893352-sd.mp4'
  },
  {
    id: 'mb_reacher',
    tmdbId: 108978,
    tmdb_id: 108978,
    subjectId: 'reacher-e1nw56h5sj4',
    detailPath: 'reacher-e1nw56h5sj4',
    title: 'Reacher',
    type: 'tv',
    media_type: 'tv',
    overview: 'Jack Reacher, a veteran military police investigator, has just recently entered civilian life. Reacher is a drifter, carrying no phone and the barest of essentials as he travels the country.',
    poster_path: '/jFuH0md41x5mB4qj5344mSmtHrO.jpg',
    backdrop_path: '/1XddXPXGiI8id7MrvrAjR532fV7.jpg',
    vote_average: 8.1,
    release_date: '2022-02-04',
    first_air_date: '2022-02-04',
    year: 2022,
    genres: ['Action', 'Crime', 'Drama'],
    corner: 'Multi-Dub 4K',
    qualityBadge: '4K UHD',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'French', 'Spanish']
  },
  {
    id: 'mb_dune_part_two',
    tmdbId: 693134,
    tmdb_id: 693134,
    subjectId: 'dune-part-two-mb',
    detailPath: 'dune-part-two',
    title: 'Dune: Part Two',
    type: 'movie',
    media_type: 'movie',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    vote_average: 8.3,
    release_date: '2024-02-27',
    year: 2024,
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    corner: '4K Dolby • Multi-Dub',
    qualityBadge: '4K Remastered',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Japanese']
  },
  {
    id: 'mb_solo_leveling',
    tmdbId: 127532,
    tmdb_id: 127532,
    subjectId: 'solo-leveling-mb',
    detailPath: 'solo-leveling',
    title: 'Solo Leveling',
    type: 'tv',
    media_type: 'tv',
    category: 'anime',
    isAnime: true,
    overview: 'In a world where hunters — humans who possess magical abilities — must battle deadly monsters to protect the human race from certain annihilation, a notoriously weak hunter named Sung Jinwoo finds himself in a seemingly endless struggle for survival.',
    poster_path: '/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg',
    backdrop_path: '/dfX2UaHVE5c7kLBFbgmEZJuy4Ev.jpg',
    vote_average: 8.7,
    release_date: '2024-01-07',
    first_air_date: '2024-01-07',
    year: 2024,
    genres: ['Animation', 'Action', 'Fantasy'],
    corner: '🇮🇳 Hindi + EN + JA',
    qualityBadge: 'Tri-Audio 4K',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Japanese']
  },
  {
    id: 'mb_stranger_things',
    tmdbId: 66732,
    tmdb_id: 66732,
    subjectId: 'stranger-things-mb',
    detailPath: 'stranger-things',
    title: 'Stranger Things',
    type: 'tv',
    media_type: 'tv',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    vote_average: 8.6,
    release_date: '2016-07-15',
    first_air_date: '2016-07-15',
    year: 2016,
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    corner: '4K Ultra • Multi-Dub',
    qualityBadge: '4K UHD',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Spanish']
  },
  {
    id: 'mb_kalki_2898',
    tmdbId: 974262,
    tmdb_id: 974262,
    subjectId: 'kalki-2898-ad-mb',
    detailPath: 'kalki-2898-ad',
    title: 'Kalki 2898 AD',
    type: 'movie',
    media_type: 'movie',
    category: 'hindi',
    overview: 'A modern avatar of the Hindu god Vishnu, who is believed to have descended to the earth to protect the world from evil forces in the dystopian city of Kashi.',
    poster_path: '/8fYluTtB3b3HKO7KQa5tzrvGaps.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    vote_average: 7.6,
    release_date: '2024-06-27',
    year: 2024,
    genres: ['Sci-Fi', 'Action', 'Mythology'],
    corner: '🇮🇳 Native Hindi 4K',
    qualityBadge: '4K UHD',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English']
  },
  {
    id: 'mb_house_of_dragon',
    tmdbId: 94997,
    tmdb_id: 94997,
    subjectId: 'house-of-the-dragon-mb',
    detailPath: 'house-of-the-dragon',
    title: 'House of the Dragon',
    type: 'tv',
    media_type: 'tv',
    overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights.',
    poster_path: '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
    backdrop_path: '/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg',
    vote_average: 8.4,
    release_date: '2022-08-21',
    first_air_date: '2022-08-21',
    year: 2022,
    genres: ['Fantasy', 'Drama', 'Action'],
    corner: '🇮🇳 Hindi + English 4K',
    qualityBadge: '4K Dolby',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English']
  },
  {
    id: 'mb_the_boys',
    tmdbId: 76479,
    tmdb_id: 76479,
    subjectId: 'the-boys-mb',
    detailPath: 'the-boys',
    title: 'The Boys',
    type: 'tv',
    media_type: 'tv',
    overview: 'A group of vigilantes known informally as "The Boys" set out to take down corrupt superheroes with no more than blue-collar grit and a willingness to fight dirty.',
    poster_path: '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
    backdrop_path: '/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg',
    vote_average: 8.5,
    release_date: '2019-07-25',
    first_air_date: '2019-07-25',
    year: 2019,
    genres: ['Action', 'Sci-Fi', 'Crime'],
    corner: '🇮🇳 Hindi Dub • Uncut',
    qualityBadge: '4K Uncut',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English']
  },
  {
    id: 'mb_demon_slayer',
    tmdbId: 85937,
    tmdb_id: 85937,
    subjectId: 'demon-slayer-mb',
    detailPath: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    type: 'tv',
    media_type: 'tv',
    category: 'anime',
    isAnime: true,
    overview: 'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon.',
    poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    backdrop_path: '/nTvM4mhqNlHIvUkI1gVnW6XP7GG.jpg',
    vote_average: 8.7,
    release_date: '2019-04-06',
    first_air_date: '2019-04-06',
    year: 2019,
    genres: ['Animation', 'Action', 'Fantasy'],
    corner: '🇮🇳 Hindi + JA + EN',
    qualityBadge: 'Tri-Audio 4K',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Japanese']
  },
  {
    id: 'mb_squid_game',
    tmdbId: 93405,
    tmdb_id: 93405,
    subjectId: 'squid-game-mb',
    detailPath: 'squid-game',
    title: 'Squid Game',
    type: 'tv',
    media_type: 'tv',
    category: 'kdrama',
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits — with deadly high stakes.',
    poster_path: '/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
    backdrop_path: '/oaGvjB0DvdhXhOAuADfHb261ZHa.jpg',
    vote_average: 7.9,
    release_date: '2021-09-17',
    first_air_date: '2021-09-17',
    year: 2021,
    genres: ['Action', 'Mystery', 'Drama'],
    corner: '🇮🇳 Hindi + EN + KO',
    qualityBadge: 'Multi-Dub 4K',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Korean']
  },
  {
    id: 'mb_avatar_way_of_water',
    tmdbId: 76600,
    tmdb_id: 76600,
    subjectId: 'avatar-way-of-water-mb',
    detailPath: 'avatar-the-way-of-water',
    title: 'Avatar: The Way of Water',
    type: 'movie',
    media_type: 'movie',
    overview: 'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.',
    poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    vote_average: 7.7,
    release_date: '2022-12-14',
    year: 2022,
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    corner: '4K Remastered • Multi-Dub',
    qualityBadge: '4K Remastered',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Japanese'],
    trailerUrl: 'https://macdn.aoneroom.com/media/vone/2024/03/19/57a6d508dc68df94cd4084c8a1893352-sd.mp4'
  },
  {
    id: 'mb_stree_2',
    tmdbId: 1114513,
    tmdb_id: 1114513,
    subjectId: 'stree-2-mb',
    detailPath: 'stree-2',
    title: 'Stree 2: Sarkate Ka Aatank',
    type: 'movie',
    media_type: 'movie',
    category: 'hindi',
    overview: 'After the events of Stree, the town of Chanderi is being haunted again. This time by a headless monster who is abducting women.',
    poster_path: '/dA4N6uWOnEMgbxXwFX7qX7adzs8.jpg',
    backdrop_path: '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    vote_average: 7.6,
    release_date: '2024-08-15',
    year: 2024,
    genres: ['Horror', 'Comedy'],
    corner: '🇮🇳 Bollywood 4K',
    qualityBadge: '4K UHD',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi']
  },
  {
    id: 'mb_jujutsu_kaisen',
    tmdbId: 95479,
    tmdb_id: 95479,
    subjectId: 'jujutsu-kaisen-mb',
    detailPath: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    type: 'tv',
    media_type: 'tv',
    category: 'anime',
    isAnime: true,
    overview: 'Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna.',
    poster_path: '/fHpKWq9ayzSk8nSwqRuaAUemRKh.jpg',
    backdrop_path: '/gmECX1DvFgdUPjtio2zaL8BPYPu.jpg',
    vote_average: 8.6,
    release_date: '2020-10-03',
    first_air_date: '2020-10-03',
    year: 2020,
    genres: ['Animation', 'Action', 'Supernatural'],
    corner: '🇮🇳 Hindi + EN + JA',
    qualityBadge: 'Tri-Audio 4K',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Japanese']
  },
  {
    id: 'mb_oppenheimer',
    tmdbId: 872585,
    tmdb_id: 872585,
    subjectId: 'oppenheimer-mb',
    detailPath: 'oppenheimer',
    title: 'Oppenheimer',
    type: 'movie',
    media_type: 'movie',
    overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    vote_average: 8.1,
    release_date: '2023-07-19',
    year: 2023,
    genres: ['Drama', 'History'],
    corner: '4K IMAX • Multi-Dub',
    qualityBadge: '4K IMAX',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English']
  },
  {
    id: 'mb_all_of_us_are_dead',
    tmdbId: 99966,
    tmdb_id: 99966,
    subjectId: 'all-of-us-are-dead-mb',
    detailPath: 'all-of-us-are-dead',
    title: 'All of Us Are Dead',
    type: 'tv',
    media_type: 'tv',
    category: 'kdrama',
    overview: 'A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out — or turn into one of the rabid infected.',
    poster_path: '/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg',
    backdrop_path: '/8Xs20y8gFR0W9u8Yy9NKdpZtSu7.jpg',
    vote_average: 8.3,
    release_date: '2022-01-28',
    first_air_date: '2022-01-28',
    year: 2022,
    genres: ['Action', 'Horror', 'Drama'],
    corner: '🇮🇳 Hindi + EN Dub',
    qualityBadge: 'Multi-Dub HD',
    hasHindiDub: true,
    isHindiDubbed: true,
    availableAudios: ['Hindi', 'English', 'Korean']
  }
];

function getTmdbCache() {
  try {
    return JSON.parse(localStorage.getItem(MB_TMDB_CACHE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveTmdbCache(map) {
  try {
    localStorage.setItem(MB_TMDB_CACHE_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Clean a MovieBox title (strips tags like [Hindi Dubbed], (4K), Season 1, etc.)
 */
export function cleanMovieBoxTitle(rawTitle = '') {
  return String(rawTitle)
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/-\s*season\s*\d+/i, '')
    .replace(/season\s*\d+/i, '')
    .replace(/hindi\s*dubbed/i, '')
    .replace(/multi[- ]?dub/i, '')
    .trim();
}

/**
 * Resolves any MovieBox item (even live BFF items without a tmdbId) to a valid numeric TMDB ID.
 * Caches resolved mappings in localStorage so subsequent plays are instantaneous.
 */
export async function resolveMovieBoxTmdbId(item) {
  if (!item) return null;
  const direct = item.tmdbId || item.tmdb_id || (typeof item.id === 'number' ? item.id : null);
  if (direct && Number(direct) > 0 && Number(direct) < 20000000) {
    return Number(direct);
  }

  const cacheKey = String(item.id || item.subjectId || item.title || '').toLowerCase();
  const cache = getTmdbCache();
  if (cacheKey && cache[cacheKey]) {
    return Number(cache[cacheKey]);
  }

  const cleanTitle = cleanMovieBoxTitle(item.title || item.name || '');
  if (!cleanTitle) return null;

  // Check curated list first
  const curatedMatch = CURATED_MOVIEBOX_TITLES.find(
    (c) => cleanMovieBoxTitle(c.title).toLowerCase() === cleanTitle.toLowerCase()
  );
  if (curatedMatch?.tmdbId) {
    if (cacheKey) {
      cache[cacheKey] = curatedMatch.tmdbId;
      saveTmdbCache(cache);
    }
    return curatedMatch.tmdbId;
  }

  // Query TMDB search API to resolve exact numeric ID
  try {
    const results = await searchContent(cleanTitle, 1, false);
    if (Array.isArray(results) && results.length > 0) {
      const targetType = item.type === 'tv' || item.media_type === 'tv' ? 'tv' : 'movie';
      const exactTypeMatch = results.find(
        (r) => (r.media_type === targetType || (targetType === 'tv' && r.first_air_date)) && Number(r.id) < 20000000
      );
      const best = exactTypeMatch || results.find((r) => Number(r.id) < 20000000) || results[0];
      if (best?.id) {
        const numId = Number(best.id);
        if (cacheKey) {
          cache[cacheKey] = numId;
          saveTmdbCache(cache);
        }
        return numId;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Resolves a MovieBox item and returns an enriched item object with numeric TMDB ID
 */
export async function resolveMovieBoxToTmdb(item) {
  if (!item) return null;
  const tmdbId = await resolveMovieBoxTmdbId(item);
  if (tmdbId) {
    return {
      ...item,
      id: tmdbId,
      tmdb_id: tmdbId,
      tmdbId
    };
  }
  return item;
}

/**
 * Fetch live trending items from MovieBox official BFF API, merged with verified curated MovieBox 4K titles
 */
export async function fetchMovieBoxTrending() {
  const cache = getTmdbCache();
  try {
    const res = await fetch(`${MOVIEBOX_API_BASE}/subject/trending`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });
    if (!res.ok) throw new Error(`MovieBox API status ${res.status}`);
    const data = await res.json();
    if (data.code === 0 && Array.isArray(data.data?.subjectList) && data.data.subjectList.length > 0) {
      const liveItems = data.data.subjectList.map((item) => {
        const mbId = `mb_${item.subjectId}`;
        const cleanTitle = cleanMovieBoxTitle(item.title);
        const curatedMatch = CURATED_MOVIEBOX_TITLES.find(
          (c) => cleanMovieBoxTitle(c.title).toLowerCase() === cleanTitle.toLowerCase()
        );
        const resolvedTmdb = curatedMatch?.tmdbId || cache[mbId.toLowerCase()] || null;
        const isTv = item.subjectType === 2;
        const hasHindi = Boolean(
          item.title?.toLowerCase().includes('hindi') ||
          item.corner?.toLowerCase().includes('hindi') ||
          curatedMatch?.hasHindiDub ||
          (resolvedTmdb && isHindiAvailable({ id: resolvedTmdb }))
        );

        return {
          id: resolvedTmdb || mbId,
          movieboxId: mbId,
          tmdbId: resolvedTmdb,
          tmdb_id: resolvedTmdb,
          subjectId: item.subjectId,
          detailPath: item.detailPath,
          title: item.title,
          type: isTv ? 'tv' : 'movie',
          media_type: isTv ? 'tv' : 'movie',
          overview: item.description || curatedMatch?.overview || `MovieBox official 4K stream with ${item.corner || 'multi-dub'} audio support.`,
          poster_path: item.cover?.url || curatedMatch?.poster_path || '',
          backdrop_path: item.stills?.url || item.cover?.url || curatedMatch?.backdrop_path || '',
          vote_average: parseFloat(item.imdbRatingValue) || curatedMatch?.vote_average || 7.9,
          release_date: item.releaseDate || curatedMatch?.release_date || '2025',
          year: item.releaseDate ? parseInt(item.releaseDate, 10) : (curatedMatch?.year || 2025),
          genres: item.genre ? item.genre.split(',').map((g) => g.trim()) : (curatedMatch?.genres || ['Cinema']),
          corner: item.corner || curatedMatch?.corner || 'MovieBox 4K',
          qualityBadge: item.corner || curatedMatch?.qualityBadge || '4K UHD',
          hasHindiDub: hasHindi,
          isHindiDubbed: hasHindi,
          availableAudios: curatedMatch?.availableAudios || (hasHindi ? ['Hindi', 'English'] : ['English', 'Multi-Sub']),
          trailerUrl: item.trailer?.videoAddress?.url || curatedMatch?.trailerUrl || null
        };
      });

      // Merge live items with curated titles (avoiding duplicates)
      const seenTitles = new Set(liveItems.map((i) => cleanMovieBoxTitle(i.title).toLowerCase()));
      const extras = CURATED_MOVIEBOX_TITLES.filter(
        (c) => !seenTitles.has(cleanMovieBoxTitle(c.title).toLowerCase())
      );
      return [...liveItems, ...extras];
    }
  } catch (err) {
    // Silent fallback to curated MovieBox 4K catalog
  }
  return CURATED_MOVIEBOX_TITLES;
}

/**
 * Fetch detailed multi-dub languages from MovieBox API for a subject
 */
export async function fetchMovieBoxDubs(detailPath) {
  if (!detailPath) return [];
  try {
    const res = await fetch(`${MOVIEBOX_API_BASE}/detail?detailPath=${encodeURIComponent(detailPath)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.subject?.dubs || [];
  } catch (e) {
    return [];
  }
}

export default {
  CURATED_MOVIEBOX_TITLES,
  fetchMovieBoxTrending,
  fetchMovieBoxDubs,
  resolveMovieBoxTmdbId,
  cleanMovieBoxTitle
};
