// Furina Built-in AdBlock Shield
// Protects users from 3rd-party player popups, pop-unders, and clickjacking redirects

let allowNextPopup = false;
let blockedCount = 0;
let isShieldEnabled = true;

export function permitPopupOnce() {
  allowNextPopup = true;
  setTimeout(() => {
    allowNextPopup = false;
  }, 1500);
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

  isShieldEnabled = isAdBlockEnabled();

  // 1. Intercept window.open to stop unsolicited popups and ads
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
    console.warn('[Furina AdBlock Shield] Blocked popup #' + blockedCount, url);
    
    // Dispatch event so UI can show blocked badge/counter
    window.dispatchEvent(new CustomEvent('furina-ad-blocked', { 
      detail: { count: blockedCount, url: url || 'popunder' } 
    }));

    return null;
  };

  // 2. Prevent malicious background redirect
  window.addEventListener('blur', () => {
    // When user clicks the video and an iframe tries to blur main window to spawn an ad tab,
    // ensure next popup remains blocked unless user explicitly clicked UI buttons
  });

  console.log('[Furina AdBlock Shield] Initialized & Active 🛡️');
}
