import { allAlbums, allArtists, allTracks, data, findAlbum, findArtist, findTrack, rating, safe, slug, storage, trackId } from "../music/data.js";
import { fields, fieldLabel, radar, radarPoints, summary, waveform } from "../rating/visuals.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";
import { icon } from "../layout/icons.js";
import { baseTrackId, createVersion, versionTypes, versionsForTrack } from "../music/versions.js";
import { insightLabel, insightTagsOf } from "../music/insights.js";
import { saveSonic, sonicDimensions, sonicFor } from "../music/sonic.js";
import { albumNarrative } from "../music/album-narrative.js";

const archiveNav = () => secondaryNav([["/archive/tracks", "Tracks"], ["/archive/albums", "Albums"], ["/archive/artists", "Artists"]]);
const tracksForArtist = (artistId) => allTracks().filter((track) => track.artistId === artistId);
const coverOverrideKey = "how-i-hear-music:cover-overrides:v1";
const coverFor = (album, id) => storage.get(coverOverrideKey, {})[id] || album.coverUrl || "";
const journalEntries = () => storage.get("how-i-hear-music:journal:v1", []);
const savedRatings = () => storage.get("how-i-hear-music:rating-sessions:v2", {});
const resolvedScores = (track) => savedRatings()[trackId(track)]?.scores || track.scores || {};
const historyMarkup = (entries) => entries.length ? `<div class="rating-history">${entries.slice(0, 8).map((entry) => `<article><time class="mono">${safe(new Date(entry.at).toLocaleDateString())}</time><strong>${rating(entry.type === "album" ? entry.overall : entry.scores?.overall)}</strong>${entry.note ? `<p>${safe(entry.note)}</p>` : ""}</article>`).join("")}</div>` : "<p>No local rating changes recorded yet.</p>";
const coverMarkup = (url, alt, loading = false) => url ? `<img data-cover-image src="${safe(url)}" alt="${safe(alt)}"${loading ? " loading=\"lazy\"" : ""}><div class="cover-fallback" data-cover-fallback hidden>NO COVER</div>` : `<div class="cover-fallback">NO COVER</div>`;
const albumFingerprint = (album) => album.tracks?.length ? album.tracks.map((track) => {
  const score = storage.get("how-i-hear-music:rating-sessions:v2", {})[track.id]?.scores?.overall ?? track.scores?.overall;
  if (!Number.isFinite(Number(score))) return "▁";
  return "▁▂▃▄▅▆▇█"[Math.max(0, Math.min(7, Math.round((Number(score) - 5) / 6 * 7)))];
}).join("") : "▂▄▆█▇▅▆";
const recordCard = (track) => { const scores = resolvedScores(track); return `<article class="track-card"><div>${radar(scores, { className: "mini-radar" })}</div><p class="mono">${safe(track.artist)}${track.versionType ? ` · ${safe(track.versionType.toUpperCase())}` : ""}</p><h3>${safe(track.title)}</h3><strong>${rating(scores.overall)}</strong>${link(`/archive/tracks/${trackId(track)}`, "Open track", "card-link")}</article>`; };

const archiveGates = () => [["TRACKS", "/archive/tracks", allTracks().length + " recorded tracks", "tracks"], ["ALBUMS", "/archive/albums", allAlbums().length + " albums in view", "albums"], ["ARTISTS", "/archive/artists", allArtists().length + " artists in view", "artists"]];
export const archiveHome = () => `${pageHeader("ARCHIVE", "Browse the record.", "Tracks, albums and artists that have entered the archive.")}${archiveNav()}<div class="archive-gates">${archiveGates().map(([title, href, note, iconName]) => `<article><span class="archive-symbol">${icon(iconName)}</span><span class="mono">${title}</span><p>${note}</p>${link(href, "Enter →", "text-link")}</article>`).join("")}</div>`;

