const https = require('https');

https.get('https://hanime.tv', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Fetched length:', data.length);
    const m = data.match(/<link[^>]+(icon|apple-touch-icon)[^>]*>/gi);
    console.log('Icons:', m);
    const scripts = data.match(/src="([^"]+\.js)"/gi);
    console.log('Scripts:', scripts?.slice(0, 5));
    const svgs = data.match(/<svg[\s\S]*?<\/svg>/gi);
    console.log('SVGs count:', svgs?.length);
    if (svgs) {
      svgs.forEach((s, idx) => console.log(`SVG ${idx}:`, s.slice(0, 200)));
    }
  });
}).on('error', err => console.log('Err:', err.message));
