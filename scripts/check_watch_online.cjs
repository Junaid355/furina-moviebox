const http = require('http');
const { spawn } = require('child_process');

async function checkWatchOnline() {
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const PORT = 9884;
  const edge = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-watch-profile',
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

  const requests = [];
  ws.addEventListener('message', evt => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Network.requestWillBeSent') {
      requests.push(msg.params.request.url);
    }
  });

  await send('Page.enable');
  await send('Network.enable');
  await send('Runtime.enable');

  console.log('Navigating to detail page...');
  await send('Page.navigate', { url: 'https://themoviebox.xyz/detail/take-charge-of-my-heart-hindi-oIO9IBe3Lt9' });
  await new Promise(r => setTimeout(r, 6000));

  // Click Watch Online button
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('Watch Online'));
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.textContent, href: btn.href };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result?.value);

  await new Promise(r => setTimeout(r, 6000));

  const afterClick = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.href,
        iframes: Array.from(document.querySelectorAll('iframe')).map(f => f.src),
        videos: Array.from(document.querySelectorAll('video')).map(v => v.src),
        bodyTextSnippet: document.body.innerText.slice(0, 300)
      };
    })()`,
    returnByValue: true
  });
  console.log('After click state:', afterClick.result?.value);

  console.log('New requests:', requests.filter(u => u.includes('play') || u.includes('embed') || u.includes('stream') || u.includes('m3u8') || u.includes('media')).slice(0, 20));

  ws.close();
  edge.kill();
  process.exit(0);
}

checkWatchOnline().catch(err => {
  console.error(err);
  process.exit(1);
});
