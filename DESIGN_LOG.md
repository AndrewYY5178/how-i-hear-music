# How I Hear Music — Design Log

Append one entry for every visual version. Never rewrite an earlier entry; corrections become a new version.

| Version | Date | Scope | Reference | Commit |
| --- | --- | --- | --- | --- |
| 1.1 | 2026-08-29 | Album catalog rhythm, interaction and motion standard | Album of the Year; Music Memory; The Listening Log content model | `Add UI design versioning baseline` |
| 1.2 | 2026-08-29 | Journal reading hierarchy and module color stability | Music Memory | `Standardize journal reading hierarchy` |
| 1.3 | 2026-08-29 | Home mobile cascade and touch-target regression | Repository route audit | `Fix Home mobile cascade` |
| 1.4 | 2026-08-29 | Navigation state and rating interaction integrity | Interaction audit | `Complete rating interaction states` |
| 1.5 | 2026-08-29 | Static publishing routes and Rate metadata contrast | Repository and deployment audit | `Harden GitHub Pages routing` |
| 1.6 | 2026-08-30 | Production route, disclosure and tablet integrity | Production browser audit | `Polish production route details` |

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

## Version 1.6 — Production route detail integrity

### Before

- Disclosure summaries looked like full-width rows, but their native clickable box was only 13px high on mobile.
- Album detail browser titles exposed percent-encoded URL segments; track detail titles exposed canonical internal IDs.
- At 768px, a late desktop Featured Shape declaration overrode the earlier tablet rule and pushed the score column 120px beyond the viewport.

### Decision

- Move disclosure spacing into a 40px summary row so the visual row and actual interaction target agree.
- Set the final document title from the rendered page heading, retaining `Home` for the root route.
- Reinstate a final 761–1024px Featured Shape grid with shrinkable copy, visual and score columns.
- Extend the automated cascade and interaction checks to cover the tablet grid, disclosure target and editorial title contract.

### Evidence

- A recursive production crawl reached 130 routes at 1440 × 900 and 390 × 844 with no structural errors, missing returns, visible broken images, horizontal overflow or console warnings.
- The same mobile crawl found the 13px disclosure target consistently across 55 album and track detail routes.
- At 768 × 1024, nine representative routes passed; Home alone reported a 120px overflow, with the score column beginning at the page's right edge.
- After the fix, the three Home columns measured approximately 228 / 284 / 128px within the 720px content width, with 40px gaps and zero overflow.
- No external visual language was introduced; this version only reconciles existing layout and interaction rules with production behavior.

### Files

- `app.js`
- `modules/layout/shell.js`
- `styles.css`
- `scripts/check-project.mjs`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`

### Verification

- Full production crawl of 130 reachable routes on desktop and mobile.
- Local album and track detail checks for 40px summaries and human-readable browser titles.
- Local 768px Home grid measurement and visual review.
- Automated regression checks through `npm test`.

## Version 1.7 — Listening evidence lifecycle

Implementation commit: `d0a959a`

### Before

- Imported records had matching states but no listening lifecycle, and `KEEP` moved them straight into the personal Library.
- Rate could save generic tags and a visible long note, but it could not capture a concise reason or confirmed musical moment.
- Journal was chronological only; it did not summarize a year or distinguish absent evidence from a zero-valued result.

### Decision

- Separate match confidence from a four-step listening lifecycle: Imported, Heard, Rated and Archived. Preserve the record ID when it is explicitly archived so its rating history stays connected.
- Add an Unrated Queue inside Rate, with heard records before newly imported records.
- Replace generic tags with eight music-specific listening reasons. Reveal required timestamp and observation fields only for `ONE MOMENT`, and collapse the long private note by default.
- Generate Year in Music from saved Journal evidence only. Use ruled editorial rows and a single dominant average numeral rather than dashboard cards, badges or decorative charts.
- Retain the full local Journal timeline instead of truncating it to 80 entries, so later annual summaries can use the evidence the site has accumulated.
- Define change metrics transparently: first-to-latest Overall for grower/disappointment, first rated non-Archive import for new discovery, and the absolute gap between Overall and the other three dimensions' mean for the strangest rating.

### Evidence

- The existing local browser archive contained 199 imported records; the revised Inbox and Queue classified them as Imported without moving them to Archive.
- An isolated browser origin saved `ONE MOMENT` with `2:47 — the harmony enters`; Journal rendered the reason and moment, and the annual view counted it without inventing other metrics.
- At 390 × 844, the annual view and empty Queue had zero horizontal overflow. Desktop Inbox at 1280px also had zero horizontal overflow.
- No online visual reference was borrowed for this version. The work extends the repository's existing olive studio, Journal paper, typographic ratings and 1px editorial rules.

### Files

- `app.js`
- `modules/music/lifecycle.js`
- `modules/import/pages.js`
- `modules/rating/pages.js`
- `modules/journal/pages.js`
- `styles.css`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`

### Verification

