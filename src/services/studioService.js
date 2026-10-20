// ============================================================================
// Furina MovieBox — Studio Storage & Media Runtime Service
// Lightweight service decoupled from MovieStudioModal UI for fast initial load.
// ============================================================================

export const STORAGE_KEY = 'furina_studio_movies';

export const PROVIDER_OPTIONS = [
  { id: 'Owned Studio Master', label: '⭐ Owned Studio Master (Direct CDN / Local)' },
  { id: 'Indian Cinema Native', label: '🇮🇳 Indian Cinema Native Master' },
  { id: 'AnimeWorld India Dub', label: '🌸 AnimeWorld India Official Dub' },
  { id: 'MultiEmbed Localized', label: '🌐 MultiEmbed Localized Audio Stream' },
  { id: 'External Custom CDN', label: '⚡ External Fast CDN / High-Bandwidth Mirror' }
];

export const DEFAULT_SAMPLE_MOVIES = [
  {
    id: 'studio_sample_1',
    title: 'The Cyber Ronin: Echoes of Neo-Tokyo',
    name: 'The Cyber Ronin: Echoes of Neo-Tokyo',
    overview: 'In a dystopian 2099 metropolis, an exiled synthetic samurai uncovers a corporate conspiracy threatening human consciousness. Fully produced original with Hindi, English, and Japanese multi-audio tracks.',
    poster_path: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    backdrop_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    media_type: 'movie',
    vote_average: 8.9,
    release_date: '2025-01-15',
    category: 'studio',
    genres: ['Sci-Fi', 'Action', 'Anime', 'Cyberpunk'],
    isCustom: true,
    isUserCreated: true,
    isAnime: true,
    languages: {
      hi: {
        label: 'Hindi (Authentic Spoken Hindi Dialogue)',
        url: './media/hindi_audio.wav',
        type: 'audio/wav'
      },
      en: {
        label: 'English Dub (Official Master Audio)',
        url: './media/english_audio.mp4',
        type: 'video/mp4'
      },
      ja: {
        label: 'Japanese Original Audio (Spoken Dialogue)',
        url: './media/japanese_audio.wav',
        type: 'audio/wav'
      }
    },
    subtitles: [
      { lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' },
      { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' }
    ]
  }
];

export function getStoredStudioMovies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_MOVIES));
      return DEFAULT_SAMPLE_MOVIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const legacyBlockbusterIds = new Set([
        'studio_deadpool_wolverine',
        'studio_house_of_the_dragon',
        'studio_avengers_endgame',
        'studio_naruto_shippuden',
        'studio_avatar_way_of_water',
        'studio_spiderman_no_way_home',
        'studio_demon_slayer'
      ]);

      const cleaned = parsed.filter((m) => {
        if (!m || !m.id) return false;
        if (legacyBlockbusterIds.has(m.id)) return false;
        return true;
      }).map((m) => ({
        ...m,
        isCustom: true,
        isUserCreated: true
      }));

      if (cleaned.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_MOVIES));
        return DEFAULT_SAMPLE_MOVIES;
      }

      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return DEFAULT_SAMPLE_MOVIES;
  } catch (e) {
    return DEFAULT_SAMPLE_MOVIES;
  }
}

export function saveStoredStudioMovies(movies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch (e) {
    console.error('Failed to save studio movies', e);
  }
}
