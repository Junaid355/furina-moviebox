const fs = require('fs');
const content = fs.readFileSync('src/components/PlayerModal.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('SERVERS.map') || l.includes('activeServer.id === s.id') || l.includes('s.shortName') || l.includes('Buffering? Fast Switch')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