const renderTrackCards = (tracks) => tracks.map(recordCard).join("") || "<p class='empty-state'>No tracks match this view.</p>";
export const archiveTracks = () => `${pageHeader("ARCHIVE / TRACKS", "Tracks in the record.", "Formal and ordered album entries. Ratings are never inferred.")}${archiveNav()}<div class="archive-tools"><input id="track-search" type="search" placeholder="Search tracks or artists"><div id="track-filters"><button data-track-filter="all" class="active">ALL</button><button data-track-filter="rated">RATED</button><button data-track-filter="beyond">BEYOND SCALE</button></div></div><div class="track-grid" id="track-grid">${renderTrackCards(allTracks())}</div>`;

export const archiveTrackDetail = (id) => {
  const track = findTrack(id);
  if (!track) return `${pageHeader("ARCHIVE / TRACKS", "Track not found.", "This record may not have a confirmed archive entry.", link("/archive/tracks", "Back to tracks", "button"))}`;
  const scores = resolvedScores(track);
  const meta = [["ARTIST", track.artist], ["STATUS", track.songStatus?.replaceAll("_", " ") || "Recorded"], ["VERSION", track.versionType?.toUpperCase() || "BASE RECORDING"]];
  const history = journalEntries().filter((entry) => entry.type === "rating" && (entry.trackId ? entry.trackId === trackId(track) : entry.title === track.title && entry.artist === track.artist));
  const versions = versionsForTrack(track, allTracks());
  const listeningEvidence = savedRatings()[trackId(track)] || history[0] || {}; const insights = insightTagsOf(listeningEvidence); const moment = listeningEvidence.moment;
  return `${pageHeader("TRACK", safe(track.title), track.artist, link(`/rate/track/${trackId(track)}`, "RATE TRACK", "button primary"))}<section class="detail-primary"><div>${radar(scores, { className: "detail-radar" })}</div><dl class="score-list">${Object.entries({ Song: scores.song, Vocal: scores.vocal, Production: scores.production, Overall: scores.overall }).map(([label, value]) => `<div><dt>${label}</dt><dd>${rating(value)}</dd></div>`).join("")}</dl></section><div class="meta-strip">${meta.map(([label, value]) => `<span><b>${label}</b>${safe(value)}</span>`).join("")}</div><details open><summary>WHY THIS WORKS <span>+</span></summary>${insights.length ? `<div class="insight-stamps">${insights.map((tag) => `<span>${safe(insightLabel[tag])}</span>`).join("")}</div>` : `<p>No explicit listening reasons have been saved yet.</p>`}</details><details><summary>MUSICAL MOMENTS <span>+</span></summary>${moment?.timestamp && moment?.note ? `<blockquote class="musical-moment"><b>${safe(moment.timestamp)}</b> — ${safe(moment.note)}</blockquote>` : `<p>No confirmed timestamped moments have been recorded yet.</p>`}</details><details><summary>LISTENING TEMPERATURE <span>+</span></summary>${sonicForm(track)}</details><details class="version-disclosure" open><summary>VERSIONS <span>+</span></summary>${versionComparison(versions)}${versionForm(track)}</details><details><summary>RATING HISTORY <span>+</span></summary>${historyMarkup(history)}</details>`;
};

