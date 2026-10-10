import re

with open('scripts/nuxt_chunks/DQiinMQb.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

print('Length of DQiinMQb.js:', len(c))

# Search for dub, embed, player, http
matches = re.findall(r'.{0,100}(?:embed|player|dub|stream|source).{0,100}', c, re.IGNORECASE)
print(f'Matches count: {len(matches)}')
for m in matches[:30]:
    print('MATCH:', m.strip())
