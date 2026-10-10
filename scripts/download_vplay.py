import urllib.request

url = 'https://h5-static.aoneroom.com/spa/videoPlayPage/assets/index.a3d250cf.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read()
        with open('scripts/videoPlayPage_index.js', 'wb') as f:
            f.write(content)
        print(f'Successfully downloaded videoPlayPage_index.js ({len(content)} bytes)')
except Exception as e:
    print('Error:', e)