const versionName = (item) => item.versionLabel || item.versionType?.toUpperCase() || "BASE RECORDING";
const versionDeltas = (left, right) => `<dl class="version-deltas">${fields.map((field) => { const leftValue = resolvedScores(left)[field]; const rightValue = resolvedScores(right)[field]; const before = leftValue === null || leftValue === undefined ? NaN : Number(leftValue); const after = rightValue === null || rightValue === undefined ? NaN : Number(rightValue); const delta = Number.isFinite(before) && Number.isFinite(after) ? after - before : null; return `<div><dt>${fieldLabel[field]}</dt><dd><span>${rating(before)}</span><i>→</i><span>${rating(after)}</span><strong>${delta === null ? "—" : `${delta > 0 ? "+" : ""}${rating(delta)}`}</strong></dd></div>`; }).join("")}</dl>`;
const versionComparison = (versions) => { if (versions.length < 2) return `<p>No alternate recording has been confirmed. Add one only when its identity is known.</p>`; const left = versions[0]; const right = versions[1]; return `<section class="version-morph" data-version-morph><div class="version-morph-controls"><label><span class="mono">FROM</span><select data-version-left>${versions.map((item) => `<option value="${safe(trackId(item))}"${item === left ? " selected" : ""}>${safe(versionName(item))}</option>`).join("")}</select></label><i>→</i><label><span class="mono">TO</span><select data-version-right>${versions.map((item) => `<option value="${safe(trackId(item))}"${item === right ? " selected" : ""}>${safe(versionName(item))}</option>`).join("")}</select></label><button class="button" type="button" data-play-morph>PLAY MORPH</button></div><div class="version-morph-body"><div data-morph-radar>${radar(resolvedScores(left), { className: "detail-radar" })}</div><div data-version-deltas>${versionDeltas(left, right)}</div></div></section>`; };
const versionForm = (track) => `<form class="version-form" data-base-track-id="${safe(baseTrackId(track))}"><span class="mono">CONFIRM ANOTHER RECORDING</span><label><span>TYPE</span><select name="versionType">${versionTypes.map((type) => `<option value="${type}">${type}</option>`).join("")}</select></label><label><span>IDENTIFYING LABEL</span><input name="versionLabel" maxlength="80" required placeholder="Live at… / 2024 remaster"></label><button class="button" type="submit">ADD VERSION</button><p data-version-status>Stored locally. Nothing is inferred from the title.</p></form>`;
const sonicForm = (track) => { const values = sonicFor(trackId(track)) || {}; return `<form class="sonic-form" data-sonic-track-id="${safe(trackId(track))}"><p>Character only—neither side is better.</p>${Object.entries(sonicDimensions).map(([key, dimension]) => `<label><span>${dimension.low}</span><input type="range" name="${key}" min="-1" max="1" step="0.1" value="${values[key] ?? 0}" aria-label="${dimension.label}"><span>${dimension.high}</span><output>${Number(values[key] ?? 0).toFixed(1)}</output></label>`).join("")}<button class="button" type="submit">SAVE SONIC CHARACTER</button><p data-sonic-status>${sonicFor(trackId(track)) ? "Saved locally." : "No sonic character saved yet."}</p></form>`; };

