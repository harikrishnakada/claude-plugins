---
name: ux-gate
description: Use when a request would change anything a website visitor sees or does — a new page, section or component, copy or a button label, layout, styling, colour, imagery, motion, navigation, forms, CTAs — on any page, including one-word tweaks, before editing any file.
---

# UX Gate

Every visitor-facing change gets a review before it's built. The review keeps two things apart:

- **UX:** evidence about visitors, meaning standards, measurements and usability research. The evidence decides.
- **Preference:** taste, where every option passes the checks. The owner decides, and that applies to Claude's taste too.

Small changes get a small review, never none.

## Project files (read these first)

The gate is generic. Each project tailors it in `.claude/ux-gate/`:

| File | What it holds |
|---|---|
| `config.json` | App folder, dev URL, preview config name, regression pages, noisy pages, theme/token checks, typecheck, lint and build commands, decisions-log path, plans folder. Schema: `reference/project-config.md`. |
| `project-rules.md` | This site's hard rules and standards: single sources (brand name, prices), integrations that must keep working, protected files, voice and word choice, and any overrides to the generic standards. **Where it differs from `reference/standards.md`, the project wins.** |
| `design-systems.md` | Which design system or systems the site uses, how to tell them apart, the "current state" grep, and the compatibility rules. |
| `examples.md` | Optional: real requests from this site, already classified. |

Also read the project's `PRODUCT.md` (users, brand, anti-references) and the decisions log named in `config.json` (by default `docs/design/decisions.md`).

**If `.claude/ux-gate/` is missing,** say so. Offer to run the `setup` skill from this plugin, and don't skip the gate in the meantime: review against `reference/standards.md` and `PRODUCT.md` alone, and say the project rules aren't configured.

## Classify every part of the request

| Kind | How to recognise it | What to do |
|---|---|---|
| **Hard rule** | Breaks a hard rule (`reference/standards.md` §1 or `project-rules.md`): invented proof, an accessibility failure, a change to other pages, a backward-compatibility break, a hardcoded single source, a broken integration | **Blocked.** Stop, explain, and offer the compliant version. |
| **UX problem** | The request, or the current page, conflicts with an evidence-backed standard (§2) | Recommend the better version, with the evidence. |
| **Preference** | Taste only, and every option passes §1 and §2 | Build as asked. No debate. |
| **Preference with a cost** | Taste, but it costs something measurable or conflicts with a standard or a logged decision | Name the cost in numbers and give an alternative that keeps the intent. **The owner decides.** |

The test: can you point to evidence about visitors? That means a standard, a measurement, a WCAG criterion, research, or consistency with the rest of the site. If yes, it's UX. If the only argument is "it looks better", from the owner or from you, it's preference.

## Process

1. **Size it.**
   - **S:** copy, a label, or one style tweak on one page.
   - **M:** a new component or section, or a layout change on one page.
   - **Shared:** a change to anything used beyond one page, such as a theme or token file, shared or UI components, the header or the footer. `design-systems.md` lists this project's shared paths.
   - **L:** a new page, a page migrating to a new design system, or a change spanning several pages.
2. **Locate it.** Work out which page or pages it touches and which design system each one uses. Run the "current state" grep in `design-systems.md`; never assume. For a shared file, list every surface it reaches.
3. **Review it.**
   - Split the request into its parts and classify each one against the standards and project rules.
   - Check the decisions log. Don't raise a logged preference again unless the facts have changed.
   - Review your own proposal against the standards too.
   - Note problems already present in the area you're touching, such as a contrast failure or an over-long paragraph. Suggest fixes in the report. Fix them only if they fall inside what was asked.
4. **Give a verdict.**
   - **Build as asked:** no conflicts.
   - **Build with improvements:** the additions don't change what was asked, for example an accessibility fix or using tokens. List them.
   - **Recommend an alternative:** stop and ask before building.
   - **Blocked:** stop, and offer the compliant version.

   Proceed without asking only on the first two verdicts.
