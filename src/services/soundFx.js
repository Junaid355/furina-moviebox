// ============================================================================
// Furina MovieBox — 3D Spatial Web Audio Synthesizer & Hydro Sound Engine
// Pure procedural Web Audio synthesis — zero external mp3/wav files required!
// Rich 3D spatial clicks, crystal bubble pops, hydro chimes & modal whooshes.
// ============================================================================

class SoundEffectsEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.lastHoverTime = 0;
    
    // Read persisted sound preference
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('furina_sound_fx');
        if (stored !== null) {
          this.muted = stored === 'false';
        }
      }
    } catch (e) {}
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    try {
      localStorage.setItem('furina_sound_fx', String(!this.muted));
    } catch (e) {}
  }

  toggleMute() {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.playToggle(true);
    }
    return !this.muted;
  }

  /**
   * Helper to create stereo panner node for true 3D spatial positioning
   */
  createSpatialPanner(ctx, pan = 0) {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clampedPan, ctx.currentTime);
      return panner;
    }
    return null;
  }

  /**
   * 3D Spatial Tactile Pill / Card Click — Warm hydro bubble pop with stereo panning
   * @param {number} pan - Stereo balance from -1.0 (left) to 1.0 (right)
   */
  playClick(pan = 0) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = this.createSpatialPanner(ctx, pan);

      osc.type = 'sine';
      // Pitch drop from 580Hz down to 220Hz for a crisp, tactile hydro pop
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  /**
   * Direct 3D Spatial Click alias
   */
  play3DSpatialClick(pan = 0) {
    this.playClick(pan);
  }

  /**
   * Cozy Hydro Hover Micro-tick / Bubble Pop — Ultra-soft responsive crystal feedback
   */
  playHover() {
    if (this.muted) return;
    const nowMs = Date.now();
    // Debounce hover to avoid rapid-fire noise
    if (nowMs - this.lastHoverTime < 70) return;
    this.lastHoverTime = nowMs;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.022);

      gain.gain.setValueAtTime(0.022, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.032);
    } catch (e) {}
  }

  /**
   * Hydro Water Droplet — Distinctive Furina water drop chime
   */
  playWaterDrop() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.09);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  /**
   * Cozy Toggle Switch Chime — Melodic two-tone rise or fall
   */
  playToggle(state = true) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freq1 = state ? 440 : 660;
      const freq2 = state ? 660 : 440;

      // Note 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq1, now);
      gain1.gain.setValueAtTime(0.07, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // Note 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq2, now + 0.06);
      gain2.gain.setValueAtTime(0.08, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.17);
    } catch (e) {}
  }

  /**
   * Cinematic Modal Open Whoosh & Harmonic Glass Chord
   */
  playModalOpen() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // 1. Airy whoosh sweep
      const whooshOsc = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whooshOsc.type = 'sine';
      whooshOsc.frequency.setValueAtTime(180, now);
      whooshOsc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
      whooshGain.gain.setValueAtTime(0.04, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      whooshOsc.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whooshOsc.start(now);
      whooshOsc.stop(now + 0.15);

      // 2. C5 (523Hz), G5 (784Hz), C6 (1046Hz) hydro triad
      const notes = [523.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.04 + idx * 0.03);

        gain.gain.setValueAtTime(0.05, now + 0.04 + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32 + idx * 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 0.04 + idx * 0.03);
        osc.stop(now + 0.36 + idx * 0.03);
      });
    } catch (e) {}
  }

  /**
   * Cozy Modal Close Whoosh — Soft subtle descending tone
   */
  playModalClose() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  /**
   * Cinematic Play Start Chime — Fontaine Opera Premiere Fanfare Chord
   */
  playStartChime() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Majestic hydro chord: F4 (349Hz), A4 (440Hz), C5 (523Hz), F5 (698Hz), A5 (880Hz)
      const chord = [349.23, 440.00, 523.25, 698.46, 880.00];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.035);

        gain.gain.setValueAtTime(0.055, now + i * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + i * 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.035);
        osc.stop(now + 0.5 + i * 0.035);
      });
    } catch (e) {}
  }

  /**
   * 3D Spotlight Search Beam Sound Effect
   */
  playSearchBeam() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.09);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  /**
   * Action Complete / Success / Watchlist Added
   */
  playSuccess() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);
        gain.gain.setValueAtTime(0.06, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2 + idx * 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.25 + idx * 0.04);
      });
    } catch (e) {}
  }
}

export const soundFx = new SoundEffectsEngine();

/**
 * Initializes global click and hover sound listeners with 3D spatial panning
 */
export function initGlobalSoundListeners() {
  if (typeof window === 'undefined') return;

  // Global click delegate for buttons, links, cards, and tabs with spatial audio
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    const interactiveEl = target.closest('button, a, .glass-card, [role="button"], input[type="checkbox"], input[type="radio"]');
    if (interactiveEl) {
      // Calculate 3D stereo panning based on mouse position on screen
      const pan = window.innerWidth ? Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1)) : 0;
      soundFx.playClick(pan);
    }
  }, { passive: true });

  // Subtle hover feedback on interactive cards and major buttons
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    const hoverTarget = target.closest('.glass-card, button.group, nav button');
    if (hoverTarget) {
      soundFx.playHover();
    }
  }, { passive: true });
}

export default soundFx;
