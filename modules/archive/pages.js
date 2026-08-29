import { data, findAlbum, findArtist, findTrack, rating, safe, slug, storage, trackId } from "../music/data.js";
import { radar, summary, waveform } from "../rating/visuals.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";
import { icon } from "../layout/icons.js";

const archiveNav = () => secondaryNav([["/archive/tracks", "Tracks"], ["/archive/albums", "Albums"], ["/archive/artists", "Artists"]]);
const tracksForArtist = (artistId) => data.songs.entries.filter((track) => track.artistId === artistId);
const coverOverrideKey = "how-i-hear-music:cover-overrides:v1";
const coverFor = (album, id) => storage.get(coverOverrideKey, {})[id] || album.coverUrl || "";
const journalEntries = () => storage.get("how-i-hear-music:journal:v1", []);
const historyMarkup = (entries) => entries.length ? `<div class="rating-history">${entries.slice(0, 8).map((entry) => `<article><time class="mono">${safe(new Date(entry.at).toLocaleDateString())}</time><strong>${rating(entry.type === "album" ? entry.overall : entry.scores?.overall)}</strong>${entry.note ? `<p>${safe(entry.note)}</p>` : ""}</article>`).join("")}</div>` : "<p>No local rating changes recorded yet.</p>";
const coverMarkup = (url, alt, loading = false) => url ? `<img data-cover-image src="${safe(url)}" alt="${safe(alt)}"${loading ? " loading=\"lazy\"" : ""}><div class="cover-fallback" data-cover-fallback hidden>NO COVER</div>` : `<div class="cover-fallback">NO COVER</div>`;
const recordCard = (track) => `<article class="track-card"><div>${radar(track.scores, { className: "mini-radar" })}</div><p class="mono">${safe(track.artist)}</p><h3>${safe(track.title)}</h3><strong>${rating(track.scores?.overall)}</strong>${link(`/archive/tracks/${trackId(track)}`, "Open track", "card-link")}</article>`;

const archiveGates = [["TRACKS", "/archive/tracks", data.songs.entries.length + " recorded tracks", "tracks"], ["ALBUMS", "/archive/albums", data.profile.albumArchive.length + " albums in view", "albums"], ["ARTISTS", "/archive/artists", data.artists.featured.length + " featured artists", "artists"]];
export const archiveHome = () => `${pageHeader("ARCHIVE", "Browse the record.", "Tracks, albums and artists that have entered the archive.")}${archiveNav()}<div class="archive-gates">${archiveGates.map(([title, href, note, iconName]) => `<article><span class="archive-symbol">${icon(iconName)}</span><span class="mono">${title}</span><p>${note}</p>${link(href, "Enter →", "text-link")}</article>`).join("")}</div>`;

const renderTrackCards = (tracks) => tracks.map(recordCard).join("") || "<p class='empty-state'>No tracks match this view.</p>";
export const archiveTracks = () => `${pageHeader("ARCHIVE / TRACKS", "Tracks in the record.", "Formal entries only. Ratings are never inferred.")}${archiveNav()}<div class="archive-tools"><input id="track-search" type="search" placeholder="Search tracks or artists"><div id="track-filters"><button data-track-filter="all" class="active">ALL</button><button data-track-filter="rated">RATED</button><button data-track-filter="beyond">BEYOND SCALE</button></div></div><div class="track-grid" id="track-grid">${renderTrackCards(data.songs.entries)}</div>`;

export const archiveTrackDetail = (id) => {
  const track = findTrack(id);
  if (!track) return `${pageHeader("ARCHIVE / TRACKS", "Track not found.", "This record may not have a confirmed archive entry.", link("/archive/tracks", "Back to tracks", "button"))}`;
  const scores = track.scores || {};
  const meta = [["ARTIST", track.artist], ["STATUS", track.songStatus?.replaceAll("_", " ") || "Recorded"], ["SCHEMA", track.scoreSchema?.replaceAll("_", " ") || ""]];
  const history = journalEntries().filter((entry) => entry.type === "rating" && (entry.trackId === trackId(track) || entry.title === track.title && entry.artist === track.artist));
  return `${pageHeader("TRACK", safe(track.title), track.artist, link(`/rate/track/${trackId(track)}`, "RATE TRACK", "button primary"))}<section class="detail-primary"><div>${radar(scores, { className: "detail-radar" })}</div><dl class="score-list">${Object.entries({ Song: scores.song, Vocal: scores.vocal, Production: scores.production, Overall: scores.overall }).map(([label, value]) => `<div><dt>${label}</dt><dd>${rating(value)}</dd></div>`).join("")}</dl></section><div class="meta-strip">${meta.map(([label, value]) => `<span><b>${label}</b>${safe(value)}</span>`).join("")}</div><details open><summary>LISTENING SHAPE <span>+</span></summary><p>The shape records the parts of this track that were separately named. Overall remains a personal response, not an average.</p></details><details><summary>MUSICAL MOMENTS <span>+</span></summary><p>No confirmed timestamped moments have been recorded yet.</p></details><details><summary>VERSIONS <span>+</span></summary><p>Version-specific comparisons appear only after a recording is confirmed.</p></details><details><summary>RATING HISTORY <span>+</span></summary>${historyMarkup(history)}</details>`;
};

