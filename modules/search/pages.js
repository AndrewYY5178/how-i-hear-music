import { allAlbums, allArtists, allTracks, safe, slug, storage, trackId } from "../music/data.js";
import { allMemoryEntries } from "../music/memory.js";
import { tasteDNA } from "../music/taste-dna.js";
import { link, pageHeader } from "../layout/shell.js";

const includes = (values, query) => values.filter(Boolean).join(" ").normalize("NFKC").toLowerCase().includes(query);
const row = (kind, title, copy, href) => `<article><span class="mono">${safe(kind)}</span><div><h2>${safe(title)}</h2><p>${safe(copy)}</p></div>${link(href, "OPEN →", "text-link")}</article>`;
const memoryHref = (entry) => entry.entityType === "album" ? `/archive/albums/${entry.entityId}` : entry.entityType === "artist" ? `/archive/artists/${entry.entityId}` : `/archive/tracks/${entry.entityId}`;

export const searchPage = () => {
  const raw = new URLSearchParams(location.search).get("q") || ""; const query = raw.trim().normalize("NFKC").toLowerCase(); const results = [];
  if (query) {
    allTracks().filter((track) => includes([track.title, track.artist, track.album, track.language, track.region], query)).forEach((track) => results.push(row("TRACK", track.title, [track.artist, track.album].filter(Boolean).join(" · "), `/archive/tracks/${trackId(track)}`)));
    allAlbums().filter((album) => includes([album.title, album.artist, album.year], query)).forEach((album) => results.push(row("ALBUM", album.title, album.artist, `/archive/albums/${album.id || slug(album.artist + "-" + album.title)}`)));
    allArtists().filter((artist) => includes([artist.name, artist.romanized, artist.role], query)).forEach((artist) => results.push(row("ARTIST", artist.name, artist.romanized || artist.role || "In the archive", `/archive/artists/${artist.id}`)));
    storage.get("how-i-hear-music:journal:v1", []).filter((entry) => includes([entry.title, entry.artist, entry.note, entry.moment?.note], query)).forEach((entry) => results.push(row("JOURNAL", entry.title, entry.note || entry.artist || "Saved listening entry", "/journal")));
    const albumNotes = storage.get("how-i-hear-music:album-notes:v1", {}); allAlbums().forEach((album) => { const id = album.id || slug(album.artist + "-" + album.title); const note = albumNotes[id]?.note; if (note && includes([album.title, album.artist, note], query)) results.push(row("ALBUM NOTE", album.title, note, `/archive/albums/${id}`)); });
    allMemoryEntries().filter((entry) => includes([entry.note, entry.zone], query)).forEach((entry) => results.push(row("MEMORY", entry.note || entry.zone, entry.source === "manual" ? "Placed manually" : "Derived from saved evidence", memoryHref(entry))));
    tasteDNA().filter((trait) => includes([trait.label, trait.copy], query)).forEach((trait) => results.push(row("TASTE DNA", trait.label, trait.copy, "/taste/dna")));
  }
  return `${pageHeader("SEARCH", raw ? `Results for “${safe(raw)}”.` : "Find anything in the archive.", "Tracks, albums, artists, Journal entries, Memory and Taste DNA share one local index.")}<form class="global-search-form"><label for="global-search-query" class="mono">SEARCH THE RECORD</label><div><input id="global-search-query" name="q" type="search" value="${safe(raw)}" placeholder="Title, artist, note, trait…" autofocus><button class="button primary" type="submit">SEARCH</button></div></form>${query ? `<p class="search-count mono">${results.length} ${results.length === 1 ? "RESULT" : "RESULTS"}</p><section class="global-search-results">${results.join("") || `<p class="empty-state">No local record matches this search.</p>`}</section>` : `<section class="search-prompt"><span class="mono">LOCAL INDEX</span><p>Search does not send your query or personal data to a server.</p></section>`}`;
};

export const bindSearch = (path, navigate) => {
  if (path !== "/search") return;
  document.querySelector(".global-search-form")?.addEventListener("submit", (event) => { event.preventDefault(); const query = new FormData(event.currentTarget).get("q"); navigate(`/search?q=${encodeURIComponent(String(query || "").trim())}`); });
};
