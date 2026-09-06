// TMDB Service with live auto-updating & offline curated blockbusters
const API_KEY = '4e44d9029b1270a757cddc766a1bcb63';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

const today = new Date().toISOString().split('T')[0];

// Curated blockbusters (Hindi, English, Web Series) as immediate backup
const FALLBACK_MEDIA = [
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTjA3R0neXjgu144Y1fX3AcA.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2024-07-24',
    category: 'hollywood'
  },
  {
    id: 1114513,
    title: 'Stree 2: Sarkate Ka Aatank',
    overview: 'After the events of Stree, the town of Chanderi is being haunted again. This time by a headless monster who is abducting women.',
    poster_path: '/mAMzL8kYQj0kM2r2l8n1S9l9B1T.jpg',
    backdrop_path: '/aKa9xKzK1d5I7t8tL6c8yJ4kK.jpg',
    media_type: 'movie',
    vote_average: 7.5,
    release_date: '2024-08-15',
    category: 'hindi'
  },
  {
    id: 1160018,
    title: 'Kill',
    overview: 'When a pair of commando friends face an army of invading bandits on a passenger train bound for New Delhi, what should have been a peaceful ride turns into a bloody fight for survival.',
    poster_path: '/m4qiq6B9A8sX7wFwJkZ4tY9B.jpg',
    backdrop_path: '/yDHYTjA3R0neXjgu144Y1fX3AcA.jpg',
    media_type: 'movie',
    vote_average: 7.4,
    release_date: '2024-07-03',
    category: 'hindi'
  },
  {
    id: 125988,
    name: 'Silo',
    title: 'Silo',
    overview: 'In a ruined and toxic future, thousands live in a giant silo deep underground. After its sheriff breaks a cardinal rule and residents die mysteriously, engineer Juliette starts to uncover shocking secrets and the truth about the silo.',
    poster_path: '/1N11J2m0e4f3a9n8y8Q1Z2X.jpg',
    backdrop_path: '/etj5CuMuamjhG2ZwKoBGwd7IP8.jpg',
    media_type: 'tv',
    vote_average: 8.2,
    first_air_date: '2023-05-04',
    category: 'series'
  },
  {
    id: 94997,
    name: 'House of the Dragon',
    title: 'House of the Dragon',
    overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights.',
    poster_path: '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
    backdrop_path: '/etj5CuMuamjhG2ZwKoBGwd7IP8.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2022-08-21',
    category: 'series'
  },
  {
    id: 84773,
    name: 'Mirzapur',
    title: 'Mirzapur',
    overview: 'The iron-fisted Akhandanand Tripathi is a millionaire carpet exporter and the mafia don of Mirzapur.',
    poster_path: '/vN440d9dJ99xHqL3W6uX7eY9kF.jpg',
    backdrop_path: '/x4NlXl8Z0oW9nFm9rQ2yT6kK.jpg',
    media_type: 'tv',
    vote_average: 8.2,
    first_air_date: '2018-11-16',
    category: 'hindi'
  },
  {
    id: 66732,
    name: 'Stranger Things',
    title: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2016-07-15',
    category: 'series'
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOm8zToLQI0ALFL6LDJuTYk5.jpg',
    media_type: 'movie',
    vote_average: 7.6,
    release_date: '2024-06-11',
    category: 'hollywood'
  },
  {
    id: 974262,
    title: 'Kalki 2898 AD',
    overview: 'A modern avatar of the Hindu god Vishnu, who is believed to have descended to the earth to protect the world from evil forces.',
    poster_path: '/3uN3Z9G4V5kQJ8tM1mF6l4h9xL.jpg',
    backdrop_path: '/u9xW1x9L8K2mN1b3v6pL8kQJ.jpg',
    media_type: 'movie',
    vote_average: 7.3,
    release_date: '2024-06-27',
    category: 'hindi'
  }
];

