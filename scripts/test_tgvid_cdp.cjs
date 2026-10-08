const http = require('http');
const { spawn } = require('child_process');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }
  waitForOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((resolve) => { this.ws.onopen = () => resolve(); });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = this.id++;
      this.callbacks.set(curId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }
  eval(expr) {
    return this.send('Runtime.evaluate', { expression: expr, returnByValue: true })
      .then(r => r.result?.value);
  }
}

async function testTgvid() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9227',
    '--disable-gpu',
    'about:blank'
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  const targets = await getJson('http://127.0.0.1:9227/json');
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const client = new SimpleCDP(pageTarget.webSocketDebuggerUrl);
  await client.waitForOpen();

  await client.send('Page.enable');
  await client.send('Page.navigate', { url: 'https://tgvid.lovable.app/embed/movie/1423191?color=38bdf8&back=true&server=hindi&lang=hi' });
  await new Promise(r => setTimeout(r, 6000));

  const text = await client.eval('document.body.innerText');
  console.log('TGVID Body Text with server=hindi:', (text || '').slice(0, 300));

  const srv = await client.eval('localStorage.getItem("tgflix:srv:movie:1423191")');
  console.log('Saved tgflix server in localStorage:', srv);

  const video = await client.eval('document.querySelector("video")?.currentSrc || document.querySelector("video")?.src');
  console.log('Video currentSrc:', video);

  client.ws.close();
  edge.kill();
}

testTgvid().catch(console.error);
