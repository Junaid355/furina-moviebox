const http = require('http');
const { spawn } = require('child_process');

async function inspectMovieBox() {
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const PORT = 9885;
  const edge = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-inspect-profile',
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

  const networkRequests = [];
  ws.addEventListener('message', evt => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Network.requestWillBeSent') {
      const u = msg.params.request.url;
      if (!u.endsWith('.png') && !u.endsWith('.jpg') && !u.endsWith('.jpeg') && !u.endsWith('.webp') && !u.endsWith('.svg') && !u.endsWith('.css') && !u.endsWith('.woff2')) {
        networkRequests.push({ url: u, method: msg.params.request.method, type: msg.params.type });
      }
    }
  });

  await send('Page.enable');
  await send('Network.enable');
  await send('Runtime.enable');

  console.log('Navigating to https://themoviebox.xyz/ ...');
  await send('Page.navigate', { url: 'https://themoviebox.xyz/' });
  await new Promise(r => setTimeout(r, 6000));

  // Find movie links on page
  const pageDetails = await send('Runtime.evaluate', {
    expression: `(() => {
      const links = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('/movies/') || h.includes('/detail/'));
      return {
        title: document.title,
        movieLinks: [...new Set(links)].slice(0, 10),
        iframes: Array.from(document.querySelectorAll('iframes')).map(f => f.src),
        videos: Array.from(document.querySelectorAll('video')).map(v => v.src)
      };
    })()`,
    returnByValue: true
  });
  console.log('Page details:', pageDetails.result?.value);

  // If a movie link exists, navigate to it!
  const firstMovie = pageDetails.result?.value?.movieLinks?.[0];
  if (firstMovie) {
    console.log('Navigating to first movie:', firstMovie);
    await send('Page.navigate', { url: firstMovie });
    await new Promise(r => setTimeout(r, 8000));

    const moviePlayDetails = await send('Runtime.evaluate', {
      expression: `(() => {
        const iframes = Array.from(document.querySelectorAll('iframe')).map(f => f.src);
        const videos = Array.from(document.querySelectorAll('video')).map(v => v.src);
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
        return {
          title: document.title,
          iframes,
          videos,
          buttons: buttons.slice(0, 20)
        };
      })()`,
      returnByValue: true
    });
    console.log('Movie play details:', moviePlayDetails.result?.value);
  }

  console.log('\n--- Captured Network Requests (relevant) ---');
  const interesting = networkRequests.filter(r => 
    r.url.includes('api') || 
    r.url.includes('embed') || 
    r.url.includes('play') || 
    r.url.includes('stream') || 
    r.url.includes('m3u8') || 
    r.url.includes('source') ||
    r.url.includes('bff') ||
    r.url.includes('wefeed')
  );
  console.log(interesting.slice(0, 30));

  ws.close();
  edge.kill();
  process.exit(0);
}

inspectMovieBox().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
