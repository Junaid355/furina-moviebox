const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testLive() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-live-profile';
  const port = 9899;

  const child = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--disable-gpu',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === msgId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Page.navigate', { url: 'https://junaid355.github.io/furina-moviebox/' });
  await new Promise(r => setTimeout(r, 5000));

  const evaluation = await send('Runtime.evaluate', {
    expression: '({ title: document.title, cardCount: document.querySelectorAll(".glass-card").length, isLoaded: !document.getElementById("initial-loader") || document.getElementById("initial-loader").style.display === "none" })',
    returnByValue: true
  });
  console.log('Live Page Evaluation:', evaluation.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outDir = path.resolve('artifacts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'live_verified_deployment.png'), Buffer.from(shot.data, 'base64'));
  console.log('Live screenshot saved to artifacts/live_verified_deployment.png');

  ws.close();
  child.kill();
}

testLive().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