export async function fetchTrendingAll(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return page === 1 ? FALLBACK_MEDIA : [];
    const filtered = data.results.filter(item => {
      if (!item || typeof item !== 'object' || !item.id) return false;
      if (item.media_type === 'person') return false;
      const releaseDate = item.release_date || item.first_air_date;
      const votes = item.vote_count || 0;
      if (releaseDate && releaseDate > today && votes < 5) return false;
      return true;
    });
    const validResults = (data.results || []).filter(item => item && item.media_type !== 'person' && item.id);
    return filtered.length > 0 ? filtered : validResults;
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA : [];
  }
}

export async function fetchHollywoodMovies(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=en&primary_release_date.lte=${today}&vote_count.gte=20&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return data.results && data.results.length > 0 ? data.results.map(m => ({ ...m, media_type: 'movie' })) : (page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'hollywood') : []);
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'hollywood') : [];
  }
}

export async function fetchHindiMovies(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&region=IN&primary_release_date.lte=${today}&vote_count.gte=5&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return data.results && data.results.length > 0 ? data.results.map(m => ({ ...m, media_type: 'movie' })) : (page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'hindi') : []);
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'hindi') : [];
  }
}

export async function fetchTrendingSeries(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&first_air_date.lte=${today}&vote_count.gte=15&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return data.results && data.results.length > 0 ? data.results.map(m => ({ ...m, media_type: 'tv' })) : (page === 1 ? FALLBACK_MEDIA.filter(m => m.media_type === 'tv') : []);
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA.filter(m => m.media_type === 'tv') : [];
  }
}

export async function fetchAnime(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&first_air_date.lte=${today}&vote_count.gte=10&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return (data.results || []).map(m => ({ ...m, media_type: 'tv', category: 'anime', isAnime: true }));
  } catch (err) {
    return [];
  }
}

// 👻 Horror Cinema
export async function fetchHorrorMovies(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&primary_release_date.lte=${today}&vote_count.gte=25&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return (data.results || []).map(m => ({ ...m, media_type: 'movie', category: 'horror' }));
  } catch (err) {
    return [];
  }
}

// 🇰🇷 K-Drama (Korean Dramas)
export async function fetchKDramas(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&with_genres=18|10759|9648&first_air_date.lte=${today}&vote_count.gte=8&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return (data.results || []).map(m => ({ ...m, media_type: 'tv', category: 'kdrama' }));
  } catch (err) {
    return [];
  }
}

// 18+ Mature & Uncut Cinema
export async function fetchMatureMovies(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&include_adult=true&certification_country=US&certification=R|NC-17&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return data.results && data.results.length > 0 ? data.results.map(m => ({ ...m, media_type: 'movie', is_mature: true })) : (page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'mature') : []);
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'mature') : [];
  }
}

