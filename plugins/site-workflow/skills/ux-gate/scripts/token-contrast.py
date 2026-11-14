"""Check colour-token pairs in theme/CSS files against minimum contrast ratios.

    python <skill-dir>/scripts/token-contrast.py [--config .claude/ux-gate/config.json]
    python <skill-dir>/scripts/token-contrast.py --file <css> --pair <fg-var> <bg-var> <min> [--pair ...]

The pairs come from config.tokenContrast:

    "tokenContrast": {
      "files": ["src/styles/globals.css"],
      "pairs": [["--foreground", "--background", 4.5, "body text"],
                ["--primary-foreground", "--primary", 4.5, "button labels"]]
    }

The script reads every `--name: <colour>` declaration in the files (the first
declaration wins, so :root beats .dark; list a dark-theme file separately to
check it). It follows var(--other) references and understands hex, rgb()/rgba(),
hsl() and oklch(). Translucent foregrounds are composited over the background.
Run it from the project root. Exits 1 if any pair fails.
"""

import argparse
import colorsys
import json
import math
import re
import sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--config", type=Path, default=Path(".claude/ux-gate/config.json"))
parser.add_argument("--file", action="append", type=Path)
parser.add_argument("--pair", action="append", nargs=3, metavar=("FG", "BG", "MIN"))
args = parser.parse_args()

cfg = {}
if args.config.exists():
    cfg = json.loads(args.config.read_text(encoding="utf-8")).get("tokenContrast", {})
files = args.file or [Path(f) for f in cfg.get("files", [])]
pairs = [(fg, bg, float(m), "") for fg, bg, m in (args.pair or [])] or [
    (p[0], p[1], float(p[2]), p[3] if len(p) > 3 else "") for p in cfg.get("pairs", [])
]
if not files or not pairs:
    sys.exit("No files or pairs. Add tokenContrast to .claude/ux-gate/config.json, or pass --file and --pair.")

decls = {}
for f in files:
    for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;}{]+)", f.read_text(encoding="utf-8")):
        decls.setdefault(name, value.strip())


def oklch_to_srgb(l, c, h):
    a, b = c * math.cos(math.radians(h)), c * math.sin(math.radians(h))
    l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s_ = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3
    lin = (
        4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
        -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
        -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
    )
    enc = lambda v: 12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055
    return tuple(min(1.0, max(0.0, enc(min(1.0, max(0.0, v))))) for v in lin)


def num(token, scale=1.0):
    token = token.strip()
    return float(token[:-1]) / 100 if token.endswith("%") else float(token) / scale


def parse(value, depth=0):
    """Return ((r, g, b) in 0..1, alpha) or None."""
    value = value.strip()
    ref = re.fullmatch(r"var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)", value)
    if ref and depth < 10:
        target = decls.get(ref.group(1))
        return parse(target, depth + 1) if target else (parse(ref.group(2), depth + 1) if ref.group(2) else None)
    if value.startswith("#"):
        h = value[1:]
        if len(h) in (3, 4):
            h = "".join(ch * 2 for ch in h)
        rgb = tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
        return rgb, (int(h[6:8], 16) / 255 if len(h) == 8 else 1.0)
    m = re.fullmatch(r"(rgba?|hsla?|oklch)\((.+)\)", value, re.I)
    if not m:
        return None
    kind, body = m.group(1).lower(), m.group(2).replace(",", " ")
    parts = body.replace("/", " / ").split()
    alpha = 1.0
    if "/" in parts:
        i = parts.index("/")
        alpha, parts = num(parts[i + 1]), parts[:i]
    elif len(parts) == 4:
        alpha, parts = num(parts[3]), parts[:3]
    if kind.startswith("rgb"):
        return tuple(num(p, 255) for p in parts), alpha
    if kind.startswith("hsl"):
        hue = float(parts[0].rstrip("deg"))
        return colorsys.hls_to_rgb(hue / 360, num(parts[2], 100), num(parts[1], 100)), alpha
    return oklch_to_srgb(num(parts[0]), float(parts[1]), float(parts[2].rstrip("deg") or 0)), alpha


def luminance(rgb):
    dec = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (dec(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


failed = 0
for fg_name, bg_name, minimum, why in pairs:
    fg, bg = parse(f"var({fg_name})"), parse(f"var({bg_name})")
    if not fg or not bg:
        print(f"  missing  {fg_name} on {bg_name} (not found or not a colour)")
        failed += 1
        continue
    (fg_rgb, fg_a), (bg_rgb, _) = fg, bg
    if fg_a < 1:
        fg_rgb = tuple(fg_a * x + (1 - fg_a) * y for x, y in zip(fg_rgb, bg_rgb))
    hi, lo = sorted((luminance(fg_rgb), luminance(bg_rgb)), reverse=True)
    r = (hi + 0.05) / (lo + 0.05)
    ok = r >= minimum
    failed += not ok
    print(f"  {'pass' if ok else 'FAIL'}  {r:5.2f}:1 (min {minimum})  {fg_name} on {bg_name}{', ' + why if why else ''}")

print(f"\n{failed} failure(s)")
sys.exit(1 if failed else 0)
