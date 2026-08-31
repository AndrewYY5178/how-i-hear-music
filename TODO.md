# How I Hear Music — To Do

This file records planned work that is not complete yet. The current site is a personal archive, an interactive rating prototype and a playlist-import inbox prototype.

## Completed accessibility and feedback — UI 3.4

- [x] Add a persistent English / Simplified Chinese switch to desktop and mobile navigation without clearing unsaved form state.
- [x] Translate all six module entry points, core subpages, dynamic save/import/error feedback and accessible control labels while leaving music and artist names intact.
- [x] Match the English editorial hierarchy with Noto Serif SC for Chinese display/body copy and Noto Sans SC for navigation/metadata.
- [x] Give Rate and Import primary actions a consistent 24px separation from their explanatory copy.
- [x] Make successful Track and Album saves announce and focus a visible status panel with view/undo actions.
- [x] Repair local deep-link preview routing so a directly opened route redirects once into the SPA rather than resolving assets below the route path.
- [x] Verify the six module roots, language persistence, desktop/mobile overflow, typography, action spacing and saved-rating feedback in a real browser.

## Completed Chinese editorial polish — UI 3.4.1

- [x] Rewrite literal translations around each module's actual task and preserve one consistent first-person editorial voice.
- [x] Localize dynamic counts, Taste DNA evidence, Inbox states, backup guidance, Memory zones, Year in Music evidence and annual awards.
- [x] Keep artist, Track and Album names in their recorded language instead of treating them as untranslated interface copy.
- [x] Audit 33 routes for residual interface English and horizontal overflow; repeat the annual page check at 390 × 844.

## Completed Chinese heading punctuation — UI 3.4.2

- [x] Remove a final Chinese full stop from translated H1–H3 headings without changing the same sentence when it appears as body copy.
- [x] Preserve question marks and other meaningful title punctuation.
- [x] Verify representative Home, Archive, Rate, Taste, Import and Journal headings in a real browser.
- [x] Force each new offline-shell release to fetch fresh first-party assets instead of repopulating its new cache from a still-fresh HTTP cache. *(Delivery repair released as UI 3.4.3.)*

## Completed bilingual masthead fit — UI 3.4.4

- [x] Reduce the language switch's visual width while retaining a usable 40px vertical target.
- [x] Normalize desktop header utility spacing to the 16px token.
- [x] Switch to the compact menu masthead at tablet widths before English navigation overlaps the right-side tools.
- [x] Verify English and Chinese header geometry across desktop, tablet and mobile widths.

## Active integrity closure — UI 3.3

### Rating and identity integrity

- [x] Remove fabricated album tracks and preset scores; block album rating until a confirmed ordered track list exists.
- [x] Replace invalid Track/Album route fallbacks with explicit not-found states that cannot save against another record.
- [x] Persist album track scores into the same current Track rating store and lifecycle used by individual ratings.
- [x] Validate every album Overall and track score at the domain boundary before storage.
- [x] Keep Journal record identity immutable during ordinary historical correction.

### Data recovery and provenance

- [x] Add backup restore preview, conflict policy and one-step full restore rollback.
- [x] Store metadata provenance per field and avoid copying unchanged canonical values into local overrides.
- [x] Add normalization/dead-zone handling so neutral Sonic values and equivalent language labels do not create false Blind Spots.

### Delivery and verification

- [x] Version offline caches per release without mutating the active worker's cache.
- [x] Make adapter host/version configuration deployable and keep the outbound User-Agent aligned with the service version.
- [x] Expand regression coverage for invalid routes, album persistence, restore conflicts, provenance and neutral analysis.
- [ ] Complete real desktop/tablet/mobile browser QA for the published UI 3.3 release. *(Published to `main` as `bf04c77`; browser verification remains open.)*
- [ ] Curate confirmed Album, release-date, language and region metadata for the 41 canonical Tracks; current canonical coverage remains zero until sources are supplied or verified.
- [ ] Generate crawlable static snapshots and a broadly supported raster social image for the core routes.
- [ ] Consolidate the accumulated CSS media-query cascade only after visual baselines can be captured in a real browser.

## Active closure — UI 3.2

