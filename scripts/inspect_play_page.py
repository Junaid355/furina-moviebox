import re

with open('scripts/nuxt_chunks/BEL2PF0y.js', 'r', encoding='utf-8', errors='ignore') as f:
    c_bel = f.read()

with open('scripts/nuxt_chunks/BPVEs2fJ.js', 'r', encoding='utf-8', errors='ignore') as f:
    c_bpv = f.read()

print('=== BEL2PF0y.js ===')
# search for iframe, embed, player, video, dub, source, server
keywords = ['iframe', 'embed', 'player', 'video', 'src', 'stream', 'hls', 'm3u8', 'dash', 'mp4', 'dub', 'sub', 'api']
for kw in keywords:
    matches = re.findall(rf'.{{0,60}}{kw}.{{0,60}}', c_bel, re.IGNORECASE)
    if matches:
        print(f'  KW {kw} ({len(matches)}): {matches[0].strip()[:100]}')

print('\n=== BPVEs2fJ.js ===')
for kw in keywords:
    matches = re.findall(rf'.{{0,60}}{kw}.{{0,60}}', c_bpv, re.IGNORECASE)
    if matches:
        print(f'  KW {kw} ({len(matches)}): {matches[0].strip()[:100]}')
