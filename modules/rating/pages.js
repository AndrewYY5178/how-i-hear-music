import { data, findAlbum, findTrack, rating, safe, slug, storage, trackId } from "../music/data.js";
import { fieldLabel, fields, radar, summary, waveform } from "./visuals.js";
import { link, pageHeader } from "../layout/shell.js";

const visitorKey = "how-i-hear-music:rating-sessions:v2";
const journalKey = "how-i-hear-music:journal:v1";
const readRatings = () => storage.get(visitorKey, {});
const saveRating = (id, value) => storage.set(visitorKey, { ...readRatings(), [id]: value });
const appendJournal = (entry) => storage.set(journalKey, [entry, ...storage.get(journalKey, [])].slice(0, 80));
const choices = data.songs.entries.filter((track) => track.scores && Object.values(track.scores).some((value) => value !== null));
const scoreControls = (scores) => `<div class="rating-controls">${fields.map((field) => `<div class="rating-control"><span><b>${fieldLabel[field]}</b><small>${field === "overall" ? "Your final feeling" : ""}</small></span><div><button data-score-step="-0.1" data-field="${field}">−</button><output data-score-output="${field}">${rating(scores[field])}</output><button data-score-step="0.1" data-field="${field}">+</button></div></div>`).join("")}</div>`;
const tagChoices = ["stays with me", "surprised me", "grew on me", "feels personal", "one perfect moment", "immediate replay", "admire > love", "hard to explain"];

export const rateHome = () => `${pageHeader("RATE", "What do you want to rate?", "The workspace is deliberately separate from browsing.")}<div class="rate-choices"><article><span class="mono">TRACK</span><h2>Listening Shape</h2><p>Score Song, Vocal, Production and Overall. Resonance stays separate.</p>${link(`/rate/track/${trackId(choices[0])}`, "RATE A TRACK", "button primary")}</article><article><span class="mono">ALBUM</span><h2>Listening Landscape</h2><p>Work track by track, then give the album its own final score.</p>${link(`/rate/album/${slug(data.profile.albumArchive[0].artist + "-" + data.profile.albumArchive[0].title)}`, "RATE AN ALBUM", "button primary")}</article></div><section class="continue-panel"><span class="mono">CONTINUE RATING</span><p>Choose from a confirmed record:</p><div class="inline-links">${choices.slice(0, 8).map((track) => link(`/rate/track/${trackId(track)}`, track.title)).join("")}</div></section>`;

export const rateTrack = (id) => {
  const track = findTrack(id) || choices[0];
  const saved = readRatings()[trackId(track)]; const scores = saved?.scores || { song: 7.5, vocal: 7.5, production: 7.5, overall: 7.5 };
  return `${pageHeader("RATE / TRACK", safe(track.title), track.artist)}<section class="track-rate-session"><div class="interactive-radar" id="rate-radar">${radar(scores, { interactive: true, className: "large-radar" })}<p class="mono">DRAG A NODE / OR USE PRECISE CONTROLS</p></div><form id="track-rate-form">${scoreControls(scores)}<fieldset class="tag-picker"><legend class="mono">WHAT STAYED? / PICK UP TO 3</legend>${tagChoices.map((tag) => `<button type="button" data-tag="${tag}">${tag}</button>`).join("")}</fieldset><button class="button primary" type="submit">SAVE RATING</button></form></section><aside id="rate-save-message"></aside>`;
};

const draftKey = (id) => "how-i-hear-music:album-draft:" + id;
const defaultDraft = (album) => ["Track 01", "Track 02", "Track 03", "Track 04", "Track 05", "Track 06"].map((title, index) => ({ title, overall: [7.6, 8.4, 7.9, 9.1, 8.6, 8.2][index], album: album.title }));
export const rateAlbum = (id) => {
  const album = findAlbum(id) || data.profile.albumArchive[0]; const draft = storage.get(draftKey(id), defaultDraft(album));
  return `${pageHeader("RATE / ALBUM", safe(album.title), album.artist)}<section class="album-rate-session"><div id="album-wave-session">${waveform(draft, { interactive: true })}${summary(draft)}</div><div class="album-progress"><span class="mono">TRACK-BY-TRACK</span><span id="album-progress">01 / ${String(draft.length).padStart(2, "0")}</span></div><form id="album-rate-form"><div class="album-track-controls">${draft.map((track, index) => `<label><span>${String(index + 1).padStart(2, "0")}</span><input data-album-title="${index}" value="${safe(track.title)}"><div><button type="button" data-album-step="-0.1" data-index="${index}">−</button><output>${rating(track.overall)}</output><button type="button" data-album-step="0.1" data-index="${index}">+</button></div></label>`).join("")}</div><label class="album-overall"><span>ALBUM OVERALL</span><input id="album-overall-input" type="number" min="0" max="11" step="0.1" value="${storage.get(draftKey(id) + ":overall", 8.5)}"></label><button class="button primary" type="submit">COMPLETE ALBUM RATING</button></form></section><aside id="album-save-message"></aside>`;
};

