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

## Version 3.3.1 — GitHub Pages project-path repair

Implementation commit: `deec2bd`

### Before

- The initial document set `<base href="/">` before loading relative first-party scripts. On a GitHub Pages project site this resolved `./base.js` and `./app.js` to the domain root rather than `/how-i-hear-music/`, producing 404 script requests and a blank routed application.

### Decision

- Use the document-relative initial base, `<base href="./">`. It resolves all first-party assets within the current project directory on Pages while retaining root-relative behaviour for the local Node preview. Runtime `base.js` still establishes the explicit deployment base for generated application links.

### Evidence

- Before the change, the public root script URLs returned HTTP 404 while `https://andrewyy5178.github.io/how-i-hear-music/base.js` and `/app.js` returned HTTP 200.
- This is a routing/resource-resolution repair only: the editorial palette, typography, component hierarchy, content and module structure are intentionally unchanged.

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Public Pages asset and deep-link response checks after deployment.

## Version 3.4 — Bilingual editorial access and save feedback

Implementation commit: `eb3c08a`

### Before

- The site exposed only English interface copy, making dense Rate, Import and Taste instructions difficult for the owner to use independently.
- The primary actions in the two Rate choices and two Import choices sat too close to their explanatory copy.
- Track rating saves wrote local data but returned only an unstructured message below the workspace. The message did not receive focus, so keyboard and screen-reader users could miss it.
- A local deep link could serve the root document below the route path, causing relative assets to resolve under that path and leave the page blank.

### Decision

- Add one persistent English / Simplified Chinese switch to both desktop and mobile navigation. Translate the live DOM rather than rerendering the route so unsaved form values, selected reasons and chart state survive a language change.
- Keep artist, track and album names untouched. Translate interface text, dynamic status messages, placeholders, titles and accessible labels; update `html[lang]` so assistive technology and typography receive the correct language.
- Pair Noto Serif SC with Chinese display/body copy and Noto Sans SC with navigation/metadata. This preserves the existing Libre Baskerville / DM Mono hierarchy without importing a new visual identity. Adjust only Chinese line-height and tracking where Latin settings would compress the glyphs.
- Use the existing 24px spacing token between explanatory text and the Rate/Import actions. Render saved-rating confirmation as a square, 1px-rule status panel with 24px padding, focus it after save and retain the existing view/undo actions.
- Redirect local extensionless deep links once through `/?route=...`, allowing the root document to establish the correct asset base before restoring the intended route.

### Evidence

- Desktop browser checks covered Home, Archive, Rate, Taste, Import and Journal in Chinese, then switched Journal to English and back without navigation. Every root reported zero horizontal overflow.
- Mobile checks at 390 × 844 confirmed the language control remains visible, both Rate and both Import actions have 24px top spacing, Noto Serif SC and Noto Sans SC are applied to their intended roles, and neither module overflows.
- Saving a Track rating produced a visible Chinese confirmation, `role="status"`, `aria-live="polite"`, a 1px border, 24px padding and programmatic focus. The view and undo actions remained available.
- Automated translation checks cover fixed text, dynamic queue counts, uppercase chart labels, accessible score controls, preserved proper names and the English fallback. `npm test`, `node --check server.mjs` and `git diff --check` pass.
- No outside design language was borrowed. The six module backgrounds, paper grain, palette, typography roles, chart geometry, square corners and no-shadow rule remain intentionally unchanged. No new feature section, decorative icon, card or badge was added.

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Real desktop and 390 × 844 browser interaction checks.

## Version 3.4.1 — Chinese editorial voice

Implementation commit: `6f70afe`

### Before

- The first Chinese release was complete enough to operate but followed English syntax too closely. Phrases such as “一次个人回应”, “让音乐依次通过工作台” and “人的声音应当保持人的存在” read like translated interface copy rather than this archive's own voice.
- Several evidence-heavy views still exposed English fragments inside dynamic summaries, empty states, Memory zones, Taste DNA explanations and Year in Music awards.

### Decision

- Rewrite by page purpose rather than sentence structure. Home remains spare and lyrical; Archive stays factual; Rate speaks in short listening actions; Import explains consequences directly; Taste uses a personal first-person voice; Journal reads as memory rather than system administration.
- Prefer idiomatic lines such as “先听，再作出判断”, “人声不该失去人的痕迹”, “给整份档案留一份退路” and “一路听来，什么变了”. Keep technical names only where the concept itself depends on them, including Taste DNA and Archive Entropy.
- Localize dynamic counts, evidence summaries, annual awards, recovery states and Memory zones. Preserve recorded artist, Track and Album names in their original language.
- Keep the UI 3.4 Chinese font pairing and every existing layout, palette, spacing and component decision unchanged.

### Evidence

- A real-browser crawl covered 33 module and submodule routes, including Track Rate, metadata coverage, Album comparison, all Taste analysis views, Import/Data Desk, Memory Palace, Archive Entropy, Year in Music and annual Listening Portrait.
- Residual-English checks exclude only recorded proper names. Follow-up inspection cleared the remaining Taste DNA method, Memory zone and annual-award strings.
- The 2026 Year in Music view was repeated at 390 × 844 with the mobile language control visible and zero horizontal overflow.
- Automated checks cover natural-language examples, dynamic queue counts, annual headings, Taste DNA evidence summaries, accessible controls and unchanged artist names. `npm test`, `node --check server.mjs` and `git diff --check` pass.

### Intentionally unchanged

- English remains the canonical content source so switching back restores the original wording without rerendering or losing form state.
- Music titles, album titles and artist names remain as recorded. The established Noto Serif SC / Noto Sans SC pairing, module backgrounds, paper grain and geometry remain unchanged.

## Version 3.4.2 — Chinese heading punctuation

Implementation commit: `2b42395`

### Decision

- Treat punctuation according to typographic role rather than editing shared translations. When Chinese is active, a final `。` is removed from text inside H1–H3, including text nested in emphasis elements; the same translated sentence keeps its full stop when used as body copy.
- Preserve question marks and other punctuation that materially carries the title's voice.

### Evidence

- Browser checks across Home, Archive, Rate, Taste, Import, Journal, Taste Philosophy and Year in Music found no H1–H3 ending in `。`.
- Home's nested display heading now reads “我如何 / 听见音乐” while its hero statement and manifesto retain complete sentence punctuation. All checked pages remained free of horizontal overflow.
- Automated tests distinguish heading and body formatting and confirm that a question-title keeps its `？`. `npm test`, `node --check server.mjs` and `git diff --check` pass.

### Intentionally unchanged

- English punctuation, Chinese body punctuation, question titles, typography, spacing and page composition are unchanged.

## Version 3.4.3 — Fresh offline release assets

Implementation commit: `4e6ece6`

### Before

- Production contained the new punctuation code, but a newly installed versioned Service Worker could repopulate its cache from the browser's still-fresh HTTP cache. Accepting “重新载入更新” could therefore continue to show the previous script for several minutes.

### Decision

- During release installation, request every first-party shell asset with `cache: "reload"` before placing it in the versioned Cache Storage entry. Runtime behavior remains cache-first, and metadata API responses remain excluded.

### Evidence

- The published source was confirmed at version 0.4.2 while an existing controlled tab reproduced the stale 0.4.1 heading, isolating the problem to installation fetch caching rather than Pages deployment.
- Static checks now require the reload request contract. The release cache advances to 0.4.3; `npm test`, `node --check server.mjs` and `git diff --check` pass.

## Version 3.4.4 — Bilingual masthead fit

Implementation commit: `fc76c53`

### Before

- The full desktop navigation remained active down to 761px. In English, its right edge began crossing the Search/language/anddream/edition group below roughly 930px, reaching an 89px overlap at 768px.
- The language switch used the same 40px visual width and underline treatment as a larger utility action, adding weight to an already dense masthead.

### Decision

- Keep the full editorial masthead only above 1024px. At tablet and smaller widths, use the existing Menu navigation and place Search inside it; this changes responsive priority without removing any destination.
- Reduce the language switch's visible width to 32px and type to 8px while retaining a 40px vertical target. Remove its underline and reduce desktop utility gaps from 24px to the approved 16px spacing token.
- Preserve the anddream mark in the full masthead and hide the entire right-side utility group only when the compact menu takes over.

### Evidence

- English header measurements at 1440, 1280, 1100 and 1025px show the full navigation and utility group with zero overlap and zero page overflow.
- At 1024, 960, 820, 768 and 390px, the compact actions are visible, the full navigation and right-side group are hidden, and page overflow remains zero.
- Opening the 1024px menu exposes Home, Archive, Rate, Taste, Import, Journal and Search. Switching the open menu to Chinese retains its state and produces no overflow.
- `npm test`, `node --check server.mjs` and `git diff --check` pass.

### Intentionally unchanged

- Navigation wording, anddream identity, module colors, sticky behavior, typography families and mobile page layouts remain unchanged.

## Version 3.4.5 — Masthead edition-marker removal

Implementation commit: `dadec23`

### Before

- The right side of the full masthead ended with `READ / 20—`, a non-interactive editorial edition marker that suggested an unfinished 20xx date without conveying the current page, archive state or an available action.
- The marker added one more label to an already information-dense navigation row and could be mistaken for a destination.

### Decision

- Remove the marker and its dedicated styling from the shell. Keep Search, the language switch and `anddream` as the complete right-side utility group.
- Retain `HIM / 001` as the project identity and retain the footer's explicit `PERSONAL ARCHIVE / ISSUE 001` wording, where the issue metaphor has enough context to be understood.
- Advance the offline shell to 0.4.5 so an accepted update cannot continue serving the cached masthead.

### Evidence

- Real-browser checks at 1440px, 1024px and 390px found no `.edition` node, no `READ / 20—` text and zero horizontal overflow.
- At 1440px, the full Chinese and English navigation and right-side utilities remain visible. At 1024px and 390px, the compact language/Menu controls remain visible.
- At 390px, the open menu contains all seven destinations in English and Chinese; changing language keeps the menu open.
- Screenshot review confirmed the simplified desktop masthead and the existing tablet/mobile hierarchy without adding replacement decoration.

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Real browser at 1440 × 900, 1024 × 768 and 390 × 844.

