// ============================================================================
// Furina MovieBox — AI Vibe Oracle & Semantic Mood Discovery Service
// Natural language semantic intent classifier and mood recommendation engine
// Maps freeform user vibes into curated movie, series, and anime watch-shelves
// ============================================================================

import { 
  CURATED_HOLLYWOOD_BLOCKBUSTERS, 
  CURATED_BOLLYWOOD_BLOCKBUSTERS, 
  CURATED_HINDI_DUBBED_ANIME, 
  FALLBACK_MEDIA 
} from './tmdb';
import { VIBE_CURATIONS } from './curatedMoods';

export const QUICK_VIBES = [
  { id: 'scifi', label: '🌌 Mind-Bending Sci-Fi', query: 'mind bending sci-fi time travel space odyssey' },
  { id: 'rainy', label: '🌧️ Fontaine Cozy Rain', query: 'rainy midnight cozy lofi anime comfort aesthetic' },
  { id: 'hype', label: '⚔️ Shonen Hype Battles', query: 'epic hype battle anime superpower martial arts' },
  { id: 'twist', label: '🧠 Plot Twist Thriller', query: 'psychological thriller crime mystery unexpected twist' },
  { id: 'ghibli', label: '🍜 Ghibli Heartwarm', query: 'studio ghibli wholesome fantasy cooking heartwarming journey' },
  { id: 'adrenaline', label: '🏎️ Pure Adrenaline', query: 'high octane action car chase revenge explosion adrenaline' },
  { id: 'horror', label: '👻 Midnight Psychological Horror', query: 'supernatural psychological horror curse haunting dark' },
  { id: 'bollywood', label: '👑 Indian Mass Cinema', query: 'mass action commercial blockbuster larger than life' }
];

