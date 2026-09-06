# 🎬 Furina MovieBox — 4K Free Movies, K-Drama, Anime & Web Series

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00f0ff?style=for-the-badge&logo=github)](https://junaid355.github.io/furina-moviebox/)
[![PWA Ready](https://img.shields.io/badge/PWA-iOS_%26_PC_Ready-10b981?style=for-the-badge&logo=apple)](https://junaid355.github.io/furina-moviebox/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#license)

> **Furina MovieBox** is a high-speed, mobile-optimized streaming web application & Progressive Web App (PWA) inspired by MovieBox. Designed specifically for **iPhone, iPad, and PC**, it delivers instant **4K / 1080p** streaming across **Hollywood (English)**, **Bollywood (Hindi & Hindi Dubbed)**, **Korean Dramas (K-Drama)**, **Anime (Sub & Dub)**, **Horror Cinema**, and **Trending Web Series** with a built-in **AdBlock Shield**, **1-Click Downloads**, **Auto-Server Failover**, and **Zero Revokes**.

---

## 🌐 Live Web App

- 🚀 **Live GitHub Pages URL**: **[https://junaid355.github.io/furina-moviebox/](https://junaid355.github.io/furina-moviebox/)**
- 💻 **Local PC Stream**: `http://localhost:5173`
- 📱 **Local iPhone Stream**: `http://<your-pc-ip>:5173`

---

## ✨ Key Features & Enhancements

### 🚀 1. 6 Verified High-Speed Streaming Backends with Auto-Failover
Furina MovieBox eliminates buffering and stalled streams by integrating 6 independent streaming backends:

| Server | Backend Name | Speed & Specialties |
|---|---|---|
| **Server 1** | **AutoEmbed Prime** *(Default)* | ⚡ **Instant Play (0.2s load)**, No proxy throttling, Clean 1080p HD |
| **Server 2** | **VidSrc 4K** | 🚀 **Ultra-Fast 0.5s CDN**, Crystal-clear 4K UHD & 1080p |
| **Server 3** | **VidSrc PM Pro** | 💎 Ultra HD 1080p Mirror, Excellent stability |
| **Server 4** | **VidSrc TO** | 🎬 Cinema Master mirror with high bitrate |
| **Server 5** | **VidSrc SU** | 🌍 Global Mirror with resilient international routing |
| **Server 6** | **2Embed VIP** | 🌐 Global VIP multi-source streaming engine |

- **⚡ Auto-Switch Failover**: One-click switch button right in the player header to immediately jump to the next mirror if a server ever stalls or buffers.

---

### ⬇️ 2. 1-Click HD / 4K Download Option
- Download movies or TV episodes directly for offline viewing with the **"⬇️ Download HD/4K"** button in the player header.
- Automatically selects the current title, season, and episode.

---

### 📺 3. Web Series Dynamic Season Navigation & Resilient Fallback
- **Dynamic Season Detection**: Automatically queries TMDB for the exact number of seasons (whether 1 season or 15+ seasons) so no show is truncated.
- **Resilient Episode Fallback**: If TMDB returns empty episode lists for an obscure season, automatically provides fallback selectors so you never get stuck.

---

### 🎭 4. Expanded Content Catalog
- 🔥 **Trending Worldwide**: Top trending movies and television series globally.
- 🎬 **Hollywood Cinema (English)**: Latest high-definition box office releases.
- 🇮🇳 **Bollywood & Hindi Dubbed**: Dedicated Indian cinema and Hollywood titles with Hindi audio tracks.
- 🇰🇷 **K-Drama (Korean Cinema & Dramas)**: Top-rated Korean romance, thriller, and action series.
- 🌸 **Anime (Sub & Dub)**: Japanese anime blockbusters and multi-season series with Japanese/English/Hindi audio and subtitle support.
- 👻 **Horror & Supernatural Thrillers**: Chilling horror blockbusters, paranormal mysteries, and psychological thrillers.
- 🔞 **18+ Mature & Uncut Cinema**: Uncensored adult cinema *(Secured via Secret Vault PIN `2030`)*.
- ❤️ **Saved Watchlist**: Bookmark your favorite titles locally.

---

### 🛡️ 5. Zero-Ads on iPhone, iPad & PC

#### 📱 For iPhone & iPad:
1. **Option A (Brave iOS — Recommended)**:
   - Open **[https://junaid355.github.io/furina-moviebox/](https://junaid355.github.io/furina-moviebox/)** in **Brave Browser** on iOS.
   - Brave's built-in Shields automatically block all iframe popups, video ads, and redirects with zero setup.
2. **Option B (Safari + Free AdGuard)**:
   - Install free **AdGuard** from the iOS App Store.
   - Enable AdGuard in iOS Settings ➔ Safari ➔ Extensions / Content Blockers.
   - Enjoy pure ad-free streaming directly in Safari.
3. **PWA Standalone Mode**:
   - In Safari, tap the **Share** button ➔ **Add to Home Screen**.
   - Opens as a native full-screen app with custom Furina icon.

#### 💻 For PC & Mac:
- **Built-in Furina AdBlock Shield**: Intercepts `window.open` calls and prevents popup tabs.
- **uBlock Origin Lite**: Pair with Chrome / Edge / Firefox extensions for 100% ad-free playback.

---

### 🔒 6. Secret Master Vault & Stealth Disguise (PIN: `2030`)
- **Passcode Protected (`2030`)**: Enter the secret 4-digit code in Settings ➔ Secret Vault to unlock:
  - **🔞 18+ Mature & Uncut Cinema**: Unlocks R-rated, NC-17, and uncut international cinema.
  - **🛡️ Stealth Disguise Mode**: One-tap privacy switch disguising the entire app as neutral *"Stream Cinema"*, removing Furina anime artwork and branding when browsing in public.

---

## 📲 How to Install on iPhone (No 7-Day Revokes)

Because Furina MovieBox is a modern PWA (Progressive Web App), you do **not** need sideloading apps (AltStore, Scarlet) or computer re-signing every 7 days:

1. Open **Safari** on your iPhone and visit: **[https://junaid355.github.io/furina-moviebox/](https://junaid355.github.io/furina-moviebox/)**
2. Tap the **Share** button (the square icon with the arrow pointing up) in Safari's bottom toolbar.
3. Scroll down and select **Add to Home Screen**.
4. Tap **Add** in the top-right corner.
5. Launch **Furina MovieBox** from your home screen — it runs in **standalone native full-screen mode**!

---

## 🛠️ Local Development & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Junaid355/furina-moviebox.git
cd furina-moviebox

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build
```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Fontaine Glassmorphism
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: [The Movie Database (TMDB) API](https://www.themoviedb.org/)
- **PWA**: Web App Manifest, Service Worker caching, iOS standalone mode

---

## 📄 License

This project is open-source under the MIT License.