### Intentionally unchanged

- Navigation destinations and wording, Search, the language switch, `HIM / 001`, `anddream`, responsive breakpoints, module colors, typography and sticky behavior remain unchanged.

## Version 3.4.6 — Original full-navigation restoration

Implementation commit: `b030d87`

### Correction

- UI 3.4.5 correctly removed `READ / 20—`, but retained UI 3.4.4's earlier decision to collapse the full masthead at 1024px. Owner review clarified that the intended outcome was the original horizontal navigation with only the edition marker removed.

### Decision

- Restore the full masthead at every width above the original 760px mobile breakpoint. At 760px and below, retain the established language/Menu controls and seven-entry compact menu.
- Place the right-side Search, language switch and `anddream` group in the header grid instead of absolute positioning. This preserves the same visual treatment while allowing the grid to reserve honest space for both navigation groups.
- Keep `READ / 20—` and all `.edition` styling absent. Advance the offline shell to 0.4.6 so the restored layout is delivered as a distinct update.

### Evidence

- English measurements at 1440, 1024, 960, 900, 860, 820, 800, 768 and 761px show the full navigation with zero brand/navigation overlap, zero navigation/utility overlap and zero horizontal overflow.
- Chinese measurements at 1024, 820, 768 and 761px show the same zero-overlap result.
- At 760 and 390px the full groups are hidden, the compact menu is available, and the open 390px menu contains Home, Archive, Rate, Taste, Import, Journal and Search in Chinese.
- Screenshot review at 1024px confirms the original horizontal masthead appearance. Screenshot review at 390px confirms the existing mobile hierarchy. Neither contains `READ / 20—`.

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Real browser checks at 1440 / 1024 / 960 / 900 / 860 / 820 / 800 / 768 / 761 / 760 / 390px.

### Intentionally unchanged

- Navigation destinations and wording, language control size, utility spacing, `HIM / 001`, Search, `anddream`, module colors, typography, sticky behavior and mobile menu composition remain unchanged.

## Version 3.4.7 — Chinese Import dynamic-state closure

Implementation commit: `61ff1e4`

### Before

- Import's initial page copy was localized, but content created after a playlist import still exposed English controls and states such as `SYNC NOW`, snapshot differences, duplicate counts and Inbox lifecycle actions.
- These strings are inserted after the initial route render, so their absence was most visible only after real user data existed.

### Decision

- Extend the runtime translation vocabulary and numeric patterns across playlist/album previews, Import completion, catalog search, Inbox lifecycle, source labels, removal confirmation, synchronization states and error feedback.
- Keep recorded playlist, track, album, artist and source names unchanged. Translate only interface roles, counts and explanations.
- Retain the live-DOM translation approach so switching language still preserves imported records, form state and open synchronization results.

### Evidence

- A real QQ Music public playlist was previewed and imported in an isolated browser origin: “随便听听”, 38 public tracks. Preview counts, confirmation and completion feedback appeared in Chinese.
- The resulting Inbox showed Chinese lifecycle counts and actions. The source row displayed `保存名称`, `立即同步` and `移除这个来源`; a live sync returned `歌单变化` and `已经是最新状态 · 快照已保存`.
- Browser checks at 1440, 1024 and 390px found zero horizontal overflow. The 390px screenshot retained the Import editorial hierarchy and readable source actions.
- Automated translation checks cover `SYNC NOW`, last-checked counts, added/removed counts, reading state, Inbox confirmation and existing-count grammar.

### Verification

- `npm test`
- `node --check server.mjs`
- `git diff --check`
- Real QQ playlist preview/import/sync in Chinese at 1440 / 1024 / 390px.

### Intentionally unchanged

- Import data behavior, matching confidence, provider metadata, Inbox lifecycle rules, localStorage boundaries, module palette and responsive composition remain unchanged.

## Version 3.4.9 — Low-friction collection and progressive disclosure

Implementation commit: `7ac632a`

### Before

- An imported Track moved from `imported` to `rated`, but still required a separate Archive action. The saved rating existed while the Track remained absent from the visible Archive because personal Library records were not part of `allTracks()`.
- Archive maintenance shared the same navigation prominence as everyday browsing. Track details opened version tools by default, while Data Desk exposed backup formats, storage diagnostics and recovery machinery simultaneously.

### Decision

- Treat a completed rating as the owner's collection decision: save the rating, move an imported Track from Inbox to personal Library and expose it through Archive in one transaction. Undo restores both the prior rating and the prior Inbox/Library placement.
- Remove collected records from the active Inbox list. Keep their archived count as lifecycle evidence without asking the owner to process them again.
- Keep Tracks, Albums and Artists as the visible Archive navigation. Move metadata maintenance into one collapsed disclosure on Archive Home, and close advanced Track sections by default.
- Keep ordinary export and restore visible on Data Desk. Place encrypted export, quota diagnostics, durable-storage controls and recovery points behind one advanced disclosure. No data group or recovery ability is removed.

### Evidence

- A real 38-Track QQ Music playlist was imported on an isolated browser origin. Saving a rating for “游京” produced `Rating saved and Track added to Archive`, reduced the active Inbox from 38 to 37 and exposed the Track detail and Archive card with its saved 7.5 geometry.
- Automated coverage confirms that an imported fixture leaves Inbox, enters personal Library with `archived` state and appears in `allTracks()` immediately after a complete rating.
- Desktop 1440px, tablet 1024px and mobile 390px checks found zero horizontal overflow. Track maintenance sections and Data Desk advanced tools remained closed by default at every width.
- English and Chinese Archive maintenance labels and the new automatic-collection feedback were verified without translating recorded music titles or artist names.

### Verification

- `npm test`
- `node --check modules/rating/pages.js`
- `node --check modules/import/pages.js`
- `git diff --check`
- Real QQ playlist import, Track rating, automatic Archive navigation and responsive inspection at 1440 × 900, 1024 × 900 and 390 × 844.

### Intentionally unchanged

- Ratings, notes, Inbox, Library and recovery snapshots remain local to the browser and remain part of Data Desk backups.
- Provider matching, public metadata boundaries, manual Ignore/Review controls for unrated records, Archive palette, typography, zero-radius geometry and primary site navigation remain unchanged.

## Version 3.4.10 — Hosted metadata delivery

Implementation commit: `15ce1fc`

### Decision

- Keep GitHub Pages as the static application host and run only the public metadata adapter on a claimed Cloudflare Worker free-plan deployment.
- Configure the production app with the Worker's HTTPS root address. Restrict browser CORS to `https://andrewyy5178.github.io`; do not commit Cloudflare login data, claim tokens or deployment credentials.
- Preserve the local Node adapter for development and keep the Worker contract identical: health/version, QQ playlist/search/album and NetEase playlist endpoints.

### Evidence

- The claimed Worker reported version 0.4.10 and providers `qqmusic` and `netease` through `/healthz`.
- A production-origin request to the hosted QQ playlist endpoint returned the public “随便听听” playlist with 38 readable Tracks. Automated tests cover allowed/disallowed origins, preflight, health, version, invalid input and missing routes.
- The deployment changes no page composition. Existing responsive evidence from UI 3.4.9 remains applicable; final GitHub Pages import verification is recorded in `TODO.md` before release closure.

### Intentionally unchanged

- Personal ratings, notes, Inbox, Library and backups remain browser-local. The Worker receives public share links and returns public metadata only; it receives no login Cookie, audio, lyrics or personal archive export.
- Palette, typography, layout, navigation and Import review presentation remain unchanged.

## Version 3.5.0 — Source-backed metadata review and crawlable delivery

Implementation commit: `2d59986`

### Before

- Archive Metadata could store owner-confirmed field evidence, but the owner had to find and transcribe every source manually. Search results did not expose provider entity identity, disc/track position or recording-version signals.
- The History API application had one crawler-facing root document. Core route URLs depended on JavaScript or the GitHub Pages recovery redirect, and the social preview existed only as SVG.
- The configured production Worker address also overrode the same-origin Node adapter during local development, where the Worker's production-only CORS correctly rejected the request.

### Decision

- Add QQ Music candidates inside the existing Metadata maintenance view. Exact title/artist matches may copy facts only after the exact QQ album entity confirms the recording, album release date and official track position. Search results, alternate/live candidates and all copied facts remain visibly pending until the owner saves field evidence.
- Keep language and region blank when no authoritative field is exposed. Treat QQ version codes as candidate signals, not confirmed semantic labels.
- Generate static HTML snapshots for eight public route URLs, direct sitemap entries and a 1200 × 630 PNG share image. JavaScript-capable browsers still replace the snapshot with the interactive application.
- Use the hosted adapter only on `github.io` (or through an explicit runtime override); local development uses the same-origin Node service.
- Add the new mobile snapshot rule to an existing 760px block instead of creating another repeated media query. Defer full cascade consolidation until a dedicated visual-only pass can compare every route.

### Evidence

- A real QQ Music lookup for “向日葵朝着夜 — 单依纯” returned a base recording and several alternate/live candidates. The exact album entity “纯妹妹” confirmed release date `2025-12-28`, disc 1, track 3 of 10 before those values were copied into the review form.
- English and Chinese candidate states, placeholders, evidence notes and feedback were checked in the browser. No candidate action saved metadata automatically or changed ratings, notes, Inbox or Library data.
- Desktop 1440px, tablet 1024px and mobile 390px checks covered Home, Archive Metadata, Rate, Import, Journal and Search. All tested routes reported zero horizontal overflow; desktop candidate cards, tablet navigation and the expanded mobile menu were visually inspected.
- The generated PNG was visually inspected and its PNG signature and 1200 × 630 dimensions are enforced by the project check. Every generated route is checked for static content, canonical URL and application takeover script.

### Verification

- `npm run build:static`
- `npm test`
- `node --check server.mjs`
- `node --check worker/index.mjs`
- `git diff --check`
- Real QQ search and exact-album preview through the local adapter at 1440 / 1024 / 390px.

### Intentionally unchanged

