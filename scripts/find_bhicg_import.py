import os
import re

for fname in os.listdir('scripts/nuxt_chunks'):
    if not fname.endswith('.js'):
        continue
    with open(f'scripts/nuxt_chunks/{fname}', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    if 'BHicgX7Q' in content:
        print(f'{fname} mentions BHicgX7Q')
        # print matching lines/tokens
        for line in content.split(';'):
            if 'BHicgX7Q' in line:
                print('  ', line[:150])
