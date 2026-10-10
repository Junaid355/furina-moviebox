const fs = require('fs');

const text = fs.readFileSync('scripts/videoPlayPage_bundle.js', 'utf8');

const regex = /yg\(\)\.value\.[a-zA-Z0-9_$]+\s*=\s*[^;]+/g;
const matches = text.match(regex) || [];
console.log('Matches for yg().value... = :', [...new Set(matches)].slice(0, 25));

// Find fetch or axios calls in this bundle
const fetches = text.match(/[a-zA-Z0-9_$]+\s*\(\s*["'`][^"'`]+["'`]\s*,\s*\{[^}]*method/g) || [];
console.log('Fetch calls with method:', fetches.slice(0, 10));

// Find any url path with /play or /stream or /video or /dash
const paths = text.match(/["'`](?:\/[a-zA-Z0-9_\-\.]+)+["'`]/g) || [];
const uniquePaths = [...new Set(paths.map(p => p.slice(1, -1)))].filter(p => p.length > 3 && !p.startsWith('//'));
console.log('All URL paths in videoPlayPage:', uniquePaths.slice(0, 40));
