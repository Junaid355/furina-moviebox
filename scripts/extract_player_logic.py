with open('scripts/nuxt_chunks/BEL2PF0y.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re

snippets = re.findall(r'.{0,300}(?:caption|streams|hls|dash|subject/play|wefeed-h5api-bff).{0,300}', text)

with open('scripts/player_logic_snippets.txt', 'w', encoding='utf-8') as out:
    for i, s in enumerate(snippets):
        out.write(f'\n=== SNIPPET {i} ===\n{s}\n')

print(f'Wrote {len(snippets)} snippets to scripts/player_logic_snippets.txt')
