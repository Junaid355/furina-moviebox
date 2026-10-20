# iPhone UI Bug Fixes & Simplified Mobile Streaming Experience

## Goal
Resolve all iPhone Safari layout, notch safe-area, horizontal overflow, and input auto-zoom bugs, while making category navigation and Multi-Dub playback effortless on mobile and desktop.

---

## 1. Fix All iPhone Layout, Notch Safe-Area & Auto-Zoom Bugs
- **Viewport & Safe Area Support (`index.html` & `src/index.css`)**:
  - Update `<meta name="viewport">` to include `viewport-fit=cover, maximum-scale=1.0, user-scalable=no` so iPhone notch (`env(safe-area-inset-top)`) and home indicator (`env(safe-area-inset-bottom)`) are properly respected.
  - Add `.safe-top`, `.safe-bottom`, and `overflow-x: clip` utilities on `html, body` to prevent horizontal rubber-band bouncing or side cut-offs on iOS Safari.
  - Enforce `font-size: 16px` (`text-base`) on all mobile `<input>` and `<select>` fields (Search bar, Watch Party room input/chat, Live TV search) so iOS Safari never auto-zooms the page when tapping an input.
- **Mobile Touch & Widget De-cluttering (`src/components/FurinaMascot.jsx`, `src/components/HeroBanner.jsx`)**:
  - Reposition or compact floating overlays on small screens so they never block the bottom navigation bar or player controls.
  - Optimize Hero Banner height and button sizing on iPhone viewports (`min-h-[380px]` on mobile) so text, ratings, and action buttons never overlap.

---

## 2. Swipeable Top Category Bar + Simple Bottom Tabs (`src/components/Navbar.jsx` & `src/App.jsx`)
- **Swipeable Top Category Bar (Mobile & Tablet)**:
  - Add a smooth, horizontally swipeable category strip directly below the top header on mobile (`All`, `🔥 Trending`, `🇮🇳 Hindi Dub`, `🎌 Anime`, `📦 MovieBox`, `📡 Live TV`, `🎬 Movies`, `📺 Series`) with active indicator pills and one-tap switching.
- **Clean 5-Tab iPhone Bottom Navigation**:
  - Refine the fixed bottom bar with proper `pb-[ env(safe-area-inset-bottom) ]` padding and 5 clear tabs: **Home**, **Hindi Dub**, **Anime**, **Live TV**, and **MovieBox**—plus quick top header icons for Search and Watch Party.

---

## 3. Effortless Video Player & One-Tap Multi-Dub (`src/components/PlayerModal.jsx`)
- **Auto-Pick Best Server & Hide Technical Clutter**:
  - Automatically select the fastest working stream for the chosen language (`🇮🇳 Hindi Dub`, `🇬🇧 English`, `🇯🇵 Japanese`, or `📦 MovieBox`).
  - Keep a clean, prominent **Language Bar** (`🇮🇳 Hindi Dub`, `🇬🇧 English`, `🇯🇵 Japanese`) at the top of the player and hide technical server buttons (`Server 1`, `Server 2`, `VidLink`, etc.) behind a collapsible **"Change Server / Troubleshoot"** toggle so users only see them if needed.
- **iPhone Player Modal & Fullscreen Fixes**:
  - Fix player header and video container layout on portrait and landscape iPhone screens so the Close (`✕`) button, Episode selector, and Audio Switcher are always reachable and never cut off by the iPhone notch.

---

## 4. Verification & GitHub Sync
- Compile and lint the application to ensure zero errors.
- Commit and push the latest changes to the connected GitHub repository.
