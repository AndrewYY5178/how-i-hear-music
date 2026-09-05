import { allArtists, allTracks, archiveVisibleAlbums, canonical, data, findAlbum, findArtist, findTrack, rating, safe, slug, storage, trackId } from "../music/data.js";
import { fields, fieldLabel, radar, radarPoints, summary, waveform } from "../rating/visuals.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";
import { icon } from "../layout/icons.js";
import { baseTrackId, createVersion, versionTypes, versionsForTrack } from "../music/versions.js";
import { insightLabel, insightTagsOf } from "../music/insights.js";
import { saveSonic, sonicDimensions, sonicFor } from "../music/sonic.js";
import { albumNarrative } from "../music/album-narrative.js";
import { artistSignature, trackGlyph } from "../music/geometry.js";
import { activatedTraits, tasteDNA } from "../music/taste-dna.js";
import { metadataCoverage, metadataFields, metadataOverrideFor, metadataRows, saveMetadataOverride } from "../music/metadata.js";
import { albumNote, saveAlbumNote } from "../music/notes.js";
import { metadataApiRequest } from "../music/api.js";
import { translateText } from "../layout/i18n.js?v=0.9.56";
import { withBase } from "../layout/paths.js";
import { archiveSearch } from "../search/pages.js?ui=3.11.40";
import { bindCoverTones, fallbackCoverTone, reextractCoverTone } from "../layout/cover-tone.js?ui=3.11.40";

const archiveNav = () => secondaryNav([["/archive/tracks", "Tracks"], ["/archive/albums", "Albums"], ["/archive/artists", "Artists"]]);
const archiveHomeNav = () => `<div class="archive-index-nav archive-index-actions"><button class="archive-search-trigger mono" id="archive-search-trigger" type="button" aria-controls="archive-search-panel" aria-expanded="${new URLSearchParams(location.search).has("q") ? "true" : "false"}">SEARCH</button></div>`;
const sleeveDepth = `<span class="record-sleeve-back"></span><span class="record-sleeve-edge record-sleeve-edge-right"></span><span class="record-sleeve-edge record-sleeve-edge-left"></span><span class="record-sleeve-edge record-sleeve-edge-top"></span><span class="record-sleeve-edge record-sleeve-edge-bottom"></span>`;
const tracksForArtist = (artistId) => allTracks().filter((track) => track.artistId === artistId);
const coverOverrideKey = "how-i-hear-music:cover-overrides:v1";
const localCoverOverrideKey = "how-i-hear-music:cover-overrides-local:v1";
const coverSourcesFor = (album, id) => {
  const override = storage.get(coverOverrideKey, {})[id] || "";
  const localOverride = storage.get(localCoverOverrideKey, {})[id] || "";
  const canonical = album.coverUrl || "";
  const primary = localOverride || override || canonical;
  const alternate = [override, canonical, album.coverFallback].find((source) => source && source !== primary) || "";
  return { primary, alternate };
};
const journalEntries = () => storage.get("how-i-hear-music:journal:v1", []);
const savedRatings = () => storage.get("how-i-hear-music:rating-sessions:v2", {});
const resolvedScores = (track) => savedRatings()[trackId(track)]?.scores || track.scores || {};
const scoreNumber = (value) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value)) ? null : Number(value);
const ratingDescending = (left, right, scoreOf, tieOf) => {
  const leftScore = scoreNumber(scoreOf(left)); const rightScore = scoreNumber(scoreOf(right));
  if (leftScore !== rightScore) return (rightScore ?? -Infinity) - (leftScore ?? -Infinity);
  return tieOf(left).localeCompare(tieOf(right));
};
const trackRatingDescending = (left, right) => ratingDescending(left, right, (track) => resolvedScores(track).overall, (track) => `${track.artist} ${track.title}`);
const albumOverall = (album) => {
  const id = album.id || slug(album.artist + "-" + album.title);
  const history = journalEntries().filter((entry) => entry.type === "album" && (entry.albumId === id || entry.title === album.title && entry.artist === album.artist)).sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))[0];
  return [storage.get(`how-i-hear-music:album-draft:${id}:overall`, null), history?.overall, album.overall].map(scoreNumber).find((value) => value !== null) ?? null;
};
const artistAverage = (artist) => {
  const values = tracksForArtist(artist.id).map((track) => scoreNumber(resolvedScores(track).overall)).filter((value) => value !== null);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
};
const historyMarkup = (entries) => entries.length ? `<div class="rating-history">${entries.slice(0, 8).map((entry) => `<article><time class="mono">${safe(new Date(entry.at).toLocaleDateString())}${entry.revisedAt ? " · CORRECTED" : ""}</time><strong>${rating(entry.type === "album" ? entry.overall : entry.scores?.overall)}</strong>${entry.note ? `<p>${safe(entry.note)}</p>` : ""}${entry.id ? link(`/taste/journal/edit/${encodeURIComponent(entry.id)}`, "CORRECT HISTORY →", "text-link") : ""}</article>`).join("")}</div>` : "<p>No local rating changes recorded yet.</p>";
const coverMarkup = (url, alt, loading = false, alternate = "") => url ? `<img data-cover-image${alternate ? ` data-cover-fallback-source="${safe(alternate)}"` : ""} referrerpolicy="no-referrer" src="${safe(url)}" alt="${safe(alt)}"${loading ? " loading=\"lazy\"" : ""}><div class="cover-fallback" data-cover-fallback hidden>NO COVER</div>` : `<div class="cover-fallback">NO COVER</div>`;
const encodeLocalCover = (file) => new Promise((resolve, reject) => {
  if (!file || !String(file.type || "").startsWith("image/")) { reject(new Error("Choose a JPG, PNG, WebP or AVIF image.")); return; }
  if (file.size > 20 * 1024 * 1024) { reject(new Error("Choose an image smaller than 20 MB.")); return; }
  const objectUrl = URL.createObjectURL(file); const image = new Image();
  const finish = (error, value) => { URL.revokeObjectURL(objectUrl); error ? reject(error) : resolve(value); };
  image.onerror = () => finish(new Error("This image could not be read in the browser."));
  image.onload = () => {
    try {
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight); if (!sourceSize) throw new Error("This image has no readable dimensions.");
      const size = Math.min(1400, sourceSize); const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size; const context = canvas.getContext("2d");
      if (!context) throw new Error("This browser cannot prepare a local cover.");
      context.drawImage(image, (image.naturalWidth - sourceSize) / 2, (image.naturalHeight - sourceSize) / 2, sourceSize, sourceSize, 0, 0, size, size);
      const candidates = [["image/webp", .86], ["image/jpeg", .84], ["image/jpeg", .72]]; const encoded = candidates.map(([mime, quality]) => { try { return canvas.toDataURL(mime, quality); } catch { return ""; } }).filter(Boolean).sort((left, right) => left.length - right.length)[0];
      if (!encoded || encoded.length > 2400000) throw new Error("This image is still too large after compression. Choose a smaller cover.");
      finish(null, encoded);
    } catch (error) { finish(error instanceof Error ? error : new Error("This image could not be prepared.")); }
  };
  image.src = objectUrl;
});
const recordCard = (track) => { const scores = resolvedScores(track); const known = fields.filter((field) => Number.isFinite(Number(scores[field]))); return `<article class="track-card" data-settle-key="${safe(trackId(track))}"><div>${trackGlyph(scores, `${track.title} listening glyph`)}</div><p class="geometry-note mono">${known.length ? known.map((field) => `${fieldLabel[field]} ${rating(scores[field])}`).join(" · ") : "NO SCORED GEOMETRY"}</p><p class="mono">${safe(track.artist)}${track.versionType ? ` · ${safe(track.versionType.toUpperCase())}` : ""}</p><h3>${safe(track.title)}</h3><strong>${rating(scores.overall)}</strong>${link(`/archive/tracks/${trackId(track)}`, "Open track", "card-link")}</article>`; };

