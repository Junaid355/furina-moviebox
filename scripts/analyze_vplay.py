with open('scripts/videoPlayPage_index.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re

print('File size:', len(text))

# Search for URLs
urls = re.findall(r'https?://[^\s\'"<>]+', text)
unique_urls = list(dict.fromkeys(urls))
print(f'Total unique URLs: {len(unique_urls)}')
with open('scripts/vplay_urls.txt', 'w', encoding='utf-8') as out:
    for u in unique_urls:
        out.write(u + '\n')

# Search for API endpoints
endpoints = re.findall(r'[\'"`](/wefeed-[^\'"`]+)[\'"`]', text)
print(f'Total endpoints: {len(set(endpoints))}')
for ep in set(endpoints):
    print('  Endpoint:', ep)

# Search for player / embed / stream keywords
for kw in ['embed', 'server', 'dubs', 'caption', 'stream', 'hls', 'dash', 'source', 'resolutions', 'm3u8', 'mp4']:
    cnt = len(re.findall(kw, text, re.IGNORECASE))
    print(f'Keyword: {kw} -> {cnt} matches')
