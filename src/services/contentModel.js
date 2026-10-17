// ============================================================================
// Furina MovieBox — Normalized Content Model & Color-Coded Genre Engine
// Provides standard normalized structure across TMDB, Curated, and Studio data
// with robust image fallbacks and automatic color-coded genre badges.
// ============================================================================

export const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_THUMB_BASE = 'https://image.tmdb.org/t/p/w342';
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

// Fallback high-resolution thematic poster when remote poster is missing or 404
export const DEFAULT_POSTER_FALLBACK = './icon-512.png';
export const DEFAULT_BACKDROP_FALLBACK = './icon-512.png';

export const TMDB_GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi',
  10766: 'Drama',
  10767: 'Talk',
  10768: 'War'
};

/**
 * Returns automatic color-coded badge classes for any genre:
 * - Action / War: Red / Rose
 * - Comedy / Family: Gold / Amber
 * - Sci-Fi / Cyberpunk: Cyan
 * - Fantasy / Magic: Purple
 * - Horror: Deep Crimson
 * - Thriller / Crime / Mystery: Indigo / Electric Blue
 * - Adventure: Emerald
 * - Romance / Drama: Pink / Rose-Gold
 * - Animation / Anime: Fuchsia
 */
export function getGenreBadgeStyle(genreName = '') {
  const g = String(genreName || '').trim().toLowerCase();

  if (g.includes('action') || g.includes('war') || g.includes('martial')) {
    return {
      label: genreName,
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/45 shadow-[0_0_8px_rgba(244,63,94,0.2)]',
      dotClass: 'bg-rose-400'
    };
  }
  if (g.includes('comedy') || g.includes('family') || g.includes('kids') || g.includes('sitcom')) {
    return {
      label: genreName,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/45 shadow-[0_0_8px_rgba(245,158,11,0.22)]',
      dotClass: 'bg-amber-400'
    };
  }
  if (g.includes('sci-fi') || g.includes('science') || g.includes('cyber') || g.includes('space')) {
    return {
      label: genreName === 'Science Fiction' ? 'Sci-Fi' : genreName,
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.25)]',
      dotClass: 'bg-cyan-400'
    };
  }
  if (g.includes('horror') || g.includes('slasher') || g.includes('zombie')) {
    return {
      label: genreName,
      badgeClass: 'bg-red-600/25 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]',
      dotClass: 'bg-red-500'
    };
  }
  if (g.includes('fantasy') || g.includes('magic') || g.includes('supernatural') || g.includes('isekai')) {
    return {
      label: genreName,
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/45 shadow-[0_0_8px_rgba(168,85,247,0.22)]',
      dotClass: 'bg-purple-400'
    };
  }
  if (g.includes('adventure')) {
    return {
      label: genreName,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/45 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
      dotClass: 'bg-emerald-400'
    };
  }
  if (g.includes('thriller') || g.includes('crime') || g.includes('mystery')) {
    return {
      label: genreName,
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/45 shadow-[0_0_8px_rgba(99,102,241,0.22)]',
      dotClass: 'bg-indigo-400'
    };
  }
  if (g.includes('romance') || g.includes('drama')) {
    return {
      label: genreName,
      badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/45 shadow-[0_0_8px_rgba(236,72,153,0.2)]',
      dotClass: 'bg-pink-400'
    };
  }
  if (g.includes('anime') || g.includes('animation')) {
    return {
      label: genreName,
      badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/45 shadow-[0_0_8px_rgba(217,70,239,0.2)]',
      dotClass: 'bg-fuchsia-400'
    };
  }

  return {
    label: genreName || 'Cinema',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    dotClass: 'bg-sky-400'
  };
}

export function resolvePosterUrl(path, size = 'w500') {
  if (!path || typeof path !== 'string' || !path.trim()) {
    return DEFAULT_POSTER_FALLBACK;
  }
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  if (clean === './icon-512.png' || clean === '/icon-512.png' || clean === 'icon-512.png') {
    return './icon-512.png';
  }
  if (clean === './favicon.png' || clean === '/favicon.png' || clean === 'favicon.png') {
    return './favicon.png';
  }
  if (clean.startsWith('./')) {
    return clean;
  }
  const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `https://image.tmdb.org/t/p/${size}${cleanPath}`;
}

export function resolveBackdropUrl(path, size = 'original') {
  if (!path || typeof path !== 'string' || !path.trim()) {
    return DEFAULT_BACKDROP_FALLBACK;
  }
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  if (clean === './icon-512.png' || clean === '/icon-512.png' || clean === 'icon-512.png') {
    return './icon-512.png';
  }
  if (clean === './favicon.png' || clean === '/favicon.png' || clean === 'favicon.png') {
    return './favicon.png';
  }
  if (clean.startsWith('./')) {
    return clean;
  }
  const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `https://image.tmdb.org/t/p/${size}${cleanPath}`;
}