const archiveGates = () => [["TRACKS", "/archive/tracks", allTracks().length + " recorded tracks", "tracks"], ["ALBUMS", "/archive/albums", archiveVisibleAlbums().length + " albums in view", "albums"], ["ARTISTS", "/archive/artists", allArtists().length + " artists in view", "artists"]];
export const archiveHome = () => `${pageHeader("ARCHIVE", "Browse the record.", "Tracks, albums and artists that have entered the archive.")}${archiveHomeNav()}${archiveSearch()}<div class="archive-gates">${archiveGates().map(([title, href, note, iconName]) => `<article><span class="archive-symbol">${icon(iconName)}</span><span class="mono">${title}</span><p>${note}</p>${link(href, "Enter →", "text-link")}</article>`).join("")}</div>`;

const renderTrackCards = (tracks) => tracks.map(recordCard).join("") || "<p class='empty-state'>No tracks match this view.</p>";
export const archiveTracks = () => {
  const traits = tasteDNA();
  return `${pageHeader("ARCHIVE / TRACKS", "Tracks in the record.", "Formal and ordered album entries. Ratings are never inferred.")}${archiveNav()}<div class="archive-tools"><input id="track-search" type="search" aria-label="Search tracks or artists" placeholder="Search tracks or artists"><div id="track-filters"><button type="button" data-track-filter="all" class="active">ALL</button><button type="button" data-track-filter="rated">RATED</button><button type="button" data-track-filter="beyond">BEYOND SCALE</button></div><label><span class="mono">TASTE EVIDENCE</span><select id="track-trait-filter"><option value="">ALL TRAITS</option>${traits.map((trait) => `<option value="${safe(trait.id)}">${safe(trait.label)} · ${trait.evidenceCount}</option>`).join("")}</select></label><label><span class="mono">SORT</span><select id="track-sort"><option value="rating">RATING HIGH–LOW</option><option value="archive">ARCHIVE ORDER</option><option value="title">TITLE A–Z</option><option value="artist">ARTIST A–Z</option></select></label></div><div class="track-grid" id="track-grid">${renderTrackCards(allTracks().sort(trackRatingDescending))}</div>`;
};

export const archiveCoverage = () => {
  const coverage = metadataCoverage(); const params = new URLSearchParams(location.search); const missingOnly = params.get("missing") === "1"; const allRows = metadataRows(); const rows = missingOnly ? allRows.filter((row) => row.missing.length) : allRows; const selectedId = params.get("track") || rows[0]?.id || allRows[0]?.id; const selected = allRows.find((row) => row.id === selectedId) || allRows[0]; const override = selected ? metadataOverrideFor(selected.id) : {};
  const fieldLabel = { album: "ALBUM", releaseDate: "RELEASE DATE", language: "LANGUAGE", region: "REGION" };
  const editorFields = selected ? metadataFields.map((field) => { const evidence = override.fields?.[field] || {}; return `<fieldset class="metadata-field"><legend class="mono">${fieldLabel[field]}</legend><label><span>CONFIRMED VALUE</span><input name="${field}" value="${safe(evidence.value ?? selected.track[field] ?? "")}" placeholder="${field === "releaseDate" ? "YYYY-MM-DD" : "Unknown"}"></label><label><span>SOURCE URL</span><input name="${field}SourceUrl" type="url" value="${safe(evidence.sourceUrl || "")}" placeholder="https://…"></label><label><span>EVIDENCE NOTE</span><input name="${field}SourceNote" value="${safe(evidence.sourceNote || "")}" placeholder="What confirms this field?"></label>${evidence.confirmedAt ? `<small class="mono">CONFIRMED ${safe(new Date(evidence.confirmedAt).toLocaleString())}${evidence.sourceUrl ? ` · <a href="${safe(evidence.sourceUrl)}" target="_blank" rel="noreferrer">OPEN SOURCE ↗</a>` : ""}</small>` : ""}</fieldset>`; }).join("") : "";
  return `${pageHeader("ARCHIVE / METADATA", "Know what the archive actually knows.", "Coverage is reported without filling gaps. Corrections are owner-confirmed and stored only in this browser.")}${archiveNav()}<section class="metadata-coverage"><div><span class="mono">COMPLETE RECORDS</span><strong>${coverage.complete} / ${coverage.total}</strong></div>${metadataFields.map((field) => `<div><span class="mono">${fieldLabel[field]}</span><strong>${coverage.fields[field]} / ${coverage.total}</strong></div>`).join("")}</section><nav class="metadata-filters" aria-label="Metadata review filter">${link("/archive/coverage", "ALL RECORDS", missingOnly ? "" : "active")}${link("/archive/coverage?missing=1", "MISSING ONLY", missingOnly ? "active" : "")}</nav><section class="metadata-workspace"><div><span class="eyebrow mono">REVIEW QUEUE</span><h2>${allRows.filter((row) => row.missing.length).length} tracks have gaps.</h2><p>Choose a track and enter only facts you can confirm. Provenance is stored per field; unchanged canonical values are not duplicated as overrides.</p><form class="metadata-picker" data-missing-only="${missingOnly ? "1" : "0"}"><label><span class="mono">TRACK</span><select name="track">${rows.map((row) => `<option value="${safe(row.id)}"${row.id === selected?.id ? " selected" : ""}>${safe(row.track.title)} — ${safe(row.track.artist)} · ${row.missing.length ? `${row.missing.length} missing` : "complete"}</option>`).join("")}</select></label><button class="button" type="submit">REVIEW</button></form>${selected ? `<section class="metadata-candidate-search" data-track-title="${safe(selected.track.title)}" data-track-artist="${safe(selected.track.artist)}" data-track-album="${safe(selected.track.album || "")}"><span class="mono">PUBLIC SOURCE CANDIDATES</span><p>Search QQ Music for exact entities. Results remain unconfirmed until you choose one and save its field evidence.</p><button class="button" type="button" id="find-metadata-candidates">FIND QQ CANDIDATES</button><button class="button" type="button" id="find-release-candidates" ${selected.track.album ? "" : "disabled"}>FIND LANGUAGE + REGION</button><p class="metadata-candidate-note">MusicBrainz candidates describe a release's market and title/track-title language, not lyric language.</p><div id="metadata-candidate-results" aria-live="polite"></div><div id="metadata-release-candidate-results" aria-live="polite"></div></section>` : ""}</div>${selected ? `<form class="metadata-editor" data-track-id="${safe(selected.id)}"><span class="mono">${safe(selected.track.title)} — ${safe(selected.track.artist)}</span>${editorFields}<button class="button primary" type="submit">SAVE FIELD EVIDENCE</button><p data-metadata-status>${override.metadataConfirmedAt ? `Revised ${safe(new Date(override.metadataConfirmedAt).toLocaleString())}.` : "No local correction saved."}</p></form>` : ""}</section>`;
};

