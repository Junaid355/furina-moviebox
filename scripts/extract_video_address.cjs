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
  const text = await fetchText('https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/CAU47rGQ.js');
  console.log('CAU47rGQ.js length:', text.length);
  
  const idx = text.indexOf('videoAddress');
  if (idx !== -1) {
    console.log('Snippet around videoAddress:');
    console.log(text.slice(Math.max(0, idx - 400), Math.min(text.length, idx + 800)));
  }

  // search for player or play
  const matches = text.match(/[a-zA-Z0-9_$]+\s*\(\s*["']\/wefeed-[^"']+["']/g) || [];
  console.log('API calls in CAU47rGQ:', matches);
}

run();
