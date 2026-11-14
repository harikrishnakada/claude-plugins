# `.claude/ux-gate/config.json`

Every key is optional. The scripts and the gate fall back to the defaults shown.

```jsonc
{
  // Folder holding the web app's package.json, relative to the repo root.
  // Used to find playwright-core. "." if the app is at the root.
  "appDir": ".",

  // Where the dev server runs. Scripts take full URLs; the gate uses this to build them.
  "baseUrl": "http://localhost:3000",

  // Name of the configuration in .claude/launch.json that starts the dev server.
  "previewConfig": "web",

  // Pages for shots.mjs --regress. Pick one page per template, plus anything with an embed.
  "regress": ["/"],

  // Pages that change on every load (embeds, live data). diff.py reports them as noise.
  "noise": [],

  // Optional checks for token-contrast.py. Each pair is [foreground var, background var, minimum ratio, note].
  "tokenContrast": {
    "files": ["src/styles/globals.css"],
    "pairs": [["--foreground", "--background", 4.5, "body text"]]
  },

  // Shell commands, run from the repo root.
  "commands": {
    "typecheck": "npx tsc --noEmit -p .",
    "lint": "npm run lint",
    "build": "npm run build",
    "start": "npm run start -- -p 3124"
  },

  // Where settled owner decisions are logged.
  "decisionsLog": "docs/design/decisions.md",

  // Where plans are saved (folder per plan, or one file per plan).
  "plansDir": "tasks"
}
```

The file is JSON. The comments above are for reading only; don't put comments in the real file.
