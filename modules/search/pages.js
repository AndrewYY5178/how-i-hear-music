import { allAlbums, allArtists, allTracks, safe, slug, storage, trackId } from "../music/data.js";
import { allMemoryEntries } from "../music/memory.js";
import { tasteDNA } from "../music/taste-dna.js";
import { link, pageHeader } from "../layout/shell.js";

const includes = (values, query) => values.filter(Boolean).join(" ").normalize("NFKC").toLowerCase().includes(query);
const marked = (value, query) => { const text = String(value || ""); const index = text.normalize("NFKC").toLowerCase().indexOf(query); return index < 0 ? safe(text) : `${safe(text.slice(0, index))}<mark>${safe(text.slice(index, index + query.length))}</mark>${safe(text.slice(index + query.length))}`; };
const row = (kind, title, copy, href, query) => ({ kind, html:`<article data-search-kind="${safe(kind)}"><span class="mono">${safe(kind)}</span><div><h3>${marked(title, query)}</h3><p>${marked(copy, query)}</p></div>${link(href, "OPEN →", "text-link")}</article>` });
const memoryHref = (entry) => entry.entityType === "album" ? `/archive/albums/${entry.entityId}` : entry.entityType === "artist" ? `/archive/artists/${entry.entityId}` : `/archive/tracks/${entry.entityId}`;

export const searchPage = () => {
  const raw = new URLSearchParams(location.search).get("q") || ""; const query = raw.trim().normalize("NFKC").toLowerCase(); const results = [];
  if (query) {
    allTracks().filter((track) => includes([track.title, track.artist, track.album, track.language, track.region], query)).forEach((track) => results.push(row("TRACK", track.title, [track.artist, track.album].filter(Boolean).join(" · "), `/archive/tracks/${trackId(track)}`, query)));
    allAlbums().filter((album) => includes([album.title, album.artist, album.year], query)).forEach((album) => results.push(row("ALBUM", album.title, album.artist, `/archive/albums/${album.id || slug(album.artist + "-" + album.title)}`, query)));
    allArtists().filter((artist) => includes([artist.name, artist.romanized, artist.role], query)).forEach((artist) => results.push(row("ARTIST", artist.name, artist.romanized || artist.role || "In the archive", `/archive/artists/${artist.id}`, query)));
    storage.get("how-i-hear-music:journal:v1", []).filter((entry) => includes([entry.title, entry.artist, entry.note, entry.moment?.note], query)).forEach((entry) => results.push(row("JOURNAL", entry.title, entry.note || entry.artist || "Saved listening entry", "/journal", query)));
    const albumNotes = storage.get("how-i-hear-music:album-notes:v1", {}); allAlbums().forEach((album) => { const id = album.id || slug(album.artist + "-" + album.title); const note = albumNotes[id]?.note; if (note && includes([album.title, album.artist, note], query)) results.push(row("ALBUM NOTE", album.title, note, `/archive/albums/${id}`, query)); });
    allMemoryEntries().filter((entry) => includes([entry.note, entry.zone], query)).forEach((entry) => results.push(row("MEMORY", entry.note || entry.zone, entry.source === "manual" ? "Placed manually" : "Derived from saved evidence", memoryHref(entry), query)));
    tasteDNA().filter((trait) => includes([trait.label, trait.copy], query)).forEach((trait) => results.push(row("TASTE DNA", trait.label, trait.copy, "/taste/dna", query)));
  }
  const order = ["TRACK", "ALBUM", "ARTIST", "JOURNAL", "ALBUM NOTE", "MEMORY", "TASTE DNA"];
  const grouped = order.map((kind) => { const rows = results.filter((result) => result.kind === kind); return rows.length ? `<section class="search-result-group"><h2><span>${safe(kind)}</span><b>${rows.length}</b></h2>${rows.map((result) => result.html).join("")}</section>` : ""; }).join("");
  return `${pageHeader("SEARCH", raw ? `Results for “${safe(raw)}”.` : "Find anything in the archive.", "Tracks, albums, artists, Journal entries, Memory and Taste DNA share one local index.")}<form class="global-search-form"><label for="global-search-query" class="mono">SEARCH THE RECORD</label><div><input id="global-search-query" name="q" type="search" value="${safe(raw)}" placeholder="Title, artist, note, trait…" autofocus><button class="button primary" type="submit">SEARCH</button></div></form>${query ? `<p class="search-count mono">${results.length} ${results.length === 1 ? "RESULT" : "RESULTS"}</p><div class="global-search-results">${grouped || `<p class="empty-state">No local record matches this search.</p>`}</div>` : `<section class="search-prompt"><span class="mono">LOCAL INDEX</span><p>Search does not send your query or personal data to a server.</p></section>`}`;
};

export const bindSearch = (path, navigate) => {
  if (path !== "/search") return;
  const form = document.querySelector(".global-search-form"); const input = document.getElementById("global-search-query");
  form?.addEventListener("submit", (event) => { event.preventDefault(); const query = new FormData(event.currentTarget).get("q"); navigate(`/search?q=${encodeURIComponent(String(query || "").trim())}`); });
  input?.addEventListener("search", () => { if (!input.value) navigate("/search"); });
};
