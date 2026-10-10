import urllib.request
import json

movies = [
    'fall-0ge4IoNmOE3',
    'black-clover-cE1aW4X3H14',
    'lioness-yDLLAaCaND1',
    'reacher-e1nw56h5sj4'
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'X-Client-Info': json.dumps({'timezone': 'Asia/Kolkata'}),
    'X-Request-Lang': 'en'
}

for m in movies:
    detail_url = f'https://themoviebox.xyz/wefeed-h5api-bff/detail?detailPath={m}'
    try:
        req = urllib.request.Request(detail_url, headers=headers)
        res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
        subj = res['data']['subject']
        s_id = subj['subjectId']
        s_title = subj['title']
        dubs = subj.get('dubs', [])
        subs = subj.get('subtitles', '')
        print(f"\nMovie: {s_title.encode('ascii', 'ignore').decode()} ({m}) | ID: {s_id}")
        print(f"  Dubs: {dubs} | Subs: {subs.encode('ascii', 'ignore').decode()}")
        
        # Test play API
        play_url = f'https://themoviebox.xyz/wefeed-h5api-bff/subject/play?subjectId={s_id}&se=1&ep=1&streamSignType=0'
        req2 = urllib.request.Request(play_url, headers=headers)
        res2 = json.loads(urllib.request.urlopen(req2).read().decode('utf-8'))
        pdata = res2.get('data', {})
        print(f"  Play response: streams={len(pdata.get('streams', []))}, dash={len(pdata.get('dash', []))}, hls={len(pdata.get('hls', []))}")
        if pdata.get('streams'):
            print('  Stream 0:', repr(pdata['streams'][0])[:120])
        if pdata.get('dash'):
            print('  Dash 0:', repr(pdata['dash'][0])[:120])
        if pdata.get('hls'):
            print('  Hls 0:', repr(pdata['hls'][0])[:120])
    except Exception as e:
        print(f"Error {m}: {e}")
