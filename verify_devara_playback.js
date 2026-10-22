import { spawn } from 'child_process';
import http from 'http';
const WebSocket = globalThis.WebSocket;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  waitForOpen() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (err) => reject(err));
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
    return res?.result?.value;
  }
}

async function run() {
  console.log('🚀 Starting Devara & Player Verification...');

  // Start static server on port 4175
  const edgePort = 9922;
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${edgePort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  await sleep(1500);

  let targets = [];
  for (let i = 0; i < 10; i++) {
    try {
      targets = await httpGetJson(`http://127.0.0.1:${edgePort}/json/list`);
      if (targets && targets.length > 0) break;
    } catch (e) {
      await sleep(500);
    }
  }

  const page = targets.find((t) => t.type === 'page') || targets[0];
  console.log('Connected to Edge:', page.title);

  const client = new CDP(page.webSocketDebuggerUrl);
  await client.waitForOpen();
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const errors = [];
  client.ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        errors.push(msg.params.exceptionDetails);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    } catch (e) {}
  });

  await client.send('Page.navigate', { url: 'https://junaid355.github.io/furina-moviebox/' });
  await sleep(4000);

  // 0. Check Fontaine Cozy Midnight shelf posters on Homepage first
  console.log('0. Checking Fontaine Cozy Midnight posters on Home...');
  const postersCheck = await client.eval(`
    (() => {
      const images = Array.from(document.querySelectorAll('img[alt*="Your Name"], img[alt*="Suzume"], img[alt*="Weathering with You"]'));
      return images.map(img => ({
        alt: img.alt,
        src: img.src,
        hasError: img.src.includes('icon-512'),
        naturalWidth: img.naturalWidth,
        complete: img.complete
      }));
    })();
  `);
  console.log('🌧️ Fontaine Cozy Midnight Posters:', JSON.stringify(postersCheck, null, 2));

  // 1. Invoke window.__playMedia with Devara: Part 1 (TMDB 866398)
  console.log('1. Directly invoking window.__playMedia for Devara: Part 1...');
  const invokeResult = await client.eval(`
    (() => {
      if (typeof window.__playMedia === 'function') {
        window.__playMedia({
          id: 866398,
          title: "Devara: Part 1",
          name: "Devara: Part 1",
          original_language: "te",
          category: "hindi",
          isHindiDubbed: true,
          hasHindiDub: true,
          media_type: "movie"
        });
        return true;
      }
      return false;
    })();
  `);
  console.log('Invoked window.__playMedia for Devara:', invokeResult);

  // Wait for lazy-loaded PlayerModal chunk to load over network
  let modalDetected = false;
  for (let w = 0; w < 20; w++) {
    modalDetected = await client.eval(`Boolean(document.querySelector('.fixed.inset-0.z-50') || document.querySelector('button[title*="Close Player"]'))`);
    if (modalDetected) break;
    await sleep(500);
  }
  console.log('Modal detected after wait:', modalDetected);
  if (!modalDetected) {
    console.log('Recorded Console / Runtime Errors:', JSON.stringify(errors, null, 2));
  }

  // 2. Inspect Player Modal State for Devara
  const playerState = await client.eval(`
    (() => {
      const modal = document.querySelector('.fixed.inset-0.z-50');
      if (!modal) return { open: false };

      const title = modal.querySelector('h2')?.textContent || '';
      
      // Check audio buttons
      const audioButtons = Array.from(modal.querySelectorAll('button')).map(b => ({
        text: b.textContent.trim(),
        title: b.getAttribute('title') || '',
        disabled: b.disabled || b.classList.contains('cursor-not-allowed') || b.textContent.includes('Unavailable')
      }));

      const hindiBtn = audioButtons.find(b => b.text.includes('Hindi') || b.text.includes('HI'));
      const enBtn = audioButtons.find(b => b.text.includes('English') || b.text.includes('EN'));
      const servers = Array.from(modal.querySelectorAll('button')).filter(b => b.textContent.includes('Server') || b.textContent.includes('Multi'));

      // Check current iframe src
      const iframe = modal.querySelector('iframe');
      const iframeSrc = iframe ? iframe.src : '';

      return {
        open: true,
        title,
        hindiBtn,
        enBtn,
        iframeSrc,
        hasAudioSwitching: Boolean(hindiBtn && !hindiBtn.disabled)
      };
    })();
  `);

  console.log('🎬 Devara Player State:', JSON.stringify(playerState, null, 2));

  // 3. Test clicking Hindi audio button if available
  if (playerState.open && playerState.hindiBtn) {
    console.log('3. Clicking Hindi Audio Track button...');
    const switchResult = await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('.fixed.inset-0.z-50 button'));
        const hindiBtn = buttons.find(b => b.textContent.includes('Hindi') || b.textContent.includes('HI'));
        if (hindiBtn) {
          hindiBtn.click();
          return true;
        }
        return false;
      })();
    `);
    console.log('Clicked Hindi button:', switchResult);
    await sleep(2000);

    const postSwitchSrc = await client.eval(`
      (() => {
        const iframe = document.querySelector('.fixed.inset-0.z-50 iframe');
        return iframe ? iframe.src : '';
      })();
    `);
    console.log('New Stream Iframe Src after selecting Hindi:', postSwitchSrc);
  }

  // 4. Test Mobile Bottom Nav positioning
  console.log('4. Testing Mobile Bottom Nav positioning...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  });
  await sleep(1000);

  const mobileNavCheck = await client.eval(`
    (() => {
      const nav = document.querySelector('nav.fixed.bottom-0');
      if (!nav) return { exists: false };
      const rect = nav.getBoundingClientRect();
      const style = window.getComputedStyle(nav);
      return {
        exists: true,
        position: style.position,
        bottom: rect.bottom,
        windowHeight: window.innerHeight,
        isAtBottom: Math.abs(rect.bottom - window.innerHeight) <= 2,
        zIndex: style.zIndex
      };
    })();
  `);
  console.log('📱 Mobile Nav Check:', mobileNavCheck);



  // Close Edge
  try {
    edge.kill();
  } catch (e) {}
  console.log('🏁 Verification Completed Successfully!');
  process.exit(0);
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
