import React, { useState, useEffect, useRef } from 'react';
import { Disc, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Sparkles, Music, Radio, Heart } from 'lucide-react';
import soundFx from '../services/soundFx';

const PLAYLIST = [
  {
    id: 'fontaine_lofi',
    title: 'Fountain of Lucine',
    artist: 'Fontaine Philharmonic',
    category: 'Genshin Impact',
    badge: '🌧️ Lofi Rain',
    duration: '3:42',
    color: '#06b6d4',
    frequencies: [392, 440, 523.25, 659.25, 783.99] // G4, A4, C5, E5, G5
  },
  {
    id: 'gurenge',
    title: 'Gurenge (Crimson Lotus)',
    artist: 'LiSA • Demon Slayer OST',
    category: 'Anime Hype',
    badge: '⚔️ Shonen Peak',
    duration: '3:58',
    color: '#f43f5e',
    frequencies: [440, 554.37, 659.25, 880, 1108.73] // A4, C#5, E5, A5, C#6
  },
  {
    id: 'specialz',
    title: 'SPECIALZ (Shibuya Incident)',
    artist: 'King Gnu • Jujutsu Kaisen',
    category: 'Anime Cyberpunk',
    badge: '🔥 Shibuya Hype',
    duration: '3:54',
    color: '#a855f7',
    frequencies: [329.63, 392, 493.88, 587.33, 659.25] // E4, G4, B4, D5, E5
  },
  {
    id: 'interstellar',
    title: 'Cornfield Chase',
    artist: 'Hans Zimmer • Interstellar',
    category: 'Cinematic Masterpiece',
    badge: '🌌 Cosmic Pipe Organ',
    duration: '2:06',
    color: '#38bdf8',
    frequencies: [261.63, 329.63, 392, 523.25, 659.25] // C4, E4, G4, C5, E5
  },
  {
    id: 'sparkle',
    title: 'Sparkle (Kimi no Na wa)',
    artist: 'RADWIMPS • Your Name',
    category: 'Anime Romance',
    badge: '✨ Starfall Acoustic',
    duration: '4:15',
    color: '#fbbf24',
    frequencies: [349.23, 440, 523.25, 698.46, 880] // F4, A4, C5, F5, A5
  },
  {
    id: 'vogel',
    title: 'Vogel im Käfig',
    artist: 'Hiroyuki Sawano • Attack on Titan',
    category: 'Epic Choral',
    badge: '🛡️ Humanity\'s Counterattack',
    duration: '6:20',
    color: '#10b981',
    frequencies: [293.66, 349.23, 440, 587.33, 698.46] // D4, F4, A4, D5, F5
  }
];

