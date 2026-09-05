import { allTracks, archiveVisibleAlbums, data, findAlbum, findTrack, rating, safe, slug, storage, trackId } from "../music/data.js";
import { fieldLabel, fields, radar, summary, waveform } from "./visuals.js";
import { clampScore, radarScoreFromPointer, scoreFromKey, waveformScoreFromPointer } from "./interactions.js";
import { link, pageHeader } from "../layout/shell.js";
import { lifecycleTracks, ratingStorageKey, readRatings, saveAlbumTrackRatings, saveRatingRecord, updateLifecycle, validScore } from "../music/lifecycle.js";
import { insightLabel, insightTags, insightTagsOf } from "../music/insights.js";

const visitorKey = ratingStorageKey;
const journalKey = "how-i-hear-music:journal:v1";
const inboxKey = data.library.storageKey;
const libraryKey = data.library.libraryStorageKey;
const saveRating = (id, value) => saveRatingRecord(id, value);
const appendJournal = (entry) => { const saved = { id: entry.id || `journal_${crypto.randomUUID()}`, ...entry }; storage.set(journalKey, [saved, ...storage.get(journalKey, [])]); return saved; };
const choices = data.songs.entries.filter((track) => track.scores && Object.values(track.scores).some((value) => value !== null));
const localTracks = () => [...storage.get(inboxKey, []), ...storage.get(libraryKey, [])];
const findRateTrack = (id) => findTrack(id) || localTracks().find((track) => track.id === id) || null;
const rateId = (track) => track?.id || trackId(track);
const scoreControls = (scores) => `<div class="rating-controls">${fields.map((field) => `<div class="rating-control"><span><b>${fieldLabel[field]}</b><small>${field === "overall" ? "Your final feeling" : ""}</small></span><div><button type="button" aria-label="Decrease ${fieldLabel[field]} score" data-score-step="-0.1" data-field="${field}">−</button><output data-score-output="${field}">${rating(scores[field])}</output><button type="button" aria-label="Increase ${fieldLabel[field]} score" data-score-step="0.1" data-field="${field}">+</button></div></div>`).join("")}</div>`;
let pointerController = null;

export const rateHome = () => {
  const unrated = lifecycleTracks().filter((track) => ["imported", "heard"].includes(track.lifecycleState)); const heard = unrated.filter((track) => track.lifecycleState === "heard").length; const album = archiveVisibleAlbums().find((record) => confirmedAlbumTracks(record).length); const next = unrated[0] || choices[0];
  const albumAction = album ? link(`/rate/album/${album.id || slug(album.artist + "-" + album.title)}`, "RATE AN ALBUM", "button primary") : link("/import/qq", "IMPORT AN ALBUM", "button primary");
  const trackAction = next ? link(`/rate/track/${encodeURIComponent(rateId(next))}`, "CONTINUE RATING", "button primary") : link("/import", "IMPORT MUSIC", "button primary");
  const trackCopy = next ? `${safe(next.title)} · ${safe(next.artist)}${next.lifecycleState ? ` · ${next.lifecycleState.toUpperCase()}` : ""}` : "Bring in one track to begin a listening shape.";
  return `${pageHeader("RATE", "Begin with one listening decision.", "Choose a shape for one track, or a landscape for an album.")}<div class="rate-choices"><article><span class="mono">01 / TRACK</span><h2>Listening Shape</h2><p>${trackCopy}</p>${trackAction}${link("/rate/queue", `${heard} HEARD · ${unrated.length} WAITING · VIEW QUEUE →`, "text-link")}</article><article><span class="mono">02 / ALBUM</span><h2>Listening Landscape</h2><p>${album ? "Build a score curve from a confirmed track order." : "Import a confirmed track order before rating an album."}</p>${albumAction}</article></div>`;
};

export const unratedQueue = () => {
  const records = lifecycleTracks().filter((track) => ["heard", "imported"].includes(track.lifecycleState)).sort((a, b) => (a.lifecycleState === "heard" ? 0 : 1) - (b.lifecycleState === "heard" ? 0 : 1));
  const rows = records.length ? records.map((track, index) => `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span><div><span class="mono queue-state">${track.lifecycleState.toUpperCase()}</span><h2>${safe(track.title)}</h2><p>${safe(track.artist)}${track.album ? ` · ${safe(track.album)}` : ""}</p></div><div class="entry-actions">${track.lifecycleState === "imported" ? `<button type="button" data-queue-heard="${safe(track.id)}">MARK HEARD</button>` : ""}${link(`/rate/track/${encodeURIComponent(track.id)}`, "RATE")}</div></article>`).join("") : `<div class="queue-empty"><span class="mono">QUEUE CLEAR</span><h2>No heard or imported track is waiting for a rating.</h2>${link("/import", "IMPORT MUSIC →", "text-link")}</div>`;
  return `${pageHeader("RATE / UNRATED QUEUE", "What have you heard but not rated?", "Heard records lead; newly imported records remain visible underneath.")}<section class="unrated-queue">${rows}</section>`;
};

