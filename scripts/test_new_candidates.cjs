const https = require('https');

const candidates = [
  { id: 'vidsrc_pm', url: 'https://vidsrc.pm/embed/movie/533535' },
  { id: 'vidsrc_xyz', url: 'https://vidsrc.xyz/embed/movie/533535' },
  { id: 'vidsrc_net', url: 'https://vidsrc.net/embed/movie/533535' },
  { id: 'vidsrc_me', url: 'https://vidsrc.me/embed/movie/533535' },
  { id: 'vidsrc_su', url: 'https://vidsrc.su/embed/movie/533535' },
  { id: 'embed_su', url: 'https://embed.su/embed/movie/533535' },
  { id: 'moviesapi', url: 'https://moviesapi.club/movie/533535' },
  { id: 'player_zxcprime', url: 'https://player.zxcprime.xyz/player/movie/533535?dubLang=hi' },
  { id: 'anyembed', url: 'https://anyembed.xyz/embed/tmdb-movie-533535' },
  { id: 'netfilm_world', url: 'https://netfilm.world/detail/lucifer-hindi-Aq2Bzbvyte1' },
  { id: '123movienow', url: 'https://123movienow.cc/detail/lucifer-hindi-Aq2Bzbvyte1' },
  { id: 'moviebox_trailer', url: 'https://macdn.aoneroom.com/media/vone/2024/03/19/57a6d508dc68df94cd4084c8a1893352-sd.mp4' }
];

async function checkUrl(item) {
  return new Promise((resolve) => {
    const start = Date.now();
    try {
      const u = new URL(item.url);
      const req = https.get(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://google.com/'
        },
        timeout: 5000
      }, res => {
        resolve({ id: item.id, status: res.statusCode, time: Date.now() - start, location: res.headers.location });
      });
      req.on('error', err => resolve({ id: item.id, status: 'ERROR', error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ id: item.id, status: 'TIMEOUT' }); });
    } catch (e) {
      resolve({ id: item.id, status: 'INVALID', error: e.message });
    }
  });
}

async function run() {
  console.log('Testing candidates...\n');
  const results = await Promise.all(candidates.map(checkUrl));
  for (const r of results) {
    const icon = r.status === 200 || (r.status >= 300 && r.status < 400) ? '✅' : '❌';
    console.log(`${icon} [${r.id}] Status: ${r.status} (${r.time}ms) ${r.location ? '-> ' + r.location : ''}`);
  }
}

run();
