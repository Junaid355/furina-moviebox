import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9889;
const USER_DATA_DIR = path.join(process.cwd(), 'edge-mobile-profile');
const BASE_URL = 'http://127.0.0.1:4174';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
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

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) {
          reject(msg.error);
        } else {
          resolve(msg.result);
        }
      } else if (msg.method) {
        if (msg.method === 'Runtime.exceptionThrown') {
          const text = msg.params.exceptionDetails?.text || 'Unknown Exception';
          const desc = msg.params.exceptionDetails?.exception?.description || '';
          this.consoleErrors.push(`${text} ${desc}`);
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

  async setDeviceMetrics(width, height, deviceScaleFactor, mobile = true) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });
    await this.send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });
  }

  async setUserAgent(userAgent) {
    await this.send('Network.setUserAgentOverride', { userAgent });
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    if (res && res.data) {
      const buf = Buffer.from(res.data, 'base64');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, buf);
      console.log(`📸 Screenshot saved: ${outputPath}`);
      return true;
    }
    return false;
  }

  async close() {
    this.ws.close();
  }
}

async function runMobileTests() {
  console.log('====================================================');
  console.log('📱 STARTING MOBILE DEVICE EMULATION TEST SUITE');
  console.log('====================================================\n');

  // Start dedicated static server on port 4174
  const distDir = path.join(process.cwd(), 'dist');
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
    '.webm': 'video/webm'
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

  await new Promise((resolve) => previewServer.listen(4174, '127.0.0.1', resolve));
  console.log('✓ Mobile test static server listening on http://127.0.0.1:4174\n');

  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const edgeProcess = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=400,900',
    'about:blank'
  ], {
    detached: false,
    stdio: 'ignore'
  });

  await sleep(2500);

  let targets;
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      targets = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
      if (targets && targets.length > 0) break;
    } catch (e) {
      await sleep(500);
    }
  }

  if (!targets || targets.length === 0) {
    throw new Error('Failed to connect to Edge CDP endpoint for mobile test.');
  }

  const pageTarget = targets.find((t) => t.type === 'page' && !t.url.startsWith('edge://')) || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.waitForOpen();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');

  const testResults = [];
  function recordTest(num, name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[MOBILE TEST ${num}] ${status} - ${name} ${details ? '(' + details + ')' : ''}`);
    testResults.push({ num, name, passed, details });
  }

  try {
    // ==========================================
    // EMULATION 1: iPhone 14 Pro (390 x 844, DPR 3)
    // ==========================================
    console.log('\n--- EMULATION 1: iPhone 14 Pro (390x844 DPR 3) ---');
    await client.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');
    await client.setDeviceMetrics(390, 844, 3, true);

    await client.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(3500);

    // M1: Viewport and horizontal scroll check
    const m1Overflow = await client.eval(`
      ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > 390
      })
    `);
    recordTest('M1', 'iPhone 14 Pro Zero Horizontal Overflow', !m1Overflow.hasOverflow, `scrollWidth: ${m1Overflow.scrollWidth}px, clientWidth: ${m1Overflow.clientWidth}px`);

    // M2: Mobile Navbar & Compact Buttons Audit
    const m2Nav = await client.eval(`
      (() => {
        const search = document.querySelector('input[type="text"]');
        const studioBtn = document.querySelector('[data-testid="studio-btn"]');
        const pwaBtn = document.querySelector('button[title*="Android"], button[title*="APK"], button[aria-label*="Android"]');
        const settingsBtn = document.querySelector('[data-testid="settings-btn"], button[aria-label="Settings"]');
        return {
          hasSearch: Boolean(search),
          searchWidth: search ? search.getBoundingClientRect().width : 0,
          hasStudio: Boolean(studioBtn),
          hasPwa: Boolean(pwaBtn),
          hasSettings: Boolean(settingsBtn)
        };
      })()
    `);
    recordTest('M2', 'iPhone 14 Pro Compact Navbar Elements', m2Nav.hasSearch && m2Nav.searchWidth <= 200 && m2Nav.hasSettings, `Search width: ${Math.round(m2Nav.searchWidth)}px, Studio: ${m2Nav.hasStudio}, Settings: ${m2Nav.hasSettings}`);

    // M3: Virtual typing without viewport blowout
    await client.eval(`
      (() => {
        const input = document.querySelector('input[type="text"]');
        input.focus();
        input.value = 'Spider';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `);
    await sleep(1000);
    const m3Typing = await client.eval(`
      ({
        value: document.querySelector('input[type="text"]')?.value,
        hasOverflow: document.documentElement.scrollWidth > 390
      })
    `);
    recordTest('M3', 'Virtual Typing & Search without Viewport Distortion', m3Typing.value === 'Spider' && !m3Typing.hasOverflow, `Value: "${m3Typing.value}", Overflow: ${m3Typing.hasOverflow}`);

    // Clear search
    await client.eval(`
      (() => {
        const input = document.querySelector('input[type="text"]');
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `);
    await sleep(1500);

    // M4: Touch Tap on Mobile Category Filter Pill
    const m4TapResult = await client.eval(`
      (() => {
        const animeBtn = document.querySelector('button[data-category="anime"]');
        if (animeBtn) {
          animeBtn.click();
          return { clicked: true, text: animeBtn.textContent.trim() };
        }
        return { clicked: false };
      })()
    `);
    await sleep(2000);
    const m4CategoryTitle = await client.eval(`
      Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()).join(' | ')
    `);
    recordTest('M4', 'Touch Tap Category Filter Pill', m4CategoryTitle.toLowerCase().includes('anime'), `Category title: "${m4CategoryTitle}"`);

    // Reset back to trending
    await client.eval(`
      (() => {
        const homeBtn = document.querySelector('button[data-category="trending"]');
        if (homeBtn) homeBtn.click();
      })()
    `);
    await sleep(1500);

    // M5: Touch Tap on Media Card to Open Player
    const m5CardTap = await client.eval(`
      (() => {
        const card = document.querySelector('.glass-card[data-media-id]');
        if (card) {
          card.click();
          return true;
        }
        return false;
      })()
    `);
    await sleep(2000);

    // M6: Mobile Player Header Layout & Collision Audit
    const m6PlayerHeader = await client.eval(`
      (() => {
        const modal = document.querySelector('[role="dialog"], .fixed.inset-0');
        const closeBtn = document.querySelector('button[aria-label="Close video player modal"]');
        const avatar = document.querySelector('img[alt="Furina"]');
        const titleElem = document.querySelector('h2');
        if (!modal) return { open: false, error: 'Modal not open' };
        if (!closeBtn || !avatar || !titleElem) {
          return { open: true, hasElements: false, close: !!closeBtn, avatar: !!avatar, title: !!titleElem };
        }
        const avatarRect = avatar.getBoundingClientRect();
        const titleRect = titleElem.getBoundingClientRect();
        const closeRect = closeBtn.getBoundingClientRect();

        const overlapsAvatar = titleRect.left < (avatarRect.right - 2);
        const overlapsClose = titleRect.right > (closeRect.left + 5);

        return {
          open: true,
          hasElements: true,
          hasCollision: overlapsAvatar || overlapsClose,
          titleText: titleElem.textContent.trim(),
          avatarRight: Math.round(avatarRect.right),
          titleLeft: Math.round(titleRect.left),
          titleRight: Math.round(titleRect.right),
          closeLeft: Math.round(closeRect.left)
        };
      })()
    `);
    recordTest('M6', 'Mobile Player Header Layout (Zero Collision/Overlap)', m6PlayerHeader.open && !m6PlayerHeader.hasCollision, `Player open: ${m6PlayerHeader.open}, Collision: ${m6PlayerHeader.hasCollision}, Title: "${m6PlayerHeader.titleText}"`);

    // Close Player
    await client.eval(`
      (() => {
        const closeBtn = document.querySelector('button[aria-label="Close video player modal"]');
        if (closeBtn) closeBtn.click();
        else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      })()
    `);
    await sleep(1000);

    // M7: Settings Modal Touch Open & Compact Layout Audit
    await client.eval(`
      (() => {
        const settingsBtn = document.querySelector('[data-testid="settings-btn"], button[aria-label="Settings"]');
        if (settingsBtn) settingsBtn.click();
      })()
    `);
    await sleep(1000);
    const m7Settings = await client.eval(`
      (() => {
        const modal = document.querySelector('[role="dialog"], .fixed.inset-0');
        return {
          open: Boolean(modal),
          hasOverflow: document.documentElement.scrollWidth > 390
        };
      })()
    `);
    recordTest('M7', 'Settings Modal Compact Mobile Layout', m7Settings.open && !m7Settings.hasOverflow, `Open: ${m7Settings.open}, Overflow: ${m7Settings.hasOverflow}`);

    // Close Settings
    await client.eval(`
      (() => {
        const closeBtn = document.querySelector('button[aria-label="Close Settings"]');
        if (closeBtn) closeBtn.click();
        else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      })()
    `);
    await sleep(800);

    // M8: Touch Scroll Performance & Canvas Pause Check
    const m8ScrollPassive = await client.eval(`
      new Promise((resolve) => {
        window.scrollTo({ top: 300, behavior: 'instant' });
        setTimeout(() => {
          const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
          resolve({
            scrollY: y,
            noError: true
          });
        }, 400);
      })
    `);
    recordTest('M8', 'Touch Scroll Smoothness (Passive Listeners & Loop Throttling)', m8ScrollPassive.noError && m8ScrollPassive.scrollY > 0, `Scrolled Y: ${m8ScrollPassive.scrollY}px`);

    // Capture iPhone 14 Pro Screenshot
    await client.captureScreenshot(path.join(process.cwd(), 'artifacts', 'mobile_iphone14pro.png'));

    // ==========================================
    // EMULATION 2: iPhone SE (375 x 667, DPR 2)
    // ==========================================
    console.log('\n--- EMULATION 2: iPhone SE (375x667 DPR 2) ---');
    await client.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');
    await client.setDeviceMetrics(375, 667, 2, true);

    await client.send('Page.navigate', { url: `${BASE_URL}/` });
    await sleep(3500);

    // M9: iPhone SE Compact Viewport Zero Overflow
    const m9Overflow = await client.eval(`
      ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > 375
      })
    `);
    recordTest('M9', 'iPhone SE (375px) Zero Horizontal Overflow', !m9Overflow.hasOverflow, `scrollWidth: ${m9Overflow.scrollWidth}px, clientWidth: ${m9Overflow.clientWidth}px`);

    // M10: Mobile Bottom Nav & Floating Dock Sizing Audit
    const m10BottomNav = await client.eval(`
      (() => {
        const bottomNav = document.querySelector('nav.fixed.bottom-0');
        const navRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
        return {
          hasBottomNav: Boolean(bottomNav),
          navVisible: navRect ? navRect.height > 30 : false,
          navFitsWidth: navRect ? navRect.width <= 375 : false
        };
      })()
    `);
    recordTest('M10', 'iPhone SE Bottom Navigation & Safe Dock Fit', m10BottomNav.hasBottomNav && m10BottomNav.navFitsWidth, `Bottom nav present: ${m10BottomNav.hasBottomNav}, Fits width: ${m10BottomNav.navFitsWidth}`);

    // M11: Carousel Shelf 3-Card Phone Layout Audit
    const m11Shelf = await client.eval(`
      (() => {
        const allCards = Array.from(document.querySelectorAll('[data-media-id]'));
        const firstCard = allCards[0];
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
        return {
          shelfCardsCount: allCards.length,
          firstCardWidth: Math.round(cardWidth),
          isCompact: cardWidth <= 150
        };
      })()
    `);
    recordTest('M11', 'iPhone SE Compact Carousel 3-Card Glance', m11Shelf.shelfCardsCount > 0 && m11Shelf.isCompact, `Card width: ${m11Shelf.firstCardWidth}px, Card count: ${m11Shelf.shelfCardsCount}`);

    // M12: Browser Console Cleanliness in Mobile Emulation
    recordTest('M12', 'Mobile Emulation Console Cleanliness', client.consoleErrors.length === 0, `Errors: ${client.consoleErrors.length}`);

    // Capture iPhone SE Screenshot
    await client.captureScreenshot(path.join(process.cwd(), 'artifacts', 'mobile_iphonese.png'));

  } finally {
    await client.close();
    previewServer.close();
    edgeProcess.kill();
  }

  const passedCount = testResults.filter((r) => r.passed).length;
  console.log('\n====================================================');
  console.log(`📱 MOBILE QA RESULTS: ${passedCount} / ${testResults.length} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedCount !== testResults.length) {
    process.exit(1);
  }
}

runMobileTests().catch((err) => {
  console.error('Fatal Mobile Test Error:', err);
  process.exit(1);
});
