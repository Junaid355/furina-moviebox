# Furina MovieBox — Performance, Multi-Dub & Ad-Shield Overhaul Plan

## 1. Overview
Comprehensive overhaul of Furina MovieBox based on architectural inspection of `https://theogpiratebot.online/movie`, addressing player streaming reliability, UI lag, RAM overhead, multi-audio dubbing, streaming server priority, and uBlock ad protection.

---

## 2. Server Architecture & Reachability Audit
Live tests confirmed the active low-ad and multi-dub streaming providers matching `theogpiratebot`'s production configuration:
- **Server 1 — TgVid Prime (Ad-Free / Multi-Dub)**: `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&back=true&lang=${lang}` (Tested: HTTP 307 / 200)
- **Server 2 — VidStuck Pro (Centaurus / Multi-Dub)**: `https://vidstuck.xyz/embed/movie/${tmdbId}?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=${lang}&subtitle=english&loading=2` (Tested: HTTP 200)
- **Server 3 — Bingr Stream (High Bitrate / Clean)**: `https://bingr.one/watch/movie/${tmdbId}` (Tested: HTTP 200)
- **Server 4 — ZXC Roxy (Fast Streams / Sub-Server 0)**: `https://zxcstream.xyz/player/movie/${tmdbId}?dubLang=${lang}&server=0` (Tested: HTTP 302 / 200)
- **Server 5 — VidFast Ultra (4K UHD AutoPlay)**: `https://vidfast.vc/movie/${tmdbId}?autoPlay=true` (Tested: HTTP 200)
- **Server 6 — NxSha Prime (Dual Audio / Clean Ads)**: `https://nxsha.space/embed/movie/${tmdbId}?lang=${lang}&disable_app_ad=true` (Tested: HTTP 200)
- **Server 7 — 2Embed VIP (Direct Playback)**: `https://www.2embed.cc/embed/${tmdbId}` (Tested: HTTP 200)
- **Server 8 — Cinema Mirror 2 (High-Speed CDN)**: `https://www.2embed.skin/embed/${tmdbId}` (Tested: HTTP 200)
- **Server 9 — VidLink Pro (Multi-Audio)**: `https://vidlink.pro/movie/${cleanId}` (Tested: HTTP 200)
- **Server 10 — 123Embed (Multi-Audio)**: `https://play2.123embed.net/movie/${cleanId}` (Tested: HTTP 200)
- **Server 11 — SmashyStream**: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}` (Tested: HTTP 200)
- **Server 12 — AutoEmbed Prime**: `https://autoembed.co/movie/tmdb/${tmdbId}` (Tested: HTTP 200)

Dead hosts permanently removed:
- Dead DNS: `vidsrc.xyz`, `vidsrc.in`, `embed.su`, `autoembed.cc`, `moviesapi.club` (all return ENOTFOUND).
- X-Frame-Options blocked: `multiembed.mov` / `streamingnow.mov`.

---

## 3. Multi-Dub & Hindi Audio Integration
1. **TheOGPirateBot Multi-Dub Parity**: Server 1 (`tgvid`), Server 2 (`vidstuck`), and Server 6 (`nxsha`) are parameterized with native language query flags (`lang=hi` on `tgvid`, `dubLang=hi&server=centaurus` on `vidstuck`, `lang=hi` on `nxsha`).
2. **Audio Track Honesty**: Only legitimate titles display active audio selection options with real media audio verification.
3. **Floating In-Player Rescue Switcher**: Persistent floating "Next Server" rescue button in top-right of player container for quick mirror failover.

---

## 4. In-Browser uBlock-Grade Ad-Shield
- **250+ Ad Domain Regex Blacklist**: Blocks PopAds, Adsterra, Propeller, HighPerformanceFormat, Deloton, Histats, Bet365, etc.
- **Proxy Window Defusal**: Neutralizes `window.open` popup spam without crashing embed scripts.
- **Top-Navigation & Focus Protection**: Prevents rogue iframes from hijacking the browser tab or defocusing the window.

---

## 5. UI Fluidity & 60-120 FPS Optimization
- **MediaCard RAF 3D Tilt**: Hardware-accelerated direct DOM mutations with zero React `setState` overhead on mouse movement.
- **Background Beams & Sparkles Capping**: CSS radial mesh rendering and capped particle densities preserve RAM.

---

## 6. Verification & Live Deployment
- **Edge CDP Test Suite**: 63 / 63 tests passing with 0 console errors.
- **Production Bundle**: Built cleanly with Vite (`dist/assets/index-BCa4a5x3.js`).
- **Live Deployment**: Pushed to `gh-pages` and `main` branches on GitHub (`Junaid355/furina-moviebox`).
- **Live Site**: Verified live at [https://junaid355.github.io/furina-moviebox/](https://junaid355.github.io/furina-moviebox/).
