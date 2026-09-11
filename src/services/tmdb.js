// TMDB Service with live auto-updating & offline curated blockbusters

const API_KEY = '4e44d9029b1270a757cddc766a1bcb63';

const BASE_URL = 'https://api.themoviedb.org/3';

export const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export const POSTER_THUMB_BASE = 'https://image.tmdb.org/t/p/w342';

export const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';



const today = new Date().toISOString().split('T')[0];

// High-speed in-memory LRU API cache and concurrent request deduplication
const apiCache = new Map();
const inFlightRequests = new Map();

export async function cachedFetchJson(url, ttlMs = 300000) {
  const now = Date.now();
  if (apiCache.has(url)) {
    const entry = apiCache.get(url);
    if (now - entry.timestamp < ttlMs) {
      return entry.data;
    }
    apiCache.delete(url);
  }
  if (inFlightRequests.has(url)) {
    return await inFlightRequests.get(url);
  }

  const promise = (async () => {
    try {
      const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (apiCache.size > 150) {
        const firstKey = apiCache.keys().next().value;
        apiCache.delete(firstKey);
      }
      apiCache.set(url, { timestamp: Date.now(), data });
      return data;
    } finally {
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, promise);
  return await promise;
}



// Robust deduplication using provider IDs first, then normalized title + media_type + release year
export function deduplicateMedia(items) {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set();
  const seenCompositeKeys = new Set();

  return items.filter((item) => {
    if (!item || typeof item !== 'object' || !item.id) return false;
    const idKey = String(item.id);
    if (seenIds.has(idKey)) return false;

    const rawTitle = (item.title || item.name || item.original_title || item.original_name || '').trim().toLowerCase();
    const cleanTitle = rawTitle
      .replace(/\s*\(hindi\s*dubbed\)/i, '')
      .replace(/\s*\(english\s*dubbed\)/i, '')
      .replace(/\s*\(uncut\)/i, '')
      .replace(/\s*\(uncensored\)/i, '')
      .replace(/[^a-z0-9]/g, '');

    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const year = String(item.release_date || item.first_air_date || '').substring(0, 4);
    const compositeKey = cleanTitle ? `${cleanTitle}__${mediaType}__${year}` : '';

    if (!item.isCustom && compositeKey) {
      if (seenCompositeKeys.has(compositeKey)) return false;
      seenCompositeKeys.add(compositeKey);
    }

    seenIds.add(idKey);
    return true;
  });
}



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

    poster_path: '/dA4N6uWOnEMgbxXwFX7qX7adzs8.jpg',

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

    poster_path: '/m2zXTuNPkywdYLyWlVyJZW2QOJH.jpg',

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

    poster_path: '/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg',

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

    poster_path: '/mQmsmWOSIe5J5iwEQr7EQmiba3X.jpg',

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

    poster_path: '/8fYluTtB3b3HKO7KQa5tzrvGaps.jpg',

    backdrop_path: '/u9xW1x9L8K2mN1b3v6pL8kQJ.jpg',

    media_type: 'movie',

    vote_average: 7.3,

    release_date: '2024-06-27',

    category: 'hindi'

  }

];



