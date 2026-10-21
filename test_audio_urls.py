import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

test_urls = [
    ("123embed_hindi", "https://play2.123embed.net/movie/533535?audio=hi"),
    ("123embed_english", "https://play2.123embed.net/movie/533535?audio=en"),
    ("123embed_japanese", "https://play2.123embed.net/movie/533535?audio=ja"),
    ("vidlink_default", "https://vidlink.pro/movie/533535?primaryColor=06b6d4&secondaryColor=0284c7&autoplay=true"),
    ("nxsha_hindi", "https://nxsha.space/embed/movie/533535?lang=hi&disable_app_ad=true"),
    ("nxsha_english", "https://nxsha.space/embed/movie/533535?lang=en&disable_app_ad=true"),
    ("autoembed_default", "https://player.autoembed.co/embed/movie/533535"),
    ("vidfast_default", "https://vidfast.vc/movie/533535?autoPlay=true"),
    ("vidsrc_pm_default", "https://vidsrc.pm/embed/movie/533535"),
    ("vidsrc_su_default", "https://vidsrc.su/embed/movie/533535")
]

for name, url in test_urls:
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            data = resp.read(2048).decode('utf-8', errors='ignore')
            print(f"[OK 200] {name:20} -> Length: {len(data)}, Content-Type: {resp.headers.get('Content-Type')}")
    except Exception as e:
        print(f"[FAIL]   {name:20} -> Error: {e}")
