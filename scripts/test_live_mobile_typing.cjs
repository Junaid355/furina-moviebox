const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-live-mobile';
  const port = 9897;

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
  await send('Network.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
    screenOrientation: { angle: 0, type: 'portraitPrimary' }
  });

  await send('Page.navigate', { url: 'https://junaid355.github.io/furina-moviebox/' });
  await new Promise(r => setTimeout(r, 4500));

  const focusRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const inp = document.querySelector('input[placeholder*="Search"]');
      if (!inp) return { found: false };
      inp.focus();
      return {
        found: true,
        focused: document.activeElement === inp,
        scrollWidth: document.documentElement.scrollWidth,
        hasOverflow: document.documentElement.scrollWidth > 390
      };
    })()`,
    returnByValue: true
  });
  console.log('Live Mobile Focus Test:', focusRes.result.value);

  // Send real key events for "Deadpool"
  for (const c of 'Deadpool') {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', text: c, unmodifiedText: c, key: c });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: c });
    await new Promise(r => setTimeout(r, 40));
  }
  await new Promise(r => setTimeout(r, 600));

  const typedRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const inp = document.querySelector('input[placeholder*="Search"]');
      return {
        value: inp ? inp.value : null,
        cardsCount: document.querySelectorAll('.glass-card').length
      };
    })()`,
    returnByValue: true
  });
  console.log('Live Mobile Typed Result:', typedRes.result.value);

  ws.close();
  child.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
