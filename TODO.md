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

## P0 — Make playlist import genuinely useful

- [x] Recognise a pasted QQ Music or NetEase share card, extract its public link and retain it as source provenance.
- [x] Import a public QQ Music playlist from its URL and extract visible track metadata automatically. *(Server-only public metadata adapter; verified against a public 38-track playlist on 2026-08-28.)*
- [x] Search the QQ Music public catalog and add an individual result to Inbox.
- [ ] Import a public NetEase Cloud Music playlist from its URL and extract visible track metadata automatically.
- [ ] Confirm a platform-approved method before adding login, cookies or private-playlist access.
- [x] Add a clear import error state for private, unavailable or unsupported QQ Music playlist links.
- [x] Preserve the original playlist URL, source platform and import timestamp for every imported track.
- [x] Use a server-side adapter for the first production importer; it accepts only public share links and returns metadata only. No browser Cookie, audio or lyrics access.
- [ ] Monitor the QQ Music public metadata adapter and replace it if the upstream public web endpoint changes.

## P0 — Turn the inbox into a real library workflow

- [x] Add a local canonical-library store separate from `data/songs.json`.
- [x] Make `KEEP` move a track from Music Inbox into the local personal library instead of only removing it from the inbox.
- [ ] Add a `RATE` action from the inbox to the four-dimension rating card.
- [ ] Add a `REVIEW` state for uncertain matches.
- [ ] Add a `NEW ENTRY` state for tracks that do not match existing records.
- [ ] Add a safe export/import format so localStorage data can be backed up and restored.

## P1 — Canonical music database

- [ ] Give every canonical track an independent ID such as `track_000123`.
- [ ] Separate Artist, Album, Track and Release/Recording records.
- [ ] Store provider IDs for QQ Music and NetEase Cloud Music without using them as canonical IDs.
- [ ] Store available release date, ISRC, UPC and external reference URLs when they are legitimately available.
- [ ] Match the same track across QQ Music and NetEase Cloud Music.
- [ ] Add confidence levels: `AUTO MATCH`, `REVIEW`, `NEW ENTRY`.
- [ ] Add fuzzy matching for title, artist and album names.
- [ ] Keep versions distinct: Studio, Live, Acoustic, Remastered and other clearly identified recordings.
- [ ] Separate Composition from Recording/Version so one composition can have multiple performances.
- [ ] Preserve a track's ratings and notes when an external playlist removes it.

## P1 — Cover and metadata handling

- [ ] Decide on an allowed cover-art source and document its usage rights.
- [ ] Match a cover reference for newly imported tracks when reliable metadata is available.
- [ ] Do not silently download or republish third-party cover art.
- [ ] Add a manual cover override for records whose automatic match is wrong.
- [ ] Add a consistent fallback when a cover is unavailable.

## P1 — Interactive archive expansion

- [x] Add a four-dimension Radar visual to the listening lab, including live visitor feedback and visitor/Andrew comparison after reveal.
- [x] Add a data-driven album Overall Waveform renderer with Peak, Low, Average and Consistency metrics; it stays empty until a confirmed track sequence is supplied.
- [ ] Add confirmed, ordered track-level Overall scores for an album before publishing its first real waveform.
- [ ] Expand the current six-song interactive deck to more confirmed four-dimension records.
- [ ] Add Musical Moments only after Andrew provides a confirmed recording/version and timestamp.
- [ ] Add version-specific ratings and comparisons.
- [ ] Add album-level rating and album comparison.
- [ ] Add rating history and changes over time.
- [ ] Add optional local-only notes for why a song was kept, ignored or revisited.
- [ ] Consider a private, local-only Taste Match view after enough visitor data exists.
- [ ] Consider a Discovery view based on Andrew's own archive, not opaque third-party recommendations.

## P2 — Sync and account features

- [ ] Add manual `SYNC NOW` only after a permitted platform adapter exists.
- [ ] Detect additions and removals between two playlist snapshots.
- [ ] Add optional scheduled sync only after platform terms and technical access are confirmed.
- [ ] Decide whether accounts are necessary; the current design intentionally uses no accounts or comments.
- [ ] If accounts are added, define authentication, data deletion and privacy handling before implementation.

## P2 — Site maintenance

- [ ] Replace the current remote-font and remote-cover assumptions with a documented asset policy if the site becomes public at scale.
- [ ] Add a favicon and social preview image.
- [ ] Add a lightweight automated check for JSON validity, broken internal links and missing required fields.
- [ ] Review the terms and rights notice with qualified legal advice before commercial or public expansion.
- [ ] Keep this file updated whenever a planned feature is completed or deliberately rejected.

## Current intentional boundaries

- No in-site audio playback.
- No audio downloads, full lyrics or scraped private platform data.
- No invented timestamps, alternate versions or producer credits.
- No automatic score completion when Andrew has not confirmed a value.
- Imported tracks currently remain browser-local and do not modify the canonical JSON files automatically.