### Personal data and correction

- [x] Add optional password-encrypted backup export/import without removing the readable JSON workflow.
- [x] Add storage quota reporting and warn before local usage becomes risky.
- [x] Let Journal entries be edited as well as removed, while keeping canonical records and current ratings separate.
- [x] Add a complete rating-history correction view instead of limiting undo to the immediately preceding save.
- [x] Expand metadata provenance from one free-text note to source URL, evidence note and visible local revision time; add a missing-only review filter.
- [x] Add private album notes to Album detail, backup and Search without turning them into public reviews.
- [x] Let playlist sources be renamed, refreshed and removed without deleting imported tracks, ratings or notes.

### Service and delivery resilience

- [x] Add adapter health/version endpoints, bounded cache cleanup, configurable trusted-proxy handling and structured request/error logs.
- [x] Add an offline shell with explicit update behavior for the static archive; never cache live metadata API responses.
- [x] Improve crawler/deep-link metadata without introducing a build framework or changing the History API product structure.

### Analytical trust and verification

- [x] Add evidence-gated language, era and Sonic coverage gaps to Blind Spots only when metadata coverage is sufficient.
- [x] Add automated accessibility/static-security checks and interaction regression coverage for destructive/correction flows.
- [ ] Complete real desktop/tablet/mobile browser QA, record every intentional non-change and publish the verified version.

### External boundaries

- [ ] Deploy the metadata adapter only after a hosting target, HTTPS origin and credentials are explicitly supplied.
- [x] Retain the documented local-first/no-account boundary; account sync remains intentionally out of scope until the product owner chooses an authentication/privacy model.
- [ ] Obtain qualified legal review before commercial use or broader public expansion.

## Active hardening — Reliability and product closure

### Phase 1 — Honest deployment and durable local data

- [x] Make static-host import availability explicit and support a configurable hosted metadata-adapter base without changing provider/privacy boundaries.
- [x] Add versioned local-data migrations, storage health reporting, snapshot recovery and automatic backup reminders.
- [x] Add a dedicated Data Desk for export, restore, recovery and privacy information; include all analytical/manual data in its backup boundary.

### Phase 2 — Metadata and retrieval

- [x] Add one global search across Tracks, Albums, Artists, Journal, Memory and Taste traits.
- [x] Add metadata coverage reporting and a local owner-confirmed metadata editor for album, release date, language and region.
- [x] Make Archive filtering/sorting cover rating, title, artist and Taste DNA evidence without inventing metadata.

### Phase 3 — Analytical trust and correction

- [x] Expose contributing and limiting evidence for every Taste DNA trait and explain what its strength/confidence values mean.
- [x] Show Entropy evidence count, available dimensions and low-evidence caveats; avoid false precision.
- [x] Make Memory importance affect ordering and expose provenance consistently.
- [x] Add safe undo/correction for newly saved ratings and explicit removal of mistaken Journal entries without deleting canonical records.

### Phase 4 — Accessibility, maintainability and verification

- [x] Add textual equivalents for compact geometry and normalize analytical copy around one evidence vocabulary.
- [x] Split shared backup/deployment/search logic out of page templates and cover migrations, metadata overlays, recovery and route rendering with automated checks.
- [ ] Complete desktop/tablet/mobile/browser QA, append the design/version record and publish every repository-complete fix. *(Automated route/data checks pass; no controllable browser instance was available for this pass.)*
- [x] Document the remaining external dependencies: hosted adapter deployment credentials and qualified legal review.

## Active feature — Advanced Taste system

### Phase 1 — Shared analytical foundation

- [x] Add one evidence-based Taste Trait schema that reuses ratings, `Why This Works`, sonic descriptors, history and confirmed versions without creating genre labels or duplicate track records.
- [x] Add reusable Track Glyph, Album Terrain, Artist Signature and Taste Trait Mark geometry primitives with one stroke/grid/annotation contract.
- [x] Add a compatible manual/derived Memory Entry schema and deterministic Archive Entropy utilities.

### Phase 2 — Taste DNA and Archive Entropy

