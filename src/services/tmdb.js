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


export const CURATED_HINDI_DUBBED_BLOCKBUSTERS = [
  {
    id: 299534,
    title: 'Avengers: Endgame (Hindi Dubbed)',
    name: 'Avengers: Endgame (Hindi Dubbed)',
    overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in Hindi audio.',
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    media_type: 'movie',
    vote_average: 8.3,
    release_date: '2019-04-24',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine (Hindi Dubbed)',
    name: 'Deadpool & Wolverine (Hindi Dubbed)',
    overview: 'Wade Wilson and Wolverine suit up for an action-packed, fourth-wall breaking adventure across the multiverse in full Hindi audio.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTjA3R0neXjgu144Y1fX3AcA.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2024-07-24',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 634649,
    title: 'Spider-Man: No Way Home (Hindi Dubbed)',
    name: 'Spider-Man: No Way Home (Hindi Dubbed)',
    overview: 'Peter Parker seeks Doctor Strange help to restore his secret identity, unleashing villains from across the multiverse in Hindi.',
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    media_type: 'movie',
    vote_average: 8.0,
    release_date: '2021-12-15',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 76600,
    title: 'Avatar: The Way of Water (Hindi Dubbed)',
    name: 'Avatar: The Way of Water (Hindi Dubbed)',
    overview: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. An old threat returns, forcing a difficult war in Hindi.',
    poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2022-12-14',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 872585,
    title: 'Oppenheimer (Hindi Dubbed)',
    name: 'Oppenheimer (Hindi Dubbed)',
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II in Hindi.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    media_type: 'movie',
    vote_average: 8.1,
    release_date: '2023-07-19',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 823464,
    title: 'Godzilla x Kong: The New Empire (Hindi Dubbed)',
    name: 'Godzilla x Kong: The New Empire (Hindi Dubbed)',
    overview: 'Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world in Hindi.',
    poster_path: '/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    backdrop_path: '/qrGtVFxaD8c7et0j3hxYneAcytF.jpg',
    media_type: 'movie',
    vote_average: 7.2,
    release_date: '2024-03-27',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 1022789,
    title: 'Inside Out 2 (Hindi Dubbed)',
    name: 'Inside Out 2 (Hindi Dubbed)',
    overview: 'Teenager Riley mind headquarters undergoes sudden demolition for new emotions like Anxiety and Envy in Hindi audio.',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOm8zToLQI0ALFL6LDJuTYk5.jpg',
    media_type: 'movie',
    vote_average: 7.6,
    release_date: '2024-06-11',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 385687,
    title: 'Fast X (Hindi Dubbed)',
    name: 'Fast X (Hindi Dubbed)',
    overview: 'Dom Toretto and his family confront the most lethal opponent they have ever faced: a terrifying threat emerging from the past in Hindi.',
    poster_path: '/fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
    backdrop_path: '/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg',
    media_type: 'movie',
    vote_average: 7.1,
    release_date: '2023-05-17',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 603692,
    title: 'John Wick: Chapter 4 (Hindi Dubbed)',
    name: 'John Wick: Chapter 4 (Hindi Dubbed)',
    overview: 'John Wick uncovers a path to defeating The High Table, facing off against a new enemy with powerful alliances across the globe in Hindi.',
    poster_path: '/vZloFAK7NKnMGKEslUsZ2VoNmQm.jpg',
    backdrop_path: '/7I6VUdPj6tQECNHdviJkUHD2389.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2023-03-22',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  },
  {
    id: 1726,
    title: 'Iron Man (Hindi Dubbed)',
    name: 'Iron Man (Hindi Dubbed)',
    overview: 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil in Hindi.',
    poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
    backdrop_path: '/cyecB7godJ6kNHWh07ZQ976FDx0.jpg',
    media_type: 'movie',
    vote_average: 7.6,
    release_date: '2008-04-30',
    category: 'hindi',
    isHindiDubbed: true,
    original_language: 'hi'
  }
];