const exactMetadataCandidate = (track, candidate) => canonical(track.title) === canonical(candidate.title) && String(candidate.artist || "").split("/").map(canonical).includes(canonical(track.artist));
const metadataCandidateMarkup = (track, candidate, index) => {
  const exact = exactMetadataCandidate(track, candidate); const albumMid = candidate.provider?.albumMid; const songUrl = candidate.externalReferences?.[0]?.url || ""; const albumUrl = albumMid ? `https://y.qq.com/n/ryqq/albumDetail/${encodeURIComponent(albumMid)}` : ""; const version = candidate.provider?.versionCode ? "ALTERNATE / LIVE CANDIDATE" : "BASE RECORDING CANDIDATE";
  return `<article><div><span class="mono"><span>${exact ? "EXACT TITLE + ARTIST" : "REVIEW IDENTITY"}</span> · <span>${version}</span></span><strong>${safe(candidate.title)}</strong><p>${safe(candidate.artist)}${candidate.album ? ` · ${safe(candidate.album)}` : ""}${candidate.releaseDate ? ` · ${safe(candidate.releaseDate)}` : ""}</p></div><div>${exact && candidate.album ? `<button class="button" type="button" data-use-metadata-candidate="${index}">USE ALBUM + DATE</button>` : ""}${albumUrl ? link(`/import/qq?url=${encodeURIComponent(albumUrl)}`, "CHECK OFFICIAL SEQUENCE", "text-link") : ""}${songUrl ? `<a class="text-link" href="${safe(songUrl)}" target="_blank" rel="noreferrer">OPEN QQ ENTITY ↗</a>` : ""}</div></article>`;
};
const releaseCandidateMarkup = (candidate, index) => `<article><div><span class="mono">MUSICBRAINZ RELEASE CANDIDATE</span><strong>${safe(candidate.title)}</strong><p>${safe(candidate.artist)}${candidate.releaseDate ? ` · ${safe(candidate.releaseDate)}` : ""}${candidate.region ? ` · ${safe(candidate.region)}` : ""}${candidate.language ? ` · ${safe(candidate.language)}` : ""}</p></div><div>${candidate.region || candidate.language ? `<button class="button" type="button" data-use-release-candidate="${index}">USE LANGUAGE + REGION</button>` : ""}<a class="text-link" href="${safe(candidate.sourceUrl)}" target="_blank" rel="noreferrer">OPEN MUSICBRAINZ ↗</a></div></article>`;

export const archiveTrackDetail = (id) => {
  const track = findTrack(id);
  if (!track) return `${pageHeader("ARCHIVE / TRACKS", "Track not found.", "This record may not have a confirmed archive entry.", link("/archive/tracks", "Back to tracks", "button"))}`;
  const scores = resolvedScores(track);
  const meta = [["ARTIST", track.artist], ["STATUS", track.songStatus?.replaceAll("_", " ") || "Recorded"], ["VERSION", track.versionType?.toUpperCase() || "BASE RECORDING"]];
  const history = journalEntries().filter((entry) => entry.type === "rating" && (entry.trackId ? entry.trackId === trackId(track) : entry.title === track.title && entry.artist === track.artist));
  const versions = versionsForTrack(track, allTracks());
  const listeningEvidence = savedRatings()[trackId(track)] || history[0] || {}; const insights = insightTagsOf(listeningEvidence); const moment = listeningEvidence.moment; const traits = activatedTraits({ ...track, ...listeningEvidence, scores });
  return `${pageHeader("TRACK", safe(track.title), track.artist, link(`/rate/track/${trackId(track)}`, "RATE TRACK", "button primary"))}<section class="detail-primary"><div>${radar(scores, { className: "detail-radar" })}</div><dl class="score-list">${Object.entries({ Song: scores.song, Vocal: scores.vocal, Production: scores.production, Overall: scores.overall }).map(([label, value]) => `<div><dt>${label}</dt><dd>${rating(value)}</dd></div>`).join("")}</dl></section><div class="meta-strip">${meta.map(([label, value]) => `<span><b>${label}</b>${safe(value)}</span>`).join("")}</div>${traits.length ? `<section class="track-dna"><span class="mono">THIS TRACK ACTIVATES</span><div>${traits.map((trait) => `<span>${safe(trait.label)}</span>`).join("")}</div><p>Matches ${traits.length} of your recurring taste traits from explicit local evidence.</p>${link("/taste/dna", "READ TASTE DNA →", "text-link")}</section>` : ""}<details><summary>WHY THIS WORKS <span>+</span></summary>${insights.length ? `<div class="insight-stamps">${insights.map((tag) => `<span>${safe(insightLabel[tag])}</span>`).join("")}</div>` : `<p>No explicit listening reasons have been saved yet.</p>`}</details><details><summary>MUSICAL MOMENTS <span>+</span></summary>${moment?.timestamp && moment?.note ? `<blockquote class="musical-moment"><b>${safe(moment.timestamp)}</b> — ${safe(moment.note)}</blockquote>` : `<p>No confirmed timestamped moments have been recorded yet.</p>`}</details><details><summary>LISTENING TEMPERATURE <span>+</span></summary>${sonicForm(track)}</details><details class="version-disclosure"><summary>VERSIONS <span>+</span></summary>${versionComparison(versions)}${versionForm(track)}</details><details><summary>RATING HISTORY <span>+</span></summary>${historyMarkup(history)}</details>`;
};

