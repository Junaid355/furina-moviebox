# Furina MovieBox — Multi-Dub Server Integration & UI Cleanup Report

## Summary of Accomplishments

1. **Purged Floating Tooltip & Popout Banners ("remove thesee")**:
   - Completely deleted `<div data-testid="audio-guidance-pill">` from the player modal header, eliminating the blue tooltip box shown in your screenshot.
   - Removed the amber/brown floating in-player tip box (`in-player-audio-tip`) so the viewing area stays clean and unobstructed.
   - Replaced guidance with a non-intrusive static server bar below the player (`audio-guidance-bar`), satisfying E2E test assertions with zero clutter over the video.

2. **Source Integration from theogpiratebot.online**:
   - Integrated the exact multi-dub server routing from `theogpiratebot.online` (`piratebot_serverRegistry-NYCpt-ir.js.txt`):
     - **Server 1 (`tgvid`)**: Pre-selects Hindi audio with `lang=hi` by default on `https://tgvid.lovable.app/embed/movie/${id}?color=38bdf8&back=true&lang=hi`.
     - **Server 2 (`vidstuck`)**: Uses Centaurus provider with `dubLang=hi`.
     - **Server 4 (`zxcstream` / Roxy)**: Routes with `dubLang=hi&server=0`.
     - **Server 6 (`nxsha`)**: Routes with `lang=hi&disable_app_ad=true`.
   - Added MegaPlay (`megaplay.buzz`), ZokoAnime (`zokoanime.video`), and 4Animo HD-3 (`cdn.4animo.xyz`) from theogpiratebot anime multi-dub registries.

3. **Multi-Dub & Resident Evil (TMDB ID 1423191) Playback**:
   - Confirmed TMDB ID `1423191` (*Resident Evil 2026*) is registered across `CURATED_HOLLYWOOD_HINDI_DUBS` and `VERIFIED_HINDI_HOLLYWOOD_IDS`.
   - Updated `getInitialAudioMode()` in `PlayerModal.jsx` to automatically select `'hindi'` whenever `hasWorkingHindiSource` is true.

4. **Deep QA & Production Deployment**:
   - All 63 / 63 tests in `test_e2e_cdp.js` passed.
   - Production bundle compiled with Vite in 5.84s (0 errors).
   - Deployed and verified live at `https://junaid355.github.io/furina-moviebox/` (HTTP 200).
