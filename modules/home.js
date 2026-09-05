import { allAlbums, allTracks, importedAlbums, rating, safe, slug, storage, trackId } from "./music/data.js";
import { withBase } from "./layout/paths.js";
import { bindCoverTones, fallbackCoverTone } from "./layout/cover-tone.js?ui=3.11.37";
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
const localCoverOverrideKey = "how-i-hear-music:cover-overrides-local:v1";
const homeAlbumCapacity = 9;
const homeSampleAlbumKeys = new Set([
  "单依纯-纯妹妹",
  "taylor-swift-lover",
  "kanye-west-graduation",
  "kacey-musgraves-golden-hour",
  "bad-bunny-un-verano-sin-ti",
  "charli-xcx-brat",
  "rihanna-loud",
  "coldplay-mylo-xyloto",
  "metallica-72-seasons",
]);
const albumKey = (album) => album.id || slug(`${album.artist}-${album.title}`);
const coverSourcesForAlbum = (album) => {
  const id = album.id || slug(`${album.artist}-${album.title}`);
  const override = storage.get(coverOverrideKey, {})[id] || "";
  const localOverride = storage.get(localCoverOverrideKey, {})[id] || "";
  const canonical = album.coverUrl || "";
  const primary = localOverride || override || canonical;
  const alternate = [override, canonical, album.coverFallback].find((source) => source && source !== primary) || "";
  return { primary, alternate };
};
const coverForAlbum = (album) => coverSourcesForAlbum(album).primary;
const homeAlbums = () => {
  const albums = allAlbums();
  const imported = importedAlbums();
  const importedKeys = new Set(imported.map(albumKey));
  const own = albums.filter((album) => importedKeys.has(albumKey(album)) && coverForAlbum(album));
  const samples = albums.filter((album) => homeSampleAlbumKeys.has(albumKey(album)) && !importedKeys.has(albumKey(album)) && coverForAlbum(album));
  const scoredSamples = samples.filter((album) => albumScore(album) !== null);
  const unscoredSamples = samples.filter((album) => albumScore(album) === null);
  if (!syncSession()?.token || !own.length) return shuffled([...scoredSamples, ...unscoredSamples]).slice(0, homeAlbumCapacity);
  if (own.length >= homeAlbumCapacity) return shuffled(own);
  return [...shuffled(own), ...shuffled([...scoredSamples, ...unscoredSamples]).slice(0, homeAlbumCapacity - own.length)];
};
const albumScore = (album) => {
  if (!syncSession()?.token) return null;
  const id = album.id || slug(`${album.artist}-${album.title}`);
  const history = storage.get("how-i-hear-music:journal:v1", []).filter((entry) => entry.type === "album" && (entry.albumId === id || entry.title === album.title && entry.artist === album.artist)).sort((left, right) => new Date(right.at || 0) - new Date(left.at || 0))[0];
  return [storage.get(`how-i-hear-music:album-draft:${id}:overall`, null), history?.overall, album.overall].map((value) => value === null || value === undefined || value === "" ? null : Number(value)).find((value) => value !== null && Number.isFinite(value)) ?? null;
};
const recordMarkup = (album, index) => {
  const id = albumKey(album);
  const { primary: coverUrl, alternate } = coverSourcesForAlbum(album);
  const score = albumScore(album);
  const fallbackTone = fallbackCoverTone(`${album.artist}-${album.title}`);
  const recordColor = album.themeColor || fallbackTone;
  return `<a class="home-record" data-home-record data-home-record-index="${index}" href="${withBase(`/archive/albums/${encodeURIComponent(id)}`)}" data-route><span class="home-record-object" data-cover-tone data-cover-source="${safe(coverUrl)}" style="--record-color:${recordColor};--sleeve-edge-color:${recordColor}" aria-hidden="true"><span class="home-record-disc"></span><span class="home-record-sleeve">${sleeveDepth}<img data-cover-image${alternate ? ` data-cover-fallback-source="${safe(alternate)}"` : ""} referrerpolicy="no-referrer" draggable="false" src="${safe(coverUrl)}" alt=""><span class="home-record-fallback" data-cover-fallback hidden>COVER UNAVAILABLE</span></span></span><span class="home-record-caption"><small>${safe(album.artist)}</small><b>${safe(album.title)}</b>${score === null ? "" : `<strong>${rating(score)}</strong>`}</span></a>`;
};
const shapeMarkup = (track, index) => `<article class="featured-shape-slide${index === 0 ? " active" : ""}" data-home-shape-slide${index === 0 ? "" : " hidden"}><div class="featured-shape-copy"><span class="eyebrow mono">FEATURED SHAPE</span><h2>${safe(track.title)}</h2><p>${safe(track.artist)}</p></div><div class="featured-shape-visual">${radar(track.scores, { className: "home-radar ink-draw-radar", showValues: true, valuePlacement: "outside" })}</div></article>`;

