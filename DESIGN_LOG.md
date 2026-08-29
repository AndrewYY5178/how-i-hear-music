# How I Hear Music — Design Log

Append one entry for every visual version. Never rewrite an earlier entry; corrections become a new version.

| Version | Date | Scope | Reference | Commit |
| --- | --- | --- | --- | --- |
| 1.1 | 2026-08-29 | Album catalog rhythm, interaction and motion standard | Album of the Year; Music Memory; The Listening Log content model | `Add UI design versioning baseline` |
| 1.2 | 2026-08-29 | Journal reading hierarchy and module color stability | Music Memory | `Standardize journal reading hierarchy` |
| 1.3 | 2026-08-29 | Home mobile cascade and touch-target regression | Repository route audit | `Fix Home mobile cascade` |
| 1.4 | 2026-08-29 | Navigation state and rating interaction integrity | Interaction audit | `Complete rating interaction states` |
| 1.5 | 2026-08-29 | Static publishing routes and Rate metadata contrast | Repository and deployment audit | `Harden GitHub Pages routing` |

## Version 1.1 — Catalog rhythm and interaction baseline

### Before

- Album cards had correct square artwork but variable title/link baselines.
- Cover fallback visibility depended on the browser's default `[hidden]` rule.
- Hover movement existed without a repository-level reduced-motion contract.
- Design decisions were spread across TODO notes and commit history.

### Decision

- Preserve the existing editorial identity and module palette.
- Standardize album cards as a repeated 1:1 catalog system with aligned metadata and actions.
- Add explicit focus, touch and reduced-motion behavior.
- Correct the mobile album grid cascade so 390px layouts use two columns rather than three.
- Establish `DESIGN_SYSTEM.md`, this append-only log, and per-reference Taste DNA files.

### Evidence

- Album of the Year uses repeated square covers and fixed metadata order to support rapid catalog scanning.
- Music Memory frames listening history as dated personal narrative rather than a generic activity feed.
- The Listening Log confirms the usefulness of chronological listening notes, though its live page was unavailable to the isolated visual-analysis browser during this pass.

### Files

- `styles.css`
- `modules/archive/pages.js`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `albumoftheyear.org.md`
- `albumoftheyear.org.json`

### Verification

- Desktop review: four equal album columns at 1440 × 900, square covers and aligned metadata.
- Mobile review: two album columns at 390 × 844 with no fingerprint collision or horizontal overflow.
- Mobile metrics: 390px page width, two 171px columns, 16px column gap, 24px row gap, 1:1 cover ratio.
- One legacy remote cover closed its connection; the explicit fallback preserved the card frame as intended.
- Automated repository check: `npm test`.

## Version 1.2 — Journal memory hierarchy

### Before

- Saved track notes existed in local rating history but Journal omitted them.
- The empty Journal explained how entries appear without offering a direct next action.
- A 180ms page-color transition could briefly pair a new module's foreground colors with the previous module's background.

### Decision

- Put the entry title and saved listening note before quiet artist metadata; keep date, event type and score in stable side columns.
- Constrain listening notes to a 560px reading measure.
- Add one typographic route action to the empty state instead of adding a container or decoration.
- Make module material changes immediate so Rate never passes through a light low-contrast frame.

### Evidence

- Music Memory gives a remembered listening moment more typographic weight than its date and place.
- The captured landing page uses a 430px body measure beside a larger display statement, showing that narrative focus can come from width and scale rather than another card.
- Browser checks at 390 × 844 confirmed all four audited routes had the correct path, heading, module material, return action and no horizontal overflow; the earlier repeated Import captures were a rapid-capture artifact.

### Rejected transfers

- The orange accent, rounded floating memory cards, shadows, phone mockup and waitlist composition do not belong to this archive.
- Taste, Import and the settled Rate layout were intentionally left unchanged because their hierarchy and responsive measurements already passed.

### Files

- `modules/journal/pages.js`
- `styles.css`
- `AGENTS.md`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `musicmemory.app.md`
- `musicmemory.app.json`

### Verification

- Desktop and mobile Journal review for the empty state, plus an isolated seeded render check for populated note hierarchy.
- Mobile route audit for Journal, Taste, Rate and Import at 390 × 844.
- Automated repository check: `npm test`.

## Version 1.3 — Mobile cascade discipline

### Before

- A late desktop Featured Shape declaration overrode an earlier mobile rule, leaving the 390px Home page 880px wide.
- The requested single-line featured title was protected with `white-space: nowrap`, but the surrounding three-column grid was not collapsed after the final desktop override.
- Typographic links often exposed only a 13–33px-high touch box on mobile; precise `−/+` controls and album title inputs also fell below the 40px interaction contract.

### Decision

- Restore a final one-column Featured Shape rule below 760px and set every grid child to a shrinkable width.
- Keep the song title on one line, scale it within the mobile range and use ellipsis only when a title cannot fit.
- Expand every mobile internal route link plus navigation, return, footer, precise rating and album title controls to 40px without adding fills, borders or pills.
- Add a static cascade-order check to the repository test so a later desktop declaration cannot silently reintroduce this overflow.

### Evidence

