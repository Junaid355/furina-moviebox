const https = require('https');
const fs = require('fs');
const path = require('path');

const bundles = [
  'https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/Bx1FrkXQ.js',
  'https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/DUYZRLT4.js',
  'https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/D6DRnOnQ.js',
  'https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/BIl4cyR9.js',
  'https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/CrZrqgDu.js'
];

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
  for (const url of bundles) {
    const filename = path.basename(url);
    console.log(`\n=== Analyzing ${filename} ===`);
    try {
      const text = await fetchText(url);
      console.log(`Length: ${text.length} chars`);
      
      const keywords = ['source', 'stream', 'embed', 'player', 'audio', 'dub', 'hindi', 'dash', 'server', 'bff', 'api'];
      for (const kw of keywords) {
        const regex = new RegExp(`[a-zA-Z0-9_\\-\\./:?&=]{0,40}${kw}[a-zA-Z0-9_\\-\\./:?&=]{0,60}`, 'gi');
        const matches = text.match(regex) || [];
        const unique = [...new Set(matches)];
        if (unique.length > 0) {
          console.log(`Found ${kw} (${unique.length}):`, unique.slice(0, 10));
        }
      }
    } catch (e) {
      console.error(`Error fetching ${url}:`, e.message);
    }
  }
}

run();
