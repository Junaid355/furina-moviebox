const https = require('https');

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://themoviebox.xyz/',
        'Origin': 'https://themoviebox.xyz'
      }
    }, res => {
      let resp = '';
      res.on('data', c => resp += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(resp));
        } catch (e) {
          resolve({ status: res.statusCode, raw: resp.slice(0, 500) });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- Testing search for "Deadpool" ---');
  const res1 = await postJson('https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/search', {
    keyword: 'Deadpool',
    page: 1,
    perPage: 10,
    subjectType: 0
  });
  console.log('Deadpool search code:', res1.code);
  if (res1.data && res1.data.subjectList) {
    console.log(`Found ${res1.data.subjectList.length} items:`);
    for (const item of res1.data.subjectList) {
      console.log(`- ${item.title} (${item.releaseDate}) [${item.corner || 'No corner'}] dubs: ${item.dubs ? item.dubs.length : 0} id: ${item.subjectId} path: ${item.detailPath}`);
    }
  }

  console.log('\n--- Testing search for "Hindi" ---');
  const res2 = await postJson('https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/search', {
    keyword: 'Hindi',
    page: 1,
    perPage: 10,
    subjectType: 0
  });
  if (res2.data && res2.data.subjectList) {
    console.log(`Found ${res2.data.subjectList.length} items for "Hindi":`);
    for (const item of res2.data.subjectList) {
      console.log(`- ${item.title} (${item.releaseDate}) [${item.corner}] path: ${item.detailPath}`);
    }
  }
}

run();
