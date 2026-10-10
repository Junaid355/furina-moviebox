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
  const url1 = 'https://h5-api.aoneroom.com/wefeed-h5api-bff/detail?detailPath=avatar-seven-havens-6RjmSI53tma';
  console.log('Querying:', url1);
  const res1 = await fetchJson(url1);
  console.log('Response keys:', Object.keys(res1));
  if (res1.data) {
    console.log('Data keys:', Object.keys(res1.data));
    console.log('Subject:', res1.data.subject ? Object.keys(res1.data.subject) : null);
    if (res1.data.subject) {
      console.log('Subject title:', res1.data.subject.title);
      console.log('Subject sources:', res1.data.subject.sources || res1.data.sources);
    }
  } else {
    console.log('Res1:', JSON.stringify(res1).slice(0, 500));
  }

  const url2 = 'https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/trending';
  console.log('\nQuerying trending:', url2);
  const res2 = await fetchJson(url2);
  console.log('Trending keys:', Object.keys(res2));
  if (res2.data) {
    console.log('Trending data sample:', JSON.stringify(res2.data).slice(0, 500));
  }
}

run();
