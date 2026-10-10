import re

with open('test_e2e_cdp.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find test blocks or functions
blocks = re.findall(r'console\.log\([\'"`]\s*(?:===|---|\d+\.|TEST)\s*([^)]+)\)', text)
print(f'Test steps found: {len(blocks)}')
for b in blocks[:40]:
    print(' ', b.strip())

# Also search for server names in test_e2e_cdp.js
for s in ['vidstuck', 'vidfast', 'nxsha', 'bingr', 'twoembed_vip', 'tgvid', 'one23embed']:
    print(f'Mentions of {s}: {len(re.findall(s, text))}')