- Syntax checks for all changed JavaScript modules.
- Automated project validation through `npm test`.
- Browser interaction check for reason selection, conditional moment fields, save, Journal rendering and Year in Music aggregation.
- Desktop Inbox and mobile Year/Queue overflow checks; no console warnings or errors.

## Version 1.8 — Ordered QQ Music album import

Implementation commit: `e096c4a`

### Before

- QQ Music import accepted public playlists and individual catalog results, but explicitly rejected album links.
- Archive album pages could only filter already-confirmed canonical tracks; their order was not backed by an album entity from the provider.
- Rate Album opened a six-row placeholder draft when no manual sequence existed.

### Decision

- Give ordered album import its own QQ subroute so playlist review, single-track search and album ingestion retain separate tasks and densities.
- Normalize QQ's provider-specific `cdIdx` and `belongCD` fields into Disc and Track numbers inside a server-only adapter, then sort by Disc, Track and original response position.
- Preview the entire sequence and duplicate analysis before one local Album package is written. Keep the Album, canonical local IDs, ordered Tracks, provider mappings and import log together so the browser does not retain a half-created album.
- Render all imported tracks in Archive before they are rated, but keep the Listening Landscape empty until track scores or a completed album session exist.
- Preserve the existing asset boundary by deliberately discarding provider artwork; canonical/manual HTTPS cover references remain the only cover paths.

### Evidence

- QQ Music's public album response returned `Sweetener` with 15 tracks; `belongCD` supplied Track 01–15 and `cdIdx` supplied the zero-based disc index.
- The live adapter smoke check confirmed 15 readable ordered album tracks alongside the existing 38-track QQ playlist and 200-track NetEase fixtures.
- In an isolated browser origin, a full share sentence resolved to a 15-track preview, imported once, opened every track in Archive and initialized Rate Album with 15 controls.
- Pasting the same provider album again produced `ALBUM ALREADY EXISTS`, 15 existing tracks and no second import action. A playlist URL returned the explicit “playlist, not an album” error.
- At 390 × 844 the full preview had no horizontal overflow; desktop Archive also had no overflow or console warnings.
- No external visual reference was borrowed. The new page reuses the Import module's existing paper, editorial rules, type roles and zero-radius controls.

### Files

- `server/providers/qqmusic-album.mjs`
- `server.mjs`
- `modules/music/album-import.js`
- `modules/music/data.js`
- `modules/import/pages.js`
- `modules/archive/pages.js`
- `modules/rating/pages.js`
- `modules/rating/visuals.js`
- `data/library.json`
- `app.js`
- `styles.css`
- `scripts/check-project.mjs`
- `scripts/check-adapters.mjs`
- `README.md`
- `ASSET_POLICY.md`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`

### Verification

- Syntax checks for every changed JavaScript module and `npm test`.
- Live `npm run check:adapters` against QQ playlist, QQ album and NetEase playlist metadata.
- End-to-end browser test for detection, complete preview, import, Archive detail, imported Track detail, Rate Album initialization, duplicate prevention and resource-type rejection.
- Desktop and 390 × 844 overflow checks with no console warnings or errors.

## Version 1.9 — Evidence-gated comparisons

Implementation commit: `00eb7a2`

### Before

- Track detail reserved a Versions disclosure but could not record an alternate recording or rate it independently.
- Album pages exposed individual landscapes but offered no disciplined way to read two records against the same evidence.
- The remaining TODO language still treated ordered album sequences as unavailable after UI 1.8 had added them.

### Decision

- Let the owner explicitly create a local recording version from Track detail by choosing Studio, Live, Acoustic, Remastered or Other and supplying an identifying label. Never derive a version from title punctuation or provider text.
- Give every confirmed version its own canonical local ID, rating session, Journal history and Radar, then align related recordings in a ruled two-column comparison without badges or added decoration.
- Add an Album comparison route from the existing Albums header. Admit only albums with a confirmed ordered sequence or album-level score; compare Overall, scored-track Waveform, Track count and Rated count, preserving absent values as `—`.
- Keep both comparison layouts inside Archive's existing catalog material. Desktop uses equal columns and shared baselines; mobile changes reading priority to full-width sequential sections instead of compressing charts.
- Include local version records in the existing backup/restore boundary.

### Evidence

- An isolated browser origin created `Live at Test Hall` as an explicit Live version of a canonical track, opened its independent Rate workspace, saved a four-dimension rating and returned a two-record Radar comparison.
- A separate local application origin imported QQ Music's 15-track `Sweetener` and one-track `纯妹妹`; Album comparison exposed two selectors, two aligned evidence columns, Track counts of 15 and 1, and no invented scores.
- With no qualifying albums, the route rendered `NOT ENOUGH EVIDENCE` instead of selecting arbitrary Archive records.
- At 390 × 844, both comparison views measured zero horizontal overflow; version and album columns reprioritized to the full 358px content width. Browser console checks returned no errors.
- No online visual reference was borrowed for this release. The work follows the existing paper, rules, typography and chart language; cards, pills, shadows and decorative icons were rejected as unnecessary.

### Files

- `app.js`
- `modules/archive/pages.js`
- `modules/import/pages.js`
- `modules/music/data.js`
- `modules/music/versions.js`
- `styles.css`
- `scripts/check-project.mjs`
- `README.md`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`

