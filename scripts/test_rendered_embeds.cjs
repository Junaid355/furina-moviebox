const http = require('http');
const { spawn } = require('child_process');

async function testPlayerEmbeds() {
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const PORT = 9882;
  const edge = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-embed-profile',
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

  const testUrls = [
    { name: 'VidStuck S1', url: 'https://vidstuck.xyz/embed/tv/93405/1/1?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=hi&subtitle=english&loading=2' },
    { name: 'VidFast S2', url: 'https://vidfast.vc/tv/93405/1/1?autoPlay=true' },
    { name: 'NxSha S3', url: 'https://nxsha.space/embed/tv/93405/1/1?lang=hi&disable_app_ad=true' },
    { name: 'VidSrc Cloud S6', url: 'https://vidsrc.su/embed/tv/93405/1/1?dubLang=hi' },
    { name: '2Embed VIP S7', url: 'https://www.2embed.cc/embedtv/93405&s=1&e=1' },
    { name: '123Embed S9', url: 'https://play2.123embed.net/tv/93405/1/1?audio=hi' },
    { name: 'AutoEmbed S11', url: 'https://autoembed.co/tv/tmdb/93405-1-1' }
  ];

  for (const t of testUrls) {
    console.log(`\nTesting ${t.name} (${t.url})...`);
    await send('Page.navigate', { url: t.url });
    await new Promise(r => setTimeout(r, 6000));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        const iframes = Array.from(document.querySelectorAll('iframe')).map(i => i.src);
        const videos = Array.from(document.querySelectorAll('video')).map(v => v.src);
        const hasError = text.includes('refused to connect') || text.includes('Error') || text.includes('Not Found') || text.includes('404') || text.includes('Blocked');
        return {
          title: document.title,
          textSnippet: text.slice(0, 150).replace(/\\s+/g, ' '),
          iframesCount: iframes.length,
          iframes: iframes.slice(0, 3),
          videosCount: videos.length,
          hasError
        };
      })()`,
      returnByValue: true
    });
    console.log('Result:', check.result?.value);
  }

  ws.close();
  edge.kill();
  process.exit(0);
}

testPlayerEmbeds().catch(e => {
  console.error(e);
  process.exit(1);
});
