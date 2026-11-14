---
name: setup
description: Use when installing or refreshing the site-workflow (UX gate, decisions log, PRODUCT.md, CLAUDE.md workflow rules, memory rules) in a website project — "set up the UX gate here", "bring my Claude workflow to this repo", or when the ux-gate skill reports that .claude/ux-gate/ is missing.
---

# Set up the site workflow in a project

This tailors the plugin's generic UX gate and working rules to one repository. **The structure comes from the plugin. The content comes from this repo's code and the owner's answers. Never copy facts from another project.**

Work in plan mode. Save the plan where the project keeps plans (look for `tasks/`, `.agents/plans/` or `docs/plans/`; ask if there are none). Never commit. Ask the owner with AskUserQuestion wherever a business fact or a preference is needed, a few questions per round, never guesses.

Templates are in this skill's `templates/` folder (the base directory shown when the skill loads).

## 1. Survey the repo (read only)

Use an Explore subagent if the repo is large. Find:

- **Stack and app folder:** the `package.json` holding the web framework, the dev port, and the build, start, lint and typecheck commands.
- **`.claude/launch.json`:** the dev-server preview config. Create one if it's missing (step 3).
- **Existing guidance:** `CLAUDE.md`, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, design or brand docs, plans and task folders, lessons files, and this project's memory folder. Note which look stale: they describe pages, brands or structure that no longer match the code.
- **Design system:** theme and token files (CSS variables, Tailwind `@theme`, theme objects), the shared component folders, layout pieces (header, footer), and whether more than one system coexists (old vs new tokens, a migration in progress). Find the evidence with greps; don't assume.
- **Single sources:** where the brand name, prices, contact details and nav live (constants or config files). Note any hardcoded copies.
- **Integrations:** booking, forms and email, analytics and consent, CMS, JSON-LD, sitemap, redirects.
- **Routes:** one page per template, for the regression set, plus pages with embeds that change on every load.
- **History:** past plans and todo files, and decisions already made, for seeding the decisions log and the examples.

## 2. Interview the owner

Ask only what the repo can't answer. Typical rounds:

1. **Brand and audience:** company name and source of truth, who the buyers are, what success is (booking, form, purchase), anti-references.
2. **Proof:** which testimonials, logos, metrics, certifications and case studies are real and approved. Everything else is blocked by H1.
3. **Voice:** tone, words to use and avoid, claims never to make (headcount, compliance, uptime and the like).
4. **Design direction:** which system new pages use, whether older pages migrate and when, protected files.
5. **Docs:** which existing docs are obsolete and must not be used as sources.

## 3. Write the project files

Fill every template from the survey and the answers. Delete template guidance comments as you fill them. Leave a clearly marked `TODO (owner)` only where the owner chose to answer later.

| Write | From template | Notes |
|---|---|---|
| `.claude/ux-gate/config.json` | `templates/config.json` | Real app folder, port, preview name, regression routes, noise pages, token pairs, commands. Schema: `../ux-gate/reference/project-config.md`. |
| `.claude/ux-gate/project-rules.md` | `templates/project-rules.md` | This site's hard rules (protected files, single sources, integrations), voice, and any overrides to the generic standards. |
| `.claude/ux-gate/design-systems.md` | `templates/design-systems.md` | The real systems, how to tell them apart, the current-state grep (run it and record the result), shared paths, compatibility rules. |
| `.claude/ux-gate/examples.md` | `templates/examples.md` | 4–8 real requests from this repo's history, classified. |
| Decisions log (default `docs/design/decisions.md`) | `templates/decisions.md` | Seed it with decisions already visible in plans, lessons or commits, each with a date. |
| `PRODUCT.md` | `templates/PRODUCT.md` | Create it, or fill the gaps in an existing one. Keep what the owner already wrote. |
| `CLAUDE.md` | `templates/CLAUDE-workflow.md` | Put the workflow block at the top. Correct stale facts (layout, brand, pages) from the code. Remove instructions that don't match how the project works; ask before deleting large sections. Keep it short. |
| `.claude/launch.json` | (inline) | Only if missing: `{"version":"0.0.1","configurations":[{"name":"<name>","runtimeExecutable":"npm","runtimeArgs":["--prefix","<appDir>","run","dev"],"port":<port>}]}` |
| Memory | `templates/memory/*.md` | Write each one into **your memory directory for this project** (named in your system prompt) and add a line for each to its `MEMORY.md`. Check for existing memories first and update rather than duplicate. Fill in the voice and obsolete-docs files from the interview. |

## 4. Make the checks runnable

0. **impeccable:** confirm the `impeccable` skill is listed in this session. It's a dependency of this plugin, so it's normally there. If it's missing, give the owner the two install commands from the ux-gate skill and carry on. `PRODUCT.md`, which this setup writes, is also impeccable's context file, so don't create a separate one for it.
1. **playwright-core:** check whether the app can resolve it (`node -e "require.resolve('playwright-core')"` run in the app folder). If not, ask the owner before running `npm i -D playwright-core --prefix <appDir>`. It uses the installed Chrome, so no browser download is needed.
2. **Pillow** for `diff.py`: `python -c "import PIL"`. If it's missing, tell the owner to run `pip install pillow`.
3. **Start the site** with the preview config (preview_start), not Bash.
4. **Run each script once from the repo root:** `a11y.mjs` and `measure.mjs` on the homepage, `shots.mjs --regress` into the scratchpad, `diff.py` comparing that folder with itself (every page should come back "same"), and `token-contrast.py` if pairs are configured. Report real failures as findings for the owner; don't fix them during setup.

## 5. Dry run

Ask the owner for one small real request, or take one from the backlog. Run it through the `ux-gate` skill up to the verdict, and show the review note or the `UX gate: no conflicts.` line. Build it only if the owner says so.

## 6. Report

List the files written, the script results, any open `TODO (owner)` items, and pre-existing problems the checks found. Don't commit.

## Refreshing an existing setup

If `.claude/ux-gate/` already exists, diff it against the templates and the current code. Update the current-state table, regression routes and commands. Keep the owner's rules and decisions unless they ask otherwise.
