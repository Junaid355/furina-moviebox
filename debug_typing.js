import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9991;
const STATIC_PORT = 8769;
const USER_DATA_DIR = path.join(process.cwd(), 'edge-debug-profile');
const BASE_URL = `http://127.0.0.1:${STATIC_PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
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
  waitForOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
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
      throw new Error(`Eval error: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }
}

async function main() {
  const root = path.resolve(process.cwd(), 'dist');
  const mime = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav'
  };

  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    if (p.startsWith('/furina-moviebox/')) p = p.replace('/furina-moviebox/', '/');
    let file = path.join(root, p);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(root, 'index.html');
    }
    const ext = path.extname(file).toLowerCase();
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.createReadStream(file).pipe(res);
  });

  await new Promise((resolve) => server.listen(STATIC_PORT, '127.0.0.1', resolve));
  console.log(`✓ Static server listening on ${BASE_URL}`);

  const edgeProcess = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=400,900',
    'about:blank'
  ], { stdio: 'ignore' });

  await sleep(2000);
  const targets = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page' && !t.url.startsWith('edge://')) || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.waitForOpen();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');

  // Set iPhone 14 Pro emulation: 390x844 DPR 3
  await client.send('Network.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  });
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
    screenOrientation: { angle: 0, type: 'portraitPrimary' }
  });
  await client.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5
  });

  await client.send('Page.navigate', { url: `${BASE_URL}/` });
  await sleep(3500);

  // Inspect Navbar and Search Input geometry and layer
  const info = await client.eval(`
    (() => {
      const input = document.querySelector('input[placeholder*="Search"]');
      if (!input) return { found: false };
      const rect = input.getBoundingClientRect();
      const elemAtCenter = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      
      const header = document.querySelector('header');
      const headerRect = header ? header.getBoundingClientRect() : null;
      
      const logo = header ? header.querySelector('.flex.items-center.cursor-pointer') : null;
      const logoRect = logo ? logo.getBoundingClientRect() : null;
      
      const buttons = header ? Array.from(header.querySelectorAll('button')).map(b => ({
        tag: b.tagName,
        text: b.textContent.trim(),
        ariaLabel: b.getAttribute('aria-label'),
        rect: b.getBoundingClientRect()
      })) : [];

      return {
        found: true,
        inputRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        elemAtCenter: elemAtCenter ? { tag: elemAtCenter.tagName, class: elemAtCenter.className, isInput: elemAtCenter === input } : null,
        headerRect: headerRect ? { x: headerRect.x, y: headerRect.y, width: headerRect.width, height: headerRect.height, scrollWidth: header.scrollWidth } : null,
        logoRect: logoRect ? { width: logoRect.width, right: logoRect.right } : null,
        buttons: buttons.map(b => ({ text: b.text || b.ariaLabel, rect: { x: b.rect.x, width: b.rect.width } })),
        windowScrollY: window.scrollY,
        documentScrollWidth: document.documentElement.scrollWidth,
        documentClientWidth: document.documentElement.clientWidth
      };
    })()
  `);

  console.log('--- iPhone 14 Pro Geometry Inspection ---');
  console.log(JSON.stringify(info, null, 2));

  // Now attempt to tap on the input via CDP Touch Event
  if (info.found) {
    const tapX = Math.round(info.inputRect.x + info.inputRect.width / 2);
    const tapY = Math.round(info.inputRect.y + info.inputRect.height / 2);
    console.log(`\nDispatching Touch Event at (${tapX}, ${tapY})...`);

    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: tapX, y: tapY }]
    });
    await sleep(50);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });

    await sleep(500);

    const focusStatus = await client.eval(`
      (() => {
        const input = document.querySelector('input[placeholder*="Search"]');
        return {
          activeElement: document.activeElement?.tagName,
          isInputFocused: document.activeElement === input,
          inputValue: input?.value,
          windowScrollY: window.scrollY
        };
      })()
    `);
    console.log('Focus status after touch:', focusStatus);

    // Try typing characters via CDP Input.dispatchKeyEvent
    console.log('\nDispatching Key Events for "Spider"...');
    for (const char of 'Spider') {
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        text: char,
        unmodifiedText: char,
        key: char
      });
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: char
      });
      await sleep(50);
    }

    await sleep(500);
    const typingResult = await client.eval(`
      (() => {
        const input = document.querySelector('input[placeholder*="Search"]');
        return {
          inputValue: input?.value,
          resultsFound: document.querySelectorAll('.glass-card').length
        };
      })()
    `);
    console.log('Typing result:', typingResult);
  }

  // Also capture screenshot
  const screenshotRes = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('artifacts/debug_iphone14_typing.png', Buffer.from(screenshotRes.data, 'base64'));
  console.log('Screenshot saved to artifacts/debug_iphone14_typing.png');

  server.close();
  edgeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
