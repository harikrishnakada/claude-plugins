# Standards the gate reviews against

This is the generic baseline for marketing and brand websites. Each project adds to it, and can override it, in `.claude/ux-gate/project-rules.md`. **Where the two disagree, the project file wins.** The project's `PRODUCT.md` holds users, voice and anti-references.

## 1. Hard rules

**What to do:** block, explain, and offer the compliant version. If the owner explicitly overrides after seeing the reason, log the override in the decisions log. H1 is never overridden.

| # | Rule |
|---|---|
| H1 | **Real proof only.** Testimonials, client logos, client counts, results, metrics, credentials and capabilities must come from the owner and be checkable. No placeholders or sample proof that could ship. |
| H2 | **Accessibility floor, WCAG 2.2 AA.** <br>• Contrast: text 4.5:1; large text, UI parts and focus rings 3:1. <br>• Keyboard: everything operable, with a visible focus ring. <br>• Reduced motion is honoured. <br>• Reflow: no sideways scroll at 320 px or at 200% zoom. <br>• Headings: one `h1`, no skipped levels. <br>• Images: real alt text, or `alt=""` when decorative. <br>• No hover-only information. <br>• Lighthouse accessibility stays at 100. |
| H3 | **No collateral change.** A change scoped to one page or component leaves every other page pixel-identical. When a shared file is touched, before/after screenshots prove it. |
| H4 | **Backward compatibility.** Never edit the files listed as protected in `project-rules.md`. Shared components change only through new optional props, with the default render unchanged. Don't mix design systems inside one section (`design-systems.md`). |
| H5 | **Single sources.** Values the project keeps in one place (brand name, prices, contact details and the like, listed in `project-rules.md`) are always read from that place, never hardcoded. |
| H6 | **Integrations keep working.** The project's list in `project-rules.md`, typically: booking, contact form and email, analytics and consent, JSON-LD, sitemap and redirects, and anchors that other pages link to. |

## 2. UX standards

**What to do:** follow them. A request that conflicts with one is a preference with a cost: name the cost, offer an alternative, and let the owner decide.

### 2.1 Content and density

These limits apply to marketing pages. Blog posts and legal pages are long-form and exempt.

| Element | Limit |
|---|---|
| Heading | 8 words or fewer |
| Section intro | 15 words or fewer |
| Item line | 12 words or fewer |
| Any paragraph | 25 words or fewer |
| FAQ answer | 45 words or fewer, answer first |

- **Say each fact once per page.** The project may name one deliberate repeat, such as its core promise.
- **No bridge sentences** ("Here's how we…"). Headings and visuals carry the story.
- **One job per section, in story order.** Cut any section that doesn't move the reader toward the call to action.
- **Open with the answer.** The first 40–60 words of a page say what it is, who it's for and what to do next.
- **Why:** visitors read about 20% of a page (NN/g). Concise, scannable text scored up to 124% higher in measured usability (NN/g, "How Users Read on the Web").

### 2.2 Visual structure

- **One visual per section** that carries the message even if the text is skipped. Build it in HTML/SVG with live-text labels, never text baked into an image. Mark it `data-visual` so `measure.mjs` counts it.
- **A different layout for each section's job.** No two adjacent sections share a layout.
- **Grounds:** at most three per page, and the ground changes only at a turn in the story. No alternating checkerboard.
- **Type limits:**
  - display text at most 96 px (clamp max ≤ 6rem)
  - letter-spacing no tighter than −0.04em
  - body lines no wider than 75ch
- **Avoid by default** (generic template looks; a project may allow some in `project-rules.md`):
  - gradient text
  - glow orbs and blobs
  - pulsing pill badges
  - a tracked-uppercase eyebrow over every section
  - grids of identical icon cards
  - hero-metric stat tiles
  - autoplay carousels
  - side-stripe accent borders
  - pure `#000` grounds
  - decorative glassmorphism
  - logo walls
  - numbered section markers unless the content really is a sequence

### 2.3 Interaction and conversion

- **CTA labels say what happens next** ("Book your discovery call", not "Get started").
- **The same destination gets the same label** everywhere on the site. One primary CTA per view.
- **Qualifiers and footnotes** (an asterisk on a timeline or price) open as keyboard-reachable toggletips, not hover-only tooltips.
- **FAQs and expandable lists** use native `<details>`. Siblings share a `name` so only one opens at a time.
- **Touch targets** are at least 44 × 44 px. Links in body text are underlined or otherwise not told apart by colour alone.
- **Forms:** visible labels, errors next to the field in text (not colour alone), and no more fields than the next step needs.

### 2.4 Motion

- Animate `transform` and `opacity` only.
- **Durations** come from the project's motion tokens, roughly 150–250 ms for UI and up to about 500 ms for a deliberate reveal. Ease out, with no bounce.
- **Reveals play once** and enhance content that's already visible. Never hide content until a script runs.
- **Reduced motion:** no animation, final state shown.
- **Nothing autoplays** without a pause control.

### 2.5 Voice

Voice is project-specific. Follow `PRODUCT.md` and the voice section of `project-rules.md`. Generic floor:
- Be specific rather than superlative.
- Don't make claims the owner can't back up (H1).
- Use the same name for the same thing everywhere.

### 2.6 Performance

| Measure | Target |
|---|---|
| Lighthouse performance, mobile | 90 or better |
| Lighthouse performance, desktop | 95 or better |
| LCP | 2.5 s or less |
| CLS | 0.1 or less |
| Lighthouse accessibility, best practices, SEO | 100 |

- **Images:** use the framework's image component with responsive `sizes`. At most one preloaded image per page, the likely LCP.
- **No new client JavaScript** for static content.
- **Measuring:** run Lighthouse on a production build (`config.commands.build`, then `config.commands.start`), not on the dev server:

```bash
npx -y lighthouse@13 <prod-url>/<path> --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=<file> --chrome-flags=--headless
```

For desktop, add `--preset=desktop`. Report the median of three runs on mobile. Note machine load when the scores are noisy, and compare with an unchanged page in the same run.

### 2.7 Search and structure

- **Every page:** unique title and meta description, semantic landmarks, and JSON-LD kept in step with the visible content (FAQPage, Service, Organization, Person, as applicable).
- **Never remove or rename an `id`** that other pages link to without updating the links.
- **Answer-first copy** helps answer engines and AI citations as well as people (§2.1).