export async function fetchTrendingAll(page = 1) {
  try {
    const data = await cachedFetchJson(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${page}`);
    if (!data.results || data.results.length === 0) return page === 1 ? FALLBACK_MEDIA : [];

    const filtered = data.results.filter(item => {
      if (!item || typeof item !== 'object' || !item.id) return false;
      if (item.media_type === 'person') return false;
      if (item.media_type === 'movie' && item.release_date && item.release_date > today) return false;
      return true;
    });

    return filtered.length > 0 ? filtered : (page === 1 ? FALLBACK_MEDIA : []);
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA : [];
  }
}



export const CURATED_HOLLYWOOD_BLOCKBUSTERS = [

  {

    id: 533535,

    title: 'Deadpool & Wolverine',

    name: 'Deadpool & Wolverine',

    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',

    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',

    backdrop_path: '/yDHYTjA3R0neXjgu144Y1fX3AcA.jpg',

    media_type: 'movie',

    vote_average: 7.7,

    release_date: '2024-07-24',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 634649,

    title: 'Spider-Man: No Way Home',

    name: 'Spider-Man: No Way Home',

    overview: 'Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous.',

    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',

    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',

    media_type: 'movie',

    vote_average: 8.0,

    release_date: '2021-12-15',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 299534,

    title: 'Avengers: Endgame',

    name: 'Avengers: Endgame',

    overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',

    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',

    backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',

    media_type: 'movie',

    vote_average: 8.3,

    release_date: '2019-04-24',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 299536,

    title: 'Avengers: Infinity War',

    name: 'Avengers: Infinity War',

    overview: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.',

    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',

    backdrop_path: '/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg',

    media_type: 'movie',

    vote_average: 8.2,

    release_date: '2018-04-25',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 157336,

    title: 'Interstellar',

    name: 'Interstellar',

    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',

    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',

    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',

    media_type: 'movie',

    vote_average: 8.4,

    release_date: '2014-11-05',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 693134,

    title: 'Dune: Part Two',

    name: 'Dune: Part Two',

    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',

    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',

    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg',

    media_type: 'movie',

    vote_average: 8.2,

    release_date: '2024-02-27',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 872585,

    title: 'Oppenheimer',

    name: 'Oppenheimer',

    overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',

    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',

    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',

    media_type: 'movie',

    vote_average: 8.1,

    release_date: '2023-07-19',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 155,

    title: 'The Dark Knight',

    name: 'The Dark Knight',

    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',

    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',

    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',

    media_type: 'movie',

    vote_average: 8.5,

    release_date: '2008-07-16',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 27205,

    title: 'Inception',

    name: 'Inception',

    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered chances to regain his old life as payment for a task considered to be impossible: "inception".',

    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',

    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',

    media_type: 'movie',

    vote_average: 8.4,

    release_date: '2010-07-15',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 76600,

    title: 'Avatar: The Way of Water',

    name: 'Avatar: The Way of Water',

    overview: 'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.',

    poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',

    backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',

    media_type: 'movie',

    vote_average: 7.6,

    release_date: '2022-12-14',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 361743,

    title: 'Top Gun: Maverick',

    name: 'Top Gun: Maverick',

    overview: 'After more than thirty years of service as one of the Navy\'s top aviators, and dodging the advancement in rank that would ground him, Pete "Maverick" Mitchell finds himself training a detachment of TOP GUN graduates for a specialized mission.',

    poster_path: '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',

    backdrop_path: '/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg',

    media_type: 'movie',

    vote_average: 8.2,

    release_date: '2022-05-24',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 603692,

    title: 'John Wick: Chapter 4',

    name: 'John Wick: Chapter 4',

    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.',

    poster_path: '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',

    backdrop_path: '/h8gHn0OzBoaefW0w19GeSmwh2if.jpg',

    media_type: 'movie',

    vote_average: 7.7,

    release_date: '2023-03-22',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 1022789,

    title: 'Inside Out 2',

    name: 'Inside Out 2',

    overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!',

    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',

    backdrop_path: '/stKGOm8zToLQI0ALFL6LDJuTYk5.jpg',

    media_type: 'movie',

    vote_average: 7.6,

    release_date: '2024-06-11',

    category: 'hollywood',

    isHindiDubbed: false

  },

  {

    id: 414906,

    title: 'The Batman',

    name: 'The Batman',

    overview: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',

    poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',

    backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaxtQvQ.jpg',

    media_type: 'movie',

    vote_average: 7.7,

    release_date: '2022-03-01',

    category: 'hollywood',

    isHindiDubbed: false

  }

];



export async function fetchHollywoodMovies(page = 1) {

  try {

    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), 7000);



    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=en&primary_release_date.lte=${today}&vote_count.gte=100&sort_by=popularity.desc&page=${page}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);



    const data = await res.json();

    const discovered = (data.results || [])

      .filter((m) => m && m.id && m.poster_path && (m.title || m.name))

      .map((m) => ({

        ...m,

        media_type: 'movie',

        category: 'hollywood',

        isHindiDubbed: isHindiAvailable(m)

      }));



    if (page === 1) {

      const merged = deduplicateMedia([...CURATED_HOLLYWOOD_BLOCKBUSTERS, ...discovered]);

      return merged.length > 0 ? merged : CURATED_HOLLYWOOD_BLOCKBUSTERS;

    }



    return deduplicateMedia(discovered);

  } catch (err) {

    return page === 1 ? CURATED_HOLLYWOOD_BLOCKBUSTERS : [];

  }

}





export const CURATED_BOLLYWOOD_BLOCKBUSTERS = [

  {

    "id": 20453,

    "title": "3 Idiots",

    "name": "3 Idiots",

    "overview": "Rascal. Joker. Dreamer. Genius... You've never met a college student quite like \"Rancho.\" From the moment he arrives at India's most prestigious university, Rancho's outlandish schemes turn the campus upside down—along with the lives of his two newfound best friends. Together, they make life miserable for \"Virus,\" the school’s uptight and heartless dean. But when Rancho catches the eye of the dean's daughter, Virus sets his sights on flunking out the \"3 idiots\" once and for all.",

    "poster_path": "/66A9MqXOyVFCssoloscw79z8Tew.jpg",

    "backdrop_path": "/8gT3UKtglLVpu0YfccwbmXZ5Eis.jpg",

    "media_type": "movie",

    "vote_average": 8.0,

    "release_date": "2009-12-23",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 360814,

    "title": "Dangal",

    "name": "Dangal",

    "overview": "Dangal is an extraordinary true story based on the life of Mahavir Singh and his two daughters, Geeta and Babita Phogat. The film traces the inspirational journey of a father who trains his daughters to become world class wrestlers.",

    "poster_path": "/cJRPOLEexI7qp2DKtFfCh7YaaUG.jpg",

    "backdrop_path": "/l0fNAHLOFReQJsxCOmGWvJDnimn.jpg",

    "media_type": "movie",

    "vote_average": 7.9,

    "release_date": "2016-12-21",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 1112426,

    "title": "Stree 2",

    "name": "Stree 2",

    "overview": "Following the events of 'Stree', the town of Chanderi is being haunted again. This time, women are mysteriously abducted by a terrifying headless entity. Once again, it's up to Vicky and friends to save their town and loved ones.",

    "poster_path": "/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg",

    "backdrop_path": "/fVV0A67kDjTTQ4CvUn8LoletRmI.jpg",

    "media_type": "movie",

    "vote_average": 6.7,

    "release_date": "2024-08-15",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 872906,

    "title": "Jawan",

    "name": "Jawan",

    "overview": "An emotional journey of a prison warden, driven by a personal vendetta while keeping up to a promise made years ago, recruits inmates to commit outrageous crimes that shed light on corruption and injustice, in an attempt to get even with his past,  and that leads him to an unexpected reunion.",

    "poster_path": "/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",

    "backdrop_path": "/5LtSjMNw6j3LkG29Oa4O0iY5U8.jpg",

    "media_type": "movie",

    "vote_average": 7.0,

    "release_date": "2023-09-07",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 864692,

    "title": "Pathaan",

    "name": "Pathaan",

    "overview": "A soldier caught by enemies and presumed dead comes back to complete his mission, accompanied by old companions and foes.",

    "poster_path": "/arf00BkwvXo0CFKbaD9OpqdE4Nu.jpg",

    "backdrop_path": "/9wRAIQeOv2qzcgpfvA4dYZKeezl.jpg",

    "media_type": "movie",

    "vote_average": 6.4,

    "release_date": "2023-01-25",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 801688,

    "title": "Kalki 2898-AD",

    "name": "Kalki 2898-AD",

    "overview": "In the year 2898 AD, around 6000 years after Kurukshetra war, Ashwatthama gears up for his final battle of redemption at the sign of hope in a dystopian world and Bhairava, a wisecracking and self-interested bounty hunter, tired of the perilous life becomes the hurdle in the process.",

    "poster_path": "/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",

    "backdrop_path": "/o8XSR1SONnjcsv84NRu6Mwsl5io.jpg",

    "media_type": "movie",

    "vote_average": 6.4,

    "release_date": "2024-06-26",

    "first_air_date": "",

    "original_language": "te",

    "category": "hindi"

  },

  {

    "id": 12259,

    "title": "Sholay",

    "name": "Sholay",

    "overview": "After his family is slain by notorious bandit Gabbar Singh, former Inspector Thakur Baldev Singh enlists low-level outlaws Jai and Veeru to capture Gabbar and seek revenge.",

    "poster_path": "/ya9bwgqA4eNl5bQ9QqS0jcmRoBS.jpg",

    "backdrop_path": "/8aYAfAPolsRFrHbP1rafeSgg2Ew.jpg",

    "media_type": "movie",

    "vote_average": 7.1,

    "release_date": "1975-08-15",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 1029827,

    "title": "Drishyam 2",

    "name": "Drishyam 2",

    "overview": "7 years after the case related to Vijay Salgaonkar and his family was closed, a series of unexpected events bring truth to light that threatens to change everything for the Salgaonkars. Can Vijay save his family this time?",

    "poster_path": "/wk8Vu0DI0MiNLaXXiVqAwjLRKL5.jpg",

    "backdrop_path": "/498aYGlnvjvoiqXYhCNHrZERi4l.jpg",

    "media_type": "movie",

    "vote_average": 8.0,

    "release_date": "2022-11-18",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 348892,

    "title": "Bajrangi Bhaijaan",

    "name": "Bajrangi Bhaijaan",

    "overview": "A young mute girl from Pakistan loses herself in India with no way to head back. A devoted man with a magnanimous spirit undertakes the task to get her back to her motherland and unite her with her family.",

    "poster_path": "/vhlliI7HZZlWfo5d6CiyfBAGLrW.jpg",

    "backdrop_path": "/n9QCm8uagvmXH476u5qFQsW8HkU.jpg",

    "media_type": "movie",

    "vote_average": 7.8,

    "release_date": "2015-07-17",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 297222,

    "title": "PK",

    "name": "PK",

    "overview": "A stranger in the city asks questions no one has asked before. Known only by his initials, the man's innocent questions and childlike curiosity take him on a journey of love, laughter and letting go.",

    "poster_path": "/z2x2Y4tncefsIU7h82gmUM5vnBJ.jpg",

    "backdrop_path": "/gxfvtq5eYiClS2X7hxAAPBNrbWA.jpg",

    "media_type": "movie",

    "vote_average": 7.7,

    "release_date": "2014-12-18",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 596650,

    "title": "Chhichhore",

    "name": "Chhichhore",

    "overview": "Following a group of friends from university as they progress into middle-age life and go their own separate ways.",

    "poster_path": "/cGDPQtQ5igtPMt3oJ6BCAor6dFp.jpg",

    "backdrop_path": "/32RgjX5oniUvL9UpU8TiYlmaydC.jpg",

    "media_type": "movie",

    "vote_average": 7.7,

    "release_date": "2019-09-05",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 538858,

    "title": "Tumbbad",

    "name": "Tumbbad",

    "overview": "India, 1918. On the outskirts of Tumbbad, a cursed village where it always rains, Vinayak, along with his mother and his brother, care of a mysterious old woman who keeps the secret of an ancestral treasure that Vinayak gets obsessed with.",

    "poster_path": "/vzjZAKozbDplHWcQXbXo0APKxst.jpg",

    "backdrop_path": "/l0YKBu3LaehIFzBNjseLjx7MbaN.jpg",

    "media_type": "movie",

    "vote_average": 7.6,

    "release_date": "2018-10-12",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 117691,

    "title": "Gangs of Wasseypur - Part 1",

    "name": "Gangs of Wasseypur - Part 1",

    "overview": "In 1970s India, Sardar Khan vows to take revenge on the man who killed his father decades earlier.",

    "poster_path": "/4nbvLoPDftqXV14w5Mv14iqgVrt.jpg",

    "backdrop_path": "/eByyqLrrdYySwYjus5RVCgbCNOD.jpg",

    "media_type": "movie",

    "vote_average": 7.1,

    "release_date": "2012-06-22",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 1233531,

    "title": "Article 370",

    "name": "Article 370",

    "overview": "Ahead of a major constitutional decision which rendered the Article 370 of the Indian state ineffective, special agent Zooni Haksar is tasked with a secret mission to quell violence in the conflict-ridden region.",

    "poster_path": "/9VTemjHMpyxzfC3JsG2aFy8Bf9Y.jpg",

    "backdrop_path": "/qYXnMDuwaApMRtV8JunFmieZo8R.jpg",

    "media_type": "movie",

    "vote_average": 7.1,

    "release_date": "2024-02-23",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 781732,

    "title": "Animal",

    "name": "Animal",

    "overview": "A son undergoes a remarkable transformation as the bond with his father begins to fracture, and he becomes consumed by a quest for vengeance.",

    "poster_path": "/hr9rjR3J0xBBKmlJ4n3gHId9ccx.jpg",

    "backdrop_path": "/2meovGzM9K0nS6zU9yJtU6q9p9G.jpg",

    "media_type": "movie",

    "vote_average": 6.8,

    "release_date": "2023-12-01",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  },

  {

    "id": 496331,

    "title": "Brahmāstra: Part One – Shiva",

    "name": "Brahmāstra: Part One – Shiva",

    "overview": "Shiva discovers he has a divine connection to the element of fire and holds the power to awaken the Brahmāstra, a supernatural weapon of enormous power.",

    "poster_path": "/x61qdvHIsr9U53FwoLVDQqAGur0.jpg",

    "backdrop_path": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",

    "media_type": "movie",

    "vote_average": 6.6,

    "release_date": "2022-09-09",

    "first_air_date": "",

    "original_language": "hi",

    "category": "hindi"

  }

];



export const CURATED_HINDI_DUBBED_ANIME = [
  {
    id: 46260,
    title: 'Naruto',
    name: 'Naruto',
    overview: 'Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village\'s leader and strongest ninja.',
    poster_path: '/xppeysfvDKVx775MFuH8Z9BlpMk.jpg',
    backdrop_path: '/5F0HVEgkgP99fEWDjPyikGt9jQi.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2002-10-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 31910,
    title: 'Naruto: Shippuden',
    name: 'Naruto Shippūden',
    overview: 'After 2 and a half years Naruto finally returns to his village of Konoha, and sets about putting his ambitions to work. It will not be easy though as he has amassed a few more dangerous enemies, in the likes of the shinobi organization; Akatsuki.',
    poster_path: '/kV27j3Nz4d5z8u6mN3EJw9RiLg2.jpg',
    backdrop_path: '/z0YhJvomqedHF85bplUJEotkN5l.jpg',
    media_type: 'tv',
    vote_average: 8.5,
    first_air_date: '2007-02-15',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 12971,
    title: 'Dragon Ball Z',
    name: 'Dragon Ball Z',
    overview: 'Now happily married and with a son, martial arts champion Goku must defend Earth from a series of extraterrestrial invaders bent on destruction.',
    poster_path: '/oQ5CnVj3TRifXl2bIOri6H6rfNe.jpg',
    backdrop_path: '/ydf1CeiBLfdxiyNTpskM0802TKl.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '1989-04-26',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 62715,
    title: 'Dragon Ball Super',
    name: 'Dragon Ball Super',
    overview: 'With Majin Buu defeated, Goku has taken a completely new role as...a radish farmer?! With Earth at peace, our heroes have settled into normal lives. But they can’t get too comfortable. Far away, the powerful God of Destruction, Beerus, awakens to a prophecy revealing his demise at the hands of an even more formidable being. When his search for the Saiyan God brings him to Earth, can Goku and his friends take on their strongest foe yet?',
    poster_path: '/qEUrbXJ2qt4Rg84Btlx4STOhgte.jpg',
    backdrop_path: '/qA2UwUQbj05aeBMCuC0mHSQ4loE.jpg',
    media_type: 'tv',
    vote_average: 8.2,
    first_air_date: '2015-07-05',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 65733,
    title: 'Doraemon',
    name: 'Doraemon',
    overview: 'Robotic cat Doraemon is sent back in time from the 22nd century to protect 10-year-old Noby, a lazy and uncoordinated boy who is destined to have a tragic future. Doraemon can create secret gadgets from a pocket on his stomach, but they usually cause more bad than good because of Noby\'s propensity to misuse them.',
    poster_path: '/9ZN1P32SHviL3SV51qLivxycvcx.jpg',
    backdrop_path: '/c2oiRa7V3bQzof4wVGzLXtWJ5QU.jpg',
    media_type: 'tv',
    vote_average: 8.1,
    first_air_date: '2005-04-22',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 298321,
    title: 'Crayon Shin-chan',
    name: 'Crayon Shin-chan: Everland',
    overview: 'A special horror-themed collection of Shinchan episodes featuring spooky adventures and supernatural encounters.',
    poster_path: '/qqH1gEo9mETtP9W9ZOmWuSGQxM6.jpg',
    backdrop_path: '/29Zod8xlYJtn90CQe7LTeLlJIod.jpg',
    media_type: 'tv',
    vote_average: 9.0,
    first_air_date: '2025-08-14',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 60572,
    title: 'Pokémon',
    name: 'Pokémon',
    overview: 'Join Ash accompanied by his partner Pikachu, as he travels through many regions, meets new friends and faces new challenges on his quest to become a Pokémon Master.',
    poster_path: '/lP4zwr0F7hWTbAFltfoFTc2AxRG.jpg',
    backdrop_path: '/yYpQV25I7XB6S0POJOScPjxYWV5.jpg',
    media_type: 'tv',
    vote_average: 8.0,
    first_air_date: '1997-04-01',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 80885,
    title: 'Ninja Hattori-kun',
    name: 'Ninja Hattori-kun',
    overview: '11-year-old Kenichi Mitsuba is an average kid who goes to secondary school and struggles with his studies, he is very stubborn and is very lazy and therefore always ends up frustrating his parents and teacher. He loves to find an easy way of things. He befriends Hattori Kanzo, a ninja from the Iga Clan, and he becomes part of the Mitsuba family along with his brother, Shinzo and his ninja dog, Shishimaru. Hattori helps Kenichi with his problems, and constantly keeps an eye on him, as a good friend. The main antagonist Kemumaki, a Koga ninja and his ninja cat, Kagechiyo always troubles Kenichi, mainly because of their feud over one girl, Yumeko. Kenichi asks Hattori to take revenge as a recurring storyline in many episodes. Although Hattori is a good friend, Kenichi sometimes fights with Hattori due to misunderstandings created by Kemumaki. Sometimes Jippou, Togejirou and Tsubame help him.',
    poster_path: '/9PUkpvq0wJnJ2M00dtgxKn6LptB.jpg',
    backdrop_path: '/tJF9M5niAnb4fm881PGc2GwS0e1.jpg',
    media_type: 'tv',
    vote_average: 6.4,
    first_air_date: '1981-09-28',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 226688,
    title: 'Beyblade',
    name: 'Beyblade X',
    overview: 'Beginner blader Robin Kazami joins up with influencer Multi Nana-iro and former champion Jaxon Cross to form this unlikely trio - ready to climb to the top of The X and win the title of champion blader!',
    poster_path: '/66wkm14IWdrY5LaKZDAbkD2T9Jt.jpg',
    backdrop_path: '/qAq9RBeHZoTMDFqQZ2o4cE5CJIQ.jpg',
    media_type: 'tv',
    vote_average: 7.1,
    first_air_date: '2023-10-06',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 95479,
    title: 'Jujutsu Kaisen',
    name: 'JUJUTSU KAISEN',
    overview: 'Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul. From then on, he shares one body with Ryomen Sukuna. Guided by the most powerful of sorcerers, Satoru Gojo, Itadori is admitted to Tokyo Jujutsu High School, an organization that fights the curses... and thus begins the heroic tale of a boy who became a curse to exorcise a curse, a life from which he could never turn back.',
    poster_path: '/6qQzMJG27XOJsyAEEIisoJB45j2.jpg',
    backdrop_path: '/qpin8cASXEVtwhzNsprHYFiOAGk.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2020-10-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 85937,
    title: 'Demon Slayer: Kimetsu no Yaiba',
    name: 'Demon Slayer: Kimetsu no Yaiba',
    overview: 'After a demon attack leaves his family slain and his sister cursed, Tanjiro embarks upon a perilous journey to find a cure and avenge those he\'s lost.',
    poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    backdrop_path: '/3GQKYh6Trm8pxd2AypovoYQf4Ay.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2019-04-06',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 30984,
    title: 'Bleach',
    name: 'Bleach',
    overview: 'For as long as he can remember, Ichigo Kurosaki has been able to see ghosts. But when he meets Rukia, a Soul Reaper who battles evil spirits known as Hollows, he finds his life is changed forever. Now, with a newfound wealth of spiritual energy, Ichigo discovers his true calling: to protect the living and the dead from evil.',
    poster_path: '/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg',
    backdrop_path: '/o0NsbcIvsllg6CJX0FBFY8wWbsn.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2004-10-05',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 37854,
    title: 'One Piece',
    name: 'One Piece',
    overview: 'Years ago, the fearsome Pirate King, Gol D. Roger was executed leaving a huge pile of treasure and the famous "One Piece" behind. Whoever claims the "One Piece" will be named the new King of the Pirates.  Monkey D. Luffy, a boy who consumed a "Devil Fruit," decides to follow in the footsteps of his idol, the pirate Shanks, and find the One Piece. It helps, of course, that his body has the properties of rubber and that he\'s surrounded by a bevy of skilled fighters and thieves to help him along the way.  Luffy will do anything to get the One Piece and become King of the Pirates!',
    poster_path: '/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg',
    backdrop_path: '/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '1999-10-20',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 13916,
    title: 'Death Note',
    name: 'Death Note',
    overview: 'Light Yagami is an ace student with great prospects—and he’s bored out of his mind. But all that changes when he finds the Death Note, a notebook dropped by a rogue Shinigami death god. Any human whose name is written in the notebook dies, and Light has vowed to use the power of the Death Note to rid the world of evil. But will Light succeed in his noble goal, or will the Death Note turn him into the very thing he fights against?',
    poster_path: '/tCZFfYTIwrR7n94J6G14Y4hAFU6.jpg',
    backdrop_path: '/z8IPicmEKXUO4I2UDdMEqw7RqOE.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2006-10-04',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 1429,
    title: 'Attack on Titan',
    name: 'Attack on Titan',
    overview: '100 years ago, the last remnants of humanity were forced to retreat behind the towering walls of a fortified city to escape the massive, man-eating Titans that roamed the land outside their fortress. Only the members of the Scouting Legion dared to stray beyond the safety of the walls – but even those brave warriors seldom returned alive. Those within the city clung to the illusion of a peaceful existence until the day that dream was shattered, and their slim chance at survival was reduced to one horrifying choice: kill – or be devoured!',
    poster_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdrop_path: '/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2013-04-07',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 45952,
    title: 'Hunter x Hunter',
    name: 'Hunter x Hunter',
    overview: 'Gon Freecss discovers that the father he had always been told was dead was actually alive the whole time. Ging is a famous Hunter: an individual who has proven themself an elite member of humanity. Gon becomes determined to follow in his father\'s footsteps, pass the rigorous Hunter Examination.',
    poster_path: '/eobAuhCJA8oRp814V67WhezVXtQ.jpg',
    backdrop_path: '/575sxZXNNulSlIz7DvtWH5r4lkC.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '1999-10-16',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 31911,
    title: 'Fullmetal Alchemist: Brotherhood',
    name: 'Fullmetal Alchemist: Brotherhood',
    overview: 'Disregard for alchemy’s laws ripped half of Edward Elric’s limbs from his body and left his brother Alphonse’s soul clinging to a suit of armor. To restore what was lost, the brothers seek the Philosopher’s Stone. Enemies and allies – the corrupt military, the Homunculi, and foreign alchemists – will alter the Elric brothers course, but their purpose will remain unchanged and their bond unbreakable.',
    poster_path: '/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
    backdrop_path: '/2UG177tWHy7xRmMKWJHB7nAUmKd.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2009-04-05',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 127532,
    title: 'Solo Leveling',
    name: 'Solo Leveling',
    overview: 'They say whatever doesn’t kill you makes you stronger, but that’s not the case for the world’s weakest hunter Sung Jinwoo. After being brutally slaughtered by monsters in a high-ranking dungeon, Jinwoo came back with the System, a program only he could see, that’s leveling him up in every way. Now, he’s inspired to discover the secrets behind his powers and the dungeon that spawned them.',
    poster_path: '/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg',
    backdrop_path: '/xMNH87maNLt9n2bMDYeI6db5VFm.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2024-01-07',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 114410,
    title: 'Chainsaw Man',
    name: 'Chainsaw Man',
    overview: 'Denji has a simple dream—to live a happy and peaceful life, spending time with a girl he likes. This is a far cry from reality, however, as Denji is forced by the yakuza into killing devils in order to pay off his crushing debts. Using his pet devil Pochita as a weapon, he is ready to do anything for a bit of cash.',
    poster_path: '/iFM1dyFi0rByvEomEkmm7NpQeeb.jpg',
    backdrop_path: '/5DUMPBSnHOZsbBv81GFXZXvDpo6.jpg',
    media_type: 'tv',
    vote_average: 8.5,
    first_air_date: '2022-10-12',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 65930,
    title: 'My Hero Academia',
    name: 'My Hero Academia',
    overview: 'Izuku has dreamt of being a hero all his life—a lofty goal for anyone, but especially challenging for a kid with no superpowers. That’s right, in a world where eighty percent of the population has some kind of super-powered "quirk," Izuku was unlucky enough to be born completely normal. But that’s not enough to stop him from enrolling in one of the world’s most prestigious hero academies.',
    poster_path: '/phuYuzqWW9ru8EA3HVjE9W2Rr3M.jpg',
    backdrop_path: '/ol0H2DGp4ifBHA4JDlCpwJWxnY2.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2016-04-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 73223,
    title: 'Black Clover',
    name: 'Black Clover',
    overview: 'Asta and Yuno are two orphans who want the same thing: to become the Wizard King. Locked in a friendly rivalry, they work hard towards their goal. While Yuno excels at magic, Asta has a problem uncommon in this world: he has no powers! But, on the day they receive their grimoires, they surprise everyone. To reach their goal, they’ll each find their own path to greatness—with or without magic.',
    poster_path: '/kaMisKeOoTBPxPkbC3OW7Wgt6ON.jpg',
    backdrop_path: '/oUsm3pq6rUga7lVGQFS3g84etVE.jpg',
    media_type: 'tv',
    vote_average: 8.5,
    first_air_date: '2017-10-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 61374,
    title: 'Tokyo Ghoul',
    name: 'Tokyo Ghoul',
    overview: 'Ken Kaneki, a bookworm college student, meets Rize, a girl his own age with whom he shares many interests.',
    poster_path: '/1m4RlC9BTCbyY549TOdVQ5NRPcR.jpg',
    backdrop_path: '/jnwRlthXIgJB75Mt9GEl93Dczki.jpg',
    media_type: 'tv',
    vote_average: 8.3,
    first_air_date: '2014-07-04',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 45782,
    title: 'Sword Art Online',
    name: 'Sword Art Online',
    overview: 'In the near future, a Virtual Reality Massive Multiplayer Online Role-Playing Game (VRMMORPG) called Sword Art Online has been released where players control their avatars with their bodies using a piece of technology called Nerve Gear. One day, players discover they cannot log out, as the game creator is holding them captive unless they reach the 100th floor of the game\'s tower and defeat the final boss. However, if they die in the game, they die in real life. Their struggle for survival starts now...',
    poster_path: '/9m8bFIXPg26taNrFSXGwEORVACD.jpg',
    backdrop_path: '/pr78HhmOYlA0fwaoYNcH1FstqBH.jpg',
    media_type: 'tv',
    vote_average: 8.1,
    first_air_date: '2012-07-08',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 120089,
    title: 'Spy x Family',
    name: 'SPY x FAMILY',
    overview: 'A spy, an assassin and a telepath come together to pose as a family, each for their own reasons, while hiding their true identities from each other.',
    poster_path: '/7NAvPYPAu7MeHwP8E9sn81PqsRh.jpg',
    backdrop_path: '/lysUnU6V0VfcthDbviuVlIqgHOR.jpg',
    media_type: 'tv',
    vote_average: 8.5,
    first_air_date: '2022-04-09',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 209867,
    title: 'Frieren: Beyond Journey\'s End',
    name: 'Frieren: Beyond Journey\'s End',
    overview: 'After the party of heroes defeated the Demon King, they restored peace to the land and returned to lives of solitude.  Generations pass, and the elven mage Frieren comes face to face with humanity’s mortality. She takes on a new apprentice and promises to fulfill old friends’ dying wishes. Can an elven mind make peace with the nature of life and death? Frieren embarks on her quest to find out.',
    poster_path: '/dqZENchTd7lp5zht7BdlqM7RBhD.jpg',
    backdrop_path: '/rBOnrVlck7BIlGeWVlzYiZeg4l2.jpg',
    media_type: 'tv',
    vote_average: 8.8,
    first_air_date: '2023-09-29',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 65739,
    title: 'Perman',
    name: 'Perman',
    overview: 'After Mitsuo receives a mask from a retiring superhero, he becomes Perman.',
    poster_path: '/gIYb3boKJ7QScJwzmcUs2ztb84U.jpg',
    backdrop_path: '/c7mEIDPaZu9HbUZEZdMDObvMM0d.jpg',
    media_type: 'tv',
    vote_average: 7.1,
    first_air_date: '1967-04-02',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 42912,
    title: 'Inazuma Eleven',
    name: 'Inazuma Eleven',
    overview: 'Mamoru Endou is a cheerful goalkeeper in Raimon Jr High, with six other players in the team. But there was a day when the team was almost lead to disbandment by Natsumi unless they are able to win the match against the Teikoku Gakuen, currently the best team in Japan. He tried to save the club by gathering four more players to join the team.',
    poster_path: '/9kQWvBMPWz1gykKLXuX6JBjC9uQ.jpg',
    backdrop_path: '/zhtEYosjlYtNavbvImxcs36We4i.jpg',
    media_type: 'tv',
    vote_average: 8.0,
    first_air_date: '2008-10-05',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 30983,
    title: 'Detective Conan',
    name: 'Detective Conan',
    overview: 'The son of a world famous mystery writer, Jimmy Kudo, has achieved his own notoriety by assisting the local police as a student detective. He has always been able to solve the most difficult of criminal cases using his wits and power of reason.',
    poster_path: '/rRIEFvHRy01OYzmXQBbGeW0Qilc.jpg',
    backdrop_path: '/z67lpMtm8YGykJO4p89meuNMvj8.jpg',
    media_type: 'tv',
    vote_average: 8.0,
    first_air_date: '1996-01-08',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
  {
    id: 12971,
    title: 'Dragon Ball',
    name: 'Dragon Ball Z',
    overview: 'Now happily married and with a son, martial arts champion Goku must defend Earth from a series of extraterrestrial invaders bent on destruction.',
    poster_path: '/oQ5CnVj3TRifXl2bIOri6H6rfNe.jpg',
    backdrop_path: '/ydf1CeiBLfdxiyNTpskM0802TKl.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '1989-04-26',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: true,
    dub_type: 'hindi',
  },
,
{
  "id": 104877,
  "title": "Tokyo Revengers",
  "name": "Tokyo Revengers",
  "overview": "Takemichi Hanagaki learns that his middle school girlfriend, Hinata Tachibana, was murdered by the Tokyo Manji Gang. He suddenly travels 12 years back in time to change fate.",
  "poster_path": "/q7UkA7u99Awhw15WsTjJ5sZ9Fp9.jpg",
  "backdrop_path": "/5Dpmk5c84Jm44bO2o73v5w5x8z.jpg",
  "media_type": "tv",
  "vote_average": 8.4,
  "first_air_date": "2021-04-11",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 207347,
  "title": "Kaiju No. 8",
  "name": "Kaiju No. 8",
  "overview": "In a world plagued by dangerous monsters known as Kaiju, Kafka Hibino aspires to join the Defense Force. After a mysterious small Kaiju enters his body, he gains incredible monster abilities.",
  "poster_path": "/3Yp73K2w1uQj3GqZk5y7z9w1x0.jpg",
  "backdrop_path": "/4Yq84L3x2vRk4HqAk6z8x0y2z1.jpg",
  "media_type": "tv",
  "vote_average": 8.6,
  "first_air_date": "2024-04-13",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 222766,
  "title": "Wind Breaker",
  "name": "Wind Breaker",
  "overview": "Haruka Sakura wants nothing to do with weaklings—he is only interested in the strongest. He starts at Furin High, a school of delinquents renowned as heroic defenders of their town.",
  "poster_path": "/5Zr95M4y3wSm5JvCq7v9x1y3z2.jpg",
  "backdrop_path": "/6As06N5z4xTn6LwDr8w0y2z4a3.jpg",
  "media_type": "tv",
  "vote_average": 8.5,
  "first_air_date": "2024-04-05",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 205424,
  "title": "Mashle: Magic and Muscles",
  "name": "Mashle: Magic and Muscles",
  "overview": "In a world where magic is everything, Mash Burnedead cannot use magic at all. To live a peaceful life with his adoptive father, he trains his muscles to overcome magic with brute force.",
  "poster_path": "/7Bt17P6a5yUo7NxEt9w1y3z5b4.jpg",
  "backdrop_path": "/8Cv28Q7b6zVp8OyFu0x2z4a6c5.jpg",
  "media_type": "tv",
  "vote_average": 8.3,
  "first_air_date": "2023-04-08",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 240411,
  "title": "Dandadan",
  "name": "Dandadan",
  "overview": "Momo Ayase believes in ghosts but rejects aliens, while Ken Takakura believes in aliens but rejects ghosts. To prove who is right, they visit haunted and alien hotspot locations.",
  "poster_path": "/9Dw39R8c7aWq9PzGv1y3z5b7d6.jpg",
  "backdrop_path": "/0Ex40S9d8bXr0QzHw2z4a6c8e7.jpg",
  "media_type": "tv",
  "vote_average": 8.8,
  "first_air_date": "2024-10-04",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 203737,
  "title": "Oshi no Ko",
  "name": "Oshi no Ko",
  "overview": "Dr. Goro is a country gynecologist and fan of idol Ai Hoshino. When Ai unexpectedly arrives at his hospital pregnant, a bizarre incident leads to him being reborn as her newborn child.",
  "poster_path": "/1Fy51T0e9cYs1RzIx3a5b7d9f8.jpg",
  "backdrop_path": "/2Gz62U1f0dZt2S0Jy4b6c8e0g9.jpg",
  "media_type": "tv",
  "vote_average": 8.7,
  "first_air_date": "2023-04-12",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 71370,
  "title": "Classroom of the Elite",
  "name": "Classroom of the Elite",
  "overview": "Kiyotaka Ayanokoji has just enrolled at Tokyo Metropolitan Advanced Nurturing High School, where 100% of students go on to college or find employment, but fierce meritocracy reigns.",
  "poster_path": "/3H073V2g1e0u3T1Kz5c7d9f1h0.jpg",
  "backdrop_path": "/4I184W3h2f1v4U2L0a6d8e0g2i1.jpg",
  "media_type": "tv",
  "vote_average": 8.3,
  "first_air_date": "2017-07-12",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 83095,
  "title": "Vinland Saga",
  "name": "Vinland Saga",
  "overview": "Raised by the Vikings who murdered his father, Thorfinn becomes a terrifying warrior, seeking an honorable duel against their leader Askeladd.",
  "poster_path": "/5J295X4i3g2w5V3M1b7e9f1h3j2.jpg",
  "backdrop_path": "/6K306Y5j4h3x6W4N2c8f0g2i4k3.jpg",
  "media_type": "tv",
  "vote_average": 8.8,
  "first_air_date": "2019-07-07",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 125988,
  "title": "Blue Lock",
  "name": "Blue Lock",
  "overview": "After a disastrous defeat at the 2018 World Cup, Japan initiates a revolutionary project: Blue Lock, a prison-like facility where 300 high school strikers compete to become the absolute egoist striker.",
  "poster_path": "/7L417Z6k5i4y7X5O3d9g1h3j5l4.jpg",
  "backdrop_path": "/8M528a7l6j5z8Y6P4e0h2i4k6m5.jpg",
  "media_type": "tv",
  "vote_average": 8.6,
  "first_air_date": "2022-10-09",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 116776,
  "title": "Hell's Paradise",
  "name": "Hell's Paradise",
  "overview": "Gabimaru the Hollow, an elite assassin from Iwagakure village, is offered a pardon by the Shogunate if he can retrieve the Elixir of Immortality from the mysterious island Shinsenkyo.",
  "poster_path": "/9N639b8m7k6a9Z7Q5f1i3j5l7n6.jpg",
  "backdrop_path": "/0O740c9n8l7b0a8R6g2j4k6m8o7.jpg",
  "media_type": "tv",
  "vote_average": 8.5,
  "first_air_date": "2023-04-01",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 86031,
  "title": "Dr. Stone",
  "name": "Dr. Stone",
  "overview": "Several thousand years after a mysterious phenomenon turns all of humanity to stone, the extraordinarily intelligent Senku Ishigami awakens, determined to rebuild civilization using science.",
  "poster_path": "/1P851d0o9m8c1b9S7h3k5l7n9p8.jpg",
  "backdrop_path": "/2Q962e1p0n9d2c0T8i4l6m8o0q9.jpg",
  "media_type": "tv",
  "vote_average": 8.6,
  "first_air_date": "2019-07-05",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
},
{
  "id": 214564,
  "title": "Bleach: Thousand-Year Blood War",
  "name": "Bleach: Thousand-Year Blood War",
  "overview": "The peace is broken as warning sirens ring through the Soul Society. A masked group calling themselves the Wandenreich launch an assault on Soul Reapers under Emperor Yhwach.",
  "poster_path": "/3R073f2q1o0e3d1U9j5m7n9p1r0.jpg",
  "backdrop_path": "/4S184g3r2p1f4e2V0k6n8o0q2s1.jpg",
  "media_type": "tv",
  "vote_average": 8.9,
  "first_air_date": "2022-10-11",
  "original_language": "ja",
  "category": "anime",
  "isAnime": true,
  "hasHindiDub": true,
  "dub_type": "hindi"
}
];

export const CURATED_ENGLISH_DUBBED_ANIME = [
  {
    id: 1429,
    title: 'Attack on Titan',
    name: 'Attack on Titan',
    overview: 'Humanity was forced to live inside cities surrounded by enormous walls due to the Titans.',
    poster_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdrop_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2013-04-07',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 13916,
    title: 'Death Note',
    name: 'Death Note',
    overview: 'Light Yagami finds a supernatural notebook that allows him to kill anyone by writing their name.',
    poster_path: '/tCZFfYTIwrR7n94J6G14Y4hAFU6.jpg',
    backdrop_path: '/tCZFfYTIwrR7n94J6G14Y4hAFU6.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2006-10-04',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 31911,
    title: 'Fullmetal Alchemist: Brotherhood',
    name: 'Fullmetal Alchemist: Brotherhood',
    overview: 'Edward and Alphonse Elric search for the Philosopher\'s Stone to restore their bodies.',
    poster_path: '/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
    backdrop_path: '/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
    media_type: 'tv',
    vote_average: 8.8,
    first_air_date: '2009-04-05',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 45952,
    title: 'Hunter x Hunter',
    name: 'Hunter x Hunter',
    overview: 'Gon Freecss aspires to become a Hunter to find his father who abandoned him.',
    poster_path: '/eobAuhCJA8oRp814V67WhezVXtQ.jpg',
    backdrop_path: '/eobAuhCJA8oRp814V67WhezVXtQ.jpg',
    media_type: 'tv',
    vote_average: 8.9,
    first_air_date: '2011-10-02',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 85937,
    title: 'Demon Slayer: Kimetsu no Yaiba',
    name: 'Demon Slayer: Kimetsu no Yaiba',
    overview: 'Tanjiro Kamado sets out to become a demon slayer after his family is slaughtered.',
    poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    backdrop_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2019-04-06',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 95479,
    title: 'Jujutsu Kaisen',
    name: 'Jujutsu Kaisen',
    overview: 'Yuji Itadori joins a secret organization of Sorcerers to eliminate a powerful Curse.',
    poster_path: '/6qQzMJG27XOJsyAEEIisoJB45j2.jpg',
    backdrop_path: '/6qQzMJG27XOJsyAEEIisoJB45j2.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2020-10-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 30984,
    title: 'Bleach',
    name: 'Bleach',
    overview: 'Ichigo Kurosaki gains the abilities of a Soul Reaper to defend humans against evil spirits.',
    poster_path: '/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg',
    backdrop_path: '/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2004-10-05',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 37854,
    title: 'One Piece',
    name: 'One Piece',
    overview: 'Monkey D. Luffy sets out on his adventure to become the King of the Pirates.',
    poster_path: '/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg',
    backdrop_path: '/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '1999-10-20',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 127532,
    title: 'Solo Leveling',
    name: 'Solo Leveling',
    overview: 'In a world where hunters must battle deadly monsters, weak hunter Sung Jinwoo discovers a quest.',
    poster_path: '/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg',
    backdrop_path: '/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2024-01-07',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 114410,
    title: 'Chainsaw Man',
    name: 'Chainsaw Man',
    overview: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita.',
    poster_path: '/iFM1dyFi0rByvEomEkmm7NpQeeb.jpg',
    backdrop_path: '/iFM1dyFi0rByvEomEkmm7NpQeeb.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2022-10-12',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 65930,
    title: 'My Hero Academia',
    name: 'My Hero Academia',
    overview: 'Izuku Midoriya dreams of being a hero despite being born without superpowers.',
    poster_path: '/phuYuzqWW9ru8EA3HVjE9W2Rr3M.jpg',
    backdrop_path: '/phuYuzqWW9ru8EA3HVjE9W2Rr3M.jpg',
    media_type: 'tv',
    vote_average: 8.5,
    first_air_date: '2016-04-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 73223,
    title: 'Black Clover',
    name: 'Black Clover',
    overview: 'Asta and Yuno are orphans who strive to become the next Wizard King.',
    poster_path: '/kaMisKeOoTBPxPkbC3OW7Wgt6ON.jpg',
    backdrop_path: '/kaMisKeOoTBPxPkbC3OW7Wgt6ON.jpg',
    media_type: 'tv',
    vote_average: 8.5,
    first_air_date: '2017-10-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 45782,
    title: 'Sword Art Online',
    name: 'Sword Art Online',
    overview: 'Players find themselves trapped in a virtual reality MMORPG where dying in game means dying in real life.',
    poster_path: '/9m8bFIXPg26taNrFSXGwEORVACD.jpg',
    backdrop_path: '/9m8bFIXPg26taNrFSXGwEORVACD.jpg',
    media_type: 'tv',
    vote_average: 8.1,
    first_air_date: '2012-07-08',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
  {
    id: 120089,
    title: 'Spy x Family',
    name: 'Spy x Family',
    overview: 'A spy on an undercover mission gets married and adopts a child without knowing their secret identities.',
    poster_path: '/7NAvPYPAu7MeHwP8E9sn81PqsRh.jpg',
    backdrop_path: '/7NAvPYPAu7MeHwP8E9sn81PqsRh.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2022-04-09',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'english',
  },
];

export const CURATED_SUBBED_ANIME = [
  {
    id: 209867,
    title: 'Frieren: Beyond Journey\'s End',
    name: 'Frieren: Beyond Journey\'s End',
    overview: 'The mage Frieren defeated the Demon King alongside hero Himmel. Decades later she embarks on a new voyage.',
    poster_path: '/dqZENchTd7lp5zht7BdlqM7RBhD.jpg',
    backdrop_path: '/dqZENchTd7lp5zht7BdlqM7RBhD.jpg',
    media_type: 'tv',
    vote_average: 8.9,
    first_air_date: '2023-09-29',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'sub',
  },
  {
    id: 85937,
    title: 'Demon Slayer: Kimetsu no Yaiba',
    name: 'Demon Slayer: Kimetsu no Yaiba',
    overview: 'Tanjiro Kamado sets out to become a demon slayer after his family is slaughtered.',
    poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    backdrop_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2019-04-06',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'sub',
  },
  {
    id: 95479,
    title: 'Jujutsu Kaisen',
    name: 'Jujutsu Kaisen',
    overview: 'Yuji Itadori joins a secret organization of Sorcerers to eliminate a powerful Curse.',
    poster_path: '/6qQzMJG27XOJsyAEEIisoJB45j2.jpg',
    backdrop_path: '/6qQzMJG27XOJsyAEEIisoJB45j2.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2020-10-03',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'sub',
  },
  {
    id: 1429,
    title: 'Attack on Titan',
    name: 'Attack on Titan',
    overview: 'Humanity was forced to live inside cities surrounded by enormous walls due to the Titans.',
    poster_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdrop_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2013-04-07',
    original_language: 'ja',
    category: 'anime',
    isAnime: true,
    hasHindiDub: false,
    dub_type: 'sub',
  },
];

export async function fetchHindiMovies(page = 1) {
  try {
    const curatedAll = [...CURATED_BOLLYWOOD_BLOCKBUSTERS];
    const curatedIds = new Set(curatedAll.map((b) => b.id));

    const data = await cachedFetchJson(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&region=IN&primary_release_date.lte=${today}&vote_count.gte=5&sort_by=popularity.desc&page=${page}`);

    const bollywood = (data.results && data.results.length > 0)
      ? data.results
          .filter((m) => m && m.id && !curatedIds.has(m.id))
          .map((m) => ({ ...m, media_type: 'movie', category: 'hindi', original_language: 'hi', isHindiDubbed: true }))
      : (page === 1 ? FALLBACK_MEDIA.filter((m) => m.category === 'hindi') : []);

    if (page === 1) {
      return [...curatedAll, ...bollywood];
    }
    return bollywood;
  } catch (err) {
    return page === 1 ? [...CURATED_BOLLYWOOD_BLOCKBUSTERS, ...FALLBACK_MEDIA.filter((m) => m.category === 'hindi')] : [];
  }
}

