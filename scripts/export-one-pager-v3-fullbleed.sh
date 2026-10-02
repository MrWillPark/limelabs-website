#!/usr/bin/env bash
# Export full-bleed letter PDFs from the v3 partner one-pagers.
#
# The live v3 pages print through a 0.5in @page margin (so browser margin
# settings and headers/footers can't push them to a second page). For
# press/digital sharing we want the sheet to reach all four edges, so this
# script renders BUILD-TIME COPIES with the sheet filling the whole letter
# page — the live pages are not modified.
#
# Usage: scripts/export-one-pager-v3-fullbleed.sh [out-dir]
# Env:   CHROME (default: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome)
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="${1:-/tmp/one-pager-v3-fullbleed}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$OUT"

INJECT='<style>
    /* Full-bleed export override: sheet fills the letter page. */
    @media print {
      html, body {
        background: var(--sheet-bg) !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .sheet {
        width: 8.5in !important;
        min-height: 11in !important;
        height: 11in !important;
        margin: 0 !important;
        padding: 0.5in 0.62in !important;
        gap: 20px !important;
      }
    }
    @page { size: letter portrait; margin: 0; }
  </style></head>'

for name in memory-plants bggh; do
  src="$REPO/${name}-one-pager-v3.html"
  tmp="$(mktemp "/tmp/${name}-v3-fullbleed-XXXXXX.html")"
  python3 - "$src" "$tmp" "$INJECT" <<'PY'
import sys
src, dst, inject = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src).read()
assert "</head>" in s, "no </head> found"
open(dst, "w").write(s.replace("</head>", inject, 1))
PY
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=15000 \
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
