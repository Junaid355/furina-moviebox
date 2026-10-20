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

// Known intrusive ad networks, scam redirects, trackers, and uBlock Origin filter rules
const AD_PATTERNS = [
  /popads/i, /adsterra/i, /propeller/i, /clickadu/i, /juicyads/i, /exoclick/i,
  /monetag/i, /hilltopads/i, /highperformance/i, /highrevenue/i, /syndication/i, /bet365/i,
  /1xbet/i, /casino/i, /onclick/i, /trafficjunky/i, /doubleclick/i, /adservice/i,
  /outbrain/i, /taboola/i, /mgid/i, /track(?:er)?\./i, /redirect\./i, /affiliate/i,
  /robot-verify/i, /captcha-check/i, /bonus-win/i, /prize-alert/i, /download-now\./i,
  /joywin/i, /cardiacrystal/i, /borojeet/i, /slots/i, /jackpot/i, /gamble/i, /win88/i,
  /gussiessmutchy/i, /paidmed/i, /utm_campaign/i, /clck\./i, /shorturl\./i, /bit\.ly/i,
  /telegram\.me/i, /t\.me\/(?:\+|(?:joinchat))/i, /vividbreeze/i, /whistlebreeze/i,
  /histats\.com/i, /deloton\.com/i, /profitablegate\.com/i, /onclickmega\.com/i,
  /alwingulla\.com/i, /whos\.amung\.us/i, /adskeeper\.com/i, /adnxs\.com/i,
  /adform\.net/i, /bidswitch\.net/i, /rubiconproject\.com/i, /coinhive\.com/i
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

// Bulletproof Proxy-based dummy window that absorbs all calls and properties safely without crashing embed scripts
export function createDummyWindow() {
  const dummyDoc = new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'location') return dummyLoc;
      if (prop === 'write' || prop === 'writeln' || prop === 'open' || prop === 'close') return () => {};
      if (prop === 'createElement') return () => ({ setAttribute: () => {}, style: {}, appendChild: () => {} });
      if (prop === 'getElementById' || prop === 'querySelector' || prop === 'querySelectorAll') return () => null;
      if (prop === 'body' || prop === 'documentElement' || prop === 'head') return { appendChild: () => {}, removeChild: () => {}, style: {} };
      return () => {};
    }
  });

  const dummyLoc = new Proxy({ href: 'about:blank', origin: 'about:blank', pathname: '', search: '', hash: '' }, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      if (prop === 'replace' || prop === 'assign' || prop === 'reload') return () => {};
      return () => {};
    },
    set: (target, prop, val) => {
      target[prop] = val;
      return true;
    }
  });

  const dummyWin = {
    closed: false,
    opener: null,
    document: dummyDoc,
    location: dummyLoc,
    focus: () => {},
    blur: () => {},
    close: function() { this.closed = true; },
    postMessage: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  };

  dummyWin.window = dummyWin;
  dummyWin.self = dummyWin;
  dummyWin.top = dummyWin;
  dummyWin.parent = dummyWin;

  return new Proxy(dummyWin, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      return () => {};
    }
  });
}

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
      return createDummyWindow();
    };

    // 2. CAPTURE-PHASE CLICK TRAP: Intercept physical clicks on invisible overlays & scam links
    document.addEventListener('click', (e) => {
      if (!isShieldEnabled) return;
      const target = e.target;
      const anchor = target && typeof target.closest === 'function' ? target.closest('a') : null;
      if (anchor && anchor.href) {
        // Exempt legitimate downloads and blob/data URLs
        if (anchor.hasAttribute('download') || 
            anchor.href.startsWith('blob:') || 
            anchor.href.startsWith('data:') || 
            allowNextPopup) {
          return;
        }
        const href = anchor.href;
        const isInternal = href.includes(window.location.hostname);
        const isLegitService = href.includes('youtube.com') || href.includes('github.com') || href.includes('themoviedb.org');

        if (isAdUrl(href) || (playerIsActive && anchor.target === '_blank' && !isInternal && !isLegitService)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          recordBlockedEvent('clickjack', href, 'Invisible Overlay Neutralizer');
        }
      }
    }, true);

    // 2b. CLICK HIJACK & POP-UNDER NEUTRALIZER: Trap programmatic dynamic anchor clicks
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      if (isShieldEnabled && this.href) {
        // Exempt legitimate downloads and blob URLs
        if (this.hasAttribute('download') || this.href.startsWith('blob:') || this.href.startsWith('data:') || allowNextPopup) {
          return originalAnchorClick.apply(this, arguments);
        }
        const href = this.href;
        const isInternal = href.includes(window.location.hostname);
        const isLegitService = href.includes('youtube.com') || href.includes('github.com') || href.includes('themoviedb.org');

        if (isAdUrl(href) || (playerIsActive && this.target === '_blank' && !isInternal && !isLegitService)) {
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

    // 5. uBlock Origin COSMETIC ELEMENT HIDING: Inject CSS rules to hide ad containers
    if (!document.getElementById('ublock-cosmetic-shield')) {
      const style = document.createElement('style');
      style.id = 'ublock-cosmetic-shield';
      style.textContent = `
        [id*="histats"], [class*="histats"],
        [class*="popunder"], [id*="popunder"],
        [class*="ad-overlay"], [id*="ad-overlay"],
        [id*="ad-banner"], [class*="ad-banner"],
        a[href*="bet365"], a[href*="1xbet"],
        a[href*="highperformance"], a[href*="highrevenue"],
        iframe[src*="histats"], iframe[src*="adsterra"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // 6. NETWORK INTERCEPTION: Filter malicious ad network calls in fetch and XHR
    if (typeof window.fetch === 'function') {
      const originalFetch = window.fetch;
      window.fetch = function(resource, init) {
        const url = typeof resource === 'string' ? resource : resource?.url;
        if (isShieldEnabled && url && isAdUrl(url)) {
          recordBlockedEvent('network-fetch', url, 'uBlock Network Filter');
          return Promise.reject(new Error('Blocked by Furina uBlock Shield'));
        }
        return originalFetch.apply(this, arguments);
      };
    }

    if (typeof window.XMLHttpRequest === 'function') {
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url) {
        if (isShieldEnabled && url && typeof url === 'string' && isAdUrl(url)) {
          recordBlockedEvent('network-xhr', url, 'uBlock Network Filter');
          return;
        }
        return originalOpen.apply(this, arguments);
      };
    }

    console.log('[Furina Ad-Shield Pro] Engine active: uBlock Filters, Anti-Redirect & Overlay Neutralizer initialized 🛡️');
  } catch (err) {
    console.warn('[Furina Ad-Shield Pro] Initialization warning:', err);
  }
}
