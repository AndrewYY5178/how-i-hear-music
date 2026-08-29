# How I Hear Music — UI Standard

This file records the current design contract. `DESIGN_LOG.md` is append-only and explains how the contract changes.

## Identity that must remain

- Editorial personal archive, not a streaming dashboard.
- Libre Baskerville for display/body and DM Mono for navigation/metadata.
- Paper materials, thin rules, deep red accents and the olive Rate studio.
- Six modules retain distinct page materials and different densities.
- Ratings remain typography and chart geometry, never decorative pills.

## Shared tokens

- Spacing: 8 / 16 / 24 / 40 / 64 / 96 / 144px.
- Type roles: Display / Heading / Body / Metadata.
- Content width: 1180px maximum; 16px mobile page inset; 20px minimum desktop inset.
- Interactive target: 40px minimum.
- Album art: strict 1:1 frame.
- Borders: 1px rules using the current module line color.
- Radius: 0 by default; fully rounded only when a control's interaction needs it.
- Shadows: none by default.

## Module density

- Home: quiet editorial composition.
- Archive: repeated catalog alignment and stable scanning positions.
- Rate: one dominant chart and its controls.
- Taste: essay rhythm and long reading pauses.
- Import: functional source status before long queues.
- Journal: chronological notebook rhythm.

## Interaction standard

- Keyboard focus uses a 2px module-accent outline with 3px offset.
- Pointer controls use `touch-action: manipulation`.
- Hover movement is optional feedback, never required to understand state.
- `prefers-reduced-motion: reduce` removes transitions, animation and smooth scrolling.
- Failed or missing images preserve their frame with an explicit fallback.

## Reference boundary

Online references provide evidence for hierarchy and interaction decisions. Their brand colors, fonts, advertisements, social mechanics and visual identity are not copied. The first recorded reference is `albumoftheyear.org.md`; its useful lesson is stable square-cover repetition and typographic scores, not its compressed visual tone.
