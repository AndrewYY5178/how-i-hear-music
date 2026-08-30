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

## Version 2.1 — Analysis view refinement

Implementation commit: `ae79e88`

### Before

- Newly added analysis routes inherited the 108px subpage display ceiling, causing long headings to occupy up to three lines and nearly 300px before the page task appeared.
- Native select controls were visually close to other inputs but were absent from the shared font, focus and touch-action rules.
- Empty Taste Constellation evidence occupied one grid column, while Listening Portrait and Sonic Map annotations became optically too small when their 720-unit SVGs scaled to a mobile viewport.
- Comparison and analysis forms did not share a consistent readable control measure.

### Decision

- Preserve Home as the only 108px display-scale moment. Cap subpage displays at 80px and use a fluid 40–48px mobile range without adding a fifth typography level.
- Give version forms, comparison selectors, Sonic Map controls and analysis empty states the same 800px working measure. Bound large visual fields at 960px so they retain gravity without stretching to arbitrary widths.
- Include native selects in the shared type, keyboard-focus and touch-action contract.
- Let an empty constellation span its full two-column composition, then increase mobile SVG annotation units so the scaled label remains readable.

### Evidence

- Eleven representative routes were measured at 1440 × 1000 and 390 × 844 for 22 local renders. Every render returned zero horizontal overflow.
- The tallest audited desktop subpage heading fell from about 295px to 146px; the tallest mobile heading fell from 204px to 128px. Home retained its original 108px desktop and 56px mobile display sizes.
- The empty Taste Constellation measured the intended 800px desktop width and the full 358px mobile content width.
- Listening Portrait annotations resolved to 10 SVG units on desktop and 16 on mobile; visible non-range controls retained the 40px target contract.
- No online visual reference was borrowed. Cards, shadows, extra labels, decorative icons and new colors were rejected because the defects were solved through scale, measure, focus and alignment.

### Files

