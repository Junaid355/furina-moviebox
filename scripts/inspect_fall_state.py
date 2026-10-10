import re
import json

with open('scripts/movies_fall.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', text, re.DOTALL)
print('Inline scripts count:', len(inline_scripts))

# Usually script 3 or last is the state
for i, s in enumerate(inline_scripts):
    print(f'Script {i} len: {len(s)}')
    if len(s) > 1000:
        # find mentions of mp4, m3u8, macdn, pacdn, cdn, aoneroom, stream, play
        for m in re.finditer(r'https?://[^\s"\'<>]+\.(?:mp4|m3u8|mpd)[^\s"\'<>]*', s):
            print('  STREAM URL:', m.group(0))

with open('scripts/movies_fall_state.txt', 'w', encoding='utf-8') as out:
    if len(inline_scripts) >= 4:
        out.write(inline_scripts[2] + '\n' + inline_scripts[3])

print('Saved scripts/movies_fall_state.txt')
