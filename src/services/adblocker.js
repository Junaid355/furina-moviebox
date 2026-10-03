// Furina Built-in uBlock-Grade Ad-Shield Engine
// Protects users from 3rd-party player popups, pop-unders, clickjacking overlays, and scam redirects
// Features: Window.open Trap, Pop-under Neutralizer, Top-Navigation Shield, AI Clean Routing

let allowNextPopup = false;
let allowNextNavigation = false;
let isShieldEnabled = true;
let shieldMode = 'smart'; // 'smart' (default: zero-sandbox, 100% video playback) | 'strict' (HTML5 sandbox)
let playerIsActive = false;
let blockedLogs = [];

const MAX_LOGS = 50;

// Known intrusive ad networks, scam redirects, and malicious trackers
const AD_PATTERNS = [
  /popads/i, /adsterra/i, /propeller/i, /clickadu/i, /juicyads/i, /exoclick/i,
  /monetag/i, /hilltopads/i, /highperformancegate/i, /syndication/i, /bet365/i,
  /1xbet/i, /casino/i, /onclick/i, /trafficjunky/i, /doubleclick/i, /adservice/i,
  /outbrain/i, /taboola/i, /mgid/i, /track(?:er)?\./i, /redirect\./i, /affiliate/i,
  /robot-verify/i, /captcha-check/i, /bonus-win/i, /prize-alert/i, /download-now\./i,
  /joywin/i, /cardiacrystal/i, /borojeet/i, /slots/i, /jackpot/i, /gamble/i, /win88/i,
  /gussiessmutchy/i, /paidmed/i, /utm_campaign/i
];

function getInitialBlockedCount() {
  try {
    const saved = localStorage.getItem('furina_blocked_ads_count');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch (e) {}
  return 0;
}

let blockedCount = getInitialBlockedCount();

export function permitPopupOnce() {
  allowNextPopup = true;
  setTimeout(() => {
    allowNextPopup = false;
  }, 2500);
}

export function allowLegitimateNavigation() {
  allowNextNavigation = true;
  setTimeout(() => {
    allowNextNavigation = false;
  }, 3000);
}

export function setPlayerActive(active) {
  playerIsActive = Boolean(active);
}

export function isPlayerActive() {
  return playerIsActive;
}

export function getBlockedCount() {
  return blockedCount;
}

export function resetBlockedCount() {
  blockedCount = 0;
  try {
    localStorage.setItem('furina_blocked_ads_count', '0');
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('furina-ad-blocked', { 
    detail: { count: 0, type: 'reset', url: 'reset' } 
  }));
}

export function getShieldMode() {
  try {
    const saved = localStorage.getItem('furina_adshield_mode');
    if (saved === 'strict' || saved === 'smart') return saved;
  } catch (e) {}
  return 'smart'; // Default: smart shield for 100% player compatibility with zero sandbox errors
}

export function setShieldMode(mode) {
  shieldMode = mode === 'strict' ? 'strict' : 'smart';
  try {
    localStorage.setItem('furina_adshield_mode', shieldMode);
    window.dispatchEvent(new CustomEvent('furina-shield-mode-changed', { detail: { mode: shieldMode } }));
  } catch (e) {}
}

export function isAdBlockEnabled() {
  try {
    const saved = localStorage.getItem('furina_adshield_active');
    if (saved !== null) return saved === 'true';
    const s = JSON.parse(localStorage.getItem('furina_settings') || '{}');
    if (typeof s.adShieldMode === 'boolean') return s.adShieldMode;
    return true;
  } catch (e) {
    return true;
  }
}

export function setShieldEnabled(enabled) {
  isShieldEnabled = Boolean(enabled);
  try {
    localStorage.setItem('furina_adshield_active', isShieldEnabled ? 'true' : 'false');
    const s = JSON.parse(localStorage.getItem('furina_settings') || '{}');
    s.adShieldMode = isShieldEnabled;
    localStorage.setItem('furina_settings', JSON.stringify(s));
    window.dispatchEvent(new CustomEvent('furina-ad-blocked', { 
      detail: { count: blockedCount, type: isShieldEnabled ? 'enabled' : 'disabled' } 
    }));
  } catch (e) {}
}

function recordBlockedEvent(type, url, rule = 'Anti-Popunder Trap') {
  blockedCount++;
  try {
    localStorage.setItem('furina_blocked_ads_count', String(blockedCount));
  } catch (e) {}

  const logEntry = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toLocaleTimeString(),
    type,
    url: String(url || 'unknown-ad-url').slice(0, 100),
    rule
  };
  blockedLogs = [logEntry, ...blockedLogs.slice(0, MAX_LOGS - 1)];

  console.warn(`[Furina Ad-Shield Pro] Blocked ${type} #${blockedCount} (${rule}):`, url);

  window.dispatchEvent(new CustomEvent('furina-ad-blocked', { 
    detail: { 
      count: blockedCount, 
      type, 
      url: logEntry.url,
      rule,
      log: logEntry
    } 
  }));
}

