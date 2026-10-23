# Streaming Architecture Analysis: AnimeHeaven vs Aniwave
*Produced with REA Engine (`rea-agents@6.7.0`) & Stealth Browser Engine*

## Executive Architecture Summary

| Metric / Dimension | AnimeHeaven (`animeheaven.me`) | Aniwave (`aniwaves.ru`) |
| :--- | :--- | :--- |
| **Streaming Mechanism** | Direct HTML5 `<video>` MP4 delivery | Multi-server iframe embed gateway |
| **Delivery Host(s)** | `ci.animeheaven.me`, `ct.animeheaven.me`, `ck.animeheaven.me` | `play.echovideo.ru`, `mfw09.org`, `playmogo.com` |
| **Gateway / API** | Session Cookie `key=<hash>` & `/gate.php` | AJAX `/ajax/sources?id=<link_id>` |
| **Protocols** | HTTP/2 Progressive MP4 | HLS (m3u8) / Dash via player iframes |
| **Bot Gate / Anti-Scrape** | Minimal / Cookie validation | Cloudflare Turnstile explicitly bound to actions |
| **Audio Dubs** | Separate page routes (e.g. Dub vs Sub lists) | In-player / server tabs (`SUB`, `S-Sub`, `DUB`) |

---

## 1. AnimeHeaven (`https://animeheaven.me/`)

### 1.1 Discovery Flow
1. User clicks an episode on `https://animeheaven.me/episode.php?id=<id>`.
2. Episode page executes gate assignment:
   ```javascript
   function gatea(hash) {
     document.cookie = "key=" + hash + "; expires=" + (new Date(Date.now() + 86400000)).toUTCString() + "; path=/";
     window.location.href = "gate.php";
   }
   ```
3. Browser navigates to `https://animeheaven.me/gate.php`.
4. Server verifies `key` cookie and renders native HTML5 `<video controls autoplay>` elements directly in the document body.

### 1.2 Extracted Stream Endpoints
Direct multi-mirror MP4 stream tags discovered:
- Mirror 1: `https://ci.animeheaven.me/video.mp4?<stream_hash>&<session_hash>`
- Mirror 2: `https://ct.animeheaven.me/video.mp4?<stream_hash>&<session_hash>&error`
- Mirror 3: `https://ck.animeheaven.me/video.mp4?<stream_hash>&<session_hash>&error2`

### 1.3 REA Analysis Evidence (`animeheaven`)
- **Evidence ID**: `ev_4cbbfd133bd2ef0808862378a0c1de2880f34c4678317053aeb51547d05fe849`
- **Parent Evidence**: `ev_1d0d54c36a946c6e7323087d13baa0d7b3773a227307e029389f7e8bda8c738c`
- **Digest SHA-256**: `ac4f96d92359823f2aad85d977ab0c5f8a391ff0a68a833bf759ee42cc660f4e`
- **AST Nodes Visited**: 195
- **Semantic Relations**:
  - Data flow: 44
  - Object flow: 10
  - Call flow unknowns: 13
- **Architecture Assessment**: Lightweight, monolithic procedural JavaScript with client-side state stored in `localStorage.bookmark` and `document.cookie`. Zero obfuscation, zero runtime bundling.

---

## 2. Aniwave (`https://aniwaves.ru/`)

### 2.1 Discovery Flow
1. User navigates to watch route: `https://aniwaves.ru/watch/<slug>-<mediaId>`.
2. Initial payload requests episode list:
   - `GET /ajax/episode/list/<mediaId>?vrf=<vrfToken>`
3. Episode list populates server list:
   - `GET /ajax/server/list?servers=<mediaId>&eps=<epNumber>`
4. Each server returns a base64 encrypted payload `data-link-id`:
   - E.g. `UWxwb05ERkJXU1pUV1NFZTAzc0FBQXAvLzl4...`
5. On player initiation or server switch:
   - `GET /ajax/sources?id=<data-link-id>&asi=0&autoPlay=0`
6. Server responds with JSON containing the decrypted iframe embed:
   ```json
   {
     "status": 200,
     "result": {
       "url": "https://play.echovideo.ru/embed-20/...",
       "server": 14,
       "skip_data": {
         "intro": [0, 0],
         "outro": [0, 0]
       }
     }
   }
   ```

### 2.2 Server Matrix & Embed Gateways

| Server Tab | Server Name | `sv-id` | Embed Host | Target Endpoint Format |
| :--- | :--- | :--- | :--- | :--- |
| **SUB** | **DatSaV** | `14` | `play.echovideo.ru` | `/embed-20/<payload>?v=1&autostart=true` |
| **SUB / DUB** | **Vidplay** | `4` | `play.echovideo.ru` | `/embed-1/<payload>?v=1&autostart=true` |
| **SUB / DUB** | **BYFMS** | `1` | `mfw09.org` | `/e/<short_id>?v=1&autostart=true` |
| **SUB / DUB** | **DGHG** | `2` | `playmogo.com` | `/e/<short_id>?v=1&autostart=true` |
| **S-Sub** | **MyCloud** | `12` | `play.echovideo.ru` | `/embed-0/<payload>?v=1&autostart=true` |

### 2.3 REA Analysis Evidence (`aniwaves`)
- **Evidence ID**: `ev_c3d8f4d2ff4a1902d758bbed528c3220a2311642d3791a53e6a3080db59fafd5`
- **Parent Evidence**: `ev_72bb47a032394b5b0f78fe6f9b3bb92f506df8bb7206408a15bd5842c1631f0b`
- **Digest SHA-256**: `d21bd05063b770885c931d64075e2143c6ae1c5a0a8fa94c3501fead39514082`
- **Source Byte Size**: 102,526 bytes
- **AST Nodes Visited**: 32,698
- **Semantic Graph Statistics**:
  - Data-flow relations: 13,627
  - Closure relations: 1,061
  - Object-flow relations: 2,154
  - Call-flow relations: 255
- **Architecture Assessment**: Heavily bundled single-file application combining Swiper, Tooltipster, jQuery AJAX bindings, Cloudflare Turnstile token validation hooks (`turnstileActionStore`), and an encrypted token dispatcher that translates base64 `data-link-id` tokens into `play.echovideo.ru` iframe streams.

---

## 3. MovieBox Architectural Takeaways

1. **Direct MP4 Ingestion**: AnimeHeaven's direct `.mp4` URLs can be consumed by MovieBox's custom video overlay without iframe sandbox restrictions, allowing all 7 AI Video Booster profiles to process video frames natively.
2. **Multi-Dub Integration**: Aniwave's server routing maps separate `DUB` vs `SUB` server IDs (`svId=4` Vidplay DUB, `svId=1` BYFMS DUB), which can be integrated into MovieBox's `aiServerSelector.js` as fallback providers.
