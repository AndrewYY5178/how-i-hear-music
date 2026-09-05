import { allAlbums, allTracks, rating, safe, slug, storage, trackId } from "./music/data.js";
import { withBase } from "./layout/paths.js";
import { bindCoverTones, fallbackCoverTone } from "./layout/cover-tone.js?ui=3.9.9";
import { radar, waveform } from "./rating/visuals.js";
import { syncSession } from "./music/cloud-sync.js";

const shuffled = (records) => {
  const result = [...records];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const withCurrentScores = (track) => ({
  ...track,
  scores: storage.get("how-i-hear-music:rating-sessions:v2", {})[trackId(track)]?.scores || track.scores || {},
});
let stopHomeMotion = () => {};
const sleeveDepth = `<span class="record-sleeve-back"></span><span class="record-sleeve-edge record-sleeve-edge-right"></span><span class="record-sleeve-edge record-sleeve-edge-left"></span><span class="record-sleeve-edge record-sleeve-edge-top"></span><span class="record-sleeve-edge record-sleeve-edge-bottom"></span>`;

const coverOverrideKey = "how-i-hear-music:cover-overrides:v1";
const coverSourcesForAlbum = (album) => {
  const id = album.id || slug(`${album.artist}-${album.title}`);
  const override = storage.get(coverOverrideKey, {})[id] || "";
  return { primary: override || album.coverUrl || "", alternate: override && album.coverUrl && override !== album.coverUrl ? album.coverUrl : "" };
};
const coverForAlbum = (album) => coverSourcesForAlbum(album).primary;
const albumScore = (album) => {
  if (!syncSession()?.token) return null;
  const id = album.id || slug(`${album.artist}-${album.title}`);
  const history = storage.get("how-i-hear-music:journal:v1", []).filter((entry) => entry.type === "album" && (entry.albumId === id || entry.title === album.title && entry.artist === album.artist)).sort((left, right) => new Date(right.at || 0) - new Date(left.at || 0))[0];
  return [storage.get(`how-i-hear-music:album-draft:${id}:overall`, null), history?.overall, album.overall].map((value) => value === null || value === undefined || value === "" ? null : Number(value)).find((value) => value !== null && Number.isFinite(value)) ?? null;
};
const recordMarkup = (album, index) => {
  const id = album.id || slug(`${album.artist}-${album.title}`);
  const { primary: coverUrl, alternate } = coverSourcesForAlbum(album);
  const score = albumScore(album);
  const fallbackTone = fallbackCoverTone(`${album.artist}-${album.title}`);
  return `<a class="home-record" data-home-record data-home-record-index="${index}" href="${withBase(`/archive/albums/${encodeURIComponent(id)}`)}" data-route><span class="home-record-object" data-cover-tone data-cover-source="${safe(coverUrl)}" style="--record-color:${fallbackTone}" aria-hidden="true"><span class="home-record-disc"></span><span class="home-record-sleeve">${sleeveDepth}<img data-cover-image${alternate ? ` data-cover-fallback-source="${safe(alternate)}"` : ""} draggable="false" src="${safe(coverUrl)}" alt=""><span class="home-record-fallback" data-cover-fallback hidden>COVER UNAVAILABLE</span></span></span><span class="home-record-caption"><small>${safe(album.artist)}</small><b>${safe(album.title)}</b>${score === null ? "" : `<strong>${rating(score)}</strong>`}</span></a>`;
};
const shapeMarkup = (track, index) => `<article class="featured-shape-slide${index === 0 ? " active" : ""}" data-home-shape-slide${index === 0 ? "" : " hidden"}><div class="featured-shape-copy"><span class="eyebrow mono">FEATURED SHAPE</span><h2>${safe(track.title)}</h2><p>${safe(track.artist)}</p></div><div class="featured-shape-visual">${radar(track.scores, { className: "home-radar ink-draw-radar" })}</div><div class="feature-score" aria-label="Track score breakdown">${["song", "vocal", "production", "overall"].map((field) => `<span>${field}<b>${rating(track.scores[field])}</b></span>`).join("")}</div></article>`;

export const home = () => {
  const ratedTracks = shuffled(allTracks().map(withCurrentScores).filter((track) => Number.isFinite(Number(track.scores?.overall))));
  const current = shuffled(allAlbums().filter((album) => coverForAlbum(album)));
  const featuredTracks = ratedTracks.slice(0, 6);
  if (!featuredTracks.length) featuredTracks.push(withCurrentScores(allTracks()[0] || {}));
  const albumCandidates = shuffled(allAlbums().map((album) => {
    const tracks = (album.tracks?.length ? album.tracks : allTracks().filter((track) => track.artist === album.artist && track.album === album.title)).map(withCurrentScores);
    return { ...album, tracks: tracks.map((track) => ({ title: track.title, overall: track.scores?.overall })) };
  }));
  const featuredAlbum = albumCandidates.find((album) => album.tracks.some((track) => Number.isFinite(Number(track.overall)))) || albumCandidates[0] || { title: "—", artist: "", tracks: [] };
  return `<section class="home-hero"><h1>How I<br><em>hear music.</em></h1><p>Melody opens the door.<br>Everything else has to earn its place.</p></section><section class="home-section home-listening"><span class="eyebrow mono">CURRENTLY LISTENING</span><div class="home-record-stage" data-home-record-stage role="region" aria-roledescription="carousel" aria-label="Currently listening">${current.map(recordMarkup).join("")}<div class="home-record-controls"><button type="button" data-home-record-previous aria-label="Previous record">← <span>PREV</span></button><button type="button" data-home-record-next aria-label="Next record"><span>NEXT</span> →</button></div></div></section><section class="featured-shape home-shape-cycle shape-is-drawing" data-home-shape-cycle>${featuredTracks.map(shapeMarkup).join("")}</section><section class="featured-landscape"><div><span class="eyebrow mono">FEATURED LANDSCAPE</span><h2>${safe(featuredAlbum.title)}</h2><p>${safe(featuredAlbum.artist)}</p></div><div>${waveform(featuredAlbum.tracks, { className: "ink-draw-wave" })}</div></section><section class="short-manifesto"><p>Music can be minimal or maximal, familiar or surprising. The only question is whether it stays alive.</p></section>`;
};

export const bindHome = () => {
  stopHomeMotion();
  const stage = document.querySelector("[data-home-record-stage]");
  const records = [...document.querySelectorAll("[data-home-record]")];
  const shapeCycle = document.querySelector("[data-home-shape-cycle]");
  const shapeSlides = [...document.querySelectorAll("[data-home-shape-slide]")];
  if (!stage || !records.length) return;
  let active = 0;
  let recordTimer = null;
  let shapeTimer = null;
  let shapeActive = 0;
  let wheelLocked = false;
  let pointerStart = null;
  let suppressClick = false;
  let shapeSwapTimer = null;
  let shapeFadeTimer = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrange = () => records.forEach((record, index) => {
    const clockwise = (index - active + records.length) % records.length;
    const distance = clockwise > records.length / 2 ? clockwise - records.length : clockwise;
    const position = distance === 0 ? "front" : Math.abs(distance) <= 4 ? `${distance < 0 ? "left" : "right"}-${Math.abs(distance)}` : "back";
    record.dataset.recordPosition = position;
    record.setAttribute("aria-current", position === "front" ? "true" : "false");
    record.tabIndex = position === "front" ? 0 : -1;
  });
  const move = (step) => { active = (active + step + records.length) % records.length; arrange(); };
  const stopRecords = () => { if (recordTimer) window.clearInterval(recordTimer); recordTimer = null; };
  const playRecords = () => { stopRecords(); if (!reduceMotion) recordTimer = window.setInterval(() => move(1), 2600); };
  const showShape = (index) => {
    if (!shapeCycle || shapeCycle.classList.contains("shape-is-changing")) return;
    const next = (index + shapeSlides.length) % shapeSlides.length;
    shapeCycle.classList.add("shape-is-changing");
    shapeSwapTimer = window.setTimeout(() => {
      shapeActive = next;
      shapeSlides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== shapeActive; slide.classList.toggle("active", slideIndex === shapeActive); });
      shapeCycle.classList.remove("shape-is-drawing");
      void shapeCycle.offsetWidth;
      shapeCycle.classList.add("shape-is-drawing");
    }, 480);
    shapeFadeTimer = window.setTimeout(() => shapeCycle.classList.remove("shape-is-changing"), 1080);
  };
  bindCoverTones(stage);
  arrange(); playRecords();
  if (!reduceMotion && shapeSlides.length > 1) shapeTimer = window.setInterval(() => showShape(shapeActive + 1), 4400);
  stopHomeMotion = () => { stopRecords(); if (shapeTimer) window.clearInterval(shapeTimer); if (shapeSwapTimer) window.clearTimeout(shapeSwapTimer); if (shapeFadeTimer) window.clearTimeout(shapeFadeTimer); };
  stage.querySelector("[data-home-record-previous]")?.addEventListener("click", (event) => { event.stopPropagation(); move(-1); playRecords(); });
  stage.querySelector("[data-home-record-next]")?.addEventListener("click", (event) => { event.stopPropagation(); move(1); playRecords(); });
  stage.addEventListener("wheel", (event) => { if (wheelLocked || Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 8) return; event.preventDefault(); wheelLocked = true; move(event.deltaX > 0 ? 1 : -1); playRecords(); window.setTimeout(() => { wheelLocked = false; }, 420); }, { passive: false });
  stage.addEventListener("pointerdown", (event) => { if (event.target.closest(".home-record-controls")) return; pointerStart = event.clientX; stage.setPointerCapture?.(event.pointerId); });
  stage.addEventListener("dragstart", (event) => event.preventDefault());
  stage.addEventListener("pointerup", (event) => { if (pointerStart === null) return; const delta = event.clientX - pointerStart; pointerStart = null; if (Math.abs(delta) > 32) { suppressClick = true; move(delta < 0 ? 1 : -1); playRecords(); window.setTimeout(() => { suppressClick = false; }, 0); } });
  stage.addEventListener("pointercancel", () => { pointerStart = null; });
  stage.addEventListener("focusin", (event) => { if (event.target.matches?.(":focus-visible")) stopRecords(); });
  stage.addEventListener("focusout", (event) => { if (!stage.contains(event.relatedTarget)) playRecords(); });
  records.forEach((record, index) => record.addEventListener("click", (event) => { if (suppressClick) { event.preventDefault(); return; } if (index === active) { playRecords(); return; } event.preventDefault(); active = index; arrange(); playRecords(); }));
  stage.addEventListener("dblclick", playRecords);
};
