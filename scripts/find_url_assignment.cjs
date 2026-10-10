const fs = require('fs');

const text = fs.readFileSync('scripts/videoPlayPage_bundle.js', 'utf8');

const regex = /\.url\s*=\s*[^;]+/g;
const matches = text.match(regex) || [];
console.log('Matches for .url = :', matches.slice(0, 10));

// Also search for "getSubUrl"
const getSubIdx = text.indexOf('getSubUrl');
if (getSubIdx !== -1) {
  console.log('Snippet around getSubUrl:');
  console.log(text.slice(Math.max(0, getSubIdx - 200), Math.min(text.length, getSubIdx + 800)));
}

// Find window location or iframe params
const paramsIdx = text.indexOf('subjectId');
if (paramsIdx !== -1) {
  console.log('\nSnippet around subjectId:');
  console.log(text.slice(Math.max(0, paramsIdx - 100), Math.min(text.length, paramsIdx + 500)));
}
