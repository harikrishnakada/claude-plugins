# Design systems: which one, and how to stay compatible

<!-- Filled by the site-workflow setup skill from the real code. If the site has one system, keep only the sections that apply. Delete these comments as you fill each section. -->

## Direction (owner, <date>)

- <Which system new pages use. Whether older pages migrate, how, and only when the owner asks.>
- <Where the tokens live (`<path>`), the components (`<path>`), and any spec doc (`<path>`).>

## Current state: check, don't assume

```bash
<grep that lists the files on each system, for example the files that opt into the new tokens>
```

As of <date>:

| Surface | System |
|---|---|
| <route or component> | <system> |

**How to tell them apart in a file:**
- **<System A>:** <class names, components, attributes>
- **<System B>:** <class names, components, attributes>

## Shared paths (Shared tier)

Changing any of these reaches more than one page, so verify at the Shared tier:

- `<theme/token files>`
- `<shared component folders>`
- `<header, footer, layout>`

## Which system to build on

| The change | Build it on | Why |
|---|---|---|
| A new page | <system> | |
| An edit inside an existing section | That section's own tokens and components | Mixing systems inside one section mismatches borders, type and spacing |
| A change to a shared component | A new optional prop, with the default render unchanged | Every other page must stay identical (H3, H4) |
| A change to a theme or token file | Allowed. Use the Shared tier and run `token-contrast.py` | It reaches every surface |

## Compatibility checks

<!-- Specific gotchas in this codebase: seams between systems, fonts, portals and tooltips, global CSS resets, overflow and clipping, reserved data attributes. -->

1.