- Personal ratings, notes, corrections, Inbox, Library and backups remain browser-local. The metadata service receives only public lookup text or public share/entity URLs.
- Candidate facts require an explicit owner save. Ambiguous versions remain unconfirmed, and language/region remain unknown without a qualified source.
- The established paper/ink/red/olive palette, Libre Baskerville/DM Mono and Chinese font pairing, square artwork, zero-radius geometry, full desktop navigation and compact mobile menu remain unchanged.

## Version 3.5.1 — Quieter Home and rating-led Archive

Implementation commit: `2e45642`

### Before

- Home repeated navigation already available in the masthead through method, Track, Album, Archive and About calls to action. Its fixed selections made the presentation feel like a permanent recommendation rather than a changing view into the archive.
- Track index offered rating order but defaulted to insertion order. Album and Artist indexes had no shared rating-led default.
- The global footer repeated the Philosophy destination as `METHOD ↗` on every route.

### Decision

- Treat Home as a presentation surface. Remove every content-level link from its hero, current listening, Track shape, Album landscape and closing statement; keep the primary masthead as the sole module navigation.
- Sample rated Tracks again on each Home render. Sample Albums independently, but draw a landscape only from that Album's confirmed ordered Tracks and actual current scores; an unconfirmed Album stays visibly empty instead of receiving a decorative waveform.
- Default Tracks to current Overall descending, Albums to saved Album Overall descending and Artists to the mean of their explicitly scored Tracks. Put unknown scores last and use stable text ties so the order remains deterministic.
- Remove the footer Method link without changing footer identity, palette, typography, spacing or navigation geometry.

### Evidence

- Two fresh Home renders produced different current-listening groups, Track shapes and Album titles. Home contained zero links inside `main`, and the global footer contained zero links.
- The default Track sort control reported `rating`; the first canonical Track was the 11-point “向日葵朝着夜”. The first Artist was 单依纯, based on the highest available scored-Track average. An isolated Album fixture confirmed that a 10-point Album precedes an 8-point Album.
- Desktop 1440px, tablet 1024px and mobile 390px checks covered Home and all three Archive indexes with zero horizontal overflow. Desktop Home, tablet Track ranking and mobile Home were visually inspected.

### Verification

- `npm run build:static`
- `npm test`
- `node --check modules/home.js`
- `node --check modules/archive/pages.js`
- `node --check worker/index.mjs`
- `git diff --check`
- Real-browser inspection at 1440 × 900, 1024 × 768 and 390 × 844 on a fresh local origin.

### Intentionally unchanged

- Masthead navigation, Search and bilingual switching remain available on every page. Archive cards continue to open their corresponding records.
- Personal ratings, Album scores, notes, Inbox, Library and backups remain browser-local. No sorting or Home sampling writes to storage.
- The established paper/ink/red/olive palette, typography, square artwork, zero-radius geometry and responsive breakpoints remain unchanged.

## Version 3.5.2 — Quiet healthy state and explicit playlist checks

Implementation commit: `3a5b0ed`

### Before

- Every Import route displayed a healthy metadata-service panel even though it offered no action and repeated a condition users only need to know when something is wrong.
- Saved playlist sources used `SYNC NOW / 立即同步`, which could be mistaken for account or cross-device synchronization instead of a manual comparison with the latest public playlist snapshot.

### Decision

- Render no metadata-service panel in the healthy state. Preserve the existing disconnected static-site warning, and continue showing request failures in the relevant Import preview or Inbox status region.
- Rename the source action to `CHECK PLAYLIST UPDATES / 检查歌单更新` before and after each request. Keep its behavior unchanged: fetch the public source, compare snapshots and let the owner decide whether to import additions.

### Evidence

- Automated rendering confirms healthy Import contains no service-ready copy, a GitHub Pages build without an adapter still displays the disconnected warning, and a saved source exposes the new label without `SYNC NOW`.
- English and Chinese Import/Inbox were checked at 1440px, 1024px and 390px. Healthy notices remained absent and no tested route had horizontal overflow; desktop Import and mobile Inbox were visually inspected.

### Verification

- `npm run build:static`
- `npm test`
- `node --check modules/import/pages.js`
- `node --check worker/index.mjs`
- `git diff --check`
- Real-browser checks at 1440 × 900, 1024 × 768 and 390 × 844 on a fresh local origin.

### Intentionally unchanged

- The metadata adapter remains required for public QQ Music and NetEase reads. Hiding its healthy label does not disable or defer the service.
- Checking a source never deletes local Tracks, ratings, notes or Library records and remains unrelated to future cross-device account sync.
- Import structure, review gates, Inbox lifecycle, palette, typography and responsive breakpoints remain unchanged.

## Version 3.5.3 — V13 listening-taste favicon

Implementation commit: pending

### Before

- The browser tab still used the original paper-backed geometric favicon, which no longer represented the site's listening-and-taste identity.
- The accepted V13 sketch existed only as a generated preview whose visible checkerboard was baked into an RGB image rather than stored as real transparency.

### Decision

- Adopt the owner-selected V13 direction: a rounded ear with a tongue contained inside the lower cochlear area, using the site's single brick red `#a44733` and a near-square outer proportion.
- Extract only the red mark from the accepted preview, normalize it to the repository red and place it on a genuinely transparent 512×512 PNG canvas. Keep generous outer padding so the asymmetrical silhouette survives browser downscaling.
- Replace the favicon reference in the document, install manifest and versioned offline shell. Retire V14 and V15 from further refinement without deleting the preserved exploration history.

### Evidence

- Image inspection reports a 512×512 RGBA PNG with non-opaque alpha; the baked checkerboard is absent on both dark and light inspection backgrounds.
- The local browser resolved `favicon.png` as `image/png` at 1440×900, 1024×768 and 390×844. Each width retained the existing page composition with zero horizontal overflow.
- The generated static route snapshots inherited the new favicon URL from the canonical document template.

### Verification

- `npm run build:static`
- `npm test`
- `magick identify favicon.png`
- `git diff --check`
- Real-browser checks at 1440×900, 1024×768 and 390×844 on the local Node origin.

### Intentionally unchanged

- The favicon change does not alter navigation, content, palette, typography, scoring, Import behavior or responsive breakpoints.
- Personal ratings, notes, corrections, Inbox, Library, logs and backups remain browser-local and untouched.
- UI 3.5.3 remains local until the owner explicitly asks to commit and publish it.

## Version 3.6.0 — Touch-first archive shell

Implementation commit: pending

### Decision

- Keep the existing six routes and their separate editorial personalities. On phone widths, replace the crowded masthead navigation with a safe-area-aware five-place bottom bar: Home, Archive, Rate, Taste and More; More contains Import, Journal and Search.
- Treat Rate as a listening instrument rather than a mini dashboard: retain the Radar and exact score controls, enlarge interaction targets and keep one save action near the lower thumb zone. Recompose Archive records into a dense vertical catalogue without adding rounded cards, glass layers or a generic mobile palette.
- Keep public metadata evidence reviewable. QQ Music remains the exact-entity path for album/date/order. Add source links from MusicBrainz only as release-level language and country candidates; label its language scope precisely as release title/track-title language, never lyric language.

### Evidence

- Source and Worker contract tests cover the new release-candidate endpoint with a fixture carrying `eng` and `US`; the candidate only fills the existing owner-confirmation form and cannot save itself.
- The responsive layer preserves the paper/ink/red/olive token system, zero-radius rules and existing desktop route layout while defining mobile safe areas, 44px controls, one-column records and a low-noise tab bar.

### Verification

- `npm run build:static`
- `npm test`
- `git diff --check`

### Intentionally unchanged

- No canonical metadata, personal rating, note, Inbox, Library, backup or browser-local record is modified by navigation or candidate lookup.
- Desktop and tablet retain the primary masthead. No new account, cloud-sync, audio, playback or social feature is introduced.

## Version 3.6.1 — Quiet structural rules

Implementation commit: pending

### Decision

- Remove repeated enclosing and internal rules from Import's Inbox counters and Archive metadata coverage. Use aligned values and the existing spacing scale to group summary facts; retain a single opening rule where it establishes a new section.
- Remove the redundant rule beneath Import's contextual navigation, because the following content boundary already establishes the transition.
- Keep rules that encode a real relationship: individual records, rating scales, track order, waveform guides and editable controls are unchanged.

### Evidence

- At 390px, Inbox counters retain their two-column reading order without a four-cell grid or horizontal overflow; the five-place tab bar remains present.
- At 1024px and 1440px, Archive metadata coverage remains aligned without vertical cell dividers; the desktop masthead remains present and no horizontal overflow occurs.

### Verification

- Real-browser checks at 390×844, 1024×768 and 1440×900 on the local Node origin.
- `npm run build:static`
- `npm test`
- `git diff --check`

### Intentionally unchanged

- Browser chrome controls, including Safari's Back, Forward, Share and tab controls, are not site UI and are not changed by this release.
- No record, score, note, Inbox item, local backup or metadata evidence is modified.

## Version 3.6.2 — Inbox boundary correction

Implementation commit: pending

### Decision

- Restore the two meaningful Inbox horizontal boundaries that the prior line reduction removed: the line below Import navigation and the line that closes the four lifecycle counts.
- Keep the lifecycle summary free of all vertical dividers and its mobile internal row divider. The resulting mobile sequence is navigation boundary → summary values → summary end → next-section boundary.

### Evidence

- At 390×844, the navigation, count summary and Playlist Sources retain distinct reading groups with no horizontal overflow and no four-cell-grid treatment.

### Intentionally unchanged

- Playlist Sources and individual Inbox records retain their own boundaries because they identify a new source section and separate actionable records.

## Version 3.6.3 — Journal rhythm, Inbox columns

Implementation commit: pending

### Decision

- Restore Inbox's vertical dividers between lifecycle numbers. Those rules make the four-state summary scannable and are not decoration.
- Remove only the repeated horizontal rules from the Journal list: its enclosing top rule and the bottom rule repeated on every entry. Preserve the Journal's date, title, score and note hierarchy, increasing vertical separation instead.

### Intentionally unchanged

- Journal's Annual Index boundary, record editing controls and other lines that describe a distinct destination or interactive control remain intact.

## Version 3.6.4 — Restore pre-reduction rule system

Implementation commit: pending

### Decision

