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
- Journal: chronological notebook rhythm; the saved listening thought is primary, while date, event type, artist and score remain metadata.

## Interaction standard

- Keyboard focus uses a 2px module-accent outline with 3px offset.
- Pointer controls use `touch-action: manipulation`.
- Hover movement is optional feedback, never required to understand state.
- `prefers-reduced-motion: reduce` removes transitions, animation and smooth scrolling.
- Failed or missing images preserve their frame with an explicit fallback.
- Module material changes are immediate so foreground and background colors cannot pass through a low-contrast transition state.
- Mobile text links retain their typographic appearance while exposing a 40px minimum touch target.
- Home's Featured Shape collapses to one column below 760px; its title remains one line and truncates only when it cannot fit the viewport.
- Mobile navigation closes on Escape and on every route render; its visual state must match `aria-expanded`.
- Interactive Radar and Waveform nodes support pointer drag plus Arrow, Page Up/Down, Home and End keys; focus remains on the adjusted node after re-rendering.
- Small Rate metadata and navigation use a light peach that remains readable on the olive studio; the darker archive red remains reserved for light paper modules.
- Internal routes are logical root paths in source and are translated through the active deployment base. Root hosting, the `/how-i-hear-music/` Pages project path and legacy module hashes must resolve to the same page structure.
- Disclosure summaries expose the full 40px row as their interaction target without adding a container treatment.
- Between 761px and 1024px, Home's Featured Shape retains three roles but uses shrinkable columns; below 761px it becomes one column.
- Browser titles use the rendered editorial heading for record details rather than internal IDs or encoded URL segments.

## Reference boundary

Online references provide evidence for hierarchy and interaction decisions. Their brand colors, fonts, advertisements, social mechanics and visual identity are not copied. `albumoftheyear.org.md` informs stable square-cover repetition and typographic scores. `musicmemory.app.md` informs the priority of listening memory over technical metadata and a controlled reading measure.