export async function fetchTrendingSeries(page = 1) {
  try {
    const data = await cachedFetchJson(`${BASE_URL}/discover/tv?api_key=${API_KEY}&first_air_date.lte=${today}&vote_count.gte=15&sort_by=popularity.desc&page=${page}`);
    return data.results && data.results.length > 0 ? data.results.map((m) => ({ ...m, media_type: 'tv' })) : (page === 1 ? FALLBACK_MEDIA.filter((m) => m.media_type === 'tv') : []);
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA.filter((m) => m.media_type === 'tv') : [];
  }
}

export async function fetchAnime(page = 1, audioFilter = 'all') {
  try {
    let sortParam = 'popularity.desc';
    if (audioFilter === 'sub') {
      sortParam = 'vote_count.desc';
    }

    const allCurated = [
      ...(includeAdult ? SECRET_ECCHI_ANIME : []),
      ...CURATED_HINDI_DUBBED_ANIME,
      ...CURATED_ENGLISH_DUBBED_ANIME,
      ...CURATED_SUBBED_ANIME
    ];
    const allCuratedIds = new Set(allCurated.map((a) => Number(a.id)));

    // Fetch both TV anime series AND anime cinema movies with cache
    const tvPromise = cachedFetchJson(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&first_air_date.lte=${today}&vote_count.gte=8&sort_by=${sortParam}&page=${page}`)
      .catch(() => ({ results: [] }));
    const moviePromise = cachedFetchJson(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&with_original_language=ja&primary_release_date.lte=${today}&vote_count.gte=10&sort_by=${sortParam}&page=${page}`)
      .catch(() => ({ results: [] }));

    const [tvData, movieData] = await Promise.all([tvPromise, moviePromise]);
    const rawTv = (tvData.results || []).map((m) => ({ ...m, media_type: 'tv' }));
    const rawMovies = (movieData.results || []).map((m) => ({ ...m, media_type: 'movie' }));

    // Interleave series and cinema movies
    const interleaved = [];
    const maxLen = Math.max(rawTv.length, rawMovies.length);
    for (let i = 0; i < maxLen; i++) {
      if (rawTv[i]) interleaved.push(rawTv[i]);
      if (rawMovies[i]) interleaved.push(rawMovies[i]);
    }

    // Filter out restricted content and duplicate curated items
    const cleanDiscovered = interleaved
      .filter((item) => item && item.id && !isHanimeContent(item) && !allCuratedIds.has(Number(item.id)))
      .map((m) => {
        const isHindi = isHindiDubbedAnime(m) || VERIFIED_HINDI_ANIME_IDS.has(Number(m.id));
        return { 
          ...m, 
          media_type: m.media_type || (m.first_air_date ? 'tv' : 'movie'), 
          category: 'anime', 
          isAnime: true,
          hasHindiDub: isHindi,
          isHindiDubbed: isHindi,
          dub_type: isHindi && audioFilter === 'hindi' ? 'hindi' : (audioFilter === 'english' ? 'english' : 'sub')
        };
      })
      .filter((item) => {
        if (audioFilter === 'hindi') {
          return item.hasHindiDub;
        }
        return true;
      });

    if (page === 1) {
      let studioAnime = [];
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('furina_studio_movies') : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            studioAnime = parsed.filter((m) => (m.category === 'anime' || m.isAnime) && (audioFilter === 'hindi' ? m.languages?.hi?.url : true));
          }
        }
      } catch (e) {}

      let curatedBase = [];
      if (audioFilter === 'hindi') {
        curatedBase = [...studioAnime, ...CURATED_HINDI_DUBBED_ANIME.map((a) => ({ ...a, hasHindiDub: true, isHindiDubbed: true, dub_type: 'hindi' }))];
      } else if (audioFilter === 'english') {
        curatedBase = [...studioAnime, ...CURATED_ENGLISH_DUBBED_ANIME];
      } else if (audioFilter === 'sub') {
        curatedBase = [...studioAnime, ...CURATED_SUBBED_ANIME];
      } else {
        const seenIds = new Set();
        curatedBase = [
          ...studioAnime,
          ...CURATED_HINDI_DUBBED_ANIME.slice(0, 15),
          ...CURATED_ENGLISH_DUBBED_ANIME.slice(0, 15),
          ...CURATED_SUBBED_ANIME.slice(0, 10)
        ].map((a) => {
          const isHindi = isHindiDubbedAnime(a) || VERIFIED_HINDI_ANIME_IDS.has(Number(a.id));
          return { ...a, hasHindiDub: isHindi, isHindiDubbed: isHindi };
        })
        .filter((item) => {
          if (!item || seenIds.has(Number(item.id))) return false;
          seenIds.add(Number(item.id));
          return true;
        });
      }

      return [...curatedBase, ...cleanDiscovered];
    }

    return cleanDiscovered;

  } catch (err) {

    if (audioFilter === 'hindi') return page === 1 ? CURATED_HINDI_DUBBED_ANIME : [];

    if (audioFilter === 'sub') return page === 1 ? CURATED_SUBBED_ANIME : [];

    return page === 1 ? CURATED_ENGLISH_DUBBED_ANIME : [];

  }

}



