const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-live-diag';
const PORT = 9889;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.networkRequests = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === 'Runtime.consoleAPICalled') {
          const type = msg.params.type;
          const text = (msg.params.args || []).map(a => a.value || a.description || '').join(' ');
          this.consoleLogs.push({ type, text });
          if (type === 'error') this.consoleErrors.push(text);
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          const text = msg.params.exceptionDetails?.text || 'Unknown Exception';
          const desc = msg.params.exceptionDetails?.exception?.description || '';
          this.consoleErrors.push(`${text} ${desc}`);
        }
        if (msg.method === 'Network.responseReceived') {
          this.networkRequests.push({
            url: msg.params.response.url,
            status: msg.params.response.status,
            type: msg.params.type
          });
        }
      }
    };
  }

  async waitForOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text} - ${res.exceptionDetails.exception?.description}`);
    }
    return res.result?.value;
  }

  async close() {
    this.ws.close();
  }
}

async function diagnose() {
  if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  const edgeProcess = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=msEdgeSyncConfirmationDialog',
    '--disable-gpu',
    '--window-size=1280,900',
    'about:blank'
  ], { detached: false, stdio: 'ignore' });

  await sleep(2000);
  try {
    let targets = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page');
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.waitForOpen();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');
    await client.send('Network.enable');

    console.log('Navigating to live site: https://junaid355.github.io/furina-moviebox/');
    await client.send('Page.navigate', { url: 'https://junaid355.github.io/furina-moviebox/' });
    await sleep(6000);

    const title = await client.eval('document.title');
    const rootHtml = await client.eval('document.getElementById("root")?.innerHTML?.substring(0, 300) || ""');
    const loaderVisible = await client.eval('Boolean(document.getElementById("initial-loader"))');
    const fallbackVisible = await client.eval('document.getElementById("slow-network-fallback")?.style.display');
    const cardCount = await client.eval('document.querySelectorAll(".glass-card").length');
    const bodyText = await client.eval('document.body.innerText');

    console.log('\n--- LIVE DIAGNOSTICS RESULTS ---');
    console.log('Title:', title);
    console.log('Loader Visible:', loaderVisible);
    console.log('Fallback Display Style:', fallbackVisible);
    console.log('Card Count Rendered:', cardCount);
    console.log('Body Text Snippet:', bodyText.substring(0, 200));
    console.log('\nConsole Errors (' + client.consoleErrors.length + '):');
    client.consoleErrors.forEach((e, i) => console.log(`  [${i+1}] ${e}`));
    console.log('\nAll Console Logs (' + client.consoleLogs.length + '):');
    client.consoleLogs.forEach((l, i) => console.log(`  [${i+1}] [${l.type}] ${l.text}`));
    console.log('\nNetwork Responses (' + client.networkRequests.length + '):');
    client.networkRequests.forEach((r, i) => console.log(`  [${i+1}] ${r.status} ${r.type} ${r.url}`));

    await client.close();
  } finally {
    edgeProcess.kill();
    try { fs.rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
  }
}

diagnose().catch(console.error);
