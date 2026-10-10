import urllib.request
import json

test_urls = [
    'https://mzfi.me/spa/videoPlayPage/movies/avatar-seven-havens-6RjmSI53tma?id=8697152315721245208&type=/movie/detail&detailSe=1&detailEp=1&lang=en',
    'https://mzfi.me/spa/videoPlayPage/movies/fall-0ge4IoNmOE3?id=3070378846106042616&type=/movie/detail&detailSe=1&detailEp=1&lang=en',
    'https://mzfi.me/wefeed-h5api-bff/subject/play?subjectId=3070378846106042616&se=1&ep=1&detailPath=fall-0ge4IoNmOE3&streamSignType=0',
    'https://netfilm.world',
    'https://123movienow.cc'
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*'
}

for url in test_urls:
    print(f'Testing: {url}')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            print(f'  Status {resp.status}, length: {len(data)}')
            if url.endswith('streamSignType=0'):
                print('  Content:', data.decode('utf-8', errors='ignore')[:300])
    except Exception as e:
        print(f'  Error: {e}')
