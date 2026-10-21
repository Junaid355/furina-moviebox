const fs = require('fs');
const content = fs.readFileSync('E:/furina-moviebox/test_e2e_cdp.js', 'utf8');
content.split('\n').forEach((l, i) => {
  if (l.includes('TEST 28:')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
