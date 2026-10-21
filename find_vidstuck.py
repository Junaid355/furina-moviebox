import os

results = []
for root, dirs, files in os.walk('E:/furina-moviebox/src'):
    for f in files:
        if f.endswith(('.js', '.jsx')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                lines = fp.readlines()
            for idx, line in enumerate(lines):
                if 'vidstuck' in line.lower():
                    results.append(f"{os.path.relpath(p, 'E:/furina-moviebox')}:{idx+1}: {line.strip()}")

for r in results[:40]:
    print(r)
print(f"Total occurrences: {len(results)}")
