# Furina MovieBox — Verification and Engineering Report

## Summary of Changes Delivered
1. **Cinema Player Layout Expansion**:
   - Expanded player modal container dimensions across desktop and mobile (`max-w-[97vw] xl:max-w-7xl 2xl:max-w-[1600px]`, `min-h-[460px] sm:min-h-[580px] md:min-h-[660px] lg:min-h-[740px]`).
   - Consolidated AI Boost controls into single unified header bar, eliminating vertical squish and maximizing viewport viewing area to over 85%.

2. **Popout Clutter and Ad Shield Optimization**:
   - Eliminated audio tip toasts on player open.
   - Refined `sandbox` attribute handling so that Smart Shield mode operates without restrictive sandboxing flags while Strict Sandbox mode enforces sandboxing and enables the 1-click rescue switch.
   - Preserved active Ad-Shield proxy defusal, top-level navigation traps, and download exemptions.

3. **Performance and Lag Reduction**:
   - Replaced fixed background attachment repaints with GPU-composited layers (`will-change: opacity`).
   - Added automatic pausing of canvas background beam loops (`furina-player-active`) during media playback to eliminate CPU/GPU contention.

4. **1-Tap True Edge-to-Edge Fullscreen on Mobile / iPhone**:
   - Added persistent Cinema Fullscreen overlay button inside the video viewport with fallback to fixed viewport styling for seamless iPhone mobile playback.

5. **Audio Honesty & Hindi Dub Routing**:
   - Integrated full *Resident Evil* franchise and Hollywood blockbusters into verified Hindi dub resolution.
   - Maintained audio honesty by disabling Hindi buttons and showing fallback notices for non-Hindi titles (*Inside Out*).

6. **QA & Deployment**:
   - 63 / 63 E2E CDP tests passing (`node test_e2e_cdp.js`).
   - Live production deployed to GitHub Pages and `main` branch.
