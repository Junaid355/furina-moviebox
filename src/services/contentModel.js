// ============================================================================
// Furina MovieBox — Normalized Content Model
// Provides standard normalized structure across TMDB, Curated, and Studio data
// with robust image fallbacks preventing 404 broken image assets.
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
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

export function resolvePosterUrl(path, size = 'w500') {
  if (!path || typeof path !== 'string' || !path.trim()) {
    return DEFAULT_POSTER_FALLBACK;
  }
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('./') || clean.startsWith('/')) {
    return clean;
  }
  return `https://image.tmdb.org/t/p/${size}${clean.startsWith('/') ? clean : `/${clean}`}`;
}

export function resolveBackdropUrl(path) {
  if (!path || typeof path !== 'string' || !path.trim()) {
    return DEFAULT_BACKDROP_FALLBACK;
  }
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('./') || clean.startsWith('/')) {
    return clean;
  }
  return `https://image.tmdb.org/t/p/original${clean.startsWith('/') ? clean : `/${clean}`}`;
}

export function extractGenres(item) {
  if (!item) return [];
  if (Array.isArray(item.genres) && item.genres.length > 0) {
    return item.genres.map((g) => (typeof g === 'string' ? g : g?.name)).filter(Boolean);
  }
  if (Array.isArray(item.genre_ids) && item.genre_ids.length > 0) {
    return item.genre_ids.map((id) => TMDB_GENRE_MAP[id]).filter(Boolean);
  }
  if (item.category) {
    const catLabels = {
      anime: 'Anime',
      hollywood: 'Hollywood',
      hindi: 'Bollywood',
      series: 'Series',
      kdrama: 'K-Drama',
      horror: 'Horror',
      studio: 'Studio Master'
    };
    return [catLabels[item.category] || item.category];
  }
  return [];
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