// 🔞 Curated 18+ Ecchi & ComicFesta Anime (Overflow, Joshiochi, Araiya-san, etc.)
export const SECRET_ECCHI_ANIME = [
  {
    id: 95897,
    name: 'Overflow',
    title: 'Overflow',
    overview: 'Kazushi Sudo is a college student whose childhood friends, the Shirakawa sisters Ayane and Kotone, frequently visit his apartment. When an accidental shared bath occurs, things quickly turn intimate.',
    poster_path: '/8RtwL5gxUvh9YViqjhNlVRvJpum.jpg',
    backdrop_path: '/8RtwL5gxUvh9YViqjhNlVRvJpum.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2020-01-06',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 81044,
    name: 'Joshiochi! 2-kai kara Onnanoko ga... Futtekita!?',
    title: 'Joshiochi! 2-kai kara Onnanoko ga... Futtekita!?',
    overview: 'Sosuke Sunomori lives in a run-down apartment when one day the ceiling collapses and tenant Sunao Oumi falls straight into his room from the 2nd floor, beginning a steamy cohabitation.',
    poster_path: '/7x8x6dl4leOSw6KGUcOrQew7Eua.jpg',
    backdrop_path: '/7x8x6dl4leOSw6KGUcOrQew7Eua.jpg',
    media_type: 'tv',
    vote_average: 7.9,
    first_air_date: '2018-07-02',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 88090,
    name: 'Araiya-san! Ore to Aitsu ga Onnayu de!?',
    title: 'Araiya-san! Ore to Aitsu ga Onnayu de!?',
    overview: 'Souta begins working at his family public bathhouse as a back-washer. While on duty, he ends up washing his classmate Aoi who disguised herself, leading to a secret relationship.',
    poster_path: '/upxgNd7JdqbxUXDuEkgba18iG8F.jpg',
    backdrop_path: '/upxgNd7JdqbxUXDuEkgba18iG8F.jpg',
    media_type: 'tv',
    vote_average: 7.8,
    first_air_date: '2019-04-08',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 78501,
    name: "Sweet Punishment: I'm the Guard's Personal Pet",
    title: "Sweet Punishment: I'm the Guard's Personal Pet",
    overview: 'Falsely convicted office worker Hina Saotome is sentenced to a harsh penitentiary where the ruthless head guard Aki Myojin singles her out for special treatment.',
    poster_path: '/rbETzzJLGIB2Bg6NwNekWTKfM6d.jpg',
    backdrop_path: '/rbETzzJLGIB2Bg6NwNekWTKfM6d.jpg',
    media_type: 'tv',
    vote_average: 7.7,
    first_air_date: '2018-04-02',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 90388,
    name: 'Fire in His Fingertips',
    title: 'Fire in His Fingertips: A Flirty Fireman',
    overview: 'When an apartment fire threatens Ryo, she is saved by her childhood friend and handsome firefighter Souma, sparking a passionate romance.',
    poster_path: '/yHUDRf2e9FGeWXPsT5lVF3iCUwc.jpg',
    backdrop_path: '/yHUDRf2e9FGeWXPsT5lVF3iCUwc.jpg',
    media_type: 'tv',
    vote_average: 7.8,
    first_air_date: '2019-07-08',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 131660,
    name: 'Show Time! Uta no Oneesan Datte Shitai',
    title: 'Show Time! Uta no Oneesan Datte Shitai',
    overview: 'A single father meets the lead singer of a popular children show at a restaurant, sparking a secret romance behind the cameras.',
    poster_path: '/7S86pkMfatspJmXENcPZfgaKB33.jpg',
    backdrop_path: '/7S86pkMfatspJmXENcPZfgaKB33.jpg',
    media_type: 'tv',
    vote_average: 7.6,
    first_air_date: '2021-10-04',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 118588,
    name: 'Seduced by My Best Friend (Kuro Gal)',
    title: 'I Became a Kuro Gal so I Had Sex With My Best Friend',
    overview: 'Two close male friends take an experimental potion that transforms one into a blonde gyaru, taking their friendship to the next level.',
    poster_path: '/kRytTcYHz6pq3cPEwNTAOkSQhQ4.jpg',
    backdrop_path: '/kRytTcYHz6pq3cPEwNTAOkSQhQ4.jpg',
    media_type: 'tv',
    vote_average: 7.5,
    first_air_date: '2021-04-05',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 99071,
    name: 'Redo of Healer',
    title: 'Redo of Healer',
    overview: 'Healing magician Keyaru uses magic to rewind four years into the past, embarking on a quest for vengeance against those who wronged him.',
    poster_path: '/9T7TT0w92RbeRP5QSnNq81HHxde.jpg',
    backdrop_path: '/9T7TT0w92RbeRP5QSnNq81HHxde.jpg',
    media_type: 'tv',
    vote_average: 8.3,
    first_air_date: '2021-01-13',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 96444,
    name: 'Interspecies Reviewers',
    title: 'Interspecies Reviewers',
    overview: 'Adventurers travel through a fantasy world reviewing adult entertainment establishments run by various monster girls.',
    poster_path: '/xJZwaZAXoon6wxkgXiWQNEeyW4C.jpg',
    backdrop_path: '/xJZwaZAXoon6wxkgXiWQNEeyW4C.jpg',
    media_type: 'tv',
    vote_average: 8.1,
    first_air_date: '2020-01-11',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 45950,
    name: 'High School DxD',
    title: 'High School DxD',
    overview: 'Issei Hyodo is killed on his first date by a fallen angel and resurrected as a devil by the glamorous Rias Gremory.',
    poster_path: '/5a9vaaLDAZTYjgfWIw7ZYhL1m1A.jpg',
    backdrop_path: '/5a9vaaLDAZTYjgfWIw7ZYhL1m1A.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2012-01-06',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 68005,
    name: 'Yosuga no Sora',
    title: 'Yosuga no Sora: In Solitude, Where We Are Least Alone',
    overview: 'Twin siblings Haruka and Sora move to their rural grandparents house, discovering lingering past memories and intense bonds.',
    poster_path: '/9F80WGUD6WYfoEDMImf988NlXhC.jpg',
    backdrop_path: '/9F80WGUD6WYfoEDMImf988NlXhC.jpg',
    media_type: 'tv',
    vote_average: 7.7,
    first_air_date: '2010-10-04',
    category: 'ecchi_anime',
    is_mature: true
  },
  {
    id: 64706,
    name: 'Prison School',
    title: 'Prison School',
    overview: 'Five boys enroll in a formerly all-girls boarding academy and find themselves imprisoned after getting caught in forbidden places.',
    poster_path: '/tqtd72674k19IfGYJ2wdGJGvXX.jpg',
    backdrop_path: '/tqtd72674k19IfGYJ2wdGJGvXX.jpg',
    media_type: 'tv',
    vote_average: 8.0,
    first_air_date: '2015-07-11',
    category: 'ecchi_anime',
    is_mature: true
  }
];

