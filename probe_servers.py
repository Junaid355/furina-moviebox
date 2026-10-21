import urllib.request
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

servers_to_test = [
    ("vidstuck", "https://vidstuck.xyz/embed/movie/533535?dubLang=hi"),
    ("autoembed", "https://player.autoembed.co/embed/movie/533535"),
    ("vidfast", "https://vidfast.vc/movie/533535?autoPlay=true"),
    ("nxsha", "https://nxsha.space/embed/movie/533535?lang=hi&disable_app_ad=true"),
    ("vidlink", "https://vidlink.pro/movie/533535?primaryColor=06b6d4&secondaryColor=0284c7&autoplay=true"),
    ("vidsrc_cc", "https://vidsrc.cc/v2/embed/movie/533535?autoPlay=true"),
    ("twoembed_vip", "https://www.2embed.cc/embed/533535"),
    ("twoembed_skin", "https://2embed.skin/embed/533535"),
    ("vidsrc_in", "https://vidsrc.in/embed/movie/533535"),
    ("vidsrc_pm", "https://vidsrc.pm/embed/movie/533535"),
    ("vidsrc_to", "https://vidsrc.to/embed/movie/533535"),
    ("vidsrc_rip", "https://vidsrc.rip/embed/movie/533535"),
    ("vidsrc_net", "https://vidsrc.net/embed/movie/533535"),
    ("vidsrc_me", "https://vidsrc.me/embed/movie/533535"),
    ("vidsrc_pro", "https://vidsrc.pro/embed/movie/533535"),
    ("embed_su", "https://embed.su/embed/movie/533535"),
    ("smashy", "https://player.smashy.stream/movie/533535"),
    ("123embed", "https://play2.123embed.net/movie/533535?audio=hi"),
    ("tgvid", "https://tgvid.lovable.app/embed/movie/533535?color=38bdf8&back=true&lang=hi"),
    ("multiembed", "https://multiembed.mov/directstream.php?video_id=533535&tmdb=1"),
    ("moviesapi", "https://moviesapi.club/movie/533535"),
    ("rive", "https://rive.stream/embed?type=movie&id=533535"),
    ("frembed", "https://frembed.fun/api/film.php?id=533535"),
    ("autoembed_cc", "https://autoembed.cc/embed/player.php?id=533535")
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

for name, url in servers_to_test:
    req = urllib.request.Request(url, headers=headers)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=6, context=ctx) as resp:
            elapsed = int((time.time() - t0) * 1000)
            code = resp.getcode()
            headers_dict = dict(resp.headers)
            xframe = headers_dict.get('x-frame-options', 'NONE')
            csp = headers_dict.get('content-security-policy', '')
            frame_ancestors = 'frame-ancestors' in csp.lower()
            print(f"[OK {code}] {name:15} in {elapsed}ms | X-Frame: {xframe} | CSP-Frame: {frame_ancestors} | URL: {resp.geturl()[:60]}")
    except Exception as e:
        elapsed = int((time.time() - t0) * 1000)
        print(f"[FAIL]  {name:15} in {elapsed}ms | Error: {str(e)[:70]}")