const versionName = (item) => item.versionLabel || item.versionType?.toUpperCase() || "BASE RECORDING";
const versionDeltas = (left, right) => `<dl class="version-deltas">${fields.map((field) => { const leftValue = resolvedScores(left)[field]; const rightValue = resolvedScores(right)[field]; const before = leftValue === null || leftValue === undefined ? NaN : Number(leftValue); const after = rightValue === null || rightValue === undefined ? NaN : Number(rightValue); const delta = Number.isFinite(before) && Number.isFinite(after) ? after - before : null; return `<div><dt>${fieldLabel[field]}</dt><dd><span>${rating(before)}</span><i>→</i><span>${rating(after)}</span><strong>${delta === null ? "—" : `${delta > 0 ? "+" : ""}${rating(delta)}`}</strong></dd></div>`; }).join("")}</dl>`;
const versionComparison = (versions) => { if (versions.length < 2) return `<p>No alternate recording has been confirmed. Add one only when its identity is known.</p>`; const left = versions[0]; const right = versions[1]; return `<section class="version-morph" data-version-morph><div class="version-morph-controls"><label><span class="mono">FROM</span><select data-version-left>${versions.map((item) => `<option value="${safe(trackId(item))}"${item === left ? " selected" : ""}>${safe(versionName(item))}</option>`).join("")}</select></label><i>→</i><label><span class="mono">TO</span><select data-version-right>${versions.map((item) => `<option value="${safe(trackId(item))}"${item === right ? " selected" : ""}>${safe(versionName(item))}</option>`).join("")}</select></label><button class="button" type="button" data-play-morph>PLAY MORPH</button></div><div class="version-morph-body"><div data-morph-radar>${radar(resolvedScores(left), { className: "detail-radar" })}</div><div data-version-deltas>${versionDeltas(left, right)}</div></div></section>`; };
const versionForm = (track) => `<form class="version-form" data-base-track-id="${safe(baseTrackId(track))}"><span class="mono">CONFIRM ANOTHER RECORDING</span><label><span>TYPE</span><select name="versionType">${versionTypes.map((type) => `<option value="${type}">${type}</option>`).join("")}</select></label><label><span>IDENTIFYING LABEL</span><input name="versionLabel" maxlength="80" required placeholder="Live at… / 2024 remaster"></label><button class="button" type="submit">ADD VERSION</button><p data-version-status>Stored locally. Nothing is inferred from the title.</p></form>`;
const sonicForm = (track) => { const values = sonicFor(trackId(track)) || {}; return `<form class="sonic-form" data-sonic-track-id="${safe(trackId(track))}"><p>Character only—neither side is better.</p>${Object.entries(sonicDimensions).map(([key, dimension]) => `<label><span>${dimension.low}</span><input type="range" name="${key}" min="-1" max="1" step="0.1" value="${values[key] ?? 0}" aria-label="${dimension.label}"><span>${dimension.high}</span><output>${Number(values[key] ?? 0).toFixed(1)}</output></label>`).join("")}<button class="button" type="submit">SAVE SONIC CHARACTER</button><p data-sonic-status>${sonicFor(trackId(track)) ? "Saved locally." : "No sonic character saved yet."}</p></form>`; };

export const archiveAlbums = () => `${pageHeader("ARCHIVE / ALBUMS", "Albums in view.", "A cover, artist, and overall response.", link("/archive/compare/albums", "COMPARE ALBUMS", "button"))}${archiveNav()}<div class="album-grid">${archiveVisibleAlbums().sort((left, right) => ratingDescending(left, right, albumOverall, (album) => `${album.artist} ${album.title}`)).map((album) => { const id = album.id || slug(album.artist + "-" + album.title); const { primary: coverUrl, alternate } = coverSourcesFor(album, id); const tracks = (album.tracks?.length ? album.tracks : data.songs.entries.filter((track) => canonicalAlbumMatch(track, album))).map((track) => ({ ...track, scores: resolvedScores(track) })); const scores = tracks.map((track) => Number(track.scores?.overall)).filter(Number.isFinite); const albumScore = albumOverall(album); const releaseDate = album.releaseDate || album.year || tracks.map((track) => track.releaseDate).find(Boolean) || "—"; const trackRange = scores.length ? `${scores.length} TRACKS · ${rating(Math.min(...scores))}–${rating(Math.max(...scores))}` : "NO RATED TRACKS"; return `<a class="album-card" href="${withBase(`/archive/albums/${encodeURIComponent(id)}`)}" data-route><div class="album-card-record" data-cover-tone data-cover-source="${safe(coverUrl)}" style="--record-color:${fallbackCoverTone(`${album.artist}-${album.title}`)}"><span class="album-card-disc" aria-hidden="true"></span><div class="album-card-cover">${sleeveDepth}${coverMarkup(coverUrl, album.artist + " — " + album.title + " cover", true, alternate)}</div></div><span class="album-card-terrain mono"><span>RATING ${rating(albumScore)}</span><span>RELEASE ${safe(releaseDate)}</span><span>${trackRange}</span></span><p>${safe(album.artist)}</p><h3>${safe(album.title)}</h3></a>`; }).join("")}</div>`;

const orderedTracklist = (tracks) => {
  const multipleDiscs = new Set(tracks.map((track) => track.discNumber || 1)).size > 1; let disc = null;
  return tracks.map((track, index) => {
    const discNumber = track.discNumber || 1; const separator = multipleDiscs && disc !== discNumber ? `<div class="tracklist-disc mono">DISC ${String(discNumber).padStart(2, "0")}</div>` : ""; disc = discNumber;
    const title = findTrack(trackId(track)) ? link(`/archive/tracks/${trackId(track)}`, track.title) : `<span class="tracklist-title">${safe(track.title)}</span>`;
    return `${separator}<div><span>${String(track.trackNumber || index + 1).padStart(2, "0")}</span>${title}<b>${rating(track.scores?.overall)}</b></div>`;
  }).join("");
};

