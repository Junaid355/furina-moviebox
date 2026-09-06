// Furina Built-in AdBlock Shield
// Protects users from 3rd-party player popups, pop-unders, and clickjacking redirects

let allowNextPopup = false;
let blockedCount = 0;
let isShieldEnabled = true;

export function permitPopupOnce() {
  allowNextPopup = true;
  setTimeout(() => {
    allowNextPopup = false;
  }, 2000);
}

export function getBlockedCount() {
  return blockedCount;
}

export function setShieldEnabled(enabled) {
  isShieldEnabled = enabled;
  try {
    localStorage.setItem('furina_adblock_enabled', enabled ? '1' : '0');
  } catch (e) {}
}

export function isAdBlockEnabled() {
  try {
    const saved = localStorage.getItem('furina_adblock_enabled');
    return saved === null ? true : saved === '1';
  } catch (e) {
    return true;
  }
}

export function initAdBlocker() {
  if (typeof window === 'undefined') return;

  try {
    isShieldEnabled = isAdBlockEnabled();

    // 1. Intercept window.open on top-level window to stop unsolicited popups and ads
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
      if (!isShieldEnabled) {
        return originalWindowOpen.apply(window, arguments);
      }

      if (allowNextPopup) {
        allowNextPopup = false;
        return originalWindowOpen.apply(window, arguments);
      }

      blockedCount++;
      console.warn('[Furina AdBlock Shield] Blocked top-level popup #' + blockedCount, url);
      
      // Dispatch event so UI can show blocked badge/counter
      window.dispatchEvent(new CustomEvent('furina-ad-blocked', { 
        detail: { count: blockedCount, url: url || 'popunder' } 
      }));

      return null;
    };

    // 2. Prevent malicious background redirect & retain window focus
    window.addEventListener('blur', () => {
      if (!isShieldEnabled) return;
      // When user clicks the video and an iframe attempts to steal focus for an ad,
      // re-focus the moviebox tab
      setTimeout(() => {
        window.focus();
      }, 150);
    });

    console.log('[Furina AdBlock Shield] Initialized & Active 🛡️');
  } catch (err) {
    console.warn('[Furina AdBlock Shield] Failed to initialize:', err);
  }
}

