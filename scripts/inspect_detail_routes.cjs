const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\22d53a87-a0ac-48aa-8f59-9133f63d6b0c\\.system_generated\\steps\\13172\\content.md', 'utf8');

const detailMatches = content.match(/\/detail\/[^\s"'<>]+/g) || [];
console.log('Detail paths count:', detailMatches.length);
console.log('Sample detail paths:', [...new Set(detailMatches)].slice(0, 20));

const moviesMatches = content.match(/\/movies\/[^\s"'<>]+/g) || [];
console.log('Movies paths count:', moviesMatches.length);
console.log('Sample movies paths:', [...new Set(moviesMatches)].slice(0, 20));

const scripts = content.match(/src="([^"]+\.js[^"]*)"/g) || [];
console.log('Scripts:', [...new Set(scripts)].slice(0, 20));
