import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'X-Client-Info': json.dumps({'timezone': 'Asia/Kolkata'}),
    'X-Request-Lang': 'en'
}

urls = [
    'https://themoviebox.xyz/wefeed-h5api-bff/detail?detailPath=avatar-seven-havens-6RjmSI53tma',
    'https://h5-api.aoneroom.com/wefeed-h5api-bff/detail?detailPath=avatar-seven-havens-6RjmSI53tma',
    'https://themoviebox.xyz/wefeed-h5api-bff/subject/play?detailPath=avatar-seven-havens-6RjmSI53tma&se=0&ep=0&streamSignType=0',
    'https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/play?detailPath=avatar-seven-havens-6RjmSI53tma&se=0&ep=0&streamSignType=0'
]

for url in urls:
    print(f'\nFetching: {url}')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            print(f'Status {resp.status}, length: {len(data)}')
            parsed = json.loads(data)
            print('Keys:', list(parsed.keys()))
            if 'data' in parsed:
                data_obj = parsed['data']
                if isinstance(data_obj, dict):
                    print('Data keys:', list(data_obj.keys()))
                    if 'resource' in data_obj:
                        print('Resource:', json.dumps(data_obj['resource'])[:300])
                    if 'play' in data_obj or 'streams' in data_obj or 'video' in data_obj:
                        print('Play data:', json.dumps(data_obj)[:400])
                else:
                    print('Data:', str(data_obj)[:300])
            else:
                print('Response snippet:', data[:300])
    except Exception as e:
        print('Error:', e)
