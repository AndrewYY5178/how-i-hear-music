# Design Map

Source: https://www.albumoftheyear.org/ — captured at 1440 × 900 on 2026-08-29.

## Spacing Scale

- Component gaps: 10px, 20px, 25px, 30px.
- Exceptional promotional separation: 168px; not a reusable product token.
- Album grid gutter: approximately 28px.

## Font Hierarchy

- Section heading: Open Sans, 13px, 700, 0.9px letter spacing.
- Album and score metadata: Open Sans, approximately 12–13px, 400–700.
- The catalog uses a compressed hierarchy; How I Hear Music borrows its ordering, not its small type.

## Color Palette

- Page: `#F7F7F7`.
- Content surface: `#FFFFFF`.
- Primary text: `#222222`.
- Secondary text: `#808080`.
- Score measure: `#85CE73`, used in short bars rather than large surfaces.

## Image Ratios

- Album cover: 1:1.
- Six approximately 201px covers appear across the 1440px viewport.

## Component Tokens

- Grid: six columns, approximately 28px gutters, approximately 1350px working width.
- Radius: mostly 0–3px; extreme radii appear only on search or circular controls.
- Shadows: none detected on catalog cards.
- Motion: reduced-motion support detected.

---

# Taste DNA

### Cover-first catalog scanning

- **Trigger**: When many releases must be compared in one viewport.
- **Decision**: Choose identical 1:1 cover frames and fixed metadata order over variable editorial card compositions.
- **Reason**: Listeners identify familiar records visually before parsing titles or scores.
- **Evidence**: Six 201px square covers; artist, title, critic score and user score repeat in the same order.

### Scores behave like type

- **Trigger**: When two rating systems sit beneath every album.
- **Decision**: Choose plain numerals with a thin green measure over filled score badges.
- **Reason**: Repeated ratings remain comparable without turning the catalog into competing labels.
- **Evidence**: Dark score numerals on white; `#85CE73` is limited to short score measures.

### Density through repetition

- **Trigger**: When a catalog must show many records above the fold.
- **Decision**: Choose a six-column repeated grid over large feature cards.
- **Reason**: Stable comparison positions matter more than narrative emphasis on every item.
- **Evidence**: Six columns, approximately 28px gutters, and 13px section headings at 1440px.

### Flat catalog surfaces

- **Trigger**: When cover art already supplies strong color and texture.
- **Decision**: Choose no card shadows and nearly square corners over depth effects around every release.
- **Reason**: Added depth would compete with the artwork and fragment the continuous catalog.
- **Evidence**: No detected box shadows, no boxed album cards, and only `#F7F7F7` / `#FFFFFF` surface separation.
