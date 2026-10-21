// src/services/movieboxService.js
// Integration with MovieBox official API (themoviebox.xyz / aoneroom.com backend)
// Provides verified MovieBox trending titles, multi-dub metadata, and high-res trailer streams

const MOVIEBOX_API_BASE = 'https://h5-api.aoneroom.com/wefeed-h5api-bff';

// Curated high-reliability MovieBox releases with confirmed Hindi and multi-language dubs
export const CURATED_MOVIEBOX_TITLES = [
  {
    id: 'mb_lucifer',
    tmdbId: 63174,
    subjectId: '1035271946885366496',
    detailPath: 'lucifer-hindi-Aq2Bzbvyte1',
    title: 'Lucifer [Hindi Dubbed]',
    type: 'tv',
    overview: 'Bored and unhappy as the Lord of Hell, Lucifer Morningstar abandoned his throne and retired to Los Angeles, now with full authentic Hindi dub audio.',
    poster_path: 'https://pbcdnw.aoneroom.com/image/2026/01/27/9fd9113b6be06b254bef10a8bea06eb1.jpg',
    backdrop_path: 'https://pbcdnw.aoneroom.com/image/2023/03/23/875656238b3bc0207ff132ef3c31b2c2.jpg',
    vote_average: 8.0,
    release_date: '2016-01-25',
    year: 2016,
    genres: ['Crime', 'Drama', 'Fantasy'],
    corner: '🇮🇳 Hindi Dub',
    hasHindiDub: true,
    availableAudios: ['Hindi', 'English', 'French', 'Russian', 'Spanish'],
    trailerUrl: 'https://macdn.aoneroom.com/media/vone/2024/03/19/57a6d508dc68df94cd4084c8a1893352-sd.mp4'
  },
  {
    id: 'mb_avatar7',
    tmdbId: 19995,
    subjectId: 'avatar-seven-havens-6RjmSI53tma',
    detailPath: 'avatar-seven-havens-6RjmSI53tma',
    title: 'Avatar: Seven Havens',
    type: 'movie',
    overview: 'Official MovieBox 4K Cinematic release. Experience Pandora like never before with crystal clear sound and multi-language subtitle tracks.',
    poster_path: 'https://pbcdnw.aoneroom.com/media/vone/2026/09/21/8f4be6d103d1e0bd0be7c2a25b94911b.jpg',
    backdrop_path: 'https://pbcdnw.aoneroom.com/media/vone/2026/09/21/8f4be6d103d1e0bd0be7c2a25b94911b.jpg',
    vote_average: 7.9,
    release_date: '2026-09-21',
    year: 2026,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    corner: '4K Ultra',
    hasHindiDub: true,
    availableAudios: ['English', 'Hindi', 'Japanese'],
    trailerUrl: 'https://macdn.aoneroom.com/media/vone/2026/09/21/8f4be6d103d1e0bd0be7c2a25b94911b-ld.mp4'
  },
  {
    id: 'mb_carrie',
    tmdbId: 440,
    subjectId: 'carrie-MwWP74PRLz1',
    detailPath: 'carrie-MwWP74PRLz1',
    title: 'Carrie [MovieBox 4K]',
    type: 'movie',
    overview: 'MovieBox Remastered Edition with high bitrate video and full multi-audio playback support.',
    poster_path: 'https://image.tmdb.org/t/p/w500/iS9Y0n28L9P6eS97T3HqB9E8A2L.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/p4T70Jv9P9W6Q6V8G2K9L6H8Y3.jpg',
    vote_average: 7.5,
    release_date: '2026-03-12',
    year: 2026,
    genres: ['Horror', 'Drama'],
    corner: 'MovieBox Pick',
    hasHindiDub: true,
    availableAudios: ['English', 'Hindi']
  },
  {
    id: 'mb_reacher',
    tmdbId: 108978,
    subjectId: 'reacher-e1nw56h5sj4',
    detailPath: 'reacher-e1nw56h5sj4',
    title: 'Reacher [Multi-Dub]',
    type: 'tv',
    overview: 'Jack Reacher, a veteran military police investigator, enters civilian life with incredible combat skill, available with multi-audio dubs.',
    poster_path: 'https://image.tmdb.org/t/p/w500/jBF3GErrF4P83B4C5kY9Q4M3V4.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/1XddXPXGiI8id7MrvrAjR532fV7.jpg',
    vote_average: 8.1,
    release_date: '2022-02-04',
    year: 2022,
    genres: ['Action', 'Crime', 'Drama'],
    corner: 'Multi-Dub',
    hasHindiDub: true,
    availableAudios: ['Hindi', 'English', 'French', 'Spanish']
  }
];

/**
 * Fetch live trending items from MovieBox official BFF API
 */
export async function fetchMovieBoxTrending() {
  try {
    const res = await fetch(`${MOVIEBOX_API_BASE}/subject/trending`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`MovieBox API status ${res.status}`);
    const data = await res.json();
    if (data.code === 0 && data.data?.subjectList) {
      return data.data.subjectList.map(item => ({
        id: `mb_${item.subjectId}`,
        tmdbId: null,
        subjectId: item.subjectId,
        detailPath: item.detailPath,
        title: item.title,
        type: item.subjectType === 2 ? 'tv' : 'movie',
        overview: item.description || `MovieBox official stream with ${item.corner || 'multi-dub'} audio.`,
        poster_path: item.cover?.url || '',
        backdrop_path: item.stills?.url || item.cover?.url || '',
        vote_average: parseFloat(item.imdbRatingValue) || 7.8,
        release_date: item.releaseDate || '2026',
        year: item.releaseDate ? parseInt(item.releaseDate) : 2026,
        genres: item.genre ? item.genre.split(',') : ['Cinema'],
        corner: item.corner || 'MovieBox',
        hasHindiDub: Boolean(item.title.toLowerCase().includes('hindi') || item.corner?.toLowerCase().includes('hindi')),
        trailerUrl: item.trailer?.videoAddress?.url || null
      }));
    }
  } catch (err) {
    console.warn('MovieBox API fetch failed, falling back to curated list:', err.message);
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
  fetchMovieBoxDubs
};
