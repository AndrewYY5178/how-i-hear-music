# Design Map

Source: https://musicmemory.app/ — captured at 1440 × 900 on 2026-08-29.

## Spacing Scale

- Page inset: approximately 58px.
- Hero column gap: 72px.
- Primary text measure: approximately 430px.
- Small memory tiles: approximately 179–192px wide and 174–177px tall.

## Font Hierarchy

- Display: Newsreader Variable, approximately 95px / 93px, weight 400, -1.9px letter spacing.
- Section headings: Newsreader Variable, 44–80px, weight 400.
- Body: Newsreader Variable, 20px / 30px, weight 400.
- Interface copy: Hanken Grotesk Variable.

## Color Palette

- Page: `#F4EDE0`.
- Primary text: `#1C1813`.
- Accent: `#FF6500`; darker accent: `#BF4A06`.

## Image Ratios

- Phone composition: approximately 0.54:1.
- Album thumbnail: 1:1, approximately 45–48px.

## Component Tokens

- Hero grid: approximately 638px and 471px columns with a 72px gap.
- Radius: 3–10px for small surfaces; circular and pill forms appear on controls.
- Memory tiles use a soft shadow, including `0 18px 40px -26px rgba(28,24,19,.4)`.
- Focus-visible and reduced-motion behavior are present.

---

# Taste DNA

### Memory before coordinates

- **Trigger**: When a listening event includes both a human recollection and technical coordinates such as date or place.
- **Decision**: Choose the remembered sentence as the reading anchor over giving every field equal weight.
- **Reason**: The product's subject is why the song remains attached to a moment, not the database row that stores it.
- **Evidence**: Large Newsreader statements lead; date, place and interface controls use smaller supporting type.

### A narrow measure creates attention

- **Trigger**: When a personal statement must hold focus beside a visual object.
- **Decision**: Choose an approximately 430px text measure over a line spanning the whole hero column.
- **Reason**: Shorter lines let the display statement and body copy read as one deliberate editorial unit.
- **Evidence**: The 20px / 30px body copy is constrained to approximately 430px within a 638px column.

### One dominant sentence

- **Trigger**: When a hero contains both explanation and a product preview.
- **Decision**: Choose one 95px serif statement over several equally prominent headings.
- **Reason**: The page remains legible when blurred because the statement owns the left column and the phone object owns the right.
- **Evidence**: The hero uses two unequal columns and a single 95px / 93px headline.

### Product-specific restraint boundary

- **Trigger**: When applying this reference to an archival music site rather than a waitlist landing page.
- **Decision**: Transfer the memory hierarchy and reading width, but reject the orange accent, floating rounded tiles, shadows and phone composition.
- **Reason**: Those devices sell an application; How I Hear Music needs a flat paper archive with six distinct modules.
- **Evidence**: The reference relies on `#FF6500`, rounded memory tiles and a device mockup, while this repository's established contract uses deep red, square edges and no shadow by default.
