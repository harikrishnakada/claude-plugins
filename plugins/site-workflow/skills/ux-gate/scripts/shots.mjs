// Full-page screenshots for review and for before/after comparison.
//
//   node <skill-dir>/scripts/shots.mjs <baseUrl> <outDir> <path...>
//        [--widths 390,768,1440] [--seg 1600]
//
// One PNG per path and width, named like `_services_web-design-390.png`
// (`_home` for /). Reduced motion is on and the page is scrolled once first, so
// lazy images and scroll reveals are in their final state. --seg also slices
// each page into segments of that many CSS pixels, small enough to view one at
// a time. Use --regress in place of paths for the project's no-regression set
// (config.regress).
import path from 'node:path';
import fs from 'node:fs';
import { loadConfig, loadPlaywright, launch, normaliseRoute } from './lib.mjs';

const cfg = loadConfig();
const { chromium } = loadPlaywright(cfg);
// The no-regression set: one page per template, from .claude/ux-gate/config.json.
const REGRESS = cfg.regress;

const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const valueFlags = new Set(['--widths', '--seg']);
const positional = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]));
const [base, outDir, ...paths] = positional;
const widths = opt('--widths', '390,768,1440').split(',').map(Number);
const seg = Number(opt('--seg', 0));
const list = args.includes('--regress') ? REGRESS : paths.map(normaliseRoute);
if (!base || !outDir || !list.length) {
  console.error('usage: shots.mjs <baseUrl> <outDir> <path...|--regress> [--widths 390,768,1440] [--seg 1600]');
  process.exit(2);
}

fs.mkdirSync(outDir, { recursive: true });
const browser = await launch(chromium);

for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    isMobile: width < 768,
    hasTouch: width < 768,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  for (const p of list) {
    await page.goto(base + p, { waitUntil: 'networkidle', timeout: 90000 });
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const name = (p === '/' ? '_home' : p.replace(/\//g, '_')) + `-${width}`;
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled', timeout: 120000 });
    console.log(file);

    if (seg) {
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0, i = 0; y < total; y += seg, i++) {
        const f = path.join(outDir, `${name}-seg${String(i).padStart(2, '0')}.png`);
        await page.screenshot({
          path: f,
          fullPage: true,
          clip: { x: 0, y, width, height: Math.min(seg, total - y) },
          timeout: 120000,
        });
        console.log(f);
      }
    }
  }
  await ctx.close();
}
await browser.close();
