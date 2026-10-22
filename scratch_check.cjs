const https = require('https');
function get(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: e.message });
        }
      });
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function run() {
  const k = '4f298a53e5522830c95f789f07da4918';
  const devara = await get('https://api.themoviedb.org/3/movie/866398?api_key=' + k);
  console.log('Devara:', devara.title, devara.poster_path);
  const yn = await get('https://api.themoviedb.org/3/movie/372058?api_key=' + k);
  console.log('Your Name:', yn.title, yn.poster_path);
  const sz = await get('https://api.themoviedb.org/3/movie/916224?api_key=' + k);
  console.log('Suzume:', sz.title, sz.poster_path);
  const wy = await get('https://api.themoviedb.org/3/movie/568160?api_key=' + k);
  console.log('Weathering:', wy.title, wy.poster_path);
}

run();
