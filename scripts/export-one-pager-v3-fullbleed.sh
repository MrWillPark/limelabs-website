#!/usr/bin/env bash
# Export full-bleed letter PDFs from the v3 partner one-pagers.
#
# The live v3 pages are already full-bleed (@page margin 0, sheet fills
# 8.5x11in). This script makes build-time copies with every image inlined as
# a data URI — so print never races image loading — waits for fonts and
# image decode, then prints via headless Chrome and verifies page count and
# page size.
#
# Usage: scripts/export-one-pager-v3-fullbleed.sh [out-dir]
# Env:   CHROME (default: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome)
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="${1:-/tmp/one-pager-v3-fullbleed}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$OUT"

READY_GATE='<script>
    (function () {
      function ready() {
        var fontWait = document.fonts ? document.fonts.ready : Promise.resolve();
        var imgWaits = [].map.call(document.images, function (img) {
          return img.decode ? img.decode() : Promise.resolve();
        });
        Promise.all([fontWait].concat(imgWaits)).then(function () {
          document.documentElement.setAttribute("data-print-ready", "true");
        });
      }
      if (document.readyState === "complete") { ready(); } else { window.addEventListener("load", ready); }
    })();
  </script></body>'

for name in memory-plants bggh; do
  src="$REPO/${name}-one-pager-v3.html"
  tmp="$(mktemp "/tmp/${name}-v3-fullbleed-XXXXXX.html")"
  python3 - "$src" "$tmp" "$READY_GATE" <<'PY'
import base64, os, re, sys
src, dst, gate = sys.argv[1], sys.argv[2], sys.argv[3]
repo = os.path.dirname(os.path.abspath(src))
s = open(src).read()

mime = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml"}
def inline(m):
    path, = m.groups()
    if path.startswith("data:"):
        return m.group(0)
    ext = os.path.splitext(path)[1].lower()
    data = open(os.path.join(repo, path), "rb").read()
    return f'src="data:{mime[ext]};base64,{base64.b64encode(data).decode()}"'

s = re.sub(r'src="((?:assets/)[^"]+)"', inline, s)
assert "data-print-ready" not in s
assert "</body>" in s
open(dst, "w").write(s.replace("</body>", gate, 1))
PY
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=30000 \
    --print-to-pdf="$OUT/${name}-v3-fullbleed.pdf" "file://$tmp" 2>/dev/null
  rm -f "$tmp"
done

python3 - "$OUT" <<'PY'
import re, sys, os
out = sys.argv[1]
ok = True
for name in ("memory-plants", "bggh"):
    f = os.path.join(out, f"{name}-v3-fullbleed.pdf")
    d = open(f, "rb").read()
    pages = len(re.findall(rb"/Type\s*/Page[^s]", d))
    mb = re.search(rb"/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]", d)
    w = float(mb.group(3)) - float(mb.group(1))
    h = float(mb.group(4)) - float(mb.group(2))
    good = pages == 1 and abs(w - 612) < 1 and abs(h - 792) < 1
    ok &= good
    print(f"{f}: {pages} page(s), {w:.0f}x{h:.0f}pt (letter=612x792) {'OK' if good else 'FAIL'}")
sys.exit(0 if ok else 1)
PY
echo "done -> $OUT"
