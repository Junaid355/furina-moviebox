const http = require('http');
const { spawn } = require('child_process');

const servers = [
  { id: '123embed', url: 'https://play2.123embed.net/movie/533535?audio=hi' },
  { id: 'vidlink', url: 'https://vidlink.pro/movie/533535?primaryColor=06b6d4&autoplay=true' },
  { id: 'autoembed', url: 'https://player.autoembed.co/embed/movie/533535' },
  { id: 'nxsha', url: 'https://nxsha.space/embed/movie/533535?lang=hi&disable_app_ad=true' },
  { id: 'vidfast', url: 'https://vidfast.vc/movie/533535?autoPlay=true' },
  { id: 'vidsrc_su', url: 'https://vidsrc.su/embed/movie/533535' },
  { id: 'vidsrc_pm', url: 'https://vidsrc.pm/embed/movie/533535' },
  { id: 'vidstuck_dead', url: 'https://vidstuck.xyz/embed/movie/533535' }
];

let currentIndex = 0;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const s = servers[currentIndex];
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Embed Tester</title></head>
      <body style="margin:0; background:#000;">
        <h1 id="status" style="color:#fff; font-size:14px;">Testing ${s.id}</h1>
        <iframe id="test-iframe" src="${s.url}" style="width:800px; height:500px; border:none;" allowfullscreen></iframe>
      </body>
    </html>
  `);
});

server.listen(4899, '127.0.0.1', async () => {
  console.log('Test harness ready on port 4899');
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9922',
    '--user-data-dir=E:\\furina-moviebox\\artifacts\\edge_embed_test',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  setTimeout(async () => {
    try {
      const res = await fetch('http://127.0.0.1:9922/json/list');
      const tabs = await res.json();
      const wsUrl = tabs[0].webSocketDebuggerUrl;
      const ws = new WebSocket(wsUrl);

      ws.onopen = async () => {
        let msgId = 1;
        function send(method, params = {}) {
          return new Promise(resolve => {
            const id = msgId++;
            const handler = (evt) => {
              const parsed = JSON.parse(evt.data);
              if (parsed.id === id) {
                ws.removeEventListener('message', handler);
                resolve(parsed.result);
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
          });
        }

        await send('Page.enable');
        for (let i = 0; i < servers.length; i++) {
          currentIndex = i;
          const current = servers[i];
          await send('Page.navigate', { url: 'http://127.0.0.1:4899' });
          await new Promise(r => setTimeout(r, 4000));

          const frames = await send('Page.getFrameTree');
          const childFrames = frames.frameTree?.childFrames || [];
          let childUrl = 'NONE';
          let isCrash = false;
          if (childFrames.length > 0) {
            childUrl = childFrames[0].frame.url;
            isCrash = childUrl.includes('chromewebdata');
          }
          console.log(`[EMBED TEST] ${current.id.padEnd(15)} -> Child Frame: ${childUrl.slice(0, 50)} | CRASHED: ${isCrash}`);
        }

        ws.close();
        edge.kill();
        server.close();
        process.exit(0);
      };
    } catch (e) {
      console.error(e);
      edge.kill();
      server.close();
      process.exit(1);
    }
  }, 2000);
});
