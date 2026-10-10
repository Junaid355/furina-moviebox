import re

with open('scripts/nuxt_chunks/Bx1FrkXQ.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

# Look for routes definition
routes_matches = re.findall(r'name:[\'"]([^\'"]+)[\'"],path:[\'"]([^\'"]+)[\'"],component:([^\,\}]+)', c)
print(f'Routes found: {len(routes_matches)}')
for name, path, comp in routes_matches:
    print(f'  Route {name}: {path} -> {comp}')

# Also look for any other lazy imports
lazy_imports = re.findall(r'import\([\'"]\./([^\'"]+\.js)[\'"]\)', c)
print(f'Total lazy imports: {len(lazy_imports)}')
for imp in set(lazy_imports):
    print('  ', imp)
