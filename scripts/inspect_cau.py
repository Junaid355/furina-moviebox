with open('scripts/nuxt_chunks/CAU47rGQ.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re

# Look for play, watch, download, stream, episodes, dubs
keywords = ['dubs', 'subtitles', 'watch', 'play', 'episode', 'trailer', 'download', 'spa/videoPlayPage', 'movies/']
for kw in keywords:
    matches = re.findall(rf'.{{0,60}}{kw}.{{0,60}}', text, re.IGNORECASE)
    print(f'Keyword: {kw} (count {len(matches)})')
    for m in matches[:3]:
        print('  ', repr(m.strip()))
