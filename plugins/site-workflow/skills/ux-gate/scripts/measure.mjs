// Copy density and page length, per section.
//
//   node <skill-dir>/scripts/measure.mjs <url> [--widths 390,1440] [--vh 900] [--json]
//
// For each width: total height in screens, visible words in <main>, and per
// top-level section: height in screens, words, the longest text block, blocks
// over the 25-word paragraph budget, and visuals at least 96px across (images,
// SVG, figures, and code-drawn diagrams marked aria-hidden or role="img").
// A "screen" is 900 CSS px at every width; pass --vh to change it. Runs with reduced motion so
// scroll-reveal content is visible. Needs the dev or production server
// running; see lib.mjs for how playwright-core and Chrome are found.
import { loadConfig, loadPlaywright, launch } from './lib.mjs';

const { chromium } = loadPlaywright(loadConfig());

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const widths = opt('--widths', '390,1440').split(',').map(Number);
const asJson = args.includes('--json');
const vh = Number(opt('--vh', 900));
if (!url) {
  console.error('usage: measure.mjs <url> [--widths 390,1440] [--vh 900] [--json]');
  process.exit(2);
}

const browser = await launch(chromium);
const out = [];

for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: vh },
    isMobile: width < 768,
    hasTouch: width < 768,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });

  const result = await page.evaluate((vh) => {
    const words = (t) => t.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
    const main = document.querySelector('main') ?? document.body;
    let sections = [...main.querySelectorAll('section')].filter(
      (s) => !s.parentElement.closest('section')
    );
    if (!sections.length) sections = [main];

    const rows = sections.map((s) => {
      const r = s.getBoundingClientRect();
      const heading = s.querySelector('h1, h2');
      const blocks = [...s.querySelectorAll('p, li, dd, summary, blockquote')]
        .filter((el) => !el.querySelector('p, li, dd'))
        .map((el) => words(el.innerText))
        .filter((n) => n > 0);
      const big = [
        ...s.querySelectorAll(
          'img, svg, picture, canvas, video, figure, [role="img"], [aria-hidden="true"], [data-visual]'
        ),
      ].filter((el) => {
        const b = el.getBoundingClientRect();
        return b.width >= 96 && b.height >= 96;
      });
      // Count outermost visuals only: a figure holding an svg is one visual.
      const visuals = big.filter((el) => !big.some((o) => o !== el && o.contains(el))).length;
      return {
        section: s.dataset.section || s.id || (heading?.innerText ?? '').slice(0, 40),
        headingWords: heading ? words(heading.innerText) : 0,
        screens: +(r.height / vh).toFixed(1),
        words: words(s.innerText),
        longestBlock: Math.max(0, ...blocks),
        over25: blocks.filter((n) => n > 25).length,
        visuals,
      };
    });

    return {
      screens: +(document.documentElement.scrollHeight / vh).toFixed(1),
      words: words(main.innerText),
      sectionsWithoutVisual: rows.filter((r) => r.visuals === 0).length,
      sections: rows,
    };
  }, vh);

  out.push({ width, ...result });
  await ctx.close();
}
await browser.close();

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  for (const r of out) {
    console.log(
      `\n${r.width}px  ${r.screens} screens  ${r.words} words  ` +
        `${r.sectionsWithoutVisual}/${r.sections.length} sections without a visual`
    );
    console.table(r.sections);
  }
}
