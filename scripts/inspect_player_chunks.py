import os
import re

chunk_dir = 'scripts/nuxt_chunks'
files = ['CAU47rGQ.js', 'CaXCpLwn.js', 'xse9fXM3.js', 'BXueaaj6.js', 'e1FDCrE5.js', 'D6DRnOnQ.js', 'OK4TTF7Z.js']

for fname in files:
    path = os.path.join(chunk_dir, fname)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    print(f'=== File: {fname} (size {len(content)}) ===')
    # search for api endpoints, urls, dubs, sources, servers
    urls = re.findall(r'https?://[^\s\'"<>]+', content)
    if urls:
        print('  URLs:', list(set(urls))[:10])
    
    # search for api paths
    api_paths = re.findall(r'/wefeed-h5api-bff/[^\s\'"<>]+', content)
    if api_paths:
        print('  BFF paths:', list(set(api_paths)))
    
    # search for dub, source, server, play keywords with snippets
    for kw in ['dubs', 'playSource', 'selectedSource', 'controlledSources', 'dash', 'quality', 'definition']:
        matches = re.findall(rf'([^\w]?{kw}[^\w].{{0,80}})', content)
        if matches:
            print(f'  KW {kw} ({len(matches)}):', [m[:60] for m in matches[:3]])
