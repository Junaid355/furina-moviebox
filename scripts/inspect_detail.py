import re
import json

with open(r'C:\Users\User\.gemini\antigravity\brain\4b56c9ef-faea-4689-903d-72d03950d75a\.system_generated\steps\55\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print('Length of detail page:', len(text))

# Check for scripts and preload links
scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', text)
print('Scripts in detail page:')
for s in scripts:
    print('  ', s)

preload_links = re.findall(r'<link[^>]*href=[\'"]([^\'"]+)[\'"]', text)
nuxt_links = [l for l in preload_links if '_nuxt' in l and l.endswith('.js')]
print(f'Nuxt JS links ({len(nuxt_links)}):')
for l in nuxt_links:
    print('  ', l)

# Check inline scripts for detail data, stream, video, server, etc.
inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', text, re.DOTALL)
print('Inline scripts count:', len(inline_scripts))

with open('scripts/detail_inline_scripts.txt', 'w', encoding='utf-8') as out:
    for i, s in enumerate(inline_scripts):
        out.write(f'\n=== Script {i} (len {len(s)}) ===\n')
        out.write(s[:2000] + '\n...\n' + s[-2000:] if len(s) > 4000 else s)

print('Wrote detail_inline_scripts.txt')
