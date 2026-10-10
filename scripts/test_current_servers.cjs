const https = require('https');
const http = require('http');

const testServers = [
  { id: 'vidstuck', url: 'https://vidstuck.xyz/embed/movie/533535?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=hi&subtitle=english&loading=2' },
  { id: 'vidfast', url: 'https://vidfast.vc/movie/533535?autoPlay=true' },
  { id: 'nxsha', url: 'https://nxsha.space/embed/movie/533535?lang=hi&disable_app_ad=true' },
  { id: 'bingr', url: 'https://bingr.one/watch/movie/533535' },
  { id: 'twoembed_vip', url: 'https://www.2embed.cc/embed/533535' },
  { id: 'zxcstream', url: 'https://zxcstream.xyz/player/movie/533535?dubLang=hi&server=0' },
  { id: 'animeworld_india', url: 'https://www.2embed.skin/embed/533535' },
  { id: 'vidlink', url: 'https://vidlink.pro/movie/533535?primaryColor=06b6d4&sub_dub=dub' },
  { id: 'one23embed', url: 'https://play2.123embed.net/movie/533535?audio=hi' },
  { id: 'smashy', url: 'https://embed.smashystream.com/playere.php?tmdb=533535' },
  { id: 'autoembed', url: 'https://autoembed.co/movie/tmdb/533535' },
  { id: 'tgvid', url: 'https://tgvid.lovable.app/embed/movie/533535?color=38bdf8&back=true&server=hindi&lang=hi' }
];

async function checkUrl(item) {
  return new Promise((resolve) => {
    const start = Date.now();
    try {
      const u = new URL(item.url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://google.com/'
        },
        timeout: 5000
      }, res => {
        const time = Date.now() - start;
        resolve({ id: item.id, status: res.statusCode, time, location: res.headers.location });
      });
      req.on('error', err => resolve({ id: item.id, status: 'ERROR', error: err.message, time: Date.now() - start }));
      req.on('timeout', () => { req.destroy(); resolve({ id: item.id, status: 'TIMEOUT', time: Date.now() - start }); });
    } catch (e) {
      resolve({ id: item.id, status: 'INVALID', error: e.message });
    }
  });
}

async function run() {
  console.log('Testing all current servers for response status & speed...\n');
  const results = await Promise.all(testServers.map(checkUrl));
  for (const r of results) {
    const icon = r.status === 200 || (r.status >= 300 && r.status < 400) ? '✅' : '❌';
    console.log(`${icon} [${r.id}] Status: ${r.status} (${r.time}ms) ${r.location ? '-> ' + r.location : ''} ${r.error ? '(' + r.error + ')' : ''}`);
  }
}

run();
