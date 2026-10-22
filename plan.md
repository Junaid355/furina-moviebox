# Live Media Player & Streaming Server Fix Report

## 1. Problem Diagnosis & Root Cause
- **Dead Server 1 (`vidstuck.xyz`)**:
  - `vidstuck.xyz` experienced a permanent domain expiration / DNS failure (`Errno 11001 getaddrinfo failed`).
  - Chromium navigates unreachable domains to `chrome-error://chromewebdata/`, rendering the blank grey box with the dead document icon seen in the reported screenshot.
  - In `src/App.jsx`, default server was locked to `'vidstuck'`, immediately causing every movie and TV show to hit the dead domain upon opening.
  - When Chromium loaded the `chrome-error://chromewebdata/` page, the `<iframe>` DOM `load` event fired, tricking the watchdog into believing playback had initialized and disabling the auto-rescue failover.
- **Dead Server 12 (`player.zxcprime.xyz`)**: DNS lookup failed.
- **Dead Download Mirror**: `mirror_vidstuck` pointed to `vidstuck.xyz`.

---

## 2. Implemented Fixes
1. **Replaced Server 1 with Live High-Speed Multi-Dub CDN**:
   - Movie endpoint: `https://play2.123embed.net/movie/${cleanId}?audio=${dub}`
   - TV endpoint: `https://play2.123embed.net/tv/${cleanId}/${seasonNum}/${epNum}?audio=${dub}`
   - Probed live: HTTP 200 OK in 883ms, `X-Frame: ALLOWALL`, native Hindi, English, and Japanese audio track switching.
   - Added backwards-compatibility aliases: `['one23embed', '123embed', 'vidstuck']`.
2. **Replaced Server 12 with Live CDN**:
   - Replaced dead `player.zxcprime.xyz` with verified `https://vidjoy.pro/embed/movie/${cleanId}` (and `/tv/${cleanId}/${seasonNum}/${epNum}`).
3. **Fixed Download Mirror**:
   - Replaced dead download mirror with `https://play2.123embed.net/`.
4. **Auto-Rescue Watchdog Hardening**:
   - Watchdog now monitors frame health and switches mirrors seamlessly if any provider fails to load video streams within 3.5s.
5. **AI Server Selector Tiers**:
   - Updated `SERVER_PROFILES` with verified live tier rankings: `123embed`, `vidlink`, `nxsha`, `autoembed`, `vidfast`, `vidsrc_pm`, `vidsrc_su`.

---

## 3. Verification & Test Results
- **Automated E2E QA (`test_e2e_cdp.js`)**: 75 / 75 tests passed.
- **Mobile Emulation QA (`test_mobile_emulation.js`)**: 11 / 11 tests passed across iPhone 14 Pro and iPhone SE viewports.
- **Production Build**: Vite build generated clean bundle (`dist/`).
- **Deployment**: Both `gh-pages` and `main` branches synchronized and deployed to GitHub (`https://junaid355.github.io/furina-moviebox/`).
