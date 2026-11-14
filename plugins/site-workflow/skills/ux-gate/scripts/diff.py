"""Compare two screenshot folders made by shots.mjs.

    python <skill-dir>/scripts/diff.py <beforeDir> <afterDir> [--tolerance 16] [--out <dir>]

For every PNG present in both folders: whether the page height changed, the
largest per-channel difference, and the share of pixels that differ by more
than the tolerance. Image decoding alone moves pixels by up to ~11 of 255, so
the default tolerance of 16 treats that as noise. --out writes a red-on-grey
diff image for each page that changed. Exits 1 if any page changed.

Known noise: pages listed in config.noise (.claude/ux-gate/config.json), such
as booking embeds or live feeds, render differently on every load. They're
reported as "noise" and don't fail the run; judge them by eye. Needs Pillow
(`pip install pillow`).
"""

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops

parser = argparse.ArgumentParser()
parser.add_argument("before", type=Path)
parser.add_argument("after", type=Path)
parser.add_argument("--tolerance", type=int, default=16)
parser.add_argument("--out", type=Path)
args = parser.parse_args()

cfg_file = Path.cwd() / ".claude" / "ux-gate" / "config.json"
noise_routes = json.loads(cfg_file.read_text(encoding="utf-8")).get("noise", []) if cfg_file.exists() else []
noise_prefixes = tuple("_home" if r == "/" else r.replace("/", "_") for r in noise_routes)


def is_noise(name):
    stem = name.rsplit("-", 1)[0]
    return any(stem == p for p in noise_prefixes)


changed = 0
names = sorted(p.name for p in args.before.glob("*.png") if "-seg" not in p.name)
for name in names:
    other = args.after / name
    if not other.exists():
        print(f"{name:55} missing in after")
        changed += 1
        continue
    a = Image.open(args.before / name).convert("RGB")
    b = Image.open(other).convert("RGB")
    if a.size != b.size:
        print(f"{name:55} size {a.size[0]}x{a.size[1]} -> {b.size[0]}x{b.size[1]}" + ("  (noise)" if is_noise(name) else ""))
        changed += not is_noise(name)
        continue
    diff = ImageChops.difference(a, b)
    peak = max(hi for _, hi in diff.getextrema())
    mask = diff.convert("L").point(lambda v: 255 if v > args.tolerance else 0)
    over = mask.histogram()[255]
    share = over / (a.size[0] * a.size[1])
    status = ("noise" if is_noise(name) else "changed") if over else "same"
    print(f"{name:55} {status:8} peak {peak:3}  over tolerance {share:.4%}")
    if over:
        changed += status == "changed"
        if args.out:
            args.out.mkdir(parents=True, exist_ok=True)
            base = Image.blend(a.convert("L").convert("RGB"), Image.new("RGB", a.size, "white"), 0.6)
            red = Image.new("RGB", a.size, (220, 0, 0))
            Image.composite(red, base, mask).save(args.out / f"diff-{name}")

print(f"\n{changed} of {len(names)} page(s) changed")
sys.exit(1 if changed else 0)
