const fs = require('fs');

const text = fs.readFileSync('scripts/videoPlayPage_bundle.js', 'utf8');

const idx = text.indexOf('dailyLimitPreviewSeconds');
if (idx !== -1) {
  console.log('Snippet around dailyLimitPreviewSeconds:');
  console.log(text.slice(Math.max(0, idx - 200), Math.min(text.length, idx + 1200)));
}
