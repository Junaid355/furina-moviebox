# Furina MovieBox — Multi-Dub Server Parameter Fix & Playback Report

## Root Cause Analysis
1. `tgvid` (`tgvid.lovable.app` / TGFLIX) receives both a `lang` parameter and an optional `server` parameter.
2. Inside TGFLIX's `He` component, when selecting the initial stream:
   - If `server` is not provided, TGFLIX checks `localStorage.getItem('tgflix:srv:...')` first. If the user previously played the title in English, it persists that English source.
   - If `server` is provided (e.g., `&server=hindi`), it explicitly matches `cinemaos | Gamma - Hindi` / `Theta - Hindi` (1TamilMV Hindi stream) and bypasses the stale cached server.
3. In `src/services/streaming.js`, `getMovieUrl` and `getTvUrl` previously only passed `&lang=hi` without `&server=hindi`, which caused TGFLIX to stay on the English default stream (`TG HUB v2 - HLS 1080p`).

## Engineering Fixes Delivered
1. **Explicit Server Parameter in `src/services/streaming.js`**:
   - Updated `tgvid.getMovieUrl` and `tgvid.getTvUrl`:
     ```javascript
     const serverParam = audioMode === 'hindi' ? '&server=hindi' : (audioMode === 'english' ? '&server=english' : '');
     let url = `https://tgvid.lovable.app/embed/movie/${tmdbId}?color=38bdf8&back=true${serverParam}&lang=${lang}`;
     ```
   - Verified via live CDP inspection that TGFLIX now displays `CONNECTING TO GAMMA - HINDI_` and saves `cinemaos|Gamma - Hindi` to local storage, delivering genuine Hindi audio playback.
   - Updated download mirrors to include `server=${audioMode === 'english' ? 'english' : 'hindi'}`.

2. **Verification & Deployment**:
   - 63 / 63 E2E CDP browser automation tests passed in Edge headless mode.
   - Production bundle compiled with Vite in 34.59s (0 errors).
   - Deployed and verified live at `https://junaid355.github.io/furina-moviebox/` (HTTP 200).
