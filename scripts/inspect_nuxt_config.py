import re

with open(r'C:\Users\User\.gemini\antigravity\brain\4b56c9ef-faea-4689-903d-72d03950d75a\.system_generated\steps\6\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', text, re.DOTALL)
preload_links = re.findall(r'<link[^>]*href=[\'"]([^\'"]+)[\'"]', text)

with open('scripts/nuxt_config_dump.txt', 'w', encoding='utf-8') as out:
    out.write('--- Nuxt config script ---\n')
    if len(inline_scripts) > 4:
        out.write(inline_scripts[4])
    out.write('\n--- Preload / Nuxt links ---\n')
    for l in preload_links:
        if '_nuxt' in l:
            out.write(l + '\n')
print('Dumped successfully.')
