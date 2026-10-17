# Furina MovieBox — Neon 3D Cinema UI, Real Live TV Player & Settings Hub Overhaul

## 1. Visual Richness, Custom Neon 3D Cinema Emblem & SVG Icons (`Navbar.jsx`, `HeroBanner.jsx`, `MediaCard.jsx`, `index.css`)
- **Sleek Neon 3D Cinema Emblem Logo (`Navbar.jsx`)**:
  - Replace the plain circular avatar in the top navbar with a multi-layered **Neon 3D Cinema Emblem**: a rotating hydro-cyan conic light beam ring, a 3D glass prism badge featuring the Furina avatar + custom SVG Hydro/Cinema crest, and an animated **4K ULTRA** holographic pill.
  - Add custom glowing multi-tone SVG icons for each primary navigation hub (**Trending**, **MovieBox 4K**, **Live TV**, **Hindi Dub**, **Anime Vault**, **Web Series**) with animated active laser-underline indicators and hover light-sweep effects.
- **Rich 3D Cinema Cards & Hero Stage (`MediaCard.jsx`, `HeroBanner.jsx`)**:
  - Restore high-craft visual depth on `MediaCard`: 3D perspective hover tilt, subtle animated border-beam glow on hover, vibrant glassmorphic 4K / Hindi Dub / IMAX badges, and glowing play button overlay.
  - Upgrade `HeroBanner`: rich multi-layered neon hydro-cyan & royal blue atmospheric spotlight, glowing 4K Dolby/Multi-Audio tags, and a sleek interactive thumbnail carousel strip on the bottom-right so desktop and mobile users can visually switch hero spotlights with 1 tap.

## 2. Real Embedded Live TV Stream Player & Bug Fixes (`LiveTvHub.jsx`, `liveTvService.js`)
- **Root-Cause Fixes in `liveTvService.js`**:
  - Fix all broken TMDB backdrop URLs (`/yDHYTjA3R0neXjgu144Y1fX3AcA.jpg`, `/56v2KjBlU4XaOv9rVYEQypROD7P.jpg`, `/etj5CuMuamjhG2ZwKoBGwd7IP8.jpg`) across all 6 channels by replacing them with verified 200 OK TMDB backdrops.
  - Add direct playable stream support and fallback MP4 preview streams so Live TV never shows a static broken image.
- **Real Embedded Live Video Stream in `LiveTvHub.jsx`**:
  - Replace the static image banner with a **real, active 16:9 Live TV Broadcast Player** embedded directly inside the Live TV Monitor.
  - **Instant Channel Zapping (`CH+` / `CH-`)**: 1-click channel up/down buttons and numeric channel keypad (`101`–`106`) with realistic TV OSD (On-Screen Display) overlay showing channel number, program title, audio track, and live progress.
  - **In-Monitor Server & Audio Switcher**: Switch between fastest 4K embed mirrors (*VidStuck 4K*, *VidFast Pro*, *MovieBox 4K*, *123Embed Hindi*, *Direct Preview Stream*) and toggle **Hindi / English / Japanese** audio directly inside the Live TV monitor without leaving the page, or click **Expand to Full Cinema Player** for full theater controls.

## 3. Complete Settings Hub Rework (`SettingsModal.jsx`, `settingsService.js`)
- **Consolidated 6-Tab Architecture**:
  - Consolidate the 9 repetitive tabs into 6 rich, zero-duplication sections:
    1. **Playback & 4K Servers**: Visual **Default 4K Server Selector** (*VidStuck 4K*, *MovieBox 4K*, *VidFast Pro*, *123Embed Hindi*, *MultiEmbed*), Default Streaming Quality (`4K UHD`, `1080p`, `720p`, `Auto`), Autoplay, Auto-Next Episode, Remember Progress, and Furina Ad-Shield Pro toggle.
    2. **Audio & Subtitles (With Live Preview)**: Unified default Audio Language (`Hindi`, `English`, `Japanese`, `Original`), Subtitle Language, plus an **Interactive Live Subtitle Preview Card** that renders real-time changes to Subtitle Size, Color/Glow (`Hydro Cyan`, `Classic White`, `Warm Amber`, `Vibrant Yellow`), Opacity, and Background style on top of a cinematic scene.
    3. **Theme, Stealth & Sound FX**: Live visual theme cards (**Furina Hydro Cyan**, **Midnight OLED**, **Royal Amethyst**, **Neon Emerald**), Accent Glow Picker, **Stealth Mode** instant disguise toggle, **Hydro Sound FX** mute/unmute toggle, and Smooth 3D Animations toggle.
    4. **Player Hotkeys & Mobile Touch**: Skip forward/backward interval selectors, fullscreen behavior, touch gesture controls, and interactive hotkey reference matrix.
    5. **CDN Health, Storage & Backup**: Live CDN provider ping diagnostics, 1-click Cache Cleaner, and built-in **Watchlist & History JSON Export / Import**.
    6. **Secret Master Vault (`2030`)**: Interactive **On-Screen Tactile PIN Keypad** (`0-9`, `Clear`, `Unlock`) alongside keyboard PIN entry, plus an instant visual showcase of unlocked Master Vault & Hanime features when unlocked.
- **Custom Animated Toggle Switches**:
  - Replace every raw HTML `<input type="checkbox">` with a custom animated **Neon Hydro Toggle Switch** component with tactile sound feedback.

## 4. Verification & Bug Sweep
- Verify all poster/backdrop URLs across `tmdb.js`, `movieboxService.js`, and `liveTvService.js`.
- Run `compile_applet` to ensure zero build or runtime issues.
