// Shared helpers for the UX gate scripts.
//
// Run every script from the project root. The project's settings live in
// .claude/ux-gate/config.json (schema: ../reference/project-config.md).
//
// playwright-core is looked up, in order, from:
//   1. the app folder (config.appDir), then the project root
//   2. this plugin's own folder (if someone ran `npm i playwright-core` here)
// If none has it, install it once in the project as a dev dependency:
//   npm i -D playwright-core --prefix <appDir>
// The browser is your installed Chrome (channel "chrome"); if Chrome isn't
// available, the scripts fall back to Playwright's own Chromium, if that's installed.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = process.cwd();
const here = path.dirname(fileURLToPath(import.meta.url));

export function loadConfig() {
  const file = path.join(root, '.claude', 'ux-gate', 'config.json');
  let cfg = {};
  if (fs.existsSync(file)) {
    try {
      cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      console.error(`Could not parse ${file}: ${e.message}`);
      process.exit(2);
    }
  } else {
    console.error(`note: no .claude/ux-gate/config.json in ${root}; using defaults. Run the site-workflow setup skill to create one.`);
  }
  return { appDir: '.', baseUrl: 'http://localhost:3000', regress: ['/'], noise: [], ...cfg };
}

export function loadPlaywright(cfg = loadConfig()) {
  const candidates = [
    path.resolve(root, cfg.appDir || '.', 'package.json'),
    path.join(root, 'package.json'),
    path.join(here, 'package.json'),
  ];
  for (const c of candidates) {
    try {
      return createRequire(c)('playwright-core');
    } catch {}
  }
  console.error(
    'playwright-core not found. Install it once in the project:\n' +
      `  npm i -D playwright-core --prefix ${cfg.appDir || '.'}`
  );
  process.exit(2);
}

export async function launch(chromium) {
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch (e) {
    try {
      return await chromium.launch();
    } catch {
      console.error('Could not start Chrome. Install Google Chrome, or run `npx playwright install chromium`.\n' + e.message);
      process.exit(2);
    }
  }
}

// Git Bash rewrites a leading "/" into its install path ("/about" arrives as
// "C:/Program Files/Git/about"). Undo that, and accept paths without the slash.
export function normaliseRoute(p) {
  const msys = p.match(/^[A-Za-z]:[\\/].*?[\\/]Git(?:[\\/](.*))?$/);
  const route = msys ? msys[1] ?? '' : p;
  return '/' + route.replace(/\\/g, '/').replace(/^\/+/, '');
}
