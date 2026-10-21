const fs = require('fs');
const content = fs.readFileSync('E:/furina-moviebox/test_e2e_cdp.js', 'utf8');
content.split('\n').forEach((l, i) => {
  if (l.includes('vidstuck')) {
    console.log(`test_e2e_cdp.js:L${i+1}: ${l.trim()}`);
  }
});