// 👻 Horror Cinema

export async function fetchHorrorMovies(page = 1) {

  try {
    const data = await cachedFetchJson(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&primary_release_date.lte=${today}&vote_count.gte=25&sort_by=popularity.desc&page=${page}`);
    return (data.results || []).map(m => ({ ...m, media_type: 'movie', category: 'horror' }));
  } catch (err) {
    return [];
  }
}

// 🇰🇷 Verified Curated K-Dramas with Official Hindi Dubs
export const CURATED_HINDI_KDRAMAS = [
  {
    id: 93405,
    name: 'Squid Game',
    title: 'Squid Game (Hindi Dubbed)',
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes. Official Hindi Dubbed audio on Netflix.',
    poster_path: '/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg',
    backdrop_path: '/2meovGzM9K0nS6zU9yJtU6q9p9G.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2021-09-17',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  },
  {
    id: 99966,
    name: 'All of Us Are Dead',
    title: 'All of Us Are Dead (Hindi Dubbed)',
    overview: 'A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out or turn into one of the rabid infected. Official Hindi Dubbed audio.',
    poster_path: '/dK0iDbSulVLS7nMLt65ztY0XhBj.jpg',
    backdrop_path: '/dK0iDbSulVLS7nMLt65ztY0XhBj.jpg',
    media_type: 'tv',
    vote_average: 8.3,
    first_air_date: '2022-01-28',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  },
  {
    id: 94796,
    name: 'Crash Landing on You',
    title: 'Crash Landing on You (Hindi Dubbed)',
    overview: 'A paragliding mishap drops a South Korean heiress in North Korea - and into the life of an army officer, who decides he will help her hide. Official Hindi dub.',
    poster_path: '/lFQnTjZrscvxEtcAnCQEYhnfi5f.jpg',
    backdrop_path: '/lFQnTjZrscvxEtcAnCQEYhnfi5f.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2019-12-14',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  },
  {
    id: 154825,
    name: 'Business Proposal',
    title: 'Business Proposal (Hindi Dubbed)',
    overview: 'In disguise as her friend, Ha-ri shows up on a blind date to scare him away. But plans go awry when he turns out to be her CEO - and makes a proposal. Full Hindi dub.',
    poster_path: '/6qQzMJG27XOJsyAEEIisoJB45j2.jpg',
    backdrop_path: '/6qQzMJG27XOJsyAEEIisoJB45j2.jpg',
    media_type: 'tv',
    vote_average: 8.4,
    first_air_date: '2022-02-28',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  },
  {
    id: 112888,
    name: 'The Glory',
    title: 'The Glory (Hindi Dubbed)',
    overview: 'After a childhood marked by pain and violence, a woman puts a carefully planned revenge scheme into motion. Full Hindi dub.',
    poster_path: '/dqZENchTd7lp5zht7BdlqM7RBhD.jpg',
    backdrop_path: '/dqZENchTd7lp5zht7BdlqM7RBhD.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2022-12-30',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  },
  {
    id: 117376,
    name: 'Vincenzo',
    title: 'Vincenzo (Hindi Dubbed)',
    overview: 'During a visit to his motherland, a Korean-Italian mafia lawyer gives an unrivaled conglomerate a taste of its own medicine with a side of justice. Official Hindi dub.',
    poster_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdrop_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2021-02-20',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  },
  {
    id: 96580,
    name: 'Sweet Home',
    title: 'Sweet Home (Hindi Dubbed)',
    overview: 'As humans turn into savage monsters, one troubled teenager and his neighbors fight to survive and to hold on to their humanity. Official Hindi dub.',
    poster_path: '/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg',
    backdrop_path: '/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg',
    media_type: 'tv',
    vote_average: 8.3,
    first_air_date: '2020-12-18',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  },
  {
    id: 213713,
    name: 'My Demon',
    title: 'My Demon (Hindi Dubbed)',
    overview: 'A pitiless demon becomes powerless after getting entangled with an icy heiress, who may hold the key to his lost abilities - and his heart. Official Hindi dub.',
    poster_path: '/kV27j3Nz4d5z8u6mN3EJw9RiLg2.jpg',
    backdrop_path: '/kV27j3Nz4d5z8u6mN3EJw9RiLg2.jpg',
    media_type: 'tv',
    vote_average: 8.2,
    first_air_date: '2023-11-24',
    original_language: 'ko',
    category: 'kdrama',
    isHindiDubbed: true,
    hasHindiDub: true
  }
];

// 🇰🇷 K-Drama (Korean Dramas) with official Hindi Dub filter support
export async function fetchKDramas(page = 1, filter = 'all') {
  try {
    const data = await cachedFetchJson(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&with_genres=18|10759|9648&first_air_date.lte=${today}&vote_count.gte=8&sort_by=popularity.desc&page=${page}`);
    const results = (data.results || []).map(m => ({ 
      ...m, 
      media_type: 'tv', 
      category: 'kdrama',
      isHindiDubbed: isHindiAvailable(m)
    }));

    if (filter === 'hindi') {
      const hindiOnly = results.filter(m => isHindiAvailable(m));
      if (page === 1) {
        return deduplicateMedia([...CURATED_HINDI_KDRAMAS, ...hindiOnly]);
      }
      return hindiOnly;
    }

    if (page === 1) {
      return deduplicateMedia([...CURATED_HINDI_KDRAMAS, ...results]);
    }
    return results;
  } catch (err) {
    return page === 1 ? CURATED_HINDI_KDRAMAS : [];
  }
}

export async function fetchHindiDubbedKDramas(page = 1) {
  return await fetchKDramas(page, 'hindi');
}

export async function fetchHindiDubbedAnime(page = 1) {
  return await fetchAnime(page, 'hindi');
}

export async function fetchHindiDubbedHollywood(page = 1) {
  if (page === 1) {
    let studioHindi = [];
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('furina_studio_movies') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          studioHindi = parsed.filter((m) => m.category === 'hollywood' && m.languages?.hi?.url);
        }
      }
    } catch (e) {}
    return deduplicateMedia(studioHindi);
  }
  return [];
}

// Master Vault Uncut Cinema
export async function fetchMatureMovies(page = 1) {
  try {
    const data = await cachedFetchJson(`${BASE_URL}/discover/movie?api_key=${API_KEY}&include_adult=true&certification_country=US&certification=R|NC-17&sort_by=popularity.desc&page=${page}`);
    return data.results && data.results.length > 0 ? data.results.map(m => ({ ...m, media_type: 'movie', is_mature: true })) : (page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'mature') : []);
  } catch (err) {
    return page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'mature') : [];
  }
}







// Verified Hollywood Blockbusters with official Hindi dubs in theaters/OTT

export const CURATED_HOLLYWOOD_HINDI_DUBS = [

{

  "id": 168259,

  "title": "Furious 7",

  "name": "Furious 7",

  "overview": "Deckard Shaw seeks revenge against Dominic Toretto and his family for his comatose brother. Blockbuster Hindi dub in India.",

  "poster_path": "/ktofZ9Htrjiy0P6LEowsDaxd3Ri.jpg",

  "backdrop_path": "/d7A9vL1P1Q5vL9kX2bJ9fF7.jpg",

  "media_type": "movie",

  "vote_average": 7.3,

  "release_date": "2015-04-01",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 912649,

  "title": "Venom: The Last Dance",

  "name": "Venom: The Last Dance",

  "overview": "Eddie Brock and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision. Official Hindi dubbed theatrical release.",

  "poster_path": "/vGXptEdgZIhPg3cGlc7e8sNPC2e.jpg",

  "backdrop_path": "/3V4kLQg0kSqPLctI5ziYWgAZYqa.jpg",

  "media_type": "movie",

  "vote_average": 6.8,

  "release_date": "2024-10-22",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 1011985,

  "title": "Kung Fu Panda 4",

  "name": "Kung Fu Panda 4",

  "overview": "Po must train a new warrior when he's chosen to become the spiritual leader of the Valley of Peace. However, a powerful shapeshifting sorceress sets her eyes on his Staff of Wisdom. Full Hindi theatrical dub.",

  "poster_path": "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",

  "backdrop_path": "/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg",

  "media_type": "movie",

  "vote_average": 7.1,

  "release_date": "2024-03-02",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 569094,

  "title": "Spider-Man: Across the Spider-Verse",

  "name": "Spider-Man: Across the Spider-Verse",

  "overview": "After reuniting with Gwen Stacy, Brooklyn\u2019s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society and Pavitr Prabhakar in Mumbattan. Indian theatrical Hindi dub featuring Shubman Gill.",

  "poster_path": "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",

  "backdrop_path": "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",

  "media_type": "movie",

  "vote_average": 8.4,

  "release_date": "2023-05-31",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 447365,

  "title": "Guardians of the Galaxy Vol. 3",

  "name": "Guardians of the Galaxy Vol. 3",

  "overview": "Peter Quill, still reeling from the loss of Gamora, must rally his team around him to defend the universe and protect Rocket on a mission that could lead to the end of the Guardians. Full Hindi dub.",

  "poster_path": "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",

  "backdrop_path": "/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",

  "media_type": "movie",

  "vote_average": 8.0,

  "release_date": "2023-05-03",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 284053,

  "title": "Thor: Ragnarok",

  "name": "Thor: Ragnarok",

  "overview": "Thor is imprisoned on the other side of the universe and finds himself in a race against time to get back to Asgard to stop Ragnarok, the destruction of his home world. Hilarious Hindi dub.",

  "poster_path": "/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg",

  "backdrop_path": "/kaIfm5ryEOwYg8pahVIq1bdaPtO.jpg",

  "media_type": "movie",

  "vote_average": 7.6,

  "release_date": "2017-10-02",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 24428,

  "title": "The Avengers",

  "name": "The Avengers",

  "overview": "When an unexpected enemy emerges and threatens global safety and security, Nick Fury finds himself in need of a team to pull the world back from the brink of disaster. Blockbuster Hindi dub.",

  "poster_path": "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",

  "backdrop_path": "/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg",

  "media_type": "movie",

  "vote_average": 7.7,

  "release_date": "2012-04-25",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 157336,

  "title": "Interstellar",

  "name": "Interstellar",

  "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage. Iconic Hindi dub.",

  "poster_path": "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",

  "backdrop_path": "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",

  "media_type": "movie",

  "vote_average": 8.4,

  "release_date": "2014-11-05",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 27205,

  "title": "Inception",

  "name": "Inception",

  "overview": "Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O. Authentic Hindi dub.",

  "poster_path": "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",

  "backdrop_path": "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",

  "media_type": "movie",

  "vote_average": 8.4,

  "release_date": "2010-07-15",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 155,

  "title": "The Dark Knight",

  "name": "The Dark Knight",

  "overview": "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, until the sadistic Joker unleashes chaos upon Gotham. Legendary Hindi dub.",

  "poster_path": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",

  "backdrop_path": "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",

  "media_type": "movie",

  "vote_average": 8.5,

  "release_date": "2008-07-16",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 361743,

  "title": "Top Gun: Maverick",

  "name": "Top Gun: Maverick",

  "overview": "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates on a mission. Authentic Hindi dub.",

  "poster_path": "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",

  "backdrop_path": "/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",

  "media_type": "movie",

  "vote_average": 8.2,

  "release_date": "2022-05-24",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 414906,

  "title": "The Batman",

  "name": "The Batman",

  "overview": "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler. Full authentic Hindi dub.",

  "poster_path": "/74xTEgt7R36Fpooo50r9T25onhq.jpg",

  "backdrop_path": "/b0PlSFdDwbyK0cf5RxwDpaxtQvQ.jpg",

  "media_type": "movie",

  "vote_average": 7.7,

  "release_date": "2022-03-01",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 667538,

  "title": "Transformers: Rise of the Beasts",

  "name": "Transformers: Rise of the Beasts",

  "overview": "When a new threat capable of destroying the entire planet emerges, Optimus Prime and the Autobots must team up with a powerful faction known as the Maximals. Blockbuster Hindi dub on OTT.",

  "poster_path": "/gPbM0MK8CP8A174rmUwGsADNYKD.jpg",

  "backdrop_path": "/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",

  "media_type": "movie",

  "vote_average": 7.3,

  "release_date": "2023-06-06",

  "category": "hollywood",

  "isHindiDubbed": true

},

  {

  "id": 558449,

  "title": "Gladiator II",

  "name": "Gladiator II",

  "overview": "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors. Authentic Hindi theatrical dub.",

  "poster_path": "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",

  "backdrop_path": "/euYIwmwkmz95mnXvufEmbL6ovhA.jpg",

  "media_type": "movie",

  "vote_average": 6.8,

  "release_date": "2024-11-05",

  "category": "hollywood",

  "isHindiDubbed": true

},

    {

    id: 533535,

    title: "Deadpool & Wolverine (Hindi Dubbed)",

    name: "Deadpool & Wolverine",

    overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. When his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine. Full official Hindi audio track.",

    poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",

    backdrop_path: "/yDHYTjA3R0neXjgu144Y1fX3AcA.jpg",

    media_type: "movie",

    vote_average: 7.7,

    release_date: "2024-07-24",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 299534,

    title: "Avengers: Endgame (Hindi Dubbed)",

    name: "Avengers: Endgame",

    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe. Full Hindi theatrical dub.",

    poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",

    backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",

    media_type: "movie",

    vote_average: 8.3,

    release_date: "2019-04-24",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 299536,

    title: "Avengers: Infinity War (Hindi Dubbed)",

    name: "Avengers: Infinity War",

    overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. Full Hindi dub audio track.",

    poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",

    backdrop_path: "/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg",

    media_type: "movie",

    vote_average: 8.2,

    release_date: "2018-04-25",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 634649,

    title: "Spider-Man: No Way Home (Hindi Dubbed)",

    name: "Spider-Man: No Way Home",

    overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous. Full official Hindi dub.",

    poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",

    backdrop_path: "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",

    media_type: "movie",

    vote_average: 8.0,

    release_date: "2021-12-15",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 76600,

    title: "Avatar: The Way of Water (Hindi Dubbed)",

    name: "Avatar: The Way of Water",

    overview: "Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure. Full Hindi audio.",

    poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",

    backdrop_path: "/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",

    media_type: "movie",

    vote_average: 7.6,

    release_date: "2022-12-14",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 872585,

    title: "Oppenheimer (Hindi Dubbed)",

    name: "Oppenheimer",

    overview: "The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II. Full official Hindi dub release.",

    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",

    backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",

    media_type: "movie",

    vote_average: 8.1,

    release_date: "2023-07-19",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 693134,

    title: "Dune: Part Two (Hindi Dubbed)",

    name: "Dune: Part Two",

    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe. Full Hindi dub.",

    poster_path: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",

    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5200z3.jpg",

    media_type: "movie",

    vote_average: 8.2,

    release_date: "2024-02-27",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 823464,

    title: "Godzilla x Kong: The New Empire (Hindi Dubbed)",

    name: "Godzilla x Kong: The New Empire",

    overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own. Full Hindi dubbed track.",

    poster_path: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",

    backdrop_path: "/qrGtwwWBua7drvdBkQjZ44mQ4tL.jpg",

    media_type: "movie",

    vote_average: 7.2,

    release_date: "2024-03-27",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 385687,

    title: "Fast X (Hindi Dubbed)",

    name: "Fast X",

    overview: "Over many missions and against impossible odds, Dom Toretto and his family have outsmarted, out-nerved and outdriven every foe in their path. Now, they confront the most lethal opponent they've ever faced: Dante Reyes. Full Hindi theatrical dub.",

    poster_path: "/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",

    backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",

    media_type: "movie",

    vote_average: 7.1,

    release_date: "2023-05-17",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 603692,

    title: "John Wick: Chapter 4 (Hindi Dubbed)",

    name: "John Wick: Chapter 4",

    overview: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe. Full Hindi dub.",

    poster_path: "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",

    backdrop_path: "/h8gHn0OzRogL0GayNX0afrqaZqD.jpg",

    media_type: "movie",

    vote_average: 7.7,

    release_date: "2023-03-22",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 575264,

    title: "Mission: Impossible - Dead Reckoning Part One (Hindi Dubbed)",

    name: "Mission: Impossible - Dead Reckoning Part One",

    overview: "Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands. Full Hindi theatrical audio.",

    poster_path: "/NNxYkU70HPurnNCSiCjYAmacwm.jpg",

    backdrop_path: "/628Dep6AxEtDxjZoGP78TsOxYbK.jpg",

    media_type: "movie",

    vote_average: 7.6,

    release_date: "2023-07-08",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 453395,

    title: "Doctor Strange in the Multiverse of Madness (Hindi Dubbed)",

    name: "Doctor Strange in the Multiverse of Madness",

    overview: "Doctor Strange, with the help of mystical allies both old and new, traverses the mind-bending and dangerous alternate realities of the Multiverse to confront a mysterious new adversary. Full official Hindi theatrical audio.",

    poster_path: "/ddJcSKbcp4rKZTmuyWaMhuwcfMz.jpg",

    backdrop_path: "/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg",

    media_type: "movie",

    vote_average: 7.3,

    release_date: "2022-05-04",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 505642,

    title: "Black Panther: Wakanda Forever (Hindi Dubbed)",

    name: "Black Panther: Wakanda Forever",

    overview: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T'Challa's death. As the Wakandans strive to embrace their next chapter, the heroes must band together with the help of War Dog Nakia and Everett Ross. Full Hindi audio.",

    poster_path: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",

    backdrop_path: "/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg",

    media_type: "movie",

    vote_average: 7.1,

    release_date: "2022-11-09",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 507086,

    title: "Jurassic World Dominion (Hindi Dubbed)",

    name: "Jurassic World Dominion",

    overview: "Four years after the destruction of Isla Nublar, dinosaurs now live—and hunt—alongside humans all over the world. This fragile balance will reshape the future and determine, once and for all, whether human beings are to remain the apex predators. Full official Hindi dub.",

    poster_path: "/jbAvCACjLf1ZG0unB2tdmx5HAf1.jpg",

    backdrop_path: "/7abRA1j046AynXj6G9fV9kX8t3T.jpg",

    media_type: "movie",

    vote_average: 6.9,

    release_date: "2022-06-01",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 572802,

    title: "Aquaman and the Lost Kingdom (Hindi Dubbed)",

    name: "Aquaman and the Lost Kingdom",

    overview: "Black Manta seeks revenge on Aquaman for his father's death. Wielding the Black Trident's power, he becomes a formidable foe. To defend Atlantis, Aquaman turns to his imprisoned brother Orm, the former King. Full Hindi theatrical dub.",

    poster_path: "/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg",

    backdrop_path: "/cnqwv5W7UC5Tw5Lh8x6z4q99Z3N.jpg",

    media_type: "movie",

    vote_average: 6.8,

    release_date: "2023-12-20",

    category: "hindi",

    isHindiDubbed: true

  },

  {

    id: 271110,

    title: "Captain America: Civil War (Hindi Dubbed)",

    name: "Captain America: Civil War",

    overview: "Following the events of Age of Ultron, the collective governments of the world pass an act designed to regulate all superhuman activity. This polarizes opinion amongst the Avengers, causing two factions to form: one led by Iron Man, the other by Captain America. Full Hindi dub featuring Varun Dhawan.",

    poster_path: "/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg",

    backdrop_path: "/kvRT3qv1Hwy4bV6bL5F0m7QhM4k.jpg",

    media_type: "movie",

    vote_average: 7.4,

    release_date: "2016-04-27",

    category: "hindi",

    isHindiDubbed: true

  }

];



