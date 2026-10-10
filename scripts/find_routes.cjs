const fs = require('fs');

const text = fs.readFileSync('scripts/videoPlayPage_bundle.js', 'utf8');

const detailIdx = text.indexOf('/detail');
console.log('detailIdx:', detailIdx);
if (detailIdx !== -1) {
  console.log('Snippet around /detail:');
  console.log(text.slice(Math.max(0, detailIdx - 200), Math.min(text.length, detailIdx + 1500)));
}
