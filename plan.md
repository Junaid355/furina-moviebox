# Furina MovieBox — Performance, Multi-Dub & Ad-Shield Overhaul Plan

## 1. Overview
Comprehensive overhaul of Furina MovieBox based on architectural inspection of `https://theogpiratebot.online/movie`, addressing UI lag, RAM overhead, multi-audio dubbing, streaming server reliability, and ad protection.

---

## 2. Reverse-Engineered Server Architecture (from TheOGPirateBot)
Inspection of `theogpiratebot.online` bundle revealed working multi-dub and low-ad streaming providers:
- **NxSha Prime (Multi-Dub / Clean)**:
  - Movie: `https://nxsha.space/embed/movie/${tmdbId}?lang=${lang}&disable_app_ad=true`
  - TV: `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?lang=${lang}&disable_app_ad=true`
  - Tested: HTTP 200, zero X-Frame-Options, native multi-dub with `disable_app_ad=true`.
- **VidStuck Pro (Multi-Dub)**:
  - Movie: `https://vidstuck.xyz/embed/movie/${tmdbId}?dubLang=${dubLang}&subtitle=english`
  - TV: `https://vidstuck.xyz/embed/tv/${tmdbId}/${season}/${episode}?dubLang=${dubLang}&subtitle=english`
  - Tested: HTTP 200, zero X-Frame-Options, multi-audio.
- **VidFast Ultra (4K High Bitrate)**:
  - Movie: `https://vidfast.vc/movie/${tmdbId}?autoPlay=true`
  - TV: `https://vidfast.vc/tv/${tmdbId}/${season}/${episode}?autoPlay=true`
  - Tested: HTTP 200, zero X-Frame-Options, fast 4K playback.
- **Bingr Stream (Fast Clean Stream)**:
  - Movie: `https://bingr.one/watch/movie/${tmdbId}`
  - TV: `https://bingr.one/watch/tv/${tmdbId}/${season}/${episode}`
  - Tested: HTTP 200, lightweight, zero bloat.
- **TgVid Cinema (Multi-Dub)**:
  - Movie: `https://tgvid.lovable.app/embed/movie/${tmdbId}?lang=${lang}`
  - TV: `https://tgvid.lovable.app/embed/tv/${tmdbId}/${season}/${episode}?lang=${lang}`
  - Tested: HTTP 200.

---

## 3. Real uBlock-Grade In-Browser Ad-Shield
Integrate official uBlock Origin filter rules directly into `src/services/adblocker.js`:
- **Domain Blacklist (250+ domains)**:
  - Block requests to `highperformanceformat.com`, `highrevenueformat.com`, `histats.com`, `deloton.com`, `onclickmega.com`, `profitablegate.com`, `alwingulla.com`, `bet365`, `1xbet`, etc.
- **Cosmetic CSS Element Hiding**:
  - Global CSS injection targeting popup overlays, Histats badges, floating scam banners, and clickjack anchors (`[id*="histats"]`, `[class*="popunder"]`, `[id*="ad-banner"]`).
- **Network Interception**:
  - Override `window.fetch` and `XMLHttpRequest.prototype.open` to abort blacklisted ad endpoints.
- **Window.open & Navigation Trap**:
  - Resilient recursive Proxy window defusing `document.write`, `location.replace`, and clickjack anchor clicks.

---

## 4. UI Lag & RAM Optimization (60-120 FPS Fluidity)
- **MediaCard.jsx**:
  - Remove `setState` inside `onMouseMove`. Use direct DOM style transform mutation via `requestAnimationFrame` to eliminate 60+ React component re-renders per second.
  - Remove synchronous `localStorage` lookups on every render pass; memoize watch progress.
- **BackgroundBeams.jsx**:
  - Replace CPU-heavy full-screen canvas gradient repaints with hardware-accelerated CSS aurora gradients.
  - Pause particle animation when video player or modals are open and when tab is in background.
- **SparklesCore.jsx**:
  - Limit particle density to 25-30 on mobile and 45 on desktop; pause animation with `IntersectionObserver`.

---

## 5. Player UI Polish & Mobile/iPhone Optimization
- Declutter the player modal: cleaner layout, high-contrast controls.
- Provide a dedicated, prominent **"Not playing? Next server"** rescue button that immediately switches to the next best verified mirror.
- Mobile/iPhone: Ensure safe area padding (`env(safe-area-inset-bottom)`), prevent auto-zoom with 16px text on inputs, and lock horizontal overflow.

---

## 6. Verification & Deployment
- Automated browser testing via CDP with Microsoft Edge.
- Production Vite compilation (`npm run build`).
- Full deployment to GitHub Pages (`gh-pages`) and `main` branch.