// Master Vault Curated Anime Collection (kept strictly in secret vault)

export const BLOCKED_HANIME_IDS = new Set([

  95897, 81044, 88090, 78501, 90388, 131660, 118588, 99071, 96444, 45950,

  68005, 64706, 85588, 70998, 70830, 74180, 75778, 103409, 236338, 114477,

  99080, 64163, 45998, 66926, 38112, 34742, 63187, 96120, 37867, 63323,

  61460, 34805, 45234, 233643, 236209, 23315, 39281, 43098, 67406, 45129,

  31969, 40118, 37837, 63200, 60824, 45266, 38384, 33527, 61706, 34839,

  70889, 65977, 119853, 85461, 93554, 103986, 107937, 111169, 95224, 93988,

  44342, 44439, 38786, 84669, 82883, 80646, 125433, 82030, 84123, 100877, 107865,

  138757, 204124, 221856, 138760, 34484, 38338, 45749, 61793, 46518, 38622,

  32085, 42371, 45963, 42354, 42416, 34524, 75677, 68205, 70588, 154504,

  34571, 38450, 34739, 38260, 45511, 42512, 38053, 68846, 31804

]);



const BLOCKED_HANIME_REGEX = /\b(overflow|souryo|secret\s*mission|joshiochi|araiya|sweet\s*punishment|fire\s*in\s*his\s*fingertips|redo\s*of\s*healer|interspecies|kuro\s*gal|papa\s*datte|show\s*time|seduced\s*by\s*my\s*best\s*friend|world's\s*end\s*harem|labyrinth\s*of\s*another\s*world|peter\s*grill|sister\s*new\s*devil|kissxsis|kiss\s*x\s*sis|valkyrie\s*drive|qwaser|monster\s*musume|ladies\s*versus|shimoneta|so,\s*i\s*can't\s*play\s*h|queen's\s*blade|bikini\s*warriors|seven\s*mortal\s*sins|strike\s*the\s*blood|campione|elfen\s*lied|gantz|grisaia|rosario\s*\+\s*vampire|hundred|comicfesta|hentai|ecchi|uncensored|erotic|shikiyoku|sennyuu\s*sousakan|futanari|ero\s*manga)\b/i;



export function isHanimeContent(item) {

  if (!item) return false;

  const id = Number(item.id);

  if (BLOCKED_HANIME_IDS.has(id)) return true;

  if (item.category === 'ecchi_anime' || item.is_mature) return true;

  const title = (item.title || item.name || item.original_name || item.original_title || '').toLowerCase();

  const overview = (item.overview || '').toLowerCase();

  return BLOCKED_HANIME_REGEX.test(title) || BLOCKED_HANIME_REGEX.test(overview);

}



// Verified K-Dramas with official Hindi dubs in India/global OTT
export const VERIFIED_HINDI_KDRAMA_IDS = new Set([
  93405,  // Squid Game Season 1
  113962, // Squid Game Season 2
  99966,  // All of Us Are Dead
  94796,  // Crash Landing on You
  154825, // Business Proposal
  112888, // The Glory
  117376, // Vincenzo
  96580,  // Sweet Home
  213713, // My Demon
  70593,  // Kingdom
  135897, // Happiness
  218768, // Duty After School
  197067, // Extraordinary Attorney Woo
  216390, // King the Land
  214999, // Bloodhounds
  208534, // Parasyte: The Grey
  113880, // Hellbound
  202250, // Gyeongseong Creature
  209374, // Strong Girl Nam-soon
  218589, // Castaway Diva
  206586, // Daily Dose of Sunshine
  208889, // Doona!
  207604, // Celebrity
]);

// Verified Global Web Series with official Hindi dubs
export const VERIFIED_HINDI_GLOBAL_SERIES_IDS = new Set([
  71446,  // Money Heist (La Casa de Papel)
  66732,  // Stranger Things
  119051, // Wednesday
  71912,  // The Witcher
  96677,  // Lupin
  76479,  // The Boys
  81356,  // Sex Education
  204343, // Squid Game: The Challenge
  70523,  // Dark
  110316, // Alice in Borderland
  111110, // One Piece (Live Action)
  82452,  // Avatar: The Last Airbender (Live Action)
  94997,  // House of the Dragon
  100088, // The Last of Us
  106379, // Fallout
  84958,  // Loki
  125988, // Silo
]);

// Verified Hollywood Blockbusters with official Indian theatrical/OTT Hindi dubs
export const VERIFIED_HINDI_HOLLYWOOD_IDS = new Set([
  533535, // Deadpool & Wolverine
  299534, // Avengers: Endgame
  299536, // Avengers: Infinity War
  634649, // Spider-Man: No Way Home
  76600,  // Avatar: The Way of Water
  19995,  // Avatar
  168259, // Furious 7
  912649, // Venom: The Last Dance
  335983, // Venom
  580489, // Venom: Let There Be Carnage
  1011985,// Kung Fu Panda 4
  823464, // Godzilla x Kong: The New Empire
  27205,  // Inception
  157336, // Interstellar
  155,    // The Dark Knight
  272,    // Batman Begins
  49026,  // The Dark Knight Rises
  135397, // Jurassic World
  667538, // Transformers: Rise of the Beasts
  284053, // Thor: Ragnarok
  616037, // Thor: Love and Thunder
  24428,  // The Avengers
  99861,  // Avengers: Age of Ultron
  447365, // Guardians of the Galaxy Vol. 3
  569094, // Spider-Man: Across the Spider-Verse
  324857, // Spider-Man: Into the Spider-Verse
  414906, // The Batman
  575264, // Mission: Impossible - Dead Reckoning
  693134, // Dune: Part Two
  438631, // Dune
  385687, // Fast X
  603692, // John Wick: Chapter 4
  572802, // Aquaman and the Lost Kingdom
  505642, // Black Panther: Wakanda Forever
  453395, // Doctor Strange in the Multiverse of Madness
  558449, // Gladiator II
  361743, // Top Gun: Maverick
]);

export function isHindiAvailable(item) {
  if (!item) return false;

  // Studio / Multi-Audio content with verified physical Hindi audio asset
  if (item.languages?.hi?.url || item.audio_hi_url) {
    return true;
  }

  // Custom Studio titles explicitly flagged
  if (item.isCustom && (item.isHindiDubbed || item.hasHindiDub || item.languages?.hi)) {
    return true;
  }

  // Authentic Bollywood / Indian cinema whose native spoken audio is Hindi
  if (
    item.original_language === 'hi' ||
    (Array.isArray(item.origin_country) && item.origin_country.includes('IN') && item.original_language !== 'en')
  ) {
    return true;
  }

  const id = Number(item.id);

  // Curated Bollywood list (authentic Hindi cinema)
  if (CURATED_BOLLYWOOD_BLOCKBUSTERS.some((b) => Number(b.id) === id)) return true;

  // Verified Hollywood Blockbusters with official authorized Hindi dubs
  if (VERIFIED_HINDI_HOLLYWOOD_IDS.has(id)) return true;
  if (CURATED_HOLLYWOOD_HINDI_DUBS.some((m) => Number(m.id) === id)) return true;
  if (VERIFIED_HINDI_GLOBAL_SERIES_IDS.has(id)) return true;
  if (VERIFIED_HINDI_KDRAMA_IDS.has(id)) return true;

  // Verified Hindi Dubbed Anime
  if (VERIFIED_HINDI_ANIME_IDS.has(id)) return true;
  if (CURATED_HINDI_DUBBED_ANIME.some((a) => Number(a.id) === id)) return true;
  if (item.category === 'anime' && (item.hasHindiDub === true || item.isHindiDubbed === true)) return true;

  // Title fallback matching for blockbusters
  const itemTitle = (item.title || item.name || item.original_title || item.original_name || '').toLowerCase().trim();
  if (itemTitle) {
    if (CURATED_HOLLYWOOD_HINDI_DUBS.some((m) => {
      const mTitle = (m.title || m.name || '').toLowerCase().trim();
      return mTitle && (itemTitle === mTitle || itemTitle.includes(mTitle) || mTitle.includes(itemTitle));
    })) return true;

    if (CURATED_HINDI_DUBBED_ANIME.some((a) => {
      const aTitle = (a.title || a.name || '').toLowerCase().trim();
      return aTitle && (itemTitle === aTitle || itemTitle.includes(aTitle) || aTitle.includes(itemTitle));
    })) return true;

    if (CURATED_BOLLYWOOD_BLOCKBUSTERS.some((b) => {
      const bTitle = (b.title || b.name || '').toLowerCase().trim();
      return bTitle && (itemTitle === bTitle || itemTitle.includes(bTitle) || bTitle.includes(itemTitle));
    })) return true;
  }

  return false;
}

export function isAnimeItem(item) {
  if (!item) return false;

  return (
    item.category === 'anime' ||
    item.category === 'ecchi_anime' ||
    item.isAnime === true ||
    item.original_language === 'ja' ||
    (Array.isArray(item.origin_country) && item.origin_country.includes('JP')) ||
    ((item.genre_ids?.includes(16) || item.genres?.some((g) => g.id === 16 || g.name === 'Animation')) && item.original_language === 'ja')
  );
}

// Strictly verified anime titles with confirmed Hindi dubs (sourced from MyDubList, AnimeWorld India & Indian TV broadcast history)
export const VERIFIED_HINDI_ANIME_IDS = new Set([
  19, 1429, 2098, 4614, 8392, 11130, 12697, 12971, 13916, 30984, 31724, 31835,
  31910, 33758, 37854, 38472, 45782, 45790, 46260, 46261, 46298, 46435, 50712, 60572,
  60708, 60846, 60862, 60863, 62110, 62710, 63926, 65733, 65930, 66941, 67070, 67800,
  69295, 70881, 73223, 73833, 75225, 75775, 76121, 78204, 80671, 80975, 81216, 82684,
  82879, 85937, 86031, 88044, 88046, 88803, 91024, 91026, 94664, 95269, 95479, 96316,
  97860, 98123, 99778, 100436, 104032, 104877, 105009, 105248, 110309, 111819, 112613, 113256,
  114410, 117061, 117933, 118439, 118821, 120089, 121533, 121792, 121964, 122587, 122826, 123249,
  127532, 128826, 131041, 131365, 133733, 136283, 137045, 138882, 139287, 139512, 153337, 153870,
  154743, 155942, 156563, 194829, 196400, 199920, 200777, 201363, 202160, 203857, 204832, 205050,
  205308, 205366, 205743, 205847, 206497, 206629, 207564, 207743, 208067, 208493, 208534, 208891,
  209867, 210879, 211089, 212766, 212963, 213181, 213331, 213402, 214310, 214540, 214547, 214587,
  214999, 216269, 216390, 217390, 217766, 220542, 220779, 221148, 222623, 222787, 222925, 222930,
  224484, 226688, 226905, 228663, 229743, 232230, 234910, 235758, 236208, 236994, 240125, 240411,
  240641, 241535, 242143, 244672, 245842, 248817, 248951, 249409, 249882, 249907, 254492, 256721,
  257790, 258055, 258348, 258912, 259786, 261091, 261148, 261298, 271609, 277222, 277881, 278043,
  278816, 280110, 282662, 284274, 284442, 287278, 293010, 298321, 372058, 378064, 503314, 568160,
  610150, 635302, 900667, 916224, 1062807
]);

export function isHindiDubbedAnime(item) {
  if (!item) return false;
  if (item.languages?.hi?.url || item.audio_hi_url) return true;
  const id = Number(item.id);
  if (VERIFIED_HINDI_ANIME_IDS.has(id)) return true;
  if (CURATED_HINDI_DUBBED_ANIME.some((a) => Number(a.id) === id)) return true;
  if (item.hasHindiDub === true || item.isHindiDubbed === true) return true;
  return false;
}



// ✨ Curated Uncut & Collector's Master Vault Anime (Exclusive Collection)

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

    "poster_path": "/gdF4ovuLeSiwla3C70CAWIupTBv.jpg",

    "backdrop_path": "/gdF4ovuLeSiwla3C70CAWIupTBv.jpg",

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

    "poster_path": "/hcukiLNn4B8GLEhnj4CKUWsW4lD.jpg",

    "backdrop_path": "/hcukiLNn4B8GLEhnj4CKUWsW4lD.jpg",

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

    "poster_path": "/s3DH6NrvtzhsrXZDe3ltSZz7W9v.jpg",

    "backdrop_path": "/s3DH6NrvtzhsrXZDe3ltSZz7W9v.jpg",

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

    "poster_path": "/shze2sB2dHDCTaPRQBUviYU3JD.jpg",

    "backdrop_path": "/shze2sB2dHDCTaPRQBUviYU3JD.jpg",

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

    "poster_path": "/qx93e6h7PJ4cKvVQ7SRwfxtfAiG.jpg",

    "backdrop_path": "/qx93e6h7PJ4cKvVQ7SRwfxtfAiG.jpg",

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

    "poster_path": "/b0d0Cc0OPMEKLXyBAkdjg6mE67g.jpg",

    "backdrop_path": "/b0d0Cc0OPMEKLXyBAkdjg6mE67g.jpg",

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

    "poster_path": "/cVC3MdCWzFkuKMpXMNXb9nIZvVC.jpg",

    "backdrop_path": "/cVC3MdCWzFkuKMpXMNXb9nIZvVC.jpg",

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

    "poster_path": "/tRdESayKEv2F21L9ZGLRhSIm1VU.jpg",

    "backdrop_path": "/tRdESayKEv2F21L9ZGLRhSIm1VU.jpg",

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

    "poster_path": "/UaV8mDNy0DQtCq6wzI9mk9qoln.jpg",

    "backdrop_path": "/UaV8mDNy0DQtCq6wzI9mk9qoln.jpg",

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

    "poster_path": "/6eAMxsasHwJAraxAg9lwPdvBAWz.jpg",

    "backdrop_path": "/6eAMxsasHwJAraxAg9lwPdvBAWz.jpg",

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

    "poster_path": "/dLv9QzzQZabT4enXjWEjF8TW1DD.jpg",

    "backdrop_path": "/dLv9QzzQZabT4enXjWEjF8TW1DD.jpg",

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

    "poster_path": "/pcXmAj5cVmbnDrm4wH2C9Ea9VDg.jpg",

    "backdrop_path": "/pcXmAj5cVmbnDrm4wH2C9Ea9VDg.jpg",

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

    "poster_path": "/tf2Je0XAPs9Q7GRVqDjpjj0Ln5b.jpg",

    "backdrop_path": "/tf2Je0XAPs9Q7GRVqDjpjj0Ln5b.jpg",

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

    "poster_path": "/qx93e6h7PJ4cKvVQ7SRwfxtfAiG.jpg",

    "backdrop_path": "/qx93e6h7PJ4cKvVQ7SRwfxtfAiG.jpg",

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

    "poster_path": "/gdF4ovuLeSiwla3C70CAWIupTBv.jpg",

    "backdrop_path": "/gdF4ovuLeSiwla3C70CAWIupTBv.jpg",

    "media_type": "tv",

    "vote_average": 7.3,

    "first_air_date": "2016-04-05",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 119853,

    "name": "Harem in the Labyrinth of Another World",

    "title": "Harem in the Labyrinth of Another World: Uncensored",

    "overview": "Michio Kaga is transported into a fantasy video-game world where he uses bonus powers to conquer labyrinths and build a devoted harem.",

    "poster_path": "/rBOnrVlck7BIlGeWVlzYiZeg4l2.jpg",

    "backdrop_path": "/rBOnrVlck7BIlGeWVlzYiZeg4l2.jpg",

    "media_type": "tv",

    "vote_average": 7.6,

    "first_air_date": "2022-07-06",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 85461,

    "name": "Why the Hell Are You Here, Teacher!?",

    "title": "Why the Hell Are You Here, Teacher!? (Uncensored)",

    "overview": "Ichirou Satou is an average high schooler who continually finds himself in shockingly erotic situations with his feared teacher Kana Kojima.",

    "poster_path": "/xJZwaZAXoon6wxkgXiWQNEeyW4C.jpg",

    "backdrop_path": "/xJZwaZAXoon6wxkgXiWQNEeyW4C.jpg",

    "media_type": "tv",

    "vote_average": 7.3,

    "first_air_date": "2019-04-08",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 93554,

    "name": "SUPER HXEROS",

    "title": "SUPER HXEROS: Uncut",

    "overview": "An alien parasite invades Earth to siphon human libido. Reto Enjou and the HxEros team harness erotic energy to defend the planet.",

    "poster_path": "/shze2sB2dHDCTaPRQBUviYU3JD.jpg",

    "backdrop_path": "/shze2sB2dHDCTaPRQBUviYU3JD.jpg",

    "media_type": "tv",

    "vote_average": 7.1,

    "first_air_date": "2020-07-04",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 138757,

    "name": "Ayakashi Triangle",

    "title": "Ayakashi Triangle: Uncensored",

    "overview": "Exorcist ninja Matsuri Kazamaki battles spirits to protect his childhood friend Suzu, but an encounter with a cat god transforms him into a girl.",

    "poster_path": "/8RtwL5gxUvh9YViqjhNlVRvJpum.jpg",

    "backdrop_path": "/8RtwL5gxUvh9YViqjhNlVRvJpum.jpg",

    "media_type": "tv",

    "vote_average": 7.2,

    "first_air_date": "2023-01-10",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 204124,

    "name": "Immoral Guild",

    "title": "Immoral Guild: Futoku no Guild (Uncut)",

    "overview": "Ace guard Kikuru Madan wishes to retire, but must train an eccentric group of female rookies who constantly find themselves tangled up by monsters.",

    "poster_path": "/AgTy5IsOv1FAx02gunir8ZSiUxG.jpg",

    "backdrop_path": "/AgTy5IsOv1FAx02gunir8ZSiUxG.jpg",

    "media_type": "tv",

    "vote_average": 7.5,

    "first_air_date": "2022-10-05",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 221856,

    "name": "Gushing over Magical Girls",

    "title": "Gushing over Magical Girls (Uncut)",

    "overview": "Hiiragi Utena is a shy middle-school girl who adores magical girls, but is unexpectedly transformed into a villainess with sadistic dominance powers.",

    "poster_path": "/dqZENchTd7lp5zht7BdlqM7RBhD.jpg",

    "backdrop_path": "/dqZENchTd7lp5zht7BdlqM7RBhD.jpg",

    "media_type": "tv",

    "vote_average": 8.1,

    "first_air_date": "2024-01-03",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 138760,

    "name": "Chained Soldier",

    "title": "Chained Soldier: Mato Seihei no Slave",

    "overview": "Mysterious portals reveal the demon realm Mato where peaches grant supernatural abilities exclusively to women. Yuuki becomes the servant slave of Captain Kyouka.",

    "poster_path": "/5a9vaaLDAZTYjgfWIw7ZYhL1m1A.jpg",

    "backdrop_path": "/5a9vaaLDAZTYjgfWIw7ZYhL1m1A.jpg",

    "media_type": "tv",

    "vote_average": 7.7,

    "first_air_date": "2024-01-04",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 34484,

    "name": "To Love Ru",

    "title": "To Love Ru: Complete Uncut",

    "overview": "Rito Yuuki is a high school student whose ordinary life is upended when Lala Satalin Deviluke, a glamorous alien princess, teleports directly into his bathtub.",

    "poster_path": "/upxgNd7JdqbxUXDuEkgba18iG8F.jpg",

    "backdrop_path": "/upxgNd7JdqbxUXDuEkgba18iG8F.jpg",

    "media_type": "tv",

    "vote_average": 7.6,

    "first_air_date": "2008-04-04",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 45749,

    "name": "To Love Ru Darkness",

    "title": "To Love Ru Darkness: Uncensored",

    "overview": "Lala's younger sister Momo initiates 'Operation Harem' to make Rito happy with an ensemble of alluring maidens while assassin Golden Darkness faces her past.",

    "poster_path": "/7x8x6dl4leOSw6KGUcOrQew7Eua.jpg",

    "backdrop_path": "/7x8x6dl4leOSw6KGUcOrQew7Eua.jpg",

    "media_type": "tv",

    "vote_average": 7.8,

    "first_air_date": "2012-10-06",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 61793,

    "name": "Trinity Seven",

    "title": "Trinity Seven: The Seven Magicians",

    "overview": "A mysterious phenomenon causes the sun to turn black and destroys Kasuga Arata's town. To rescue his cousin, Arata enrolls in the Royal Biblia Academy.",

    "poster_path": "/rbETzzJLGIB2Bg6NwNekWTKfM6d.jpg",

    "backdrop_path": "/rbETzzJLGIB2Bg6NwNekWTKfM6d.jpg",

    "media_type": "tv",

    "vote_average": 7.4,

    "first_air_date": "2014-10-08",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 46518,

    "name": "Date A Live",

    "title": "Date A Live: Uncut",

    "overview": "Spatial quakes ravage Eurasia caused by extra-dimensional Spirits. Shido Itsuka discovers the only way to neutralize their destructive powers is to make them fall in love with him.",

    "poster_path": "/yHUDRf2e9FGeWXPsT5lVF3iCUwc.jpg",

    "backdrop_path": "/yHUDRf2e9FGeWXPsT5lVF3iCUwc.jpg",

    "media_type": "tv",

    "vote_average": 7.8,

    "first_air_date": "2013-04-06",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 34524,

    "name": "Highschool of the Dead",

    "title": "Highschool of the Dead: Drifters of the Dead",

    "overview": "A sudden worldwide zombie pandemic erupts. Takashi Komuro and fellow high school survivors battle their way through hordes of infected across Japan.",

    "poster_path": "/tqtd72674k19IfGYJ2wdGJGvXX.jpg",

    "backdrop_path": "/tqtd72674k19IfGYJ2wdGJGvXX.jpg",

    "media_type": "tv",

    "vote_average": 7.7,

    "first_air_date": "2010-07-05",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 68205,

    "name": "Keijo!!!!!!!!",

    "title": "Keijo!!!!!!!! (Uncensored)",

    "overview": "Keijo is an exhilarating competitive sport where female athletes stand on floating water platforms and compete using only their hips and chest.",

    "poster_path": "/9T7TT0w92RbeRP5QSnNq81HHxde.jpg",

    "backdrop_path": "/9T7TT0w92RbeRP5QSnNq81HHxde.jpg",

    "media_type": "tv",

    "vote_average": 7.3,

    "first_air_date": "2016-10-06",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {

    "id": 82883,

    "name": "Domestic Girlfriend",

    "title": "Domestic Girlfriend: Uncut",

    "overview": "Natsuo Fujii is secretly in love with his cheerful high school teacher Hina. After an unexpected encounter with Rui, his father remarries, bringing both sisters into his home.",

    "poster_path": "/7S86pkMfatspJmXENcPZfgaKB33.jpg",

    "backdrop_path": "/7S86pkMfatspJmXENcPZfgaKB33.jpg",

    "media_type": "tv",

    "vote_average": 7.4,

    "first_air_date": "2019-01-12",

    "category": "ecchi_anime",

    "is_mature": true

  },

  {
    "id": 126646,
    "name": "Isaku Respect",
    "title": "Isaku Respect",
    "overview": "A dark suspense OVA where trapped victims in a mysterious mansion must survive twisted games and traps set by the enigmatic Isaku.",
    "poster_path": "/6czmCM6tty2odD9oc2zgTo1hbye.jpg",
    "backdrop_path": "/6czmCM6tty2odD9oc2zgTo1hbye.jpg",
    "media_type": "tv",
    "vote_average": 6.0,
    "first_air_date": "2001-02-23",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 156062,
    "name": "Futari Ecchi",
    "title": "Futari Ecchi",
    "overview": "A newly married couple navigates the complexities of intimacy and relationships. Based on the long-running manga by Katsu Aki.",
    "poster_path": "/urLDGPMVlihzMrYJgFySEpLRQZV.jpg",
    "backdrop_path": "/urLDGPMVlihzMrYJgFySEpLRQZV.jpg",
    "media_type": "tv",
    "vote_average": 3.2,
    "first_air_date": "2011-07-29",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 323990,
    "name": "Are the Sexy Buttocks Not Good?",
    "title": "Are the Sexy Buttocks Not Good?",
    "overview": "A chance rescue reunites a college student with his company's CEO, where an unlikely workplace romance begins to bloom.",
    "poster_path": "/82kmYM4Q6YtBrWjHu8563Oljyz4.jpg",
    "backdrop_path": "/gYk01PhjOAGbd4vXeQwcZMSCgmA.jpg",
    "media_type": "tv",
    "vote_average": 6.6,
    "first_air_date": "2026-07-07",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 287973,
    "name": "Ren Arisugawa Is Actually a Girl",
    "title": "Ren Arisugawa Is Actually a Girl",
    "overview": "Kyohei's only brush with fame is being the cousin of Japan's hottest male celebrity, Ren Arisugawa. When he discovers Ren's secret, their lives take an unexpected turn.",
    "poster_path": "/m9d3D1U9bdzV4vCHvr2PkdCW92z.jpg",
    "backdrop_path": "/eu87J5S0N8YpcdL3sl0ltxpXfog.jpg",
    "media_type": "tv",
    "vote_average": 5.0,
    "first_air_date": "2026-01-05",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 127414,
    "name": "Watashitachi Tetsuincho Hajimemasu",
    "title": "Watashitachi Tetsuincho Hajimemasu",
    "overview": "An intimate slice-of-life following two people as they start keeping a couples' notebook, exploring their deepening relationship.",
    "poster_path": "/35sV8pTlyAkhaaWCWdZ6XaTQWzx.jpg",
    "backdrop_path": "/w0ZNZbiaQnz5tv2s4q0SL3bNc5z.jpg",
    "media_type": "tv",
    "vote_average": 10.0,
    "first_air_date": "2021-06-12",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 60073,
    "name": "To LOVE-Ru Darkness",
    "title": "To LOVE-Ru Darkness",
    "overview": "The sequel to To LOVE-Ru follows Rito Yuuki as he becomes further entangled in romantic chaos with alien princesses and assassins.",
    "poster_path": "/A6W4rfVYHnYCPqrHcN7D1KNXBnM.jpg",
    "backdrop_path": "/A6W4rfVYHnYCPqrHcN7D1KNXBnM.jpg",
    "media_type": "tv",
    "vote_average": 7.5,
    "first_air_date": "2012-10-06",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 46262,
    "name": "Rosario + Vampire",
    "title": "Rosario + Vampire",
    "overview": "Average student Tsukune Aono accidentally enrolls in a school for monsters, where he meets the beautiful vampire Moka Akashiya.",
    "poster_path": "/eTTJHJdBq9Yd9NyYYeUXYVxoSXw.jpg",
    "backdrop_path": "/eTTJHJdBq9Yd9NyYYeUXYVxoSXw.jpg",
    "media_type": "tv",
    "vote_average": 7.2,
    "first_air_date": "2008-01-03",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 62745,
    "name": "Is It Wrong to Try to Pick Up Girls in a Dungeon?",
    "title": "Is It Wrong to Try to Pick Up Girls in a Dungeon?",
    "overview": "In a world where gods and goddesses live among mortals, young adventurer Bell Cranel seeks to become the greatest hero in the dungeon city of Orario.",
    "poster_path": "/h97iHupymkJXBv0gyr4qlePhKAk.jpg",
    "backdrop_path": "/xHzLhMzsAg3OcrfyZlYMmRTfCJC.jpg",
    "media_type": "tv",
    "vote_average": 7.3,
    "first_air_date": "2015-04-04",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 62196,
    "name": "Food Wars! Shokugeki no Soma",
    "title": "Food Wars! Shokugeki no Soma",
    "overview": "Soma Yukihira enrolls in an elite culinary school where intense cooking battles determine the best chefs, with provocative foodgasm reactions.",
    "poster_path": "/ydVBGFHLxZKQvvQp1xXyNAgLzfh.jpg",
    "backdrop_path": "/ydVBGFHLxZKQvvQp1xXyNAgLzfh.jpg",
    "media_type": "tv",
    "vote_average": 8.3,
    "first_air_date": "2015-04-04",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 61737,
    "name": "Monster Musume: Everyday Life with Monster Girls",
    "title": "Monster Musume",
    "overview": "When mythological creatures are integrated into human society, a young man becomes host to a group of exotic monster girls who all compete for his affection.",
    "poster_path": "/ntmRgQGPfTk7XHwJSj1ZLTB23Bx.jpg",
    "backdrop_path": "/ntmRgQGPfTk7XHwJSj1ZLTB23Bx.jpg",
    "media_type": "tv",
    "vote_average": 7.0,
    "first_air_date": "2015-07-08",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 62104,
    "name": "The Seven Deadly Sins",
    "title": "The Seven Deadly Sins",
    "overview": "Princess Elizabeth searches for the legendary Seven Deadly Sins, a group of disgraced knights, to save her kingdom from tyranny.",
    "poster_path": "/gxTojpKEOtue85EEFlozwRbDXwJ.jpg",
    "backdrop_path": "/cmziOVMQrqvVfrjjQdadMdi2bGL.jpg",
    "media_type": "tv",
    "vote_average": 8.4,
    "first_air_date": "2014-10-05",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 65733,
    "name": "No Game No Life",
    "title": "No Game No Life",
    "overview": "Genius gamer siblings Sora and Shiro are transported to a world where everything is decided by games. Ecchi-comedy meets fantasy strategy.",
    "poster_path": "/iemzePkSzDiloraM6VzHIzPnExl.jpg",
    "backdrop_path": "/iemzePkSzDiloraM6VzHIzPnExl.jpg",
    "media_type": "tv",
    "vote_average": 8.2,
    "first_air_date": "2014-04-09",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 72636,
    "name": "Nande Koko ni Sensei ga!?",
    "title": "Why the Hell are You Here, Teacher!?",
    "overview": "Through a series of impossible coincidences, a high school student keeps ending up in compromising situations with his strict teacher.",
    "poster_path": "/mOPXABwLAmEUlI9e0N3cFkwrw42.jpg",
    "backdrop_path": "/mOPXABwLAmEUlI9e0N3cFkwrw42.jpg",
    "media_type": "tv",
    "vote_average": 6.8,
    "first_air_date": "2019-04-08",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 87456,
    "name": "Peter Grill and the Philosopher's Time",
    "title": "Peter Grill and the Philosopher's Time",
    "overview": "Peter Grill wins a fighting tournament and is declared the strongest man in the world, but now every female monster wants to bear his children.",
    "poster_path": "/d23b6il78EoNIuCZcL7CcEg7T06.jpg",
    "backdrop_path": "/d23b6il78EoNIuCZcL7CcEg7T06.jpg",
    "media_type": "tv",
    "vote_average": 6.0,
    "first_air_date": "2020-07-11",
    "category": "ecchi_anime",
    "is_mature": true
  },

  {
    "id": 209857,
    "name": "Harem in the Labyrinth of Another World",
    "title": "Harem in the Labyrinth of Another World",
    "overview": "Michio Kaga is transported to a fantasy world where he explores dungeons and builds a harem of beautiful companions. Uncensored fantasy action.",
    "poster_path": "/cQKbqEuOHpMO0kgbiZOAG35pr2W.jpg",
    "backdrop_path": "/cQKbqEuOHpMO0kgbiZOAG35pr2W.jpg",
    "media_type": "tv",
    "vote_average": 6.4,
    "first_air_date": "2022-07-06",
    "category": "ecchi_anime",
    "is_mature": true
  }

,
{
  "id": 94820,
  "name": "Drop Out",
  "title": "Drop Out",
  "overview": "Four rebellious high school girls get caught skipping class by their teacher. What begins as an interrogation quickly turns into an intense, forbidden after-school encounter.",
  "poster_path": "/4NRBKA8qVzCvuD3WeLieiLGmIjm.jpg",
  "backdrop_path": "/4NRBKA8qVzCvuD3WeLieiLGmIjm.jpg",
  "media_type": "tv",
  "vote_average": 8,
  "first_air_date": "2012-05-18",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 61845,
  "name": "Euphoria",
  "title": "Euphoria",
  "overview": "High school student Keisuke awakens in a bizarre white room with several female classmates. A mysterious voice informs them that they must complete sadistic tasks to survive.",
  "poster_path": "/8RtwL5gxUvh9YViqjhNlVRvJpum.jpg",
  "backdrop_path": "/4NRBKA8qVzCvuD3WeLieiLGmIjm.jpg",
  "media_type": "tv",
  "vote_average": 7.8,
  "first_air_date": "2011-12-22",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 35012,
  "name": "Night Shift Nurses",
  "title": "Night Shift Nurses",
  "overview": "At a prestigious metropolitan clinic, chief doctor Hiroyuki begins an illicit reign of dominance over the nursing staff in an intricate web of hospital secrets.",
  "poster_path": "/7x8x6dl4leOSw6KGUcOrQew7Eua.jpg",
  "backdrop_path": "/AgTy5IsOv1FAx02gunir8ZSiUxG.jpg",
  "media_type": "tv",
  "vote_average": 7.9,
  "first_air_date": "2000-03-25",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 80922,
  "name": "Mankitsu Happening",
  "title": "Mankitsu Happening",
  "overview": "Rei visits an internet comic cafe for peace and quiet, but ends up encountering several attractive women who take advantage of the private booths for uninhibited pleasure.",
  "poster_path": "/upxgNd7JdqbxUXDuEkgba18iG8F.jpg",
  "backdrop_path": "/jxBUmVXcrkMLCjyzCOhHMmZ5qqO.jpg",
  "media_type": "tv",
  "vote_average": 8.6,
  "first_air_date": "2015-05-29",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 63102,
  "name": "Taimanin Asagi",
  "title": "Taimanin Asagi",
  "overview": "In near-future Tokyo infested with demonic syndicates, the shadow ninja master Asagi Igawa battles against criminal underworld overlords.",
  "poster_path": "/rbETzzJLGIB2Bg6NwNekWTKfM6d.jpg",
  "backdrop_path": "/5Akyn19AM9flDDUN7pMUdzA9dWD.jpg",
  "media_type": "tv",
  "vote_average": 7.7,
  "first_air_date": "2007-09-28",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 41203,
  "name": "Discipline",
  "title": "Discipline",
  "overview": "Transferred to the elite Saint Divalia Academy, Takuro finds himself caught between the corrupt student council and strict discipline committee.",
  "poster_path": "/ydpL1rKDmIiTfCGD8gNQrUluA5g.jpg",
  "backdrop_path": "/tccHdpmHoL7U0N9s8amDqilUShr.jpg",
  "media_type": "tv",
  "vote_average": 8.1,
  "first_air_date": "2003-08-25",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 68112,
  "name": "Oni Chichi",
  "title": "Oni Chichi",
  "overview": "Kenji Akagi remarries into a family with two rebellious stepdaughters, Airi and Marina, and sets out to discipline them in the most unconventional ways.",
  "poster_path": "/ueI9EeoRdMVa7hWEm21nQEU8Zv3.jpg",
  "backdrop_path": "/4kQiFnWtwndtCyKMszVJNPEE1kY.jpg",
  "media_type": "tv",
  "vote_average": 8.4,
  "first_air_date": "2009-11-27",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 64208,
  "name": "Resort Boin",
  "title": "Resort Boin",
  "overview": "Kousuke takes a summer job as an assistant swimming instructor at a tropical luxury resort filled with voluptuous guests and instructors.",
  "poster_path": "/hK2xyIPdTD3cGgjxnebjRiueqCQ.jpg",
  "backdrop_path": "/m4Ub1bgSLNlVeKKX1sXjxQRIv2g.jpg",
  "media_type": "tv",
  "vote_average": 7.9,
  "first_air_date": "2007-12-21",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 76110,
  "name": "Master Piece",
  "title": "Master Piece",
  "overview": "Two sisters and their childhood friend navigate passion and mutual affection during an unforgettable summer vacation.",
  "poster_path": "/ypjJNB2AZ8bffNULuWKwpYUoxC1.jpg",
  "backdrop_path": "/yARqByzW4paZU6vrwrfuj1N4th4.jpg",
  "media_type": "tv",
  "vote_average": 8.2,
  "first_air_date": "2013-11-29",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 71203,
  "name": "Rance: The Quest for Hikari",
  "title": "Rance: The Quest for Hikari",
  "overview": "The brash warrior Rance and his loyal slave Sill are hired to find the missing daughter of a wealthy noble in the city of Custom.",
  "poster_path": "/h3OE30FudEPEhNMpbmcHt0ELD6s.jpg",
  "backdrop_path": "/k3IS8oN9WzN1JQqB5dyZMmtb90n.jpg",
  "media_type": "tv",
  "vote_average": 8,
  "first_air_date": "2014-12-26",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 78912,
  "name": "Gakuen de Jikan yo Tomare",
  "title": "Gakuen de Jikan yo Tomare",
  "overview": "A bullied student obtains a magical stopwatch that can freeze time itself, allowing him unrestricted freedom across his high school campus.",
  "poster_path": "/p7vWZL5HhbscGf7OjnprT2977Lt.jpg",
  "backdrop_path": "/dvIguIZqqQKCt7YiKq7evfk5NW3.jpg",
  "media_type": "tv",
  "vote_average": 7.8,
  "first_air_date": "2015-08-28",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 83451,
  "name": "Ane Wa Yanmama Junyuu-chuu",
  "title": "Ane Wa Yanmama Junyuu-chuu",
  "overview": "Shouta visits his older sister who has recently become a young mother, only to find old family bonds growing into something far more intimate.",
  "poster_path": "/drAnsk5w2PX5x3ooPv7I2xr3ksq.jpg",
  "backdrop_path": "/k4jj6KGcxQzo26PSjfAdQguUTfN.jpg",
  "media_type": "tv",
  "vote_average": 7.6,
  "first_air_date": "2016-12-23",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 65991,
  "name": "Kuroinu: Kedakaki Seijo wa Hakudaku ni Somaru",
  "title": "Kuroinu: Kedakaki Seijo wa Hakudaku ni Somaru",
  "overview": "The mercenary group Black Dog captures a holy kingdom, holding its noble knights and priestesses captive in dark fantasy warfare.",
  "poster_path": "/ySLpzqCWSCacm9bDhLL6r2XG0Zi.jpg",
  "backdrop_path": "/cvHprU1PKJ4TMl8OHpPvS6jFLQI.jpg",
  "media_type": "tv",
  "vote_average": 8.3,
  "first_air_date": "2012-01-27",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 79124,
  "name": "Futabu!",
  "title": "Futabu!",
  "overview": "High school transfer student Yuu enters the mysterious club known as Futabu, where students explore rare physical traits and unspoken desires.",
  "poster_path": "/4yrW5uBgcx7GSehJotlxWjAD0NQ.jpg",
  "backdrop_path": "/dXGaX995fsbiqJgFRj0CEJKxZVV.jpg",
  "media_type": "tv",
  "vote_average": 7.9,
  "first_air_date": "2013-09-27",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 73491,
  "name": "Kyonyuu Fantasy",
  "title": "Kyonyuu Fantasy",
  "overview": "A scholar without combat prowess finds himself in a legendary fantasy kingdom where cunning wit and seduction rule above brute force.",
  "poster_path": "/sQi05fGIosyEu51AHg9nSgipmhN.jpg",
  "backdrop_path": "/porr8fbCNEth5B2t6f5L2YfZc2C.jpg",
  "media_type": "tv",
  "vote_average": 8.1,
  "first_air_date": "2013-03-29",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 84120,
  "name": "Boku to Joi no Shinsatsu Nisshi",
  "title": "Boku to Joi no Shinsatsu Nisshi",
  "overview": "A medical intern is assigned to assist an eccentric female physician whose private checkup examinations break every conventional medical boundary.",
  "poster_path": "/6hEpqMPUxDcV3ljeCHgJoVY5U2d.jpg",
  "backdrop_path": "/grratqdn77FtFAlX6WgYbVtCBNE.jpg",
  "media_type": "tv",
  "vote_average": 7.7,
  "first_air_date": "2018-06-29",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 46129,
  "name": "Princess Lover! OVA",
  "title": "Princess Lover! OVA",
  "overview": "Teppei Arima enters elite high society and spends passionate uninhibited moments with the wealthy heirresses Sylvia and Charlotte.",
  "poster_path": "/zAdiOfxntBDbY3GSr17Q8vUQxE6.jpg",
  "backdrop_path": "/mJFWew7KYwA9q3xQAj5gf7gnukA.jpg",
  "media_type": "tv",
  "vote_average": 7.5,
  "first_air_date": "2010-10-22",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 87114,
  "name": "Ane Shiru: The Animation",
  "title": "Ane Shiru: The Animation",
  "overview": "A younger brother discovers his older sister secret diary detailing her hidden feelings for him, leading to private confessions at home.",
  "poster_path": "/vsWNCisRhrBbUaTR56qCk6pLsEn.jpg",
  "backdrop_path": "/61vXR9xfgNqidYkBruRXhRTlVzI.jpg",
  "media_type": "tv",
  "vote_average": 7.8,
  "first_air_date": "2014-06-20",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 69112,
  "name": "Eroge! H mo Game mo Kaihatsu Zanmai",
  "title": "Eroge! H mo Game mo Kaihatsu Zanmai",
  "overview": "At an indie visual novel game developer studio, staff members test real-life romance scenarios to gain inspiration for their latest game release.",
  "poster_path": "/8leXiwIwPRPQqHXKDhqgf4OIwBU.jpg",
  "backdrop_path": "/xDsBN1jJt2s4yswvcV82vV3Ib5d.jpg",
  "media_type": "tv",
  "vote_average": 8.5,
  "first_air_date": "2011-05-27",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 32104,
  "name": "Bible Black",
  "title": "Bible Black",
  "overview": "High school student Minase uncovers an occult book in the school old basement, granting ancient dark powers over his classmates and faculty.",
  "poster_path": "/1rPzcfNY4E8mEJrytjw1XeJTtVS.jpg",
  "backdrop_path": "/kDssH6sbp3cL3qogtTBLp7s9g63.jpg",
  "media_type": "tv",
  "vote_average": 8,
  "first_air_date": "2001-07-15",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 97812,
  "name": "Youkoso! Sukebe Elf no Mori e",
  "title": "Youkoso! Sukebe Elf no Mori e",
  "overview": "A traveler wanders into an enchanted forest inhabited by elves who have developed extremely hospitable and seductive traditions toward human visitors.",
  "poster_path": "/bjBHuTjC7KAGSAfeYY5q0q8ZcWn.jpg",
  "backdrop_path": "/iAxGl74HyzF52JDpuWg90tAThgY.jpg",
  "media_type": "tv",
  "vote_average": 8.3,
  "first_air_date": "2019-03-29",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 108912,
  "name": "Isekai Harem Monogatari",
  "title": "Isekai Harem Monogatari",
  "overview": "A young man reincarnated into a fantasy realm with overwhelming physical prowess forms his own guild and harem of elf, demon, and human companions.",
  "poster_path": "/eO4z0x1NPO0L6Spke6PHbqkKxFk.jpg",
  "backdrop_path": "/zwU5YOrOIGJrDF5ZEUtbAOxY15q.jpg",
  "media_type": "tv",
  "vote_average": 8.5,
  "first_air_date": "2020-04-10",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 74211,
  "name": "Valkyrie Drive: Mermaid",
  "title": "Valkyrie Drive: Mermaid",
  "overview": "After being transferred to the artificial Mermaid island, Mamori Tokonome discovers she is an 'Extar' who transforms into a lethal weapon when aroused by her partner Mirei Shikishima.",
  "poster_path": "/9GqN8c6m9gA1w3y2z4k5j6l7.jpg",
  "backdrop_path": "/0HrO9d7n0hB2x4z3a5l6k7m8.jpg",
  "media_type": "tv",
  "vote_average": 7.6,
  "first_air_date": "2015-10-10",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 34503,
  "name": "Highschool of the Dead",
  "title": "Highschool of the Dead",
  "overview": "When an apocalyptic zombie infection strikes Japan, high schooler Takashi Komuro unites with beautiful classmates and an armed nurse to escape the deadly chaos in style.",
  "poster_path": "/1Fz78G8m5h1L9f4Z2y3X7w8.jpg",
  "backdrop_path": "/2Gy89H9n6j2M0g5A3z4Y8x9.jpg",
  "media_type": "tv",
  "vote_average": 7.8,
  "first_air_date": "2010-07-05",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 45786,
  "name": "To Love-Ru Darkness",
  "title": "To Love-Ru Darkness",
  "overview": "Alien assassin Golden Darkness targets Rito Yuuki while Momo Deviluke plots to construct an all-inclusive harem to ensure Rito's happiness.",
  "poster_path": "/3Hb80J0k7l3N1h6B4a5Z9y0.jpg",
  "backdrop_path": "/4Ic91K1l8m4O2j7C5b6A0z1.jpg",
  "media_type": "tv",
  "vote_average": 7.7,
  "first_air_date": "2012-10-06",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 61858,
  "name": "The Testament of Sister New Devil",
  "title": "The Testament of Sister New Devil",
  "overview": "Basara Toujou's eccentric father remarries and leaves him with two stepsisters who are secretly the heir to the Demon Lord and a succubus guardian.",
  "poster_path": "/5Jd02L2m9n5P3k8D6c7B1a2.jpg",
  "backdrop_path": "/6Ke13M3n0o6Q4l9E7d8C2b3.jpg",
  "media_type": "tv",
  "vote_average": 7.5,
  "first_air_date": "2015-01-08",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 31737,
  "name": "Kiss x Sis",
  "title": "Kiss x Sis",
  "overview": "Keita Suminoe struggles to focus on his high school entrance exams while his non-blood-related twin stepsisters Kako and Riko relentlessly compete for his affection.",
  "poster_path": "/7Lf24N4o1p7R5m0F8e9D3c4.jpg",
  "backdrop_path": "/8Mg35O5p2q8S6n1G9f0E4d5.jpg",
  "media_type": "tv",
  "vote_average": 7.3,
  "first_air_date": "2010-04-05",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 35194,
  "name": "Yosuga no Sora",
  "title": "Yosuga no Sora",
  "overview": "Following the tragic loss of their parents, twin siblings Haruka and Sora Kasugano move to their rural grandparents' residence where complex and taboo emotions blossom.",
  "poster_path": "/9Nh46P6q3r9T7o2H0g1F5e6.jpg",
  "backdrop_path": "/0Oi57Q7r4s0U8p3I1h2G6f7.jpg",
  "media_type": "tv",
  "vote_average": 7.4,
  "first_air_date": "2010-10-04",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 37490,
  "name": "Aki Sora",
  "title": "Aki Sora",
  "overview": "High school student Sora Aoi navigates an intense secret intimacy with his elder sister Aki behind their family's back in their private apartment.",
  "poster_path": "/1Pj68R8s5t1V9q4J2i3H7g8.jpg",
  "backdrop_path": "/2Qk79S9t6u2W0r5K3j4I8h9.jpg",
  "media_type": "tv",
  "vote_average": 7.1,
  "first_air_date": "2009-12-18",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 31835,
  "name": "The Qwaser of Stigmata",
  "title": "The Qwaser of Stigmata",
  "overview": "Sasha, an alchemist from the Russian Orthodox Church, channels supernatural combat abilities by absorbing 'Soma' essence from beautiful young women at St. Mikhailov Academy.",
  "poster_path": "/3Rl80T0u7v3X1s6L4k5J9i0.jpg",
  "backdrop_path": "/4Sm91U1v8w4Y2t7M5l6K0j1.jpg",
  "media_type": "tv",
  "vote_average": 7.2,
  "first_air_date": "2010-01-10",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 63333,
  "name": "Monster Musume: Everyday Life with Monster Girls",
  "title": "Monster Musume: Everyday Life with Monster Girls",
  "overview": "Kimihito Kurusu accidentally becomes a volunteer host in the Interspecies Cultural Exchange program, living with an alluring lamia, centaur, harpy, and other monster ladies.",
  "poster_path": "/5Tn02V2w9x5Z3u8N6m7L1k2.jpg",
  "backdrop_path": "/6Uo13W3x0y6A4v9O7n8M2l3.jpg",
  "media_type": "tv",
  "vote_average": 7.7,
  "first_air_date": "2015-07-08",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 63174,
  "name": "Prison School",
  "title": "Prison School",
  "overview": "The all-girls Hachimitsu Academy admits five boys for the first time. After caught peeping at the girls' baths, they are sentenced to a month in the school's strict underground prison.",
  "poster_path": "/7Vp24X4y1z7B5w0P8o9N3m4.jpg",
  "backdrop_path": "/8Wq35Y5z2a8C6x1Q9p0O4n5.jpg",
  "media_type": "tv",
  "vote_average": 8.1,
  "first_air_date": "2015-07-11",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 93533,
  "name": "Peter Grill and the Philosopher's Time",
  "title": "Peter Grill and the Philosopher's Time",
  "overview": "Crowned the strongest warrior in the kingdom, Peter Grill just wants to marry his beloved fiancé, but monster maidens of all races continuously ambush him to bear his superior heirs.",
  "poster_path": "/9Xr46Z6a3b9D7y2R0q1P5o6.jpg",
  "backdrop_path": "/0Ys57A7b4c0E8z3S1r2Q6p7.jpg",
  "media_type": "tv",
  "vote_average": 6.9,
  "first_air_date": "2020-07-11",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 94877,
  "name": "Interspecies Reviewers",
  "title": "Interspecies Reviewers",
  "overview": "Stunner adventurer Stunk and elf Zel journey across a vibrant fantasy realm, visiting exotic succubus establishments and compiling reviews on the merits of different species.",
  "poster_path": "/1Zt68B8c5d1F9a4T2s3R7q8.jpg",
  "backdrop_path": "/2Au79C9d6e2G0b5U3t4S8r9.jpg",
  "media_type": "tv",
  "vote_average": 7.9,
  "first_air_date": "2020-01-11",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 63234,
  "name": "Shimoneta: A Boring World Where the Concept of Dirty Jokes Doesn't Exist",
  "title": "Shimoneta: A Boring World Where the Concept of Dirty Jokes Doesn't Exist",
  "overview": "In a dystopian Japan where all vulgar humor is banned by state surveillance collars, Tanukichi Okuma is coerced into joining an underground erotic rebellion squad known as SOX.",
  "poster_path": "/3Bv80D0e7f3H1c6V4u5T9s0.jpg",
  "backdrop_path": "/4Cw91E1f8g4I2d7W5v6U0t1.jpg",
  "media_type": "tv",
  "vote_average": 7.6,
  "first_air_date": "2015-07-04",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 17295,
  "name": "Golden Boy",
  "title": "Golden Boy",
  "overview": "Twenty-five-year-old Kintaro Oe traverses Japan on his trusty bicycle 'Mikazuki 5', taking odd jobs, learning lessons about life, and encountering captivating women.",
  "poster_path": "/5Dx02F2g9h5J3e8X6w7V1u2.jpg",
  "backdrop_path": "/6Ey13G3h0i6K4f9Y7x8W2v3.jpg",
  "media_type": "tv",
  "vote_average": 8.3,
  "first_air_date": "1995-10-27",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 18451,
  "name": "Green Green",
  "title": "Green Green",
  "overview": "An isolated all-boys boarding school nestled deep in the countryside is suddenly merged with an all-girls academy for a trial co-ed month, sparking comedic romance.",
  "poster_path": "/7Fz24H4i1j7L5g0Z8y9X3w4.jpg",
  "backdrop_path": "/8Ga35I5j2k8M6h1A9z0Y4x5.jpg",
  "media_type": "tv",
  "vote_average": 6.8,
  "first_air_date": "2003-07-13",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99101,
  "name": "Kanojo x Kanojo x Kanojo",
  "title": "Kanojo x Kanojo x Kanojo",
  "overview": "A summer vacation at a tranquil seaside resort turns into a passionate whirlwind when three dazzling sisters invite a fortunate young traveler to their private villa.",
  "poster_path": "/9Ib46K6l3m9O7j2C0b1A5z6.jpg",
  "backdrop_path": "/0Jc57L7m4n0P8k3D1c2B6a7.jpg",
  "media_type": "tv",
  "vote_average": 8.4,
  "first_air_date": "2009-12-25",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99102,
  "name": "Shoujo Sect: Innocent Lovers",
  "title": "Shoujo Sect: Innocent Lovers",
  "overview": "Childhood companions Shinobu and Misao reunite in high school, discovering that childhood promises of love have evolved into deep, heartfelt romantic desires.",
  "poster_path": "/1Kd68M8n5o1Q9l4E2d3C7b8.jpg",
  "backdrop_path": "/2Le79N9o6p2R0m5F3e4D8c9.jpg",
  "media_type": "tv",
  "vote_average": 7.9,
  "first_air_date": "2008-07-25",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99103,
  "name": "Sono Hanabira ni Kuchizuke o",
  "title": "Sono Hanabira ni Kuchizuke o",
  "overview": "At the prestigious St. Michael's Girls' Academy, shy Nanami and extroverted student council leader Yuna explore their blossoming bond through delicate romance.",
  "poster_path": "/3Mf80O0p7q3S1n6G4f5E9d0.jpg",
  "backdrop_path": "/4Ng91P1q8r4T2o7H5g6F0e1.jpg",
  "media_type": "tv",
  "vote_average": 8.2,
  "first_air_date": "2010-07-30",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99104,
  "name": "Princess Lover! OVA",
  "title": "Princess Lover! OVA",
  "overview": "Teppei Arima enters the lavish upper-crust world of aristocracy, where elegant noblewomen Sylvia and Charlotte compete for his undivided romantic attention.",
  "poster_path": "/5Oh02Q2r9s5U3p8I6h7G1f2.jpg",
  "backdrop_path": "/6Pi13R3s0t6V4q9J7i8H2g3.jpg",
  "media_type": "tv",
  "vote_average": 8.0,
  "first_air_date": "2010-09-24",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99105,
  "name": "Kyonyuu Fantasy",
  "title": "Kyonyuu Fantasy",
  "overview": "Lute, an unassuming scholar in a mythical realm, uses his vast wit and unexpected luck to navigate political court intrigue and win the hearts of regal sorceresses.",
  "poster_path": "/7Qj24S4t1u7W5r0K8j9I3h4.jpg",
  "backdrop_path": "/8Rk35T5u2v8X6s1L9k0J4i5.jpg",
  "media_type": "tv",
  "vote_average": 8.1,
  "first_air_date": "2012-07-20",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99106,
  "name": "Tsumamigui",
  "title": "Tsumamigui",
  "overview": "A passionate drama following a charming youth whose everyday encounters with charismatic neighborhood women turn into captivating romantic trysts.",
  "poster_path": "/9Sl46U6v3w9Y7t2M0l1K5j6.jpg",
  "backdrop_path": "/0Tm57V7w4x0Z8u3N1m2L6k7.jpg",
  "media_type": "tv",
  "vote_average": 7.8,
  "first_air_date": "2003-08-22",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99107,
  "name": "Boku no Pico",
  "title": "Boku no Pico",
  "overview": "During a warm summer vacation, Tamotsu meets the energetic youth Pico at a local coffee shop, beginning an unforgettable and renowned summer journey together.",
  "poster_path": "/1Un68W8x5y1A9v4O2n3M7l8.jpg",
  "backdrop_path": "/2Vo79X9y6z2B0w5P3o4N8m9.jpg",
  "media_type": "tv",
  "vote_average": 6.5,
  "first_air_date": "2006-09-07",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99108,
  "name": "Resonance",
  "title": "Resonance",
  "overview": "A sci-fi romantic odyssey set in a high-tech academy where neural synchronizations unleash repressed passions between star pupils.",
  "poster_path": "/3Wp80Y0z7a3C1x6Q4p5O9n0.jpg",
  "backdrop_path": "/4Xq91Z1a8b4D2y7R5q6P0o1.jpg",
  "media_type": "tv",
  "vote_average": 7.7,
  "first_air_date": "2018-04-13",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99109,
  "name": "Brand New School Day",
  "title": "Brand New School Day",
  "overview": "On the opening day of high school, unexpected classroom seating arrangements place an aspiring artist directly beside the campus's most popular student.",
  "poster_path": "/5Yr02A2b9c5E3z8S6r7Q1p2.jpg",
  "backdrop_path": "/6Zs13B3c0d6F4a9T7s8R2q3.jpg",
  "media_type": "tv",
  "vote_average": 7.6,
  "first_air_date": "2017-09-22",
  "category": "ecchi_anime",
  "is_mature": true
},
{
  "id": 99110,
  "name": "Discipline: The Record of a Miracle",
  "title": "Discipline: The Record of a Miracle",
  "overview": "Transferred to a secluded elite academy, Hayami Takuro must navigate a labyrinth of secret societies, strict student council dictates, and illicit encounters.",
  "poster_path": "/7At24C4d1e7G5b0U8t9S3r4.jpg",
  "backdrop_path": "/8Bu35D5e2f8H6c1V9u0T4s5.jpg",
  "media_type": "tv",
  "vote_average": 8.0,
  "first_air_date": "2003-09-26",
  "category": "ecchi_anime",
  "is_mature": true
}
];



