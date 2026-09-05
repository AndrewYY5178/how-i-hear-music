# How I Hear Music — To Do

This file records planned work that is not complete yet. The current site is a personal archive, an interactive rating prototype and a playlist-import inbox prototype.

## Active touch-first App shell and delivery — UI 3.6.0

- [x] Repair the offline update action: always resolve the current waiting Service Worker, show a visible `RELOADING…` state, activate it through `SKIP_WAITING`, and fall back to a reload if `controllerchange` is delayed. Local preview and published-site behavior remain separately scoped. *(UI 3.11.5; automated checks passed.)*

- [x] Accelerate the record return: Home and Archive begin the next rotation after a 300ms halfway-retraction cue, while the vinyl itself completes a roughly 600ms return; keep the previous edge-offset and reduced-motion behavior. *(UI 3.11.6; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Tighten the narrow Home control rhythm: move PREV / NEXT closer to the Cover Flow and remove the redundant Featured Shape top rule without changing the desktop composition. *(UI 3.11.7; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Restore contrast on the olive Rate surface: use dark ink for the Continue Rating panel, its explanatory copy and the inactive narrow navigation labels while retaining the red active state. *(UI 3.11.8; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Refine the Account popover into a compact identity-and-action sheet: remove duplicate signed-out copy, use a narrow red rule and low-contrast separators, preserve the nickname / GitHub rows and keep the update action quiet. *(UI 3.11.9; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Remove the midpoint pause during record rotation: keep Home and Archive on a 600ms disc transition with a 300ms handoff, using a matching opacity crossfade so the outgoing record and incoming record overlap continuously. *(UI 3.11.10; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Rebuild the signed-out Account entry as a direct login/register choice: always show GitHub and email entry points, keep email clearly marked as coming soon until its passwordless backend exists, preserve the version label and `CHECK FOR UPDATES`, and remove redundant availability copy. *(UI 3.11.11; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Keep the record handoff continuous and inside the sleeve: align Home and Archive's closed/retract transform to the sleeve's 0 position so the vinyl never crosses the left boundary while retaining the 300ms handoff and 600ms crossfade. *(UI 3.11.12; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Re-anchor narrow Home PREV / NEXT controls to the Cover Flow content band for phone and small-tablet widths, with a final cascade guard so they cannot fall back to the stage bottom. *(UI 3.11.13; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Simplify the signed-out Account panel: keep `Sign in or register.` on one line, use compact side-by-side `GITHUB` and `EMAIL` actions with accessible labels, and remove the redundant close-cross control while retaining header toggle and Escape dismissal. *(UI 3.11.14; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Separate record speeds: keep Home and Archive vinyl reveal at roughly 1 second, accelerate withdrawal to 280ms, and hand off to the next record after 180ms so the return is shorter than the reveal without an idle gap. *(UI 3.11.15; automated checks passed; browser-width review remains part of the responsive audit.)*

- [x] Raise narrow Home side-record opacity: keep near-side sleeves at 52% and the outer visible pair at 28% so the Cover Flow retains depth without the neighboring artwork disappearing into the paper. *(UI 3.11.16; automated checks passed; browser-width review remains part of the responsive audit.)*

- [ ] Add passwordless email registration and sign-in: the Worker, D1 migration and Account-panel code path are now implemented, but production activation still requires applying `migrations/0002_email_auth.sql`, adding a `RESEND_API_KEY` Worker secret, verifying the sender domain/from address, deploying the Worker, and testing a real inbox. Email and GitHub remain independent methods and share a space only when their verified email hashes match. *(UI 3.11.17 implementation; deployment and real-inbox verification pending.)*

- [x] Sequence record retraction before Cover Flow changes: Home waits for the previous disc to withdraw halfway before changing the centered album; Archive waits through the same return phase before opening the next sleeve, keeps edge offsets during retraction, and keeps the disc inside the sleeve's lower boundary. *(UI 3.11.4; full test suite passed; browser-width review remains part of the responsive audit.)*

- [x] Complete the physical record gesture: when a Home sleeve leaves center or an Archive album loses hover/focus, keep the object above neighboring sleeves long enough for the disc to visibly withdraw into its jacket. *(UI 3.11.3; reduced-motion fallback retained; final 390 / 1024 / 1440px browser review remains part of the responsive audit.)*

- [x] Reduce the Archive landing-page local index to a quiet red `SEARCH` control aligned with `TRACKS / ALBUMS / ARTISTS`; reveal one compact local query row only after activation or when a legacy `?q=` link supplies a query. Keep the complete browser-local scope and `/search?q=…` compatibility. *(UI 3.11.2; render and local-browser interaction verified. Final 390 / 1024 / 1440px browser review remains part of the responsive audit.)*

- [x] Merge Search into the Archive landing page as one built-in local index; remove the duplicate desktop masthead, narrow menu and mobile More Search entries; preserve the complete search scope and redirect old `/search?q=…` links to `/archive?q=…`. *(UI 3.11.0; verified at 390 / 1024 / 1440px in English and Chinese.)*

- [x] Merge QQ Music playlist and album import into one Smart Import desk: resolve public share text (including short links) through the adapter, identify playlist versus album, then retain the existing Inbox preview or official-sequence review. Preserve legacy `/import/qq-album?url=…` links by redirecting them to the unified form. *(UI 3.11.1; worker contract and 390 / 1024 / 1440px form review pending this delivery.)*

- [ ] Replace the uniform dot-like page noise with a restrained, realistic paper surface based primarily on [Jessel Nieman's Grain Layer](https://www.jesselnieman.com/notes/effortlessly-add-a-grain-layer-to-your-website-in-webflow): preserve the existing `#e7dfcf` paper color, combine irregular fine grain with very low-contrast fibers and print variation, keep the overlay non-interactive, avoid obvious tiling or heavy parchment stains, and verify readability and motion at 390 / 1024 / 1440px before publishing.

- [ ] Browser-level visual verification of the album detail local-cover workflow at 390 / 1024 / 1440px. *(UI 3.10.4 implementation applied; verify file selection, preview, persistence and canonical reset when browser access is available.)*

- [ ] Recheck narrow Home Cover Flow after reducing the center sleeve so left and right neighbors remain visible; verify the Spotify-backed `黑色柳丁` artwork and its secondary CDN fallback at 390 / 1024 / 1440px. *(UI 3.10.3 code fix applied; visual browser re-check pending.)*

- [ ] Recompose the narrow Home Cover Flow so the centered album's caption stays in a vertical cover-then-metadata stream, with enough stage height and top breathing room for the title to remain visible above the mobile tab bar; keep a third sleeve visible at each edge so the narrow shelf has the same sense of depth as the wide layout. *(UI 3.10.2 code fix applied; visual browser re-check pending usage-limit recovery.)*

- [x] Normalize Archive record reveals so every column uses the same sleeve/disc trajectory and edge columns move the complete object inward; replace the blocked Tao Zhe cover with its stable Apple Music reference; retry canonical artwork after a broken local override; correct Import record diameter; recompose Home Cover Flow for narrow viewports; and keep Prev/Next above the moving records for uninterrupted clicks. *(UI 3.9.9; verified at 390 / 1024 / 1440px and with the full test suite.)*

- [x] Replace raw population-only cover color selection with population-and-chroma prominence so colorful artwork does not collapse to grey; rebuild Home, Archive and Import sleeves from connected 3D back/side/top/bottom faces after external reference study. *(UI 3.9.8; verified with 《纯妹妹》 and at 390 / 1024 / 1440px.)*

- [x] Keep right-edge Archive vinyl and sleeves geometrically parallel at every breakpoint, and shorten Featured Shape dwell time without interrupting its hand-drawn animation. *(UI 3.9.8; 5.2s → 4.4s.)*

- [x] Remove the two-line miniature album terrain from Archive cards and tighten the cover-to-metadata rhythm without changing album detail visualizations. *(UI 3.9.7; verified at 390 / 1024 / 1440px.)*

- [x] Replace artwork averaging with a reusable quantized dominant-color extractor; keep Archive vinyl above neighboring albums and make right-edge reveals adapt their sleeve shift and record angle. *(UI 3.9.6; verified at 390 / 1024 / 1440px.)*

- [x] Add a platform-quality vinyl surface to Home, Archive and Import: fine pressed grooves, restrained sector highlights and moving tonal reflections without restoring a hard outer outline or replacing artwork-derived record colors. *(UI 3.9.5; verified at 390 / 1024 / 1440px.)*

- [x] Rebuild the Cover Flow material treatment after owner review: increase center/neighbor scale contrast, match the record diameter to the sleeve, sample the artwork edge for sleeve thickness, slow the record reveal, and remove the vinyl's hard outer outline. Verify Home and Archive at 390 / 1024 / 1440px. *(UI 3.9.4.)*

- [x] Refine the living Cover Flow and album browsing: show the theme-colored record only behind the centered Home album; slow the hand-drawn Radar and crossfade Featured Shape changes; resume rotation after center interaction; remove the stray Radar slash; make Archive album cards direct links with a theme-colored record reveal; show signed-in album ratings; and add restrained physical sleeve thickness at every verified width. *(UI 3.9.3; verified at 390 / 1024 / 1440px.)*

- [x] Refine the living-newspaper Home after owner review: use the full set of real album covers in a faster, swipeable Cover Flow; cycle and redraw different saved Track Radars; add object-only depth shadows; remove page-head red ticks; and make the QQ Album reveal discoverable before detection.

- [x] Translate the approved “living newspaper” styleframes into the existing Home, Archive, Rate, Taste, Import and Journal structures: tangible record depth, restrained ink-draw motion, dense catalog rhythm and reduced-motion fallbacks, without changing routes, data or workflows.

- [x] Preserve the six existing routes and module personalities while making the mobile shell touch-first; no route, data-model or local-data boundary may be removed or merged.
- [x] Add a safe-area-aware five-item mobile bottom navigation: Home, Archive, Rate, Taste and More; More exposes Import and Journal without crowding the bar, while Search is built into Archive.
- [x] Recompose mobile page headers and first screens around one primary task, reducing decorative desktop whitespace and retaining editorial type hierarchy.
- [x] Give mobile Track Rating, Album Rating, Import and Inbox one accessible lower-screen primary action without hiding alternative controls behind gestures.
- [x] Make Archive mobile records compact and list-led while keeping its existing filter/sort controls visible and keyboard-accessible; a bottom-sheet reduction remains a later refinement.
- [x] Restore the pre-line-reduction rules across Import, Archive metadata summaries and Journal at desktop, tablet and phone widths, at the owner's request; no line-density simplification is active.
- [ ] Adapt Radar, Waveform, Sonic Map, Memory Palace, Taste and Journal for one dominant mobile visual or reading stream at a time, with non-visual alternatives preserved.
- [ ] Audit 44px minimum touch targets, safe areas, reduced motion, visible tap alternatives and 1440 / 1024 / 390px visual baselines.
- [ ] Consolidate the media-query cascade into a single maintainable responsive layer while preserving verified desktop, tablet and mobile output.
- [x] Add source-linked language/region candidates from MusicBrainz releases, explicitly scoped as release market and title/track-title language rather than lyric language; never infer or save them automatically.
- [x] Let the owner fill verified MusicBrainz language/region candidates into the existing field-evidence form in one action; saving the field evidence remains explicit and browser-local.
- [x] Add optional GitHub-identified, client-side encrypted cloud sync: D1 stores ciphertext only; download previews conflicts before an owner-selected merge and retains the existing local rollback.
- [x] Replace password-gated manual cloud copies with GitHub-account automatic sync, at the owner's explicit request; D1 remains encrypted at rest, but the Worker can process account data to synchronize it without a user-held password.
- [ ] Add passwordless email registration and sign-in alongside GitHub OAuth: issue short-lived one-time codes or magic links, hash codes before D1 storage, rate-limit requests, expire and revoke sessions, and provide account export/deletion and recovery boundaries. Email and GitHub remain independent login methods; when the verified email returned by both providers is exactly the same, resolve them to the same account space automatically. Different emails remain separate without a manual binding flow or silent archive merge. This requires a free outbound email provider and a Worker secret/API key before production activation.
- [x] Replace the masthead's contextless `001` with an Account control; expose GitHub registration/sign-in, identity, encrypted-copy status, Data Desk and sign-out in a responsive editorial account panel.
- [x] Refine the Account panel into a compact masthead popover at desktop, tablet and phone widths; retain 44px controls without occupying the full mobile screen.
- [x] Reduce signed-in Account content to identity, encrypted-copy state and two actions so the popover occupies roughly one-third to one-half of its prior visual area.
- [x] Move the Account trigger to the right side of the masthead, adjacent to the account popover; return `anddream` to the left-side project lockup.
- [x] Ask for an account nickname after first GitHub sign-in, allow later edits in the Account popover, sync it with the account archive and replace the masthead Account label with the serif nickname.
- [x] Refine nickname editing into a quiet single-line control, reduce GitHub identity to compact secondary metadata and render the masthead nickname in serif italic.
- [x] Keep the account popover build mark in sync with the published 0.9.13 release so Pages cache updates are visible in the UI.
- [x] Add a compact account-popover update check that refreshes the Service Worker and automatically activates a newer shell when one is found. *(UI 0.9.14.)*

## Approved living-interface motion backlog

The two owner-approved living-newspaper blueprints remain the visual target. Future implementation should reproduce their material rhythm as closely as the existing structure allows, without replacing routes, data or the archive's editorial identity.

- [x] **Archive — living record catalog:** animate sort/filter as a restrained shelf reordering; wake only the hovered/focused album; keep artwork color driving vinyl and sleeve edges; draw miniature track Radars only on hover/focus; unfold artist albums by year like record spines; and transition a selected cover into album detail with a brief natural enlargement. *(UI 3.10.0.)*
- [x] **Rate — listening instrument:** redraw Radar changes as red ink; roll score numerals mechanically but quietly; leave a very short ink afterimage on node movement; stamp `SAVED` into the paper; lift the active album-waveform node and move focus along it; push the paper laterally between tracks; and use one restrained ink bloom at 10 or Beyond Scale without glow or celebration effects. *(UI 3.10.0.)*
- [x] **Taste — transparent analysis layers:** settle Sonic Map points into position and migrate them naturally when axes change; layer Listening DNA like transparent tracing sheets; draw Listening Portrait once on viewport entry; reveal Blind Spots through a print mask; and allow only one major chart to move on a screen at a time. *(UI 3.10.0.)*
- [x] **Import — record intake ritual:** reveal the detected near-cover-sized colored record with grooves and soft reflection; typeset metadata row by row; unfold the track ledger downward; replace generic spinners with contextual reading/counting messages; mark conflicts as red proofreading notes; and finish with a small `ARCHIVED` stamp rather than a large success modal. *(UI 3.10.0.)*
- [x] **Journal — printed time:** stamp dates as the timeline enters; unfold `REDISCOVER` as a clipping; retain a faint old score beneath a newly printed score; fade notes in lightly; turn annual views like a new archive stack; and replace repeated Annual Index rules with page-edge month marks. *(UI 3.10.0.)*
- [x] **Search — typesetter search:** underline matches in hand-drawn red; settle reordered results like index slips without adding card borders; group Tracks, Albums and Artists in fixed metadata order; use a short rule/type change for keyboard focus; and return cleared results to their archive positions. *(UI 3.10.0.)*
- [x] **Account and sync:** move one fine line beside the nickname during sync; show a quiet `SYNCED · HH:MM` timestamp; confirm nickname saves with a small ink response; drop the current compact panel from the masthead like an archive label; and reserve prominent warnings for automatic-sync failure only. *(UI 3.10.0.)*
- [x] Keep the global motion vocabulary to `DRAW`, `SLIDE`, `STAMP` and `SETTLE`: button feedback 160–240ms, route transitions 240–360ms, reorder 400–650ms, record reveal 900–1400ms, hand-drawn Radar 1200–1800ms, and no more than one continuously moving region per screen. *(UI 3.10.0.)*
- [x] Implement in the approved priority order: Rate instrument; Archive shelf/detail transitions; Import intake ritual; Journal clipping/score overprint; Taste Sonic Map/transparent layers. *(UI 3.10.0.)*
- [ ] 将 How I Hear Music 先制作成真正可安装、可独立运行的 macOS 应用，而不只是网页快捷方式或浏览器 PWA；暂不上任何应用商店，优先采用免费的开源打包方案，通过 GitHub Releases 直接分发与更新，保留现有 GitHub 登录、自动同步和本地数据边界，并先建立可回滚的 macOS 发布流程。
- [ ] Commit, deploy the selected V13 favicon and UI 3.6.0 to GitHub Pages and Cloudflare Worker, then verify the production update path.

## Active favicon identity implementation — UI 3.5.3

- [x] Preserve V1 and V2 favicon explorations in the dedicated Figma file without changing the published website icon.
- [x] Save the four-direction V3 comparison source locally as `FAVICON_EXPLORATION_V3.svg`; it remains unpublished and must not be committed accidentally.
- [x] Save the V4 site-linked comparison source as `FAVICON_EXPLORATION_V4_SITE_LINKED.svg`; it remains unpublished and must not be committed accidentally.
- [x] Save the V5 one-color revision as `FAVICON_EXPLORATION_V5_SINGLE_COLOR.svg`; proposed icon paths use only `#a44733` so they remain visible on dark and light browser chrome.
- [x] Save the V6 `Taste listens` concept board as `FAVICON_EXPLORATION_V6_TASTE_LISTENS.svg`; it joins the Taste module, personal listening and the 11-point scale without using black or white in icon paths.
- [x] Save the V7 contained-form revision as `FAVICON_EXPLORATION_V7_TONGUE_INSIDE_EAR.svg`; every tongue remains fully inside the ear boundary with transparent separation at 16px.
- [x] Save the V8 readable-action revision as `FAVICON_EXPLORATION_V8_CLEAR_EAR_TONGUE.svg`; retain a recognizable ear, broad tongue, center groove and explicit insertion into the ear canal.
- [x] Save the V9 cochlear revision as `FAVICON_EXPLORATION_V9_TONGUE_IN_COCHLEA.svg`; keep the tongue entirely inside the cochlea, including a transparent negative-space option.
- [x] Use text-to-image for a more anatomical V10 shape study: preserve a recognizable ear and place a broad, center-grooved tongue wholly inside the cochlear area. *(Preview only; not a production or repository asset.)*
- [x] Simplify the accepted V10 structure into a favicon-oriented V11: retain the outer ear and enclosed tongue while reducing the interior to two main ear curves and one tongue groove. *(Preview only; the published favicon remains unchanged.)*
- [x] Refine V11 into a softer V12 preview with rounder endpoints, smoother curves and slightly lighter visual weight while preserving its ear-and-enclosed-tongue construction. *(Preview only; not yet installed.)*
- [x] Rebalance V12 into a squarer V13 outer-ear proportion by shortening the vertical silhouette and widening it slightly, while keeping the rounded linework and enclosed tongue intact. *(Preview only; not yet installed.)*
- [x] Produce a lighter V14 preview by reducing the V13 contour weight while preserving its near-square proportion, rounded endpoints and enclosed-tongue structure. *(Preview only; not yet installed.)*
- [x] Correct V14's uneven visual weight in V15 by narrowing the solid tongue body and its central groove without changing the already-thin ear contours. *(Preview only; not yet installed.)*
- [x] Select V13 as the final direction; retire V14 and V15 from further refinement.
- [x] Create and verify four site-derived transparent, one-color directions at 16px: score trace, album terrain, archive spine and eleventh note. *(Saved as `FAVICON_EXPLORATION_V5_SINGLE_COLOR.svg`; not yet selected or published.)*
- [x] Extract the selected V13 mark into a genuine transparent `favicon.png`, connect it to the page, manifest and offline shell, and preserve the existing browser-local data boundary.
- [x] Verify the installed V13 favicon in a real browser at desktop, tablet and phone widths before committing or publishing UI 3.5.3. *(1440×900, 1024×768 and 390×844 all resolved `favicon.png` with zero horizontal overflow; publication remains pending.)*

## Active Import status simplification — UI 3.5.2

- [x] Hide the healthy metadata-service notice while preserving disconnected and request-error warnings.
- [x] Rename playlist-source `SYNC NOW` to the more literal `CHECK PLAYLIST UPDATES` in English and `检查歌单更新` in Chinese, including the post-request reset state.
- [x] Update regression coverage, release versions, README and the append-only design record. *(Implementation commit `3a5b0ed`; UI 3.5.2 record appended without modifying earlier entries.)*
- [x] Verify Import and Inbox at desktop, tablet and mobile widths, then publish Worker and Pages together. *(1440 / 1024 / 390px local browser pass completed with no service-ready notice and no horizontal overflow; publication follows the version record.)*

## Active presentation and ranking refinement — UI 3.5.1

- [x] Preserve the verified UI 3.5.0 production state as a remote Git tag before changing the next version. *(`ui-3.5.0-production` points to `edf9862`.)*
- [x] Remove promotional content links from Home and remove the global footer Method link while keeping primary navigation intact.
- [x] Randomize the rated Tracks and Album used by Home presentation sections on each fresh render without fabricating scores or metadata. *(Album titles may still rotate when no confirmed sequence exists, but the terrain remains explicitly empty.)*
- [x] Make Track, Album and Artist indexes default to descending evidence-backed ratings, with unrated records last and deterministic ties.
- [x] Update automated coverage, version documentation and the append-only design record. *(Implementation commit `2e45642`; UI 3.5.1 record appended without changing earlier entries.)*
- [x] Verify Home and all three Archive indexes at desktop, tablet and mobile widths before publishing. *(1440 / 1024 / 390px; no horizontal overflow, Home has zero content or footer links, and responsive presentation/ranking layouts were visually inspected.)*

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

## Completed masthead simplification — UI 3.4.5

- [x] Remove the non-interactive `READ / 20—` edition marker from the masthead.
- [x] Verify the simplified masthead in English and Chinese at desktop, tablet and mobile widths.
- [x] Explain the marker's former editorial purpose and provide an owner-facing functional verification checklist.

## Completed full-navigation restoration — UI 3.4.6

- [x] Restore the original full masthead navigation above the 760px mobile breakpoint while keeping `READ / 20—` removed.
- [x] Preserve Search, language switching and `anddream` without changing the established horizontal masthead treatment.
- [x] Verify English and Chinese navigation at desktop, tablet and mobile widths with no overlap or overflow.

## Completed Import localization closure — UI 3.4.7

- [x] Translate playlist-source controls including `SYNC NOW`, source labels, removal confirmation and live sync states.
- [x] Translate dynamic playlist/album previews, Inbox lifecycle actions, duplicate states and import feedback.
- [x] Add regression coverage and verify Chinese Import/Inbox at desktop, tablet and mobile widths.

## Active hosted import delivery — UI 3.4.8

- [x] Port the public metadata adapter to a free HTTPS Cloudflare Worker without changing the local Node development server.
- [x] Restrict browser access to `https://andrewyy5178.github.io` and cover health, version, CORS and invalid-request behavior with automated checks.
- [x] Deploy and claim the Worker, verify a real public QQ Music playlist through the hosted endpoint, then connect `him-api-base`. *(Cloudflare Worker `how-i-hear-music-adapter.bevel-exhaust.workers.dev`, claimed 2026-08-31.)*
- [x] Run the complete test suite and verify Import on the published GitHub Pages site before marking the hosted adapter complete. *(Production preview returned the public 38-Track “随便听听” playlist at 1440, 1024 and 390px with zero horizontal overflow; no Inbox write was performed.)*

## Active continuation — metadata, discovery and delivery

- [x] Add a QQ Music source-backed metadata candidate workflow for the 41 canonical Tracks; confirm the exact album entity before copying its public album name, release date and track position into the review form.
- [ ] Add authoritative public-source candidates when QQ lacks language or region evidence; never infer these fields from artist identity, script, genre or market availability.
- [x] Keep ambiguous title/artist/version matches pending owner review; never convert a search result into confirmed metadata without an exact provider entity and visible provenance.
- [x] Extend the adapter and maintenance UI so confirmed album entities can supply official sequence and recording-version evidence without inventing language, region or release facts.
- [x] Generate crawlable static HTML snapshots for core public routes and replace the SVG-only social preview with a tested 1200 × 630 PNG.
- [ ] Consolidate repeated CSS media-query overrides while preserving the current 1440 / 1024 / 390 visual baselines.
- [x] Audit the Home, Archive metadata, Rate, Import, Journal and Search roots for Chinese interface omissions; translate dynamic metadata candidates and collapse the candidate-to-album/date/position check into one action.
- [x] Re-run desktop/tablet/mobile QA, adapter smoke checks and GitHub Pages production verification after every release-sized change. *(UI 3.5.0 verified on GitHub Pages at 1440, 1024 and 390px with no horizontal overflow; production QQ candidates returned exact album and release-date evidence without saving browser data.)*
- [x] Keep Cloudflare Worker and GitHub Pages dependencies, versions, CORS and deployment documentation aligned. *(Worker and Pages both run app/adapter 0.5.0; production origin restriction and live QQ smoke checks passed on 2026-09-01.)*
- [ ] Design cross-device account and cloud sync only after choosing authentication, encryption, conflict resolution, deletion/export and hosting boundaries; do not upload existing browser data by default.

## Active low-friction library flow — UI 3.4.9

- [x] Make a completed imported-Track rating archive that Track automatically, with a complete undo that restores its prior Inbox location.
- [x] Include the personal Library in Archive Track listings so locally collected music remains visible after reload.
- [x] Reduce maintenance clutter by demoting Archive metadata, collapsing advanced Track details and placing Data Desk diagnostics/recovery behind one optional disclosure.
- [x] Update bilingual workflow copy, regression coverage and desktop/tablet/mobile browser QA.

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

- [x] Deploy the metadata adapter only after a hosting target, HTTPS origin and credentials are explicitly supplied. *(Claimed Cloudflare Worker connected in UI 3.4.10.)*
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

- [x] Remove the redundant global back-path labels above page titles; keep route navigation in the masthead and retain only intentional in-page recovery/action links. *(UI 0.9.4.)*
- [x] Remove the repeated red section eyebrow above page titles (`ARCHIVE`, `RATE`, `TASTE`, `IMPORT`, `JOURNAL` and nested page-header labels) so each route opens directly on its title. *(UI 0.9.5.)*
- [x] Remove the `PERSONAL ARCHIVE / ISSUE 001` eyebrow above the Home hero title while retaining the footer issue marker and all content-level labels. *(UI 0.9.6.)*
- [x] Give the signed-in masthead nickname extra right-side breathing room so italic terminal glyphs (such as a final `l`) are not visually clipped on desktop or phone widths. *(UI 0.9.7.)*
- [x] Align the account nickname and GitHub identity rows to one shared label/value grid, keeping `SAVE` in the same right-hand action column. *(UI 0.9.8.)*
- [x] Baseline-align both account rows so `NICKNAME`, the editable value, `SAVE`, `GITHUB IDENTITY` and the GitHub handle share a consistent text baseline. *(UI 0.9.9.)*
- [x] Equalize the visual breathing between account-row text and both rules, and add a quiet build version at the popover's lower-right edge. *(UI 0.9.10.)*
- [x] Pull both account-row rules closer to their visible text while retaining 44px touch targets and the lower-right build mark. *(UI 0.9.11.)*
- [x] Remove the redundant `ARCHIVE MAINTENANCE` disclosure from Archive Home while keeping the direct metadata coverage route and saved corrections intact. *(UI 0.9.12.)*
- [x] Align the `NICKNAME` label with its editable nickname value on one row, while returning the GitHub username to its own compact identity row. *(UI 0.9.3.)*
- [x] Place the editable nickname and GitHub username on one aligned account row, preserving the compact panel and Save target while keeping long values safely truncated. *(UI 0.9.1.)*
- [x] Give the inline GitHub handle enough width to show the normal account name in full while tightening the row gap. *(UI 0.9.2.)*
- [x] Coordinate the Chinese masthead nickname with language and menu controls: use a responsive account width and reclaim the narrowest phone space from the publisher signature so the nickname is never visually covered. *(UI 0.9.0.)*
- [x] Recompose the Journal root: give Rediscover one square editorial boundary, remove the repeated Annual Index rules, and leave the per-track timeline off the overview while preserving every saved record and annual summary. *(UI 0.8.9.)*
- [x] Refine the compact account identity: remove the redundant signed-in sync sentence and set the GitHub handle in larger editorial serif type without increasing the identity row height. *(UI 0.8.8.)*
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

- [x] Remove the unnecessary divider above signed-out Account login buttons while preserving the compact two-action layout and update footer. *(UI 3.11.18; automated checks passed; browser-width review remains part of the responsive audit.)*
- [x] Raise the minimum opacity of visible Home side records to 50% without flattening the center-focused Cover Flow. *(UI 3.11.19; automated checks passed.)*
- [x] Use Archive album Terrain for explicit rating/release metadata and synchronize sleeve return timing so retracting discs cannot flash through their sleeves. *(UI 3.11.20; automated checks passed.)*
- [x] Keep Archive album discs within the sleeve's top boundary during hover reveal. *(UI 3.11.21; automated checks passed.)*
- [x] Enforce a final 50% minimum opacity for all visible Home side records across responsive widths. *(UI 3.11.22; automated checks passed.)*
- [x] Move FEATURED SHAPE score values into the radar visualization and reveal each value as its node is drawn. *(UI 3.11.23; automated checks passed.)*
- [x] Merge Journal into the Taste reading layer, remove Journal from top-level navigation, preserve legacy `/journal` routes, and expose Overview / Journal / Insights groupings inside Taste. *(UI 3.11.24; automated checks passed; browser-width review remains part of the responsive audit.)*
- [x] Raise the minimum opacity of every visible Home side record to 80% so the physical sleeves and artwork do not appear artificially faded. *(UI 3.11.25; automated checks passed; browser-width review remains part of the responsive audit.)*
- [x] Set every visible Home side record to 100% opacity; use geometry and color treatment—not transparency—for physical depth. *(UI 3.11.26; automated checks passed; browser-width review remains part of the responsive audit.)*
- [x] Remove `More` from the narrow bottom navigation and expose `Import` as the fifth direct destination. *(UI 3.11.27; automated checks passed; browser-width review remains part of the responsive audit.)*
- [x] Redeploy the production Cloudflare Worker after the site began calling QQ Smart Import routes that the old `0.9.14` Worker did not provide; verify public QQ album and playlist smart previews against the deployed `0.9.43` Worker. *(Production verification passed: album and playlist both return HTTP 200.)*
- [x] Consolidate the QQ Music and NetEase secondary-navigation entries into one `Import` destination, and shorten the visible QQ label to `QQ Music` while preserving both providers on the Import landing page. *(UI 3.11.28; automated checks passed.)*
- [x] Complete the Chinese translation pass across Taste and its merged Journal/Insights routes, including dynamic numbered links, blind-spot labels, portrait counts and time-based Journal states. *(UI 3.11.29; automated checks passed.)*
- [x] Make Import artwork colors reliable when QQ/NetEase CDNs omit Canvas CORS headers: proxy only approved artwork hosts through the adapter, enforce image type/size limits, and sample the returned pixels with the existing population/chroma scoring. *(UI 3.11.30; automated checks and a real QQ artwork request passed; production Worker deployment remains pending.)*
- [x] Consolidate repeated product entry points without deleting routes or personal data: Taste now has one grouped directory, Archive has one root category choice, Rate has one next-track action, Inbox no longer offers redundant manual archiving, and internal Journal/QQ links use their canonical destinations. *(UI 3.11.31; legacy URLs remain compatible; static build and automated checks passed.)*
- [x] Keep the Archive root's Tracks, Albums and Artists gates in one parallel three-column row at desktop and tablet widths, while retaining a single-column mobile fallback. *(UI 3.11.32; static build and automated checks passed.)*
- [x] Move the Archive root's right-side divider to the boundary between Albums and Artists, removing the unnecessary outer-right rule while preserving the phone single-column layout. *(UI 3.11.33; automated checks passed.)*
- [x] Give Home a stable signed-out sample album deck, progressively mix in the signed-in user's imported albums, and switch fully to those albums once the deck is full. Restrict Featured Shape to tracks with all four confirmed scores. *(UI 3.11.34; automated checks passed.)*
- [x] Place `FEATURED SHAPE` scores outside their corresponding radar dimension labels, with directional alignment that keeps the values outside the chart while leaving Rate/detail radars unchanged. *(UI 3.11.35; automated checks passed.)*
- [x] Replace Home's signed-out sample deck with the nine requested showcase albums, add stable Cover Art Archive/Apple Music cover sources, and use explicit theme-color fallbacks for their sleeves and records. *(UI 3.11.36; catalog rebuild and automated checks passed.)*
- The terms and rights notice requires review by qualified legal counsel before commercial or public expansion; repository work cannot substitute for that advice.