export async function fetchEcchiAnime(page = 1) {
  if (page === 1) return SECRET_ECCHI_ANIME;
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&include_adult=true&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results.filter(item => item && item.id && item.media_type !== 'person').map(m => ({
        ...m,
        media_type: 'tv',
        category: 'ecchi_anime',
        is_mature: true
      }));
    }
  } catch (e) {}
  return [];
}

export async function searchContent(query, page = 1, includeAdult = false) {
  if (!query || query.trim() === '') return [];
  const isHindiQuery = /\b(hindi|dubbed|dub)\b/i.test(query);
  try {
    let res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}&include_adult=${includeAdult}`);
    let data = await res.json();
    let results = (data.results || []).filter(item => item && item.id && item.media_type !== 'person' && (item.poster_path || item.backdrop_path));

    // If no results, try stripping modifiers like 'hindi dubbed', 'hindi', 'dubbed', 'full movie', 'movie', etc.
    if (results.length === 0) {
      const cleaned = query.replace(/\b(hindi\s*dubbed|hindi\s*dub|hindi|dubbed|dub|full\s*movie|movie|series)\b/gi, '').trim();
      if (cleaned && cleaned.toLowerCase() !== query.trim().toLowerCase()) {
        res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(cleaned)}&page=${page}&include_adult=${includeAdult}`);
        data = await res.json();
        results = (data.results || []).filter(item => item && item.id && item.media_type !== 'person' && (item.poster_path || item.backdrop_path));
      }
    }

    return results.map(item => ({
      ...item,
      isHindiDubbed: isHindiQuery || item.original_language === 'hi'
    }));
  } catch (err) {
    return FALLBACK_MEDIA.filter(m => (m.title || m.name || '').toLowerCase().includes(query.toLowerCase()));
  }
}

export async function fetchTvDetails(tvId) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchSeasonEpisodes(tvId, seasonNum) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await res.json();
    if (data.episodes && data.episodes.length > 0) {
      return data.episodes;
    }
    // Fallback: generate default episodes if empty so user is never stuck
    return Array.from({ length: 12 }, (_, i) => ({
      episode_number: i + 1,
      name: `Episode ${i + 1}`
    }));
  } catch (err) {
    return Array.from({ length: 12 }, (_, i) => ({
      episode_number: i + 1,
      name: `Episode ${i + 1}`
    }));
  }
}
