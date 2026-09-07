import { allAlbums, allTracks, importedAlbums, rating, safe, slug, storage, trackId, visibleJournal, visibleRatings } from "./music/data.js";
import { withBase } from "./layout/paths.js";
import { bindCoverTones, fallbackCoverTone } from "./layout/cover-tone.js?ui=3.12.14";
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
  scores: visibleRatings()[trackId(track)]?.scores || track.scores || {},
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
const showcaseFirst = (albums) => {
  const lead = albums.find((album) => albumKey(album) === "单依纯-纯妹妹" || slug(`${album.artist}-${album.title}`) === "单依纯-纯妹妹");
  return lead ? [lead, ...shuffled(albums.filter((album) => album !== lead))] : shuffled(albums);
};
const coverSourcesForAlbum = (album) => {
  const id = album.id || slug(`${album.artist}-${album.title}`);
  const override = storage.get(coverOverrideKey, {})[id] || "";
  const localOverride = storage.get(localCoverOverrideKey, {})[id] || "";
  const canonical = album.coverUrl || "";
  const primary = localOverride || override || canonical;
  const alternate = [override, canonical, album.coverFallback].find((source) => source && source !== primary) || "";
  return { primary, alternate };
};
const homeAlbums = () => {
  const albums = allAlbums();
  const samples = albums.filter((album) => homeSampleAlbumKeys.has(albumKey(album)) || homeSampleAlbumKeys.has(slug(`${album.artist}-${album.title}`)));
  if (!syncSession()?.token) return showcaseFirst(samples).slice(0, homeAlbumCapacity);
  const imported = importedAlbums();
  const importedKeys = new Set(imported.map(albumKey));
  // Existing non-showcase archive records are already the owner's albums;
  // imported records extend that set. Keep the capacity decision independent
  // of cover state and never count unimported showcase-only samples.
  const own = albums.filter((album) => !album.showcaseOnly || importedKeys.has(albumKey(album)));
  // Keep the complete showcase deck even when one remote cover is unavailable;
  // the card's fallback state preserves the record instead of silently dropping it.
  const availableSamples = samples.filter((album) => !importedKeys.has(albumKey(album)));
  const scoredSamples = availableSamples.filter((album) => albumScore(album) !== null);
  const unscoredSamples = availableSamples.filter((album) => albumScore(album) === null);
  if (!own.length) return showcaseFirst(samples).slice(0, homeAlbumCapacity);
  if (own.length >= homeAlbumCapacity) return shuffled(own);
  return [...shuffled(own), ...shuffled([...scoredSamples, ...unscoredSamples]).slice(0, homeAlbumCapacity - own.length)];
};
const albumScore = (album) => {
  if (!syncSession()?.token) return null;
  const id = album.id || slug(`${album.artist}-${album.title}`);
  const history = visibleJournal().filter((entry) => entry.type === "album" && (entry.albumId === id || entry.title === album.title && entry.artist === album.artist)).sort((left, right) => new Date(right.at || 0) - new Date(left.at || 0))[0];
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
const landscapeMarkup = (album, index) => {
  const id = albumKey(album);
  const { primary: coverUrl, alternate } = coverSourcesForAlbum(album);
  const fallbackTone = album.themeColor || fallbackCoverTone(`${album.artist}-${album.title}`);
  return `<article class="featured-landscape-slide${index === 0 ? " active" : ""}" data-home-landscape-slide${index === 0 ? "" : " hidden"}><div class="featured-landscape-art"><a class="album-detail-record featured-landscape-record" data-landscape-record data-cover-tone data-cover-source="${safe(coverUrl)}" style="--record-color:${fallbackTone};--sleeve-edge-color:${fallbackTone}" href="${withBase(`/archive/albums/${encodeURIComponent(id)}`)}" data-route aria-label="Open album — ${safe(album.title)}"><span class="album-detail-disc" aria-hidden="true"></span><div class="album-detail-image">${coverUrl ? `<img data-cover-image${alternate ? ` data-cover-fallback-source="${safe(alternate)}"` : ""} referrerpolicy="no-referrer" draggable="false" src="${safe(coverUrl)}" alt="${safe(album.artist)} — ${safe(album.title)} cover"><span class="home-record-fallback" data-cover-fallback hidden>COVER UNAVAILABLE</span>` : `<span class="home-record-fallback">COVER UNAVAILABLE</span>`}</div></a></div><div class="featured-landscape-copy"><span class="eyebrow mono">FEATURED LANDSCAPE</span><h2>${safe(album.title)}</h2><p>${safe(album.artist)}</p></div><div class="featured-landscape-wave">${waveform(album.tracks, { className: "ink-draw-wave" })}</div></article>`;
};

export const home = () => {
  const ratedTracks = shuffled(allTracks().map(withCurrentScores).filter((track) => ["song", "vocal", "production", "overall"].every((field) => Number.isFinite(Number(track.scores?.[field])))));
  const current = homeAlbums();
  const featuredTracks = ratedTracks.slice(0, 6);
  const albumCandidates = shuffled(current.map((album) => {
    const tracks = (album.tracks?.length ? album.tracks : allTracks().filter((track) => track.artist === album.artist && track.album === album.title)).map(withCurrentScores);
    return { ...album, tracks: tracks.map((track) => ({ title: track.title, overall: track.scores?.overall })) };
  }));
  const scoredAlbums = albumCandidates.filter((album) => album.tracks.some((track) => Number.isFinite(Number(track.overall))));
  const featuredLandscapes = (scoredAlbums.length ? scoredAlbums : albumCandidates).slice(0, 6);
  const featuredShape = featuredTracks.length ? `<section class="featured-shape home-shape-cycle shape-is-drawing" data-home-shape-cycle>${featuredTracks.map(shapeMarkup).join("")}</section>` : `<section class="featured-shape featured-shape-empty" data-home-shape-cycle><div class="featured-shape-copy"><span class="eyebrow mono">FEATURED SHAPE</span><h2>Complete the shape.</h2><p>Song, Vocal, Production and Overall must all be rated before a track appears here.</p></div></section>`;
  const listeningSection = current.length ? `<section class="home-section home-listening"><span class="eyebrow mono">CURRENTLY LISTENING</span><div class="home-record-stage" data-home-record-stage role="region" aria-roledescription="carousel" aria-label="Currently listening">${current.map(recordMarkup).join("")}<div class="home-record-controls"><button type="button" data-home-record-previous aria-label="Previous record">← <span>PREV</span></button><button type="button" data-home-record-next aria-label="Next record"><span>NEXT</span> →</button></div></div></section>` : "";
  const featuredLandscape = featuredLandscapes.length ? `<section class="featured-landscape home-landscape-cycle" data-home-landscape-cycle role="region" aria-roledescription="carousel" aria-label="Featured album landscapes">${featuredLandscapes.map(landscapeMarkup).join("")}<div class="featured-landscape-controls" aria-label="Featured landscape controls"><button type="button" data-home-landscape-previous aria-label="Previous featured album">← <span>PREV</span></button><button type="button" data-home-landscape-next aria-label="Next featured album"><span>NEXT</span> →</button></div></section>` : "";
  return `<section class="home-hero"><h1>How I<br><em>hear music.</em></h1><p>Melody opens the door.<br>Everything else has to earn its place.</p></section>${listeningSection}${featuredShape}${featuredLandscape}<section class="short-manifesto"><p>Music can be minimal or maximal, familiar or surprising. The only question is whether it stays alive.</p></section>`;
};

export const bindHome = () => {
  stopHomeMotion();
  const stage = document.querySelector("[data-home-record-stage]");
  const records = [...document.querySelectorAll("[data-home-record]")];
  const shapeCycle = document.querySelector("[data-home-shape-cycle]");
  const shapeSlides = [...document.querySelectorAll("[data-home-shape-slide]")];
  const landscapeCycle = document.querySelector("[data-home-landscape-cycle]");
  const landscapeSlides = [...document.querySelectorAll("[data-home-landscape-slide]")];
  if (!stage && !shapeCycle && !landscapeCycle) return;
  let active = 0;
  let recordTimer = null;
  let shapeTimer = null;
  let shapeActive = 0;
  let wheelLocked = false;
  let pointerStart = null;
  let suppressClick = false;
  let shapeSwapTimer = null;
  let shapeFadeTimer = null;
  let landscapeTimer = null;
  let landscapeSwapTimer = null;
  let landscapeActive = 0;
  let landscapeChanging = false;
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
  const showLandscape = (index) => {
    if (!landscapeCycle || landscapeChanging || landscapeSlides.length < 2) return;
    const next = (index + landscapeSlides.length) % landscapeSlides.length;
    const previousSlide = landscapeSlides[landscapeActive];
    const nextSlide = landscapeSlides[next];
    if (!previousSlide || !nextSlide || next === landscapeActive) return;
    landscapeChanging = true;
    landscapeCycle.classList.add("landscape-is-changing");
    const previousRecord = previousSlide.querySelector("[data-landscape-record]");
    previousRecord?.classList.remove("record-is-open");
    previousRecord?.classList.add("record-is-retracting");
    landscapeSwapTimer = window.setTimeout(() => {
      previousSlide.hidden = true;
      nextSlide.hidden = false;
      landscapeSlides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === next));
      landscapeActive = next;
      const nextRecord = nextSlide.querySelector("[data-landscape-record]");
      nextRecord?.classList.remove("record-is-retracting");
      requestAnimationFrame(() => nextRecord?.classList.add("record-is-open"));
      landscapeChanging = false;
      landscapeCycle.classList.remove("landscape-is-changing");
      landscapeSwapTimer = null;
    }, 360);
  };
  const stopLandscape = () => { if (landscapeTimer) window.clearInterval(landscapeTimer); landscapeTimer = null; };
  const playLandscape = () => { stopLandscape(); if (!reduceMotion && landscapeSlides.length > 1) landscapeTimer = window.setInterval(() => showLandscape(landscapeActive + 1), 5600); };
  bindCoverTones();
  if (stage && records.length) { arrange(); playRecords(); }
  if (landscapeSlides.length) { landscapeSlides.forEach((slide, index) => { slide.hidden = index !== landscapeActive; }); requestAnimationFrame(() => landscapeSlides[landscapeActive]?.querySelector("[data-landscape-record]")?.classList.add("record-is-open")); playLandscape(); }
  if (!reduceMotion && shapeSlides.length > 1) shapeTimer = window.setInterval(() => showShape(shapeActive + 1), 4400);
  stopHomeMotion = () => { stopRecords(); stopLandscape(); if (recordMoveTimer) window.clearTimeout(recordMoveTimer); recordMoveTimer = null; recordMovePending = 0; recordMoving = false; if (shapeTimer) window.clearInterval(shapeTimer); if (shapeSwapTimer) window.clearTimeout(shapeSwapTimer); if (shapeFadeTimer) window.clearTimeout(shapeFadeTimer); if (landscapeSwapTimer) window.clearTimeout(landscapeSwapTimer); };
  if (stage && records.length) {
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
  }
  landscapeCycle?.querySelector("[data-home-landscape-previous]")?.addEventListener("click", () => { showLandscape(landscapeActive - 1); playLandscape(); });
  landscapeCycle?.querySelector("[data-home-landscape-next]")?.addEventListener("click", () => { showLandscape(landscapeActive + 1); playLandscape(); });
  landscapeCycle?.addEventListener("focusin", stopLandscape);
  landscapeCycle?.addEventListener("focusout", (event) => { if (!landscapeCycle.contains(event.relatedTarget)) playLandscape(); });
};
