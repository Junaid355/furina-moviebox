import re

with open(r'C:\Users\User\.gemini\antigravity\brain\4b56c9ef-faea-4689-903d-72d03950d75a\.system_generated\steps\6\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

hrefs = re.findall(r'href=[\'"]([^\'"]+)[\'"]', text)
movie_links = [h for h in hrefs if any(k in h for k in ['/movie', '/detail', '/watch', '/video', '/tv'])]
print('Total hrefs:', len(hrefs))
print('Movie links count:', len(movie_links))
for m in movie_links[:30]:
    print('  ', m)
