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
    "poster_path": "/hr9rjR4JWoZvq7872t2k64u08bT.jpg",
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
    "poster_path": "/x61qauH8g10vV2wZgB1K45l2C3.jpg",
    "backdrop_path": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    "media_type": "movie",
    "vote_average": 6.6,
    "release_date": "2022-09-09",
    "first_air_date": "",
    "original_language": "hi",
    "category": "hindi"
  }
];

export const CURATED_ENGLISH_DUBBED_ANIME = [
  {
    "id": 1429,
    "title": "Attack on Titan",
    "name": "Attack on Titan",
    "overview": "100 years ago, the last remnants of humanity were forced to retreat behind the towering walls of a fortified city to escape the massive, man-eating Titans that roamed the land outside their fortress. Only the members of the Scouting Legion dared to stray beyond the safety of the walls – but even those brave warriors seldom returned alive. Those within the city clung to the illusion of a peaceful existence until the day that dream was shattered, and their slim chance at survival was reduced to one horrifying choice: kill – or be devoured!",
    "poster_path": "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    "backdrop_path": "/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg",
    "media_type": "tv",
    "vote_average": 8.7,
    "release_date": "2013-04-07",
    "first_air_date": "2013-04-07",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 13916,
    "title": "Death Note",
    "name": "Death Note",
    "overview": "Light Yagami is an ace student with great prospects—and he’s bored out of his mind. But all that changes when he finds the Death Note, a notebook dropped by a rogue Shinigami death god. Any human whose name is written in the notebook dies, and Light has vowed to use the power of the Death Note to rid the world of evil. But will Light succeed in his noble goal, or will the Death Note turn him into the very thing he fights against?",
    "poster_path": "/tCZFfYTIwrR7n94J6G14Y4hAFU6.jpg",
    "backdrop_path": "/z8IPicmEKXUO4I2UDdMEqw7RqOE.jpg",
    "media_type": "tv",
    "vote_average": 8.6,
    "release_date": "2006-10-04",
    "first_air_date": "2006-10-04",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 85937,
    "title": "Demon Slayer: Kimetsu no Yaiba",
    "name": "Demon Slayer: Kimetsu no Yaiba",
    "overview": "After a demon attack leaves his family slain and his sister cursed, Tanjiro embarks upon a perilous journey to find a cure and avenge those he's lost.",
    "poster_path": "/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    "backdrop_path": "/3GQKYh6Trm8pxd2AypovoYQf4Ay.jpg",
    "media_type": "tv",
    "vote_average": 8.6,
    "release_date": "2019-04-06",
    "first_air_date": "2019-04-06",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 95479,
    "title": "JUJUTSU KAISEN",
    "name": "JUJUTSU KAISEN",
    "overview": "Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul. From then on, he shares one body with Ryomen Sukuna. Guided by the most powerful of sorcerers, Satoru Gojo, Itadori is admitted to Tokyo Jujutsu High School, an organization that fights the curses... and thus begins the heroic tale of a boy who became a curse to exorcise a curse, a life from which he could never turn back.",
    "poster_path": "/6qQzMJG27XOJsyAEEIisoJB45j2.jpg",
    "backdrop_path": "/qpin8cASXEVtwhzNsprHYFiOAGk.jpg",
    "media_type": "tv",
    "vote_average": 8.6,
    "release_date": "2020-10-03",
    "first_air_date": "2020-10-03",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 65930,
    "title": "My Hero Academia",
    "name": "My Hero Academia",
    "overview": "Izuku has dreamt of being a hero all his life—a lofty goal for anyone, but especially challenging for a kid with no superpowers. That’s right, in a world where eighty percent of the population has some kind of super-powered \"quirk,\" Izuku was unlucky enough to be born completely normal. But that’s not enough to stop him from enrolling in one of the world’s most prestigious hero academies.",
    "poster_path": "/phuYuzqWW9ru8EA3HVjE9W2Rr3M.jpg",
    "backdrop_path": "/ol0H2DGp4ifBHA4JDlCpwJWxnY2.jpg",
    "media_type": "tv",
    "vote_average": 8.6,
    "release_date": "2016-04-03",
    "first_air_date": "2016-04-03",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 127532,
    "title": "Solo Leveling",
    "name": "Solo Leveling",
    "overview": "They say whatever doesn’t kill you makes you stronger, but that’s not the case for the world’s weakest hunter Sung Jinwoo. After being brutally slaughtered by monsters in a high-ranking dungeon, Jinwoo came back with the System, a program only he could see, that’s leveling him up in every way. Now, he’s inspired to discover the secrets behind his powers and the dungeon that spawned them.",
    "poster_path": "/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg",
    "backdrop_path": "/xMNH87maNLt9n2bMDYeI6db5VFm.jpg",
    "media_type": "tv",
    "vote_average": 8.7,
    "release_date": "2024-01-07",
    "first_air_date": "2024-01-07",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 114410,
    "title": "Chainsaw Man",
    "name": "Chainsaw Man",
    "overview": "Denji has a simple dream—to live a happy and peaceful life, spending time with a girl he likes. This is a far cry from reality, however, as Denji is forced by the yakuza into killing devils in order to pay off his crushing debts. Using his pet devil Pochita as a weapon, he is ready to do anything for a bit of cash.",
    "poster_path": "/iFM1dyFi0rByvEomEkmm7NpQeeb.jpg",
    "backdrop_path": "/5DUMPBSnHOZsbBv81GFXZXvDpo6.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "release_date": "2022-10-12",
    "first_air_date": "2022-10-12",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 30991,
    "title": "Cowboy Bebop",
    "name": "Cowboy Bebop",
    "overview": "In 2071, roughly fifty years after an accident with a hyperspace gateway made the Earth almost uninhabitable, humanity has colonized most of the rocky planets and moons of the Solar System. Amid a rising crime rate, the Inter Solar System Police (ISSP) set up a legalized contract system, in which registered bounty hunters, also referred to as \"Cowboys\", chase criminals and bring them in alive in return for a reward.",
    "poster_path": "/xDiXDfZwC6XYC6fxHI1jl3A3Ill.jpg",
    "backdrop_path": "/A4PHx94G7mvM3b8vsDJ5HEaQ6uv.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "release_date": "1998-04-03",
    "first_air_date": "1998-04-03",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 46260,
    "title": "Naruto",
    "name": "Naruto",
    "overview": "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village's leader and strongest ninja.",
    "poster_path": "/xppeysfvDKVx775MFuH8Z9BlpMk.jpg",
    "backdrop_path": "/5F0HVEgkgP99fEWDjPyikGt9jQi.jpg",
    "media_type": "tv",
    "vote_average": 8.4,
    "release_date": "2002-10-03",
    "first_air_date": "2002-10-03",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 30984,
    "title": "Bleach",
    "name": "Bleach",
    "overview": "For as long as he can remember, Ichigo Kurosaki has been able to see ghosts. But when he meets Rukia, a Soul Reaper who battles evil spirits known as Hollows, he finds his life is changed forever. Now, with a newfound wealth of spiritual energy, Ichigo discovers his true calling: to protect the living and the dead from evil.",
    "poster_path": "/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg",
    "backdrop_path": "/o0NsbcIvsllg6CJX0FBFY8wWbsn.jpg",
    "media_type": "tv",
    "vote_average": 8.4,
    "release_date": "2004-10-05",
    "first_air_date": "2004-10-05",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 111110,
    "title": "ONE PIECE",
    "name": "ONE PIECE",
    "overview": "With his straw hat and ragtag crew, young pirate Monkey D. Luffy goes on an epic voyage for treasure.",
    "poster_path": "/blWCPEqDGLBuLB9u89CxP9ORQP4.jpg",
    "backdrop_path": "/qD211Hb5XwFxrszzBBe5EUYJerh.jpg",
    "media_type": "tv",
    "vote_average": 8.1,
    "release_date": "2023-08-31",
    "first_air_date": "2023-08-31",
    "original_language": "en",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 105248,
    "title": "Cyberpunk: Edgerunners",
    "name": "Cyberpunk: Edgerunners",
    "overview": "In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw — an edgerunner.",
    "poster_path": "/lqcDVZ8pyk08AVftMBildDR3QUK.jpg",
    "backdrop_path": "/w0lU7U89Fm4K8BQD4hJQpQthxu9.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "release_date": "2022-09-13",
    "first_air_date": "2022-09-13",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 120089,
    "title": "SPY x FAMILY",
    "name": "SPY x FAMILY",
    "overview": "A spy, an assassin and a telepath come together to pose as a family, each for their own reasons, while hiding their true identities from each other.",
    "poster_path": "/7NAvPYPAu7MeHwP8E9sn81PqsRh.jpg",
    "backdrop_path": "/lysUnU6V0VfcthDbviuVlIqgHOR.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "release_date": "2022-04-09",
    "first_air_date": "2022-04-09",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 12971,
    "title": "Dragon Ball Z",
    "name": "Dragon Ball Z",
    "overview": "Now happily married and with a son, martial arts champion Goku must defend Earth from a series of extraterrestrial invaders bent on destruction.",
    "poster_path": "/oQ5CnVj3TRifXl2bIOri6H6rfNe.jpg",
    "backdrop_path": "/ydf1CeiBLfdxiyNTpskM0802TKl.jpg",
    "media_type": "tv",
    "vote_average": 8.4,
    "release_date": "1989-04-26",
    "first_air_date": "1989-04-26",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 88803,
    "title": "Vinland Saga",
    "name": "Vinland Saga",
    "overview": "For a thousand years, the Vikings have made quite a name and reputation for themselves as the strongest families with a thirst for violence. Thorfinn, the son of one of the Vikings' greatest warriors, spends his boyhood in a battlefield enhancing his skills in his adventure to redeem his most-desired revenge after his father was murdered.",
    "poster_path": "/vUHlpA5c1NXkds59reY3HMb4Abs.jpg",
    "backdrop_path": "/pSLuy0OfN1QblifDVoEhAvst4et.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "release_date": "2019-07-08",
    "first_air_date": "2019-07-08",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 61374,
    "title": "Tokyo Ghoul",
    "name": "Tokyo Ghoul",
    "overview": "Ken Kaneki, a bookworm college student, meets Rize, a girl his own age with whom he shares many interests.",
    "poster_path": "/1m4RlC9BTCbyY549TOdVQ5NRPcR.jpg",
    "backdrop_path": "/jnwRlthXIgJB75Mt9GEl93Dczki.jpg",
    "media_type": "tv",
    "vote_average": 8.3,
    "release_date": "2014-07-04",
    "first_air_date": "2014-07-04",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 45952,
    "title": "Hunter x Hunter",
    "name": "Hunter x Hunter",
    "overview": "Gon Freecss discovers that the father he had always been told was dead was actually alive the whole time. Ging is a famous Hunter: an individual who has proven themself an elite member of humanity. Gon becomes determined to follow in his father's footsteps, pass the rigorous Hunter Examination.",
    "poster_path": "/eobAuhCJA8oRp814V67WhezVXtQ.jpg",
    "backdrop_path": "/575sxZXNNulSlIz7DvtWH5r4lkC.jpg",
    "media_type": "tv",
    "vote_average": 8.4,
    "release_date": "1999-10-16",
    "first_air_date": "1999-10-16",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  },
  {
    "id": 31724,
    "title": "Code Geass: Lelouch of the Rebellion",
    "name": "Code Geass: Lelouch of the Rebellion",
    "overview": "Japan has been invaded and conquered by the Britannian Empire. Japan is now known as Area 11 and its citizens known as Elevens. The Britannian Empire takes away Japan's autonomous power and imposes its rule through the use of Knightmares. The Empire's rule has never faltered, but cracks have begun to show...",
    "poster_path": "/x316WCogkeIwNY4JR8zTCHbI2nQ.jpg",
    "backdrop_path": "/5hS2OIuZSKGkR8R5l3bY5zh04Ce.jpg",
    "media_type": "tv",
    "vote_average": 8.3,
    "release_date": "2006-10-05",
    "first_air_date": "2006-10-05",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "english"
  }
];

