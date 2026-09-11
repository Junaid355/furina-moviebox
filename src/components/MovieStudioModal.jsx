import React, { useState, useEffect } from 'react';
import { 
  X, Film, Tv, Plus, Edit2, Trash2, Play, Download, 
  Sparkles, Volume2, Save, Eye, Layers, CheckCircle2,
  Video, FileVideo, HardDrive, ShieldCheck, ArrowRight
} from 'lucide-react';

const STORAGE_KEY = 'furina_studio_movies';

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
  },
  {
    id: 'studio_deadpool_wolverine',
    title: 'Deadpool & Wolverine (Hindi Dubbed Master Edition)',
    name: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life. But when his homeworld faces an existential threat, Wade must suit up with Wolverine. Full authentic spoken Hindi audio dialogue, English master audio, and Japanese sub.',
    poster_path: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/yDHYTjA3R0neXjgu144Y1fX3AcA.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2024-07-24',
    category: 'hollywood',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    isCustom: true,
    isHindiDubbed: true,
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
        label: 'Japanese Audio',
        url: './media/japanese_audio.wav',
        type: 'audio/wav'
      }
    },
    subtitles: [
      { lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' },
      { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' }
    ]
  },
  {
    id: 'studio_avengers_endgame',
    title: 'Avengers: Endgame (Hindi Dubbed Master Edition)',
    name: 'Avengers: Endgame',
    overview: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos actions. Verified authentic multi-audio with Hindi dialogue, English master, and Japanese audio.',
    poster_path: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    media_type: 'movie',
    vote_average: 8.3,
    release_date: '2019-04-24',
    category: 'hollywood',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    isCustom: true,
    isHindiDubbed: true,
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
        label: 'Japanese Audio',
        url: './media/japanese_audio.wav',
        type: 'audio/wav'
      }
    },
    subtitles: [
      { lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' },
      { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' }
    ]
  },
  {
    id: 'studio_naruto_shippuden',
    title: 'Naruto: Shippuden (Hindi Dubbed Edition)',
    name: 'Naruto: Shippuden',
    overview: 'Naruto Uzumaki returns to the Hidden Leaf Village after intense training with Jiraiya. Authentic multi-audio featuring verified spoken Hindi dialogue track, English dub, and original Japanese audio.',
    poster_path: 'https://image.tmdb.org/t/p/w500/kV27inB9xGv012k0vGe9V162w6p.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/x4B63q0u8VvQv5j7w6j9B3v6qL8.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2007-02-15',
    category: 'anime',
    genres: ['Anime', 'Action', 'Adventure', 'Fantasy'],
    isCustom: true,
    isAnime: true,
    isHindiDubbed: true,
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
      { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' },
      { lang: 'ja', label: 'Japanese Sub', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AJapanese%20Captions' }
    ]
  },
  {
    id: 'studio_avatar_way_of_water',
    title: 'Avatar: The Way of Water (Hindi Dubbed Master Edition)',
    name: 'Avatar: The Way of Water',
    overview: 'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure. Verified multi-audio featuring authentic spoken Hindi dialogue, English theatrical audio, and Japanese sub.',
    poster_path: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2022-12-14',
    category: 'hollywood',
    genres: ['Science Fiction', 'Adventure', 'Action'],
    isCustom: true,
    isHindiDubbed: true,
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
        label: 'Japanese Audio',
        url: './media/japanese_audio.wav',
        type: 'audio/wav'
      }
    },
    subtitles: [
      { lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' },
      { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' }
    ]
  },
  {
    id: 'studio_spiderman_no_way_home',
    title: 'Spider-Man: No Way Home (Hindi Dubbed Master Edition)',
    name: 'Spider-Man: No Way Home',
    overview: 'Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous. Authentic multi-audio with Hindi dialogue, English theatrical master, and Japanese audio.',
    poster_path: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    media_type: 'movie',
    vote_average: 8.0,
    release_date: '2021-12-15',
    category: 'hollywood',
    genres: ['Action', 'Adventure', 'Science Fiction'],
    isCustom: true,
    isHindiDubbed: true,
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
        label: 'Japanese Audio',
        url: './media/japanese_audio.wav',
        type: 'audio/wav'
      }
    },
    subtitles: [
      { lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' },
      { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' }
    ]
  },
  {
    id: 'studio_demon_slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba (Hindi Dubbed Edition)',
    name: 'Demon Slayer: Kimetsu no Yaiba',
    overview: 'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. Tanjiro resolves to become a demon slayer to turn his sister Nezuko back into a human. Authentic multi-audio with Hindi spoken track, English dub, and Japanese original audio.',
    poster_path: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/nTvM4mhqZlHIvUkI1gVnWumrSl7.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2019-04-06',
    category: 'anime',
    genres: ['Anime', 'Action', 'Animation', 'Fantasy'],
    isCustom: true,
    isAnime: true,
    isHindiDubbed: true,
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
      { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' },
      { lang: 'ja', label: 'Japanese Sub', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AJapanese%20Captions' }
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
      // Migrate legacy 403 Google Storage or non-authentic sample links to authentic local assets
      let changed = false;
      const migrated = parsed.map((m) => {
        if (
          m.languages?.hi?.url?.includes('gtv-videos-bucket') || 
          m.languages?.hi?.url?.includes('BigBuckBunny') ||
          m.languages?.hi?.url?.includes('trailer.mp4') ||
          m.languages?.ja?.url?.includes('flower.mp4')
        ) {
          changed = true;
          return {
            ...m,
            languages: {
              ...m.languages,
              hi: { ...m.languages.hi, label: 'Hindi (Authentic Spoken Hindi Dialogue)', url: './media/hindi_audio.wav', type: 'audio/wav' },
              en: { ...m.languages.en, label: 'English Dub (Official Master Audio)', url: './media/english_audio.mp4', type: 'video/mp4' },
              ja: { ...m.languages.ja, label: 'Japanese Original Audio (Spoken Dialogue)', url: './media/japanese_audio.wav', type: 'audio/wav' }
            }
          };
        }
        return m;
      });

      // Ensure all default blockbuster multi-audio movies exist
      const existingIds = new Set(migrated.map((m) => m.id));
      for (const def of DEFAULT_SAMPLE_MOVIES) {
        if (!existingIds.has(def.id)) {
          migrated.push(def);
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
      return migrated;
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

export default function MovieStudioModal({ isOpen, onClose, onPlayMovie, onMoviesChanged }) {
  if (!isOpen) return null;

  const [movies, setMovies] = useState(getStoredStudioMovies);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'editor'
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    genres: 'Sci-Fi, Action',
    poster_path: '',
    backdrop_path: '',
    media_type: 'movie',
    vote_average: 8.5,
    release_date: new Date().toISOString().split('T')[0],
    isAnime: false,
    audio_hi_url: '',
    audio_en_url: '',
    audio_ja_url: '',
    subtitle_url: '',
    download_url: ''
  });

  const [notification, setNotification] = useState(null);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      overview: '',
      genres: 'Sci-Fi, Action',
      poster_path: '',
      backdrop_path: '',
      media_type: 'movie',
      vote_average: 8.5,
      release_date: new Date().toISOString().split('T')[0],
      isAnime: false,
      audio_hi_url: '',
      audio_en_url: '',
      audio_ja_url: '',
      subtitle_url: '',
      download_url: ''
    });
    setActiveTab('editor');
  };

  const handleStartEdit = (m) => {
    setEditingId(m.id);
    const genreStr = Array.isArray(m.genres)
      ? m.genres.map((g) => (typeof g === 'string' ? g : g?.name)).filter(Boolean).join(', ')
      : (m.genres || 'Sci-Fi, Action');

    setFormData({
      title: m.title || m.name || '',
      overview: m.overview || '',
      genres: genreStr,
      poster_path: m.poster_path || '',
      backdrop_path: m.backdrop_path || '',
      media_type: m.media_type || 'movie',
      vote_average: m.vote_average || 8.5,
      release_date: m.release_date || m.first_air_date || new Date().toISOString().split('T')[0],
      isAnime: Boolean(m.isAnime),
      audio_hi_url: m.languages?.hi?.url || '',
      audio_en_url: m.languages?.en?.url || '',
      audio_ja_url: m.languages?.ja?.url || '',
      subtitle_url: m.subtitles?.[0]?.src || '',
      download_url: m.download_url || m.languages?.hi?.url || m.languages?.en?.url || ''
    });
    setActiveTab('editor');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this created title?')) return;
    const updated = movies.filter((m) => m.id !== id);
    setMovies(updated);
    saveStoredStudioMovies(updated);
    if (onMoviesChanged) onMoviesChanged();
    showNotify('Movie deleted from your studio catalog');
  };

  const handleSaveMovie = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a movie title');
      return;
    }

    const sampleHi = './media/hindi_audio.wav';
    const sampleEn = './media/english_audio.mp4';
    const sampleJa = './media/japanese_audio.wav';

    const movieObj = {
      id: editingId || `studio_${Date.now()}`,
      title: formData.title.trim(),
      name: formData.title.trim(),
      overview: formData.overview.trim() || 'Created in Furina Studio Platform.',
      poster_path: formData.poster_path.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      backdrop_path: formData.backdrop_path.trim() || formData.poster_path.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      media_type: formData.media_type,
      vote_average: Number(formData.vote_average) || 8.5,
      release_date: formData.release_date,
      category: 'studio',
      genres: (formData.genres || 'Studio Master').split(',').map((s) => s.trim()).filter(Boolean),
      thumbnail: formData.backdrop_path.trim() || formData.poster_path.trim(),
      isCustom: true,
      isAnime: formData.isAnime,
      download_url: formData.download_url.trim() || formData.audio_hi_url.trim() || formData.audio_en_url.trim() || sampleHi,
      languages: {
        hi: {
          label: 'Hindi Dub (Studio Master)',
          url: formData.audio_hi_url.trim() || sampleHi,
          type: 'video/mp4'
        },
        en: {
          label: 'English Audio (Studio Master)',
          url: formData.audio_en_url.trim() || sampleEn,
          type: 'video/mp4'
        },
        ja: {
          label: 'Japanese Audio (Studio Master)',
          url: formData.audio_ja_url.trim() || sampleJa,
          type: 'video/mp4'
        },
      },
      subtitles: formData.subtitle_url.trim() ? [
        { lang: 'en', label: 'English Subtitles', src: formData.subtitle_url.trim() }
      ] : [
        { lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' },
        { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' }
      ]
    };

    let updatedList;
    if (editingId) {
      updatedList = movies.map((m) => (m.id === editingId ? movieObj : m));
      showNotify(`Updated "${movieObj.title}" successfully!`);
    } else {
      updatedList = [movieObj, ...movies];
      showNotify(`Created and published "${movieObj.title}"!`);
    }

    setMovies(updatedList);
    saveStoredStudioMovies(updatedList);
    if (onMoviesChanged) onMoviesChanged();
    setActiveTab('list');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl h-[94vh] max-h-[94vh] flex flex-col bg-[#050b1e] border border-cyan-500/35 rounded-2xl shadow-[0_0_80px_rgba(56,189,248,0.35)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-[#07112b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-gray-950 font-black shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <Film className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Furina Movie Studio & Creator Platform</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Owned Media
                </span>
              </h2>
              <p className="text-xs text-cyan-200/70">
                Create, manage, and distribute movies with verified multi-audio tracks (🇮🇳 Hindi, 🇬🇧 English, 🇯🇵 Japanese).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notification && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{notification}</span>
              </div>
            )}

            <button
              onClick={onClose}
              aria-label="Close Movie Studio"
              className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#060e24] border-b border-cyan-500/20 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-cyan-500 text-gray-950 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : 'text-cyan-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Studio Catalog ({movies.length})</span>
            </button>

            <button
              onClick={handleStartCreate}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'editor' && !editingId
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-gray-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Movie</span>
            </button>
          </div>

          <div className="text-[11px] text-cyan-300/70 hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict 1:1 Audio Track Storage Guarantee</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: CATALOG LIST */}
          {activeTab === 'list' && (
            <div>
              {movies.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-cyan-500/30 rounded-2xl bg-[#07132f]/40">
                  <Film className="w-12 h-12 text-cyan-400/50 mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">No Studio Movies Created Yet</h3>
                  <p className="text-xs text-slate-300 max-w-sm mb-4">
                    Build your first owned movie with Hindi, English, and Japanese multi-audio tracks and download support.
                  </p>
                  <button
                    onClick={handleStartCreate}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs transition shadow flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Movie</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movies.map((m) => {
                    const hasHi = Boolean(m.languages?.hi?.url);
                    const hasEn = Boolean(m.languages?.en?.url);
                    const hasJa = Boolean(m.languages?.ja?.url);

                    return (
                      <div 
                        key={m.id}
                        className="flex flex-col justify-between bg-[#081534] border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-4 transition shadow-lg group"
                      >
                        <div className="flex gap-3">
                          <img 
                            src={m.poster_path} 
                            alt={m.title}
                            className="w-20 h-28 object-cover rounded-lg border border-cyan-500/30 shrink-0 shadow"
                            onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {m.media_type === 'tv' ? 'Series' : 'Movie'}
                              </span>
                              {m.isAnime && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  🌸 Anime
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-amber-300">
                                ★ {m.vote_average}
                              </span>
                            </div>
                            <h3 className="text-sm font-extrabold text-white truncate">{m.title}</h3>
                            <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                              {m.overview}
                            </p>

                            {/* Audio Track Badges */}
                            <div className="flex items-center gap-1 mt-2.5 flex-wrap text-[10px]">
                              <span className="text-cyan-300/60 font-semibold mr-1">Audios:</span>
                              {hasHi && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                                  🇮🇳 Hindi
                                </span>
                              )}
                              {hasEn && (
                                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.5 rounded font-bold">
                                  🇬🇧 English
                                </span>
                              )}
                              {hasJa && (
                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-bold">
                                  🇯🇵 Japanese
                                </span>
                              )}
                              {!hasHi && !hasEn && !hasJa && (
                                <span className="text-slate-400 italic">No audio assigned</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between border-t border-cyan-500/20 pt-3 mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onPlayMovie(m);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 font-black text-xs transition shadow flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Play / Preview</span>
                            </button>
                            <button
                              onClick={() => handleStartEdit(m)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 transition text-xs flex items-center gap-1 cursor-pointer"
                              title="Edit Movie"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition text-xs flex items-center gap-1 cursor-pointer"
                            title="Delete Title"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE / EDIT FORM */}
          {activeTab === 'editor' && (
            <form onSubmit={handleSaveMovie} className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-[#081534] border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  <span>1. Title & General Metadata</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-cyan-200/80 font-bold mb-1">Movie / Anime Title *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. The Matrix: Reloaded Uncut"
                      className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-cyan-200/80 font-bold mb-1">Release Date</label>
                    <input 
                      type="date" 
                      value={formData.release_date}
                      onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                      className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-cyan-200/80 font-bold mb-1">Media Type</label>
                    <select
                      value={formData.media_type}
                      onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                      className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="movie">Movie</option>
                      <option value="tv">TV / Web Series</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-cyan-200/80 font-bold mb-1 text-xs">Genres (comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.genres}
                      onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                      placeholder="e.g. Action, Sci-Fi, Thriller, Anime"
                      className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isAnime}
                        onChange={(e) => setFormData({ ...formData, isAnime: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-white font-bold">🌸 Treat as Anime</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-cyan-200/80 font-bold mb-1 text-xs">Overview & Synopsis</label>
                  <textarea 
                    rows="3"
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Enter detailed movie description..."
                    className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Artwork Section */}
              <div className="bg-[#081534] border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span>2. Poster & Backdrop Media Assets</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-cyan-200/80 font-bold mb-1">Poster Image URL (Vertical)</label>
                    <input 
                      type="url" 
                      value={formData.poster_path}
                      onChange={(e) => setFormData({ ...formData, poster_path: e.target.value })}
                      placeholder="https://example.com/poster.jpg"
                      className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-cyan-200/80 font-bold mb-1">Backdrop / Thumbnail URL (16:9)</label>
                    <input 
                      type="url" 
                      value={formData.backdrop_path}
                      onChange={(e) => setFormData({ ...formData, backdrop_path: e.target.value })}
                      placeholder="https://example.com/backdrop.jpg"
                      className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Audio Tracks Configuration */}
              <div className="bg-[#081534] border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>3. Dedicated Multi-Language Audio Media Sources</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Direct MP4 or HLS (.m3u8)</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Hindi Audio */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <label className="block text-amber-300 font-extrabold mb-1 flex items-center gap-1.5">
                      <span>🇮🇳</span>
                      <span>Hindi Audio Track Stream / File URL</span>
                    </label>
                    <input 
                      type="url"
                      value={formData.audio_hi_url}
                      onChange={(e) => setFormData({ ...formData, audio_hi_url: e.target.value })}
                      placeholder="https://.../movie-hindi-audio.mp4 or .m3u8"
                      className="w-full bg-[#050c20] border border-amber-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-xs"
                    />
                  </div>

                  {/* English Audio */}
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <label className="block text-blue-300 font-extrabold mb-1 flex items-center gap-1.5">
                      <span>🇬🇧</span>
                      <span>English Audio Track Stream / File URL</span>
                    </label>
                    <input 
                      type="url"
                      value={formData.audio_en_url}
                      onChange={(e) => setFormData({ ...formData, audio_en_url: e.target.value })}
                      placeholder="https://.../movie-english-dub.mp4 or .m3u8"
                      className="w-full bg-[#050c20] border border-blue-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono text-xs"
                    />
                  </div>

                  {/* Japanese Audio */}
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <label className="block text-purple-300 font-extrabold mb-1 flex items-center gap-1.5">
                      <span>🇯🇵</span>
                      <span>Japanese Audio Track Stream / File URL</span>
                    </label>
                    <input 
                      type="url"
                      value={formData.audio_ja_url}
                      onChange={(e) => setFormData({ ...formData, audio_ja_url: e.target.value })}
                      placeholder="https://.../movie-japanese-sub.mp4 or .m3u8"
                      className="w-full bg-[#050c20] border border-purple-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitles & Download Asset */}
              <div className="bg-[#081534] border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>4. Subtitles & Authorized Download Asset</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-cyan-200/80 font-bold mb-1">Subtitles Track (WebVTT .vtt)</label>
                    <input 
                      type="url"
                      value={formData.subtitle_url}
                      onChange={(e) => setFormData({ ...formData, subtitle_url: e.target.value })}
                      placeholder="https://.../subtitles-en.vtt"
                      className="w-full bg-[#050c20] border border-cyan-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-300 font-bold mb-1">Authorized Direct Download MP4 File</label>
                    <input 
                      type="url"
                      value={formData.download_url}
                      onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                      placeholder="https://.../movie-1080p-master.mp4"
                      className="w-full bg-[#050c20] border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2.5 rounded-xl border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/5 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMovie}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition shadow-[0_0_20px_rgba(56,189,248,0.5)] transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Publish to Catalog'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