export async function fetchEcchiAnime(page = 1) {

  const pageSize = 16;

  const start = (page - 1) * pageSize;

  if (start < SECRET_ECCHI_ANIME.length) {

    const slice = SECRET_ECCHI_ANIME.slice(start, start + pageSize);

    if (slice.length >= pageSize) return slice;

    try {

      const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&include_adult=true&sort_by=popularity.desc&page=${page}`);

      const data = await res.json();

      const extra = (data.results || []).map((item) => ({ ...item, media_type: 'tv', category: 'ecchi_anime', is_mature: true }));

      const existing = new Set(slice.map((s) => s.id));

      return [...slice, ...extra.filter((e) => !existing.has(e.id))];

    } catch {

      return slice;

    }

  }

  try {

    const tmdbPage = Math.max(1, page - Math.floor(SECRET_ECCHI_ANIME.length / pageSize));

    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&include_adult=true&sort_by=popularity.desc&page=${tmdbPage}`);

    const data = await res.json();

    return (data.results || []).map((item) => ({

      ...item,

      media_type: 'tv',

      category: 'ecchi_anime',

      is_mature: true

    }));

  } catch {

    return SECRET_ECCHI_ANIME.slice(0, pageSize);

  }

}



const searchCache = new Map();

export async function searchContent(query, page = 1, includeAdult = false) {
  if (!query || query.trim() === '') return [];

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const qNorm = norm(query);
  const qWords = qNorm.split(' ').filter((w) => w.length > 0);

  const cacheKey = `${qNorm}__${page}__${includeAdult}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const isMatch = (rawTitle) => {
    const tNorm = norm(rawTitle);
    if (!tNorm) return false;
    if (tNorm.includes(qNorm)) return true;
    if (qWords.length > 1 && qWords.every((w) => tNorm.includes(w))) return true;
    if (qNorm.length > 2 && tNorm.split(' ').some((w) => w.startsWith(qNorm) || qNorm.startsWith(w))) return true;
    return false;
  };

  // Search local custom Studio movies (page 1 only)
  let studioMatches = [];
  if (page === 1) {
    try {
      const rawStudio = localStorage.getItem('furina_studio_movies');
      if (rawStudio) {
        const parsedStudio = JSON.parse(rawStudio);
        if (Array.isArray(parsedStudio)) {
          studioMatches = parsedStudio.filter((m) => {
            if (!m) return false;
            return isMatch(m.title || m.name || '');
          });
        }
      }
    } catch (e) {}
  }

  // Search curated catalog (Anime & Blockbusters) (page 1 only)
  let curatedMatches = [];
  if (page === 1) {
    const allCurated = [
      ...CURATED_HINDI_DUBBED_ANIME,
      ...CURATED_ENGLISH_DUBBED_ANIME,
      ...CURATED_SUBBED_ANIME,
      ...CURATED_HOLLYWOOD_BLOCKBUSTERS,
      ...CURATED_BOLLYWOOD_BLOCKBUSTERS,
      ...CURATED_HOLLYWOOD_HINDI_DUBS,
      ...FALLBACK_MEDIA
    ];
    curatedMatches = allCurated.filter((item) => {
      if (!item) return false;
      return isMatch(item.title || item.name || item.original_title || item.original_name || '');
    });
  }

  try {
    let data = await cachedFetchJson(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}&include_adult=${includeAdult}`);
    let results = (data.results || []).filter(item => item && item.id && item.media_type !== 'person' && (item.poster_path || item.backdrop_path));

    // If no results, try stripping modifiers like 'hindi dubbed', 'hindi', 'dubbed', 'full movie', 'movie', etc.
    if (results.length === 0) {
      const cleaned = query.replace(/\b(hindi\s*dubbed|hindi\s*dub|hindi|dubbed|dub|full\s*movie|movie|series)\b/gi, '').trim();
      if (cleaned && cleaned.toLowerCase() !== query.trim().toLowerCase()) {
        data = await cachedFetchJson(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(cleaned)}&page=${page}&include_adult=${includeAdult}`);
        results = (data.results || []).filter(item => item && item.id && item.media_type !== 'person' && (item.poster_path || item.backdrop_path));
      }
    }

    if (!includeAdult) {
      results = results.filter(item => !isHanimeContent(item));
    }

    const merged = page === 1 ? [...studioMatches, ...curatedMatches, ...results] : results;
    const finalResults = deduplicateMedia(merged.map(item => ({
      ...item,
      isHindiDubbed: isHindiAvailable(item)
    })));

    if (searchCache.size > 100) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    searchCache.set(cacheKey, finalResults);
    return finalResults;
  } catch (err) {
    const offlineMerged = page === 1 ? [...studioMatches, ...curatedMatches] : [];
    const finalOffline = deduplicateMedia(offlineMerged.map(item => ({
      ...item,
      isHindiDubbed: isHindiAvailable(item)
    })));
    searchCache.set(cacheKey, finalOffline);
    return finalOffline;
  }
}

export async function fetchTvDetails(tvId) {
  try {
    return await cachedFetchJson(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
  } catch (err) {
    return null;
  }
}

export async function fetchSeasonEpisodes(tvId, seasonNum) {
  try {
    const data = await cachedFetchJson(`${BASE_URL}/tv/${tvId}/season/${seasonNum}?api_key=${API_KEY}`);
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

export function getGenreNames(item) {
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