export const archiveAlbums = () => `${pageHeader("ARCHIVE / ALBUMS", "Albums in view.", "A cover, an overall response, a compact fingerprint.", link("/archive/compare/albums", "COMPARE ALBUMS", "button"))}${archiveNav()}<div class="album-grid">${allAlbums().map((album) => { const id = album.id || slug(album.artist + "-" + album.title); return `<article class="album-card"><div class="album-card-cover">${coverMarkup(coverFor(album, id), album.artist + " — " + album.title + " cover", true)}</div><span class="album-fingerprint">${albumFingerprint(album)}</span><p>${safe(album.artist)}</p><h3>${safe(album.title)}</h3>${link(`/archive/albums/${id}`, "Open album", "card-link")}</article>`; }).join("")}</div>`;

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
  const albumDraft = history.find((entry) => Array.isArray(entry.tracks))?.tracks || []; const canonicalTracks = data.songs.entries.filter((track) => canonicalAlbumMatch(track, album)); const baseTracks = album.tracks?.length ? album.tracks : canonicalTracks.length ? canonicalTracks : albumDraft.map((track, index) => ({ ...track, id: track.trackId || `album-track-${id}-${index + 1}`, artist: album.artist, album: album.title, trackNumber: track.trackNumber || index + 1 })); const savedRatings = storage.get("how-i-hear-music:rating-sessions:v2", {});
  const tracks = baseTracks.map((track) => { const draft = albumDraft.find((item) => item.trackId === trackId(track) || item.title === track.title); const scores = savedRatings[trackId(track)]?.scores || track.scores || (Number.isFinite(draft?.overall) ? { overall: draft.overall } : null); return { ...track, scores }; }).sort((a, b) => (a.discNumber || 1) - (b.discNumber || 1) || (a.trackNumber || 0) - (b.trackNumber || 0));
  const confirmed = tracks.filter((track) => Number.isFinite(track.scores?.overall));
  const narrative = albumNarrative(tracks.map((track) => ({ ...track, overall: track.scores?.overall })));
  return `${pageHeader("ALBUM", safe(album.title), safe(album.artist + (album.year ? " · " + album.year : "")), link(`/rate/album/${id}`, "RATE ALBUM", "button primary"))}<section class="album-detail-cover"><div class="album-detail-image">${coverMarkup(coverFor(album, id), album.title + " cover")}</div><div><span class="eyebrow mono">LISTENING LANDSCAPE</span>${waveform(confirmed)}${summary(confirmed)}${narrative ? `<p class="album-narrative">${safe(narrative)}</p>` : ""}</div></section><section><h2>Track list</h2><div class="tracklist">${tracks.length ? orderedTracklist(tracks) : "<p>No confirmed ordered track sequence is available yet.</p>"}</div></section><details><summary>ALBUM CHARACTER <span>+</span></summary><p>${narrative ? safe(narrative) : "A neutral landscape description appears after every track has a confirmed Overall score."}</p></details><details><summary>NOTES <span>+</span></summary><p>No album notes have been recorded yet.</p></details><details><summary>COVER REFERENCE <span>+</span></summary><form class="cover-override-form" data-album-id="${safe(id)}"><label><span class="mono">HTTPS IMAGE URL</span><input type="url" name="coverUrl" value="${safe(storage.get(coverOverrideKey, {})[id] || "")}" placeholder="https://…"></label><div><button class="button" type="submit">SAVE LOCAL OVERRIDE</button><button class="button" type="button" data-clear-cover>USE CANONICAL COVER</button></div><p data-cover-status>Stored only in this browser; the image is referenced, never uploaded.</p></form></details><details><summary>RATING HISTORY <span>+</span></summary>${historyMarkup(history)}</details>`;
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
  const eligible = allAlbums().map(albumComparisonEvidence).filter((item) => item.eligible); const params = new URLSearchParams(location.search); const left = eligible.find((item) => item.id === params.get("left")) || eligible[0]; const right = eligible.find((item) => item.id === params.get("right") && item.id !== left?.id) || eligible.find((item) => item.id !== left?.id);
  const selectors = eligible.length ? `<form class="comparison-selector"><label><span class="mono">ALBUM A</span><select name="left">${eligible.map((item) => `<option value="${safe(item.id)}"${item.id === left?.id ? " selected" : ""}>${safe(item.album.title)} — ${safe(item.album.artist)}</option>`).join("")}</select></label><label><span class="mono">ALBUM B</span><select name="right">${eligible.map((item) => `<option value="${safe(item.id)}"${item.id === right?.id ? " selected" : ""}>${safe(item.album.title)} — ${safe(item.album.artist)}</option>`).join("")}</select></label><button class="button" type="submit">COMPARE</button></form>` : "";
  const body = left && right ? `<section class="album-comparison-grid">${comparisonColumn(left)}${comparisonColumn(right)}</section>` : `<section class="comparison-empty"><span class="mono">NOT ENOUGH EVIDENCE</span><h2>Two albums need a confirmed sequence or album score.</h2><p>Import an ordered album or complete an album rating. Missing scores stay blank.</p>${link("/import/qq-album", "IMPORT AN ALBUM →", "text-link")}</section>`;
  return `${pageHeader("ARCHIVE / ALBUM COMPARISON", "Two landscapes, without forcing a verdict.", "Sequence, coverage and saved ratings remain visible; missing evidence is never completed automatically.")}${selectors}${body}`;
};

