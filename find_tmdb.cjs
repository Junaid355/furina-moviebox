const fs = require('fs');
const s = fs.readFileSync('E:/furina-moviebox/src/services/tmdb.js', 'utf8');
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('fetchHindiMovies')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
