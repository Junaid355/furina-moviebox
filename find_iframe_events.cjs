const fs = require('fs');
const content = fs.readFileSync('E:/furina-moviebox/src/components/PlayerModal.jsx', 'utf8');
content.split('\n').forEach((l, i) => {
  if (l.includes('iframeLoadedRef') || l.includes('onLoad') || l.includes('onError')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
