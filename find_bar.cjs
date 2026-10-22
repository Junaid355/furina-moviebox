const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') searchDir(full);
    } else if (f.endsWith('.jsx') || f.endsWith('.css') || f.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if ((l.includes('left-0') || l.includes('left-1') || l.includes('left: 0') || l.includes('left:0') || l.includes('bg-white')) && (l.includes('w-') || l.includes('width') || l.includes('fixed') || l.includes('absolute'))) {
          console.log(`${f}:${idx+1}: ${l.trim().slice(0, 120)}`);
        }
      });
    }
  }
}

searchDir('E:/furina-moviebox/src');
