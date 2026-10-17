// src/services/liveTvService.js
// Deterministic 24/7 Synchronized Live TV Broadcast Engine, Random Movie Roulette & Electronic Program Guide (EPG)

const SAMPLE_STREAMS = {
  action: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  scifi: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  anime: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  fantasy: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  cinema: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  thriller: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
};

export const RANDOM_MOVIE_POOL = [
  {
    id: 533535,
    tmdbId: 533535,
    title: 'Deadpool & Wolverine',
    media_type: 'movie',
    durationMinutes: 128,
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    vote_average: 7.8,
    release_date: '2024-07-24',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.action,
    overview: 'Deadpool and Wolverine team up across the Marvel multiverse in 4K IMAX Multi-Audio.'
  },
  {
    id: 693134,
    tmdbId: 693134,
    title: 'Dune: Part Two',
    media_type: 'movie',
    durationMinutes: 166,
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    vote_average: 8.3,
    release_date: '2024-02-27',
    genres: ['Sci-Fi', 'Adventure'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.scifi,
    overview: 'Paul Atreides unites with Chani and the Fremen to wage war against the conspirators who destroyed his family.'
  },
  {
    id: 157336,
    tmdbId: 157336,
    title: 'Interstellar',
    media_type: 'movie',
    durationMinutes: 169,
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.scifi,
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'
  },
  {
    id: 299534,
    tmdbId: 299534,
    title: 'Avengers: Endgame',
    media_type: 'movie',
    durationMinutes: 181,
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    vote_average: 8.3,
    release_date: '2019-04-24',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.action,
    overview: 'The Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.'
  },
  {
    id: 27205,
    tmdbId: 27205,
    title: 'Inception',
    media_type: 'movie',
    durationMinutes: 148,
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    vote_average: 8.4,
    release_date: '2010-07-15',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.scifi,
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.'
  },
  {
    id: 155,
    tmdbId: 155,
    title: 'The Dark Knight',
    media_type: 'movie',
    durationMinutes: 152,
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    genres: ['Action', 'Crime', 'Thriller'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.thriller,
    overview: 'Batman raises the stakes in his war on crime and faces the chaos of the Joker in Gotham City.'
  },
  {
    id: 634649,
    tmdbId: 634649,
    title: 'Spider-Man: No Way Home',
    media_type: 'movie',
    durationMinutes: 148,
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    vote_average: 8.0,
    release_date: '2021-12-15',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.action,
    overview: 'Peter Parker asks Doctor Strange for help, unleashing dangerous foes from across the Spider-Verse.'
  },
  {
    id: 603692,
    tmdbId: 603692,
    title: 'John Wick: Chapter 4',
    media_type: 'movie',
    durationMinutes: 169,
    poster_path: '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    backdrop_path: '/h8gHn0OzBoaefW0w19GeSmwh2if.jpg',
    vote_average: 7.8,
    release_date: '2023-03-22',
    genres: ['Action', 'Thriller', 'Crime'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.action,
    overview: 'John Wick uncovers a path to defeating The High Table across Osaka, Berlin, and Paris.'
  },
  {
    id: 872585,
    tmdbId: 872585,
    title: 'Oppenheimer',
    media_type: 'movie',
    durationMinutes: 180,
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    vote_average: 8.1,
    release_date: '2023-07-19',
    genres: ['Drama', 'History', 'Thriller'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.cinema,
    overview: 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.'
  },
  {
    id: 1022789,
    tmdbId: 1022789,
    title: 'Inside Out 2',
    media_type: 'movie',
    durationMinutes: 96,
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOm8zToLQI0ALFL6LDJuTYk5.jpg',
    vote_average: 7.7,
    release_date: '2024-06-11',
    genres: ['Comedy', 'Animation', 'Adventure'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.anime,
    overview: 'Teenager Riley\'s mind headquarters undergoes a sudden overhaul to make room for new Emotions!'
  },
  {
    id: 361743,
    tmdbId: 361743,
    title: 'Top Gun: Maverick',
    media_type: 'movie',
    durationMinutes: 131,
    poster_path: '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    backdrop_path: '/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg',
    vote_average: 8.2,
    release_date: '2022-05-24',
    genres: ['Action', 'Adventure'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.action,
    overview: 'Pete "Maverick" Mitchell trains a detachment of TOP GUN graduates for an impossible mission.'
  },
  {
    id: 974262,
    tmdbId: 974262,
    title: 'Kalki 2898 AD',
    media_type: 'movie',
    durationMinutes: 180,
    poster_path: '/8fYluTtB3b3HKO7KQa5tzrvGaps.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    vote_average: 7.5,
    release_date: '2024-06-27',
    genres: ['Sci-Fi', 'Action', 'Fantasy'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.scifi,
    overview: 'In a post-apocalyptic 2898 AD, Bhairava embarks on a high-stakes quest in the last city of Kashi.'
  },
  {
    id: 1114513,
    tmdbId: 1114513,
    title: 'Stree 2: Sarkate Ka Aatank',
    media_type: 'movie',
    durationMinutes: 147,
    poster_path: '/dA4N6uWOnEMgbxXwFX7qX7adzs8.jpg',
    backdrop_path: '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    vote_average: 7.7,
    release_date: '2024-08-15',
    genres: ['Comedy', 'Horror'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.fantasy,
    overview: 'The town of Chanderi faces a terrifying new headless entity, and Vicky must reunite the gang.'
  },
  {
    id: 1160018,
    tmdbId: 1160018,
    title: 'Kill',
    media_type: 'movie',
    durationMinutes: 105,
    poster_path: '/m2zXTuNPkywdYLyWlVyJZW2QOJH.jpg',
    backdrop_path: '/h8gHn0OzBoaefW0w19GeSmwh2if.jpg',
    vote_average: 7.6,
    release_date: '2024-07-03',
    genres: ['Action', 'Thriller', 'Crime'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.thriller,
    overview: 'Two commando friends face an army of invading bandits aboard a New Delhi-bound express train.'
  },
  {
    id: 20453,
    tmdbId: 20453,
    title: '3 Idiots',
    media_type: 'movie',
    durationMinutes: 170,
    poster_path: '/66A9MqXOyVFCssoloscw79z8Tew.jpg',
    backdrop_path: '/8gT3UKtglLVpu0YfccwbmXZ5Eis.jpg',
    vote_average: 8.0,
    release_date: '2009-12-23',
    genres: ['Comedy', 'Drama'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.cinema,
    overview: 'Two friends embark on a quest for a lost buddy, recalling their unforgettable college days with Rancho.'
  },
  {
    id: 76600,
    tmdbId: 76600,
    title: 'Avatar: The Way of Water',
    media_type: 'movie',
    durationMinutes: 192,
    poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    vote_average: 7.7,
    release_date: '2022-12-14',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.scifi,
    overview: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.'
  },
  {
    id: 414906,
    tmdbId: 414906,
    title: 'The Batman',
    media_type: 'movie',
    durationMinutes: 176,
    poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaxtQvQ.jpg',
    vote_average: 7.7,
    release_date: '2022-03-01',
    genres: ['Action', 'Crime', 'Mystery'],
    isHindiDubbed: true,
    defaultAudioMode: 'hindi',
    previewVideoUrl: SAMPLE_STREAMS.thriller,
    overview: 'Batman uncovers corruption in Gotham City while pursuing a sadistic serial killer known as the Riddler.'
  }
];

/**
 * Picks a random movie from the combined live catalog + RANDOM_MOVIE_POOL
 */
export function pickRandomLiveMovie(customPool = [], currentId = null) {
  const validCustom = Array.isArray(customPool)
    ? customPool.filter((m) => m && m.id && (m.poster_path || m.backdrop_path) && (m.title || m.name))
    : [];

  const combined = [...RANDOM_MOVIE_POOL, ...validCustom];
  const dedupedMap = new Map();
  for (const item of combined) {
    const key = String(item.tmdbId || item.id);
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, item);
    }
  }

  const candidates = Array.from(dedupedMap.values()).filter(
    (m) => String(m.tmdbId || m.id) !== String(currentId)
  );

  const pool = candidates.length > 0 ? candidates : RANDOM_MOVIE_POOL;
  const chosen = pool[Math.floor(Math.random() * pool.length)] || RANDOM_MOVIE_POOL[0];

  const streamKeys = Object.values(SAMPLE_STREAMS);
  const randomPreview = chosen.previewVideoUrl || streamKeys[Math.floor(Math.random() * streamKeys.length)];

  return {
    ...chosen,
    id: chosen.tmdbId || chosen.id,
    tmdbId: chosen.tmdbId || (typeof chosen.id === 'number' ? chosen.id : 533535),
    title: chosen.title || chosen.name || 'Surprise Blockbuster',
    media_type: chosen.media_type || (chosen.first_air_date ? 'tv' : 'movie'),
    durationMinutes: chosen.durationMinutes || 135,
    isHindiDubbed: Boolean(chosen.isHindiDubbed ?? true),
    defaultAudioMode: chosen.defaultAudioMode || 'hindi',
    previewVideoUrl: randomPreview
  };
}

export const LIVE_TV_CHANNELS = [
  {
    id: 'ch_random_roulette',
    number: '100',
    name: 'Random Movie Roulette 4K',
    tagline: '24/7 Non-Stop Surprise Blockbusters & Instant Movie Shuffle',
    accent: 'cyan',
    category: 'Random Movies 4K',
    isRandomChannel: true,
    programs: RANDOM_MOVIE_POOL
  },
  {
    id: 'ch_imax_action',
    number: '101',
    name: 'Furina Action IMAX 4K',
    tagline: '24/7 Non-Stop Blockbuster Action & Marvel/DC Sagas',
    accent: 'cyan',
    category: 'Action & Blockbusters',
    programs: [
      RANDOM_MOVIE_POOL[0], // Deadpool & Wolverine
      RANDOM_MOVIE_POOL[7], // John Wick: Chapter 4
      RANDOM_MOVIE_POOL[3], // Avengers: Endgame
      RANDOM_MOVIE_POOL[10], // Top Gun: Maverick
      RANDOM_MOVIE_POOL[6]  // Spider-Man: No Way Home
    ]
  },
  {
    id: 'ch_hindi_gold',
    number: '102',
    name: 'Bollywood & Hindi Dub Gold',
    tagline: '24/7 Theatrical Hindi Blockbusters & South Dubbed Hits',
    accent: 'amber',
    category: 'Hindi Cinema',
    programs: [
      RANDOM_MOVIE_POOL[12], // Stree 2
      RANDOM_MOVIE_POOL[11], // Kalki 2898 AD
      RANDOM_MOVIE_POOL[13], // Kill
      RANDOM_MOVIE_POOL[14]  // 3 Idiots
    ]
  },
  {
    id: 'ch_anime_simulcast',
    number: '103',
    name: 'Anime Simulcast & Hindi Dub TV',
    tagline: '24/7 Shonen Battles, Solo Leveling & Studio Hindi Anime',
    accent: 'purple',
    category: 'Anime Vault',
    programs: [
      {
        id: 127532,
        tmdbId: 127532,
        title: 'Solo Leveling — S1 Marathon',
        media_type: 'tv',
        season: 1,
        episode: 1,
        durationMinutes: 95,
        poster_path: '/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg',
        backdrop_path: '/dfX2UaHVE5c7kLBFbgmEZJuy4Ev.jpg',
        vote_average: 8.7,
        genres: ['Anime', 'Action', 'Fantasy'],
        isHindiDubbed: true,
        defaultAudioMode: 'hindi',
        previewVideoUrl: SAMPLE_STREAMS.anime,
        overview: 'Sung Jinwoo rises from the weakest E-Rank hunter to the Shadow Monarch.'
      },
      {
        id: 85937,
        tmdbId: 85937,
        title: 'Demon Slayer: Hashira Training',
        media_type: 'tv',
        season: 4,
        episode: 1,
        durationMinutes: 110,
        poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
        backdrop_path: '/nTvM4mhqNlHIvUkI1gVnW6XP7GG.jpg',
        vote_average: 8.7,
        genres: ['Anime', 'Action', 'Fantasy'],
        isHindiDubbed: true,
        defaultAudioMode: 'hindi',
        previewVideoUrl: SAMPLE_STREAMS.fantasy,
        overview: 'Tanjiro and the Demon Slayer Corps prepare for the final battle against Muzan Kibutsuji.'
      },
      {
        id: 95479,
        tmdbId: 95479,
        title: 'Jujutsu Kaisen — Shibuya Incident',
        media_type: 'tv',
        season: 2,
        episode: 1,
        durationMinutes: 100,
        poster_path: '/fHpKWq9ayzSk8nSwqRuaAUemRKh.jpg',
        backdrop_path: '/gmECX1DvFgdUPjtio2zaL8BPYPu.jpg',
        vote_average: 8.6,
        genres: ['Anime', 'Action', 'Supernatural'],
        isHindiDubbed: true,
        defaultAudioMode: 'hindi',
        previewVideoUrl: SAMPLE_STREAMS.action,
        overview: 'Yuji Itadori and Satoru Gojo face Kenjaku and cursed spirits in Shibuya.'
      }
    ]
  },
  {
    id: 'ch_scifi_cyber',
    number: '104',
    name: 'Sci-Fi & Mind-Benders 4K',
    tagline: '24/7 Interstellar Voyages, Dune & Cyberpunk Worlds',
    accent: 'emerald',
    category: 'Sci-Fi & Thriller',
    programs: [
      RANDOM_MOVIE_POOL[1], // Dune: Part Two
      RANDOM_MOVIE_POOL[2], // Interstellar
      RANDOM_MOVIE_POOL[4], // Inception
      RANDOM_MOVIE_POOL[8]  // Oppenheimer
    ]
  },
  {
    id: 'ch_series_binge',
    number: '105',
    name: 'Global Series Marathon TV',
    tagline: '24/7 Top Web Series, K-Dramas & Fantasy Epics',
    accent: 'rose',
    category: 'Web Series',
    programs: [
      {
        id: 94997,
        tmdbId: 94997,
        title: 'House of the Dragon — S2 Premiere',
        media_type: 'tv',
        season: 2,
        episode: 1,
        durationMinutes: 65,
        poster_path: '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
        backdrop_path: '/zZqpAXxVSBtxV9qPBcscfXBcL2w.jpg',
        vote_average: 8.4,
        genres: ['Fantasy', 'Action', 'Drama'],
        isHindiDubbed: true,
        defaultAudioMode: 'hindi',
        previewVideoUrl: SAMPLE_STREAMS.fantasy,
        overview: 'Westeros stands on the brink of a bloody civil war between the Green and Black councils.'
      },
      {
        id: 93405,
        tmdbId: 93405,
        title: 'Squid Game — Hindi Dub Marathon',
        media_type: 'tv',
        season: 1,
        episode: 1,
        durationMinutes: 60,
        poster_path: '/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
        backdrop_path: '/oaGvjB0DvdhXhOAuADfHb261ZHa.jpg',
        vote_average: 8.4,
        genres: ['Thriller', 'Mystery', 'Action'],
        isHindiDubbed: true,
        defaultAudioMode: 'hindi',
        previewVideoUrl: SAMPLE_STREAMS.thriller,
        overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games.'
      },
      {
        id: 66732,
        tmdbId: 66732,
        title: 'Stranger Things — Hawkins Chronicles',
        media_type: 'tv',
        season: 4,
        episode: 1,
        durationMinutes: 75,
        poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        backdrop_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
        vote_average: 8.6,
        genres: ['Sci-Fi', 'Mystery', 'Horror'],
        isHindiDubbed: true,
        defaultAudioMode: 'hindi',
        previewVideoUrl: SAMPLE_STREAMS.scifi,
        overview: 'Darkness returns to Hawkins just in time for spring break, triggering fresh terror.'
      }
    ]
  },
  {
    id: 'ch_family_cozy',
    number: '106',
    name: 'Cozy Animation & Family 4K',
    tagline: '24/7 Feel-Good Animation & Adventure Classics',
    accent: 'blue',
    category: 'Animation & Family',
    programs: [
      RANDOM_MOVIE_POOL[9], // Inside Out 2
      {
        id: 569094,
        tmdbId: 569094,
        title: 'Spider-Man: Across the Spider-Verse',
        media_type: 'movie',
        durationMinutes: 140,
        poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        vote_average: 8.4,
        genres: ['Animation', 'Action', 'Sci-Fi'],
        isHindiDubbed: true,
        defaultAudioMode: 'hindi',
        previewVideoUrl: SAMPLE_STREAMS.action,
        overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.'
      }
    ]
  }
];

export function getChannelLiveState(channel, nowMs = Date.now()) {
  if (!channel || !Array.isArray(channel.programs) || channel.programs.length === 0) {
    return null;
  }

  const totalCycleSeconds = channel.programs.reduce(
    (acc, prog) => acc + (prog.durationMinutes || 120) * 60,
    0
  );

  const epochSeconds = Math.floor(nowMs / 1000);
  const cyclePosition = epochSeconds % totalCycleSeconds;

  let accumulated = 0;
  let currentIndex = 0;
  let elapsedInCurrentSeconds = 0;

  for (let i = 0; i < channel.programs.length; i++) {
    const durSec = (channel.programs[i].durationMinutes || 120) * 60;
    if (cyclePosition < accumulated + durSec) {
      currentIndex = i;
      elapsedInCurrentSeconds = cyclePosition - accumulated;
      break;
    }
    accumulated += durSec;
  }

  const currentProgram = channel.programs[currentIndex];
  const nextProgram = channel.programs[(currentIndex + 1) % channel.programs.length];
  const laterProgram = channel.programs[(currentIndex + 2) % channel.programs.length];

  const currentDurationSeconds = (currentProgram.durationMinutes || 120) * 60;
  const remainingSeconds = Math.max(0, currentDurationSeconds - elapsedInCurrentSeconds);
  const progressPercent = Math.min(
    100,
    Math.max(1, Math.round((elapsedInCurrentSeconds / currentDurationSeconds) * 100))
  );

  return {
    channel,
    currentProgram,
    nextProgram,
    laterProgram,
    elapsedMinutes: Math.floor(elapsedInCurrentSeconds / 60),
    elapsedSeconds: elapsedInCurrentSeconds,
    remainingMinutes: Math.ceil(remainingSeconds / 60),
    progressPercent
  };
}
