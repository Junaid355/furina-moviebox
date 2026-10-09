# Performance & Mobile UI Optimization Plan

## Objectives
1. **Instant Loading & Hydration**: Eliminate slow hydration and blank/spinner delay by hydrating initial state instantly with curated blockbusters and localStorage cache.
2. **PC UI Movement & Scroll Smoothness**: Eliminate PC frame drops and lag by removing unthrottled canvas loops, continuous mousemove RAF recalculations, and excessive CSS keyframe animations across 100+ cards.
3. **Mobile & iPhone UI Polish ("Too Buggy and Big")**: Scale down oversized hero banners, marquee boxes, duplicate headers, oversized video player heights, and remove floating elements covering content on mobile viewports (iPhone 14 Pro 390x844, iPhone SE 375x667, Android 412x915).
4. **Verification via Mobile Emulation & E2E CDP**: Test on iPhone and Android mobile profiles with screenshots and automated assertions.

## Implementation Steps
1. `src/App.jsx`:
   - Initialize items and heroItem with immediate fallback/cache.
   - Remove duplicate h1 header on trending homepage view.
   - Hide floating mascot on mobile (< 768px) so it never blocks media cards.
   - Make Fontaine 4K broadcast marquee compact on mobile.
   - Refine mobile bottom navigation dock.
2. `src/components/MediaCard.jsx`:
   - Remove continuous mousemove RAF transform and BorderBeam keyframe churn from 100+ cards.
   - Apply clean, hardware-accelerated CSS hover effects.
3. `src/components/HeroBanner.jsx`:
   - Compact mobile layout: sleek height (h-[260px] xs:h-[300px]), hide long paragraph text on small screens, concise badges, compact buttons.
4. `src/components/PlayerModal.jsx`:
   - Replace rigid `min-h-[460px]` with responsive `aspect-video` on mobile viewports so video fits 16:9 without giant black bars or pushing controls off screen.
   - Compact audio and subtitle control bar on mobile.
5. `src/components/ui/background-beams.jsx` & `src/components/ui/sparkles.jsx`:
   - Throttle canvas animation loops to 30 FPS with timestamp delta checks to reduce GPU/CPU load on PC.
6. Verification & Testing:
   - Run mobile emulation tests across iPhone 14 Pro, iPhone SE, and Android Pixel viewports.
   - Inspect captured screenshots.
   - Run `test_e2e_cdp.js` (63/63 tests).
   - Build production bundle (`npm run build`).
   - Deploy to GitHub Pages.