- [x] Add `/taste/dna` as a vertical editorial reading of recurring traits, requiring at least five supporting tracks and exposing score, confidence and evidence count.
- [x] Show only explicitly supported recurring-trait matches on Track detail.
- [x] Add `/journal/entropy` with one neutral time-series visual and supporting artist concentration, trait diversity, era spread, album depth and exploration rate explanations.

### Phase 3 — Music as Geometry

- [x] Embed compact Track Glyphs, Album Terrains and Artist Signatures into their respective Archive indexes/details without showing all forms at full size together.
- [x] Extend Listening Portrait composition to reuse the shared geometry system rather than maintain a separate visual vocabulary.

### Phase 4 — Blind Spots and Memory Palace

- [x] Add `/taste/blind-spots` with evidence-gated trait and album-depth coverage gaps; use exploratory language and no more than five entry points. *(Sonic/era gaps remain absent when reliable coverage metadata is unavailable.)*
- [x] Add `/journal/memory-palace` as a manually curatable 2D archive of First Discoveries, Growers, Perfect Moments, Personal Canon, Reinterpretations and Turning Points.
- [x] Reprioritize Memory Palace into vertical archive sections on mobile, retain contextual return actions and avoid literal 3D/palace decoration.
- [x] Complete automated and browser QA, append the design/version record, and publish the connected system. *(UI 3.0; implementation commit `21e0af2`.)*

## Active maintenance — UI 2.1 visual refinement

- [x] Reduce oversized long subpage headings while preserving Home's display-scale hero.
- [x] Normalize the new analysis forms, select controls, keyboard focus and readable content measures.
- [x] Improve mobile chart annotation legibility and make empty analysis states occupy their intended grid width.
- [x] Re-run desktop/mobile visual QA, append the design record and publish the refinement. *(UI 2.1; implementation commit `ae79e88`.)*

## Active feature — Personal analysis expansion

### Phase 1 — Shared evidence foundation

- [x] Unify `Why This Works` around ten explicit insight tags while preserving existing saved reasons and `ONE MOMENT` data.
- [x] Normalize non-destructive rating history so the latest rating is current and every earlier save remains available to Rediscovery, Grower and Awards.
- [x] Extend the owner-confirmed recording-version model with Rearranged, Demo and Remix without inferring identities.
- [x] Add four independent bipolar sonic descriptors—Warm/Cold, Dense/Sparse, Direct/Abstract and Controlled/Loose—to local track evidence and backup/restore.

### Phase 2 — Immediate listening-memory features

- [x] Add `Why This Works` analytics to Taste Profile, including evidence-gated percentages among tracks rated 9+.
- [x] Add a Journal Rediscovery Queue for Archive tracks whose latest rating is at least six months old, with `RATE AGAIN` and non-destructive `SKIP FOR NOW`.
- [x] Generate a deterministic, neutral Album Narrative from confirmed waveform geometry only.

### Phase 3 — Visual comparison and organization

- [x] Replace the static multi-Radar version display with an accessible Version Morph between two explicitly confirmed recordings and numeric dimension deltas.
- [x] Add track-level sonic descriptor editing and a two-axis `/taste/sonic-map` whose axes can be changed without treating character as quality.
- [x] Add a manually curated `/taste/family-tree` Taste Constellation in which artists or tracks may belong to multiple groups.

### Phase 4 — Long-term synthesis

- [x] Add evidence-gated `/taste/anti-recommendation` patterns derived from multiple low-resonance ratings, never hardcoded genre assumptions.
- [x] Add manually confirmed Personal Music Awards to annual Journal pages, with evidence-based candidates and `NO SELECTION` support.
- [x] Add all-time and annual Listening Portraits that sample existing Radars and album Waveforms into a stable editorial artwork rather than a dashboard.
- [x] Complete desktop/mobile/accessibility QA, append the design/version record and publish each finished phase without redesigning unrelated pages. *(UI 2.0; implementation commit `602487d`.)*

## Active feature — Listening memory system

### Phase 1 — Import lifecycle and Unrated Queue

- [x] Give every imported local track one visible lifecycle state: `IMPORTED`, `HEARD`, `RATED` or `ARCHIVED`.
- [x] Keep imports out of the Archive until an explicit archive action.
- [x] Add an Unrated Queue that prioritizes heard-but-unrated tracks and links directly into Rate.
- [x] Preserve lifecycle fields in the existing local backup and restore flow.