export const CURATED_SUBBED_ANIME = [
  {
    "id": 37854,
    "title": "One Piece",
    "name": "One Piece",
    "overview": "Years ago, the fearsome Pirate King, Gol D. Roger was executed leaving behind a huge cache of treasure and the famous \"One Piece\". Whoever claims the \"One Piece\" will be named the Pirate King. Monkey D. Luffy sets out on his adventure to become the Pirate King.",
    "poster_path": "/cMD9Ygz11yjztv36nOupQZJiP4y.jpg",
    "backdrop_path": "/2rmK7mnchw9Xr3XdiTZr8vyNmYt.jpg",
    "media_type": "tv",
    "vote_average": 8.7,
    "release_date": "1999-10-20",
    "first_air_date": "1999-10-20",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  },
  {
    "id": 209867,
    "title": "Frieren: Beyond Journey's End",
    "name": "Frieren: Beyond Journey's End",
    "overview": "After the party of heroes defeated the Demon King, they restored peace to the land and returned to lives of solitude. Generations pass, and the elven mage Frieren comes face to face with humanity's mortality. She takes on a new apprentice and promises to fulfill old friends' dying wishes.",
    "poster_path": "/dqZENchTd7lp5zht7BdlqM7RBhD.jpg",
    "backdrop_path": "/rBOnrVlck7BIlGeWVlzYiZeg4l2.jpg",
    "media_type": "tv",
    "vote_average": 8.8,
    "release_date": "2023-09-29",
    "first_air_date": "2023-09-29",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  },
  {
    "id": 31910,
    "title": "Naruto: Shippuden",
    "name": "Naruto: Shippuden",
    "overview": "Naruto Uzumaki is back! After two and a half years of training on the road with Jiraiya of the Sannin, Naruto returns to the Village Hidden in the Leaves and reunites with his friends and allies as a newly resolved ninja.",
    "poster_path": "/kV274zYrAEzg8LBEHdQmBKmJXc9.jpg",
    "backdrop_path": "/7AyvM2sJ30b8sFj9Z3mX0d3n5K.jpg",
    "media_type": "tv",
    "vote_average": 8.6,
    "release_date": "2007-02-15",
    "first_air_date": "2007-02-15",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  },
  {
    "id": 214999,
    "title": "Bleach: Thousand-Year Blood War",
    "name": "Bleach: Thousand-Year Blood War",
    "overview": "The peace is suddenly broken when warning sirens echo through the Soul Society. Residents there are disappearing without a trace and nobody knows who's behind it. Meanwhile, a dark shadow is also extending itself toward Ichigo and his friends in Karakura Town.",
    "poster_path": "/30G3k88JgY01iNsdw5219fQv5hH.jpg",
    "backdrop_path": "/5DUMPBSnHOZsbBv81GFXZXvDpo6.jpg",
    "media_type": "tv",
    "vote_average": 8.7,
    "release_date": "2022-10-11",
    "first_air_date": "2022-10-11",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  },
  {
    "id": 31911,
    "title": "Fullmetal Alchemist: Brotherhood",
    "name": "Fullmetal Alchemist: Brotherhood",
    "overview": "Edward and Alphonse Elric's reckless disregard for alchemy's fundamental laws ripped half of Ed's limbs from his body, and left Al's soul clinging to a cold suit of armor. To restore what was lost, the brothers seek the Philosopher's Stone.",
    "poster_path": "/5ZFUEOULaVml7p19UP7Dkh6CLVN.jpg",
    "backdrop_path": "/254bDa1Dsd52t7gq7mXp9GZ3n0P.jpg",
    "media_type": "tv",
    "vote_average": 8.7,
    "release_date": "2009-04-05",
    "first_air_date": "2009-04-05",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  },
  {
    "id": 59427,
    "title": "Steins;Gate",
    "name": "Steins;Gate",
    "overview": "Self-proclaimed mad scientist Rintarou Okabe accidentally invents a microwave that can send text messages to the past, altering time lines and sparking an international conspiracy.",
    "poster_path": "/5UfcwF9lTrc27oT6vV3uVdYf7s9.jpg",
    "backdrop_path": "/1400a4D661d98Z9K53k8b0Q.jpg",
    "media_type": "tv",
    "vote_average": 8.7,
    "release_date": "2011-04-06",
    "first_air_date": "2011-04-06",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  },
  {
    "id": 73223,
    "title": "Black Clover",
    "name": "Black Clover",
    "overview": "Asta and Yuno are orphans being raised together outside the Clover Kingdom. In a world where everyone possesses magical powers, Asta was born without any. In contrast, Yuno is a prodigy. Together they embark to become the Wizard King.",
    "poster_path": "/4Pbp9x3q7n90Y8z5K51y2B2b.jpg",
    "backdrop_path": "/5DUMPBSnHOZsbBv81GFXZXvDpo6.jpg",
    "media_type": "tv",
    "vote_average": 8.5,
    "release_date": "2017-10-03",
    "first_air_date": "2017-10-03",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  },
  {
    "id": 60708,
    "title": "Haikyu!!",
    "name": "Haikyu!!",
    "overview": "Inspired by a championship volleyball match, junior high student Shoyo Hinata vows to become a volleyball ace despite his short stature.",
    "poster_path": "/kxF3q7y8z90Y8z5K51y2B2b.jpg",
    "backdrop_path": "/2rmK7mnchw9Xr3XdiTZr8vyNmYt.jpg",
    "media_type": "tv",
    "vote_average": 8.6,
    "release_date": "2014-04-06",
    "first_air_date": "2014-04-06",
    "original_language": "ja",
    "category": "anime",
    "isAnime": true,
    "dub_type": "sub"
  }
];



