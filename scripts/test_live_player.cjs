const http = require('http');
const { spawn } = require('child_process');

async function testLivePlayer() {
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const PORT = 9899;
  const edge = spawn(EDGE_PATH, [
    '--headless',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-live-player-check',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:' + PORT + '/json', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
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
  await send('Page.navigate', { url: 'https://junaid355.github.io/furina-moviebox/' });
  await new Promise(r => setTimeout(r, 5000));

  // Type search 'Dark Knight'
  await send('Runtime.evaluate', {
    expression: '(() => { const input = document.querySelector("input[type=\'text\']"); if (input) { input.value = "Dark Knight"; input.dispatchEvent(new Event("input", { bubbles: true })); } })()'
  });
  await new Promise(r => setTimeout(r, 2000));

  // Search and click Dark Knight
  await send('Runtime.evaluate', {
    expression: '(() => { const card = Array.from(document.querySelectorAll(".glass-card")).find(c => c.textContent.includes("Dark Knight")) || document.querySelector(".glass-card"); if (card) card.click(); })()'
  });
  await new Promise(r => setTimeout(r, 2000));

  const playerState = await send('Runtime.evaluate', {
    expression: '(() => { const iframe = document.querySelector("iframe"); return { iframeSrc: iframe ? iframe.src : "none" }; })()',
    returnByValue: true
  });
  console.log('LIVE PLAYER STATE:', playerState.result?.value);

  ws.close();
  edge.kill();
  process.exit(0);
}

testLivePlayer().catch(e => {
  console.error(e);
  process.exit(1);
});