export const archiveAlbums = () => `${pageHeader("ARCHIVE / ALBUMS", "Albums in view.", "A cover, an overall response, a compact fingerprint.")}${archiveNav()}<div class="album-grid">${data.profile.albumArchive.map((album) => { const id = slug(album.artist + "-" + album.title); return `<article class="album-card"><div class="album-card-cover">${coverMarkup(coverFor(album, id), album.artist + " — " + album.title + " cover", true)}</div><span class="album-fingerprint">▂▄▆█▇▅▆</span><p>${safe(album.artist)}</p><h3>${safe(album.title)}</h3>${link(`/archive/albums/${id}`, "Open album", "card-link")}</article>`; }).join("")}</div>`;

export const archiveAlbumDetail = (id) => {
  const album = findAlbum(id);
  if (!album) return `${pageHeader("ARCHIVE / ALBUMS", "Album not found.", "This album is not in the current archive.", link("/archive/albums", "Back to albums", "button"))}`;
  const tracks = data.songs.entries.filter((track) => canonicalAlbumMatch(track, album));
  const confirmed = tracks.filter((track) => Number.isFinite(track.scores?.overall));
  const history = journalEntries().filter((entry) => entry.type === "album" && entry.title === album.title && entry.artist === album.artist);
  return `${pageHeader("ALBUM", safe(album.title), album.artist, link(`/rate/album/${id}`, "RATE ALBUM", "button primary"))}<section class="album-detail-cover"><div class="album-detail-image">${coverMarkup(coverFor(album, id), album.title + " cover")}</div><div><span class="eyebrow mono">LISTENING LANDSCAPE</span>${waveform(confirmed)}${summary(confirmed)}</div></section><section><h2>Track list</h2><div class="tracklist">${confirmed.length ? confirmed.map((track, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span>${link(`/archive/tracks/${trackId(track)}`, track.title)}<b>${rating(track.scores.overall)}</b></div>`).join("") : "<p>No confirmed ordered track scores are available yet.</p>"}</div></section><details><summary>ALBUM CHARACTER <span>+</span></summary><p>Character becomes visible after an ordered full-album rating has been confirmed.</p></details><details><summary>NOTES <span>+</span></summary><p>No album notes have been recorded yet.</p></details><details><summary>COVER REFERENCE <span>+</span></summary><form class="cover-override-form" data-album-id="${safe(id)}"><label><span class="mono">HTTPS IMAGE URL</span><input type="url" name="coverUrl" value="${safe(storage.get(coverOverrideKey, {})[id] || "")}" placeholder="https://…"></label><div><button class="button" type="submit">SAVE LOCAL OVERRIDE</button><button class="button" type="button" data-clear-cover>USE CANONICAL COVER</button></div><p data-cover-status>Stored only in this browser; the image is referenced, never uploaded.</p></form></details><details><summary>RATING HISTORY <span>+</span></summary>${historyMarkup(history)}</details>`;
};
const canonicalAlbumMatch = (track, album) => track.artist === album.artist && (track.album === album.title || false);

export const archiveArtists = () => `${pageHeader("ARCHIVE / ARTISTS", "The people at the center.", "Editorial notes first. A score never replaces the reason an artist matters.")}${archiveNav()}<div class="artist-grid">${data.artists.featured.map((artist, index) => `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span><h2>${safe(artist.name)}</h2><p>${safe(artist.role || artist.romanized || "In the archive")}</p>${link(`/archive/artists/${artist.id}`, "Open artist", "text-link")}</article>`).join("")}</div>`;

export const archiveArtistDetail = (id) => {
  const artist = findArtist(id);
  if (!artist) return `${pageHeader("ARCHIVE / ARTISTS", "Artist not found.", "This artist is not in the current archive.", link("/archive/artists", "Back to artists", "button"))}`;
  const tracks = tracksForArtist(artist.id);
  const albums = data.profile.albumArchive.filter((album) => album.artist === artist.name);
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
  if (path !== "/archive/tracks") return;
  const search = document.getElementById("track-search"); const filters = document.getElementById("track-filters"); const grid = document.getElementById("track-grid"); let active = "all";
  const render = () => {
    const query = String(search.value || "").toLowerCase();
    const tracks = data.songs.entries.filter((track) => {
      const matches = !query || (track.title + " " + track.artist).toLowerCase().includes(query);
      const overall = Number(track.scores?.overall);
      return matches && (active === "all" || active === "rated" && Number.isFinite(overall) || active === "beyond" && overall > 10);
    });
    grid.innerHTML = renderTrackCards(tracks);
  };
  search.addEventListener("input", render);
  filters.addEventListener("click", (event) => { const button = event.target.closest("[data-track-filter]"); if (!button) return; active = button.dataset.trackFilter; filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button)); render(); });
};