export function extractGenres(item) {
  if (!item) return [];

  if (Array.isArray(item.genres) && item.genres.length > 0) {
    const mapped = item.genres
      .map((g) => (typeof g === 'string' ? g : g?.name))
      .filter(Boolean)
      .map((name) => (name === 'Science Fiction' ? 'Sci-Fi' : name === 'Action & Adventure' ? 'Action' : name === 'Sci-Fi & Fantasy' ? 'Sci-Fi' : name));
    if (mapped.length > 0) return [...new Set(mapped)];
  }

  if (Array.isArray(item.genre_ids) && item.genre_ids.length > 0) {
    const mapped = item.genre_ids.map((id) => TMDB_GENRE_MAP[id]).filter(Boolean);
    if (mapped.length > 0) return [...new Set(mapped)];
  }

  // Intelligent keyword inference for curated/fallback items without explicit genre arrays
  const text = `${item.title || item.name || ''} ${item.overview || ''}`.toLowerCase();
  const inferred = [];

  if (
    text.includes('deadpool') ||
    text.includes('idiots') ||
    text.includes('stree') ||
    text.includes('funny') ||
    text.includes('comedy') ||
    text.includes('inside out') ||
    text.includes('hilarious') ||
    text.includes('bad boys')
  ) {
    inferred.push('Comedy');
  }
  if (
    text.includes('dune') ||
    text.includes('interstellar') ||
    text.includes('sci-fi') ||
    text.includes('wormhole') ||
    text.includes('future') ||
    text.includes('silo') ||
    text.includes('kalki') ||
    text.includes('avatar') ||
    text.includes('multiverse') ||
    text.includes('alien') ||
    text.includes('stranger things') ||
    text.includes('inception')
  ) {
    inferred.push('Sci-Fi');
  }
  if (
    text.includes('wolverine') ||
    text.includes('avengers') ||
    text.includes('spider-man') ||
    text.includes('john wick') ||
    text.includes('commando') ||
    text.includes('batman') ||
    text.includes('top gun') ||
    text.includes('battle') ||
    text.includes('fight') ||
    text.includes('assassin') ||
    text.includes('mafia') ||
    text.includes('warrior') ||
    text.includes('hunter')
  ) {
    inferred.push('Action');
  }
  if (
    text.includes('ghost') ||
    text.includes('haunted') ||
    text.includes('horror') ||
    text.includes('demon') ||
    text.includes('curse') ||
    text.includes('terrifying') ||
    item.category === 'horror'
  ) {
    inferred.push('Horror');
  }
  if (
    text.includes('dragon') ||
    text.includes('magic') ||
    text.includes('fantasy') ||
    text.includes('god') ||
    text.includes('wizard')
  ) {
    inferred.push('Fantasy');
  }
  if (
    text.includes('crime') ||
    text.includes('detective') ||
    text.includes('murder') ||
    text.includes('killer') ||
    text.includes('cartel') ||
    text.includes('mirzapur')
  ) {
    inferred.push('Crime');
  }
  if (
    text.includes('love') ||
    text.includes('romance') ||
    text.includes('marriage') ||
    item.category === 'kdrama'
  ) {
    inferred.push('Romance');
  }

  if (inferred.length > 0) {
    return [...new Set(inferred)].slice(0, 3);
  }

  if (item.category === 'anime' || item.isAnime) return ['Anime', 'Action'];
  if (item.category === 'series' || item.media_type === 'tv') return ['Drama', 'Thriller'];
  if (item.category === 'hindi') return ['Action', 'Drama'];
  return ['Action', 'Sci-Fi'];
}

/**
 * Normalizes any movie or series item into the standard Furina MovieBox Content Model
 */
export function normalizeMediaItem(raw = {}, defaultType = null) {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id || raw.tmdb_id || raw.imdb_id;
  if (!id) return null;

  const rawTitle = raw.title || raw.name || raw.original_title || raw.original_name || 'Untitled';
  const originalTitle = raw.original_title || raw.original_name || rawTitle;

  const isSeries = Boolean(
    raw.media_type === 'tv' ||
    defaultType === 'tv' ||
    Boolean(raw.first_air_date) ||
    raw.category === 'series' ||
    raw.category === 'kdrama'
  );

  const type = isSeries ? 'tv' : 'movie';
  const releaseDate = raw.release_date || raw.first_air_date || '';
  const year = releaseDate ? String(releaseDate).substring(0, 4) : '2024';

  const posterPath = raw.poster_path || raw.poster || '';
  const backdropPath = raw.backdrop_path || raw.backdrop || '';

  const voteAverage = typeof raw.vote_average === 'number'
    ? raw.vote_average
    : (parseFloat(raw.vote_average) || 7.8);

  const genres = extractGenres(raw);

  const isAnime = Boolean(
    raw.category === 'anime' ||
    raw.category === 'ecchi_anime' ||
    raw.isAnime === true ||
    raw.original_language === 'ja' ||
    (Array.isArray(raw.origin_country) && raw.origin_country.includes('JP')) ||
    (genres.includes('Animation') && raw.original_language === 'ja')
  );

  const isBollywood = Boolean(
    !isAnime && (
      raw.original_language === 'hi' ||
      (Array.isArray(raw.origin_country) && raw.origin_country.includes('IN') && raw.original_language !== 'en')
    )
  );

  return {
    id,
    tmdb_id: Number(raw.tmdb_id || id) || undefined,
    title: rawTitle,
    originalTitle,
    overview: raw.overview || raw.description || 'Streaming available in 4K Ultra HD.',
    poster_path: posterPath,
    backdrop_path: backdropPath,
    poster: resolvePosterUrl(posterPath),
    posterThumb: resolvePosterUrl(posterPath, 'w342'),
    backdrop: resolveBackdropUrl(backdropPath),
    year,
    release_date: releaseDate,
    rating: voteAverage.toFixed(1),
    vote_average: voteAverage,
    type,
    media_type: type,
    category: raw.category || (isAnime ? 'anime' : (isSeries ? 'series' : 'movie')),
    isAnime,
    isBollywood,
    isCustom: Boolean(raw.isCustom || raw.isCustomMovie),
    isUserCreated: Boolean(raw.isUserCreated),
    genres,
    languages: raw.languages || {},
    runtime: raw.runtime || (isSeries ? '45m/ep' : '1h 55m'),
    seasons: raw.seasons || raw.number_of_seasons || (isSeries ? 1 : undefined),
    episodes: raw.episodes || raw.number_of_episodes || undefined,
    isHindiDubbed: Boolean(raw.isHindiDubbed || raw.languages?.hi || isBollywood)
  };
}
