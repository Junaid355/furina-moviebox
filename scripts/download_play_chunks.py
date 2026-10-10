import urllib.request
import os

chunks = ['BEL2PF0y.js', 'BPVEs2fJ.js', 'CbOmztfM.js']
base_url = 'https://spa.aoneroom.com/ssrStatic/mbOfficialNew/public/_nuxt/'

for chunk in chunks:
    url = base_url + chunk
    filepath = os.path.join('scripts/nuxt_chunks', chunk)
    if not os.path.exists(filepath):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                content = resp.read()
                with open(filepath, 'wb') as out:
                    out.write(content)
                print(f'Downloaded {chunk} ({len(content)} bytes)')
        except Exception as e:
            print(f'Failed {chunk}: {e}')
    else:
        print(f'Already exists: {chunk}')