5. **Build it** on the right system (`design-systems.md`). Use the `impeccable` skill for the craft (see "The gate and impeccable" below).
6. **Verify it** at the size's tier (table below).
7. **Report.** Give the verdict line, what changed and the check results. When the owner settles a preference, or overrides a stated cost, add a row to the decisions log. Never commit without the owner's instruction.

## The gate and impeccable

The two skills split the work:

- **The gate decides.** It settles whether a change should happen and in what form: evidence or preference, the verdict, which design system to use, and the verification. Its verdict wins.
- **impeccable crafts.** It handles how the approved change looks and reads: typography, layout, colour, motion, copy polish. It reads the same `PRODUCT.md`. Use its commands on the approved scope only: `shape` for a new page or section, `polish` and `clarify` for refinements, `audit` and `critique` to find problems already there.

Run them in order: gate review → verdict → impeccable build → gate verify → report. If impeccable proposes something outside the verdict, such as a new section or a style the standards ban, run that through the gate too.

**If impeccable isn't available** (the skill isn't listed), it normally comes with this plugin as a dependency. Tell the owner to install it with `claude plugin marketplace add pbakaus/impeccable` and then `claude plugin install impeccable@impeccable`. Don't install it yourself. Meanwhile, build to the standards without it; the gate still runs.

## Review note (when you stop to ask)

Ask with AskUserQuestion where it's available. Put the note in the message first:

```
**UX gate: <verdict>.** <one line>
- <part of the request>: <kind>. <evidence, or the cost in numbers>
**Recommend:** <alternative that keeps the intent>
**Your call:** <one question>
```

When there are no conflicts, the report carries one line: `UX gate: no conflicts.`

## Verify by tier

The scripts live in this skill's `scripts/` folder (the base directory shown when the skill loads). Run them **from the project root** so they find `.claude/ux-gate/config.json`:

```bash
node "<skill base dir>/scripts/a11y.mjs" <url>
```

They need the site running at `config.baseUrl`. Start it with the preview config named in `config.previewConfig` (the built-in browser's preview_start), not with Bash. They also need `playwright-core` and an installed Chrome (`lib.mjs` explains how they're found). Put screenshots in the scratchpad, not the repo. Each script's header comment explains its options.

| Tier | Checks |
|---|---|
| S | View the result at 390 and 1440 px. Run `config.commands.typecheck` if code changed. |
| M | S, plus `a11y.mjs <url>` for contrast, reflow, headings and alt text, run on the page. Add `measure.mjs <url>` (words, longest block, visuals, screens per section) if copy or sections changed. Run `config.commands.lint`. |
| Shared | M, plus `shots.mjs <baseUrl> <dir> --regress` before and after the change, then `diff.py <before> <after>`. Every page must come back "same", apart from the pages in `config.noise`. |
| L | Shared, plus `config.commands.build`, Lighthouse for mobile and desktop (`reference/standards.md` §2.6), `token-contrast.py` if a theme or token file changed, and a reduced-motion pass. |

**Before you trust a result:**
- **`a11y.mjs`:** it lists text over photos separately. Check those by eye.
- **`measure.mjs`:** it counts visuals marked `data-visual`, images, SVG and aria-hidden diagrams. Diagrams made of plain lists need `data-visual` to be counted.
- **`diff.py`:** pages in `config.noise` (embeds, live feeds, rotating content) change on every load. Judge them by eye.

`reference/examples.md` has generic requests already classified. The project's `examples.md` has its own.

## Red flags: stop and run the gate

| Thought | Reality |
|---|---|
| "It's one string, cheap to undo" | A label can break clarity or consistency. A small change gets the S review, not none. |
| "The owner asked, so it's just preference" | A preference can carry a UX cost. Name it, then let them decide. |
| "My version looks better" | That's your preference. Overriding the owner needs evidence. |
| "Old page, so the gate doesn't apply" | It does. Changes to older pages are reviewed for compatibility (`design-systems.md`). |
| "Only this page changed" after editing a shared file | Unproven until the regression screenshots match. |
| "I know how this site's design system works" | Run the current-state grep. It changes. |
