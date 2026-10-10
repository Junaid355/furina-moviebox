import time
import hashlib
import json
import urllib.request

ts = int(time.time())
rev_ts = str(ts)[::-1]
md5_hash = hashlib.md5(rev_ts.encode('utf-8')).hexdigest()
client_token = f"{ts},{md5_hash}"
print('Generated Client Token:', client_token)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'content-type': 'application/json',
    'X-Client-Info': json.dumps({'timezone': 'Asia/Kolkata'}),
    'X-Client-Token': client_token,
    'X-Request-Lang': 'en'
}

data = json.dumps({'keyword': 'Avatar', 'page': 1, 'perPage': 10, 'subjectType': 0}).encode('utf-8')
url = 'https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/search'

req = urllib.request.Request(url, data=data, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print('Success! Code:', res.get('code'))
        items = res.get('data', {}).get('list', []) or res.get('data', {}).get('items', [])
        print(f'Items returned: {len(items)}')
        for it in items[:5]:
            print(' ', it.get('title'), '| detailPath:', it.get('detailPath'), '| subjectId:', it.get('subjectId'))
except Exception as e:
    print('Error:', e)
