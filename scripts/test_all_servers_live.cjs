const https = require('https');
const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');

async function testUrl(url) {
  return new Promise((resolve) => {
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 7000
      }, res => {
        let data = '';
        res.on('data', chunk => {
          if (data.length < 2000) data += chunk;
        });
        res.on('end', () => {
          const xFrame = res.headers['x-frame-options'];
          const csp = res.headers['content-security-policy'];
          const blocked = (xFrame && (xFrame.toUpperCase().includes('DENY') || xFrame.toUpperCase().includes('SAMEORIGIN'))) || (csp && csp.includes('frame-ancestors'));
          resolve({
            statusCode: res.statusCode,
            xFrame,
            blocked: Boolean(blocked),
            len: data.length,
            sample: data.slice(0, 150).replace(/\s+/g, ' ')
          });
        });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ error: 'TIMEOUT' });
      });
      req.on('error', err => resolve({ error: err.message }));
    } catch (e) {
      resolve({ error: e.message });
    }
  });
}

async function run() {
  const fileUrl = pathToFileURL(path.resolve('src/services/streaming.js')).href;
  const streamingMod = await import(fileUrl);
  const SERVERS = streamingMod.SERVERS;
  console.log(`Testing all ${SERVERS.length} servers for Movie 533535 (Deadpool) and TV 93405 (Squid Game S1E1):\n`);
  for (const s of SERVERS) {
    const movieUrl = s.getMovieUrl('533535', 'hindi');
    const tvUrl = s.getTvUrl('93405', 1, 1, 'hindi');
    const movieRes = await testUrl(movieUrl);
    const tvRes = await testUrl(tvUrl);
    console.log(`[${s.id}] ${s.name}`);
    console.log(`   Movie: ${movieUrl}`);
    console.log(`     -> Status: ${movieRes.statusCode || movieRes.error}, Blocked: ${movieRes.blocked}`);
    console.log(`   TV:    ${tvUrl}`);
    console.log(`     -> Status: ${tvRes.statusCode || tvRes.error}, Blocked: ${tvRes.blocked}`);
  }
}

run();
