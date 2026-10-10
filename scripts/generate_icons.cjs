const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

async function renderPng() {
  const svgContent = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'), 'utf8');
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 512px; height: 512px; background: transparent; overflow: hidden; }
    svg { width: 512px; height: 512px; display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  server.listen(9882, '127.0.0.1', () => {
    const outPng = path.resolve(__dirname, '../public/icon.png');
    const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
      '--headless',
      `--screenshot=${outPng}`,
      '--window-size=512,512',
      '--hide-scrollbars',
      '--default-background-color=00000000',
      'http://127.0.0.1:9882/'
    ]);

    edge.on('close', (code) => {
      server.close();
      if (fs.existsSync(outPng) && fs.statSync(outPng).size > 1000) {
        fs.copyFileSync(outPng, path.resolve(__dirname, '../public/favicon.png'));
        fs.copyFileSync(outPng, path.resolve(__dirname, '../public/icon-512.png'));
        fs.copyFileSync(outPng, path.resolve(__dirname, '../public/icon-192.png'));
        fs.copyFileSync(outPng, path.resolve(__dirname, '../public/apple-touch-icon.png'));
        console.log('SUCCESS: High-res PNG icons rendered from favicon.svg!');
      } else {
        console.error('Failed to generate PNG or size too small');
      }
    });
  });
}

renderPng();
