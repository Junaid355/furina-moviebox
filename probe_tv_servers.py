import urllib.request
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

tv_tests = [
    ("vidlink_tv", "https://vidlink.pro/tv/66732/1/1?primaryColor=06b6d4"),
    ("123embed_tv", "https://play2.123embed.net/tv/66732/1/1?audio=hi"),
    ("vidfast_tv", "https://vidfast.vc/tv/66732/1/1?autoPlay=true"),
    ("autoembed_tv", "https://player.autoembed.co/embed/tv/66732/1/1"),
    ("nxsha_tv", "https://nxsha.space/embed/tv/66732/1/1?lang=hi&disable_app_ad=true"),
    ("vidsrc_su_tv", "https://vidsrc.su/embed/tv/66732/1/1"),
    ("vidsrc_pm_tv", "https://vidsrc.pm/embed/tv/66732/1/1"),
    ("vidsrc_to_tv", "https://vidsrc.to/embed/tv/66732/1/1"),
    ("vidsrc_net_tv", "https://vidsrc.net/embed/tv/66732/1/1"),
    ("vidsrc_me_tv", "https://vidsrc.sh/embed/tv/66732/1/1"),
    ("twoembed_tv", "https://www.2embed.cc/embedtv/66732&s=1&e=1"),
    ("tgvid_tv", "https://tgvid.lovable.app/embed/tv/66732/1/1?color=38bdf8&back=true&lang=hi")
]

for name, url in tv_tests:
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
