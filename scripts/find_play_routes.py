import re

with open('scripts/nuxt_chunks/Bx1FrkXQ.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

routes_matches = re.findall(r'name:[\'"]([^\'"]+)[\'"],path:[\'"]([^\'"]+)[\'"],component:([^\,\}]+)', c)
for name, path, comp in routes_matches:
    if any(k in path.lower() for k in ['video', 'play', 'detail', 'movie', 'tv']):
        print(f'{path} -> {comp}')
