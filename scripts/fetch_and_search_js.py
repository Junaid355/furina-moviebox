import urllib.request
import os
import re

os.makedirs('scripts/nuxt_chunks', exist_ok=True)

with open('scripts/nuxt_config_dump.txt', 'r', encoding='utf-8') as f:
    text = f.read()

urls = re.findall(r'https://spa\.aoneroom\.com[^\s\'"]+\.js', text)
urls = list(dict.fromkeys(urls))
print(f'Found {len(urls)} JS chunks')

chunk_files = []
for url in urls:
    name = url.split('/')[-1]
    filepath = os.path.join('scripts/nuxt_chunks', name)
    if not os.path.exists(filepath):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                content = resp.read()
                with open(filepath, 'wb') as out:
                    out.write(content)
                print(f'Downloaded {name} ({len(content)} bytes)')
        except Exception as e:
            print(f'Failed {name}: {e}')
    chunk_files.append((name, filepath))

# Search chunks for player, embed, video, dub, stream, server, api
keywords = [
    'embed', 'player', 'stream', 'dub', 'subtitle', 'audio', 'm3u8',
    'wefeed-h5api-bff', 'server', 'source', 'playurl', 'play_url', 'video_url',
    'vidstuck', 'vidfast', 'vidsrc', '2embed', 'megacloud', 'centaurus',
    'caption', 'multi-dub', 'multidub', 'lang', 'language'
]

results = {}
for name, filepath in chunk_files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    found = {}
    for kw in keywords:
        matches = len(re.findall(re.escape(kw), content, re.IGNORECASE))
        if matches > 0:
            found[kw] = matches
    if found:
        results[name] = found

print('\n--- Search Results ---')
for name, found in results.items():
    print(f'{name}: {found}')
