// Fast accessibility and reflow checks on a rendered page.
//
//   node <skill-dir>/scripts/a11y.mjs <url> [--widths 320,390,1440]
//
// Per width:
//   - text contrast below WCAG AA (4.5:1, or 3:1 for large text), measured on
//     the computed colours. oklch/lab colours are converted by painting them on
//     a canvas, so v2 role colours are checked too
//   - text over a photo or translucent gradient, listed for a manual look
//   - gradient text (background-clip: text), which the standards ban
//   - horizontal overflow (anything wider than the viewport)
//   - heading outline: exactly one h1, no skipped levels
//   - images without alt, and focusable elements inside aria-hidden
// Exits 1 when any check fails. Lighthouse remains the final word; this is the
// quick loop while building.
import { loadConfig, loadPlaywright, launch } from './lib.mjs';

const { chromium } = loadPlaywright(loadConfig());

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const widths = opt('--widths', '320,390,1440').split(',').map(Number);
if (!url) {
  console.error('usage: a11y.mjs <url> [--widths 320,390,1440]');
  process.exit(2);
}

const browser = await launch(chromium);
let failed = false;

for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    isMobile: width < 768,
    hasTouch: width < 768,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });

  const r = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = (css) => {
      g.clearRect(0, 0, 1, 1);
      g.fillStyle = '#000';
      g.fillStyle = css;
      g.fillRect(0, 0, 1, 1);
      const [r, gr, b, a] = g.getImageData(0, 0, 1, 1).data;
      return { r, g: gr, b, a: a / 255 };
    };
    const lum = ({ r, g, b }) => {
      const f = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const COLOR = /(?:rgba?|oklch|oklab|lab|lch|hsla?|color)\((?:[^()]|\([^()]*\))*\)|#[0-9a-f]{3,8}\b/gi;
    const over = (top, base) => ({
      r: top.r * top.a + base.r * (1 - top.a),
      g: top.g * top.a + base.g * (1 - top.a),
      b: top.b * top.a + base.b * (1 - top.a),
      a: 1,
    });
    // What the text is painted on: the layers under its centre, from the
    // element stack, so overlays that are siblings (scrims, tints) count too.
    // Returns the possible backdrop colours (every stop of a gradient), or
    // { image: true } when a photo or translucent gradient is underneath.
    const backdrop = (el) => {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      const b = el.getBoundingClientRect();
      const stack = document.elementsFromPoint(b.left + Math.min(b.width / 2, 12), b.top + b.height / 2);
      const i = stack.indexOf(el);
      if (i < 0) return { unseen: true }; // covered, or not hit-testable at its centre
      // The element's own background first (a button's fill), then what lies beneath.
      const below = [el, ...stack.slice(i + 1).filter((n) => !el.contains(n))];
      const tints = [];
      const flatten = (base) => tints.reduceRight((acc, t) => over(t, acc), base);
      for (const n of below) {
        if (/^(IMG|VIDEO|CANVAS|PICTURE)$/.test(n.tagName)) return { image: true };
        const cs = getComputedStyle(n);
        if (cs.backgroundImage.includes('url(')) return { image: true };
        if (cs.backgroundImage.includes('gradient')) {
          const stops = (cs.backgroundImage.match(COLOR) || []).map(rgba);
          if (stops.length && stops.every((c) => c.a > 0.95)) return { colors: stops.map(flatten) };
          if (stops.some((c) => c.a > 0.05)) return { image: true };
        }
        const c = rgba(cs.backgroundColor);
        if (c.a > 0.95) return { colors: [flatten(c)] };
        if (c.a > 0.02) tints.push(c);
      }
      return { colors: [flatten({ r: 255, g: 255, b: 255, a: 1 })] };
    };

    // elementsFromPoint skips pointer-events:none, which most scrims use.
    const probe = document.createElement('style');
    probe.textContent = '* { pointer-events: auto !important; }';
    document.head.append(probe);

    const low = [];
    const overImage = [];
    const gradientText = [];
    const main = document.querySelector('main') ?? document.body;
    for (const el of main.querySelectorAll('*')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity === 0 || !el.getClientRects().length) continue;
      const text = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 50);
      // Labels inside aria-hidden diagrams are still read by sighted visitors,
      // so they are checked. Lone punctuation (a decorative quote mark) is
      // incidental text and exempt.
      if (!/[\p{L}\p{N}]/u.test(text)) continue;
      // Closed <details> content isn't on screen until opened.
      if (el.closest('details:not([open])') && !el.closest('summary')) continue;
      if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') {
        gradientText.push(text);
        continue;
      }
      const bd = backdrop(el);
      if (bd.unseen) continue;
      if (bd.image) {
        overImage.push(text);
        continue;
      }
      const fg = rgba(cs.color);
      const ratio = Math.min(
        ...bd.colors.map((bg) => {
          const [l1, l2] = [lum(over(fg, bg)), lum(bg)];
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        })
      );
      const size = parseFloat(cs.fontSize);
      const large = size >= 24 || (+cs.fontWeight >= 700 && size >= 18.66);
      if (ratio < (large ? 3 : 4.5)) low.push(`${ratio.toFixed(2)}:1  ${size}px  "${text}"`);
    }

    probe.remove();
    window.scrollTo(0, 0);
    const cw = document.documentElement.clientWidth;
    const overflow = [...main.querySelectorAll('*')]
      .filter((e) => {
        const b = e.getBoundingClientRect();
        if (!b.width || b.right <= cw + 1) return false;
        // Content inside a horizontal scroller is allowed to extend past the edge.
        for (let n = e.parentElement; n && n !== main; n = n.parentElement) {
          const ox = getComputedStyle(n).overflowX;
          if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return false;
        }
        return getComputedStyle(e).position !== 'fixed';
      })
      .slice(0, 5)
      .map((e) => `${e.tagName.toLowerCase()} "${(e.textContent || '').trim().slice(0, 40)}"`);

    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
    const outline = [];
    if (headings.filter((h) => h === 1).length !== 1)
      outline.push(`${headings.filter((h) => h === 1).length} h1 elements (want 1)`);
    headings.forEach((h, i) => {
      if (i && h > headings[i - 1] + 1) outline.push(`h${headings[i - 1]} → h${h} skips a level`);
    });

    const noAlt = [...document.querySelectorAll('img:not([alt])')].map((i) => i.src.slice(-60));
    const hiddenFocusable = [
      ...document.querySelectorAll(
        '[aria-hidden="true"] a[href], [aria-hidden="true"] button, [aria-hidden="true"] [tabindex]:not([tabindex="-1"])'
      ),
    ].map((e) => e.outerHTML.slice(0, 80));

    return { low, gradientText, overImage: [...new Set(overImage)].slice(0, 8), overflow, outline, noAlt, hiddenFocusable };
  });

  const fails = r.low.length + r.gradientText.length + r.overflow.length + r.outline.length + r.noAlt.length + r.hiddenFocusable.length;
  failed ||= fails > 0;
  console.log(`\n${width}px  ${fails ? `${fails} problem(s)` : 'ok'}`);
  const list = (label, items) => items.length && console.log(`  ${label}:\n    ${items.join('\n    ')}`);
  list('Low contrast', r.low);
  list('Gradient text (banned by the standards)', r.gradientText);
  list('Horizontal overflow', r.overflow);
  list('Heading outline', r.outline);
  list('Images without alt', r.noAlt);
  list('Focusable inside aria-hidden', r.hiddenFocusable);
  list('Text over a photo (check by eye)', r.overImage);
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
