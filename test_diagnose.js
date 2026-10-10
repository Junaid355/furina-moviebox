const { spawn } = require('child_process');
const WebSocket = require('ws');

(async () => {
  const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless',
    '--remote-debugging-port=9991',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  
  try {
    const version = await fetch('http://127.0.0.1:9991/json/version').then(r => r.json());
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));
    
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === msgId) {
          ws.off('message', handler);
          resolve(msg.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE:', msg.params.type, (msg.params.args||[]).map(a=>a.value||a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://127.0.0.1:4173' });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking first card...');
    const res = await send('Runtime.evaluate', {
      expression: '(() => { const c = document.querySelector(".glass-card"); if (c) { c.click(); return "clicked"; } return "no card"; })()',
      returnByValue: true
    });
    console.log('Result:', res);
    await new Promise(r => setTimeout(r, 1500));
    
    const modalCheck = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("[data-testid=\\"player-media-container\\"]") || document.querySelector("button[title*=\\"Close Player\\"]"))',
      returnByValue: true
    });
    console.log('Modal open:', modalCheck);
  } catch (err) {
    console.error('Error in diagnose script:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
})();