export const home = () => {
  const ratedTracks = shuffled(allTracks().map(withCurrentScores).filter((track) => ["song", "vocal", "production", "overall"].every((field) => Number.isFinite(Number(track.scores?.[field])))));
  const current = homeAlbums();
  const featuredTracks = ratedTracks.slice(0, 6);
  const albumCandidates = shuffled(current.map((album) => {
    const tracks = (album.tracks?.length ? album.tracks : allTracks().filter((track) => track.artist === album.artist && track.album === album.title)).map(withCurrentScores);
    return { ...album, tracks: tracks.map((track) => ({ title: track.title, overall: track.scores?.overall })) };
  }));
  const featuredAlbum = albumCandidates.find((album) => album.tracks.some((track) => Number.isFinite(Number(track.overall)))) || albumCandidates[0] || { title: "—", artist: "", tracks: [] };
  const featuredShape = featuredTracks.length ? `<section class="featured-shape home-shape-cycle shape-is-drawing" data-home-shape-cycle>${featuredTracks.map(shapeMarkup).join("")}</section>` : `<section class="featured-shape featured-shape-empty" data-home-shape-cycle><div class="featured-shape-copy"><span class="eyebrow mono">FEATURED SHAPE</span><h2>Complete the shape.</h2><p>Song, Vocal, Production and Overall must all be rated before a track appears here.</p></div></section>`;
  return `<section class="home-hero"><h1>How I<br><em>hear music.</em></h1><p>Melody opens the door.<br>Everything else has to earn its place.</p></section><section class="home-section home-listening"><span class="eyebrow mono">CURRENTLY LISTENING</span><div class="home-record-stage" data-home-record-stage role="region" aria-roledescription="carousel" aria-label="Currently listening">${current.map(recordMarkup).join("")}<div class="home-record-controls"><button type="button" data-home-record-previous aria-label="Previous record">← <span>PREV</span></button><button type="button" data-home-record-next aria-label="Next record"><span>NEXT</span> →</button></div></div></section>${featuredShape}<section class="featured-landscape"><div><span class="eyebrow mono">FEATURED LANDSCAPE</span><h2>${safe(featuredAlbum.title)}</h2><p>${safe(featuredAlbum.artist)}</p></div><div>${waveform(featuredAlbum.tracks, { className: "ink-draw-wave" })}</div></section><section class="short-manifesto"><p>Music can be minimal or maximal, familiar or surprising. The only question is whether it stays alive.</p></section>`;
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
  let recordMoveTimer = null;
  let recordMovePending = 0;
  let recordMoving = false;
  const retractRecord = (record) => {
    if (!record) return;
    record.classList.add("record-is-retracting");
    window.clearTimeout(record._retractTimer);
    record._retractTimer = window.setTimeout(() => record.classList.remove("record-is-retracting"), 420);
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrange = () => records.forEach((record, index) => {
    const clockwise = (index - active + records.length) % records.length;
    const distance = clockwise > records.length / 2 ? clockwise - records.length : clockwise;
    const position = distance === 0 ? "front" : Math.abs(distance) <= 4 ? `${distance < 0 ? "left" : "right"}-${Math.abs(distance)}` : "back";
    record.dataset.recordPosition = position;
    record.setAttribute("aria-current", position === "front" ? "true" : "false");
    record.tabIndex = position === "front" ? 0 : -1;
  });
  const move = (step) => {
    recordMovePending += step;
    if (recordMoving) return;
    const nextStep = recordMovePending; recordMovePending = 0; recordMoving = true;
    const previous = records[active]; retractRecord(previous);
    recordMoveTimer = window.setTimeout(() => {
      active = (active + nextStep + records.length) % records.length;
      arrange(); recordMoving = false; recordMoveTimer = null;
      if (recordMovePending) move(recordMovePending);
    }, 180);
  };
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
  stopHomeMotion = () => { stopRecords(); if (recordMoveTimer) window.clearTimeout(recordMoveTimer); recordMoveTimer = null; recordMovePending = 0; recordMoving = false; if (shapeTimer) window.clearInterval(shapeTimer); if (shapeSwapTimer) window.clearTimeout(shapeSwapTimer); if (shapeFadeTimer) window.clearTimeout(shapeFadeTimer); };
  stage.querySelector("[data-home-record-previous]")?.addEventListener("click", (event) => { event.stopPropagation(); move(-1); playRecords(); });
  stage.querySelector("[data-home-record-next]")?.addEventListener("click", (event) => { event.stopPropagation(); move(1); playRecords(); });
  stage.addEventListener("wheel", (event) => { if (wheelLocked || Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 8) return; event.preventDefault(); wheelLocked = true; move(event.deltaX > 0 ? 1 : -1); playRecords(); window.setTimeout(() => { wheelLocked = false; }, 420); }, { passive: false });
  stage.addEventListener("pointerdown", (event) => { if (event.target.closest(".home-record-controls")) return; pointerStart = event.clientX; stage.setPointerCapture?.(event.pointerId); });
  stage.addEventListener("dragstart", (event) => event.preventDefault());
  stage.addEventListener("pointerup", (event) => { if (pointerStart === null) return; const delta = event.clientX - pointerStart; pointerStart = null; if (Math.abs(delta) > 32) { suppressClick = true; move(delta < 0 ? 1 : -1); playRecords(); window.setTimeout(() => { suppressClick = false; }, 0); } });
  stage.addEventListener("pointercancel", () => { pointerStart = null; });
  stage.addEventListener("focusin", (event) => { if (event.target.matches?.(":focus-visible")) stopRecords(); });
  stage.addEventListener("focusout", (event) => { if (!stage.contains(event.relatedTarget)) playRecords(); });
  records.forEach((record, index) => record.addEventListener("click", (event) => { if (suppressClick) { event.preventDefault(); return; } if (index === active) { playRecords(); return; } event.preventDefault(); const step = (index - active + records.length) % records.length; move(step > records.length / 2 ? step - records.length : step); playRecords(); }));
  stage.addEventListener("dblclick", playRecords);
};