### Phase 2 — Why this song stays

- [x] Replace generic listening tags with the eight listening reasons: Melody, Arrangement, Vocal, Harmony, Groove, Lyric, One Moment and Can't Explain.
- [x] Reveal a required timestamp and short observation only when `ONE MOMENT` is selected.
- [x] Keep the long private note available but collapsed by default, so the Radar and listening reasons lead the page.
- [x] Carry saved reasons and confirmed moments into Journal entries without inventing timestamps.

### Phase 3 — Year in Music

- [x] Add a year summary generated only from locally saved ratings and Journal evidence.
- [x] Report highest track, highest album, average rating and most frequent listening reason when evidence exists.
- [x] Derive grower, disappointment, new discovery and strangest rating from explicit transparent rules; show `NOT ENOUGH EVIDENCE` when the required history is absent.
- [x] Run desktop/mobile QA, append the design/version record, and publish the completed phases. *(UI 1.7; implementation commit `d0a959a`.)*

## Active feature — QQ Music ordered album import

- [x] Recognize a QQ Music desktop/mobile album link or share text and reject playlist/track links explicitly.
- [x] Fetch public album metadata and the exact album tracklist through a server-side adapter only.
- [x] Normalize and sort tracks by `discNumber`, then `trackNumber`, with provider order only as a fallback.
- [x] Show the complete ordered tracklist and duplicate analysis before writing local data.
- [x] Store one canonical local album record, ordered local tracks, provider mappings and an import log without using QQ IDs as canonical IDs.
- [x] Render imported single- and multi-disc tracklists in Archive and initialize Rate Album from that confirmed sequence.
- [x] Preserve album-import records in local backup/restore and prevent duplicate album creation.
- [x] Add adapter tests, browser QA, design/version notes and publish the completed feature. *(UI 1.8; implementation commit `e096c4a`.)*

## Active refactor — Modular product architecture

- [x] Replace the long single-page experience with the six-route product structure: Home, Archive, Rate, Taste, Import and Journal.
- [x] Add archive browse/detail routes for Tracks, Albums and Artists.
- [x] Move all rating interactions into the dedicated Rate workspace.
- [x] Move listening philosophy and visitor comparison into Taste.
- [x] Move QQ import and Inbox into dedicated Import routes.
- [x] Add a lightweight Journal route for rating changes and discoveries.
- [x] Audit desktop and mobile route rendering; fix Archive track rendering, remove Home horizontal overflow, and add contextual return actions to every non-Home route.
- [x] Establish design rules and refine Home, Archive, Taste, Import and Rate around a single visual gravity per page; add visual route markers and reduce QQ import / rating density.
- [x] Complete strict visual QA and cleanup across all existing routes: align shared editorial edges, normalize core spacing and type rhythm, unify gate icons, and harden responsive/touch layouts without adding features.
- [x] Recover the pre-modular editorial material palette where it strengthens module identity: warm Archive paper, pale Taste/Import/Journal paper, and the dark Rate studio—without restoring the former single-page layout.
- [x] Tune the recovered visual language after route review: reduce the Home radar, align Archive/Taste gate systems, restore the original olive Rate studio, and reinstate paper fibre texture.
- [x] Give every top-level module a distinct, low-saturation paper material while retaining the shared editorial palette and route structure.
- [x] Standardize Journal as a reading-first notebook: expose saved listening notes, add a direct empty-state action, and remove low-contrast color flashing between modules. *(UI 1.2; documented in `DESIGN_LOG.md` and `musicmemory.app.md`.)*
- [x] Run a reachable-route regression pass and fix the late-cascade Home mobile overflow; restore 40px mobile touch targets without changing the typographic link treatment. *(UI 1.3; 140 desktop and mobile routes audited.)*
- [x] Complete interactive rating state: close stale mobile menus, remove repeated global pointer listeners, and make Radar/Waveform sliders work by drag and keyboard. *(UI 1.4; verified in an isolated browser storage origin.)*
- [x] Harden static publishing: preserve module routes under the GitHub Pages project path, migrate legacy hash links, recover deep refreshes, and restore readable Rate metadata contrast. *(UI 1.5; verified in root and project-subpath browser origins.)*
- [x] Complete a post-deployment production crawl: repair 40px disclosure targets, use editorial record names in browser titles, and eliminate the Home Featured Shape overflow at the 768px tablet breakpoint. *(UI 1.6; 130 production routes audited at desktop and mobile sizes.)*

