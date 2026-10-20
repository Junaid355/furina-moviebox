import urllib.request
import json
import time
import os

API_KEY = '4e44d9029b1270a757cddc766a1bcb63'
headers = {'User-Agent': 'Mozilla/5.0'}

def fetch_json(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            time.sleep(1)
    return {}

hindi_ids = set()
hindi_path = 'E:/furina-moviebox/src/data/hindiAnimeMapped.json'
if os.path.exists(hindi_path):
    try:
        with open(hindi_path, 'r', encoding='utf-8') as f:
            d = json.load(f)
            for tid in d.get('tmdb_ids', []):
                hindi_ids.add(int(tid))
    except Exception:
        pass

known_hindi_titles = {
    'naruto', 'naruto shippuden', 'dragon ball', 'dragon ball z', 'dragon ball super',
    'demon slayer', 'kimetsu no yaiba', 'jujutsu kaisen', 'chainsaw man', 'solo leveling',
    'my hero academia', 'boku no hero academia', 'one piece', 'death note', 'black clover',
    'spy x family', 'shinchan', 'crayon shin-chan', 'doraemon', 'beyblade', 'pokemon',
    'vinland saga', 'kaiju no. 8', 'mashle', 'ranking of kings', 'shield hero',
    'bleach', 'bleach: thousand-year blood war', 'haikyuu', 'blue lock', 'tokyo ghoul',
    'dr. stone', 'assassination classroom', 'attack on titan', 'shingeki no kyojin',
    'frieren', 'wind breaker', 'hell\'s paradise', 'jigokuraku', 'overlord', 'slime'
}

all_anime = []
seen_ids = set()

print('Fetching Top Rated & Popular TV Anime from world catalog...')
for p in range(1, 8):
    data = fetch_json(f'https://api.themoviedb.org/3/discover/tv?api_key={API_KEY}&with_genres=16&with_original_language=ja&sort_by=vote_count.desc&page={p}')
    for item in data.get('results', []):
        iid = item.get('id')
        if not iid or iid in seen_ids: continue
        seen_ids.add(iid)
        
        name = item.get('name', '')
        lower = name.lower()
        is_hindi = iid in hindi_ids or any(k in lower for k in known_hindi_titles)
        
        all_anime.append({
            'id': iid,
            'title': name,
            'name': name,
            'overview': item.get('overview', ''),
            'poster_path': item.get('poster_path'),
            'backdrop_path': item.get('backdrop_path'),
            'media_type': 'tv',
            'vote_average': round(item.get('vote_average', 8.0), 1),
            'first_air_date': item.get('first_air_date', '2020-01-01'),
            'category': 'anime',
            'isAnime': True,
            'hasHindiDub': is_hindi,
            'hasEnglishDub': True,
            'dub_type': 'hindi' if is_hindi else 'english'
        })

print(f'Discovered {len(all_anime)} TV anime so far. Fetching Anime Movies...')
for p in range(1, 5):
    data = fetch_json(f'https://api.themoviedb.org/3/discover/movie?api_key={API_KEY}&with_genres=16&with_original_language=ja&sort_by=vote_count.desc&page={p}')
    for item in data.get('results', []):
        iid = item.get('id')
        if not iid or iid in seen_ids: continue
        seen_ids.add(iid)
        
        title = item.get('title', '')
        lower = title.lower()
        is_hindi = iid in hindi_ids or any(k in lower for k in known_hindi_titles)
        
        all_anime.append({
            'id': iid,
            'title': title,
            'name': title,
            'overview': item.get('overview', ''),
            'poster_path': item.get('poster_path'),
            'backdrop_path': item.get('backdrop_path'),
            'media_type': 'movie',
            'vote_average': round(item.get('vote_average', 8.2), 1),
            'release_date': item.get('release_date', '2020-01-01'),
            'category': 'anime',
            'isAnime': True,
            'hasHindiDub': is_hindi,
            'hasEnglishDub': True,
            'dub_type': 'hindi' if is_hindi else 'english'
        })

print(f'Total after movies: {len(all_anime)}. Fetching Trending Weekly / 2025-2026 Airing Anime...')
for p in range(1, 5):
    data = fetch_json(f'https://api.themoviedb.org/3/discover/tv?api_key={API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page={p}')
    for item in data.get('results', []):
        iid = item.get('id')
        if not iid or iid in seen_ids: continue
        seen_ids.add(iid)
        
        name = item.get('name', '')
        lower = name.lower()
        is_hindi = iid in hindi_ids or any(k in lower for k in known_hindi_titles)
        
        all_anime.append({
            'id': iid,
            'title': name,
            'name': name,
            'overview': item.get('overview', ''),
            'poster_path': item.get('poster_path'),
            'backdrop_path': item.get('backdrop_path'),
            'media_type': 'tv',
            'vote_average': round(item.get('vote_average', 7.8), 1),
            'first_air_date': item.get('first_air_date', '2024-01-01'),
            'category': 'anime',
            'isAnime': True,
            'isAiringWeekly': True,
            'hasHindiDub': is_hindi,
            'hasEnglishDub': True,
            'dub_type': 'hindi' if is_hindi else 'sub'
        })

out_path = 'E:/furina-moviebox/src/data/worldAnimeCatalog.json'
hindi_count = sum(1 for a in all_anime if a['hasHindiDub'])
english_count = sum(1 for a in all_anime if a['hasEnglishDub'])

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump({
        'version': '2.0.0',
        'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'total_anime': len(all_anime),
        'total_hindi_dubs': hindi_count,
        'total_english_dubs': english_count,
        'anime': all_anime
    }, f, indent=2, ensure_ascii=False)

print(f'DONE: Saved worldAnimeCatalog.json with {len(all_anime)} anime! (Hindi dubs: {hindi_count}, English dubs: {english_count})')