- `styles.css`
- `TODO.md`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`

### Verification

- Automated project validation through `npm test` and whitespace validation through `git diff --check`.
- Browser measurement of Home, Archive, Track detail, Track Rate, Taste, Sonic Map, Taste Constellation, Listening Portrait, QQ Album Import, Journal and Year in Music at desktop and mobile viewports.

## Version 3.0 — Connected advanced Taste system

Implementation commit: `21e0af2`

### Before

- Ratings, Why This Works, Sonic Map, version history and Journal evidence existed, but the site did not yet express their recurring relationships as a stable aesthetic model.
- Taste analysis described preferences and boundaries without distinguishing an established trait from a nearby area the archive had barely explored.
- Journal was chronological only; important memories had no spatial/manual organization, and breadth versus concentration had no time-based reading.
- Track Radar, Album Waveform and Listening Portrait shared a visual mood but not reusable entity-level geometry primitives.

### Decision

- Build one evidence pipeline rather than five parallel features. Taste DNA, Blind Spots, Entropy, Memory Palace and Geometry all read the current canonical/local tracks, rating sessions, Journal, explicit insight tags, saved Sonic descriptors and confirmed versions.
- Require five supporting tracks before publishing a Taste DNA trait. Strength blends saved Overall response, archive-baseline lift and consistency; confidence explicitly includes evidence count, consistency and recency. Human Imperfection remains dependent on manually saved vocal-texture and loose-character evidence.
- Generate Blind Spots only beside a published DNA trait or a repeated high-rated artist whose albums remain unrated. Copy describes exploration gaps, not predicted enjoyment. Reliable Sonic, era, language and artist-network gaps remain absent instead of being inferred.
- Begin Archive Entropy after three dated track ratings. Derive cumulative quarterly artist concentration, trait diversity, era spread, album depth and exploration rate; show one neutral line and a plain-language directional sentence.
- Store manual Memory Palace entries separately with entity, zone, note, date, importance and provenance. Merge them non-destructively with growers, confirmed moments, imported discoveries and reinterpretations derived from existing evidence.
- Establish Track Glyph, Album Terrain, Artist Signature and Taste Trait Mark as reusable SVG/typographic primitives. Archive indexes receive only their corresponding compact geometry, and Listening Portrait reuses the same point and terrain functions.

### Evidence

- The canonical archive produced two qualifying DNA traits without seeded local tags: Vocal Interpretation from eight tracks and Production Curiosity from six. Every weaker trait remained hidden below the five-track threshold.
- Blind Spot analysis exposed two album-depth gaps from repeated high-rated tracks and no completed album rating; it returned no Sonic or era claims without reliable supporting metadata.
- A manual Personal Canon memory was added on mobile, rendered in the intended zone, opened as a compact detail and was removed again without affecting the underlying Track.
- Archive Entropy remained empty below three dated Track ratings, then produced one 2026 Q3 baseline with five supporting metrics after the third saved rating.
- Archive rendered 41 Track Glyphs, 13 evidence-aware Album Terrain baselines and seven Artist Signatures. Track detail matched two recurring traits for a qualifying record; Listening Portrait reused glyph, terrain and artist-signature geometry.
- Eleven representative routes were measured at 1440 × 1000, 768 × 900 and 390 × 844. All 33 renders retained a contextual return action, zero horizontal overflow, 40px visible non-range controls and zero console errors.
- No online visual reference was borrowed. Literal DNA helices, palace illustrations, 3D rooms, recommendation feeds, genre percentages, KPI cards, traffic-light colors, particles, glow and dashboard grids were rejected because they weaken the existing editorial evidence hierarchy.

### Files

- `app.js`
- `modules/archive/pages.js`
- `modules/import/pages.js`
- `modules/journal/pages.js`
- `modules/taste/pages.js`
- `modules/music/taste-dna.js`
- `modules/music/entropy.js`
- `modules/music/memory.js`
- `modules/music/geometry.js`
- `modules/music/portrait.js`
- `scripts/check-project.mjs`
- `styles.css`
- `README.md`
- `TODO.md`
- `DESIGN_SYSTEM.md`
- `DESIGN_LOG.md`

### Verification

- Syntax validation for every new and changed module, automated project validation through `npm test`, and whitespace validation through `git diff --check`.
- Browser checks for DNA evidence, Blind Spot output and empty state, Memory Palace add/remove, Entropy evidence gate and populated baseline, Track DNA activation, geometry counts, back navigation, touch targets, responsive overflow and console errors.

## Version 3.1 — Reliability and evidence closure

Implementation commit: `f720387`

### Before

- The static GitHub Pages build exposed live-import controls before explaining that no metadata adapter was connected; the adapter had no hosted-base configuration, CORS boundary, request limit or response cache.
- Personal records were browser-local but backup lived at the bottom of Inbox, did not include every manual correction, had no migration/recovery layer and did not warn that exported JSON was readable text.
- Archive retrieval stopped at a track-title filter. Missing album/date/language/region metadata had no coverage report or owner correction path.
- Taste DNA published aggregate strength without showing its contributing or limiting records. Entropy hid its current evidence count, Memory importance did not affect order, and mistaken saves were difficult to reverse.
- Compact geometry was visually accessible through SVG labels but did not expose an adjacent numeric reading in scanning views.

### Decision

- Keep the six module identities unchanged. Add Search as a header utility and mobile menu item, Metadata as an Archive subsection, and Data Desk as an Import subsection instead of creating another top-level product module.
- Put a plain service-status line before every Import task. Read a hosted adapter base only from explicit page configuration; keep the default Pages build disconnected. Add exact-origin CORS, per-address request limits, short-lived metadata cache, upstream timeout preservation and baseline security headers to the Node adapter.
- Treat local durability as a recovery system rather than pretending it is account sync: schema migration, before-change snapshots, complete versioned export, merge restore, backup reminders, browser persistence request and an explicit plaintext warning.
- Keep metadata unknown until owner-confirmed. Show field-by-field coverage, store corrections as an overlay with a source note and confirmation time, and include that overlay in backup and recovery.
- Make analytical claims inspectable. DNA exposes contributing and below-baseline limiting evidence; Entropy names sample size and available dimensions; Memory sorts by importance and shows provenance; rating/album saves gain immediate undo while Journal removal requires a second confirmation.
- Preserve existing Radar, Terrain and Signature drawings. Add quiet numeric text beneath compact Track and Album geometry rather than adding legends, badges, cards or new decoration.

### Evidence

- `npm test` now runs the existing project audit, core tests for migration/metadata/backup/recovery, and render smoke tests for ten reliability, retrieval and analysis routes.
- Metadata date validation rejects non-ISO-like values; backup version 2 restores version 1 or 2 payloads and includes metadata overlays; recovery retains the 20 latest before-change values.
- Static Import status is decided before network interaction, Search indexes six local evidence domains, and mobile Search remains reachable inside the existing menu.
- Automated checks and `git diff --check` passed. A real browser was requested for desktop/tablet/mobile visual QA, but no controllable browser instance was available in this environment; that verification remains explicitly open in `TODO.md`.
- No online visual reference was borrowed for this pass. Cloud accounts, decorative dashboards, recommendation feeds, encrypted-vault claims, inferred metadata and a seventh top-level module were rejected because they either require external authority or weaken the existing editorial hierarchy.

### Files

- `app.js`, `index.html`, `styles.css`
- `modules/archive/pages.js`, `modules/import/pages.js`, `modules/journal/pages.js`, `modules/rating/pages.js`, `modules/search/pages.js`, `modules/taste/pages.js`
- `modules/music/data.js`, `modules/music/metadata.js`, `modules/music/resilience.js`, `modules/music/taste-dna.js`
- `server.mjs`, `scripts/test-core.mjs`, `scripts/test-render.mjs`, `package.json`
- `README.md`, `TERMS.md`, `TODO.md`, `DESIGN_LOG.md`

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Browser QA deferred only because the browser control surface reported no available browser.

## Version 3.2 — Durable local archive and delivery closure

Implementation commit: `7248513`

### Before

- Data Desk exports were readable JSON only, browser quota was invisible, and Inbox duplicated a smaller backup interface with fewer privacy cues.
- Journal history could be removed but not corrected. Album notes were a placeholder, metadata provenance lacked a resolvable source, and playlist source labels could not be maintained.
- Blind Spots described trait and album depth only even when the owner had supplied enough language, date or Sonic evidence for a cautious coverage reading.
- The static archive had no offline shell, install metadata, explicit update state or route-level canonical metadata. The adapter exposed no health/version contract and trusted only the direct socket address without documenting proxy behavior.

### Decision

- Keep local-first storage and make its limits legible. Plain JSON remains available; optional password export uses PBKDF2-SHA256 with 250,000 iterations and AES-GCM. Data Desk owns backup, restore, recovery, persistence and quota status so Inbox has one clear route to it.
- Treat Journal correction as editing one historical snapshot, never the current rating or canonical record. Preserve correction time and revision count. Add private Album Notes as local searchable evidence included in backup.
- Extend metadata provenance with a complete HTTPS source URL, evidence note and exact local revision time. Keep unknown values unknown and provide a missing-only queue.
- Allow local playlist source renaming, refresh and removal while explicitly retaining every imported track, rating and note.
- Publish language and era concentration only when at least ten scored records and 60% coverage are available, with a 70% dominant group. Publish a Sonic quadrant gap only after eight explicit placements and a materially concentrated quadrant. Frame every output as archive coverage, not predicted quality.
- Precache the complete first-party application graph and built-in data, but exclude metadata APIs and health responses. Require user confirmation before activating an updated worker.
- Add request IDs, structured logs, bounded cache/rate-window cleanup, health/version endpoints and an opt-in `TRUST_PROXY=1` boundary. Replace the inline-script CSP exception with a fixed script hash.

### Evidence

- Core tests cover Journal revision, invalid score rejection, Album Note backup inclusion, AES-GCM round-trip and wrong-password rejection, plus synthetic language, era and Sonic evidence gates.
- Static checks require explicit button types, image alternatives, safe external links, reduced-motion handling, offline API exclusion, the full module graph in the shell, install/crawler assets and adapter resilience contracts.
- Eleven representative route renders pass without browser APIs. `npm test`, `node --check server.mjs` and `git diff --check` pass.
- Local HTTP verification returned `200` for `/healthz`, the Service Worker and a clean SPA deep link. HTML and Service Worker responses use `Cache-Control: no-cache`; structured logs include request IDs, status and duration.
- A controllable browser was requested twice, but the environment reported no browser instance. Desktop/tablet/mobile visual measurement remains open rather than being represented as complete.
- No online visual reference was borrowed in this pass. The paper palette, six module backgrounds, typography, geometry and zero-radius/no-shadow rules remain intentionally unchanged. New cards, badges, decorative icons, cloud-account claims and automatic metadata inference were rejected because they do not solve the identified reliability problems.

### Files

- `app.js`, `index.html`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `sw.js`, `styles.css`
- `modules/archive/pages.js`, `modules/import/pages.js`, `modules/journal/pages.js`, `modules/search/pages.js`, `modules/taste/pages.js`
- `modules/music/journal.js`, `modules/music/metadata.js`, `modules/music/notes.js`, `modules/music/resilience.js`, `modules/music/taste-dna.js`
- `server.mjs`, `scripts/check-project.mjs`, `scripts/test-core.mjs`, `scripts/test-render.mjs`
- `README.md`, `TERMS.md`, `TODO.md`, `DESIGN_LOG.md`

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Local HTTP headers and health endpoint checked against the running Node adapter.
- Real browser QA remains deferred only because the browser control surface reported no available browser.

## Version 3.3 — Archive data integrity

Implementation commit: `1702ec8`

### Before

- Album rating created six placeholder tracks with preset scores when no ordered track list existed. Invalid rating URLs silently fell back to the first Track or Album.
- Album track scores remained inside an album draft/Journal snapshot and did not become the current Track Overall ratings used by Archive and Taste.
- Journal correction allowed display identity to diverge from its retained Track ID. Metadata used one record-level source, and saving a form could duplicate unchanged canonical values as local overrides.
- Backup restore changed data immediately without a conflict preview or one-step full rollback. Neutral Sonic coordinates were counted as Cold/Sparse.
- The active and installing Service Workers shared one cache, cleanup was not scoped to this project, and the adapter version/User-Agent/host configuration could drift.

### Decision

- Require a confirmed ordered Track list before Album rating. Missing or invalid entities render a non-saving state. Require all Track dimensions and every Album track Overall to pass the 0–11 domain validator.
- On Album completion, write each confirmed track's Overall into the shared current rating store and update lifecycle in the same save flow. Keep one undo path for current ratings, album draft and Journal.
- Lock Journal identity during ordinary historical correction. Store Metadata as per-field evidence with optional override value, HTTPS source, note and timestamp; unchanged canonical values remain canonical.
- Preview backup groups/conflicts and let the owner choose local- or backup-wins. Capture every affected raw value, backup reminder and recovery list before restore so one full rollback is exact.
- Normalize common language aliases and exclude coordinates inside a ±0.2 Sonic dead zone from quadrant claims.
- Use a release-specific offline cache, delete only caches with the project prefix and serve installed assets cache-first until an explicitly accepted worker update. Read adapter version from `package.json`, expose `HOST`, and use the same version in outbound identity.
- Move the deployment-base script into a first-party file so both Node and static Pages can use a strict `script-src 'self'` policy. Add a static referrer policy and update route-level Open Graph/Twitter text at runtime.

### Evidence

- Automated checks reject placeholder album rows, first-record route fallbacks, unversioned/unscoped caches, stale adapter identity, missing static CSP and partial individual Track ratings.
- Core tests cover Album-to-Track persistence, duplicate/missing Track ID rejection, field-level Metadata provenance, immutable Journal identity, backup conflict preview, full rollback, encrypted backup and neutral Sonic handling.
- Render checks confirm invalid Track/Album pages cannot expose a save form and a canonical Album without track order shows the explicit import requirement.
- `npm test`, `node --check server.mjs` and `git diff --check` pass. Local HTTP verification returned version `0.3.0` from `/api/version` and `/healthz`, with the strict CSP and no-referrer response boundary.
- A real browser connection was attempted after starting the local server, but the environment again reported zero available browsers. Responsive visual measurement remains open in `TODO.md`.
- The six module identities, paper texture, palette, typography and established geometry were intentionally unchanged. No new cards, decoration, shadows or inferred music metadata were introduced.

### Remaining evidence boundaries

- The 41 canonical Tracks still have zero confirmed Album, release-date, language and region coverage. Those facts require source-backed curation rather than invention.
- Hosted metadata import still requires an owner-selected HTTPS runtime and credentials/configuration. Production `main` remains unchanged until explicit publication approval.
- Crawlable static route snapshots, a raster social image and CSS cascade consolidation remain open because they need a deployment/build decision or a real visual baseline.

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Local `/`, `/api/version` and `/healthz` HTTP response verification.
- Browser QA deferred only because no browser instance was available.
