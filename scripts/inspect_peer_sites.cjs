const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  for (const site of ['https://netfilm.world', 'https://123movienow.cc', 'https://moviebox.co']) {
    console.log(`\n=== Fetching ${site} ===`);
    try {
      const res = await fetchUrl(site);
      console.log('Status:', res.status, 'Length:', res.data.length);
      const iframes = res.data.match(/<iframe[^>]+>/gi) || [];
      console.log('Iframes:', iframes);
      const scripts = res.data.match(/src=["']([^"']+\.js[^"']*)["']/gi) || [];
      console.log('Scripts:', scripts.slice(0, 10));
      // Look for stream or embed keywords
      const embeds = res.data.match(/https?:\/\/[^\s"'<>)]*(?:embed|stream|player|vidsrc|autoembed|play)[^\s"'<>)]*/gi) || [];
      console.log('Embed/Player URLs:', [...new Set(embeds)].slice(0, 15));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

run();