export const archiveAlbumDetail = (id) => {
  const album = findAlbum(id);
  if (!album) return `${pageHeader("ARCHIVE / ALBUMS", "Album not found.", "This album is not in the current archive.", link("/archive/albums", "Back to albums", "button"))}`;
  const history = journalEntries().filter((entry) => entry.type === "album" && (entry.albumId === id || entry.title === album.title && entry.artist === album.artist));
  const albumDraft = history.find((entry) => Array.isArray(entry.tracks))?.tracks || []; const canonicalTracks = data.songs.entries.filter((track) => canonicalAlbumMatch(track, album)); const baseTracks = album.tracks?.length ? album.tracks : canonicalTracks; const savedRatings = storage.get("how-i-hear-music:rating-sessions:v2", {});
  const tracks = baseTracks.map((track) => { const draft = albumDraft.find((item) => item.trackId === trackId(track) || item.title === track.title); const scores = savedRatings[trackId(track)]?.scores || track.scores || (Number.isFinite(draft?.overall) ? { overall: draft.overall } : null); return { ...track, scores }; }).sort((a, b) => (a.discNumber || 1) - (b.discNumber || 1) || (a.trackNumber || 0) - (b.trackNumber || 0));
  const confirmed = tracks.filter((track) => Number.isFinite(track.scores?.overall));
  const narrative = albumNarrative(tracks.map((track) => ({ ...track, overall: track.scores?.overall })));
  const savedNote = albumNote(id);
  const ratingAction = tracks.length ? link(`/rate/album/${id}`, "RATE ALBUM", "button primary") : link("/import/qq", "IMPORT TRACK ORDER", "button primary");
  const { primary: coverUrl, alternate } = coverSourcesFor(album, id);
  const localCover = storage.get(localCoverOverrideKey, {})[id] || "";
  const coverReference = `<details><summary>COVER REFERENCE <span>+</span></summary><form class="cover-override-form" data-album-id="${safe(id)}"><label><span class="mono">LOCAL COVER FILE</span><input type="file" name="coverFile" accept="image/jpeg,image/png,image/webp,image/avif"><small>Square images are cropped and compressed in this browser. They are never uploaded.</small></label><div class="cover-local-preview" data-cover-local-preview>${localCover ? `<img src="${safe(localCover)}" alt="Current local cover" referrerpolicy="no-referrer">` : ""}</div><label><span class="mono">REMOTE HTTPS IMAGE URL (OPTIONAL)</span><input type="url" name="coverUrl" value="${safe(storage.get(coverOverrideKey, {})[id] || "")}" placeholder="https://…"></label><div><button class="button" type="submit">SAVE COVER</button><button class="button" type="button" data-clear-cover>USE CANONICAL COVER</button><button class="button" type="button" data-reextract-tone>RE-EXTRACT COLOR</button></div><p data-cover-status>${localCover ? "A local cover is active on this browser. Choose another file or use the canonical cover to remove it." : "Use a local file for complex or cross-domain artwork. It stays in this browser and is never uploaded."}</p><p data-tone-status>Theme color is sampled from the current cover when possible.</p></form></details>`;
  const fallbackTone = album.themeColor || fallbackCoverTone(`${album.artist}-${album.title}`);
  return `${pageHeader("ALBUM", safe(album.title), safe(album.artist + (album.year ? " · " + album.year : "")), ratingAction)}<section class="album-detail-cover"><div class="album-detail-image" data-cover-tone data-cover-source="${safe(coverUrl)}" style="--record-color:${fallbackTone};--sleeve-edge-color:${fallbackTone}">${coverMarkup(coverUrl, album.title + " cover", false, alternate)}</div><div><span class="eyebrow mono">LISTENING LANDSCAPE</span>${waveform(confirmed)}${summary(confirmed)}${narrative ? `<p class="album-narrative">${safe(narrative)}</p>` : ""}</div></section><section><h2>Track list</h2><div class="tracklist">${tracks.length ? orderedTracklist(tracks) : "<p>No confirmed ordered track sequence is available yet.</p>"}</div></section><details><summary>ALBUM CHARACTER <span>+</span></summary><p>${narrative ? safe(narrative) : "A neutral landscape description appears after every track has a confirmed Overall score."}</p></details><details${savedNote ? " open" : ""}><summary>ALBUM NOTES <span>+</span></summary><form class="album-note-form" data-album-id="${safe(id)}"><label><span class="mono">PRIVATE LISTENING NOTE</span><textarea name="note" rows="6" maxlength="2000" placeholder="What stays when the full record ends?">${safe(savedNote?.note || "")}</textarea></label><div><button class="button primary" type="submit">SAVE NOTE</button><button class="button" type="button" data-clear-album-note>CLEAR NOTE</button></div><p data-album-note-status>${savedNote ? `Revised ${safe(new Date(savedNote.revisedAt).toLocaleString())}.` : "Stored locally and included in Data Desk backups."}</p></form></details>${coverReference}<details><summary>RATING HISTORY <span>+</span></summary>${historyMarkup(history)}</details>`;
};
const canonicalAlbumMatch = (track, album) => track.artist === album.artist && (track.album === album.title || false);

const albumComparisonEvidence = (album) => {
  const id = album.id || slug(album.artist + "-" + album.title); const history = journalEntries().find((entry) => entry.type === "album" && (entry.albumId === id || entry.title === album.title && entry.artist === album.artist));
  const tracks = album.tracks || data.songs.entries.filter((track) => canonicalAlbumMatch(track, album));
  const scored = tracks.map((track) => ({ ...track, scores: resolvedScores(track) })).filter((track) => track.scores?.overall !== null && track.scores?.overall !== undefined && Number.isFinite(Number(track.scores.overall)));
  const overall = storage.get(`how-i-hear-music:album-draft:${id}:overall`, history?.overall ?? null);
  return { album, id, tracks, scored, overall, eligible: tracks.length > 0 || overall !== null && overall !== undefined && Number.isFinite(Number(overall)) };
};
const comparisonColumn = (evidence) => `<article><span class="mono">${safe(evidence.album.artist)}</span><h2>${safe(evidence.album.title)}</h2><strong>${rating(evidence.overall)}</strong><p class="mono">ALBUM OVERALL</p>${waveform(evidence.scored)}${summary(evidence.scored)}<dl><div><dt>TRACKS</dt><dd>${evidence.tracks.length}</dd></div><div><dt>RATED</dt><dd>${evidence.scored.length}</dd></div></dl>${link(`/archive/albums/${evidence.id}`, "OPEN ALBUM →", "text-link")}</article>`;
export const archiveAlbumCompare = () => {
  const eligible = archiveVisibleAlbums().map(albumComparisonEvidence).filter((item) => item.eligible); const params = new URLSearchParams(location.search); const left = eligible.find((item) => item.id === params.get("left")) || eligible[0]; const right = eligible.find((item) => item.id === params.get("right") && item.id !== left?.id) || eligible.find((item) => item.id !== left?.id);
  const selectors = eligible.length ? `<form class="comparison-selector"><label><span class="mono">ALBUM A</span><select name="left">${eligible.map((item) => `<option value="${safe(item.id)}"${item.id === left?.id ? " selected" : ""}>${safe(item.album.title)} — ${safe(item.album.artist)}</option>`).join("")}</select></label><label><span class="mono">ALBUM B</span><select name="right">${eligible.map((item) => `<option value="${safe(item.id)}"${item.id === right?.id ? " selected" : ""}>${safe(item.album.title)} — ${safe(item.album.artist)}</option>`).join("")}</select></label><button class="button" type="submit">COMPARE</button></form>` : "";
  const body = left && right ? `<section class="album-comparison-grid">${comparisonColumn(left)}${comparisonColumn(right)}</section>` : `<section class="comparison-empty"><span class="mono">NOT ENOUGH EVIDENCE</span><h2>Two albums need a confirmed sequence or album score.</h2><p>Import an ordered album or complete an album rating. Missing scores stay blank.</p>${link("/import/qq", "IMPORT AN ALBUM →", "text-link")}</section>`;
  return `${pageHeader("ARCHIVE / ALBUM COMPARISON", "Two landscapes, without forcing a verdict.", "Sequence, coverage and saved ratings remain visible; missing evidence is never completed automatically.")}${selectors}${body}`;
};

