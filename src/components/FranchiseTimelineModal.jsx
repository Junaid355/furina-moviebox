import React, { useState } from 'react';
import { X, Film, Sparkles, Play, Info, Calendar, ArrowRight, ShieldCheck, Flame, Star } from 'lucide-react';
import soundFx from '../services/soundFx';

export const FRANCHISE_TIMELINES = {
  mcu: {
    id: 'mcu',
    title: 'Marvel Cinematic Universe (MCU)',
    subtitle: 'Sacred Timeline — Chronological Watch Order (Phase 1 to Phase 5)',
    badge: '👑 Sacred Timeline',
    color: 'from-red-600 via-rose-600 to-indigo-800',
    items: [
      { id: 1771, title: 'Captain America: The First Avenger', year: 1942, phase: 'Phase 1', order: 1, type: 'movie', vote_average: 7.0, poster_path: '/vSNxAJTlD0r02V9sPYpOjqD0YvH.jpg', overview: 'Steve Rogers undergoes a secret experiment to become the super-soldier Captain America.' },
      { id: 299537, title: 'Captain Marvel', year: 1995, phase: 'Phase 3', order: 2, type: 'movie', vote_average: 6.9, poster_path: '/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg', overview: 'Carol Danvers becomes one of the universe\'s most powerful heroes when Earth is caught in a galactic war.' },
      { id: 1726, title: 'Iron Man', year: 2008, phase: 'Phase 1', order: 3, type: 'movie', vote_average: 7.6, poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', overview: 'Tony Stark builds an armored suit and uses it to fight evil after being held captive in an Afghan cave.' },
      { id: 10138, title: 'Iron Man 2', year: 2010, phase: 'Phase 1', order: 4, type: 'movie', vote_average: 6.8, poster_path: '/6WBeq4jjqvyEsfVZILXP0KyYq1P.jpg', overview: 'Tony Stark faces pressure from the government to share his technology while battling Ivan Vanko.' },
      { id: 10195, title: 'Thor', year: 2011, phase: 'Phase 1', order: 5, type: 'movie', vote_average: 6.8, poster_path: '/prSfAi1xGrhLQNxVSUFh61xQ4Qx.jpg', overview: 'The powerful but arrogant god Thor is cast out of Asgard to live amongst humans on Earth.' },
      { id: 24428, title: 'The Avengers', year: 2012, phase: 'Phase 1', order: 6, type: 'movie', vote_average: 7.7, poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', overview: 'Earth\'s mightiest heroes must come together to stop Loki and his alien army from enslaving humanity.' },
      { id: 299536, title: 'Avengers: Infinity War', year: 2018, phase: 'Phase 3', order: 7, type: 'movie', vote_average: 8.3, poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', overview: 'The Avengers and their allies must sacrifice all in an attempt to defeat Thanos before his devastation.' },
      { id: 299534, title: 'Avengers: Endgame', year: 2023, phase: 'Phase 3', order: 8, type: 'movie', vote_average: 8.3, poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg', overview: 'After Thanos wiped out half of all life, the remaining Avengers assemble once more to reverse his actions.' },
      { id: 533535, title: 'Deadpool & Wolverine', year: 2024, phase: 'Phase 5', order: 9, type: 'movie', vote_average: 7.7, poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', overview: 'A listless Wade Wilson toils in civilian life until a threat to his home world spurs him into action with Wolverine.' }
    ]
  },
  spider_verse: {
    id: 'spider_verse',
    title: 'Spider-Verse & Spider-Man Complete Order',
    subtitle: 'From Sam Raimi classics to Multiverse Across the Spider-Verse',
    badge: '🕷️ Web of Destiny',
    color: 'from-blue-600 via-rose-600 to-indigo-900',
    items: [
      { id: 557, title: 'Spider-Man', year: 2002, phase: 'Tobey Maguire Era', order: 1, type: 'movie', vote_average: 7.3, poster_path: '/gh4c2bk1Qen4XD9PT84YjhAhPtJ.jpg', overview: 'After being bitten by a genetically-modified spider, Peter Parker uses his new powers to fight crime.' },
      { id: 558, title: 'Spider-Man 2', year: 2004, phase: 'Tobey Maguire Era', order: 2, type: 'movie', vote_average: 7.3, poster_path: '/olxpyq9kJAZ2NU1iBgEiDNkuOhf.jpg', overview: 'Peter Parker struggles in his personal life while facing the brilliant and vengeful Otto Octavius.' },
      { id: 1930, title: 'The Amazing Spider-Man', year: 2012, phase: 'Andrew Garfield Era', order: 3, type: 'movie', vote_average: 6.7, poster_path: '/fSbqPbqGQUPSpTe4DY7A52ZkW3U.jpg', overview: 'Peter Parker uncovers a mystery about his parents\' disappearance that leads him to Dr. Curt Connors.' },
      { id: 315635, title: 'Spider-Man: Homecoming', year: 2017, phase: 'MCU Era', order: 4, type: 'movie', vote_average: 7.4, poster_path: '/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg', overview: 'Peter Parker balances his high school life with being the superhero Spider-Man under Tony Stark\'s guidance.' },
      { id: 324857, title: 'Spider-Man: Into the Spider-Verse', year: 2018, phase: 'Animated Multiverse', order: 5, type: 'movie', vote_average: 8.4, poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', overview: 'Teen Miles Morales becomes the new Spider-Man and joins other Spider-heroes across dimensions.' },
      { id: 634649, title: 'Spider-Man: No Way Home', year: 2021, phase: 'Multiverse Convergence', order: 6, type: 'movie', vote_average: 8.0, poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', overview: 'With Peter\'s identity revealed, a spell cast by Doctor Strange goes wrong, pulling villains from other dimensions.' },
      { id: 569094, title: 'Spider-Man: Across the Spider-Verse', year: 2023, phase: 'Animated Multiverse', order: 7, type: 'movie', vote_average: 8.4, poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.' }
    ]
  },
  star_wars: {
    id: 'star_wars',
    title: 'Star Wars Chronological Timeline',
    subtitle: 'Fall of the Republic to the Rise of the New Jedi Order',
    badge: '🌌 The Force Saga',
    color: 'from-amber-600 via-sky-600 to-indigo-900',
    items: [
      { id: 1893, title: 'Star Wars: Episode I - The Phantom Menace', year: 1999, phase: 'Republic Era', order: 1, type: 'movie', vote_average: 6.5, poster_path: '/6gQg5f95v7s8rY5u7g4j8k9L8M7.jpg', overview: 'Two Jedi Knights escape a hostile blockade and encounter a boy who could restore balance to the Force.' },
      { id: 1894, title: 'Star Wars: Episode II - Attack of the Clones', year: 2002, phase: 'Clone Wars', order: 2, type: 'movie', vote_average: 6.6, poster_path: '/oZNPzxqafZj4qzyR7g5L8M7K9J6.jpg', overview: 'Ten years after the invasion of Naboo, the galaxy is on the brink of civil war.' },
      { id: 1895, title: 'Star Wars: Episode III - Revenge of the Sith', year: 2005, phase: 'Fall of the Jedi', order: 3, type: 'movie', vote_average: 7.4, poster_path: '/tgr5qfsA2oxUpOzmr8K5L8M7K9J.jpg', overview: 'Three years into the Clone Wars, the Jedi rescue Palpatine from Count Dooku as Anakin succumbs to the dark side.' },
      { id: 330459, title: 'Rogue One: A Star Wars Story', year: 2016, phase: 'Rebellion Era', order: 4, type: 'movie', vote_average: 7.5, poster_path: '/qjiskwlV1qQzyePtV025wMYB61B.jpg', overview: 'A rogue band of resistance fighters unite for a mission to steal the Death Star plans.' },
      { id: 11, title: 'Star Wars: Episode IV - A New Hope', year: 1977, phase: 'Original Trilogy', order: 5, type: 'movie', vote_average: 8.2, poster_path: '/6FfCtAuVAW8XJjZ7eufHQbgj6dH.jpg', overview: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, and two droids to save the galaxy from the Empire.' },
      { id: 82856, title: 'The Mandalorian', year: 2019, phase: 'New Republic', order: 6, type: 'tv', vote_average: 8.4, poster_path: '/eU1i6eHXlzMOlEq0ku1R07Y87Nu.jpg', overview: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.' }
    ]
  },
  naruto: {
    id: 'naruto',
    title: 'Naruto & Shippuden Canon Watch Order',
    subtitle: 'Hidden Leaf Village — Canon Storyline without Filler Bloat',
    badge: '🍥 Will of Fire',
    color: 'from-orange-600 via-amber-600 to-indigo-900',
    items: [
      { id: 46260, title: 'Naruto (Part 1 - Classic)', year: 2002, phase: 'Classic Canon (Ep 1-135)', order: 1, type: 'tv', vote_average: 8.4, poster_path: '/xppeysfvDKVx77Cv1vL1n9Dba89.jpg', overview: 'Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.' },
      { id: 31910, title: 'Naruto Shippuden (Part 2)', year: 2007, phase: 'Shippuden Canon', order: 2, type: 'tv', vote_average: 8.6, poster_path: '/kV27ZwVaGZa4rqqqZAqN6P0L8y1.jpg', overview: 'Naruto returns after two and a half years of training to rescue his friend Sasuke and face the ominous Akatsuki.' },
      { id: 287757, title: 'The Last: Naruto the Movie', year: 2014, phase: 'Canon Interlude (Ep 493)', order: 3, type: 'movie', vote_average: 7.8, poster_path: '/bAQ8O5fe49IHlEQgHHf2mSsqdY1.jpg', overview: 'Two years after the Fourth Shinobi World War, the moon is drawing closer to Earth in a canon continuation.' },
      { id: 347201, title: 'Boruto: Naruto the Movie', year: 2015, phase: 'New Generation Canon', order: 4, type: 'movie', vote_average: 7.5, poster_path: '/7rU99aBq7M0lK8k6v7y8vL9M8N7.jpg', overview: 'Boruto Uzumaki, son of the Seventh Hokage, seeks to surpass his father with guidance from Sasuke Uchiha.' }
    ]
  }
};

export default function FranchiseTimelineModal({ isOpen, onClose, onSelectMedia }) {
  const [activeFranchiseKey, setActiveFranchiseKey] = useState('mcu');

  if (!isOpen) return null;

  const currentFranchise = FRANCHISE_TIMELINES[activeFranchiseKey] || FRANCHISE_TIMELINES.mcu;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-[#050b1d] border border-cyan-500/30 rounded-2xl shadow-[0_0_80px_rgba(56,189,248,0.3)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-5 border-b border-cyan-500/30 bg-[#070e24]/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-gray-950 font-black shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <Sparkles className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
                <span>Franchise & Universe Timelines</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Chronological
                </span>
              </h2>
              <p className="text-[11px] text-cyan-200/70 hidden sm:block">
                Letterboxd & Trakt style chronological watch orders. Never watch out of sequence again!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition border border-white/20 hover:border-rose-400 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Franchise Tabs Ribbon */}
        <div className="px-3 sm:px-5 py-2.5 bg-[#040817] border-b border-cyan-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {Object.values(FRANCHISE_TIMELINES).map((f) => {
            const isActive = activeFranchiseKey === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  soundFx.playClick?.();
                  setActiveFranchiseKey(f.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : 'bg-[#0a142e] text-slate-300 border-cyan-500/25 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{f.badge}</span>
                <span>{f.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#050b1d] border border-cyan-500/30 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-xl font-black text-white">{currentFranchise.title}</h3>
              <p className="text-xs sm:text-sm text-cyan-200/80 mt-0.5">{currentFranchise.subtitle}</p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
              {currentFranchise.items.length} Chronological Entries
            </span>
          </div>

          {/* Interactive Timeline List */}
          <div className="relative pl-6 sm:pl-8 space-y-4 border-l-2 border-cyan-500/30 ml-2 sm:ml-4 my-4">
            {currentFranchise.items.map((item, index) => {
              const poster = item.poster_path ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`) : './icon-512.png';
              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Node Pip */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-400 border-4 border-[#050b1d] shadow-[0_0_10px_rgba(56,189,248,0.8)] group-hover:scale-125 transition-transform" />

                  {/* Card Body */}
                  <div className="p-3 sm:p-4 rounded-xl bg-[#091533]/80 hover:bg-[#0c1d47] border border-cyan-500/25 hover:border-cyan-400/60 transition-all duration-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <img 
                        src={poster} 
                        alt={item.title} 
                        className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-lg border border-cyan-500/30 shrink-0 shadow"
                        onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            #{item.order} in Order
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {item.phase}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-cyan-400" />
                            <span>{item.year}</span>
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-base font-extrabold text-white truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">
                          {item.overview}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <button
                        onClick={() => {
                          soundFx.playClick?.();
                          onClose();
                          onSelectMedia?.(item);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.4)] active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-gray-950 text-gray-950" />
                        <span>Play Stream</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