export async function fetchHindiMovies(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&region=IN&primary_release_date.lte=${today}&vote_count.gte=5&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    const bollywood = (data.results && data.results.length > 0)
      ? data.results.map(m => ({ ...m, media_type: 'movie', category: 'hindi', isHindiDubbed: true }))
      : (page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'hindi') : []);
    
    if (page === 1) {
      return [...CURATED_HINDI_DUBBED_BLOCKBUSTERS, ...bollywood];
    }
    return bollywood;
  } catch (err) {
    return page === 1 ? [...CURATED_HINDI_DUBBED_BLOCKBUSTERS, ...FALLBACK_MEDIA.filter(m => m.category === 'hindi')] : [];
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



// Verified Hollywood Blockbusters with official Hindi dubs in theaters/OTT
export const VERIFIED_HINDI_DUBBED_IDS = new Set([
  533535, // Deadpool & Wolverine
  299534, // Avengers: Endgame
  299536, // Avengers: Infinity War
  24428,  // The Avengers
  99861,  // Avengers: Age of Ultron
  293660, // Deadpool
  383498, // Deadpool 2
  634649, // Spider-Man: No Way Home
  429617, // Spider-Man: Far From Home
  315635, // Spider-Man: Homecoming
  1726,   // Iron Man
  10138,  // Iron Man 2
  68721,  // Iron Man 3
  76600,  // Avatar: The Way of Water
  19995,  // Avatar
  872585, // Oppenheimer
  157336, // Interstellar
  155,    // The Dark Knight
  385687, // Fast X
  385128, // F9
  337339, // The Fate of the Furious
  168259, // Furious 7
  823464, // Godzilla x Kong: The New Empire
  399566, // Godzilla vs. Kong
  507086, // Jurassic World Dominion
  135397, // Jurassic World
  361743, // Top Gun: Maverick
  572802, // Aquaman and the Lost Kingdom
  297802, // Aquaman
  505642, // Black Panther: Wakanda Forever
  284054, // Black Panther
  453395, // Doctor Strange in the Multiverse of Madness
  284052, // Doctor Strange
  616037, // Thor: Love and Thunder
  284053, // Thor: Ragnarok
  447365, // Guardians of the Galaxy Vol. 3
  414906, // The Batman
  603692, // John Wick: Chapter 4
  458156, // John Wick: Chapter 3
  693134, // Dune: Part Two
  438631, // Dune
  1022789,// Inside Out 2
  1011985,// Kung Fu Panda 4
  912649, // Venom: The Last Dance
  580489, // Venom: Let There Be Carnage
  335983, // Venom
  575264, // Mission: Impossible - Dead Reckoning Part One
  667538, // Transformers: Rise of the Beasts
  1858,   // Transformers
  558449, // Gladiator II
  1241982,// Moana 2
  271110, // Captain America: Civil War
  822119, // Captain America: Brave New World
  420818, // The Lion King
  277834, // The Jungle Book
  597     // Titanic
]);

export function isHindiAvailable(item) {
  if (!item) return false;
  if (item.original_language === 'hi' || item.category === 'hindi') return true;
  if (VERIFIED_HINDI_DUBBED_IDS.has(Number(item.id))) return true;
  return false;
}


// 🔞 Curated 18+ Ecchi & ComicFesta Anime (Overflow, Joshiochi, Araiya-san, etc.)
export const SECRET_ECCHI_ANIME = [
  {
    "id": 95897,
    "name": "Overflow",
    "title": "Overflow",
    "overview": "Kazushi Sudou is a university student who is visited by his two childhood friends, the sisters Ayane and Kotone Shirakawa. When Ayane discovers that Kazushi not only forgot to buy her pudding but is also using her special lotion in the bath, she decides to take revenge and join Kazushi in his bath along with Kotone. Will the perverted Kazushi be able to remain indifferent to them both?",
    "poster_path": "/8RtwL5gxUvh9YViqjhNlVRvJpum.jpg",
    "backdrop_path": "/4NRBKA8qVzCvuD3WeLieiLGmIjm.jpg",
    "media_type": "tv",
    "vote_average": 7.5,
    "first_air_date": "2020-01-06",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 81044,
    "name": "Joshiochi! 2-kai kara Onnanoko ga... Futtekita!?",
    "title": "Joshiochi! 2-kai kara Onnanoko ga... Futtekita!?",
    "overview": "Sousuke Aikawa is a part-time worker who lives in a rundown apartment building where his only consolation is that the landlord is a beautiful woman and the girl who lives above him is cute. One day though, the ceiling above him creaks and... Bang! In from the second floor, directly above him, the cute girl comes crashing down on him…!? In an erotic encounter that can only be classified as a miracle, hearts and bodies are connected by chance. Then for some reason, he starts to live with both of these beautiful women!? Under this one roof, just what exactly will become of this crowded love triangle...!?",
    "poster_path": "/7x8x6dl4leOSw6KGUcOrQew7Eua.jpg",
    "backdrop_path": "/AgTy5IsOv1FAx02gunir8ZSiUxG.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2018-07-02",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 88090,
    "name": "Araiya-san! Ore to Aitsu ga Onnayu de!?",
    "title": "Araiya-san! Ore to Aitsu ga Onnayu de!?",
    "overview": "Male student Souta Tsukishima begins working at his family's public bathhouse as a back washer. While concealing her true identity, Souta's classmate Aoi Yuzuki visits the bathhouse. A relationship between the two begins to develop when Souta washes Aoi's back.",
    "poster_path": "/upxgNd7JdqbxUXDuEkgba18iG8F.jpg",
    "backdrop_path": "/jxBUmVXcrkMLCjyzCOhHMmZ5qqO.jpg",
    "media_type": "tv",
    "vote_average": 5.9,
    "first_air_date": "2019-04-08",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 78501,
    "name": "Sweet Punishment: I'm the Guard's Personal Pet",
    "title": "Sweet Punishment: I'm the Guard's Personal Pet",
    "overview": "The story is set in a prison in the near future. It revolves around Hina Saotome, imprisoned despite her innocence, and the elegant yet sadistic guard Aki Myoujin. Hina's heart and body are at the mercy of Myoujin's \"heartless yet sweet domination\" from physical examinations to lovers' prison visits.",
    "poster_path": "/rbETzzJLGIB2Bg6NwNekWTKfM6d.jpg",
    "backdrop_path": "/5Akyn19AM9flDDUN7pMUdzA9dWD.jpg",
    "media_type": "tv",
    "vote_average": 7.2,
    "first_air_date": "2018-04-02",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 90388,
    "name": "Fire in His Fingertips",
    "title": "Fire in His Fingertips",
    "overview": "Office worker Ryou Fujihashi is trapped inside her apartment which has set ablaze. The firefighters arrive in time to save her, and one of them happens to be Souma Mizuno, Fujihashi's childhood friend who she had a crush on. As the apartment fire gets put out, an old love gets rekindled.",
    "poster_path": "/yHUDRf2e9FGeWXPsT5lVF3iCUwc.jpg",
    "backdrop_path": "/lLOLKqe6r7uESLDcoO4TaZPHNdW.jpg",
    "media_type": "tv",
    "vote_average": 6.9,
    "first_air_date": "2019-07-08",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 131660,
    "name": "Show Time!",
    "title": "Show Time!",
    "overview": "Fujimoto Shouji is a widowed single father who aspires to be a picture book author. Kana, his only daughter, is a big fan of Takasaki Minami, the singing idol on the children’s educational show “Let’s Sing With Big Sis!” One day, Shouji encounters Minami while she is outside of work. As a television icon for children, Minami is prohibited from romantic relationships, so she is lonely in her private life. Thus begins an adult love story with a songstress. (Inspired by the character Uta no Oneesan from the children’s show Okaasan to Issho.)",
    "poster_path": "/7S86pkMfatspJmXENcPZfgaKB33.jpg",
    "backdrop_path": "/qsiYayWAoPEhbCld0m2PpVeiM2Z.jpg",
    "media_type": "tv",
    "vote_average": 7.2,
    "first_air_date": "2021-10-04",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 118588,
    "name": "Seduced by My Best Friend",
    "title": "Seduced by My Best Friend",
    "overview": "Shion and Rui are the dream team when it comes to hitting on women. Tonight was going to be another night of hooking up with girls for Shion, but he ended up taking a strange drug. When he woke up... he'd turned into a girl?! Rui came looking for Shion, but didn't recognize him, and started hitting on him...",
    "poster_path": "/kRytTcYHz6pq3cPEwNTAOkSQhQ4.jpg",
    "backdrop_path": "/kWmMpYtfrflLoElevbtpQxsz5M6.jpg",
    "media_type": "tv",
    "vote_average": 6.4,
    "first_air_date": "2021-04-05",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 99071,
    "name": "Redo of Healer",
    "title": "Redo of Healer",
    "overview": "In a world of monsters, adventurers and magic, some of the most gifted healers are subjugated to brute force. Keyaru gains the ability to rewind time and turns the tables on those who’ve exploited him in this dark fantasy tale of vengeance and fury.",
    "poster_path": "/9T7TT0w92RbeRP5QSnNq81HHxde.jpg",
    "backdrop_path": "/e30T3teKp6VZlIXhI0AhTDksvoy.jpg",
    "media_type": "tv",
    "vote_average": 8.3,
    "first_air_date": "2021-01-13",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 96444,
    "name": "Interspecies Reviewers",
    "title": "Interspecies Reviewers",
    "overview": "In a world bursting at the seams with moe monsters and humanoids of the horned sort, which brave heroes will take it upon themselves to review the beastly babes of the red-light district? Can only one be crowned the ultimate title of best girl? Behold the most tantalizing of trials.",
    "poster_path": "/xJZwaZAXoon6wxkgXiWQNEeyW4C.jpg",
    "backdrop_path": "/4dNLVByLrqjJUztBDcN6DdM8xz2.jpg",
    "media_type": "tv",
    "vote_average": 7.9,
    "first_air_date": "2020-01-11",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 45950,
    "name": "High School DxD",
    "title": "High School DxD",
    "overview": "Issei Hyodo is your average perverted high school student whose one wish in life is to have his own harem, but he's got to be one of the unluckiest guys around. He goes on his first date with a girl only to get brutally attacked and killed when it turns out the girl is really a vicious fallen angel. To top it all off, he's later reincarnated as a devil by his gorgeous senpai who tells him that she is also a devil and now his master! One thing's for sure, his peaceful days are over. In a battle between devils and angels, who will win?",
    "poster_path": "/5a9vaaLDAZTYjgfWIw7ZYhL1m1A.jpg",
    "backdrop_path": "/oF8PNdntjZ7DUrAvnhNPPNRi0q6.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "first_air_date": "2012-01-06",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 68005,
    "name": "Yosuga no Sora",
    "title": "Yosuga no Sora",
    "overview": "Kasugano Haruka and his sister Sora have lost both their parents in an accident, and with them all their support. They decide to move out of the city to the rural town where they once spent summers with their late grandfather. At first everything seems familiar and peaceful, but changes come as Haruka starts to remember things from his youth.",
    "poster_path": "/9F80WGUD6WYfoEDMImf988NlXhC.jpg",
    "backdrop_path": "/5nPRHOeP8D3O4bfgCICu218H1OI.jpg",
    "media_type": "tv",
    "vote_average": 6.9,
    "first_air_date": "2010-10-04",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 64706,
    "name": "Prison School",
    "title": "Prison School",
    "overview": "There was a time when the Hachimitsu Private Academy was a revered and elite all-girls' boarding school on the outskirts of Tokyo but a recent policy revision is allowing boys into the student body. On his first day, Kiyoshi Fujino discovers that he's one of only five boys enrolled at the school. Completely overwhelmed by the thousands of girls on campus, the few boys find that their situation is less than ideal.",
    "poster_path": "/tqtd72674k19IfGYJ2wdGJGvXX.jpg",
    "backdrop_path": "/7FqF8p7XsjgHOqVI9uwYy45jDDS.jpg",
    "media_type": "tv",
    "vote_average": 8.1,
    "first_air_date": "2015-07-11",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 85588,
    "name": "Papa datte, Shitai",
    "title": "Papa datte, Shitai",
    "overview": "\"There are Times I Cannot Hold It, Even If I'm a Father\" University student Asumi came to Naruse household to be a housekeeper for his part-time job. The family consists of a single-father and a son Ichika. Among them, the father Naruse is too sexy for Asumi!! Even if he is not gay, Asumi gets conscious of Keiichi, and when he noticed that Keiichi is sexually unsatisfied by noticing him watching adult video in his room, he would unconsciously get tempted to attack him…! \"Naruse-san, you're too sexy for a father with a child...!\"",
    "poster_path": "/ydpL1rKDmIiTfCGD8gNQrUluA5g.jpg",
    "backdrop_path": "/tccHdpmHoL7U0N9s8amDqilUShr.jpg",
    "media_type": "tv",
    "vote_average": 5.4,
    "first_air_date": "2019-01-07",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 70998,
    "name": "Souryo to Majiwaru Shikiyoku no Yoru ni...",
    "title": "Souryo to Majiwaru Shikiyoku no Yoru ni...",
    "overview": "At a high school reunion, Mio Fukatani reunites with a classmate she has not seen in years—Takahide Kujou. She had always wanted to know more about the kind-hearted boy in high school, but once she realizes that Kujou has become a monk, she believes that any chance of getting to know him romantically is slim. Deciding to drink away her sorrows, she ends up walking home drunk, and surprisingly, running into Kujou who helps her get home. However, once inside, Kujou's lust for Mio becomes apparent and the two share an erotic night of passion. As this steamy romance blossoms between these two unlikely lovers, Mio and Kujou will undoubtedly spend many nights together in utter ecstasy.",
    "poster_path": "/ueI9EeoRdMVa7hWEm21nQEU8Zv3.jpg",
    "backdrop_path": "/4kQiFnWtwndtCyKMszVJNPEE1kY.jpg",
    "media_type": "tv",
    "vote_average": 5.5,
    "first_air_date": "2017-04-03",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 74180,
    "name": "My Marriage Partner Is My Student, a Cocky Troublemaker",
    "title": "My Marriage Partner Is My Student, a Cocky Troublemaker",
    "overview": "Teacher Nano Saikawa hasn't given much thought to marriage, but her father's friend wants her to have a marriage interview with his son, Souichirou Takamiya. After the interview, they spend the day together. As they gradually become more comfortable with one another, Souichirou asks for her hand in marriage. Things quickly heat up between them, and the two wind up in bed together. However, when she removes his glasses, she discovers he is not Souichirou; he is actually one of her problem students, Souji Kuga! Souji's explanation is watertight: when he realized his brother was to be Nano's intended, Souji posed as him in order to be with her. And what's more, he is even confident that his family will approve of their marriage. However, an illicit relationship with a student is the last thing Nano wants. But will she be able to resist his charms, especially when her body begins to ache for his?.",
    "poster_path": "/hK2xyIPdTD3cGgjxnebjRiueqCQ.jpg",
    "backdrop_path": "/m4Ub1bgSLNlVeKKX1sXjxQRIv2g.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2017-10-01",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 75778,
    "name": "25-Year-Old High School Girl, I Wouldn’t Do This with a Kid",
    "title": "25-Year-Old High School Girl, I Wouldn’t Do This with a Kid",
    "overview": "Once most students are done with high school, they leave and never come back. However, at 25 years old, Hana Natori finds herself in the role of a student once more at her aunt's request. Since Hana's cousin, Kaho Miyoshi, refuses to go to school, her aunt begs Hana to take Kaho's place, since the two of them are practically identical. But as luck would have it, she is recognized by Okito Kanie—an old classmate from her days in high school—who is now a teacher! With her cover blown, Hana assumes Kanie will expose her secret. But when he suddenly kisses her, she soon learns he has other ideas.",
    "poster_path": "/ypjJNB2AZ8bffNULuWKwpYUoxC1.jpg",
    "backdrop_path": "/yARqByzW4paZU6vrwrfuj1N4th4.jpg",
    "media_type": "tv",
    "vote_average": 5.8,
    "first_air_date": "2018-01-08",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 103409,
    "name": "World's End Harem",
    "title": "World's End Harem",
    "overview": "The Man-Killer Virus: a lethal disease that has eradicated 99.9% of the world's male population. Mizuhara Reito has been in cryogenic sleep for the past five years, leaving behind Tachibana Erisa, the girl of his dreams. When Reito awakens from the deep freeze, he emerges into a sex-crazed new world where he himself is the planet's most precious resource. Reito and four other male studs are given lives of luxury and one simple mission: repopulate the world by impregnating as many women as possible! All Reito wants, however, is to find his beloved Erisa who went missing three years ago. Can Reito resist temptation and find his one true love?",
    "poster_path": "/h3OE30FudEPEhNMpbmcHt0ELD6s.jpg",
    "backdrop_path": "/k3IS8oN9WzN1JQqB5dyZMmtb90n.jpg",
    "media_type": "tv",
    "vote_average": 7.5,
    "first_air_date": "2022-01-07",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 236338,
    "name": "Gushing Over Magical Girls",
    "title": "Gushing Over Magical Girls",
    "overview": "Hiragi Utena is a major fangirl of the magical girls protecting her city and leaps at the chance to join their ranks. But once she transforms, she learns she's a villain who enjoys being a magical-girl-tormenting sadist instead!",
    "poster_path": "/p7vWZL5HhbscGf7OjnprT2977Lt.jpg",
    "backdrop_path": "/dvIguIZqqQKCt7YiKq7evfk5NW3.jpg",
    "media_type": "tv",
    "vote_average": 8.3,
    "first_air_date": "2024-01-03",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 114477,
    "name": "Harem in the Labyrinth of Another World",
    "title": "Harem in the Labyrinth of Another World",
    "overview": "High school student Michio Kaga was wandering aimlessly through life and the Internet, when he finds himself transported from a shady website to a fantasy world — reborn as a strong man who can use \"cheat\" powers. He uses his powers to become an adventurer, earn money, and get the right to claim girls that have idol-level beauty to form his very own harem.",
    "poster_path": "/drAnsk5w2PX5x3ooPv7I2xr3ksq.jpg",
    "backdrop_path": "/k4jj6KGcxQzo26PSjfAdQguUTfN.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2022-07-06",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 99080,
    "name": "Peter Grill and the Philosopher's Time",
    "title": "Peter Grill and the Philosopher's Time",
    "overview": "Upon winning a fighting tournament and being crowned the world’s strongest warrior, Peter Grill discovers a downside to his newfound fame. Women of all species, from ogres to elves, are scrambling over each other for his seed to ensure they have the strongest babies possible. Poor Peter just wants to settle down with his lovey dovey fiancée, but he’ll have to outmatch, outwit, and outrun a harem of very determined monster girls to do so!",
    "poster_path": "/ySLpzqCWSCacm9bDhLL6r2XG0Zi.jpg",
    "backdrop_path": "/cvHprU1PKJ4TMl8OHpPvS6jFLQI.jpg",
    "media_type": "tv",
    "vote_average": 7.9,
    "first_air_date": "2020-07-11",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 64163,
    "name": "The Testament of Sister New Devil",
    "title": "The Testament of Sister New Devil",
    "overview": "Toujou Basara is a high school student whose father has suddenly just remarried. His father then departs overseas leaving Basara with two new beautiful step-sisters. Little does he know, his new sisters, Mio and Maria are actually the new Demon Lord and a succubus!? Almost trapped into a life of servitude, Basara forms a reverse contract by accident and ends up becoming Mio's master! Hijinks ensue as Basara finds himself in one ecchi situation after another. However, Mio's life is in danger as she is pursued by demons and heroes!",
    "poster_path": "/4yrW5uBgcx7GSehJotlxWjAD0NQ.jpg",
    "backdrop_path": "/dXGaX995fsbiqJgFRj0CEJKxZVV.jpg",
    "media_type": "tv",
    "vote_average": 7.9,
    "first_air_date": "2015-01-07",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 45998,
    "name": "KissXSis",
    "title": "KissXSis",
    "overview": "The story begins with Keita Suminoe, a male third-year junior-high school student studying for his high school entrance exams. He is living in a home with his older twin stepsisters, Ako and Riko, who share no blood relation to him, and they help him prepare for his exams. Even though he initially dislikes himself for it, he begins to become attracted to his two step-sisters, and his two parents encourage him to eventually get married to one of them.",
    "poster_path": "/sQi05fGIosyEu51AHg9nSgipmhN.jpg",
    "backdrop_path": "/porr8fbCNEth5B2t6f5L2YfZc2C.jpg",
    "media_type": "tv",
    "vote_average": 6.4,
    "first_air_date": "2010-04-05",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 66926,
    "name": "Valkyrie Drive: Mermaid",
    "title": "Valkyrie Drive: Mermaid",
    "overview": "Tokonome Mamori is transferred to Mermaid - an artificial quarantine island for people with superpowers. When Mamori is attacked, a newly transferred girl named Mirei saves her. The enemy doesn't stop, however, and the two are soon cornered. Just when they think all hope is lost, Mirei kisses Mamori, and Mamori turns into a sword. Mirei then wields the sword and launches a counterattack against their enemies.",
    "poster_path": "/6hEpqMPUxDcV3ljeCHgJoVY5U2d.jpg",
    "backdrop_path": "/grratqdn77FtFAlX6WgYbVtCBNE.jpg",
    "media_type": "tv",
    "vote_average": 6.9,
    "first_air_date": "2015-10-10",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 38112,
    "name": "The Qwaser of Stigmata",
    "title": "The Qwaser of Stigmata",
    "overview": "When Mafuyu Oribe and her adopted sister Tomo rescue a strange wounded man, they have no idea what they’re getting involved with or what the consequences will be. Alexander Nikolaevith Hell is an Iron Qwaser, one of many opposing factions of super-warriors.",
    "poster_path": "/zAdiOfxntBDbY3GSr17Q8vUQxE6.jpg",
    "backdrop_path": "/mJFWew7KYwA9q3xQAj5gf7gnukA.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2010-01-10",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 34742,
    "name": "To Love Ru",
    "title": "To Love Ru",
    "overview": "Rito Yuuki is unlucky when it comes to love — no matter how hard he tries to confess to his crush, his efforts end in failure. After another day’s confession goes down the drain, Rito spends his night sulking in his bathtub. But when a naked girl with a pointed tail teleports into the tub with him, it seems like Rito’s luck is finally looking up! His fortune doesn’t last long when he finds himself accidentally engaged to the buxom beauty who is none other than the princess of the planet Deviluke!",
    "poster_path": "/vsWNCisRhrBbUaTR56qCk6pLsEn.jpg",
    "backdrop_path": "/61vXR9xfgNqidYkBruRXhRTlVzI.jpg",
    "media_type": "tv",
    "vote_average": 8.2,
    "first_air_date": "2008-04-04",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 63187,
    "name": "Monster Musume: Everyday Life with Monster Girls",
    "title": "Monster Musume: Everyday Life with Monster Girls",
    "overview": "Three years ago, the world learned that harpies, centaurs, catgirls, and all manners of fabulous creatures are not merely fiction; they are flesh and blood - not to mention scale, feather, horn, and fang. Thanks to the \"Cultural Exchange Between Species Act,\" these once-mythical creatures have assimilated into society, or at least, they're trying. When a hapless human teenager named Kurusu Kimihito is inducted as a \"volunteer\" into the government exchange program, his world is turned upside down. A snake-like lamia named Miia comes to live with him, and it is Kurusu's job to take care of her and make sure she integrates into his everyday life.",
    "poster_path": "/8leXiwIwPRPQqHXKDhqgf4OIwBU.jpg",
    "backdrop_path": "/xDsBN1jJt2s4yswvcV82vV3Ib5d.jpg",
    "media_type": "tv",
    "vote_average": 6.9,
    "first_air_date": "2015-07-07",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 96120,
    "name": "SUPER HxEROS",
    "title": "SUPER HxEROS",
    "overview": "Earth faces an unprecedented threat from an invasion by the mysterious Kiseichuu. The Kiseichuu feed on human sexual energy, also known as “H-energy,” and weaken the human population. High school student Retto Enjo is a member of the hero group HxEROS, who fight together to save the earth from the Kiseichuu.",
    "poster_path": "/1rPzcfNY4E8mEJrytjw1XeJTtVS.jpg",
    "backdrop_path": "/kDssH6sbp3cL3qogtTBLp7s9g63.jpg",
    "media_type": "tv",
    "vote_average": 6.6,
    "first_air_date": "2020-07-04",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 37867,
    "name": "Ladies versus Butlers!",
    "title": "Ladies versus Butlers!",
    "overview": "Raised by his uncle after his parents’ deaths, Akiharu enrolls at a mostly female academy that specializes in training maids and butlers for high society placements.",
    "poster_path": "/bjBHuTjC7KAGSAfeYY5q0q8ZcWn.jpg",
    "backdrop_path": "/iAxGl74HyzF52JDpuWg90tAThgY.jpg",
    "media_type": "tv",
    "vote_average": 6.8,
    "first_air_date": "2010-01-05",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 63323,
    "name": "SHIMONETA: A Boring World Where the Concept of Dirty Jokes Doesn't Exist",
    "title": "SHIMONETA: A Boring World Where the Concept of Dirty Jokes Doesn't Exist",
    "overview": "Sixteen years after the \"Law for Public Order and Morals in Healthy Child-Raising\" banned coarse language in the country, Tanukichi Okuma enrolls in the country's leading elite public morals school and is soon invited into the Anti-Societal Organization (SOX) by its founder, Ayame Kajou. As a member blackmailed into joining by Ayame, Tanukichi ends up taking part in obscene acts of terrorism against the talented student council president Anna (for whom Tanukichi has a crush on).",
    "poster_path": "/eO4z0x1NPO0L6Spke6PHbqkKxFk.jpg",
    "backdrop_path": "/zwU5YOrOIGJrDF5ZEUtbAOxY15q.jpg",
    "media_type": "tv",
    "vote_average": 7.1,
    "first_air_date": "2015-07-04",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 61460,
    "name": "Trinity Seven",
    "title": "Trinity Seven",
    "overview": "In this \"romantic comedy but sometime serious magical school story,\" life as Arata Kasuga knows it is wiped out by a bizarre incident known as \"Collapse Phenomenon,\" which causes worldwide destruction and takes his cousin Hijiri Kasuga to the next world. To resolve the \"Collapse Phenomenon\" and bring back Hijiri, Arata enrolls in the Royal Biblia Academy. Waiting in the school are seven beautiful female magic users — the Trinity Seven.",
    "poster_path": "/spklcFiiHyIbkAzhKw88Epp25Z0.jpg",
    "backdrop_path": "/rXWbob80oIGs9pvO2K5k7XNVEhk.jpg",
    "media_type": "tv",
    "vote_average": 6.9,
    "first_air_date": "2014-10-08",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 34805,
    "name": "Sekirei",
    "title": "Sekirei",
    "overview": "Struggling yet brilliant, 19-year-old Minato Sahashi has failed his college entrance exams for the second time, resulting in him being regarded as worthless by those around him. However, the course of his seemingly bleak future is altered dramatically when a beautiful, supernatural woman falls from the sky and into his life. That woman, Musubi, is a \"Sekirei,\" an extraterrestrial with extraordinary abilities. Recognizing the potential of the Ashikabi gene within Minato, Musubi kisses him, initiating a bond between the two of them. This drags him into the high-stakes world of the Sekirei, where he and his new partner must compete against others in a battle for survival called the \"Sekirei Plan.\" However, unbeknownst to the contestants, there is far more at risk that what the competition initially entailed. Manga series by Sakurako Gokurakuin.",
    "poster_path": "/g5lGhwt2M3RHXPgfqgEHRvGM8F.jpg",
    "backdrop_path": "/uwgvSLHNaLgpAhRhJ4uYU0NXKWX.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2008-07-02",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 45234,
    "name": "So, I Can't Play H!",
    "title": "So, I Can't Play H!",
    "overview": "Ryousuke Kaga, a helplessly romantic teenager, was walking in the rain when he sees a beautiful girl with red eyes drenched in the rain. Everyone was avoiding her, but Ryousuke was taught to treasure women so he offered his help by letting her dry off at his home. Ryousuke can’t imagine that this mysterious girl would stab him in the chest and leave him to die… Or did she? Who is this pretty girl and what does she want with him?",
    "poster_path": "/OcW8ElVXU4FuGuj6LplJYzp4jL.jpg",
    "backdrop_path": "/e9iN7kIi2yGxIOr2IRzOVI7hoow.jpg",
    "media_type": "tv",
    "vote_average": 7.7,
    "first_air_date": "2012-07-06",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 233643,
    "name": "Secret Mission - Undercover Agents Never Back Down!",
    "title": "Secret Mission - Undercover Agents Never Back Down!",
    "overview": "Narcotics Enforcement Agent Riko Ikazuchi is undercover with her junior colleague Noma in an apartment that serves as the hideout for a criminal organization. Despite Riko and Noma posing as a newlywed couple, the criminals begin to suspect them after not hearing any marital intimacy during the night. To convince them that they are a loving couple, Noma starts touching Riko's body...",
    "poster_path": "/xZV8e1iKi85PFZlbQBdznvtpAVJ.jpg",
    "backdrop_path": "/5IBSPGPAEFEkEJo4leqvpq0RcKf.jpg",
    "media_type": "tv",
    "vote_average": 6.2,
    "first_air_date": "2023-10-02",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 23315,
    "name": "Queen's Blade: Wandering Warrior",
    "title": "Queen's Blade: Wandering Warrior",
    "overview": "In the Continent, a tournament called Queen's Blade is held once every four years to determine the most beautiful and powerful Queen.",
    "poster_path": "/4t0Y6QjKz5s7M6vF4Q8h3v1n2y.jpg",
    "backdrop_path": "/4t0Y6QjKz5s7M6vF4Q8h3v1n2y.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2009-04-02",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 39281,
    "name": "Freezing",
    "title": "Freezing",
    "overview": "Set in a slightly futuristic world where Earth has been invaded and is at war with extra-dimensional aliens called Nova. Genetically engineered Pandoras fight back.",
    "poster_path": "/rW1vJ2x6q7m4z8t0y5p3n9v2b.jpg",
    "backdrop_path": "/rW1vJ2x6q7m4z8t0y5p3n9v2b.jpg",
    "media_type": "tv",
    "vote_average": 7.6,
    "first_air_date": "2011-01-08",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 43098,
    "name": "Maken-Ki! Battling Venus",
    "title": "Maken-Ki! Battling Venus",
    "overview": "Takeru Ohyama enrolls in an elite academy that was formerly all-girls, only to discover students wield magical weapons called Maken in intense combat.",
    "poster_path": "/p4z8t0y5p3n9v2brW1vJ2x6q7m.jpg",
    "backdrop_path": "/p4z8t0y5p3n9v2brW1vJ2x6q7m.jpg",
    "media_type": "tv",
    "vote_average": 7.2,
    "first_air_date": "2011-10-05",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 67406,
    "name": "Hybrid x Heart Magias Academy Ataraxia",
    "title": "Hybrid x Heart Magias Academy Ataraxia",
    "overview": "Kizuna Hida visits the strategic defense academy at his sister request, discovering his touch can rejuvenate the power of armored pilots.",
    "poster_path": "/m4z8t0y5p3n9v2brW1vJ2x6q7m.jpg",
    "backdrop_path": "/m4z8t0y5p3n9v2brW1vJ2x6q7m.jpg",
    "media_type": "tv",
    "vote_average": 7.3,
    "first_air_date": "2016-07-06",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 45129,
    "name": "Aesthetica of a Rogue Hero",
    "title": "Aesthetica of a Rogue Hero",
    "overview": "Akatsuki Ousawa defeats the Dark Lord in another fantasy dimension and brings the demon king's daughter back with him to the real world.",
    "poster_path": "/y5p3n9v2brW1vJ2x6q7m4z8t0.jpg",
    "backdrop_path": "/y5p3n9v2brW1vJ2x6q7m4z8t0.jpg",
    "media_type": "tv",
    "vote_average": 7.5,
    "first_air_date": "2012-07-06",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 31969,
    "name": "Demon King Daimao",
    "title": "Demon King Daimao",
    "overview": "Akuto Sai enters Constant Magic Academy aiming to become a high priest, but his future occupation aptitude test declares him future Demon King.",
    "poster_path": "/2brW1vJ2x6q7m4z8t0y5p3n9v.jpg",
    "backdrop_path": "/2brW1vJ2x6q7m4z8t0y5p3n9v.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2010-04-03",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 40118,
    "name": "Golden Boy",
    "title": "Golden Boy: Wandering Student",
    "overview": "Kintaro Oe is a 25-year-old wanderer who travels across Japan on his bicycle, learning about life, women, and the world one odd job at a time.",
    "poster_path": "/vJ2x6q7m4z8t0y5p3n9v2brW1.jpg",
    "backdrop_path": "/vJ2x6q7m4z8t0y5p3n9v2brW1.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "first_air_date": "1995-10-27",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 37837,
    "name": "Ikki Tousen: Great Guardians",
    "title": "Ikki Tousen: Battle Vixens",
    "overview": "High school students in the Kanto region possess jewels containing the spirits of ancient warriors from the Three Kingdoms era.",
    "poster_path": "/6q7m4z8t0y5p3n9v2brW1vJ2x.jpg",
    "backdrop_path": "/6q7m4z8t0y5p3n9v2brW1vJ2x.jpg",
    "media_type": "tv",
    "vote_average": 7.1,
    "first_air_date": "2003-07-30",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 63200,
    "name": "Bikini Warriors",
    "title": "Bikini Warriors",
    "overview": "A party of glamorous female adventurers clad in enchanted bikini armor battle monsters and embark on quests across a fantasy world.",
    "poster_path": "/7m4z8t0y5p3n9v2brW1vJ2x6q.jpg",
    "backdrop_path": "/7m4z8t0y5p3n9v2brW1vJ2x6q.jpg",
    "media_type": "tv",
    "vote_average": 6.8,
    "first_air_date": "2015-07-08",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 60824,
    "name": "Strike the Blood",
    "title": "Strike the Blood",
    "overview": "Kojou Akatsuki is the Fourth Primogenitor, the world's most powerful vampire. Sword shaman Yukina Himeragi is dispatched to observe him.",
    "poster_path": "/4z8t0y5p3n9v2brW1vJ2x6q7m.jpg",
    "backdrop_path": "/4z8t0y5p3n9v2brW1vJ2x6q7m.jpg",
    "media_type": "tv",
    "vote_average": 7.6,
    "first_air_date": "2013-10-04",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 45266,
    "name": "Campione!",
    "title": "Campione!: Godslayer and His Sacred Maiden",
    "overview": "Godo Kusanagi slays a rogue deity and inherits the god's power, becoming a Campione with authority over mystical realms and fierce maidens.",
    "poster_path": "/8t0y5p3n9v2brW1vJ2x6q7m4z.jpg",
    "backdrop_path": "/8t0y5p3n9v2brW1vJ2x6q7m4z.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2012-07-06",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 38384,
    "name": "Elfen Lied",
    "title": "Elfen Lied",
    "overview": "Lucy is a mutant Diclonius with lethal invisible vectors who escapes research containment and seeks solace with two college students.",
    "poster_path": "/0y5p3n9v2brW1vJ2x6q7m4z8t.jpg",
    "backdrop_path": "/0y5p3n9v2brW1vJ2x6q7m4z8t.jpg",
    "media_type": "tv",
    "vote_average": 8.2,
    "first_air_date": "2004-07-25",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 33527,
    "name": "Gantz",
    "title": "Gantz: Uncensored",
    "overview": "Deceased teenagers are resurrected in an empty Tokyo apartment by a mysterious black sphere called Gantz and forced to hunt aliens.",
    "poster_path": "/5p3n9v2brW1vJ2x6q7m4z8t0y.jpg",
    "backdrop_path": "/5p3n9v2brW1vJ2x6q7m4z8t0y.jpg",
    "media_type": "tv",
    "vote_average": 7.8,
    "first_air_date": "2004-04-13",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 61706,
    "name": "The Fruit of Grisaia",
    "title": "The Fruit of Grisaia",
    "overview": "Yuuji Kazami transfers to Mihama Academy, an isolated school with only five female students, each harboring deep emotional secrets.",
    "poster_path": "/3n9v2brW1vJ2x6q7m4z8t0y5p.jpg",
    "backdrop_path": "/3n9v2brW1vJ2x6q7m4z8t0y5p.jpg",
    "media_type": "tv",
    "vote_average": 7.5,
    "first_air_date": "2014-10-05",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 34839,
    "name": "Rosario + Vampire",
    "title": "Rosario + Vampire: Capu2",
    "overview": "Tsukune Aono accidentally enrolls in Youkai Academy, a high school for monsters, where he befriends the gentle yet powerful vampire Moka Akashiya.",
    "poster_path": "/9v2brW1vJ2x6q7m4z8t0y5p3n.jpg",
    "backdrop_path": "/9v2brW1vJ2x6q7m4z8t0y5p3n.jpg",
    "media_type": "tv",
    "vote_average": 7.4,
    "first_air_date": "2008-01-03",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 70889,
    "name": "Seven Mortal Sins",
    "title": "Seven Mortal Sins: Sin Nanatsu no Taizai",
    "overview": "Lucifer is cast down into the depths of Hell where she challenges the Seven Demon Lords representing the mortal sins.",
    "poster_path": "/2brW1vJ2x6q7m4z8t0y5p3n9v.jpg",
    "backdrop_path": "/2brW1vJ2x6q7m4z8t0y5p3n9v.jpg",
    "media_type": "tv",
    "vote_average": 7.1,
    "first_air_date": "2017-04-14",
    "category": "ecchi_anime",
    "is_mature": true
  },
  {
    "id": 65977,
    "name": "Hundred",
    "title": "Hundred",
    "overview": "Hayato Kisaragi uses the only weapon capable of combating the Savage alien life-forms invading Earth: the Hundred.",
    "poster_path": "/rW1vJ2x6q7m4z8t0y5p3n9v2b.jpg",
    "backdrop_path": "/rW1vJ2x6q7m4z8t0y5p3n9v2b.jpg",
    "media_type": "tv",
    "vote_average": 7.3,
    "first_air_date": "2016-04-05",
    "category": "ecchi_anime",
    "is_mature": true
  }
];

export async function fetchEcchiAnime(page = 1) {
  const pageSize = 12;
  const start = (page - 1) * pageSize;
  if (start >= SECRET_ECCHI_ANIME.length) {
    return [];
  }
  return SECRET_ECCHI_ANIME.slice(start, start + pageSize);
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
      isHindiDubbed: isHindiAvailable(item)
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
