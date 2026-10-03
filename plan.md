# Furina MovieBox - Full 3D Motion & Premium UI Architecture Plan

## 1. Executive Summary
Completely rebuild and elevate the Furina MovieBox streaming interface into an ultra-premium, paid-tier 3D cinematic experience utilizing Aceternity UI, Motion Primitives, and Magic UI MCP servers. Deliver an immaculate Fontaine Hydro visual identity, eliminate disruptive ads via an intelligent Iframe Ad-Shield system, resolve mature title 404 routing, and optimize mobile/iPhone viewport ergonomics.

---

## 2. Visual Architecture & Design Language (Fontaine Royal Hydro)
- **Palette**: Deep Obsidian `#030712`, Crystalline Fontaine Cyan `#38bdf8`, Royal Hydro Blue `#2563eb`, Luminous Neon Hydro `#00f2fe`, Deep Amethyst `#7c3aed`, and Fontaine Gold `#f59e0b`.
- **Glassmorphism & Depth**: Multi-layer frosted acrylic panels (`backdrop-blur-2xl bg-slate-950/80 border border-cyan-500/25`), specular light glares, and real-time GPU-rendered 3D perspective transforms.
- **Components from MCP Servers**:
  - **Magic UI**: `ShimmerButton` (perimeter laser shine for primary actions), `MagicCard` (mouse-following spotlight and specular border reflection), `Marquee` (infinite smooth broadcast reel), `BorderBeam` (dual rotating gradient beams).
  - **Motion Primitives**: `Tilt` (spring-physics 3D perspective tilt), `GlowEffect` (color-shifting volumetric hydro glow), `BorderTrail` (active track highlighting).
  - **Aceternity UI**: `BackgroundBeams` (ethereal background canvas), `SparklesCore` (Fontaine hydro sparkle particles), `FloatingDock` (magnified desktop floating dock), `3d-card` (perspective stage layers).

---

## 3. Core Functional Enhancements & Bug Fixes

### A. Furina Ad-Shield & Clean Player Routing
- **Iframe Sandbox Security**:
  - Implement active Ad-Shield mode in `PlayerModal.jsx`.
  - When enabled, apply `sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"` (omits `allow-popups` and `allow-top-navigation` to defeat intrusive popups, new-tab hijacking, and background redirects).
  - Provide an interactive Ad-Shield toggle button on the player header with live status indication (Active / Standard).
  - Display live blocked popup counter from `adblocker.js`.
- **Clean Mirror Prioritization**:
  - Prioritize clean, low-ad servers (VidSrc PM, AutoEmbed, 2Embed VIP) in streaming engine.

### B. Mature / Vault Content 404 Resolution (e.g. TMDB 1033051)
- For mature/vault/hanime titles (such as TMDB ID 1033051):
  - AutoEmbed returns 404 and VidLink returns 500.
  - Automatically route these items to `twoembed_vip` (Server 5) or `animeworld_india` (Server 8) which return HTTP 200 with active streaming.
  - Filter out incompatible servers for mature items in `availableServers`.

### C. iPhone & Mobile Viewport Perfection
- Enforce `text-base sm:text-xs` (minimum 16px font-size) on all form and search inputs to prevent iOS Safari auto-zoom.
- Respect `env(safe-area-inset-top)` on header and `env(safe-area-inset-bottom)` on floating navigation dock.
- Prevent accidental gesture-based browser navigation or horizontal overflow.

---

## 4. Implementation Steps
1. **Add MCP UI Components**:
   - Create `src/components/ui/shimmer-button.jsx` (Magic UI).
   - Create `src/components/ui/glow-effect.jsx` (Motion Primitives).
   - Create `src/components/ui/tilt.jsx` (Motion Primitives spring physics).
2. **Re-architect HeroBanner.jsx**:
   - Transform hero banner into a true 3D floating stage with ShimmerButton CTAs, spring tilt, Fontaine Opera Stage performance showcase, and multi-layer depth parallax.
3. **Re-architect MediaCard.jsx**:
   - Upgrade media cards with spring physics tilt, mouse-following spotlight glare, holographic badge chips, and smooth hover overlay.
4. **Re-architect Navbar.jsx**:
   - Sleek floating frosted navigation with spring hover effects, Furina mascot animation, 3D spotlight shortcut, and responsive layout.
5. **Upgrade PlayerModal.jsx & streaming.js**:
   - Implement Ad-Shield mode with strict iframe sandboxing.
   - Add Ad-Shield toggle button and blocked popup counter in player header.
   - Fix mature title 404 by routing to `twoembed_vip` / `animeworld_india`.
6. **Verify & Test**:
   - Run `npm.cmd run build` to verify clean compilation.
   - Run `node test_e2e_cdp.js` across all 59 tests to ensure 100% pass rate.
   - Deploy compiled bundle and source code using `deploy_github.py`.
