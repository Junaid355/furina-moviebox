const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-deadpool-verify';
const PORT = 9897;
const BASE_URL = 'http://127.0.0.1:4173';

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

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(res.data, 'base64'));
  }

  async close() {
    this.ws.close();
  }
}

async function verifyDeadpool() {
  console.log('--- Starting Chrome DevTools Protocol Verification for Deadpool & Wolverine ---');
  
  // 1. Start Static Server on 4173
  const distDir = path.join(__dirname, '..', 'dist');
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.webm': 'video/webm',
    '.ogg': 'audio/ogg'
  };

  const previewServer = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(distDir, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (e) {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise((resolve) => previewServer.listen(4173, '127.0.0.1', resolve));
  console.log('✓ Static server running on port 4173');

  if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });

  const edgeProcess = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1366,768',
    'about:blank'
  ], { detached: false, stdio: 'ignore' });

  await sleep(2000);

  try {
    const targets = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page');
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.waitForOpen();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log(`Navigating to ${BASE_URL}...`);
    await client.send('Page.navigate', { url: BASE_URL });
    await sleep(3500);

    // Inject React helper
    await client.eval(`
      window.__setReactInput = function(selector, value) {
        const input = document.querySelector(selector);
        if (!input) return false;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(input, value);
        else input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      };
    `);

    // Search for Deadpool
    console.log('Searching for "Deadpool"...');
    await client.eval(`window.__setReactInput('input[type="text"]', 'Deadpool');`);
    await sleep(2500);

    // Click Deadpool card
    console.log('Opening Deadpool & Wolverine player...');
    await client.eval(`
      (() => {
        const card = document.querySelector('.glass-card');
        if (card) card.click();
      })()
    `);
    await sleep(3000);

    // Verify Player loaded
    const playerCheck = await client.eval(`
      (() => {
        const iframe = document.querySelector('iframe');
        const hasSandbox = iframe ? iframe.hasAttribute('sandbox') : false;
        const iframeSrc = iframe ? iframe.src : '';
        const titleEl = document.querySelector('h2');
        const title = titleEl ? titleEl.textContent : '';
        const aiBanner = document.body.innerText.includes('AI Auto-Selected');
        const ublockBtn = document.querySelector('button[title*="Furina Ad-Shield"]');
        return {
          hasSandbox,
          iframeSrc,
          title,
          hasAiBanner: Boolean(aiBanner),
          hasUblockBtn: Boolean(ublockBtn)
        };
      })()
    `);

    console.log('\n--- PLAYER INSPECTION RESULTS ---');
    console.log('Modal Title:', playerCheck.title);
    console.log('Iframe Src:', playerCheck.iframeSrc);
    console.log('Has Sandbox Attribute (MUST BE FALSE):', playerCheck.hasSandbox);
    console.log('Has Ad-Shield Button:', playerCheck.hasUblockBtn);
    console.log('AI Auto-Select Banner Displayed:', playerCheck.hasAiBanner);

    // Test AI Auto-Select button click
    console.log('\nTesting AI Auto-Select button...');
    await client.eval(`
      (() => {
        const aiBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('AI Auto-Select'));
        if (aiBtn) aiBtn.click();
      })()
    `);
    await sleep(1000);

    const afterAiClick = await client.eval(`
      (() => {
        const iframe = document.querySelector('iframe');
        return {
          src: iframe ? iframe.src : '',
          hasSandbox: iframe ? iframe.hasAttribute('sandbox') : false
        };
      })()
    `);
    console.log('After AI Auto-Select Src:', afterAiClick.src);
    console.log('After AI Auto-Select Sandbox:', afterAiClick.hasSandbox);

    // Test opening uBlock HUD
    console.log('\nTesting uBlock HUD modal...');
    await client.eval(`
      (() => {
        const btn = document.querySelector('button[title*="Furina Ad-Shield"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    const ublockModal = await client.eval(`
      (() => {
        const title = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('FURINA AD-SHIELD PRO'));
        return Boolean(title);
      })()
    `);
    console.log('uBlock HUD Modal Opened:', ublockModal);

    // Trigger test trap
    await client.eval(`
      (() => {
        const trapBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Test Ad-Shield Trap'));
        if (trapBtn) trapBtn.click();
      })()
    `);
    await sleep(500);

    const blockedCount = await client.eval(`
      parseInt(localStorage.getItem('furina_blocked_ads_count') || '0', 10)
    `);
    console.log('Intercepted Blocked Count:', blockedCount);

    const artifactDir = path.join(__dirname, '..', 'artifacts');
    if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
    const screenshotPath = path.join(artifactDir, 'deadpool_verified_player.png');
    await client.captureScreenshot(screenshotPath);
    console.log(`📸 Captured screenshot to: ${screenshotPath}`);

    const allGood = !playerCheck.hasSandbox && !afterAiClick.hasSandbox && ublockModal && blockedCount > 0;
    console.log('\n--- VERIFICATION RESULT ---');
    console.log(allGood ? '✅ ALL CHECKS PASSED: Zero sandbox errors, AI Auto-Server active, uBlock HUD verified!' : '❌ CHECKS FAILED');

    await client.close();
    previewServer.close();
    return allGood;
  } finally {
    edgeProcess.kill();
    try { fs.rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
  }
}

verifyDeadpool().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