### Verification

- Syntax checks for all changed modules and automated validation through `npm test`.
- Browser interaction test for explicit version creation, independent rating save and related-version comparison.
- Browser interaction test for two real QQ ordered album imports and the populated Album comparison route.
- Empty-evidence, desktop overflow, 390 × 844 responsive and console-error checks.

## Version 2.0 — Personal listening analysis

Implementation commit: `602487d`

### Before

- Rating could capture eight broad reasons, but they were not a stable shared vocabulary for Taste analytics, annual awards or boundary analysis.
- Journal preserved history but did not actively return old ratings to the listener.
- Version comparison displayed several independent Radars at once instead of expressing the change from one recording to another.
- Track character, manual cross-artist relationships and annual visual synthesis had no data boundary or dedicated view.
- Album waveform geometry remained visual only and annual categories were fixed statistics rather than owner-confirmed personal awards.

### Decision

- Separate Quality, Character and Personal Relationship in storage and presentation. Scores remain four dimensions; Listening Temperature receives four bipolar values; insight tags, notes, moments and history remain relationship evidence.
- Normalize old reasons at read time into ten explicit `Why This Works` tags. Preserve the original records and never infer a new tag.
- Keep the current rating in the existing session store and preserve every save in Journal. Rediscovery selects the oldest latest-rating that is at least six months old; a skip returns after seven days.
- Replace the static multi-Radar version grid with one owner-controlled `FROM → TO` Radar morph and an aligned dimension-delta table. Add Rearranged, Demo and Remix to the explicit version vocabulary.
- Generate Album Narrative with deterministic range, deviation, peak-position and section-average rules only when the complete ordered sequence is scored.
- Add Listening Temperature editing to Track detail and expose two selectable axes at a time in Sonic Map. No axis direction implies quality.
- Add manually curated Taste Constellation branches that allow repeated artist or track membership without creating a genre taxonomy.
- Add evidence-gated boundary patterns only when at least three tracks share the same quantitative score relationship.
- Add eight annual award categories with suggested candidates, manual confirmation and `NO SELECTION`; unconfirmed suggestions never appear as winners.
- Compose all-time and annual Listening Portraits from a bounded sample of existing Radars and Waveforms. Use the site's existing paper, red linework and mono annotations without new dashboard containers.

### Evidence

- A clean browser origin saved four simultaneous `Why This Works` reasons; a separate 11-point rating produced `100% MELODY` and `100% SURPRISE` from one explicitly tagged 9+ track.
- Listening Temperature saved locally and produced a point on Sonic Map; changing both axes updated the route query without horizontal overflow.
- Taste Constellation stored Ariana Grande and 陶喆 in the same manually named Harmony-heavy branch while preserving the ability to reuse either artist elsewhere.
- An Acoustic version saved its independent rating, then Version Morph reported Song `10 → 7.5`, Vocal `10 → 7.5`, Production `8 → 7.5` and Overall `11 → 7.5`; the SVG contained one timed shape animation and no console errors.
- Completing a six-track album session generated the neutral sentence “The rating shape follows a gently changing course, with the strongest rise near the middle.”
- The 2026 annual page exposed all eight award selectors, saved a manual selection and linked to a generated annual Listening Portrait. Empty categories retained `NO SELECTION`.
- A fresh-origin crawl covered 13 representative routes at desktop and 390 × 844: 26 route renders had no overflow, missing heading, missing return action or console error.
- No online visual reference was borrowed for this release. Dashboard cards, auto-generated genre claims, trophy graphics, bright gradients and multi-Radar overlays were explicitly rejected because they would blur the existing editorial evidence hierarchy.

### Files

- `app.js`
- `modules/archive/pages.js`
- `modules/import/pages.js`
- `modules/journal/pages.js`
- `modules/rating/pages.js`
- `modules/rating/visuals.js`
- `modules/taste/pages.js`
- `modules/music/album-narrative.js`
- `modules/music/analysis.js`
- `modules/music/groups.js`
- `modules/music/insights.js`
- `modules/music/portrait.js`
- `modules/music/sonic.js`
- `modules/music/data.js`
- `modules/music/versions.js`
- `styles.css`
- `scripts/check-project.mjs`
- `README.md`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`
- `TODO.md`

### Verification

- Syntax validation for all application and music-analysis modules; automated project validation through `npm test`.
- Browser interaction checks for tag selection, sonic descriptor save, axis changes, manual constellation creation, version creation/rating/morph, album completion/narrative, annual award confirmation and both portrait routes.
- Fresh-origin desktop and 390 × 844 route crawl across Home, Track, Album, Rate, Journal, Year, annual Portrait and all new Taste analysis views.
- Final console-error and horizontal-overflow checks returned zero failures.
