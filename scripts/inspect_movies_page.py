import urllib.request
import re

url = 'https://themoviebox.xyz/movies/fall-0ge4IoNmOE3'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

with open('scripts/movies_fall.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Wrote scripts/movies_fall.html ({len(content)} chars)')

# Search for inline scripts
inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', content, re.DOTALL)
print(f'Inline scripts count: {len(inline_scripts)}')

# Search for video, iframe, stream, server, m3u8, mp4, etc.
for kw in ['video', 'iframe', 'stream', 'server', 'm3u8', 'mp4', 'play', 'hls', 'dash', 'dub', 'caption', 'eztv']:
    cnt = len(re.findall(kw, content, re.IGNORECASE))
    print(f'  KW {kw}: {cnt}')