## P0 — Make playlist import genuinely useful

- [x] Recognise a pasted QQ Music or NetEase share card, extract its public link and retain it as source provenance.
- [x] Import a public QQ Music playlist from its URL and extract visible track metadata automatically. *(Server-only public metadata adapter; verified against a public 38-track playlist on 2026-08-28.)*
- [x] Search the QQ Music public catalog and add an individual result to Inbox.
- [x] Import a public NetEase Cloud Music playlist from its URL and extract visible track metadata automatically. *(Server-only public metadata adapter; verified against NetEase’s public 热歌榜 on 2026-08-29.)*
- [x] Confirm a platform-approved method before adding login, cookies or private-playlist access. *(No approved private-access method is established; login, Cookie and private-playlist access are deliberately not implemented.)*
- [x] Add a clear import error state for private, unavailable or unsupported QQ Music playlist links.
- [x] Preserve the original playlist URL, source platform and import timestamp for every imported track.
- [x] Use a server-side adapter for the first production importer; it accepts only public share links and returns metadata only. No browser Cookie, audio or lyrics access.
- [x] Add a repeatable public-adapter smoke check so upstream QQ Music or NetEase response-shape changes are detected before release. *(Run `npm run check:adapters`; verified 38 QQ tracks and 200 NetEase tracks on 2026-08-29. Replacement is only needed if this check later fails.)*

## P0 — Turn the inbox into a real library workflow

- [x] Add a local canonical-library store separate from `data/songs.json`.
- [x] Make `KEEP` move a track from Music Inbox into the local personal library instead of only removing it from the inbox.
- [x] Add a `RATE` action from the inbox to the four-dimension rating card.
- [x] Add a `REVIEW` state for uncertain matches.
- [x] Add a `NEW ENTRY` state for tracks that do not match existing records.
- [x] Add a safe export/import format so localStorage data can be backed up and restored. *(Versioned JSON; compatible records merge without deleting existing browser data.)*

## P1 — Canonical music database

- [x] Give every canonical track an independent ID such as `track_000123`.
- [x] Separate Artist, Album, Track and Release/Recording records. *(Generated `data/catalog.json`; source ratings remain in `data/songs.json`.)*
- [x] Store provider IDs for QQ Music and NetEase Cloud Music without using them as canonical IDs. *(Imported records use `providerRefs`; canonical IDs remain independent.)*
- [x] Store legitimately available release dates and official external reference URLs, with nullable ISRC/UPC fields in the canonical schema and imports. *(The current public playlist responses do not expose trustworthy ISRC/UPC values, so they remain `null` rather than inferred.)*
- [x] Match the same track across QQ Music and NetEase Cloud Music. *(Exact local matches merge provider references.)*
- [x] Add confidence levels: `AUTO MATCH`, `REVIEW`, `NEW ENTRY`.
- [x] Add fuzzy matching for title and artist names; album remains supporting metadata rather than a hard match requirement.
- [x] Keep versions distinct: Studio, Live, Acoustic, Remastered and other clearly identified recordings. *(Recording records have an explicit nullable `versionType`; no version is inferred.)*
- [x] Separate Composition from Recording/Version so one composition can have multiple performances.
- [x] Preserve a track's ratings and notes when an external playlist removes it. *(Snapshot sync reports a removal but never deletes Inbox, Library, rating or Journal records.)*

## P1 — Cover and metadata handling

- [x] Decide on an allowed cover-art source and document its usage rights. *(See `ASSET_POLICY.md`; legacy external references remain provisional.)*
- [x] Decide not to collect automatic cover references for imported tracks; playlist imports remain metadata-only and manual HTTPS overrides are explicit.
- [x] Do not silently download or republish third-party cover art.
- [x] Add a manual local-only HTTPS cover-reference override for records whose canonical reference is wrong.
- [x] Add a consistent fallback when a cover is unavailable or fails to load.

