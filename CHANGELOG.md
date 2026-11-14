# Changelog

## site-workflow 1.1.0 (2026-11-14)

- impeccable is now a plugin dependency and installs with site-workflow.
- The ux-gate skill sets out how the gate and impeccable split the work.
- The setup skill checks that impeccable is present and uses `PRODUCT.md` as the context file both skills share.

## site-workflow 1.0.0 (2026-11-14)

- `ux-gate`: generic UX gate with per-project rules in `.claude/ux-gate/`.
- Verify scripts driven by the project config: `a11y.mjs`, `measure.mjs`, `shots.mjs`, `diff.py` (noise-aware) and `token-contrast.py` (any CSS colour variables).
- `setup`: survey, interview, templates, script check and a dry run.
- `review-intake`: verify outside feedback, interview, then plan.