- A reachable-route browser crawl covered 140 routes at 1440 × 900 and again at 390 × 844.
- Before the fix, Home reported `scrollWidth: 880` at a 390px viewport; the Featured Shape visual began at x=416 and the score column ended at x=880.
- The other audited routes had matching route state, a visible heading, contextual return action and no document-level horizontal overflow.
- Inbox's 1px file input is intentionally visually hidden behind the local backup control and was not treated as clipping.

### Files

- `styles.css`
- `scripts/check-project.mjs`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`

### Verification

- Full reachable-route desktop and mobile crawl.
- Home viewport and component-boundary measurements at 390 × 844.
- Keyboard/touch target measurements for representative navigation and editorial links.
- Live return-navigation checks for Archive detail, Rate workspace, Taste child, Import child and top-level module paths.
- Automated repository check: `npm test`.

## Version 1.4 — Interaction state integrity

### Before

- Opening the mobile menu and choosing a route left the menu visibly open while the newly rendered toggle reported `aria-expanded="false"`.
- Escape did not close the mobile menu.
- Every visit to a track rating route added another global `pointerup` listener.
- Track precision buttons inherited the form's submit behavior, so a `−/+` adjustment could save a rating and append Journal history.
- Album waveform points advertised draggable slider semantics but had no pointer or keyboard behavior.
- Interactive chart parents used `role="img"`, which could flatten their slider descendants in an accessibility tree.

### Decision

- Reset menu state before every shell render, close it on Escape and return focus to the toggle.
- Manage window-level pointer events with one abortable controller that is replaced on every route bind.
- Declare every precision control as a labelled non-submit button so score adjustment and saving remain separate actions.
- Extract score clamping, keyboard steps and chart-coordinate projection into pure tested helpers.
- Support pointer drag, Arrow keys, Page Up/Down, Home and End on both Radar and Waveform nodes while preserving focus through chart re-rendering.
- Expose interactive charts as labelled groups and keep static charts as images.

### Evidence

- Before the fix, `/archive` showed `.menu-open` and a visible navigation while its toggle reported `false`.
- In the isolated test origin, Escape produced a closed menu, `aria-expanded="false"` and focus on the toggle; route selection closed the menu and focused `#app`.
- Radar keyboard input changed Song from 7.5 to 7.6; a pointer drag changed it from 7.5 to 10.5.
- Waveform keyboard input changed Track 01 from 7.6 to 7.7; a pointer drag changed it from 7.7 to 9.4.
- The interactive Landscape exposed one labelled group with six slider descendants across the 0–11 rating domain; pointer movement maps the deliberately magnified 5–11 visual band.
- A post-fix crawl rendered all 130 routes reachable in the isolated state at desktop and mobile sizes with no structural, menu-state or console failures.

### Files

- `modules/layout/shell.js`
- `modules/rating/interactions.js`
- `modules/rating/pages.js`
- `modules/rating/visuals.js`
- `styles.css`
- `scripts/check-project.mjs`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`

### Verification

- Mobile menu open, Escape, route selection and focus-state checks.
- Radar and Waveform keyboard and pointer interaction checks on an isolated localhost origin.
- Pure interaction-helper regression tests through `npm test`.
- Full reachable-route structural crawl after shared-shell changes.

## Version 1.5 — Static publishing integrity

### Before

- The modular application used root-absolute assets and internal links, so GitHub's `/how-i-hear-music/` project path could not load the new branch correctly.
- Switching assets to plain relative URLs made direct refreshes below the first route level resolve scripts from the wrong directory.
- The former single-page `/#archive` bookmark no longer entered the Archive module.
- Static Pages import failures exposed an HTML-to-JSON parsing message instead of the actual server boundary.
- Rate metadata inherited the archive red at a 1.33:1 contrast ratio against the olive studio.

### Decision

- Derive one deployment base from the loaded module URL and translate every shared route through it.
- Set the document asset base before loading the favicon, stylesheet or application module.
- Add a GitHub Pages `404.html` bridge that returns deep requests to the application entry and restores the requested logical route.
- Migrate legacy top-level module hashes with `history.replaceState` so bookmarks land on canonical modular URLs.
- Explain the static-server boundary when import endpoints return non-JSON content.
- Use a restrained light peach for small Rate metadata at 4.57:1 contrast while retaining the olive studio and the archive's darker red on paper.

### Evidence

- The deployed repository is a GitHub project site at `/how-i-hear-music/`; its production branch still served the pre-modular page before this version.
- A fresh local project-subpath origin loaded its stylesheet, favicon, data and module links from `/how-i-hear-music/` and recovered `/archive`, `/archive/tracks` and `/import/qq` without overflow.
- A mobile direct-route audit reproduced blank pages at `/archive/tracks`, `/taste/profile` and `/import/qq` before the dynamic asset base; all routes rendered after it.
- No external visual language was borrowed in this version; the contrast change follows the existing olive-and-peach Rate palette.

### Files

- `index.html`
- `404.html`
- `app.js`
- `modules/layout/paths.js`
- `modules/layout/shell.js`
- `modules/music/data.js`
- `modules/import/pages.js`
- `styles.css`
- `scripts/check-project.mjs`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`
- `README.md`

### Verification

- Root-origin legacy hash migration and direct nested-route refresh.
- Project-subpath route recovery, asset loading, internal-link base and static import boundary.
- Desktop 1440 × 900 and mobile 390 × 844 checks with zero document overflow.
- Automated routing, asset and interaction regression checks through `npm test`.
