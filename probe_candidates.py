import urllib.request
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

candidates = [
    ("vidsrc_xyz", "https://vidsrc.xyz/embed/movie/533535"),
    ("vidsrc_icu", "https://vidsrc.icu/embed/movie/533535"),
    ("vidsrc_su", "https://vidsrc.su/embed/movie/533535"),
    ("hexa", "https://hexa.watch/embed/movie/533535"),
    ("vidjoy", "https://vidjoy.pro/embed/movie/533535"),
    ("autoembed_to", "https://autoembed.to/movie/tmdb/533535"),
    ("rgshows", "https://rgshows.me/embed/movie/533535"),
    ("smashy_cf", "https://embed.smashystream.com/playere.php?tmdb=533535"),
    ("superembed", "https://multiembed.mov/?video_id=533535&tmdb=1"),
    ("streamwish", "https://embedwish.com/e/533535"),
    ("vidcloud", "https://vidcloud9.com/embed/533535"),
    ("lonelil", "https://watch.lonelil.com/embed/movie/533535")
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

for name, url in candidates:
    req = urllib.request.Request(url, headers=headers)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            elapsed = int((time.time() - t0) * 1000)
            code = resp.getcode()
            headers_dict = dict(resp.headers)
            xframe = headers_dict.get('x-frame-options', 'NONE')
            print(f"[OK {code}] {name:15} in {elapsed}ms | X-Frame: {xframe} | URL: {resp.geturl()[:60]}")
    except Exception as e:
        elapsed = int((time.time() - t0) * 1000)
        print(f"[FAIL]  {name:15} in {elapsed}ms | Error: {str(e)[:60]}")
