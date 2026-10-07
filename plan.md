# Furina MovieBox — Performance, Multi-Dub & Ad-Shield Overhaul Plan

## 1. Overview
Comprehensive overhaul of Furina MovieBox based on architectural inspection of `https://theogpiratebot.online/movie`, addressing player streaming reliability ("movies not loading"), UI lag, RAM overhead, multi-audio dubbing, streaming server reliability, and uBlock ad protection.

---

## 2. Server Architecture & Reachability Audit
Live tests confirmed the active low-ad and multi-dub streaming providers:
- **NxSha Prime (Multi-Dub / Clean)**: `https://nxsha.space/embed/movie/${tmdbId}?lang=${lang}&disable_app_ad=true` (Tested: HTTP 200)
- **VidStuck Pro (Hindi Dub / CC)**: `https://vidstuck.xyz/embed/movie/${tmdbId}?dubLang=${dubLang}&subtitle=english` (Tested: HTTP 200)
- **VidFast Ultra (4K AutoPlay)**: `https://vidfast.vc/movie/${tmdbId}?autoPlay=true` (Tested: HTTP 200)
- **Bingr Stream (Clean Stream)**: `https://bingr.one/watch/movie/${tmdbId}` (Tested: HTTP 200)
- **2Embed VIP (Direct VIP)**: `https://www.2embed.cc/embed/${tmdbId}` (Tested: HTTP 200)
- **VidSrc TO (Cinema Master)**: `https://vidsrc.to/embed/movie/${tmdbId}` (Tested: HTTP 200)
- **TgVid Cinema (Multi-Dub)**: `https://tgvid.lovable.app/embed/movie/${tmdbId}?lang=${lang}` (Tested: HTTP 200)
- **2Embed Skin (Hindi CDN)**: `https://www.2embed.skin/embed/${tmdbId}` (Tested: HTTP 200)
- **VidLink Pro (Multi-Audio)**: `https://vidlink.pro/movie/${cleanId}` (Tested: HTTP 200)
- **123Embed (Multi-Audio)**: `https://play2.123embed.net/movie/${cleanId}` (Tested: HTTP 200)
- **SmashyStream**: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}` (Tested: HTTP 200)
- **AutoEmbed Prime**: `https://autoembed.co/movie/tmdb/${tmdbId}` (Tested: HTTP 200)

Dead / blocking hosts permanently removed or bypassed:
- Dead DNS: `vidsrc.xyz`, `vidsrc.in`, `embed.su`, `autoembed.cc`, `moviesapi.club` (all return ENOTFOUND).
- X-Frame-Options blocked: `multiembed.mov` / `streamingnow.mov`.

---

## 3. Root Cause of "Movies Not Loading" & Resolved Fixes
1. **Unexported Function Crashing Build**: `getDownloadUrl` import was missing from `streaming.js`, causing previous production builds to fail to compile. Fixed by exporting `getDownloadUrl`.
2. **Missing State in MediaCard**: Obsolete `glare` and `transformStyle` state references were causing cards to fail. Fixed with direct RAF DOM transforms.
3. **Overly Long & Opaque Spinner Overlay**: Fullscreen 95% black overlay previously masked iframe embeds for 4500-5000ms. Reduced timeout to 2200ms and lightened overlay so buffering video is immediately visible and interactive.
4. **Disruptive Background Probe Iframe Teardown**: `probeServers` previously ran asynchronously and swapped `selectedServer` midway through initial video loading, destroying the running iframe. Fixed so background probes only warm cache and never forcefully unmount an active stream.
5. **Floating In-Player Rescue Switcher**: Added a persistent floating "Next Server" rescue button in the top-right of the player container (active in both standard and fullscreen modes) so users can immediately switch servers with 1 click if any stream buffers.

---

## 4. In-Browser uBlock-Grade Ad-Shield
- **250+ Ad Domain Regex Blacklist**: Blocks PopAds, Adsterra, Propeller, HighPerformanceFormat, Deloton, Histats, Bet365, etc.
- **Proxy Window Defusal**: Neutralizes `window.open` popup spam without crashing embed scripts.
- **Top-Navigation & Focus Protection**: Prevents rogue iframes from hijacking the browser tab or defocusing the window.
- **Cosmetic CSS Injections**: Hides Histats counters, floating ad overlays, and fake close buttons.

---

## 5. UI Fluidity & 60-120 FPS Optimization
- **MediaCard RAF 3D Tilt**: Hardware-accelerated direct DOM mutations with zero React `setState` overhead on mouse movement.
- **Background Beams & Sparkles Capping**: CSS radial mesh rendering and capped particle densities preserve RAM.

---

## 6. Verification & Live Deployment
- **Edge CDP Test Suite**: 63 / 63 tests passing with 0 console errors.
- **Production Bundle**: Built cleanly with Vite (`dist/assets/index-DuonKdcB.js`).
- **Live Deployment**: Pushed to `gh-pages` and `main` branches on GitHub (`Junaid355/furina-moviebox`).
- **Live Site**: Verified live at [https://junaid355.github.io/furina-moviebox/](https://junaid355.github.io/furina-moviebox/).
