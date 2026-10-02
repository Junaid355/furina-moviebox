import https from 'https';
import fs from 'fs';
import path from 'path';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), headers: res.headers, status: res.statusCode }));
    }).on('error', reject);
  });
}

async function run() {
  const page = await get('https://tenor.com/search/furina-chibi-gifs');
  const html = page.buffer.toString();
  const gifMatches = [...html.matchAll(/https:\/\/[^"']+\.gif/g)].map(m => m[0]);
  console.log('Found GIF links:', gifMatches.length);
  for (const url of gifMatches.slice(0, 8)) {
    console.log('Testing URL:', url);
    const resp = await get(url);
    if (resp.status === 200 && resp.buffer.length > 5000) {
      console.log('Valid GIF found! Size:', resp.buffer.length);
      fs.writeFileSync('public/furina_chibi.gif', resp.buffer);
      fs.writeFileSync('public/furina_mascot.gif', resp.buffer);
      console.log('Saved to public/furina_chibi.gif and public/furina_mascot.gif');
      return;
    }
  }
}

run().catch(err => console.error(err));
