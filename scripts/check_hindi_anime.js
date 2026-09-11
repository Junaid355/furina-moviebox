import fs from 'fs';

const content = fs.readFileSync('src/services/tmdb.js', 'utf8');
const start = content.indexOf('export const CURATED_HINDI_DUBBED_ANIME = [');
const end = content.indexOf('export const CURATED_ENGLISH_DUBBED_ANIME', start);
const sub = content.substring(start, end);
const titles = sub.split('\n').filter(l => l.trim().startsWith('title:') || l.trim().startsWith('"title":'));
console.log('CURATED_HINDI_DUBBED_ANIME total count:', titles.length);
