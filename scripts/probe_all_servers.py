import urllib.request

servers = [
    ('vidstuck', 'https://vidstuck.xyz/embed/movie/533535?branding=FurinaMovieBox&server=centaurus&overlay=true&color=38bdf8&dubLang=hi&subtitle=english&loading=2'),
    ('vidfast', 'https://vidfast.vc/movie/533535?autoPlay=true'),
    ('nxsha', 'https://nxsha.space/embed/movie/533535?lang=hi&disable_app_ad=true'),
    ('bingr', 'https://bingr.one/watch/movie/533535'),
    ('twoembed_vip', 'https://www.2embed.cc/embed/533535'),
    ('zxcstream', 'https://zxcstream.xyz/player/movie/533535?dubLang=hi&server=0'),
    ('animeworld_india', 'https://www.2embed.skin/embed/533535'),
    ('vidlink', 'https://vidlink.pro/movie/533535?primaryColor=06b6d4&sub_dub=dub'),
    ('one23embed', 'https://play2.123embed.net/movie/533535'),
    ('anyembed', 'https://anyembed.xyz/embed/tmdb-movie-533535'),
    ('autoembed', 'https://autoembed.co/movie/tmdb/533535'),
    ('tgvid', 'https://tgvid.lovable.app/embed/movie/533535?color=38bdf8&back=true&server=hindi&lang=hi'),
    ('moviebox', 'https://themoviebox.xyz/movies/533535?id=533535&lang=hi'),
    ('multiembed', 'https://multiembed.mov/?video_id=533535&tmdb=1'),
    ('vidsrc_su', 'https://vidsrc.su/embed/movie/533535')
]

headers = {'User-Agent': 'Mozilla/5.0'}

for name, url in servers:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f'{name:18} -> HTTP {resp.status} (OK)')
    except urllib.error.HTTPError as e:
        print(f'{name:18} -> HTTP {e.code}')
    except Exception as e:
        print(f'{name:18} -> Error: {type(e).__name__}')
