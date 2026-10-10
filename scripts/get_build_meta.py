import urllib.request
import json

manifest_url = 'https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/builds/meta/59428709-2b81-466d-a490-dca6c54631f6.json'
req = urllib.request.Request(manifest_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        data = resp.read().decode('utf-8')
        with open('scripts/build_meta.json', 'w', encoding='utf-8') as f:
            f.write(data)
        meta = json.loads(data)
        print('Manifest keys:', list(meta.keys()))
        print('Routes count:', len(meta.get('routes', [])))
        for r in meta.get('routes', [])[:20]:
            print('  ', r)
except Exception as e:
    print('Error:', e)
