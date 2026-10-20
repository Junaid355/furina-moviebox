// ============================================================================
// Furina MovieBox — Fast Settings Storage & Theme Runtime Engine
// Lightweight service decoupled from SettingsModal UI for instant initial load.
// ============================================================================

export const DEFAULT_SETTINGS = {
  // Playback
  defaultAudioLang: 'hi', // 'hi' | 'en' | 'ja' | 'auto'
  defaultSubtitleLang: 'en', // 'en' | 'hi' | 'ja' | 'off'
  autoplay: true,
  autoNextEpisode: true,
  rememberProgress: true,
  playbackQuality: '4k', // '4k' | '1080p' | '720p' | 'auto'

  // Language
  appLanguage: 'en', // 'en' | 'hi' | 'ja'
  preferredAudioLanguage: 'hi',
  preferredSubtitleLanguage: 'en',
  autoSelectAvailable: true,

  // Audio
  audioLanguage: 'hindi', // 'hindi' | 'english' | 'japanese' | 'auto'
  rememberAudioPerTitle: true,
  audioTrackDetection: true,
  volumeNormalization: true,

  // Subtitles
  subtitlesEnabled: true,
  subtitleSize: 'medium', // 'small' | 'medium' | 'large' | 'xlarge'
  subtitleOpacity: 100, // 100 | 80 | 60
  subtitleBackground: 'transparent', // 'transparent' | 'box' | 'shadow'
  subtitleStyle: 'cyan', // 'cyan' | 'white' | 'amber' | 'yellow'

  // Appearance
  theme: 'furina_hydro', // 'furina_hydro' | 'midnight' | 'amethyst' | 'emerald'
  accentColor: 'cyan',
  playerStyle: 'cinematic', // 'cinematic' | 'minimal' | 'studio'
  animations: true,
  compactUi: false,

  // Player
  skipForwardSecs: 10,
  skipBackwardSecs: 10,
  autoHideControls: 3,
  keyboardShortcuts: true,
  fullscreenBehavior: 'cinema',
  adShieldMode: true,

  // Mobile
  mobileControls: 'touch_optimized',
  gestureControls: true,
  preventTypingBackNav: true,
  mobileSettingsLayout: 'comfortable'
};

export function applyThemeAndAppSettings(settings, emitEvent = false) {
  if (typeof document === 'undefined') return;
  try {
    const root = document.documentElement;
    const body = document.body;

    const theme = settings?.theme || 'furina_hydro';
    root.setAttribute('data-theme', theme);

    if (theme === 'midnight') {
      body.style.backgroundColor = '#000000';
    } else if (theme === 'amethyst') {
      body.style.backgroundColor = '#0b0416';
    } else if (theme === 'emerald') {
      body.style.backgroundColor = '#03120d';
    } else {
      body.style.backgroundColor = '#030712';
    }

    const accents = {
      cyan: '#06b6d4',
      amber: '#f59e0b',
      purple: '#a855f7',
      emerald: '#10b981'
    };
    const accent = accents[settings?.accentColor] || '#06b6d4';
    root.style.setProperty('--accent-color', accent);

    if (settings?.animations === false) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings?.compactUi) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    if (emitEvent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('furina:settings-changed', { detail: settings }));
    }
  } catch (e) {}
}

export function getStoredSettings() {
  try {
    const raw = localStorage.getItem('furina_settings');
    if (raw) {
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      applyThemeAndAppSettings(parsed);
      return parsed;
    }
  } catch (e) {}
  applyThemeAndAppSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(newSettings) {
  try {
    localStorage.setItem('furina_settings', JSON.stringify(newSettings));
    applyThemeAndAppSettings(newSettings, true);
  } catch (e) {}
}