export const rateTrack = (id) => {
  const track = findRateTrack(id);
  if (!track) return `${pageHeader("RATE / TRACK", "Track not found.", "No rating was opened or changed.")}${link("/archive/tracks", "BACK TO TRACKS", "button")}`;
  const saved = readRatings()[rateId(track)]; const scores = { song: 7.5, vocal: 7.5, production: 7.5, overall: 7.5, ...(saved?.scores || {}) };
  const reasons = insightTagsOf(saved); const moment = saved?.moment || {}; const momentRequired = reasons.includes("one-moment") ? "required" : "";
  return `${pageHeader("RATE / TRACK", safe(track.title), track.artist)}<section class="track-rate-session"><div class="interactive-radar" id="rate-radar">${radar(scores, { interactive: true, className: "large-radar" })}<p class="mono">DRAG A NODE / OR USE PRECISE CONTROLS</p></div><form id="track-rate-form"><div class="rate-form-heading"><span class="eyebrow mono">SET THE SHAPE</span><p>Move the graph first; use the controls to refine it.</p></div>${scoreControls(scores)}<fieldset class="tag-picker"><legend class="mono">WHAT MAKES IT WORK? / SELECT WHAT IS TRUE</legend>${insightTags.map((reason) => `<button type="button" data-tag="${safe(reason)}">${safe(insightLabel[reason])}</button>`).join("")}</fieldset><div class="moment-editor" id="moment-editor" ${reasons.includes("one-moment") ? "" : "hidden"}><span class="mono">ONE MOMENT</span><div><label><span>TIME</span><input id="moment-time" inputmode="numeric" maxlength="5" pattern="[0-9]{1,2}:[0-5][0-9]" placeholder="2:47" value="${safe(moment.timestamp || "")}" ${momentRequired}></label><label><span>WHAT HAPPENS</span><input id="moment-note" maxlength="160" placeholder="the harmony enters" value="${safe(moment.note || "")}" ${momentRequired}></label></div></div><details class="long-note"><summary class="mono">LONG PRIVATE NOTE / OPTIONAL</summary><label class="listening-note"><textarea id="track-listening-note" rows="3" maxlength="600" placeholder="Why did you keep, revisit or question it?">${safe(saved?.note || "")}</textarea></label></details><button class="button primary mobile-primary-action" type="submit">SAVE RATING</button></form></section><aside id="rate-save-message" class="save-feedback" role="status" aria-live="polite" tabindex="-1"></aside>`;
};

const draftKey = (id) => "how-i-hear-music:album-draft:" + id;
const confirmedAlbumTracks = (album) => album?.tracks?.length ? album.tracks.filter((track) => track.id && track.title) : allTracks().filter((track) => track.id && track.album === album?.title && track.artist === album?.artist);
const defaultDraft = (album) => confirmedAlbumTracks(album).map((track) => ({ trackId: track.id, title: track.title, artist: track.artist || album.artist, overall: readRatings()[track.id]?.scores?.overall ?? null, album: album.title, discNumber: track.discNumber || 1, trackNumber: track.trackNumber }));
export const rateAlbum = (id) => {
  const album = findAlbum(id); if (!album) return `${pageHeader("RATE / ALBUM", "Album not found.", "No rating was opened or changed.")}${link("/archive/albums", "BACK TO ALBUMS", "button")}`;
  if (!confirmedAlbumTracks(album).length) return `${pageHeader("RATE / ALBUM", safe(album.title), album.artist)}<section class="rating-blocked"><span class="mono">CONFIRMED TRACK ORDER REQUIRED</span><h2>This album cannot be rated yet.</h2><p>Import or confirm the official track sequence first. Placeholder tracks and inferred scores are never created.</p>${link("/import/qq", "IMPORT OFFICIAL SEQUENCE", "button primary")}</section>`;
  const draft = storage.get(draftKey(id), defaultDraft(album)); const ratedCount = draft.filter((track) => Number.isFinite(Number(track.overall))).length;
  return `${pageHeader("RATE / ALBUM", safe(album.title), album.artist)}<section class="album-rate-session"><div class="album-wave-heading"><span class="eyebrow mono">BUILD THE LANDSCAPE</span><p>Drag a point to shape the curve; use the track controls to refine it.</p></div><div id="album-wave-session">${waveform(draft, { interactive: true })}${summary(draft)}</div><form id="album-rate-form"><div class="album-progress"><span class="mono">TRACK-BY-TRACK</span><span id="album-progress">${String(ratedCount).padStart(2, "0")} / ${String(draft.length).padStart(2, "0")}</span></div><div class="album-track-controls">${draft.map((track, index) => `<label><span>${String(index + 1).padStart(2, "0")}</span><b>${safe(track.title)}</b><div><button type="button" aria-label="Decrease ${safe(track.title)} score" data-album-step="-0.1" data-index="${index}">−</button><output>${rating(track.overall)}</output><button type="button" aria-label="Increase ${safe(track.title)} score" data-album-step="0.1" data-index="${index}">+</button></div></label>`).join("")}</div><label class="album-overall"><span>ALBUM OVERALL</span><input id="album-overall-input" type="number" min="0" max="11" step="0.1" value="${storage.get(draftKey(id) + ":overall", "")}" required></label><button class="button primary mobile-primary-action" type="submit">COMPLETE ALBUM RATING</button></form></section><aside id="album-save-message" class="save-feedback" role="status" aria-live="polite" tabindex="-1"></aside>`;
};