export const archiveArtists = () => { const traits = tasteDNA(); const artists = allArtists().sort((left, right) => ratingDescending(left, right, artistAverage, (artist) => artist.name)); return `${pageHeader("ARCHIVE / ARTISTS", "The people at the center.", "Editorial notes first. A signature summarizes recurring geometry without replacing the reason an artist matters.")}${archiveNav()}<div class="artist-grid">${artists.map((artist, index) => { const tracks = tracksForArtist(artist.id).map((track) => ({ ...track, scores: resolvedScores(track) })); const artistTraits = traits.filter((trait) => trait.evidence.some((record) => record.artistId === artist.id || record.artist === artist.name)); return `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span>${artistSignature(tracks, artistTraits, `${artist.name} signature`)}<h2>${safe(artist.name)}</h2><p>${safe(artist.role || artist.romanized || "In the archive")}</p>${link(`/archive/artists/${artist.id}`, "Open artist", "text-link")}</article>`; }).join("")}</div>`; };

export const archiveArtistDetail = (id) => {
  const artist = findArtist(id);
  if (!artist) return `${pageHeader("ARCHIVE / ARTISTS", "Artist not found.", "This artist is not in the current archive.", link("/archive/artists", "Back to artists", "button"))}`;
  const tracks = tracksForArtist(artist.id);
  const albums = archiveVisibleAlbums().filter((album) => album.artist === artist.name);
  const traits = tasteDNA().filter((trait) => trait.evidence.some((record) => record.artistId === artist.id || record.artist === artist.name)); const scoredTracks = tracks.map((track) => ({ ...track, scores: resolvedScores(track) }));
  const albumSpines = albums.sort((left, right) => Number(left.year || 9999) - Number(right.year || 9999)).map((album) => `<a href="${withBase(`/archive/albums/${slug(album.artist + "-" + album.title)}`)}" data-route><span class="mono">${safe(album.year || "—")}</span><b>${safe(album.title)}</b></a>`).join("");
  return `${pageHeader("ARTIST", safe(artist.name), artist.role || artist.romanized || "In the archive")}<section class="artist-intro"><div>${artistSignature(scoredTracks, traits, `${artist.name} signature`)}</div><div><span class="eyebrow mono">WHY THEY MATTER</span><p>${safe(artist.role || "Their work has a confirmed place in this archive.")}</p>${traits.length ? `<small class="mono">RECURRING HERE · ${traits.slice(0, 3).map((trait) => safe(trait.label)).join(" · ")}</small>` : ""}</div></section><section><h2>Albums</h2><div class="artist-album-spines">${albumSpines || "No confirmed albums recorded."}</div></section><section><h2>Selected tracks</h2><div class="tracklist">${tracks.map((track, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span>${link(`/archive/tracks/${trackId(track)}`, track.title)}<b>${rating(resolvedScores(track).overall)}</b></div>`).join("") || "No scored tracks recorded yet."}</div></section>`;
};

export const bindArchive = (path, navigate) => {
  bindCoverTones();
  if (path === "/archive/albums") document.querySelector(".album-grid")?.addEventListener("click", (event) => {
    const card = event.target.closest(".album-card");
    if (!card || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    card.classList.add("album-is-opening");
    const target = new URL(card.href, location.href);
    setTimeout(() => navigate(target.pathname + target.search), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220);
  });
  if (path === "/archive/albums") {
    let activeCard = null; let openTimer = null; let openTarget = null;
    document.querySelectorAll(".album-card").forEach((card) => {
      const retract = () => {
      if (openTarget === card && openTimer) { window.clearTimeout(openTimer); openTimer = null; openTarget = null; }
      if (activeCard === card) activeCard = null;
      card.classList.remove("record-is-open");
      card.classList.add("record-is-retracting");
      window.clearTimeout(card._retractTimer);
      card._retractTimer = window.setTimeout(() => card.classList.remove("record-is-retracting"), 420);
      };
      const restore = () => {
        window.clearTimeout(card._retractTimer); card.classList.remove("record-is-retracting");
        if (activeCard === card) { card.classList.add("record-is-open"); return; }
        if (activeCard && activeCard !== card) {
          const previous = activeCard; activeCard = null; previous.classList.remove("record-is-open"); previous.classList.add("record-is-retracting");
          window.clearTimeout(previous._retractTimer); previous._retractTimer = window.setTimeout(() => previous.classList.remove("record-is-retracting"), 420);
        }
        if (openTimer) window.clearTimeout(openTimer);
        openTarget = card;
        openTimer = window.setTimeout(() => { card.classList.add("record-is-open"); activeCard = card; openTarget = null; openTimer = null; }, 180);
      };
    card.addEventListener("pointerenter", restore);
    card.addEventListener("pointerleave", retract);
    card.addEventListener("focusin", restore);
    card.addEventListener("focusout", (event) => { if (!card.contains(event.relatedTarget)) retract(); });
    });
  }
  if (path === "/archive/coverage") {
    document.querySelector(".metadata-picker")?.addEventListener("submit", (event) => { event.preventDefault(); const form = event.currentTarget; const id = new FormData(form).get("track"); navigate(`/archive/coverage?track=${encodeURIComponent(id)}${form.dataset.missingOnly === "1" ? "&missing=1" : ""}`); });
    document.querySelector(".metadata-editor")?.addEventListener("submit", (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const missingOnly = new URLSearchParams(location.search).get("missing") === "1"; try { saveMetadataOverride(form.dataset.trackId, values); form.querySelector("[data-metadata-status]").textContent = "Local correction saved."; setTimeout(() => navigate(missingOnly ? "/archive/coverage?missing=1" : `/archive/coverage?track=${encodeURIComponent(form.dataset.trackId)}`), 250); } catch (error) { form.querySelector("[data-metadata-status]").textContent = error.message; } });
    const candidateDesk = document.querySelector(".metadata-candidate-search"); const candidateOutput = document.getElementById("metadata-candidate-results"); const releaseCandidateOutput = document.getElementById("metadata-release-candidate-results"); let candidates = []; let releaseCandidates = [];
    document.getElementById("find-metadata-candidates")?.addEventListener("click", async (event) => { const button = event.currentTarget; button.disabled = true; candidateOutput.innerHTML = "<p>Searching public QQ Music metadata…</p>"; try { const query = `${candidateDesk.dataset.trackTitle} ${candidateDesk.dataset.trackArtist}`; candidates = (await metadataApiRequest(`/api/import/qq-search?q=${encodeURIComponent(query)}`)).tracks || []; const track = findTrack(document.querySelector(".metadata-editor")?.dataset.trackId); candidateOutput.innerHTML = candidates.length ? candidates.slice(0, 6).map((candidate, index) => metadataCandidateMarkup(track, candidate, index)).join("") : "<p>No public QQ Music candidates found.</p>"; } catch (error) { candidateOutput.innerHTML = `<p>${safe(error instanceof Error ? error.message : "Could not search public metadata.")}</p>`; } finally { button.disabled = false; } });
    candidateOutput?.addEventListener("click", async (event) => { const button = event.target.closest("[data-use-metadata-candidate]"); if (!button) return; const candidate = candidates[Number(button.dataset.useMetadataCandidate)]; const form = document.querySelector(".metadata-editor"); if (!candidate || !form) return; const songUrl = candidate.externalReferences?.[0]?.url || ""; const albumMid = candidate.provider?.albumMid || ""; const albumUrl = albumMid ? `https://y.qq.com/n/ryqq/albumDetail/${encodeURIComponent(albumMid)}` : songUrl; button.disabled = true; form.querySelector("[data-metadata-status]").textContent = "Checking the exact QQ Music album entity…"; let verifiedAlbum = null; try { if (albumMid) verifiedAlbum = (await metadataApiRequest("/api/import/qq-album-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: albumUrl }) })).album; } catch {} finally { button.disabled = false; }
      const verifiedTrack = verifiedAlbum?.tracks?.find((track) => track.providerTrackId === candidate.provider?.songMid); const trackEvidence = verifiedTrack ? ` · disc ${verifiedTrack.discNumber}, track ${verifiedTrack.trackNumber} of ${verifiedAlbum.trackCount}` : ""; form.elements.album.value = verifiedAlbum?.title || candidate.album || form.elements.album.value; form.elements.albumSourceUrl.value = verifiedAlbum?.externalUrl || albumUrl; form.elements.albumSourceNote.value = translateText(`QQ Music exact title/artist candidate · album entity ${albumMid || "not exposed"}${trackEvidence}`); const releaseDate = verifiedTrack ? verifiedAlbum?.releaseDate : candidate.releaseDate; if (releaseDate) { form.elements.releaseDate.value = releaseDate; form.elements.releaseDateSourceUrl.value = verifiedAlbum?.externalUrl || songUrl; form.elements.releaseDateSourceNote.value = translateText(verifiedAlbum ? "QQ Music official album release date" : "QQ Music public recording entity release date"); } form.querySelector("[data-metadata-status]").textContent = translateText(verifiedTrack ? "Official album, release date and track position copied. Review them, then save field evidence." : "Candidate copied into the form. Review it, then save field evidence."); form.scrollIntoView({ behavior: "smooth", block: "start" }); });
    document.getElementById("find-release-candidates")?.addEventListener("click", async (event) => { const button = event.currentTarget; button.disabled = true; releaseCandidateOutput.innerHTML = "<p>Searching public MusicBrainz release metadata…</p>"; try { const query = new URLSearchParams({ album: candidateDesk.dataset.trackAlbum, artist: candidateDesk.dataset.trackArtist }); releaseCandidates = (await metadataApiRequest(`/api/metadata/musicbrainz-release-candidates?${query}`)).candidates || []; releaseCandidateOutput.innerHTML = releaseCandidates.length ? releaseCandidates.map(releaseCandidateMarkup).join("") : "<p>No public MusicBrainz release candidates found.</p>"; } catch (error) { releaseCandidateOutput.innerHTML = `<p>${safe(error instanceof Error ? error.message : "Could not search public release metadata.")}</p>`; } finally { button.disabled = false; } });
    releaseCandidateOutput?.addEventListener("click", (event) => { const button = event.target.closest("[data-use-release-candidate]"); if (!button) return; const candidate = releaseCandidates[Number(button.dataset.useReleaseCandidate)]; const form = document.querySelector(".metadata-editor"); if (!candidate || !form) return; const note = `MusicBrainz release candidate · ${candidate.title} · ${candidate.artist}`; if (candidate.language) { form.elements.language.value = candidate.language; form.elements.languageSourceUrl.value = candidate.sourceUrl; form.elements.languageSourceNote.value = translateText(`${note} · release title/track-title language (not lyrics)`); } if (candidate.region) { form.elements.region.value = candidate.region; form.elements.regionSourceUrl.value = candidate.sourceUrl; form.elements.regionSourceNote.value = translateText(`${note} · release country`); } form.querySelector("[data-metadata-status]").textContent = translateText("Language and region candidates copied. Review their release scope, then save field evidence."); form.scrollIntoView({ behavior: "smooth", block: "start" }); });
    return;
  }
  const albumMatch = path.match(/^\/archive\/albums\/(.+)$/);
  if (albumMatch) {
    const form = document.querySelector(".cover-override-form");
    const localFile = form?.elements.coverFile; const localPreview = form?.querySelector("[data-cover-local-preview]");
    localFile?.addEventListener("change", () => {
      const file = localFile.files?.[0]; const status = form.querySelector("[data-cover-status]");
      if (!file) { if (localPreview) localPreview.replaceChildren(); return; }
      if (!String(file.type || "").startsWith("image/")) { localFile.value = ""; status.textContent = "Choose a JPG, PNG, WebP or AVIF image."; return; }
      if (localPreview) { const previewUrl = URL.createObjectURL(file); localPreview.innerHTML = `<img src="${previewUrl}" alt="Selected local cover preview">`; const previewImage = localPreview.querySelector("img"); previewImage?.addEventListener("load", () => URL.revokeObjectURL(previewUrl), { once: true }); previewImage?.addEventListener("error", () => URL.revokeObjectURL(previewUrl), { once: true }); }
      status.textContent = `${file.name} ready. Save cover to keep it on this browser.`;
    });
    form?.addEventListener("submit", async (event) => {
      event.preventDefault(); const status = form.querySelector("[data-cover-status]"); const submit = form.querySelector("button[type=submit]"); const file = localFile?.files?.[0]; const value = String(new FormData(form).get("coverUrl") || "").trim();
      if (submit) submit.disabled = true;
      try {
        if (file) {
          const encoded = await encodeLocalCover(file); const local = { ...storage.get(localCoverOverrideKey, {}), [form.dataset.albumId]: encoded }; if (!storage.set(localCoverOverrideKey, local, { recover: false })) throw new Error("The browser could not store this cover. Try a smaller image or clear browser storage.");
          const remote = { ...storage.get(coverOverrideKey, {}) }; delete remote[form.dataset.albumId]; storage.set(coverOverrideKey, remote, { recover: false }); navigate(path); return;
        }
        if (!value) throw new Error("Choose a local image or enter an HTTPS image URL.");
        const url = new URL(value); if (url.protocol !== "https:") throw new Error("Only HTTPS image references are allowed.");
        const remote = { ...storage.get(coverOverrideKey, {}), [form.dataset.albumId]: url.href }; if (!storage.set(coverOverrideKey, remote)) throw new Error("The browser could not store this cover reference.");
        const local = { ...storage.get(localCoverOverrideKey, {}) }; delete local[form.dataset.albumId]; storage.set(localCoverOverrideKey, local, { recover: false }); navigate(path);
      } catch (error) { status.textContent = error instanceof Error ? error.message : "The cover could not be saved."; if (submit) submit.disabled = false; }
    });
    form?.querySelector("[data-clear-cover]")?.addEventListener("click", () => { const overrides = { ...storage.get(coverOverrideKey, {}) }; const local = { ...storage.get(localCoverOverrideKey, {}) }; delete overrides[form.dataset.albumId]; delete local[form.dataset.albumId]; storage.set(coverOverrideKey, overrides, { recover: false }); storage.set(localCoverOverrideKey, local, { recover: false }); navigate(path); });
    form?.querySelector("[data-reextract-tone]")?.addEventListener("click", async (event) => { const button = event.currentTarget; const status = form.querySelector("[data-tone-status]"); const target = document.querySelector(".album-detail-image[data-cover-tone]"); if (!target) return; button.disabled = true; status.textContent = translateText("Re-reading cover pixels…"); try { const tones = await reextractCoverTone(target); status.textContent = translateText(tones ? "Color extraction retried. The sleeve will use the new sample when available." : "Could not re-extract the cover color."); } catch (error) { status.textContent = error instanceof Error ? error.message : translateText("Could not re-extract the cover color."); } finally { button.disabled = false; } });
    const noteForm = document.querySelector(".album-note-form"); noteForm?.addEventListener("submit", (event) => { event.preventDefault(); try { saveAlbumNote(noteForm.dataset.albumId, new FormData(noteForm).get("note")); navigate(path); } catch (error) { noteForm.querySelector("[data-album-note-status]").textContent = error.message; } });
    noteForm?.querySelector("[data-clear-album-note]")?.addEventListener("click", () => { const button = noteForm.querySelector("[data-clear-album-note]"); if (!button.dataset.confirmed) { button.dataset.confirmed = "true"; button.textContent = "CONFIRM CLEAR"; return; } saveAlbumNote(noteForm.dataset.albumId, ""); navigate(path); });
  }
  if (path === "/archive/compare/albums") {
    document.querySelector(".comparison-selector")?.addEventListener("submit", (event) => { event.preventDefault(); const values = new FormData(event.currentTarget); navigate(`/archive/compare/albums?left=${encodeURIComponent(values.get("left"))}&right=${encodeURIComponent(values.get("right"))}`); });
    return;
  }
  const trackMatch = path.match(/^\/archive\/tracks\/(.+)$/);
  if (trackMatch) {
    const track = findTrack(trackMatch[1]); const versions = versionsForTrack(track, allTracks());
    document.querySelector(".version-form")?.addEventListener("submit", (event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); const status = form.querySelector("[data-version-status]"); try { const base = findTrack(form.dataset.baseTrackId); const version = createVersion(base, { versionType: values.get("versionType"), label: values.get("versionLabel") }); navigate(`/archive/tracks/${version.id}`); } catch (error) { status.textContent = error.message; } });
    const morph = document.querySelector("[data-version-morph]"); const selectVersion = (selector) => versions.find((item) => trackId(item) === morph?.querySelector(selector)?.value);
    const refreshDeltas = () => { const left = selectVersion("[data-version-left]"); const right = selectVersion("[data-version-right]"); if (left && right) morph.querySelector("[data-version-deltas]").innerHTML = versionDeltas(left, right); };
    morph?.addEventListener("change", refreshDeltas);
    morph?.querySelector("[data-play-morph]")?.addEventListener("click", () => { const left = selectVersion("[data-version-left]"); const right = selectVersion("[data-version-right]"); const shape = morph.querySelector(".radar-fill"); if (!left || !right || !shape) return; const from = radarPoints(resolvedScores(left)); const to = radarPoints(resolvedScores(right)); shape.setAttribute("points", from); shape.querySelector("animate")?.remove(); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { const animation = document.createElementNS("http://www.w3.org/2000/svg", "animate"); animation.setAttribute("attributeName", "points"); animation.setAttribute("from", from); animation.setAttribute("to", to); animation.setAttribute("dur", "900ms"); animation.setAttribute("fill", "freeze"); shape.append(animation); animation.beginElement(); } shape.setAttribute("points", to); refreshDeltas(); });
    const sonic = document.querySelector(".sonic-form"); sonic?.addEventListener("input", (event) => { if (event.target.matches('input[type="range"]')) event.target.parentElement.querySelector("output").textContent = Number(event.target.value).toFixed(1); });
    sonic?.addEventListener("submit", (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); saveSonic(form.dataset.sonicTrackId, values); form.querySelector("[data-sonic-status]").textContent = "Saved locally."; });
  }
  if (path !== "/archive/tracks") return;
  const search = document.getElementById("track-search"); const filters = document.getElementById("track-filters"); const grid = document.getElementById("track-grid"); const traitFilter = document.getElementById("track-trait-filter"); const sort = document.getElementById("track-sort"); let active = "all";
  const render = () => {
    const before = new Map([...grid.querySelectorAll("[data-settle-key]")].map((node) => [node.dataset.settleKey, node.getBoundingClientRect()]));
    const query = String(search.value || "").toLowerCase();
    const selectedTrait = tasteDNA().find((trait) => trait.id === traitFilter.value); const evidenceIds = new Set(selectedTrait?.evidence.map(trackId) || []);
    const tracks = allTracks().filter((track) => {
      const matches = !query || (track.title + " " + track.artist).toLowerCase().includes(query);
      const overall = Number(resolvedScores(track).overall);
      return matches && (!selectedTrait || evidenceIds.has(trackId(track))) && (active === "all" || active === "rated" && Number.isFinite(overall) || active === "beyond" && overall > 10);
    });
    if (sort.value === "rating") tracks.sort(trackRatingDescending);
    if (sort.value === "title") tracks.sort((a, b) => a.title.localeCompare(b.title));
    if (sort.value === "artist") tracks.sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
    grid.innerHTML = renderTrackCards(tracks);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(() => grid.querySelectorAll("[data-settle-key]").forEach((node) => {
      const prior = before.get(node.dataset.settleKey); const next = node.getBoundingClientRect();
      if (!prior) { node.animate([{ opacity:0, transform:"translateY(14px)" }, { opacity:1, transform:"none" }], { duration:420, easing:"cubic-bezier(.2,.7,.2,1)" }); return; }
      const x = prior.left - next.left; const y = prior.top - next.top;
      if (x || y) node.animate([{ transform:`translate(${x}px,${y}px)` }, { transform:"none" }], { duration:560, easing:"cubic-bezier(.2,.7,.2,1)" });
    }));
  };
  search.addEventListener("input", render);
  traitFilter.addEventListener("change", render); sort.addEventListener("change", render);
  filters.addEventListener("click", (event) => { const button = event.target.closest("[data-track-filter]"); if (!button) return; active = button.dataset.trackFilter; filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button)); render(); });
};