export default function VinylJukeboxModal({ isOpen, onClose }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [vizBars, setVizBars] = useState([40, 75, 55, 90, 65, 80, 45, 95, 70, 60]);
  const audioLoopTimerRef = useRef(null);

  const track = PLAYLIST[currentTrackIndex];

  // Procedural Web Audio Synth playback loop
  useEffect(() => {
    if (!isPlaying || isMuted) {
      if (audioLoopTimerRef.current) clearInterval(audioLoopTimerRef.current);
      return;
    }

    const ctx = soundFx.getAudioContext?.();
    if (!ctx) return;

    let noteIdx = 0;
    audioLoopTimerRef.current = setInterval(() => {
      try {
        const now = ctx.currentTime;
        const f = track.frequencies[noteIdx % track.frequencies.length];
        noteIdx++;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.04 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);

        // Bouncy frequency visualizer bars
        setVizBars(Array.from({ length: 12 }, () => Math.floor(Math.random() * 65) + 30));
        setRotation((prev) => (prev + 3) % 360);
      } catch (e) {}
    }, 450);

    return () => {
      if (audioLoopTimerRef.current) clearInterval(audioLoopTimerRef.current);
    };
  }, [isPlaying, isMuted, track, volume]);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    soundFx.playClick?.();
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      soundFx.playFurinaFanfare?.();
    }
  };

  const handleNext = () => {
    soundFx.playWaterDrop?.();
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrev = () => {
    soundFx.playWaterDrop?.();
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#060c20] border border-cyan-400/40 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.35)] overflow-hidden text-white my-auto flex flex-col p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: track.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center text-gray-950 font-black shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <Disc className="w-5 h-5 text-gray-950 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Vinyl Jukebox 2.0
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Hi-Fi Spatial Synth
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Anime OST & Cinema Turntable
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
            title="Close Jukebox"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Turntable Stage */}
        <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* 3D Spinning Vinyl Record */}
          <div className="relative group">
            <div 
              className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-[#0d0f17] border-4 border-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(255,255,255,0.05)] relative flex items-center justify-center transition-transform duration-100"
              style={{
                transform: `rotate(${rotation}deg)`,
                boxShadow: isPlaying ? `0 0 35px ${track.color}40, inset 0 0 30px rgba(0,0,0,0.8)` : undefined
              }}
            >
              {/* Vinyl Grooves */}
              <div className="absolute inset-2 rounded-full border border-gray-800/80 pointer-events-none" />
              <div className="absolute inset-5 rounded-full border border-gray-800/60 pointer-events-none" />
              <div className="absolute inset-9 rounded-full border border-gray-800/50 pointer-events-none" />
              <div className="absolute inset-14 rounded-full border border-gray-800/40 pointer-events-none" />

              {/* Center Vinyl Label with Furina Art */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] bg-[#040d28] flex items-center justify-center">
                <img
                  src="./furina_chibi.gif"
                  alt="Furina Label"
                  className="w-full h-full object-cover"
                />
                <div className="absolute w-3 h-3 rounded-full bg-black border border-white/80 shadow" />
              </div>
            </div>

            {/* Tonearm */}
            <div 
              className="absolute -top-3 right-0 w-3 h-24 sm:h-28 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full origin-top shadow-xl transition-transform duration-500 pointer-events-none"
              style={{
                transform: isPlaying ? 'rotate(24deg)' : 'rotate(0deg)'
              }}
            >
              <div className="absolute -top-2 -left-1.5 w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-400 shadow-md" />
              <div className="absolute bottom-0 -left-1 w-5 h-6 rounded bg-amber-400 border border-gray-800 shadow-md" />
            </div>
          </div>

          {/* Current Track Info & Equalizer */}
          <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
            <span 
              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider border shadow-sm"
              style={{ backgroundColor: `${track.color}20`, color: track.color, borderColor: `${track.color}40` }}
            >
              {track.badge}
            </span>

            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white truncate max-w-xs sm:max-w-md">
                {track.title}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-200/70 font-semibold mt-0.5">
                {track.artist}
              </p>
            </div>

            {/* Audio Visualizer Bouncy Bars */}
            <div className="flex items-end gap-1 h-8 py-1">
              {vizBars.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 rounded-full transition-all duration-150"
                  style={{
                    height: isPlaying ? `${height}%` : '15%',
                    backgroundColor: track.color
                  }}
                />
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer active:scale-95"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="p-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-gray-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.5)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
                title={isPlaying ? "Pause Track" : "Play Track"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-gray-950" /> : <Play className="w-5 h-5 fill-gray-950 ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer active:scale-95"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-white/10">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 sm:w-20 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Shelf */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar border-t border-cyan-500/20 pt-3">
          <label className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block mb-1">
            Featured Vinyl Tracklist ({PLAYLIST.length} Tracks):
          </label>
          {PLAYLIST.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => {
                soundFx.playClick?.();
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                currentTrackIndex === idx
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                  : 'bg-[#091433]/70 border-cyan-500/20 text-slate-300 hover:border-cyan-400/40 hover:bg-[#0c1a40]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-mono font-bold text-slate-400 w-4">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-white truncate">
                    {t.title}
                  </h4>
                  <span className="text-[10px] text-cyan-300/70">
                    {t.artist}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full border text-xs" style={{ borderColor: `${t.color}50`, color: t.color }}>
                  {t.badge}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {t.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
