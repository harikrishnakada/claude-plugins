# claude-workflow plugins

A Claude Code plugin marketplace. It currently holds one plugin.

## site-workflow

Packages a website workflow drawn from a month of real Claude Code sessions, and leaves out the parts those sessions never used.

| Skill | Use |
|---|---|
| `site-workflow:ux-gate` | Every visitor-facing change: classify it (hard rule / UX problem / preference / preference with a cost), size it, give a verdict, build, verify with scripts by tier, log decisions. Generic: it reads each project's `.claude/ux-gate/` for that site's rules. |
| `site-workflow:setup` | Installs the workflow into a repo: surveys the code, interviews the owner, writes `.claude/ux-gate/*`, the decisions log, `PRODUCT.md`, a CLAUDE.md workflow block and memory rules, runs every script once, then does a dry run. |
| `site-workflow:review-intake` | When you paste outside feedback: verify each claim against the code and the site, interview you on business facts, then plan. |

The verify scripts (`a11y.mjs`, `measure.mjs`, `shots.mjs`, `diff.py`, `token-contrast.py`) read `.claude/ux-gate/config.json` from the project root. They need `playwright-core` in the project and an installed Chrome; `diff.py` needs Pillow.

site-workflow depends on the [impeccable](https://github.com/pbakaus/impeccable) plugin for design craft. The gate decides what to build, and impeccable crafts it.

## Install (once per machine)

In a terminal, add both marketplaces (impeccable's is needed to resolve the dependency):

```bash
claude plugin marketplace add pbakaus/impeccable
```

```bash
claude plugin marketplace add harikrishnakada/claude-plugins
```

```bash
claude plugin install site-workflow@claude-workflow
```

That installs impeccable too, if it's missing, and enables both for every project. Then, in any website repo, ask Claude: "Run the site-workflow setup skill."

## Update an installed copy

```bash
claude plugin marketplace update claude-workflow
```

```bash
claude plugin update site-workflow@claude-workflow
```

## Releasing a change

1. Edit the files.
2. Bump `version` in both `plugins/site-workflow/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, following semver (patch for fixes, minor for new skills or options, major for breaking config changes).
3. Validate: `claude plugin validate .` and `claude plugin validate plugins/site-workflow`.
4. Commit, tag (`git tag site-workflow-v1.1.0`) and push with tags.

See `CHANGELOG.md` for what changed in each version.

## Works well with

Firecrawl (research), and the Claude desktop app's built-in browser preview (verification).