## P1 — Interactive archive expansion

- [x] Add a four-dimension Radar visual to the listening lab, including live visitor feedback and visitor/Andrew comparison after reveal.
- [x] Add a data-driven album Overall Waveform renderer with Peak, Low, Average and Consistency metrics; it stays empty until a confirmed track sequence is supplied.
- [x] Add confirmed official album sequences through QQ Music album import; the Waveform remains scoreless until the imported tracks or album session are rated.
- [x] Expand beyond the former six-song deck: every confirmed Archive track can open the four-dimension Rate workspace.
- [x] Add user-confirmed Musical Moments through the `ONE MOMENT` reason; a timestamp and observation are required and never inferred.
- [x] Add version-specific ratings and comparisons. *(Owner-confirmed local version identities; each recording receives an independent four-dimension rating and side-by-side Radar comparison. UI 1.9; implementation commit `00eb7a2`.)*
- [x] Add album-level rating with an interactive waveform and saved overall score.
- [x] Add album comparison after Andrew confirms an album-level score or a complete ordered track sequence. *(Comparison is evidence-gated and preserves missing scores as `—`. UI 1.9; implementation commit `00eb7a2`.)*
- [x] Add rating history and changes over time. *(Track and album details read saved Journal history.)*
- [x] Add optional local-only notes for why a song was kept, ignored or revisited.
- [x] Add a private, local-only Taste Match view after at least three comparable visitor ratings exist.
- [x] Consider and deliberately defer a Discovery route until the archive contains enough structured listening evidence to produce transparent, useful suggestions.

## P2 — Sync and account features

- [x] Add manual `SYNC NOW` for locally stored public QQ Music and NetEase playlist sources.
- [x] Detect additions and removals between two playlist snapshots, with explicit add-and-save or snapshot-only actions.
- [x] Deliberately keep sync manual; scheduled sync is not added without confirmed platform terms, deployed-server reliability and user consent.
- [x] Decide whether accounts are necessary: no accounts or comments are needed for the current local-first archive.
- [x] Record the account boundary: authentication, server profiles and associated deletion/privacy flows are out of scope unless the product direction changes.

## P2 — Site maintenance

- [x] Replace undocumented remote-font and remote-cover assumptions with `ASSET_POLICY.md`; self-hosting fonts remains a deployment choice.
- [x] Add an original local SVG favicon and social preview image.
- [x] Add a lightweight automated check for JSON validity, broken internal links and missing required fields. *(Run `npm run check`.)*
- [x] Establish a repository UI contract and append-only design-version record. *(See `DESIGN_SYSTEM.md`, `DESIGN_LOG.md` and per-reference Taste DNA files.)*
- [x] Upgrade the GitHub Pages workflow to the official Node.js 24 Action majors after the hosted runner reported the Node.js 20 deprecation. *(Checkout v7, Configure Pages v6, Upload Pages Artifact v5, Deploy Pages v5.)*
- [ ] Review the terms and rights notice with qualified legal advice before commercial or public expansion.
- [x] Keep this file updated whenever a planned feature is completed or deliberately rejected. *(Applied throughout this implementation pass; this remains the repository maintenance convention.)*

## Current intentional boundaries

- No in-site audio playback.
- No audio downloads, full lyrics or scraped private platform data.
- No invented timestamps, alternate versions or producer credits.
- No automatic score completion when Andrew has not confirmed a value.
- Imported tracks and their lifecycle states remain browser-local and do not modify the canonical JSON files automatically.

## Awaiting confirmed owner or external input

- Ordered album waveforms require Andrew's confirmed track sequence and Overall scores.
- Musical Moments require Andrew to enter a timestamp; the interface never invents one.
- Alternate recordings must still be named and typed by Andrew; the interface never infers a version from a title.
- Album comparison remains empty until two albums have a confirmed ordered sequence or album-level score.
- The terms and rights notice requires review by qualified legal counsel before commercial or public expansion; repository work cannot substitute for that advice.
