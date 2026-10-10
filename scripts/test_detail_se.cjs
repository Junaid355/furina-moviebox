const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://themoviebox.xyz/',
        'Origin': 'https://themoviebox.xyz'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ status: res.statusCode, raw: data.slice(0, 1000) });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const url = 'https://h5-api.aoneroom.com/wefeed-h5api-bff/detail?detailPath=lucifer-hindi-Aq2Bzbvyte1&se=1';
  console.log('Fetching:', url);
  const res = await fetchJson(url);
  console.log('Code:', res.code, 'Message:', res.message);
  if (res.data) {
    console.log('Data keys:', Object.keys(res.data));
    if (res.data.resource) {
      console.log('Resource:', JSON.stringify(res.data.resource, null, 2));
    }
  }
}

run();
