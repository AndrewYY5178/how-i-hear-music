import { data, findAlbum, findTrack, rating, safe, slug, storage, trackId } from "../music/data.js";
import { fieldLabel, fields, radar, summary, waveform } from "./visuals.js";
import { clampScore, radarScoreFromPointer, scoreFromKey, waveformScoreFromPointer } from "./interactions.js";
import { link, pageHeader } from "../layout/shell.js";
import { lifecycleTracks, readRatings, updateLifecycle } from "../music/lifecycle.js";

const visitorKey = "how-i-hear-music:rating-sessions:v2";
const journalKey = "how-i-hear-music:journal:v1";
const inboxKey = data.library.storageKey;
const libraryKey = data.library.libraryStorageKey;
const saveRating = (id, value) => storage.set(visitorKey, { ...readRatings(), [id]: value });
const appendJournal = (entry) => storage.set(journalKey, [entry, ...storage.get(journalKey, [])]);
const choices = data.songs.entries.filter((track) => track.scores && Object.values(track.scores).some((value) => value !== null));
const localTracks = () => [...storage.get(inboxKey, []), ...storage.get(libraryKey, [])];
const findRateTrack = (id) => findTrack(id) || localTracks().find((track) => track.id === id) || null;
const rateId = (track) => track?.id || trackId(track);
const scoreControls = (scores) => `<div class="rating-controls">${fields.map((field) => `<div class="rating-control"><span><b>${fieldLabel[field]}</b><small>${field === "overall" ? "Your final feeling" : ""}</small></span><div><button type="button" aria-label="Decrease ${fieldLabel[field]} score" data-score-step="-0.1" data-field="${field}">−</button><output data-score-output="${field}">${rating(scores[field])}</output><button type="button" aria-label="Increase ${fieldLabel[field]} score" data-score-step="0.1" data-field="${field}">+</button></div></div>`).join("")}</div>`;
const reasonChoices = ["MELODY", "ARRANGEMENT", "VOCAL", "HARMONY", "GROOVE", "LYRIC", "ONE MOMENT", "CAN'T EXPLAIN"];
let pointerController = null;

export const rateHome = () => {
  const unrated = lifecycleTracks().filter((track) => ["imported", "heard"].includes(track.lifecycleState)); const heard = unrated.filter((track) => track.lifecycleState === "heard").length;
  return `${pageHeader("RATE", "Begin with one listening decision.", "Choose a shape for one track, or a landscape for an album.")}<div class="rate-choices"><article><span class="mono">01 / TRACK</span><h2>Listening Shape</h2><p>Four dimensions, one personal response.</p>${link(`/rate/track/${trackId(choices[0])}`, "RATE A TRACK", "button primary")}</article><article><span class="mono">02 / ALBUM</span><h2>Listening Landscape</h2><p>Build a score curve one track at a time.</p>${link(`/rate/album/${slug(data.profile.albumArchive[0].artist + "-" + data.profile.albumArchive[0].title)}`, "RATE AN ALBUM", "button primary")}</article></div><section class="queue-callout"><div><span class="mono">UNRATED QUEUE</span><h2>${heard} heard · ${unrated.length} waiting</h2><p>Imported records stay here until listening becomes a rating.</p></div>${link("/rate/queue", "OPEN QUEUE", "button")}</section><section class="continue-panel"><span class="mono">CONTINUE RATING</span><p>Choose from a confirmed record:</p><div class="inline-links">${choices.slice(0, 8).map((track) => link(`/rate/track/${trackId(track)}`, track.title)).join("")}</div></section>`;
};

export const unratedQueue = () => {
  const records = lifecycleTracks().filter((track) => ["heard", "imported"].includes(track.lifecycleState)).sort((a, b) => (a.lifecycleState === "heard" ? 0 : 1) - (b.lifecycleState === "heard" ? 0 : 1));
  const rows = records.length ? records.map((track, index) => `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span><div><span class="mono queue-state">${track.lifecycleState.toUpperCase()}</span><h2>${safe(track.title)}</h2><p>${safe(track.artist)}${track.album ? ` · ${safe(track.album)}` : ""}</p></div><div class="entry-actions">${track.lifecycleState === "imported" ? `<button type="button" data-queue-heard="${safe(track.id)}">MARK HEARD</button>` : ""}${link(`/rate/track/${encodeURIComponent(track.id)}`, "RATE")}</div></article>`).join("") : `<div class="queue-empty"><span class="mono">QUEUE CLEAR</span><h2>No heard or imported track is waiting for a rating.</h2>${link("/import", "IMPORT MUSIC →", "text-link")}</div>`;
  return `${pageHeader("RATE / UNRATED QUEUE", "What have you heard but not rated?", "Heard records lead; newly imported records remain visible underneath.")}<section class="unrated-queue">${rows}</section>`;
};