- Restore the last approved rule system from before the line-density experiments. This reinstates Inbox summary borders and dividers, Archive metadata coverage rules, Import section rules and Journal list rules exactly as they were under UI 3.6.0.
- Preserve the touch-first shell, responsive composition and all non-line-related UI 3.6 work.

### Intentionally unchanged

- This restoration does not alter routes, browser-local records, data flows, translations, icons, favicon, navigation or Cloudflare integration.

## Version 3.7.0 — Private sync as a reversible Data Desk action

Implementation commit: pending

### Decision

- Keep cross-device sync out of the Archive, Rate and public browsing surfaces. It belongs in Data Desk, alongside backup, restore and recovery, because it moves a complete personal archive rather than a single music record.
- Use GitHub only as the account identity layer. Encrypt the archive inside the browser before upload with the existing AES-GCM backup format; the Worker and D1 persist only ciphertext, a revision counter and short-lived account/session plumbing.
- Make download a two-stage interaction: decrypt and preview compatible groups/conflicts first, then let the owner choose local or cloud values for conflicts and explicitly confirm the merge. Preserve the established whole-restore rollback.
- Keep the new block typographic and ruled rather than presenting it as a rounded cloud-product card. The page remains an archival desk, not a generic account dashboard.

### Evidence

- The Worker contract suite verifies that the sync capability is advertised but remains unavailable without the D1 binding and OAuth secret.
- Local `npm run build:static` and `npm test` complete with the encrypted client module included in the offline shell, while API responses remain excluded from Service Worker caching.

### Verification

- `npm run build:static`
- `npm test`
- `git diff --check`
- Production sign-in, encrypted upload, download preview, conflict-policy merge and logout against the owner-controlled Worker/D1 deployment.

### Intentionally unchanged

- No browser-local rating, note, Inbox, Library, Memory, Journal, backup or metadata correction is uploaded automatically.
- The GitHub Client Secret remains a Cloudflare Worker secret and is not written to this repository, the public site or browser storage.

## Version 3.7.1 — Cloud-sync language closure

Implementation commit: pending

### Decision

- Translate the signed-in identity, empty-cloud state, upload revision, download preview, conflict count, merge result and failure states so the Chinese Data Desk never falls back to English during the sync workflow.
- Keep GitHub usernames unchanged as account identifiers; translate only the surrounding interface language.

### Verification

- `npm run build:static`
- `npm test`
- Production Chinese Data Desk check after GitHub authorization.

### Intentionally unchanged

- Authentication, encryption, conflict handling, D1 storage and all browser-local music data remain unchanged.

## Version 3.8.0 — Account in the masthead

Implementation commit: pending

### Decision

- Replace the masthead's contextless `001` with a real `ACCOUNT` control while keeping `HIM /` as the home identity. The footer retains `ISSUE 001`, where the edition metaphor has explicit context.
- Open a full-height sheet on phone and a right-aligned editorial panel on larger widths. Use flat paper, ink, brick red, square corners and ruled identity details instead of a rounded avatar menu, glass overlay or generic SaaS profile card.
- Treat GitHub's first authorization as registration. Logged-out copy explains that there is no separate password account; logged-in copy exposes identity, encrypted-copy status, Data Desk and sign-out without placing the sync password in the masthead.
- Follow the established accessible disclosure pattern: the trigger exposes expanded state, the panel has a labelled dialog region, Escape and a visible 44px close control both dismiss it, and its primary actions meet the mobile touch target.

### Reference evidence and rejected alternatives