export function getRecentBlockedLogs() {
  return [...blockedLogs];
}

export function simulateBlockedAd(simType = 'popup') {
  const samples = [
    { type: 'popup', url: 'https://popads.net/serve/ad?c=casino', rule: 'Anti-Popunder Trap' },
    { type: 'redirect', url: 'https://highperformancegate.com/redirect?id=scam', rule: 'Scam Top-Redirect Guard' },
    { type: 'clickjack', url: 'https://adsterra.com/directlink?track=overlay', rule: 'Invisible Overlay Neutralizer' }
  ];
  const sample = samples.find(s => s.type === simType) || samples[0];
  recordBlockedEvent(sample.type, sample.url, sample.rule);
}

// Check if a URL looks like an ad or scam redirect
function isAdUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return AD_PATTERNS.some(p => p.test(url));
}

// Dummy window proxy returned by window.open so embed scripts don't crash
const dummyWindowProxy = {
  closed: true,
  opener: null,
  focus: () => {},
  blur: () => {},
  close: () => {},
  postMessage: () => {},
  document: null,
  location: { href: 'about:blank' }
};

export function initAdBlocker() {
  if (typeof window === 'undefined') return;
  if (window.__furina_adblocker_initialized) return;
  window.__furina_adblocker_initialized = true;

  try {
    isShieldEnabled = isAdBlockEnabled();
    shieldMode = getShieldMode();

    // 1. WINDOW.OPEN TRAP: Intercept window.open on top-level window
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
      if (!isShieldEnabled) {
        return originalWindowOpen.apply(window, arguments);
      }

      // Allow legitimate app actions (like trailer / external download with user confirmation)
      if (allowNextPopup) {
        allowNextPopup = false;
        return originalWindowOpen.apply(window, arguments);
      }

      // Check if URL is legitimate Furina or YouTube action
      const urlStr = String(url || '');
      if (urlStr.includes('youtube.com') || urlStr.includes('github.com') || urlStr.includes('themoviedb.org')) {
        return originalWindowOpen.apply(window, arguments);
      }

      // Otherwise, block the rogue popup attempt
      recordBlockedEvent('popup', urlStr || 'about:blank', 'Anti-Popunder Trap');
      return dummyWindowProxy;
    };

    // 2. CLICK HIJACK & POP-UNDER NEUTRALIZER: Trap dynamic anchor clicks
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      if (isShieldEnabled && this.href) {
        const href = this.href;
        if (isAdUrl(href) || (playerIsActive && this.target === '_blank' && !allowNextPopup && !href.includes(window.location.hostname))) {
          recordBlockedEvent('clickjack', href, 'Invisible Overlay Neutralizer');
          return;
        }
      }
      return originalAnchorClick.apply(this, arguments);
    };

    // 3. TOP-NAVIGATION SHIELD: Prevent rogue iframes from hijacking parent page
    window.addEventListener('beforeunload', (e) => {
      if (!isShieldEnabled || allowNextNavigation || !playerIsActive) return;

      // An unexpected beforeunload while player is active is typically an iframe top-navigation attempt
      recordBlockedEvent('redirect', 'window.top.location hijacking', 'Scam Top-Redirect Guard');
      
      const warning = 'Furina Ad-Shield: Protected this tab from an unauthorized redirect by the video player mirror.';
      e.preventDefault();
      e.returnValue = warning;
      return warning;
    });

    // 4. FOCUS RETENTION GUARD: Instantly regain focus if an iframe spawns a popunder
    window.addEventListener('blur', () => {
      if (!isShieldEnabled || !playerIsActive) return;
      setTimeout(() => {
        if (document.hidden === false) {
          window.focus();
        }
      }, 80);
    });

    console.log('[Furina Ad-Shield Pro] Engine active: Window.open trap, Anti-Redirect & Overlay Neutralizer initialized 🛡️');
  } catch (err) {
    console.warn('[Furina Ad-Shield Pro] Initialization warning:', err);
  }
}
