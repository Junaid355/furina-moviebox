import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Client-Info': json.dumps({'timezone': 'Asia/Kolkata'}),
    'X-Request-Lang': 'en'
}

data = json.dumps({'keyword': 'Avatar', 'page': 1, 'perPage': 10}).encode('utf-8')
url = 'https://themoviebox.xyz/wefeed-h5api-bff/subject/search'

try:
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print('Search response code:', res.get('code'))
    print('Data keys:', list(res.get('data', {}).keys()))
    items = res.get('data', {}).get('list', []) or res.get('data', {}).get('items', []) or res.get('data', {}).get('subjectList', [])
    print(f'Items found: {len(items)}')
    for it in items[:5]:
        print(' ', it.get('title'), it.get('detailPath'), it.get('subjectId'))
except Exception as e:
    print('Search error:', e)