export async function fetchHindiMovies(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&region=IN&primary_release_date.lte=${today}&vote_count.gte=5&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    const bollywood = (data.results && data.results.length > 0)
      ? data.results.map(m => ({ ...m, media_type: 'movie', category: 'hindi', original_language: 'hi' }))
      : (page === 1 ? FALLBACK_MEDIA.filter(m => m.category === 'hindi') : []);
    
    if (page === 1) {
      // Return authentic Bollywood classics & blockbusters first
      const existingIds = new Set(CURATED_BOLLYWOOD_BLOCKBUSTERS.map(b => b.id));
      const filtered = bollywood.filter(m => !existingIds.has(m.id));
      return [...CURATED_BOLLYWOOD_BLOCKBUSTERS, ...filtered];
    }
    return bollywood;
  } catch (err) {
    return page === 1 ? [...CURATED_BOLLYWOOD_BLOCKBUSTERS, ...FALLBACK_MEDIA.filter(m => m.category === 'hindi')] : [];
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

export async function fetchAnime(page = 1, audioFilter = 'all') {
  try {
    if (audioFilter === 'english') {
      return CURATED_ENGLISH_DUBBED_ANIME;
    }
    if (audioFilter === 'sub') {
      return CURATED_SUBBED_ANIME;
    }
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&first_air_date.lte=${today}&vote_count.gte=10&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    const rawResults = data.results || [];
    // Strict filter to eliminate 18+ ecchi / hanimes from public anime lists
    const cleanDiscovered = rawResults
      .filter(item => item && !isHanimeContent(item))
      .map(m => ({ ...m, media_type: 'tv', category: 'anime', isAnime: true }));

    if (page === 1) {
      // Prepend top verified mainstream anime on page 1 so users always see legendary hits
      const existingIds = new Set(CURATED_ENGLISH_DUBBED_ANIME.map(a => a.id));
      const filteredDiscovered = cleanDiscovered.filter(m => !existingIds.has(m.id));
      return [...CURATED_ENGLISH_DUBBED_ANIME, ...filteredDiscovered];
    }
    return cleanDiscovered;
  } catch (err) {
    return page === 1 ? CURATED_ENGLISH_DUBBED_ANIME : [];
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

// 🔞 Blacklist of 18+ Ecchi, Hentai & ComicFesta Anime (kept strictly in secret vault)
export const BLOCKED_HANIME_IDS = new Set([
  95897, 81044, 88090, 78501, 90388, 131660, 118588, 99071, 96444, 45950,
  68005, 64706, 85588, 70998, 70830, 74180, 75778, 103409, 236338, 114477,
  99080, 64163, 45998, 66926, 38112, 34742, 63187, 96120, 37867, 63323,
  61460, 34805, 45234, 233643, 236209, 23315, 39281, 43098, 67406, 45129,
  31969, 40118, 37837, 63200, 60824, 45266, 38384, 33527, 61706, 34839,
  70889, 65977, 119853, 85461, 93554, 103986, 107937, 111169, 95224, 93988,
  44342, 44439, 38786, 84669, 82883, 80646, 125433, 82030, 84123, 100877, 107865
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

export function isHindiAvailable(item) {
  if (!item) return false;
  // Genuine Bollywood Indian cinema
  return item.original_language === 'hi' || item.category === 'hindi';
}

export function isAnimeItem(item) {
  if (!item) return false;
  return item.category === 'anime' || item.isAnime === true || item.original_language === 'ja';
}

export function isHindiDubbedAnime(item) {
  if (!item) return false;
  const hindiAnimeIds = new Set([12971, 46260, 85937, 95479, 63926, 60572, 298321, 65733, 226688, 77240]);
  return hindiAnimeIds.has(Number(item.id));
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

        if (!includeAdult) {
      results = results.filter(item => !isHanimeContent(item));
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
