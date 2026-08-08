# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page portfolio/résumé site for Kaustubh Vasagadekar. Three hand-written files — `index.html`, `style.css`, `script.js` — plus `image/`. No build step, no package manager, no framework, no tests.

## Running it

Open `index.html` in a browser, or serve the directory (`python -m http.server 8000`). Nothing to install or compile.

The only network dependency is Google Fonts (Instrument Serif / Inter / JetBrains Mono). Every icon is an inline `<symbol>` in the sprite at the top of `<body>`, referenced via `<use href="#i-…">` — there is no icon CDN. Add new icons to that sprite rather than reaching for a library.

## Design system

All visual decisions are tokens in `:root` at the top of `style.css`. Change tokens, not call sites.

- **Palette**: warm paper (`--bg`) and ink (`--ink`/`--ink-2`/`--ink-3`), hairline `--line`/`--line-2`, and a single rust accent (`--accent`). The accent is deliberately scarce — active nav rule, first timeline dot, project client tag, contact underline. Don't spread it.
- **Theme**: light is the bare `:root`. Dark is defined **twice** — under `:root[data-theme="dark"]` (explicit toggle) and under `@media (prefers-color-scheme: dark)` scoped to `:root:not([data-theme="light"])` (OS default). Any new themed token must be added to both blocks or the toggle desyncs from the OS default.
- **Type**: Instrument Serif for display (name, section titles, lede, stats), Inter for body, JetBrains Mono for every piece of metadata. All metadata labels share one selector list near the top of the file (`.eyebrow, .section-index, .entry-period, …`) — add new label classes to that list instead of restating the mono/uppercase/tracking rules.
- **Sizing**: fluid `--step--2 … --step-4` and `--sp-1 … --sp-8`. Prefer these over literals; avoid re-declaring `font-size` inside media queries.

## Layout

`.shell` is a two-column grid: a sticky `.rail` (identity, nav, socials, theme toggle) beside `main`.

Under `62rem` the rail becomes a static page header and `.rail-nav` detaches into a **fixed bottom bar**. This is `position: fixed`, not `sticky`, on purpose: a sticky element can only travel inside its parent's content box, and the rail's box ends before the content begins — sticky would unstick immediately. If you restructure the rail, preserve that. `main` carries matching `padding-bottom` so the last section is never trapped under the bar.

Repeated content primitives: `.section` + `.section-head`, `.points` (hanging-rule bullets), `.tags` (pills), `.timeline`/`.entry`, `.project`, `.skill-group`, `.edu`.

## JavaScript

`script.js` is progressive enhancement only — the page is fully readable and navigable without it. It does three things: theme toggle (persisted in `localStorage`, falling back to OS preference; storage writes are wrapped in try/catch for private mode), scrollspy via `IntersectionObserver` with a `-40%/-55%` rootMargin band, and reveal-on-scroll. The `.reveal` class that sets `opacity: 0` is **added by JS**, never written in the HTML, so a script failure can't leave content invisible. Keep that property.

## Print

`@media print` at the bottom of `style.css` turns the page into a résumé: rail nav and decoration hidden, `break-inside: avoid` on entries/projects, and the icon-only social row expanded into labelled URLs. The `mailto:`/`tel:` `::after` rules hardcode the display strings — update them if the contact details change.

## Content notes

- Experience entries are ordered by **end date**, not start date, because the freelance role overlaps the employed ones.
- Tech tags on each experience entry and project are derived strictly from that item's own bullet text. Don't add tags that aren't supported by the copy.
- The three non-Nellsys experience entries share identical bullet copy — that came from the original content and is placeholder text the owner still needs to replace.
- Contact details use the values that were live in the old markup (`kaustubhvasagadekar@gmail.com`, `+91 96659 50080`, `linkedin.com/in/kaustubh-vasagadekar`). An older commented-out block in git history carried different ones (`kaustubh.v14@gmail.com`, `+91-9154847410`, `linkedin.com/in/kaustubhsv`); confirm with the owner before switching.
- `image/*.png` are currently unreferenced — there is no project-thumbnail treatment in the design.
