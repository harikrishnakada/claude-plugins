## How we work (read first)

**UX gate.** Every change a site visitor would see or do goes through the `ux-gate` skill (site-workflow plugin) before any file is edited: pages, sections, components, copy, labels, styling, imagery, motion, navigation, forms. However small. Project rules are in `.claude/ux-gate/`, settled preferences in `<decisions log path>`, and brand and users in `PRODUCT.md`.

**Plan first.** Use plan mode for anything beyond a few steps. Save plans to `<plans dir>/<name>`. When independent plan steps could run in parallel, propose them as separate sessions.

**Ask, don't guess.** Business facts (prices, proof, offers, buyers, claims) come from the owner. Use AskUserQuestion, a few questions per round. Never invent proof.

**Outside feedback.** When the owner pastes a review or audit, use the `review-intake` skill: verify each claim against the code and the live site, sort it into valid / partly valid / wrong / owner's call, interview, then plan.

**Verify before done.** Check the result in the built-in browser preview (`.claude/launch.json` → `<preview name>`, `<base url>`) at 390 and 1440 px, then run the gate's tier checks. Screenshots go in the scratchpad, never the repo. Report what passed, what failed and what wasn't checked.

**Search wide with subagents.** Use Explore subagents for broad code searches and keep the conclusions, not the file dumps.

**Never commit** unless the owner says so.

**Lessons.** After a correction from the owner, save it as a feedback memory (and `<lessons file>` if the project keeps one) so it isn't repeated.

<!-- Obsolete sources (don't use as references): list them here, or delete this line. -->
