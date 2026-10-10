const https = require('https');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const bundles = [
  'AMBVyxC3.js', 'CZ288koH.js', 'OK4TTF7Z.js', 'CAU47rGQ.js',
  'DQiinMQb.js', 'q2zShf1k.js', 'Cij8_jUy.js', 'Cm1LiiNp.js',
  'C8cz_y4-.js', 'mw5CrUGL.js', 'CpntIK-R.js', 'CP1cZVoq.js',
  'FFg0e6DS.js', 'CaXCpLwn.js', 'xse9fXM3.js', 'BXueaaj6.js',
  'e1FDCrE5.js', 'CMQyRpR8.js', 'BDzUpweg.js', 'DB-uEjNJ.js',
  'BueIfo4m.js', 'Bpb3LGbw.js', 'BrKkoe3i.js', 'Ddh7AMCM.js',
  'BKh9rlPp.js', 'BR2ecDjo.js', 'ogEoh8U8.js'
];

async function run() {
  for (const b of bundles) {
    const url = `https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/${b}`;
    try {
      const text = await fetchText(url);
      if (text.includes('pacdn') || text.includes('macdn') || text.includes('dash') || text.includes('m3u8') || text.includes('player') || text.includes('videoAddress')) {
        console.log(`\nFound matches in ${b} (length: ${text.length}):`);
        const matches = text.match(/[a-zA-Z0-9_\-\./:?&=]{0,30}(?:pacdn|macdn|videoAddress|getPlayUrl|playUrl|m3u8)[a-zA-Z0-9_\-\./:?&=]{0,50}/gi) || [];
        console.log('Matches:', [...new Set(matches)].slice(0, 10));
      }
    } catch (e) {}
  }
}

run();
