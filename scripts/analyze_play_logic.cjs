const fs = require('fs');

const text = fs.readFileSync('scripts/videoPlayPage_bundle.js', 'utf8');

// Find all API endpoints starting with /wefeed-
const bffMatches = text.match(/\/wefeed-[a-zA-Z0-9_\-\/]+/g) || [];
console.log('BFF endpoints in videoPlayPage:', [...new Set(bffMatches)]);

// Find video / play functions
const lines = text.split(';');
const playLines = lines.filter(l => l.includes('videoAddress') || l.includes('playUrl') || l.includes('currentSource') || l.includes('selectedSource') || l.includes('/wefeed-'));
console.log('Relevant play lines:', playLines.length);
for (const p of playLines.slice(0, 10)) {
  console.log('--- Line ---');
  console.log(p.slice(0, 300));
}