export const bindRating = (path, navigate) => {
  pointerController?.abort();
  pointerController = new AbortController();
  const pointerSignal = pointerController.signal;
  if (path === "/rate/queue") {
    document.querySelector(".unrated-queue")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-queue-heard]"); if (!button) return;
      updateLifecycle(button.dataset.queueHeard, "heard");
      navigate("/rate/queue");
    });
  }
  const match = path.match(/^\/rate\/track\/(.+)$/);
  if (match) {
    const track = findRateTrack(decodeURIComponent(match[1])); if (!track) return; const targetId = rateId(track); let previous = readRatings()[targetId]; let state = { song: 7.5, vocal: 7.5, production: 7.5, overall: 7.5, ...(previous?.scores || {}) }; let reasons = insightTagsOf(previous);
    const radarTarget = document.getElementById("rate-radar");
    const render = (focusField = null) => {
      const priorShape = radarTarget.querySelector(".radar-fill")?.getAttribute("points");
      radarTarget.innerHTML = radar(state, { interactive: true, className: "large-radar" }) + "<p class='mono'>DRAG A NODE / OR USE PRECISE CONTROLS</p>";
      const fill = radarTarget.querySelector(".radar-fill");
      if (priorShape && fill && !matchMedia("(prefers-reduced-motion: reduce)").matches) { const ghost = fill.cloneNode(); ghost.setAttribute("points", priorShape); ghost.classList.add("radar-afterimage"); fill.before(ghost); radarTarget.classList.remove("rating-is-changing"); void radarTarget.offsetWidth; radarTarget.classList.add("rating-is-changing"); }
      radarTarget.classList.toggle("rating-at-maximum", Number(state.overall) >= 10);
      fields.forEach((field) => { const output = document.querySelector(`[data-score-output='${field}']`); if (output) { output.textContent = rating(state[field]); output.classList.toggle("score-is-rolling", field === focusField); } });
      if (focusField) radarTarget.querySelector(`[data-radar-field='${focusField}']`)?.focus({ preventScroll: true });
    };
    document.getElementById("track-rate-form").addEventListener("click", (event) => {
      const step = event.target.closest("[data-score-step]"); if (step) { const field = step.dataset.field; state[field] = clampScore(state[field] + Number(step.dataset.scoreStep)); render(field); }
      const tag = event.target.closest("[data-tag]"); if (tag) { const value = tag.dataset.tag; reasons = reasons.includes(value) ? reasons.filter((item) => item !== value) : [...reasons, value]; tag.classList.toggle("active", reasons.includes(value)); const hasMoment = reasons.includes("one-moment"); document.getElementById("moment-editor").hidden = !hasMoment; document.getElementById("moment-time").required = hasMoment; document.getElementById("moment-note").required = hasMoment; }
    });
    let activeField = null;
    radarTarget.addEventListener("pointerdown", (event) => {
      const node = event.target.closest("[data-radar-field]"); if (!node) return;
      activeField = node.dataset.radarField;
      node.focus({ preventScroll: true });
      event.preventDefault();
    });
    radarTarget.addEventListener("keydown", (event) => {
      const node = event.target.closest("[data-radar-field]"); if (!node) return;
      const next = scoreFromKey(event.key, state[node.dataset.radarField]); if (next === null) return;
      event.preventDefault();
      state[node.dataset.radarField] = next;
      render(node.dataset.radarField);
    });
    window.addEventListener("pointermove", (event) => {
      if (!activeField) return;
      const svg = radarTarget.querySelector("svg");
      state[activeField] = radarScoreFromPointer(event.clientX, event.clientY, svg.getBoundingClientRect(), fields.indexOf(activeField));
      render(activeField);
      event.preventDefault();
    }, { signal: pointerSignal });
    const releaseRadar = () => { activeField = null; };
    window.addEventListener("pointerup", releaseRadar, { signal: pointerSignal });
    window.addEventListener("pointercancel", releaseRadar, { signal: pointerSignal });
    document.querySelectorAll("[data-tag]").forEach((button) => button.classList.toggle("active", reasons.includes(button.dataset.tag)));
    document.getElementById("track-rate-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const note = document.getElementById("track-listening-note").value.trim(); const timestamp = document.getElementById("moment-time").value.trim(); const momentNote = document.getElementById("moment-note").value.trim();
      const moment = reasons.includes("one-moment") && timestamp && momentNote ? { timestamp, note: momentNote } : null; const priorOverall = Number(previous?.scores?.overall); const nextOverall = Number(state.overall); const delta = Number.isFinite(priorOverall) && Number.isFinite(nextOverall) ? nextOverall - priorOverall : null;
      const saved = { scores: state, insightTags: reasons, reasons, moment, note, title: track.title, artist: track.artist, source: track.source || "archive", updatedAt: new Date().toISOString() };
      const prior = previous ? structuredClone(previous) : null; const priorInbox = structuredClone(storage.get(inboxKey, [])); const priorLibrary = structuredClone(storage.get(libraryKey, [])); const wasImported = priorInbox.some((item) => item.id === targetId);
      saveRating(targetId, saved); const journalEntry = appendJournal({ type: "rating", trackId: targetId, title: track.title, artist: track.artist, scores: state, insightTags: reasons, reasons, moment, note, source: track.source || "archive", at: saved.updatedAt });
      const change = delta === null ? "" : `<dl class="rating-change"><div><dt>THEN</dt><dd>${rating(priorOverall)}</dd></div><div><dt>NOW</dt><dd>${rating(nextOverall)}</dd></div><div><dt>CHANGE</dt><dd>${delta > 0 ? "+" : ""}${rating(delta)}</dd></div></dl>`; const returnLink = link(`/archive/tracks/${trackId(track)}`, "VIEW TRACK", "button"); const message = document.getElementById("rate-save-message"); message.innerHTML = `<span class='mono'>RATING SAVED</span><p>${wasImported ? "Rating saved and Track added to Archive." : `Saved in this browser${reasons.length ? ` with ${reasons.length} listening reason${reasons.length === 1 ? "" : "s"}` : ""}.`}</p>${change}<div class="save-actions">${returnLink}<button class="button" type="button" data-undo-rating>UNDO THIS SAVE</button></div>`;
      message.focus();
      message.querySelector("[data-undo-rating]")?.addEventListener("click", () => { const ratings = { ...readRatings() }; if (prior) ratings[targetId] = prior; else delete ratings[targetId]; storage.set(visitorKey, ratings); storage.set(journalKey, storage.get(journalKey, []).filter((entry) => entry.id !== journalEntry.id)); if (wasImported) { storage.set(inboxKey, priorInbox); storage.set(libraryKey, priorLibrary); } message.innerHTML = `<span class="mono">SAVE UNDONE</span><p>The previous rating and library location were restored. The new Journal entry was removed.</p>`; previous = prior; });
      previous = saved;
    });
  }
  const albumMatch = path.match(/^\/rate\/album\/(.+)$/);
  if (albumMatch) {
    const id = decodeURIComponent(albumMatch[1]); const album = findAlbum(id); if (!album || !confirmedAlbumTracks(album).length || !document.getElementById("album-rate-form")) return; let draft = storage.get(draftKey(id), defaultDraft(album));
    const waveTarget = document.getElementById("album-wave-session");
    const render = (focusIndex = null) => {
      waveTarget.innerHTML = waveform(draft, { interactive: true }) + summary(draft);
      document.querySelectorAll(".album-track-controls output").forEach((output, index) => { output.textContent = rating(draft[index].overall); output.classList.toggle("score-is-rolling", index === focusIndex); output.closest("label")?.classList.toggle("track-is-active", index === focusIndex); });
      document.getElementById("album-progress").textContent = `${String(draft.filter((track) => Number.isFinite(Number(track.overall))).length).padStart(2, "0")} / ${String(draft.length).padStart(2, "0")}`;
      if (focusIndex !== null) { const node = waveTarget.querySelector(`[data-wave-index='${focusIndex}']`); node?.focus({ preventScroll: true }); node?.parentElement?.classList.add("wave-point-is-active"); waveTarget.classList.remove("wave-focus-is-moving"); void waveTarget.offsetWidth; waveTarget.classList.add("wave-focus-is-moving"); }
    };
    document.getElementById("album-rate-form").addEventListener("click", (event) => { const button = event.target.closest("[data-album-step]"); if (!button) return; const index = Number(button.dataset.index); const current = Number(draft[index].overall); draft[index].overall = Number.isFinite(current) ? clampScore(current + Number(button.dataset.albumStep)) : 7.5; storage.set(draftKey(id), draft); render(index); });
    let activeWaveIndex = null;
    waveTarget.addEventListener("pointerdown", (event) => {
      const node = event.target.closest("[data-wave-index]"); if (!node) return;
      activeWaveIndex = Number(node.dataset.waveIndex);
      node.focus({ preventScroll: true });
      event.preventDefault();
    });
    waveTarget.addEventListener("keydown", (event) => {
      const node = event.target.closest("[data-wave-index]"); if (!node) return;
      const index = Number(node.dataset.waveIndex); const next = scoreFromKey(event.key, draft[index].overall); if (next === null) return;
      event.preventDefault();
      draft[index].overall = next;
      storage.set(draftKey(id), draft);
      render(index);
    });
    window.addEventListener("pointermove", (event) => {
      if (activeWaveIndex === null) return;
      const svg = waveTarget.querySelector("svg");
      draft[activeWaveIndex].overall = waveformScoreFromPointer(event.clientY, svg.getBoundingClientRect());
      render(activeWaveIndex);
      event.preventDefault();
    }, { signal: pointerSignal });
    const releaseWave = () => { if (activeWaveIndex !== null) storage.set(draftKey(id), draft); activeWaveIndex = null; };
    window.addEventListener("pointerup", releaseWave, { signal: pointerSignal });
    window.addEventListener("pointercancel", releaseWave, { signal: pointerSignal });
    document.getElementById("album-rate-form").addEventListener("submit", (event) => { event.preventDefault(); const message = document.getElementById("album-save-message"); try { const overall = validScore(document.getElementById("album-overall-input").value); const priorDraft = storage.get(draftKey(id), null); const priorOverall = storage.get(draftKey(id) + ":overall", null); const priorInbox = structuredClone(storage.get(inboxKey, [])); const priorLibrary = structuredClone(storage.get(libraryKey, [])); const at = new Date().toISOString(); const { confirmed, previousRatings } = saveAlbumTrackRatings({ album, tracks: draft, at }); storage.set(draftKey(id), confirmed); storage.set(draftKey(id) + ":overall", overall); const journalEntry = appendJournal({ type: "album", albumId: id, title: album.title, artist: album.artist, overall, tracks: confirmed, at }); message.innerHTML = `<span class='mono'>ALBUM COMPLETE</span><p>${safe(album.title)} and ${confirmed.length} Track ratings were saved and collected together.</p><div class="save-actions">${link(`/archive/albums/${id}`, "VIEW ALBUM", "button")}<button class="button" type="button" data-undo-album>UNDO THIS SAVE</button></div>`; message.querySelector("[data-undo-album]")?.addEventListener("click", () => { storage.set(visitorKey, previousRatings); storage.set(inboxKey, priorInbox); storage.set(libraryKey, priorLibrary); if (priorDraft === null) storage.remove(draftKey(id)); else storage.set(draftKey(id), priorDraft); if (priorOverall === null) storage.remove(draftKey(id) + ":overall"); else storage.set(draftKey(id) + ":overall", priorOverall); storage.set(journalKey, storage.get(journalKey, []).filter((entry) => entry.id !== journalEntry.id)); message.innerHTML = `<span class="mono">SAVE UNDONE</span><p>The prior Track ratings, library locations, album draft and Journal were restored.</p>`; }); } catch (error) { message.innerHTML = `<span class="mono">ALBUM NOT SAVED</span><p>${safe(error instanceof Error ? error.message : "The album rating is incomplete.")}</p>`; } message.focus(); });
  }
};
