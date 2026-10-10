const https = require('https');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const text = await fetchText('https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/Bx1FrkXQ.js');
  
  // Look for URL patterns or endpoints starting with /wefeed- or /api or http
  const endpoints = text.match(/\/wefeed-[a-zA-Z0-9_\-\/]+/g) || [];
  console.log('Unique endpoints:', [...new Set(endpoints)]);

  // Look for functions or routes with play, stream, ep, resolution
  const playMatches = text.match(/[a-zA-Z0-9_$.]+\s*:\s*function[^{]*\{[^}]*(?:play|stream|video)[^}]*\}/g) || [];
  console.log('Play function matches:', playMatches.length);

  // Search for mentions of "play" or "source" around endpoints
  const lines = text.split(';');
  const relevant = lines.filter(l => l.includes('/wefeed-') || l.includes('playStatus') || l.includes('playUrl') || l.includes('dashPlayer'));
  console.log(`Relevant lines: ${relevant.length}`);
  for (const r of relevant.slice(0, 15)) {
    console.log('--- Line ---');
    console.log(r.slice(0, 300));
  }
}

run();
