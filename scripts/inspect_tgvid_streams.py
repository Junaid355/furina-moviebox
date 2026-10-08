import urllib.request, json

req = urllib.request.Request('https://tgvidapi.lovable.app/api/m/1423191', headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
t = json.loads(res.read().decode('utf-8'))
for idx, l in enumerate(t.get('links', [])):
    srv = l.get('server')
    lbl = l.get('label')
    typ = l.get('type')
    url = l.get('url', '')
    print(f"[{idx}] {srv} | {lbl} | type={typ} | url={url}")
