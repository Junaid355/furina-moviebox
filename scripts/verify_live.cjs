const http = require('http');
const { spawn } = require('child_process');

async function testLive() {
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const PORT = 9889;
  const edge = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-live-profile',
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

  const errors = [];
  ws.addEventListener('message', evt => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push((msg.params.args || []).map(a => a.value || a.description || '').join(' '));
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'https://junaid355.github.io/furina-moviebox/' });
  await new Promise(r => setTimeout(r, 4500));

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.title;
      const cards = document.querySelectorAll('.glass-card').length;
      const navButtons = document.querySelectorAll('header button').length;
      const heroPresent = Boolean(document.querySelector('h1'));
      return { title, cards, navButtons, heroPresent };
    })()`,
    returnByValue: true
  });

  console.log('LIVE PAGE AUDIT RESULT:', evalRes.result?.value);
  console.log('LIVE JS ERRORS:', errors);

  ws.close();
  edge.kill();
  process.exit(0);
}

testLive().catch(err => {
  console.error('Test Live Failed:', err);
  process.exit(1);
});
