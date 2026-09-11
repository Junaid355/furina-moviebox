// ============================================================================
// Furina MovieBox — Cozy Web Audio API Sound Synthesizer
// Pure procedural Web Audio synthesis — zero external mp3/wav files required!
// Cozy, warm, cinematic clicks, bubble pops, and harmonic chimes.
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
   * Cozy Tactile Pill / Card Click — Warm wooden bubble pop
   */
  playClick() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch drop from 520Hz down to 240Hz for a cozy, soft tactile pop
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.045);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch (e) {}
  }

  /**
   * Cozy Hover Micro-tick — Ultra-soft airy responsive feedback
   */
  playHover() {
    if (this.muted) return;
    const nowMs = Date.now();
    // Debounce hover to avoid rapid-fire noise
    if (nowMs - this.lastHoverTime < 75) return;
    this.lastHoverTime = nowMs;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
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
   * Cozy Modal / Player Open Swell — Ambient warm glass chime chord
   */
  playModalOpen() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // C5 (523Hz), G5 (784Hz), C6 (1046Hz) triad
      const notes = [523.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0.05, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + idx * 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + 0.32 + idx * 0.03);
      });
    } catch (e) {}
  }

  /**
   * Cozy Modal Close — Soft subtle descending tone
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
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  /**
   * Cozy Success / Action Complete — Soft harp arpeggio
   */
  playSuccess() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major
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
 * Initializes global click and hover sound listeners across the app
 */
export function initGlobalSoundListeners() {
  if (typeof window === 'undefined') return;

  // Global click delegate for buttons, links, cards, and tabs
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    const interactiveEl = target.closest('button, a, .glass-card, [role="button"], input[type="checkbox"], input[type="radio"]');
    if (interactiveEl) {
      soundFx.playClick();
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