export const rateTrack = (id) => {
  const track = findRateTrack(id) || choices[0];
  const saved = readRatings()[rateId(track)]; const scores = saved?.scores || { song: 7.5, vocal: 7.5, production: 7.5, overall: 7.5 };
  const reasons = saved?.reasons || []; const moment = saved?.moment || {}; const momentRequired = reasons.includes("ONE MOMENT") ? "required" : "";
  return `${pageHeader("RATE / TRACK", safe(track.title), track.artist)}<section class="track-rate-session"><div class="interactive-radar" id="rate-radar">${radar(scores, { interactive: true, className: "large-radar" })}<p class="mono">DRAG A NODE / OR USE PRECISE CONTROLS</p></div><form id="track-rate-form"><div class="rate-form-heading"><span class="eyebrow mono">SET THE SHAPE</span><p>Move the graph first; use the controls to refine it.</p></div>${scoreControls(scores)}<fieldset class="tag-picker"><legend class="mono">WHY DOES IT STAY? / PICK UP TO 3</legend>${reasonChoices.map((reason) => `<button type="button" data-tag="${safe(reason)}">${safe(reason)}</button>`).join("")}</fieldset><div class="moment-editor" id="moment-editor" ${reasons.includes("ONE MOMENT") ? "" : "hidden"}><span class="mono">ONE MOMENT</span><div><label><span>TIME</span><input id="moment-time" inputmode="numeric" maxlength="5" pattern="[0-9]{1,2}:[0-5][0-9]" placeholder="2:47" value="${safe(moment.timestamp || "")}" ${momentRequired}></label><label><span>WHAT HAPPENS</span><input id="moment-note" maxlength="160" placeholder="the harmony enters" value="${safe(moment.note || "")}" ${momentRequired}></label></div></div><details class="long-note"><summary class="mono">LONG PRIVATE NOTE / OPTIONAL</summary><label class="listening-note"><textarea id="track-listening-note" rows="3" maxlength="600" placeholder="Why did you keep, revisit or question it?">${safe(saved?.note || "")}</textarea></label></details><button class="button primary" type="submit">SAVE RATING</button></form></section><aside id="rate-save-message"></aside>`;
};

