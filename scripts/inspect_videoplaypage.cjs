const https = require('https');
const fs = require('fs');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const url = 'https://h5-static.aoneroom.com/spa/videoPlayPage/assets/index.a3d250cf.js';
  console.log('Fetching:', url);
  const text = await fetchText(url);
  console.log('Length:', text.length);
  fs.writeFileSync('scripts/videoPlayPage_bundle.js', text);

  // Look for API endpoints in this player bundle
  const endpoints = text.match(/https?:\/\/[a-zA-Z0-9_\-\./:?&=]+/g) || [];
  const uniqueUrls = [...new Set(endpoints)];
  console.log('URLs found in bundle:', uniqueUrls.length);
  for (const u of uniqueUrls.slice(0, 30)) {
    console.log(' ', u);
  }

  // Look for playback / playUrl / stream / dash / hls / m3u8
  const keywords = ['play', 'stream', 'dash', 'm3u8', 'source', 'dub', 'audio', 'track', 'player', 'wefeed', 'aoneroom'];
  for (const kw of keywords) {
    const r = new RegExp(`[a-zA-Z0-9_$.]{0,30}${kw}[a-zA-Z0-9_$.]{0,30}`, 'gi');
    const m = text.match(r) || [];
    console.log(`Keyword ${kw}: ${m.length} occurrences`);
  }
}

run();
