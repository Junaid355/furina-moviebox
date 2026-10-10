const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const distDir = path.join(process.cwd(), 'dist');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
});

server.listen(4178, '127.0.0.1', async () => {
  console.log('Server on 4178');
  const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless',
    '--remote-debugging-port=9993',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  
  try {
    const version = await fetch('http://127.0.0.1:9993/json/version').then(r => r.json());
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    
    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        resolve(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('BROWSER CONSOLE:', msg.params.type, (msg.params.args||[]).map(a=>a.value||a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('BROWSER EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
      }
    };

    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://127.0.0.1:4178' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Evaluating first card click...');
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector(".glass-card") || document.querySelector("[data-media-id]");
          if (!card) return "no card found";
          card.click();
          return "card clicked";
        })()
      `,
      returnByValue: true
    });
    console.log('Click res:', clickRes.result?.value);

    await new Promise(r => setTimeout(r, 1500));
    const checkModal = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            hasMediaContainer: Boolean(document.querySelector("[data-testid=\\"player-media-container\\"]")),
            closeBtn: Boolean(document.querySelector("button[title*=\\"Close Player\\"]")),
            h2Text: document.querySelector("h2")?.textContent,
            allH2s: Array.from(document.querySelectorAll("h2")).map(h => h.textContent),
            playerActive: document.body.classList.contains("furina-player-active")
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Check modal result:', JSON.stringify(checkModal.result?.value, null, 2));

  } catch (e) {
    console.error('Error:', e);
  } finally {
    edge.kill();
    server.close();
    process.exit(0);
  }
});
