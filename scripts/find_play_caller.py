import re

with open('scripts/nuxt_chunks/CAU47rGQ.js', 'r', encoding='utf-8', errors='ignore') as f:
    c1 = f.read()

with open('scripts/nuxt_chunks/Bx1FrkXQ.js', 'r', encoding='utf-8', errors='ignore') as f:
    c2 = f.read()

# Look for imports of BHicgX7Q.js or play function
for name, c in [('CAU47rGQ.js', c1), ('Bx1FrkXQ.js', c2)]:
    matches = re.findall(r'.{0,100}BHicgX7Q.{0,100}', c)
    print(f'{name} references to BHicgX7Q: {len(matches)}')
    for m in matches:
        print('  ', m)

# Also search for subject/play across all chunks
for fname in ['CAU47rGQ.js', 'Bx1FrkXQ.js', 'ZYseYtk9.js', 'CpntIK-R.js']:
    path = f'scripts/nuxt_chunks/{fname}'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    matches = re.findall(r'.{0,100}subject/play.{0,100}', c)
    if matches:
        print(f'{fname} subject/play matches:')
        for m in matches:
            print('  ', m)
