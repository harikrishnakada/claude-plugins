# Worked examples (generic)

These are real request patterns, classified. Use them to calibrate. The project's `.claude/ux-gate/examples.md` adds requests from that site.

| Request | Kind | Why | What the gate does |
|---|---|---|---|
| "The homepage feels like reading a blog." | UX problem | Measure it first. One real case had 1,631 words, 7 of 10 sections with no visual, 60-word paragraphs and the same fact repeated 6 times. | Recommend the copy limits, one visual per section and say-it-once. Build after approval. |
| "Use the current palette, refined." | Preference | Every role passes contrast on every ground (`token-contrast.py`) | Build as asked. |
| "Full-bleed photo behind the hero." | Preference with a cost | In one real case, mobile Lighthouse performance fell from 91 to 86–88 because the photo became the LCP on phones | Build it, state the cost, offer the mitigation (hide it on phones), and log the decision. |
| "Change the final CTA button to say 'Get Started'." | Preference with a cost | **Clarity:** it doesn't say what happens next. **Consistency:** other buttons to the same page use a specific label (§2.3). | Stop and ask. Recommend the specific label used site-wide for that destination. If the owner still wants it, build it and log it. |
| "Make the hero headline a gradient, and bigger." | Preference with a cost | **Gradient:** gradient text is on the avoid list. **Size:** check it against the 96 px cap. | Stop and ask. Recommend solid ink with emphasis from weight or colour on part of the line, and size up to the cap. Scope the change to the hero if the type size is shared. |
| "Add our tech stack with logos." | Preference with a cost | **Logos:** a logo wall is on the avoid list, and vendor brand rules restrict logo use. **Repetition:** check whether the page already lists the stack. | Stop and ask. Offer names as type, grouped by job, or one-colour marks next to visible names. |
| "Add 'Trusted by 50+ companies' under the hero." | **Hard rule (H1)** | The claim can't be traced to the owner | Blocked. Offer what can be checked: certifications, published commitments, real projects once the owner supplies them. |
| "Add a 'Most popular' badge to the middle pricing tier." | **Hard rule (H1)** unless the owner has data | Manufactured social proof | Blocked without data. Offer a factual label instead, such as "Best for teams of 5–20". |
| "Make the FAQ text a lighter grey; it looks more elegant." | Hard rule if it falls below 4.5:1, otherwise preference | WCAG 1.4.3 | Measure first. Build as asked if it passes. Block below 4.5:1 and offer the lightest tone that passes. |
| "Swap the services image for a different one." | Preference | Taste only, as long as it has alt text, is sized with `sizes`, and isn't the LCP | Build as asked. `UX gate: no conflicts.` |
| "Rename the nav item 'Services' to 'Expertise'." | Preference, check consistency | The same name should appear in the page title, H1, breadcrumbs and links | Build it, update every place the label appears, and check redirects if the URL changes. |
