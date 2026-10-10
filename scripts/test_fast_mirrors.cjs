const http = require('http');
const { spawn } = require('child_process');

async function testFastMirrors() {
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const PORT = 9881;
  const edge = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-mirrors-profile',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}/json`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const page = list.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  const candidates = [
    { name: 'NxSha TV', url: 'https://nxsha.space/embed/tv/93405/1/1?lang=hi&disable_app_ad=true' },
    { name: 'VidLink TV', url: 'https://vidlink.pro/tv/93405/1/1?primaryColor=06b6d4' },
    { name: 'VidLink Movie', url: 'https://vidlink.pro/movie/533535?primaryColor=06b6d4' },
    { name: 'Embed.su TV', url: 'https://embed.su/embed/tv/93405/1/1' },
    { name: 'Embed.su Movie', url: 'https://embed.su/embed/movie/533535' },
    { name: 'VidSrc CC TV', url: 'https://vidsrc.cc/v2/embed/tv/93405/1/1' },
    { name: 'VidSrc CC Movie', url: 'https://vidsrc.cc/v2/embed/movie/533535' },
    { name: 'AutoEmbed TV', url: 'https://autoembed.co/tv/tmdb/93405-1-1' },
    { name: 'AutoEmbed Movie', url: 'https://autoembed.co/movie/tmdb/533535' },
    { name: '123Embed TV', url: 'https://play2.123embed.net/tv/93405/1/1?audio=hi' },
    { name: '123Embed Movie', url: 'https://play2.123embed.net/movie/533535?audio=hi' },
    { name: 'Cinema Mirror 2 (2embed.skin)', url: 'https://www.2embed.skin/embedtv/93405&s=1&e=1' },
    { name: 'ZXC Prime TV', url: 'https://player.zxcprime.xyz/player/tv/93405/1/1?dubLang=hi&server=0' }
  ];

  for (const c of candidates) {
    const t0 = Date.now();
    await send('Page.navigate', { url: c.url });
    await new Promise(r => setTimeout(r, 4500));
    const elapsed = Date.now() - t0;

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        const iframes = Array.from(document.querySelectorAll('iframe')).map(i => i.src);
        const videos = Array.from(document.querySelectorAll('video')).map(v => v.src);
        const isBlocked = text.includes('Attention Required') || text.includes('refused to connect') || text.includes('Playback Error') || text.includes('404');
        return {
          title: document.title,
          videosCount: videos.length,
          iframesCount: iframes.length,
          isBlocked,
          textSnippet: text.slice(0, 100).replace(/\\s+/g, ' ')
        };
      })()`,
      returnByValue: true
    });
    console.log(`[${c.name}] (${elapsed}ms) - Blocked: ${res.result?.value?.isBlocked}, Videos: ${res.result?.value?.videosCount}, Iframes: ${res.result?.value?.iframesCount}, Title: "${res.result?.value?.title}"`);
  }

  ws.close();
  edge.kill();
  process.exit(0);
}

testFastMirrors().catch(e => {
  console.error(e);
  process.exit(1);
});
