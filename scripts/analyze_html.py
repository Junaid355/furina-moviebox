import re
import json

with open(r'C:\Users\User\.gemini\antigravity\brain\4b56c9ef-faea-4689-903d-72d03950d75a\.system_generated\steps\6\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print('Length of file:', len(text))
scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', text)
print('Scripts:')
for s in scripts:
    print('  ', s)

# Look for inline scripts
inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', text, re.DOTALL)
print('Inline scripts count:', len(inline_scripts))
for i, s in enumerate(inline_scripts):
    print(f'--- Inline script {i} (len {len(s)}) ---')
    print(s[:500])
