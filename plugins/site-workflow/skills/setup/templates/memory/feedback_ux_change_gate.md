---
name: ux-change-gate
description: Every visitor-facing change goes through the ux-gate skill first — UX evidence decides, owner decides preferences, settled choices logged
metadata:
  type: feedback
---

Every request that changes what visitors see or do goes through the `ux-gate` skill (site-workflow plugin) before any file is edited. That covers new pages, page edits, small features and one-word label tweaks.

**Why:** the owner wants evidence (standards, measurements, WCAG) kept apart from taste. A pure preference is built as asked. A preference with a cost gets the cost in numbers plus an alternative, and the owner decides. A hard rule blocks.

**How to apply:** read `.claude/ux-gate/` (config, project rules, design systems), `PRODUCT.md` and the decisions log. Settled preferences go in the log so they aren't raised again. Related: [[copy-voice]]
