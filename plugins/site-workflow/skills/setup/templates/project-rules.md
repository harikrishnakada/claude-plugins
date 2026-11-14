# Project rules for the UX gate

<!-- Filled by the site-workflow setup skill. These add to, and override where they conflict, the plugin's generic standards (ux-gate/reference/standards.md). Delete these comments as you fill each section. -->

Sources: `PRODUCT.md` (users, brand, anti-references) and the decisions log (`<path>`).

## Hard rules for this site

These are blocked like the generic H1–H6.

### Protected files (H4)

<!-- Files never edited directly, such as legacy theme files, a font loader or generated code. Write "None" if there are none. -->

- `<path>`: why

### Single sources (H5)

<!-- Where each value lives. A copy anywhere else is a violation. -->

| Value | Source |
|---|---|
| Brand / company name | `<path>` → `<export>` |
| Prices | `<path>` |
| Contact details | `<path>` |
| Navigation | `<path>` |

### Integrations that must keep working (H6)

- <booking, form and email provider, analytics and consent, CMS, JSON-LD, sitemap, redirects>
- Anchors other pages link to: `#...`

### Other hard rules from the owner

<!-- For example: no invented pricing badges, no compliance claims the business doesn't hold, no themes the brand has moved away from. -->

## Voice

<!-- From PRODUCT.md and the interview. Be concrete. -->

- **Tone:**
- **Use / avoid:** "x", not "y"
- **Never claim:**
- **Naming:** the same thing has the same name everywhere (list key terms)

## Overrides to the generic standards

<!-- Only where the owner has decided differently, with the date. For example: "Mobile Lighthouse target 85 on the homepage (owner, 2026-11-01, hero video)". Write "None" if there are none. -->

## Known noise and exemptions

<!-- Pages or elements the checks should judge by eye, such as an embed or a third-party widget. -->
