const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\22d53a87-a0ac-48aa-8f59-9133f63d6b0c\\.system_generated\\steps\\13195\\content.md', 'utf8');

// Search for video players, iframes, stream links, or APIs
const iframes = content.match(/<iframe[^>]+>/g) || [];
console.log('iframes:', iframes);

const videos = content.match(/<video[^>]+>/g) || [];
console.log('videos:', videos);

// Search for API endpoints
const apis = content.match(/https?:\/\/[^\s"'<>)]*(?:api|play|source|stream|embed|dash|m3u8|mp4)[^\s"'<>)]*/gi) || [];
console.log('Matching video/api URLs:', [...new Set(apis)].slice(0, 30));

// Find window.__NUXT__ or state JSON
const nuxtMatches = content.match(/window\.__NUXT__\s*=\s*(?:\{|\(|\[)(.*?)(?:;<\/script>|<\/script>)/s);
if (nuxtMatches) {
  console.log('Found Nuxt state! Length:', nuxtMatches[1].length);
  // look for keywords like stream, url, server, audio, dub, lang
  const sub = nuxtMatches[1];
  const keys = ['server', 'source', 'dub', 'audio', 'lang', 'stream', 'playUrl', 'm3u8', 'mp4', 'dash'];
  for (const k of keys) {
    const r = new RegExp(`"${k}"[^,}]+`, 'gi');
    const m = sub.match(r) || [];
    if (m.length) {
      console.log(`Key ${k} matches:`, [...new Set(m)].slice(0, 5));
    }
  }
}
