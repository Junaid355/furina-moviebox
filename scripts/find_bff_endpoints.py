import os
import re

chunk_dir = 'scripts/nuxt_chunks'
files = os.listdir(chunk_dir)

bff_endpoints = set()
for fname in files:
    path = os.path.join(chunk_dir, fname)
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    matches = re.findall(r'[\'"`](/wefeed-h5api-bff/[^\'"`]+)[\'"`]', content)
    for m in matches:
        bff_endpoints.add((fname, m))

print(f'Total BFF endpoints found: {len(bff_endpoints)}')
for fname, ep in sorted(bff_endpoints, key=lambda x: x[1]):
    print(f'  [{fname}] {ep}')
