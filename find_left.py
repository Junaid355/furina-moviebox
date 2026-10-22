import os
import re

for root, dirs, files in os.walk('E:/furina-moviebox/src'):
    for f in files:
        if f.endswith('.jsx'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fp:
                lines = fp.readlines()
            for i, line in enumerate(lines, 1):
                if ('left-0' in line or 'left: 0' in line or 'left:0' in line) and ('bg-white' in line or 'w-' in line or 'rounded' in line):
                    print(f'{f}:{i}: {line.strip()[:120]}')
