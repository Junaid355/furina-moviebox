const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testLiveMobilePlayer() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('Navigating to live site on iPhone 14 Pro viewport (390x844)...');
  await page.goto('https://junaid355.github.io/furina-moviebox/', { waitUntil: 'networkidle2', timeout: 35000 });
  
  // Find a media card to click
  await page.waitForSelector('img[alt]', { timeout: 10000 });
  const cards = await page.$$('img[alt]');
  if (cards.length > 2) {
    console.log('Tapping card...');
    await cards[2].click();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Click watch/play if modal opens, or play direct
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const playBtn = btns.find(b => /play|watch now/i.test(b.textContent || ''));
    if (playBtn) playBtn.click();
  });
  await new Promise(r => setTimeout(r, 4000));
  
  // Inspect live player layout
  const metrics = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    const container = iframe ? iframe.parentElement : null;
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    
    return {
      hasIframe: !!iframe,
      iframeSrc: iframe ? iframe.src : null,
      containerHeight: container ? container.getBoundingClientRect().height : 0,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth,
      clientWidth,
      noHorizontalOverflow: scrollWidth <= clientWidth
    };
  });
  
  console.log('Live Mobile Player Metrics:', metrics);
  console.log('Console Errors count:', errors.length);
  
  const artifactPath = path.resolve(__dirname, '../artifacts/live_mobile_player_verified.png');
  await page.screenshot({ path: artifactPath });
  console.log('Saved screenshot to:', artifactPath);
  
  await browser.close();
}

testLiveMobilePlayer().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
