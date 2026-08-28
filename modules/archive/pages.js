import { data, findAlbum, findArtist, findTrack, rating, safe, slug, trackId } from "../music/data.js";
import { radar, summary, waveform } from "../rating/visuals.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";

const archiveNav = () => secondaryNav([["/archive/tracks", "Tracks"], ["/archive/albums", "Albums"], ["/archive/artists", "Artists"]]);
const tracksForArtist = (artistId) => data.songs.entries.filter((track) => track.artistId === artistId);
const recordCard = (track) => `<article class="track-card"><div>${radar(track.scores, { className: "mini-radar" })}</div><p class="mono">${safe(track.artist)}</p><h3>${safe(track.title)}</h3><strong>${rating(track.scores?.overall)}</strong>${link(`/archive/tracks/${trackId(track)}`, "Open track", "card-link")}</article>`;

const archiveGates = [["TRACKS", "/archive/tracks", data.songs.entries.length + " recorded tracks", "≋"], ["ALBUMS", "/archive/albums", data.profile.albumArchive.length + " albums in view", "◒"], ["ARTISTS", "/archive/artists", data.artists.featured.length + " featured artists", "✦"]];
export const archiveHome = () => `${pageHeader("ARCHIVE", "Browse the record.", "Tracks, albums and artists that have entered the archive.")}${archiveNav()}<div class="archive-gates">${archiveGates.map(([title, href, note, symbol]) => `<article><span class="archive-symbol" aria-hidden="true">${symbol}</span><span class="mono">${title}</span><p>${note}</p>${link(href, "Enter →", "text-link")}</article>`).join("")}</div>`;

const renderTrackCards = (tracks) => tracks.map(recordCard).join("") || "<p class='empty-state'>No tracks match this view.</p>";
export const archiveTracks = () => `${pageHeader("ARCHIVE / TRACKS", "Tracks in the record.", "Formal entries only. Ratings are never inferred.")}${archiveNav()}<div class="archive-tools"><input id="track-search" type="search" placeholder="Search tracks or artists"><div id="track-filters"><button data-track-filter="all" class="active">ALL</button><button data-track-filter="rated">RATED</button><button data-track-filter="beyond">BEYOND SCALE</button></div></div><div class="track-grid" id="track-grid">${renderTrackCards(data.songs.entries)}</div>`;

export const archiveTrackDetail = (id) => {
  const track = findTrack(id);
  if (!track) return `${pageHeader("ARCHIVE / TRACKS", "Track not found.", "This record may not have a confirmed archive entry.", link("/archive/tracks", "Back to tracks", "button"))}`;
  const scores = track.scores || {};
  const meta = [["ARTIST", track.artist], ["STATUS", track.songStatus?.replaceAll("_", " ") || "Recorded"], ["SCHEMA", track.scoreSchema?.replaceAll("_", " ") || ""]];
  return `${pageHeader("TRACK", safe(track.title), track.artist, link(`/rate/track/${id}`, "RATE TRACK", "button primary"))}<section class="detail-primary"><div>${radar(scores, { className: "detail-radar" })}</div><dl class="score-list">${Object.entries({ Song: scores.song, Vocal: scores.vocal, Production: scores.production, Overall: scores.overall }).map(([label, value]) => `<div><dt>${label}</dt><dd>${rating(value)}</dd></div>`).join("")}</dl></section><div class="meta-strip">${meta.map(([label, value]) => `<span><b>${label}</b>${safe(value)}</span>`).join("")}</div><details open><summary>LISTENING SHAPE <span>+</span></summary><p>The shape records the parts of this track that were separately named. Overall remains a personal response, not an average.</p></details><details><summary>MUSICAL MOMENTS <span>+</span></summary><p>No confirmed timestamped moments have been recorded yet.</p></details><details><summary>VERSIONS <span>+</span></summary><p>Version-specific comparisons appear only after a recording is confirmed.</p></details><details><summary>RATING HISTORY <span>+</span></summary><p>See Journal for saved rating changes.</p></details>`;
};

export const archiveAlbums = () => `${pageHeader("ARCHIVE / ALBUMS", "Albums in view.", "A cover, an overall response, a compact fingerprint.")}${archiveNav()}<div class="album-grid">${data.profile.albumArchive.map((album) => { const id = slug(album.artist + "-" + album.title); return `<article class="album-card">${album.coverUrl ? `<img src="${safe(album.coverUrl)}" alt="${safe(album.artist + " — " + album.title)} cover" loading="lazy">` : "<div class='cover-fallback'>NO COVER</div>"}<span class="album-fingerprint">▂▄▆█▇▅▆</span><p>${safe(album.artist)}</p><h3>${safe(album.title)}</h3>${link(`/archive/albums/${id}`, "Open album", "card-link")}</article>`; }).join("")}</div>`;

export const archiveAlbumDetail = (id) => {
  const album = findAlbum(id);
  if (!album) return `${pageHeader("ARCHIVE / ALBUMS", "Album not found.", "This album is not in the current archive.", link("/archive/albums", "Back to albums", "button"))}`;
  const tracks = data.songs.entries.filter((track) => canonicalAlbumMatch(track, album));
  const confirmed = tracks.filter((track) => Number.isFinite(track.scores?.overall));
  return `${pageHeader("ALBUM", safe(album.title), album.artist, link(`/rate/album/${id}`, "RATE ALBUM", "button primary"))}<section class="album-detail-cover">${album.coverUrl ? `<img src="${safe(album.coverUrl)}" alt="${safe(album.title)} cover">` : ""}<div><span class="eyebrow mono">LISTENING LANDSCAPE</span>${waveform(confirmed)}${summary(confirmed)}</div></section><section><h2>Track list</h2><div class="tracklist">${confirmed.length ? confirmed.map((track, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span>${link(`/archive/tracks/${trackId(track)}`, track.title)}<b>${rating(track.scores.overall)}</b></div>`).join("") : "<p>No confirmed ordered track scores are available yet.</p>"}</div></section><details><summary>ALBUM CHARACTER <span>+</span></summary><p>Character becomes visible after an ordered full-album rating has been confirmed.</p></details><details><summary>NOTES <span>+</span></summary><p>No album notes have been recorded yet.</p></details><details><summary>RATING HISTORY <span>+</span></summary><p>Rating changes appear in Journal.</p></details>`;
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

export const bindArchive = (path) => {
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