export const archiveArtists = () => `${pageHeader("ARCHIVE / ARTISTS", "The people at the center.", "Editorial notes first. A score never replaces the reason an artist matters.")}${archiveNav()}<div class="artist-grid">${allArtists().map((artist, index) => `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span><h2>${safe(artist.name)}</h2><p>${safe(artist.role || artist.romanized || "In the archive")}</p>${link(`/archive/artists/${artist.id}`, "Open artist", "text-link")}</article>`).join("")}</div>`;

export const archiveArtistDetail = (id) => {
  const artist = findArtist(id);
  if (!artist) return `${pageHeader("ARCHIVE / ARTISTS", "Artist not found.", "This artist is not in the current archive.", link("/archive/artists", "Back to artists", "button"))}`;
  const tracks = tracksForArtist(artist.id);
  const albums = allAlbums().filter((album) => album.artist === artist.name);
  return `${pageHeader("ARTIST", safe(artist.name), artist.role || artist.romanized || "In the archive")}<section class="artist-intro"><span class="eyebrow mono">WHY THEY MATTER</span><p>${safe(artist.role || "Their work has a confirmed place in this archive.")}</p></section><section><h2>Albums</h2><div class="inline-links">${albums.length ? albums.map((album) => link(`/archive/albums/${slug(album.artist + "-" + album.title)}`, album.title)).join("") : "No confirmed albums recorded."}</div></section><section><h2>Selected tracks</h2><div class="tracklist">${tracks.map((track, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span>${link(`/archive/tracks/${trackId(track)}`, track.title)}<b>${rating(track.scores?.overall)}</b></div>`).join("") || "No scored tracks recorded yet."}</div></section>`;
};

export const bindArchive = (path, navigate) => {
  document.querySelectorAll("[data-cover-image]").forEach((image) => image.addEventListener("error", () => { image.hidden = true; const fallback = image.nextElementSibling; if (fallback?.matches("[data-cover-fallback]")) fallback.hidden = false; }, { once: true }));
  const albumMatch = path.match(/^\/archive\/albums\/(.+)$/);
  if (albumMatch) {
    const form = document.querySelector(".cover-override-form");
    form?.addEventListener("submit", (event) => { event.preventDefault(); const value = String(new FormData(form).get("coverUrl") || "").trim(); const status = form.querySelector("[data-cover-status]"); let url; try { url = new URL(value); } catch { status.textContent = "Enter a complete HTTPS image URL."; return; } if (url.protocol !== "https:") { status.textContent = "Only HTTPS image references are allowed."; return; } storage.set(coverOverrideKey, { ...storage.get(coverOverrideKey, {}), [form.dataset.albumId]: url.href }); navigate(path); });
    form?.querySelector("[data-clear-cover]")?.addEventListener("click", () => { const overrides = { ...storage.get(coverOverrideKey, {}) }; delete overrides[form.dataset.albumId]; storage.set(coverOverrideKey, overrides); navigate(path); });
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
  const search = document.getElementById("track-search"); const filters = document.getElementById("track-filters"); const grid = document.getElementById("track-grid"); let active = "all";
  const render = () => {
    const query = String(search.value || "").toLowerCase();
    const tracks = allTracks().filter((track) => {
      const matches = !query || (track.title + " " + track.artist).toLowerCase().includes(query);
      const overall = Number(track.scores?.overall);
      return matches && (active === "all" || active === "rated" && Number.isFinite(overall) || active === "beyond" && overall > 10);
    });
    grid.innerHTML = renderTrackCards(tracks);
  };
  search.addEventListener("input", render);
  filters.addEventListener("click", (event) => { const button = event.target.closest("[data-track-filter]"); if (!button) return; active = button.dataset.trackFilter; filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button)); render(); });
};
