with open('scripts/nuxt_chunks/OK4TTF7Z.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
# Look for watch, play, click, router, modal, iframe
matches = re.findall(r'.{0,100}(?:watch|play|btn|click|modal|iframe|router|location).{0,100}', text, re.IGNORECASE)
print(f'Matches count: {len(matches)}')
for m in matches[:15]:
    print('---', m.strip())