- The [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) informed the labelled panel, explicit close action and focus placement. [GitHub Primer's action-menu guidance](https://primer.style/product/components/action-menu/accessibility/) informed concise account actions and visible state, but the site rejects Primer's rounded product surfaces and avatar-led identity because they would erase the archive's editorial masthead.
- A dedicated `/login` route and a large homepage registration block were rejected: GitHub owns the actual authentication screen, while duplicating it would imply a second password system and compete with Home's presentation role.

### Verification

- `npm run build:static`
- `npm test`
- Real-browser checks at 1440 × 900, 1024 × 768 and 390 × 844 in logged-out and logged-in states.

### Intentionally unchanged

- Routes, Archive ordering, Rate, Taste, Import, Journal, browser-local data and encryption boundaries do not change.

## Version 3.8.1 — Compact account popover

Implementation commit: pending

### Decision

- Reduce the account surface from a 420px desktop panel and full-height mobile sheet to a compact 360px masthead popover; on phone it keeps 16px side gutters and ends after its content instead of covering the whole screen.
- Tighten the internal rhythm from 40px to 24px, reduce the display title to 30–36px and place the two signed-in actions in one balanced row. Preserve 44px controls, square corners, thin rules and the existing paper/ink/red palette.

### Verification

- `npm run build:static`
- `npm test`
- Real-browser checks at 1440 × 900, 1024 × 768 and 390 × 844 in the signed-in state.

### Intentionally unchanged

- Account identity, GitHub authorization, encrypted cloud sync, navigation and browser-local music data remain unchanged.

## Version 3.8.2 — Minimal account identity

Implementation commit: pending

### Decision

- Reduce the signed-in popover to a 260px account instrument: identity, one short Data Desk cue, encrypted-copy state and two 44px actions. The account explanation remains only for logged-out visitors.
- This keeps the account surface within roughly one-third to one-half of the earlier compact panel's visual area without reducing the action targets or forcing touch interaction into a tiny interface.

### Intentionally unchanged

- The account still exposes the same GitHub login, Data Desk and sign-out actions; no local music data is changed.

## Version 3.8.3 — Account / popover alignment

Implementation commit: pending

### Decision

- Move the Account trigger to the right header utility area, directly above the right-aligned account popover. On phone it sits beside the language control, preserving the same spatial relationship.
- Move `anddream` to the left project lockup beside `HIM /`, where it reads as a quiet publisher signature rather than competing with account actions.

### Intentionally unchanged

- Account panel size, login flow, navigation destinations, profile data and sync behavior remain unchanged.

## Version 3.8.4 — Account-driven automatic sync

Implementation commit: pending

### Decision

- Replace the password-gated manual upload/download workflow with GitHub-account automatic sync, following the owner's explicit preference for one shared archive across signed-in devices.
- Keep the account surface compact: it reports automatic state and retains Data Desk plus sign-out, without adding a dashboard, password field or repeated transfer controls.
- Encrypt the D1 payload at rest with a Worker-held account key. This removes the per-device password but deliberately changes the boundary from end-to-end encryption to service-processed account sync; the Data Desk continues to provide a local export and complete restore rollback.

### Intentionally unchanged

- GitHub remains the only account identity, personal music data remains private to the account, and no data is uploaded until a signed-in browser establishes the account sync copy.

## Version 3.8.5 — A named archive

Implementation commit: pending

### Decision

- After the first GitHub sign-in and cloud merge, open the existing compact Account popover and focus a single nickname field. Keep registration on GitHub; the nickname is presentation, not a second identity system.
- Replace the signed-in masthead's generic Account label with the nickname in Libre Baskerville. This creates a direct connection between the person and the account surface while retaining the existing right alignment and popover geometry.
- Store nicknames under the GitHub user ID and include that key in automatic account sync, so different accounts on one browser do not inherit each other's names. Keep GitHub identity visible inside the popover for unambiguous ownership.

### Intentionally unchanged

- Nicknames do not change authentication, authorization, routes, music records or the automatic-sync privacy boundary. The field is limited to 24 characters and long masthead labels truncate rather than shifting navigation.

## Version 3.8.6 — Lighter account notation

Implementation commit: pending

### Decision

- Replace the heavy `DISPLAY NICKNAME` form treatment with one quiet `NICKNAME` label, a shared input baseline and a short Save action. Keep the 44px input and action targets without making the editor look like a separate product card.
- Reduce GitHub identity to approximately one-third of its former visual weight: one compact metadata line, muted handle, smaller mono type and a single closing rule.
- Set the signed-in masthead nickname in Libre Baskerville italic. Preserve truncation at narrow widths so personality does not displace language or navigation controls.

### Intentionally unchanged

- Nickname storage, editing, automatic sync, GitHub identity and account actions remain functionally identical.

## Version 3.8.7 — Editorial account signature

Implementation commit: pending

### Decision

- Remove the redundant signed-in sentence explaining that the archive follows the GitHub account; the live synchronization status already communicates the same state more precisely.
- Promote the GitHub handle from tiny mono metadata to a 13px Libre Baskerville signature while preserving the compressed identity row. Keep the `GITHUB IDENTITY` label quiet so the handle carries the hierarchy.

### Intentionally unchanged

- GitHub authentication, nickname editing, automatic synchronization, account actions and compact popover geometry remain unchanged.

## Version 3.8.8 — Journal overview hierarchy

Implementation commit: pending

### Decision

- Give Rediscover a single square 1px frame so it reads as a distinct listening prompt rather than another ruled interval in the Journal stream.
- Remove the recurring Journal timeline from the overview and retain `ANNUAL INDEX` as the one next destination. The timeline was historical track-level detail, not part of the annual index; its removal here does not delete Journal records, ratings, notes, or the yearly evidence view.
- Strip the Annual Index's top and bottom rules. The Rediscover frame provides the preceding boundary, so extra parallel lines no longer add useful structure.

### Intentionally unchanged

- Rediscovery selection, rate-again and skip actions, annual evidence calculation, saved Journal data, Archive data and search indexing remain unchanged.

## Version 3.8.9 — Masthead nickname clearance

Implementation commit: pending

### Decision

- Expand the signed-in masthead nickname from a fixed 72px phone cap to a responsive 72–96px range, so Chinese glyphs do not collide visually with the language and menu controls.
- At widths below 360px, hide only the secondary `anddream` publisher signature to preserve the product lockup's primary `HIM /` mark and keep the account control readable. The nickname still truncates with an ellipsis when it genuinely exceeds the available space.

### Intentionally unchanged

- Account popover, nickname storage, GitHub identity, automatic sync, language switching and all music data remain unchanged.

## Version 3.8.10 — Inline account identity

Implementation commit: pending

### Decision

- Keep the `NICKNAME` label as the editor's context, then place the nickname value and `@GitHub` username on the same baseline with Save at the edge. This makes the account's presentation name and authenticated identity readable as one signature rather than two stacked blocks.
- Keep the handle in the same larger serif treatment and cap both values with ellipsis behavior so long nicknames never push the Save target out of the compact popover.

### Intentionally unchanged

- Nickname storage, GitHub authentication, automatic sync, account actions, language behavior and local music data remain unchanged.

## Version 3.8.11 — Inline handle clearance

Implementation commit: pending

### Decision

- Widen the inline GitHub handle column to 108px and reduce the inter-column gap to 4px. This keeps the common `@AndrewYY5178` identity readable on one line beside the nickname while retaining the 44px Save target.

### Intentionally unchanged

- Nickname editing, account identity, authentication, automatic sync and popover geometry remain unchanged.

## Version 3.8.12 — Nickname label alignment

Implementation commit: pending

### Decision

- Place the `NICKNAME` context label beside the editable nickname on the same underlined row, matching the user's intended reading order.
- Keep `GITHUB IDENTITY` as a separate compact row beneath it, preserving the full handle and its clear authenticated-identity meaning without crowding the editor.

### Intentionally unchanged

- Nickname storage, Save behavior, GitHub authentication, automatic sync and account panel dimensions remain unchanged.

## Version 3.8.13 — Quiet page entry

Implementation commit: pending

### Decision

- Remove the global back-path line that appeared above every page title (`← BACK HOME`, `← BACK TO ARCHIVE`, `← BACK TO RATE`, and similar). The masthead remains the persistent route switcher, so repeating the hierarchy before each title added navigation noise without adding a new destination.
- Keep explicit in-page links used for recovery, empty states, and task completion; only the automatically injected page-entry label is removed.

### Intentionally unchanged

- Routes, browser history, masthead navigation, page content, data actions and browser-local music data remain unchanged.

## Version 3.8.14 — Direct page titles

Implementation commit: pending

### Decision

- Remove the repeated red eyebrow above route page titles (`ARCHIVE`, `RATE`, `TASTE`, `IMPORT`, `JOURNAL` and their nested page-header variants). The masthead already identifies the active section, so repeating it immediately above the title made the opening frame feel labeled twice.
- Keep content-level eyebrows such as `PLAYLIST SOURCES`, `LOCAL DATA`, and `SET THE SHAPE`; those labels organize secondary modules rather than restating the route.

### Intentionally unchanged

- Route navigation, page titles and subtitles, in-page recovery/action links, account UI, visualizations and browser-local music data remain unchanged.

## Version 3.8.15 — Quiet Home opening

Implementation commit: pending

### Decision

- Remove the `PERSONAL ARCHIVE / ISSUE 001` eyebrow from the Home hero so the opening begins directly with `How I hear music.` rather than a second identity label above the title.
- Retain the issue marker in the footer and keep content-level labels such as `CURRENTLY LISTENING`, `FEATURED SHAPE`, and `FEATURED LANDSCAPE` for section orientation.

### Intentionally unchanged

- Home composition, random selection, masthead, footer, navigation, account UI and browser-local music data remain unchanged.

## Version 3.8.16 — Nickname terminal clearance

Implementation commit: pending

### Decision

- Add a small right-side breathing allowance and a wider cap to the signed-in masthead nickname control. Italic serif terminals can extend beyond their apparent advance width, so the previous clipping edge visibly cut the final `l` in some names.
- Keep a bounded mobile width with a slightly larger cap; long nicknames still ellipsize instead of crowding the language or menu controls.

### Intentionally unchanged

- Nickname storage, account popover, GitHub identity, masthead order, typography, navigation and all music data remain unchanged.

## Version 3.8.17 — Account row alignment

Implementation commit: pending

### Decision

- Use one shared label/value grid for the `NICKNAME` and `GITHUB IDENTITY` rows. Both `Coofflll` and `@AndrewYY5178` now begin on the same vertical column.
- Reserve the rightmost grid column for `SAVE` on the nickname row and let the identity value span that same remaining measure, keeping the action aligned without unnecessarily truncating the GitHub handle.

### Intentionally unchanged

- Account panel dimensions, nickname editing, GitHub authentication, automatic sync, mobile navigation and all music data remain unchanged.

## Version 3.8.18 — Account baseline alignment

Implementation commit: pending

### Decision

- Align both account rows on their text baselines instead of centering the nickname row's label, value and `SAVE` control independently. This keeps the top row visually seated like the `GITHUB IDENTITY` row beneath it.
- Retain the shared label/value columns and the 44px interactive targets. Only the row alignment changes; the input and button remain easy to tap while their visible text follows the same editorial baseline logic.

### Intentionally unchanged

- Account panel dimensions, nickname storage, GitHub authentication, automatic sync, navigation, typography choices and all music data remain unchanged.

## Version 3.8.19 — Account rule rhythm and build mark

Implementation commit: pending

### Decision

- Give the compact GitHub identity row the same lower breathing space as the nickname row's 44px control row, so both text-to-rule relationships read as one measured unit instead of two unrelated line heights.
- Add a small muted `v0.9.10` build mark after the account status, aligned to the popover's lower-right edge. It identifies the running shell without competing with the account identity or actions.

### Intentionally unchanged

- Account data, authentication, automatic sync, touch targets, panel width, navigation and all music records remain unchanged.

## Version 3.8.20 — Closer account rules

Implementation commit: pending

### Decision

- Move the nickname rule eight pixels into its 44px control row and reduce the identity row's lower padding to eight pixels. The visible label/value baselines now sit closer to both rules, while the input and `SAVE` hit areas remain unchanged.
- Keep the rule as a focus-aware pseudo-element so the tighter visual line does not shrink or move the interactive controls. Preserve the muted version mark at the popover's lower-right edge.

### Intentionally unchanged

- Account storage, authentication, automatic sync, panel width, navigation, version typography and all music records remain unchanged.

## Version 3.8.21 — Quiet Archive entry

Implementation commit: pending

### Decision

- Remove the `ARCHIVE MAINTENANCE` disclosure and its `MANAGE METADATA` button from Archive Home. The primary Archive opening now stays focused on Tracks, Albums and Artists instead of presenting a rarely used maintenance task beside everyday browsing.
- Keep `/archive/coverage`, field provenance, source candidates, local corrections and all saved metadata available through the existing route. This is an entry-point reduction, not a data or capability removal.

### Intentionally unchanged

- Archive indexes, metadata evidence, correction storage, search, account sync, navigation and all music records remain unchanged.

## Version 3.8.22 — Synchronized build mark

Implementation commit: pending

### Decision

- Align the account popover's visible build mark with the published 0.9.13 release. The previous shell constant lagged one release behind the Pages asset and Worker versions, making a successful deployment look stale to the owner.
- Keep the build mark small and quiet; it remains a diagnostic cue rather than a new account control or content element.

### Intentionally unchanged

- Account data, authentication, automatic sync, navigation, layout, typography and all music records remain unchanged.

## Version 3.8.23 — Account update check

Implementation commit: pending

### Decision

- Place a compact `CHECK FOR UPDATES` action beside the account popover's version mark. It asks the installed Service Worker to check the published shell and automatically activates a waiting worker, so the owner does not need a second confirmation step.
- Report the three useful outcomes inline in the existing account status area: checking, already current, or an update being activated. The action remains unavailable on local file previews where a Service Worker cannot run.

### Intentionally unchanged

- Account data, authentication, automatic sync, cache contents, navigation, layout, typography and all music records remain unchanged.

## Version 3.9.0 — The living newspaper

Implementation commit: pending

### Evidence

- The selected direction combines the readable 3D cover rotation of [Retro Music Player](https://60fps.design/shots/retro-music-player-ipod-scroll-interaction), Record Room's treatment of albums as tangible objects, and Clairvoyant Design's record-sliding-from-sleeve interaction.
- Owner-approved generated styleframes established the target composition for Home, Archive, Rate, Taste, Import and Journal: warm printed paper, large serif hierarchy, compact mono evidence and a few illustrations that appear to move inside an otherwise stable page.

### Decision

- Treat motion as evidence on paper coming alive: Currently Listening rotates a slow stack of physical sleeves; Listening Shape draws once in red ink; Album Landscape grows once from left to right. Archive covers lift only on intent, Import reveals a detected album as a sleeve, and analytical charts enter without moving surrounding copy.
- Keep the existing routes, page hierarchy, controls, local data boundary and module workflows. The styleframes are art direction, not replacement information architecture, and their invented music records never enter the application.
- Preserve the original module personalities inside one newspaper family: dense Archive catalogue, olive Rate studio, editorial Taste, minimal Import and chronological Journal. Motion stops on interaction and becomes static under `prefers-reduced-motion`.

### Rejected

- Do not reproduce Record Room's navigable 3D environment, the reference mockups' ornamental stars, compass marks, quills, fake dates or dense decorative rules. They would add performance cost and visual noise without improving the archive.
- Do not reintroduce the Journal overview track list or extra Annual Index rules; both were deliberately removed in earlier versions.

### Intentionally unchanged

- GitHub authentication, automatic sync, metadata provenance, rating semantics, Import review, Archive identity and all browser-local ratings, notes, Inbox, Memory and recovery data remain unchanged.

## Version 3.9.1 — Cover Flow as the moving headline

Implementation commit: pending

### Evidence

- The owner rejected the first four-cover rotation as too slow, too small and insufficiently physical. The requested reference is the classic iPod-style Cover Flow behavior documented by [60fps.design](https://60fps.design/shots/retro-music-player-ipod-scroll-interaction): the centered cover snaps flat and grows, adjacent covers rotate inward, and identity copy updates with the active object.
- The canonical album archive already contains confirmed HTTPS cover references. Using those covers is both more truthful and more visually specific than inventing typographic sleeves for tracks whose album identity is still unconfirmed.

### Decision

- Fill the Home stage from the complete confirmed-cover album collection. Keep nine covers visible across desktop when space permits, reduce the visible depth on phone, and retain every other album in the rotating sequence. Advance every 2.6 seconds and support previous/next, adjacent-cover selection, horizontal trackpad scrolling and touch dragging.
- Make the center cover flat, larger and sharply shadowed while progressively rotating, desaturating and lowering the outer covers. Shadows belong only to the moving record objects and detected Import object; the printed page, navigation and content groups remain flat.
- Cycle six real saved Track ratings through Featured Shape. Each change restarts the red outline draw so the animation is observable rather than a one-time entrance effect. Respect reduced-motion by holding both sequences still.
- Remove the short red rule beneath every module page heading. In QQ Album Import, show a quiet empty sleeve mechanism and explain that the real cover/reveal appears only after a valid public album is detected.

### Rejected

- Do not assign a canonical album cover to a track merely because the artist matches; many canonical tracks still lack confirmed album metadata. The Home carousel therefore links honestly to album records.
- Do not add shadows to cards, text, controls or page containers, and do not intercept normal vertical scrolling to operate Cover Flow. These choices would turn a focused physical illusion into generic skeuomorphism or obstruct reading.

### Intentionally unchanged

- Routes, Archive contents, ratings, Import confirmation, account sync, local storage keys and every saved note or listening record remain unchanged.

## Version 3.9.2 — Imported artwork continuity

Implementation commit: pending

### Finding

- The QQ Album result renderer expected `album.coverUrl`, but the provider normalized every public album with `artworkUrl: null`. The sleeve reveal therefore could not show a real cover even after a successful detection.

### Decision

- Derive the documented QQ Music public album image reference from the resolved album identity, expose it as both `coverUrl` and `artworkUrl`, and preserve that HTTPS reference when the reviewed album enters Archive. The application continues to reference the remote image; it does not upload or embed a copy.
- Keep the empty pre-detection sleeve intentionally neutral. It explains where the result will appear without pretending that an unknown album has already been identified.

### Intentionally unchanged

- Detection still requires a public QQ Music album link, the preview still precedes every local change, and `IMPORT ALBUM` remains the explicit commit step.

## Version 3.9.3 — Physical records, quieter ink

Implementation commit: pending

### Evidence

- The retained Cover Flow reference establishes a clear spatial hierarchy: the centered sleeve is the active object while angled neighbors provide sequence and depth. The owner additionally asked for the restrained material thickness seen in Recent-style album carousels, without changing the archive's flat editorial surface.
- Owner testing exposed two motion problems in the first preview: focus left the carousel timer paused after center interaction, and the fast Radar trace read as a generic reveal rather than a hand-drawn mark.

### Decision

- Reveal a record only for the centered Home sleeve. Sample the artwork in a separate CORS-safe canvas when the image host permits it, then use that color for the record; retain a deterministic muted album-key color when a host blocks pixel access.
- Give angled sleeves a narrow paperboard edge and direction-aware object shadow. The depth belongs to the physical sleeve and record only; the surrounding newspaper layout remains flat.
- Slow the Radar outline to 2.8 seconds, round the ink joins, repeat the render for each real saved Track shape, and crossfade the whole Featured Shape frame between records. Remove the unrelated red diagonal annotation beside the Radar.
- Make each Archive album entry one direct link. On pointer hover or keyboard focus, its cover shifts aside and reveals the corresponding theme-colored record; remove the redundant `OPEN ALBUM` control.
- Show an authenticated account's confirmed album score beside the centered Home title only when a saved album score exists. Never infer or average a missing album score.
- Resume the Home sequence after center click or double-click while retaining touch drag, side-cover selection, previous/next controls and reduced-motion behavior.

### Rejected

- Do not show records behind every neighboring cover, add depth to ordinary cards, or use glossy gradients and floating containers. Those treatments would make the physical cue repetitive and weaken the editorial hierarchy.
- Do not make artwork sampling a rendering dependency. Cross-origin artwork must remain visible even when its host disallows canvas access.

### Intentionally unchanged

- Routes, random album order, account authentication, cloud sync, Archive sorting, rating semantics, Import confirmation and all browser-local ratings, notes, Inbox, Memory and recovery data remain unchanged.

## Version 3.9.4 — Connected sleeves and unoutlined vinyl

Implementation commit: pending

### Evidence

- [Clairvoyant Design's Online Vinyl Store](https://www.clairvoyantdesign.ch/projects/online-vinyl-store) describes the record continuously sliding in and out of its cover as available horizontal space changes. Its project animation treats the disc as one near-cover-sized physical surface, with shadow and quiet grooves carrying the form rather than a hard circular outline.
- Owner review found that the first thickness attempt looked assembled from unrelated beige strips: it was too thick, did not meet at the corners, and ignored the artwork color. The center/neighbor size difference also remained too restrained for the intended Cover Flow hierarchy.

### Decision

- Increase the center-to-neighbor scale contrast to approximately 2:1 on desktop and tablet, with an even stronger phone hierarchy where side covers must remain legible without competing with the center.
- Set the visual disc diameter to 98% of the sleeve edge and extend its reveal to 1.8 seconds. Remove the hard outer border and replace the drawn concentric rings with very low-contrast groove texture and a simple spindle label.
- Sample two colors from every CORS-readable artwork: a saturation-weighted overall tone for the vinyl and a perimeter-only tone for the sleeve edge. When pixel access is blocked, both fall back to the same deterministic album-key tone.
- Replace the disconnected strip-and-shadow construction with one complete artwork-colored backing plane offset by 4px right/down, or left/down for left-facing covers. This keeps the top, side and bottom thickness connected through rotation while limiting the apparent depth.
- Apply the same record surface and connected sleeve construction to Archive hover/focus reveals so Home and Archive describe one physical object system.

### Rejected

- Do not copy Clairvoyant's white commerce shell, turntable interface, navigation, typography or black-only vinyl. The useful evidence is the physical relationship and continuous reveal; this archive retains its paper palette and artwork-derived record colors.
- Do not simulate thickness with beige borders, multiple unconnected strips, hard strokes or deep extrusions. Those details call attention to CSS construction instead of the record.

### Intentionally unchanged

- Cover sources, album routes, automatic rotation interval, Archive ordering, account scores, reduced-motion behavior and all browser-local or synchronized music data remain unchanged.

## Version 3.9.5 — Pressed grooves and moving light

Implementation commit: pending

### Evidence

- [Clairvoyant Design's Online Vinyl Store](https://www.clairvoyantdesign.ch/projects/online-vinyl-store) lets the vinyl surface remain physically legible while it slides from the sleeve: fine grooves, directional light and depth describe the object without a hard outer stroke.
- Current music-player interfaces also rely on material cues that survive at thumbnail scale, but this archive needs quieter reflections so the record does not become a glossy application badge or overpower the artwork.

### Decision

- Build the surface from three restrained layers: fine 5px pressed grooves, one broad directional reflection sector and shallow inset light/shade. Because these layers belong to the disc, they rotate and travel with it during the 1.8-second reveal.
- Retain the sampled artwork color beneath the reflection instead of forcing every release onto black vinyl. Keep the center label small and matte so the changing surface remains the primary physical cue.
- Share the same surface recipe across Home, Archive and Import. The amount of reflection is fixed and quiet enough to remain readable at 390, 1024 and 1440px without producing horizontal overflow.

### Rejected

- Do not add a circular border, chrome rim, neon flare, glass gradient or high-contrast concentric rings. Those treatments make the disc look illustrated or plastic rather than pressed.
- Do not copy a commercial music platform's brand colors or controls. Only the broadly established physical cues of groove, light and material depth are carried into the existing editorial system.

### Intentionally unchanged

- Cover artwork, record-color sampling, sleeve-edge sampling, navigation, content order, account state, synchronized data and all browser-local ratings and notes remain unchanged.

## Version 3.9.6 — Dominant color and adaptive Archive reveal

Implementation commit: pending

### Evidence

- Owner review found that averaging all artwork pixels produced muddy colors that did not correspond to the most visually prevalent cover field, and that an Archive record could be painted underneath the following grid item.
- The physical cue established by [Clairvoyant Design's Online Vinyl Store](https://www.clairvoyantdesign.ch/projects/online-vinyl-store) depends on the record, sleeve and available horizontal space behaving as one object; clipping or inter-card stacking breaks that relationship.

### Decision

- Replace saturation-weighted averaging with a reusable 64×64 quantized histogram. Similar RGB pixels are grouped into 24-step buckets and the largest bucket becomes the record color; the sleeve edge runs the same process over the image perimeter. Only extreme brightness is constrained for material visibility.
- Cache every source result in memory so the same artwork is sampled once across Home, Archive and Import. If a remote host blocks canvas access, retain the deterministic muted fallback rather than failing the cover or inventing metadata.
- Raise the active Archive card above the grid as one stacking context. The record remains behind its own sleeve but now passes visibly above neighboring cards.
- Adapt the last column at each layout: four-column desktop, three-column tablet and two-column phone. Shift the sleeve farther left and rotate the disc counter-clockwise; tablet and phone keep the disc farther inward so the reveal does not create horizontal overflow.

### Rejected

- Do not maintain hand-authored colors per album or require future users to classify artwork. That cannot scale with imported libraries.
- Do not clip the album grid to hide overflow, because that would crop the physical record. Do not force every edge card to reveal leftward; moving the sleeve creates room while preserving a consistent record-on-the-right object model.

### Intentionally unchanged

- Album ordering, routes, cover sources, vinyl groove/light treatment, rating data, account state, synchronized data and all browser-local notes remain unchanged.

## Version 3.9.7 — Tighter Archive album captions

Implementation commit: pending

### Evidence

- Owner review identified the miniature album-terrain graphic as two redundant grey rules beneath every cover. Its fixed chart height also separated the artwork from the album identity, especially in the two-column phone layout.

### Decision

- Remove the miniature terrain SVG from Archive album cards rather than cosmetically hiding its individual lines. Place rating availability, artist and album title directly after the cover with a 12px cover-to-status gap and a 5px status-to-artist rhythm.
- Update the page introduction so it no longer promises a compact terrain. Preserve the full album visualizations on detail and rating routes.

### Rejected

- Do not retain an empty chart spacer or replace the lines with another decorative divider. Cover artwork and aligned typography already establish each catalog entry.

### Intentionally unchanged

- Album sorting, direct card navigation, adaptive record reveal, dominant-color extraction, album detail pages and all stored music data remain unchanged.

## Version 3.9.8 — Prominent color and connected sleeve planes

Implementation commit: pending

### Evidence

- Owner review showed the failure of raw pixel population: 《纯妹妹》 is visually saturated, but its largest quantized bucket was a neutral highlight and produced grey vinyl.
- [Color Thief](https://github.com/lokesh/color-thief/blob/master/README.md) exposes palettes and semantic swatches rather than treating one raw RGB mode as universally representative. [Vibrant.js](https://github.com/jariz/vibrant.js/blob/master/src/Vibrant.coffee) explicitly scores saturation, luminance and population when choosing a prominent swatch.
- [MDN's `transform-style` reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style) establishes that non-leaf descendants must preserve 3D for separately transformed faces to remain in the same space. The [Recent Album Carousel](https://recent.design/i/x97ktju-album-carousel-ui) makes sleeve depth legible through connected faces, while [Clairvoyant Design's Online Vinyl Store](https://www.clairvoyantdesign.ch/projects/online-vinyl-store) keeps sleeve, record and available horizontal space behaving as one object.

### Decision

- Keep the 64×64 quantized histogram, but score eligible color buckets by population, chroma and usable luminance. A color must still occupy a meaningful share of the artwork; a tiny saturated logo cannot defeat the cover field. Neutral population remains the fallback for genuinely monochrome releases.
- Continue caching one result per artwork URL. 《纯妹妹》 now resolves to a saturated rose record rather than grey, while monochrome Ariana Grande artwork remains neutral.
- Replace the offset pseudo-plane with a six-plane sleeve: artwork front, full back, left/right edges and top/bottom edges. All edge faces use the sampled perimeter color with restrained light/dark mixing and `preserve-3d`; the depth remains 4px total.
- Give the centered Home sleeve a three-degree yaw so its physical edge can be seen without turning the cover into a showcase mockup. Use the same 1.8-second transform timing for Archive sleeve and vinyl.
- At the right edge of every Archive breakpoint, apply the exact same Y and Z rotations to vinyl and sleeve. Their translation differs to create the reveal, but their planes remain parallel throughout the motion.
- Reduce Featured Shape dwell time from 5.2 seconds to 4.4 seconds. The 2.8-second hand-drawn Radar and 1.08-second crossfade still complete before the following record.

### Rejected

- Do not choose the most saturated pixel regardless of area, hand-author colors per album, or turn every muted cover into colored vinyl.
- Do not fake depth with a second flat rectangle, disconnected strips, a thick extrusion or a generic drop shadow. Those approaches fail when the object rotates and expose unjoined corners.
- Do not let the record and sleeve use unrelated perspective angles at the last column merely to fit the viewport.

### Intentionally unchanged

- Artwork sources, routes, album ordering, record diameter, groove/light texture, rating semantics, synchronization and all browser-local music data remain unchanged.

## Version 3.9.9 — One record trajectory at every edge

Implementation commit: pending

### Evidence

- Owner review found that changing the disc and sleeve rotations in the last Archive column made the same object appear to use a different mechanism. The required behavior is one physical reveal across the grid, with only the available page space changing.
- The legacy AllMusic reference for 陶喆's 1997 self-titled album could render but did not provide a dependable CORS-readable image for color analysis. [Apple Music identifies the same 1997 release](https://music.apple.com/us/album/%E9%99%B6%E5%96%86%E5%90%8D%E5%B0%88%E8%BC%AF/1416149926) and exposes a stable artwork reference whose blue cover can be sampled by the shared palette extractor.
- Narrow-browser review showed that fixed pixel offsets and controls beneath the centered object made Cover Flow appear cropped and intermittently blocked repeated Prev/Next input.

### Decision

- Give every Archive album the same 34% disc travel, six-degree shared Y plane and record rotation. At the final column of each breakpoint, move the entire record-and-sleeve wrapper left; do not alter the internal reveal geometry.
- Replace the single canonical 陶喆 artwork reference in both profile and catalog data with the matching Apple Music artwork. Continue using the shared population/chroma extractor, not an album-specific hard-coded color.
- If a browser-local cover override fails, retry the canonical reference before showing `NO COVER`; update color sampling to the successful source. If both fail, retain the existing explicit typographic fallback without changing stored user data.
- Match the Import result disc to 98% of the sleeve edge and use the same 1.6-second physical reveal plane. Recompose phone Cover Flow with viewport-relative offsets, fewer distant covers and an overflow-safe stage.
- Raise Prev/Next into their own interaction layer, exclude them from drag capture and stop their clicks propagating into the stage, so repeated input remains available throughout cover transitions.

### Rejected

- Do not reverse the final-column record, rotate it onto another plane or shrink only that disc. Those tactics fit the viewport by breaking the shared physical model.
- Do not clear browser-local cover overrides, ratings, notes or synchronized records to repair an unavailable image. Do not hard-code a vinyl color for 陶喆 or any future imported album.

### Intentionally unchanged

- Archive ordering, album routes, stored cover overrides, carousel timing, rating semantics, account sync, notes, Inbox, Memory and recovery data remain unchanged. The larger DRAW / SLIDE / STAMP / SETTLE motion proposal is recorded in `TODO.md` but is not implemented in this version.

## Version 3.10.0 — The archive moves like printed matter

Implementation commit: `679afec`

### Evidence

- [Editorial New](https://editorialnew.com/) uses a rigid column grid, clipped oversized serif forms and roughly half-second staggered panel travel. The useful principle is that motion belongs to editorial structure rather than floating interface decoration.
- [Waxxy](https://www.waxxy.online/) treats sleeve, record, light and interaction as one physical system. The useful principle is continuous object causality: a record does not move independently of the space and sleeve that contain it.
- [Codrops Simple Stack Effects](https://tympanus.net/Development/StackEffects/) demonstrates spread, side-slide, coverflow, leaflet and queue transitions. The useful principle is that a collection can visibly reorganize without becoming a dashboard or losing the user's spatial context.

### Decision

- Limit the whole product to four verbs: `DRAW` for listening geometry, `SLIDE` for records and printed sheets, `STAMP` for completed decisions, and `SETTLE` for collections and analysis points. Keep route movement around 260–340ms, record reordering around 420–560ms and long material reveals separate from ordinary button feedback.
- Use a six-column paper reveal only for Home, annual Journal and Taste DNA entrances. It plays once, leaves the content still and collapses to four columns on phones.
- Give Archive Track filtering a FLIP-style shelf reordering, draw compact listening geometry only on hover or keyboard focus, enlarge a selected album briefly before navigation, and unfold artist albums chronologically like record spines. Existing colored-vinyl and sleeve geometry remains the only continuously material object.
- Redraw an adjusted Rate Radar as red ink, preserve one fading prior outline, roll only the changed numeral, lift the active album waveform point and stamp successful saves. A score at 10 or above receives one quiet paper-colored ink bloom with no glow or celebration.
- Let Sonic Map points keep stable transition identities when axes change; settle Taste DNA as aligned tracing sheets; draw Listening Portrait only on entry; reveal Blind Spots through a horizontal print mask.
- Stage Import as a counted read, metadata proof and downward track ledger before a small completion stamp. Present Journal rediscovery as a slightly offset clipping, dates as stamps, annual sections with page-edge marks and changed ratings with the old number faintly remaining underneath.
- Group Search results by fixed record type, underline only the matching phrase in red, settle result slips in reading order and expose keyboard focus with a short rule. Drop the account panel from the masthead and reduce successful synchronization to `SYNCED · HH:MM`.

### Rejected

- Do not use Codrops Bouncy Grid, Elastic Spread or large random rotations. Their rebound and disorder conflict with the archive's quiet evidence hierarchy.
- Do not copy Editorial New's monochrome palette, typography or full-screen interaction model, and do not copy Waxxy's dark player chrome, playback controls or tonearm. These references supply motion logic, not a replacement identity or new product capability.
- Do not add shadows to page groups, search results, account controls or ordinary cards. Existing object-only shadows remain reserved for sleeves, vinyl and other explicitly physical pieces.
- Do not require animation to understand a score, operate a chart or navigate. Numeric controls, visible buttons, keyboard focus and reduced-motion still expose the complete workflow.

### Intentionally unchanged

- Routes, information architecture, scores, import confirmation, account ownership, cloud merge behavior, local storage keys, notes, Inbox, Memory, metadata evidence and recovery data are unchanged.

## Version 3.10.1 — A narrow cover flow keeps its caption underneath

Implementation commit: pending

### Evidence

- Owner review of the narrow browser found the Home Cover Flow caption appearing beside the centered cover instead of reading as one cover-then-metadata unit.
- The previous phone stage placed the object too low and allowed the caption to participate in the same transformed block without reserving a clear vertical metadata lane; the mobile tab bar then made the caption appear clipped or displaced.

### Decision

- Keep the existing multi-record Cover Flow and its 3D sleeve/disc treatment unchanged.
- At widths up to 760px, move the object higher, reserve a taller stage, and pin the caption to the object’s lower edge with a full-width vertical lane. The centered record still reveals its disc and the surrounding records remain quiet.
- Version the stylesheet and offline shell as UI 3.10.1 so the correction is fetched instead of being hidden behind the previous cached CSS.

### Rejected

- Do not remove album captions, flatten the Cover Flow into a generic horizontal list, or alter the desktop/tablet perspective to compensate for a phone-only layout issue.

### Intentionally unchanged

- Album order, cover sources, sleeve depth, vinyl material, Prev/Next behavior, scoring, sync, routes and stored browser data remain unchanged.
- A fresh 390px browser screenshot is still required after the local browser usage limit recovers; 1024px and 1440px must be checked alongside it before publishing.

## Version 3.10.2 — The narrow shelf keeps its depth

Implementation commit: pending

### Evidence

- Owner review found that the narrow Home shelf stopped at two visible covers on either side, unlike the wide Cover Flow's longer depth sequence.
- A mismatched cached `cover-tone.js` query could also leave two otherwise identical previews with different artwork-derived record colors.

### Decision

- Keep the mobile center cover and caption geometry from UI 3.10.1, but reveal the third left/right records at low opacity and shared perspective. The edge records remain non-interactive so they cannot steal the swipe or click target.
- Version the shared cover-tone module query and offline shell together with the responsive CSS so all Home, Archive and Import previews use the same current palette extractor.

### Rejected

- Do not reveal every record at full opacity, allow edge covers to create horizontal overflow, or shrink the centered cover until it loses its listening focus.

### Intentionally unchanged

- Cover ordering, sampled-color algorithm, physical sleeve geometry, rating display, navigation controls, routes and local data remain unchanged.
- Three-width screenshot verification remains pending until the local browser preview can be captured again.

## Version 3.10.3 — Narrow Cover Flow opens its neighbors

Implementation commit: pending

### Evidence

- Owner review found that the phone-sized center sleeve occupied so much of the stage that the neighboring covers were effectively hidden.
- The previous `黑色柳丁` artwork reference came from a ByteDance image host and repeatedly failed to load in the browser. The exact [Apple Music album page](https://music.apple.com/us/album/%E9%BB%91%E8%89%B2%E6%9F%B3%E4%B8%81/914664926) confirms the David Tao release and its 2002 identity; the matching [Spotify artwork CDN](https://i.scdn.co/image/ab67616d0000b27365b1e21638ebf5f08910eea2) provides a stable direct image URL for the static client.

### Decision

- Reduce only the narrow center sleeve scale and width, then widen the visible side-1/side-2 spacing and keep a quiet side-3 reveal. Desktop and tablet Cover Flow geometry remain unchanged.
- Replace the broken `黑色柳丁` primary cover with its direct Spotify artwork URL and keep an independent JD CDN image as a browser-level fallback. The fallback is used only when the primary image emits an error; no artwork is downloaded or stored locally.
- Teach Home and Archive cover source resolution to honor an album-level fallback while preserving any owner-selected local cover override as the first choice.
- Send cover requests without a page referrer, reducing false hotlink blocks from image CDNs while keeping the artwork as a remote reference.
- Version the app shell and module imports as UI 3.10.3 so a stale service-worker cache cannot keep the failed URL or old narrow geometry.

### Rejected

- Do not make the phone center sleeve tiny, flatten the 3D perspective, or reveal side covers as interactive controls; the center remains the listening focus and side records remain contextual.
- Do not add a generic placeholder as the primary artwork or silently download third-party cover art into the repository.

### Intentionally unchanged

- Album order, scoring, sleeve geometry on wider screens, metadata, import data, sync, routes and local browser records remain unchanged.
- Three-width screenshot verification remains pending until the local browser preview can be captured again.

## Version 3.10.4 — Local artwork stays local

Implementation commit: pending

### Evidence

- Owner review identified that some complex or cross-domain artwork cannot be made reliable by changing remote URLs alone; album details need an owner-controlled local source.
- The existing cover reference form accepted only HTTPS URLs, so it could not solve blocked hosts, expiring links or browser CORS restrictions without asking the owner to host the image elsewhere.

### Decision

- Add a local image-file input on every album detail's `COVER REFERENCE` section. The browser crops the chosen image to a square, compresses it to a bounded WebP/JPEG data URL and stores it only under a separate local-cover key in this browser.
- Show an immediate temporary preview, persist the optimized cover across reloads, and make `USE CANONICAL COVER` remove both local and remote overrides. A remote HTTPS URL remains available as an optional fallback for owners who prefer a hosted reference.
- Keep local image data out of the existing encrypted account backup/sync payload; it is not uploaded to the Worker or public repository. Home and Archive resolve local → remote override → canonical → album fallback in that order.
- Reject non-images, unreadable files, files over 20 MB and encoded covers over roughly 2.4 MB so browser storage remains recoverable instead of failing silently.

### Rejected

- Do not upload local artwork to the Worker, GitHub Pages or a third-party image host.
- Do not replace the cover with a permanent base64 blob in the catalog JSON; the override must remain editable and device-local.

### Intentionally unchanged

- Canonical metadata, album ordering, rating data, cloud sync semantics, route structure and external artwork references remain unchanged.
- Browser visual verification remains pending until the local browser can be inspected at all three target widths.

## Version 3.10.5 — Email and GitHub are parallel login paths

Implementation commit: pending (planning clarification; no runtime auth change yet)

### Evidence

- Owner review rejected a mandatory “bind email to GitHub” step. The product needs two convenient sign-in methods, not a second account-management task.

### Decision

- Treat passwordless email and GitHub OAuth as independent authentication providers. Each provider can create or open an account without asking the user to connect the other provider.
- Use the provider's verified email as the only automatic continuity signal: an exact, case-insensitive email match resolves to the same account space. A different, missing or unverified email stays a separate account and never triggers an archive merge.
- Keep the authenticated provider identity visible in Account so users can tell whether they entered through GitHub or email. If a provider does not release a verified email, do not guess from a username or display name.
- Do not add a manual binding/unbinding screen to the first email-login implementation. If a future provider limitation requires recovery, handle it as an explicit support/recovery flow with confirmation and audit evidence.

### Rejected

- Do not require a GitHub sign-in before allowing email registration.
- Do not silently merge two archives because names look similar, and do not treat a manually typed email as verified ownership.

### Intentionally unchanged

- Existing GitHub OAuth, automatic sync, encrypted payload boundary, D1 schema and local music records remain unchanged until passwordless email authentication is implemented.

## Release record — UI 3.10.4 cover reliability

Implementation commit: `4b40942`

### Evidence

- Owner review found that the narrow Home Cover Flow hid its neighboring sleeves, the `黑色柳丁` artwork host was unreliable, and remote image references alone could not guarantee album artwork across browsers.
- The staged UI 3.10.1–3.10.4 decisions above describe the individual layout, fallback and local-cover iterations that are consolidated in this implementation commit.

### Decision

- Publish the current narrow Cover Flow composition, stable primary/fallback artwork resolution, no-referrer image requests and browser-local album-cover override as UI 3.10.4.
- Keep the local override outside account synchronization, the Worker, canonical JSON and GitHub Pages assets. Preserve canonical artwork as the reset destination.
- Record the owner-selected [Jessel Nieman Grain Layer](https://www.jesselnieman.com/notes/effortlessly-add-a-grain-layer-to-your-website-in-webflow) as the primary reference for a later realistic-paper pass; no new paper treatment is included in this release.

### Rejected

- Do not delay this cover-reliability release by combining it with an unimplemented paper-texture redesign or passwordless email authentication.
- Do not publish local reference screenshots, favicon exploration boards or handoff files with the site.

### Intentionally unchanged

- Application version remains `0.9.15`; this release advances the UI/cache identifier to 3.10.4.
- Ratings, notes, Inbox, Memory, account data, synchronization semantics and existing route structure remain unchanged.

## Version 3.11.0 — Search belongs to the Archive

Implementation commit: `db24530`

### Evidence

- The owner-approved [button and function relationship diagram](https://www.figma.com/board/04BSlUo6hbYawuDeLARWAl/How-I-Hear-Music-%E2%80%94-%E6%8C%89%E9%94%AE%E4%B8%8E%E5%8A%9F%E8%83%BD%E5%85%B3%E7%B3%BB%E5%9B%BE?node-id=0-1) treats Archive as the browsing and retrieval hub rather than giving Search equal top-level weight.
- Search was exposed in the desktop masthead, the narrow menu and mobile More while its results already opened Archive records or evidence attached to those records. The repeated entry points added navigation weight without adding another distinct workflow.

### Decision

- Remove Search from the desktop masthead, narrow navigation and mobile More panel. Mobile More now contains only Import and Journal.
- Place the existing complete local index directly on the Archive landing page, before the Track / Album / Artist gates. Keep the current typesetter-style underline, grouped results and keyboard-accessible controls.
- Preserve Track, Album, Artist, Journal, Album Note, Memory and Taste DNA search coverage. Queries remain browser-local and are never sent to the Worker.
- Normalize every legacy `/search?q=…` navigation to `/archive?q=…`, including project-site route recovery, so old bookmarks continue to work without retaining a second page.
- Advance the application to `0.9.16` and the UI/cache identifier to 3.11.0. Verify 1440 / 1024 / 390px, English and Simplified Chinese, with zero horizontal overflow.

### Rejected

- Do not keep a hidden or secondary Search link in the masthead merely for familiarity; Archive is now its single visible home.
- Do not reduce the index to Tracks alone, duplicate the search field on every Archive subpage, or delete the old route without a redirect.
- Do not redesign search results into cards or introduce another modal, drawer or bottom sheet for this consolidation.

### Intentionally unchanged

- Archive Track filtering remains a focused control on the Track list and is separate from the cross-record Archive index.
- Search ranking, result grouping, local data, ratings, notes, account synchronization, Import, Journal and Taste routes remain unchanged.

## Version 3.11.1 — One QQ import desk

Implementation commit: `cf5c470`

### Evidence

- The owner asked to merge QQ Music playlist import and QQ Music album import into one intelligent entry point, rather than requiring users to choose the record type before pasting a share.
- QQ share text may contain a short or redirected public URL, so simple client-side URL-pattern matching would misclassify some links. The existing local adapter and hosted Worker already resolve public QQ redirects for their separate playlist and album workflows.

### Decision

- Replace the two visible QQ import navigation items with one `QQ Music Smart Import` desk and one share-text field.
- Add a matched local-Node/Cloudflare-Worker smart-preview endpoint. It resolves the album route first, falls back to playlist resolution when the link is a playlist, and returns an explicit `type` before the browser renders anything.
- Reuse the existing playlist-to-Inbox preview and album official-sequence/duplicate-analysis preview after classification; no imported data is written before the owner confirms it.
- Normalize legacy `/import/qq-album?url=…` requests to `/import/qq?url=…`, keeping shared album links usable.

### Rejected

- Do not ask the user to choose “album” or “playlist” before pasting a QQ share.
- Do not classify short links solely in browser code, or merge the separate downstream review semantics into an opaque one-click import.

### Intentionally unchanged

- NetEase remains a public-playlist-only import flow.
- QQ public-data limits, no-login/no-Cookie/no-audio/no-lyrics policy, Inbox lifecycle, album duplicate checks, local-data and sync boundaries remain unchanged.
