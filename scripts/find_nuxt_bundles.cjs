const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\22d53a87-a0ac-48aa-8f59-9133f63d6b0c\\.system_generated\\steps\\13195\\content.md', 'utf8');

const nuxtBundles = content.match(/https:\/\/spa\.aoneroom\.com\/[^\s"'<>]+\.js/g) || [];
console.log('Nuxt bundles found:', [...new Set(nuxtBundles)]);