const draftKey = (id) => "how-i-hear-music:album-draft:" + id;
const defaultDraft = (album) => ["Track 01", "Track 02", "Track 03", "Track 04", "Track 05", "Track 06"].map((title, index) => ({ title, overall: [7.6, 8.4, 7.9, 9.1, 8.6, 8.2][index], album: album.title }));
export const rateAlbum = (id) => {
  const album = findAlbum(id) || data.profile.albumArchive[0]; const draft = storage.get(draftKey(id), defaultDraft(album));
  return `${pageHeader("RATE / ALBUM", safe(album.title), album.artist)}<section class="album-rate-session"><div class="album-wave-heading"><span class="eyebrow mono">BUILD THE LANDSCAPE</span><p>Drag a point to shape the curve; use the track controls to refine it.</p></div><div id="album-wave-session">${waveform(draft, { interactive: true })}${summary(draft)}</div><form id="album-rate-form"><div class="album-progress"><span class="mono">TRACK-BY-TRACK</span><span id="album-progress">01 / ${String(draft.length).padStart(2, "0")}</span></div><div class="album-track-controls">${draft.map((track, index) => `<label><span>${String(index + 1).padStart(2, "0")}</span><input data-album-title="${index}" value="${safe(track.title)}"><div><button type="button" aria-label="Decrease ${safe(track.title)} score" data-album-step="-0.1" data-index="${index}">−</button><output>${rating(track.overall)}</output><button type="button" aria-label="Increase ${safe(track.title)} score" data-album-step="0.1" data-index="${index}">+</button></div></label>`).join("")}</div><label class="album-overall"><span>ALBUM OVERALL</span><input id="album-overall-input" type="number" min="0" max="11" step="0.1" value="${storage.get(draftKey(id) + ":overall", 8.5)}"></label><button class="button primary" type="submit">COMPLETE ALBUM RATING</button></form></section><aside id="album-save-message"></aside>`;
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
    const track = findRateTrack(match[1]) || choices[0]; const targetId = rateId(track); const previous = readRatings()[targetId]; let state = { ...(previous?.scores || { song: 7.5, vocal: 7.5, production: 7.5, overall: 7.5 }) }; let reasons = [...(previous?.reasons || previous?.tags || [])];
    const radarTarget = document.getElementById("rate-radar");
    const render = (focusField = null) => {
      radarTarget.innerHTML = radar(state, { interactive: true, className: "large-radar" }) + "<p class='mono'>DRAG A NODE / OR USE PRECISE CONTROLS</p>";
      fields.forEach((field) => { const output = document.querySelector(`[data-score-output='${field}']`); if (output) output.textContent = rating(state[field]); });
      if (focusField) radarTarget.querySelector(`[data-radar-field='${focusField}']`)?.focus({ preventScroll: true });
    };
    document.getElementById("track-rate-form").addEventListener("click", (event) => {
      const step = event.target.closest("[data-score-step]"); if (step) { const field = step.dataset.field; state[field] = clampScore(state[field] + Number(step.dataset.scoreStep)); render(); }
      const tag = event.target.closest("[data-tag]"); if (tag) { const value = tag.dataset.tag; reasons = reasons.includes(value) ? reasons.filter((item) => item !== value) : reasons.length < 3 ? [...reasons, value] : reasons; tag.classList.toggle("active", reasons.includes(value)); const hasMoment = reasons.includes("ONE MOMENT"); document.getElementById("moment-editor").hidden = !hasMoment; document.getElementById("moment-time").required = hasMoment; document.getElementById("moment-note").required = hasMoment; }
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
      const moment = reasons.includes("ONE MOMENT") && timestamp && momentNote ? { timestamp, note: momentNote } : null;
      const saved = { scores: state, reasons, moment, note, title: track.title, artist: track.artist, source: track.source || "archive", updatedAt: new Date().toISOString() };
      saveRating(targetId, saved); updateLifecycle(targetId, "rated"); appendJournal({ type: "rating", trackId: targetId, title: track.title, artist: track.artist, scores: state, reasons, moment, note, source: track.source || "archive", at: saved.updatedAt });
      const returnLink = track.id && !findTrack(targetId) ? link("/rate/queue", "BACK TO QUEUE", "button") : link(`/archive/tracks/${trackId(track)}`, "VIEW TRACK", "button"); document.getElementById("rate-save-message").innerHTML = `<span class='mono'>RATING SAVED</span><p>Saved in this browser${reasons.length ? ` with ${reasons.length} listening reason${reasons.length === 1 ? "" : "s"}` : ""}.</p>${returnLink}`;
    });
  }
  const albumMatch = path.match(/^\/rate\/album\/(.+)$/);
  if (albumMatch) {
    const id = albumMatch[1]; const album = findAlbum(id) || data.profile.albumArchive[0]; let draft = storage.get(draftKey(id), defaultDraft(album));
    const waveTarget = document.getElementById("album-wave-session");
    const render = (focusIndex = null) => {
      waveTarget.innerHTML = waveform(draft, { interactive: true }) + summary(draft);
      document.querySelectorAll(".album-track-controls output").forEach((output, index) => { output.textContent = rating(draft[index].overall); });
      if (focusIndex !== null) waveTarget.querySelector(`[data-wave-index='${focusIndex}']`)?.focus({ preventScroll: true });
    };
    document.getElementById("album-rate-form").addEventListener("click", (event) => { const button = event.target.closest("[data-album-step]"); if (!button) return; const index = Number(button.dataset.index); draft[index].overall = clampScore(draft[index].overall + Number(button.dataset.albumStep)); storage.set(draftKey(id), draft); render(); });
    document.getElementById("album-rate-form").addEventListener("input", (event) => { const input = event.target.closest("[data-album-title]"); if (!input) return; draft[Number(input.dataset.albumTitle)].title = input.value; storage.set(draftKey(id), draft); });
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
    document.getElementById("album-rate-form").addEventListener("submit", (event) => { event.preventDefault(); const overall = Number(document.getElementById("album-overall-input").value); storage.set(draftKey(id) + ":overall", overall); appendJournal({ type: "album", title: album.title, artist: album.artist, overall, at: new Date().toISOString() }); document.getElementById("album-save-message").innerHTML = `<span class='mono'>ALBUM COMPLETE</span><p>${safe(album.title)} saved with an overall score of ${rating(overall)}.</p>${link(`/archive/albums/${id}`, "VIEW ALBUM", "button")}`; });
  }
};
