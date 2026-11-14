---
name: no-git-commits
description: Never commit to git without the owner's explicit instruction
metadata:
  type: feedback
---

Never run `git commit` (or stage for one) unless the owner explicitly asks ("commit this", "/commit").

**Why:** the owner controls their own git history. Autonomous commits, even after plans or specs, are unwelcome.

**How to apply:** after editing, stop and report. If a commit seems warranted, say so and let the owner decide. This applies to code, docs, plans and config.