export const bindRating = (path, navigate) => {
  const match = path.match(/^\/rate\/track\/(.+)$/);
  if (match) {
    const track = findTrack(match[1]) || choices[0]; let state = { ...(readRatings()[trackId(track)]?.scores || { song: 7.5, vocal: 7.5, production: 7.5, overall: 7.5 }) }; let tags = [];
    const render = () => { document.getElementById("rate-radar").innerHTML = radar(state, { interactive: true, className: "large-radar" }) + "<p class='mono'>DRAG A NODE / OR USE PRECISE CONTROLS</p>"; fields.forEach((field) => { const output = document.querySelector(`[data-score-output='${field}']`); if (output) output.textContent = rating(state[field]); }); };
    document.getElementById("track-rate-form").addEventListener("click", (event) => {
      const step = event.target.closest("[data-score-step]"); if (step) { const field = step.dataset.field; state[field] = Math.max(0, Math.min(11, Math.round((state[field] + Number(step.dataset.scoreStep)) * 10) / 10)); render(); }
      const tag = event.target.closest("[data-tag]"); if (tag) { const value = tag.dataset.tag; tags = tags.includes(value) ? tags.filter((item) => item !== value) : tags.length < 3 ? [...tags, value] : tags; tag.classList.toggle("active", tags.includes(value)); }
    });
    let activeField = null;
    document.getElementById("rate-radar").addEventListener("pointerdown", (event) => { const node = event.target.closest("[data-radar-field]"); if (!node) return; activeField = node.dataset.radarField; event.preventDefault(); });
    document.getElementById("rate-radar").addEventListener("pointermove", (event) => { if (!activeField || !event.buttons) return; const svg = document.querySelector("#rate-radar svg"); const box = svg.getBoundingClientRect(); const x = (event.clientX - box.left) / box.width * 220; const y = (event.clientY - box.top) / box.height * 220; const index = fields.indexOf(activeField); const angle = -Math.PI / 2 + Math.PI * 2 * index / 4; const projected = ((x - 110) * Math.cos(angle) + (y - 110) * Math.sin(angle)) / 70 * 11; state[activeField] = Math.max(0, Math.min(11, Math.round(projected * 10) / 10)); render(); });
    window.addEventListener("pointerup", () => { activeField = null; }, { once: false });
    document.getElementById("track-rate-form").addEventListener("submit", (event) => { event.preventDefault(); const saved = { scores: state, tags, updatedAt: new Date().toISOString() }; saveRating(trackId(track), saved); appendJournal({ type: "rating", title: track.title, artist: track.artist, scores: state, at: saved.updatedAt }); document.getElementById("rate-save-message").innerHTML = `<span class='mono'>RATING SAVED</span><p>Saved in this browser.</p>${link(`/archive/tracks/${trackId(track)}`, "VIEW TRACK", "button")}`; });
  }
  const albumMatch = path.match(/^\/rate\/album\/(.+)$/);
  if (albumMatch) {
    const id = albumMatch[1]; const album = findAlbum(id) || data.profile.albumArchive[0]; let draft = storage.get(draftKey(id), defaultDraft(album));
    const render = () => { const target = document.getElementById("album-wave-session"); if (target) target.innerHTML = waveform(draft, { interactive: true }) + summary(draft); document.querySelectorAll(".album-track-controls output").forEach((output, index) => { output.textContent = rating(draft[index].overall); }); };
    document.getElementById("album-rate-form").addEventListener("click", (event) => { const button = event.target.closest("[data-album-step]"); if (!button) return; const index = Number(button.dataset.index); draft[index].overall = Math.max(0, Math.min(11, Math.round((draft[index].overall + Number(button.dataset.albumStep)) * 10) / 10)); storage.set(draftKey(id), draft); render(); });
    document.getElementById("album-rate-form").addEventListener("input", (event) => { const input = event.target.closest("[data-album-title]"); if (!input) return; draft[Number(input.dataset.albumTitle)].title = input.value; storage.set(draftKey(id), draft); });
    document.getElementById("album-rate-form").addEventListener("submit", (event) => { event.preventDefault(); const overall = Number(document.getElementById("album-overall-input").value); storage.set(draftKey(id) + ":overall", overall); appendJournal({ type: "album", title: album.title, artist: album.artist, overall, at: new Date().toISOString() }); document.getElementById("album-save-message").innerHTML = `<span class='mono'>ALBUM COMPLETE</span><p>${safe(album.title)} saved with an overall score of ${rating(overall)}.</p>${link(`/archive/albums/${id}`, "VIEW ALBUM", "button")}`; });
  }
};
