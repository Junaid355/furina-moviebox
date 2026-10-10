import re

with open('scripts/movies_fall.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

for m in re.finditer(r'<iframe[^>]*>', text, re.IGNORECASE):
    print('IFRAME:', m.group(0))

for m in re.finditer(r'.{0,100}iframe.{0,100}', text, re.IGNORECASE):
    print('IFRAME REF:', m.group(0).strip())

for m in re.finditer(r'https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*', text):
    print('MP4 URL:', m.group(0))

for m in re.finditer(r'<video[^>]*>.*?</video>', text, re.IGNORECASE | re.DOTALL):
    print('VIDEO TAG:', m.group(0)[:500])
