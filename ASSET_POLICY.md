# Asset and Cover Policy

How I Hear Music is a personal, non-commercial archive. A cover URL is a reference to a third-party image, not a claim of ownership or permission to republish it.

## Allowed cover sources

- An HTTPS image URL supplied deliberately by the archive owner.
- An official artist, label, distributor or music-service image URL when its terms allow the intended display.
- A locally owned or licensed asset added with documented permission.

The current album JSON contains legacy external references from several music and media services. They are provisional references and must be reviewed or replaced before public use at scale.

## Handling rules

- Never scrape, bulk-download, proxy, cache or redistribute third-party cover art.
- Playlist imports do not collect cover URLs. Imported provider metadata is limited to track, artist, album, IDs and duration.
- A manual override stores only the HTTPS URL in this browser. It does not modify canonical JSON or upload an image.
- Missing or failed images use the standard paper fallback.
- Removal and correction requests take priority over visual completeness.

This policy is operational guidance, not legal advice. Public or commercial expansion still requires a qualified rights review.

## Fonts and first-party graphics

The current prototype loads Libre Baskerville and DM Mono from Google Fonts. A public-scale deployment should either self-host properly licensed font files or retain the remote service only after reviewing its privacy and availability trade-offs. The favicon and social preview are original repository-owned SVG graphics and may be served locally.
