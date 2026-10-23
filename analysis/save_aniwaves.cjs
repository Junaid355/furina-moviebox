const fs = require('fs');
const inPath = 'C:/Users/User/.gemini/antigravity/brain/2247e62f-bb6c-41b6-814f-0be73532e792/.system_generated/steps/547/output.txt';
let b64 = fs.readFileSync(inPath, 'utf8').trim();
if (b64.startsWith('"') && b64.endsWith('"')) {
  b64 = b64.slice(1, -1);
}
fs.mkdirSync('e:/furina-moviebox/analysis/aniwaves', { recursive: true });
fs.writeFileSync('e:/furina-moviebox/analysis/aniwaves/main.js', Buffer.from(b64, 'base64'));
console.log('Saved bytes:', fs.statSync('e:/furina-moviebox/analysis/aniwaves/main.js').size);
