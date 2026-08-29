# How I Hear Music — To Do

This file records planned work that is not complete yet. The current site is a personal archive, an interactive rating prototype and a playlist-import inbox prototype.

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
- [ ] Add confirmed, ordered track-level Overall scores for an album before publishing its first real waveform.
- [x] Expand beyond the former six-song deck: every confirmed Archive track can open the four-dimension Rate workspace.
- [ ] Add Musical Moments only after Andrew provides a confirmed recording/version and timestamp.
- [ ] Add version-specific ratings and comparisons.
- [x] Add album-level rating with an interactive waveform and saved overall score.
- [ ] Add album comparison after Andrew confirms an album-level score or a complete ordered track sequence.
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
- [ ] Review the terms and rights notice with qualified legal advice before commercial or public expansion.
- [x] Keep this file updated whenever a planned feature is completed or deliberately rejected. *(Applied throughout this implementation pass; this remains the repository maintenance convention.)*

## Current intentional boundaries

- No in-site audio playback.
- No audio downloads, full lyrics or scraped private platform data.
- No invented timestamps, alternate versions or producer credits.
- No automatic score completion when Andrew has not confirmed a value.
- Imported tracks currently remain browser-local and do not modify the canonical JSON files automatically.

## Awaiting confirmed owner or external input

- Ordered album waveforms require Andrew's confirmed track sequence and Overall scores.
- Musical Moments require Andrew's confirmed recording/version and timestamp.
- Version-specific comparisons require confirmed version identities and ratings.
- Album comparison requires a confirmed album score or complete ordered track sequence.
- The terms and rights notice requires review by qualified legal counsel before commercial or public expansion; repository work cannot substitute for that advice.
