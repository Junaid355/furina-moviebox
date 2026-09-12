import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-debug-profile';
const PORT = 9887;

function serveDist() {
  const distDir = path.resolve('dist');
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(distDir, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200);
      res.end(content);
    } catch (e) {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  return new Promise(r => server.listen(4173, '127.0.0.1', () => r(server)));
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
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

  async waitForOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise(r => this.ws.onopen = r);
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.text);
    return res.result?.value;
  }

  async close() { this.ws.close(); }
}

async function debug() {
  const server = await serveDist();
  const edgeProcess = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank'
  ]);
  await sleep(1500);
  const targets = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
  const client = new CDPClient(targets[0].webSocketDebuggerUrl);
  await client.waitForOpen();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Page.navigate', { url: 'http://127.0.0.1:4173' });
  await sleep(3000);

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

  // Search Inside Out
  await client.eval(`window.__setReactInput('input[type="text"]', 'Inside Out');`);
  await sleep(2500);

  const cardsInfo = await client.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.glass-card')).map(c => c.textContent.trim());
      return { count: cards.length, titles: cards.slice(0, 5) };
    })()
  `);
  console.log('Search "Inside Out" cards:', cardsInfo);

  const clicked = await client.eval(`
    (() => {
      const card = Array.from(document.querySelectorAll('.glass-card')).find(c => c.textContent.includes('Inside Out')) || document.querySelector('.glass-card');
      if (card) {
        card.click();
        return true;
      }
      return false;
    })()
  `);
  console.log('Card clicked:', clicked);
  await sleep(2000);

  const modalInfo = await client.eval(`
    (() => {
      const modal = document.querySelector('.fixed.inset-0');
      const title = document.querySelector('h2')?.textContent || '';
      const hindiBtn = document.querySelector('[data-testid="audio-btn-hindi"]');
      const engBtn = document.querySelector('[data-testid="audio-btn-english"]');
      const text = document.body.innerText;
      return {
        hasModal: Boolean(modal),
        title,
        hasHindiBtn: Boolean(hindiBtn),
        hasEngBtn: Boolean(engBtn),
        hasEngActive: text.includes('English Audio Active'),
        allButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean)
      };
    })()
  `);
  console.log('Modal Info:', modalInfo);

  await client.close();
  edgeProcess.kill();
  server.close();
  try { fs.rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
}

debug().catch(console.error);
