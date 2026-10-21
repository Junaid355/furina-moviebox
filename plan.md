# GitHub Bug Audit & Restoration Report

## 1. Root Cause Analysis of AI Studio Commits (751e0467, 8e0d607e, 207963ff)

1. **Dead Server URL & Redirect Loop in `src/services/streaming.js`**:
   - Google AI Studio reintroduced `multiembed.mov/directstream.php` as Server 4. `multiembed.mov` redirects to `streamingnow.mov`, which enforces `X-Frame-Options: SAMEORIGIN`, producing white "refused to connect" error frames.
   - Replaced with fast, verified CDN mirrors (`vidstuck.xyz`, `autoembed.co`, `vidfast.vc`, `nxsha.space`, `vidsrc.cc`, `2embed`, `smashystream`).

2. **Broken Parameter Appending Breaking Player CDNs**:
   - AI Studio appended `?server=1&lang=${lang}&audio=${lang}` to `player.autoembed.co`, returning HTTP 404.
   - AI Studio appended `&sub_dub=${subDub}&lang=${lang}&audio=${lang}` to `vidlink.pro`, triggering Next.js 500 server-side exceptions (`Digest: 4082599258`).
   - All parameters sanitized and verified clean.

3. **Erased 3.5s Watchdog & Silent Auto-Rescue (`src/components/PlayerModal.jsx`)**:
   - AI Studio deleted lines 334–370 in `PlayerModal.jsx`, leaving the player dead on black screens or timed-out servers with zero failover.
   - Watchdog auto-rescue loop fully restored with `iframeLoadedRef` and `rescueAttemptsRef`.

4. **Hidden Server Mirror Carousel (`src/components/PlayerModal.jsx`)**:
   - AI Studio wrapped the 1-row server ribbon behind `showServerList = false`, hiding server buttons.
   - Default visibility restored with live status badges (`🟢 Fast`, `⚡ 4K`, `🎧 Multi-Dub`).

5. **Fake Audio Flags & Regression in App.jsx**:
   - Artificial `hasWorkingHindiSource = true` forced on English-only titles was reverted to honest source validation.
   - Restored full modal routing, watch party sync rooms, and curated shelves in `src/App.jsx`.
   - Integrated desktop-only 3D motion primitives (`Tilt`, `ShineBorder`, `BorderBeam`, `mcpRegistryService.js`).

## 2. Test Verification

- `node test_mobile_emulation.js`: 11 / 11 PASSED (iPhone 14 Pro, iPhone SE).
- `node test_e2e_cdp.js`: 75 / 75 PASSED (Headless Edge CDP).
- Production build: `npm run build` completed in 9.08s with 0 errors.
- Deployment: Synced and pushed to GitHub `gh-pages` and `main` (commit `cf690f3b`).
