const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function main() {
  const page = await fetchUrl('https://junaid355.github.io/furina-moviebox/');
  console.log('Page Status:', page.status);
  console.log('Page Length:', page.data.length);
  
  const scriptMatches = [...page.data.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m => m[1]);
  console.log('Scripts in live HTML:', scriptMatches);

  for (const s of scriptMatches) {
    const fullUrl = s.startsWith('http') ? s : `https://junaid355.github.io/furina-moviebox/${s.replace(/^\.?\//, '')}`;
    const sRes = await fetchUrl(fullUrl);
    console.log(`Script ${fullUrl} -> Status: ${sRes.status}, Size: ${sRes.data.length}`);
  }

  const swRes = await fetchUrl('https://junaid355.github.io/furina-moviebox/sw.js');
  console.log(`ServiceWorker -> Status: ${swRes.status}, Size: ${swRes.data.length}`);
}

main().catch(console.error);