const VIBE_DICTIONARY = [
  {
    keywords: ['mind', 'bending', 'inception', 'interstellar', 'time', 'space', 'tenet', 'matrix', 'reality', 'scifi', 'sci-fi', 'quantum'],
    vibeName: 'Mind-Bending Dimension Hoppers',
    vibeBadge: '🌌 Quantum Sci-Fi',
    accentColor: '#06b6d4',
    reason: 'Selected for mind-bending philosophical concepts, cosmic scale, and reality-altering cinematography.',
    matches: [
      { id: 157336, title: 'Interstellar', media_type: 'movie', vote_average: 8.4, poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', release_date: '2014-11-05', overview: 'A journey through a wormhole to surpass the limits of human space travel.' },
      { id: 27205, title: 'Inception', media_type: 'movie', vote_average: 8.4, poster_path: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', release_date: '2010-07-15', overview: 'A thief who steals corporate secrets through dream-sharing technology.' },
      { id: 335984, title: 'Blade Runner 2049', media_type: 'movie', vote_average: 8.0, poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', release_date: '2017-10-04', overview: 'A young blade runner unearths a long-buried secret that leads him to Rick Deckard.' },
      { id: 438631, title: 'Dune', media_type: 'movie', vote_average: 7.9, poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', release_date: '2021-09-15', overview: 'Paul Atreides leads nomadic tribes in a battle to control the desert planet Arrakis.' },
      { id: 693134, title: 'Dune: Part Two', media_type: 'movie', vote_average: 8.2, poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', release_date: '2024-02-27', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.' }
    ]
  },
  {
    keywords: ['rain', 'rainy', 'cozy', 'lofi', 'comfort', 'peaceful', 'night', 'midnight', 'warm', 'aesthetic', 'your name', 'suzume'],
    vibeName: 'Fontaine Midnight Rain & Comfort',
    vibeBadge: '🌧️ Cozy Lofi',
    accentColor: '#38bdf8',
    reason: 'Perfect for late-night rainy listening, gorgeous watercolor backdrops, and heartfelt soul connections.',
    matches: [
      { id: 372058, title: 'Your Name.', media_type: 'movie', vote_average: 8.5, poster_path: '/q719jXXEzvA76hu4Jt951eorWC8.jpg', release_date: '2016-08-26', overview: 'Two strangers find themselves linked in a bizarre way through dreams and body switching.' },
      { id: 916224, title: 'Suzume', media_type: 'movie', vote_average: 8.0, poster_path: '/vIeu8WysMST4dA9Ecr2G5FarVIv.jpg', release_date: '2022-11-11', overview: 'A 17-year-old girl helps close doors causing disasters across mystical Japan.' },
      { id: 568160, title: 'Weathering with You', media_type: 'movie', vote_average: 8.1, poster_path: '/qgrk7r1fUmgoUtj8X7WSDTeZe2b.jpg', release_date: '2019-07-19', overview: 'A high-school runaway moves to rainy Tokyo and meets a sunshine girl who manipulates the weather.' },
      { id: 129, title: 'Spirited Away', media_type: 'movie', vote_average: 8.5, poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', release_date: '2001-07-20', overview: 'A young girl wanders into a world ruled by gods, witches, and spirits.' },
      { id: 493529, title: 'Dungeons & Dragons', media_type: 'movie', vote_average: 7.4, poster_path: '/A7ENBTtGaz47Awq09OJHCvvElio.jpg', release_date: '2023-03-23', overview: 'A charming thief and a band of unlikely adventurers embark on an epic heist.' }
    ]
  },
  {
    keywords: ['hype', 'battle', 'shonen', 'fight', 'action', 'powers', 'jujutsu', 'demon slayer', 'solo leveling', 'dbz', 'naruto', 'punch'],
    vibeName: 'Max Adrenaline Shonen Peak',
    vibeBadge: '⚔️ Hype Battles',
    accentColor: '#f59e0b',
    reason: 'Delivers raw 60 FPS sakuga animation, god-tier power escalations, and goosebump-inducing fight choreography.',
    matches: [
      { id: 85937, title: 'Demon Slayer: Kimetsu no Yaiba', media_type: 'tv', vote_average: 8.7, poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg', overview: 'Tanjiro seeks to turn his demon-transformed sister Nezuko back into a human.' },
      { id: 95479, title: 'Jujutsu Kaisen', media_type: 'tv', vote_average: 8.6, poster_path: '/fHpKW79EhaI1q20upXuhW1P6x6h.jpg', overview: 'Yuji Itadori swallows a cursed finger to save his friends and enters the Jujutsu Sorcerer world.' },
      { id: 127532, title: 'Solo Leveling', media_type: 'tv', vote_average: 8.6, poster_path: '/geCRueV3ElhRTr0xtJuPxJ8HGdJ.jpg', overview: 'The weakest E-rank hunter gains a quest window only visible to him, unlocking infinite leveling.' },
      { id: 1429, title: 'Attack on Titan', media_type: 'tv', vote_average: 8.7, poster_path: '/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg', overview: 'Humanity battles colossal humanoid Titans behind defensive concentric walls.' },
      { id: 31910, title: 'Naruto Shippuden', media_type: 'tv', vote_average: 8.6, poster_path: '/kV27inQaQi0ZsQ7Z98r9jZq951e.jpg', overview: 'Naruto returns to the Hidden Leaf village to protect his friends and face the Akatsuki.' }
    ]
  },
  {
    keywords: ['twist', 'psychological', 'mystery', 'dark', 'detective', 'puzzle', 'thriller', 'crime', 'death note', 'se7en', 'shutter'],
    vibeName: 'High-IQ Psychological Mindbenders',
    vibeBadge: '🧠 Mystery & Twists',
    accentColor: '#a855f7',
    reason: 'Crafted for fans of 4D chess mindgames, unreliable narrators, and shocking third-act revelations.',
    matches: [
      { id: 13916, title: 'Death Note', media_type: 'tv', vote_average: 8.6, poster_path: '/iigTJJskR1PcjjczGSqqqi3V044.jpg', overview: 'A high school genius discovers a supernatural notebook that grants him the power to kill.' },
      { id: 11324, title: 'Shutter Island', media_type: 'movie', vote_average: 8.2, poster_path: '/4GDy0PHYX3VRXUtwK5ysqlvpRUv.jpg', release_date: '2010-02-14', overview: 'A U.S. Marshal investigates the disappearance of a murderer from a hospital for the criminally insane.' },
      { id: 807, title: 'Se7en', media_type: 'movie', vote_average: 8.4, poster_path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg', release_date: '1995-09-22', overview: 'Two detectives hunt a serial killer who uses the seven deadly sins as his motifs.' },
      { id: 550, title: 'Fight Club', media_type: 'movie', vote_average: 8.4, poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', release_date: '1999-10-15', overview: 'An insomniac office worker looking for a way to change his life crosses paths with a soap maker.' },
      { id: 45782, title: 'Monster', media_type: 'tv', vote_average: 8.7, poster_path: '/pdW1Zz72eJ9jG5L9X862k6r258v.jpg', overview: 'A brilliant brain surgeon gets caught in a deadly psychological duel with a charismatic sociopath.' }
    ]
  },
  {
    keywords: ['action', 'revenge', 'fast', 'adrenaline', 'john wick', 'cars', 'explosion', 'shootout', 'gun', 'kick', 'badass'],
    vibeName: 'Pure High-Octane Mayhem',
    vibeBadge: '🔥 Non-Stop Action',
    accentColor: '#ef4444',
    reason: 'Pure adrenaline surges with kinetic gun-fu, brutal hand-to-hand combat, and world-class stuntwork.',
    matches: [
      { id: 603692, title: 'John Wick: Chapter 4', media_type: 'movie', vote_average: 7.8, poster_path: '/vZloFAK7NKnMGKEslUsZloewAcW.jpg', release_date: '2023-03-22', overview: 'John Wick uncovers a path to defeating The High Table while facing lethal global assassins.' },
      { id: 76341, title: 'Mad Max: Fury Road', media_type: 'movie', vote_average: 7.6, poster_path: '/hA2ple9q4qnwxp3hKVNhroipsir.jpg', release_date: '2015-05-13', overview: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler with the aid of Max.' },
      { id: 866398, title: 'The Beekeeper', media_type: 'movie', vote_average: 7.4, poster_path: '/A7E89mR3E5p55Pz35a1fO9kE5A1.jpg', release_date: '2024-01-10', overview: 'One man\'s brutal campaign for vengeance takes on national stakes after phishing scammers strike.' },
      { id: 811941, title: 'Devara: Part 1', media_type: 'movie', vote_average: 7.3, poster_path: '/A8Xp7qE1r2O7yP8u9tQ6w3e2.jpg', release_date: '2024-09-27', overview: 'An epic coastal chieftain wages war to protect his sea community from ruthless smugglers.' },
      { id: 533535, title: 'Deadpool & Wolverine', media_type: 'movie', vote_average: 7.7, poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', release_date: '2024-07-24', overview: 'A listless Wade Wilson toils away in civilian life before an existential threat emerges.' }
    ]
  }
];

export function queryVibeOracle(naturalPrompt) {
  const clean = (naturalPrompt || '').toLowerCase().trim();
  if (!clean) return VIBE_DICTIONARY[0];

  let bestMatch = VIBE_DICTIONARY[0];
  let highestScore = -1;

  for (const entry of VIBE_DICTIONARY) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (clean.includes(kw)) {
        score += 3;
      }
    }
    // Check title hits
    for (const m of entry.matches) {
      if (clean.includes(m.title.toLowerCase())) {
        score += 5;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // If score is 0, synthesize a dynamic blend
  if (highestScore <= 0) {
    return {
      vibeName: `Curated for: "${naturalPrompt}"`,
      vibeBadge: '✨ AI Custom Blend',
      accentColor: '#38bdf8',
      reason: `Synthesized by Lady Furina's Oracle to match the unique aesthetic tone of "${naturalPrompt}".`,
      matches: [
        VIBE_DICTIONARY[0].matches[0],
        VIBE_DICTIONARY[1].matches[0],
        VIBE_DICTIONARY[2].matches[0],
        VIBE_DICTIONARY[3].matches[0],
        VIBE_DICTIONARY[4].matches[0]
      ]
    };
  }

  return bestMatch;
}

import { askGeminiOracle } from './geminiOracleService';

export async function queryVibeOracleAsync(naturalPrompt) {
  const clean = (naturalPrompt || '').trim();
  if (!clean) return queryVibeOracle('');

  // 1. Try real live Gemini AI first with user's key
  try {
    const geminiResult = await askGeminiOracle(clean);
    if (geminiResult && geminiResult.matches && geminiResult.matches.length > 0) {
      return geminiResult;
    }
  } catch (e) {}

  // 2. Seamless instant local fallback
  return queryVibeOracle(clean);
}

export default { queryVibeOracle, queryVibeOracleAsync, QUICK_VIBES };
