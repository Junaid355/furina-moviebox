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
  console.log('--- Fetching Lucifer [Hindi] ---');
  const trending = await fetchJson('https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/trending');
  const lucifer = trending.data.subjectList.find(s => s.title.includes('Lucifer'));
  console.log('Lucifer subject:', lucifer);

  const detailUrl = `https://h5-api.aoneroom.com/wefeed-h5api-bff/detail?subjectId=${lucifer.subjectId}`;
  console.log('Detail URL:', detailUrl);
  const detail = await fetchJson(detailUrl);
  console.log('Detail keys:', Object.keys(detail.data));
  console.log('Resource:', JSON.stringify(detail.data.resource, null, 2));
  console.log('Dubs:', JSON.stringify(detail.data.subject?.dubs, null, 2));
  console.log('Subtitles:', JSON.stringify(detail.data.subject?.subtitles, null, 2));
}

run();
