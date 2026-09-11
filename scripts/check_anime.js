import fs from 'fs';

const content = fs.readFileSync('src/services/tmdb.js', 'utf8');
const start = content.indexOf('export const SECRET_ECCHI_ANIME = [');
const end = content.indexOf('];', start);
const sub = content.substring(start, end);
const titles = sub.split('\n').filter(l => l.includes('"title":')).map(l => l.trim());
console.log('Total titles in SECRET_ECCHI_ANIME:', titles.length);
console.log('First 5:', titles.slice(0, 5));
console.log('Last 5:', titles.slice(-5));
