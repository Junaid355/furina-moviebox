import re
import json

file_path = r"C:\Users\User\.gemini\antigravity\brain\22d53a87-a0ac-48aa-8f59-9133f63d6b0c\.system_generated\steps\13172\content.md"

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Find scripts
scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', text)
print(f"Total script sources found: {len(scripts)}")
for s in scripts[:20]:
    print("Script:", s)

# Find any inline json or config
configs = re.findall(r'<script[^>]*>(.*?)</script>', text, re.DOTALL)
print(f"\nTotal inline scripts found: {len(configs)}")
for i, c in enumerate(configs):
    if len(c.strip()) > 20 and ("window." in c or "api" in c.lower() or "server" in c.lower() or "nuxt" in c.lower()):
        print(f"\n--- Inline script {i} (len {len(c)}) ---")
        print(c[:500] + ("..." if len(c) > 500 else ""))

# Find URLs with api, stream, embed, movie, player
urls = set(re.findall(r'https?://[^\s"\'<>)]+', text))
interesting_urls = [u for u in urls if any(k in u.lower() for k in ["api", "stream", "embed", "player", "movie", "video", "cdn", "aoneroom"])]
print(f"\nInteresting URLs ({len(interesting_urls)}):")
for u in sorted(interesting_urls)[:30]:
    print(" ", u)
