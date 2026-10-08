import urllib.request, json, re

req = urllib.request.Request('https://tgvidapi.lovable.app/api/m/1423191', headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
t = json.loads(res.read().decode('utf-8'))

links = t['links']
m_map = {}
for e in links:
    srv = e.get('server', '')
    lbl = e.get('label') or srv
    clean_lbl = re.sub(r'\s*[-—|]?\s*(?:\d{3,4}p|4k|hd|sd)\s*$', '', lbl, flags=re.I).strip() or srv
    r_key = (srv + '|' + clean_lbl + '|' + (e.get('type') or '')).lower()
    if r_key in m_map:
        m_map[r_key]['alts'].append(e)
    else:
        m_map[r_key] = {**e, 'label': clean_lbl, 'alts': [e]}

def r_hindi(e):
    return bool(re.search(r'hindi|\bhin\b', (e.get('label', '') + ' ' + e.get('server', '')), re.I))

p = []
for t_val in m_map.values():
    alts_sorted = sorted(t_val['alts'], key=lambda x: int(re.sub(r'\D', '', x.get('quality', '0')) or 0), reverse=True)
    item = {**alts_sorted[0], 'label': t_val['label'], 'alts': alts_sorted}
    p.append(item)

p.sort(key=lambda x: (1 if r_hindi(x) else 0), reverse=True)

print("P items (total " + str(len(p)) + "):")
for idx, item in enumerate(p):
    print(f"[{idx}] server: {item.get('server')}, label: {item.get('label')}, is_hindi: {r_hindi(item)}")

Be = {'hi': 'hi|hin|hindi'}
n = Be['hi']
m_regex = re.compile(r'(^|[^a-z])(' + n + r')([^a-z]|$)', re.I)

print("\nTesting m_regex match:")
for idx, item in enumerate(p):
    txt = item.get('label', '') + ' ' + item.get('server', '')
    if m_regex.search(txt):
        print(f"Matched index {idx}: {item.get('server')} | {item.get('label')}")
