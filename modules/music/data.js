const fetchData = async (path) => {
  const response = await fetch(new URL(path, import.meta.url));
  if (!response.ok) throw new Error("Could not load " + path);
  return response.json();
};

export const data = await Promise.all([
  fetchData("../../data/music-profile.json"),
  fetchData("../../data/artists.json"),
  fetchData("../../data/songs.json"),
  fetchData("../../data/library.json"),
  fetchData("../../data/catalog.json"),
]).then(([profile, artists, songs, library, catalog]) => ({ profile, artists, songs, library, catalog }));

export const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
export const slug = (value) => String(value).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
export const legacyTrackId = (track) => slug(track.artistId + "-" + track.title);
export const trackId = (track) => track.id || legacyTrackId(track);
export const rating = (value) => { const numeric = Number(value); return value === null || value === undefined || value === "" || !Number.isFinite(numeric) ? "—" : numeric.toFixed(Number.isInteger(numeric) ? 0 : 1); };
export const canonical = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
const sessionKey = "how-i-hear-music:cloud-sync-session:v1";
export const accountSignedIn = () => { if (typeof window === "undefined" || typeof document === "undefined" || typeof document.createElement !== "function" || typeof localStorage === "undefined") return true; try { return Boolean(JSON.parse(localStorage.getItem(sessionKey) || "null")?.token); } catch { return false; } };
const announceStorageChange = (key) => {
  if (key.startsWith("how-i-hear-music:") && key !== "how-i-hear-music:cloud-sync-session:v1" && key !== "how-i-hear-music:recovery:v1" && typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("how-i-hear-music:local-change", { detail: { key } }));
};
// Guests must never read/write a previous signed-in user's local archive.
const guestStoragePrefix = 'him-guest-storage:';
const physicalKey = key => accountSignedIn() ? key : guestStoragePrefix + key;
export const scopedLocalStorage = {
  getItem: key => localStorage.getItem(physicalKey(key)),
  setItem: (key, value) => localStorage.setItem(physicalKey(key), value),
  removeItem: key => localStorage.removeItem(physicalKey(key)),
};
export const storageKeys = () => Object.keys(localStorage)
  .filter(key => accountSignedIn() ? !key.startsWith(guestStoragePrefix) : key.startsWith(guestStoragePrefix))
  .map(key => accountSignedIn() ? key : key.slice(guestStoragePrefix.length));
export const storage = {
  get(key, fallback) { try { return JSON.parse(scopedLocalStorage.getItem(key) || ""); } catch { return fallback; } },
  set(key, value, { recover = true } = {}) { try { const next = JSON.stringify(value); const prior = scopedLocalStorage.getItem(key); if (recover && key.startsWith("how-i-hear-music:") && key !== "how-i-hear-music:recovery:v1" && prior !== next) { const recoveryKey = "how-i-hear-music:recovery:v1"; let snapshots = []; try { snapshots = JSON.parse(scopedLocalStorage.getItem(recoveryKey) || "[]"); } catch {} const parsed = prior === null ? null : (() => { try { return JSON.parse(prior); } catch { return prior; } })(); scopedLocalStorage.setItem(recoveryKey, JSON.stringify([{ key, value: parsed, at: new Date().toISOString() }, ...snapshots].slice(0, 20))); } scopedLocalStorage.setItem(key, next); if (prior !== next) announceStorageChange(key); return true; } catch { return false; } },
  remove(key, { recover = true } = {}) { try { const prior = scopedLocalStorage.getItem(key); if (recover && prior !== null && key.startsWith("how-i-hear-music:") && key !== "how-i-hear-music:recovery:v1") { const recoveryKey = "how-i-hear-music:recovery:v1"; let snapshots = []; try { snapshots = JSON.parse(scopedLocalStorage.getItem(recoveryKey) || "[]"); } catch {} let value = prior; try { value = JSON.parse(prior); } catch {} scopedLocalStorage.setItem(recoveryKey, JSON.stringify([{ key, value, at: new Date().toISOString() }, ...snapshots].slice(0, 20))); } scopedLocalStorage.removeItem(key); if (prior !== null) announceStorageChange(key); return true; } catch { return false; } },
};
const guestScoreSets = [
  { song: 8.8, vocal: 9.2, production: 8.4, overall: 8.9 }, { song: 9.1, vocal: 8.7, production: 9.3, overall: 9.1 },
  { song: 8.4, vocal: 8.9, production: 8.8, overall: 8.6 }, { song: 9.3, vocal: 9.5, production: 8.9, overall: 9.2 },
  { song: 8.7, vocal: 8.5, production: 9.1, overall: 8.8 }, { song: 9.4, vocal: 9.0, production: 9.2, overall: 9.3 },
  { song: 8.9, vocal: 9.4, production: 8.6, overall: 9.0 }, { song: 9.0, vocal: 8.8, production: 9.4, overall: 9.1 },
  { song: 8.6, vocal: 9.1, production: 9.0, overall: 8.9 }, { song: 9.2, vocal: 8.9, production: 8.7, overall: 9.0 },
];
const guestTrackTitles = ["First Light", "Afterglow", "Soft Focus", "Night Drive", "Open Water", "Neon Signs", "Slow Motion", "Golden Hour", "Last Light", "Blue Room"];
const guestTags = [["melody", "surprise"], ["harmony", "atmosphere"], ["groove", "arrangement"], ["vocal-texture", "melody"], ["lyric", "one-moment"], ["arrangement", "surprise"], ["atmosphere", "harmony"], ["groove", "vocal-texture"], ["melody", "lyric"], ["surprise", "one-moment"]];
const guestCatalog = (() => {
  const sourceAlbums = data.profile.albumArchive.filter((album) => album.showcaseOnly);
  const albums = sourceAlbums.map((album, index) => ({ ...album, id: `demo-album-${String(index + 1).padStart(2, "0")}`, demo: true, overall: [9.1, 8.8, 9.0, 9.2, 8.7, 9.0, 8.9, 9.3, 8.8][index], artistId: `demo-artist-${String(index + 1).padStart(2, "0")}` }));
  const tracks = albums.flatMap((album, albumIndex) => [0, 1, 2].map((offset) => {
    const index = albumIndex * 3 + offset; const score = guestScoreSets[index % guestScoreSets.length];
    return { id: `demo-track-${String(index + 1).padStart(2, "0")}`, demo: true, title: guestTrackTitles[index % guestTrackTitles.length], artist: album.artist, artistId: album.artistId, album: album.title, albumId: album.id, releaseDate: album.releaseDate, scores: score, insightTags: guestTags[index % guestTags.length], songStatus: "IN_THE_LIST", confidence: "DEMO" };
  }));
  return { albums: albums.map((album) => ({ ...album, tracks: tracks.filter((track) => track.albumId === album.id) })), tracks };
})();
const guestArtists = guestCatalog.albums.map((album) => ({ id: album.artistId, name: album.artist, romanized: null, status: "DEMO" }));
export const visibleRatings = () => accountSignedIn() ? storage.get("how-i-hear-music:rating-sessions:v2", {}) : {};
export const visibleJournal = () => accountSignedIn() ? storage.get("how-i-hear-music:journal:v1", []) : [];
export const importedAlbums = () => accountSignedIn() ? storage.get(data.library.albumStorageKey, []) : [];
const albumKey = (album) => album.id || slug(`${album.artist}-${album.title}`);
export const localVersions = () => accountSignedIn() ? storage.get("how-i-hear-music:recording-versions:v1", []) : [];
export const allAlbums = () => {
  if (!accountSignedIn()) return guestCatalog.albums;
  const local = importedAlbums(); const used = new Set();
  const canonicalAlbums = data.profile.albumArchive.map((album) => { const id = slug(album.artist + "-" + album.title); const supplement = local.find((item) => item.id === id); if (supplement) used.add(supplement.id); return supplement ? { ...album, ...supplement, coverUrl: supplement.coverUrl || album.coverUrl || null, coverSource: supplement.coverSource || album.coverSource || null } : album; });
  return [...canonicalAlbums, ...local.filter((album) => !used.has(album.id))];
};
export const archiveVisibleAlbums = () => {
  if (!accountSignedIn()) return guestCatalog.albums;
  const importedKeys = new Set(importedAlbums().map(albumKey));
  return allAlbums().filter((album) => !album.showcaseOnly || importedKeys.has(albumKey(album)));
};
export const baseTracks = () => {
  if (!accountSignedIn()) return guestCatalog.tracks;
  const result = [...data.songs.entries]; const ids = new Set(result.map(trackId));
  storage.get(data.library.libraryStorageKey, []).forEach((track) => { if (!ids.has(trackId(track))) { ids.add(trackId(track)); result.push(track); } });
  importedAlbums().flatMap((album) => album.tracks || []).forEach((track) => { if (!ids.has(track.id)) { ids.add(track.id); result.push(track); } });
  localVersions().forEach((track) => { if (!ids.has(track.id)) { ids.add(track.id); result.push(track); } });
  return result;
};
export const allTracks = () => {
  if (!accountSignedIn()) return guestCatalog.tracks;
  const result = baseTracks();
  const overrides = storage.get("how-i-hear-music:metadata-overrides:v1", {});
  return result.map((track) => { const override = overrides[trackId(track)] || {}; const fieldValues = override.fields ? Object.fromEntries(Object.entries(override.fields).filter(([, evidence]) => evidence?.value).map(([field, evidence]) => [field, evidence.value])) : {}; return { ...track, ...Object.fromEntries(Object.entries(override).filter(([field]) => ["album", "releaseDate", "language", "region"].includes(field))), ...fieldValues }; });
};
export const allArtists = () => {
  if (!accountSignedIn()) return guestArtists;
  const result = [...data.artists.featured, ...data.artists.uncertain]; const ids = new Set(result.map((artist) => artist.id));
  importedAlbums().forEach((album) => { if (album.artistRecord?.id && !ids.has(album.artistRecord.id)) { ids.add(album.artistRecord.id); result.push(album.artistRecord); } });
  return result;
};
export const findTrack = (id) => allTracks().find((track) => trackId(track) === id || legacyTrackId(track) === id) || null;
export const findBaseTrack = (id) => baseTracks().find((track) => trackId(track) === id || legacyTrackId(track) === id) || null;
export const findArtist = (id) => allArtists().find((artist) => artist.id === id) || null;
export const findAlbum = (id) => allAlbums().find((album) => (album.id || slug(album.artist + "-" + album.title)) === id || slug(album.artist + "-" + album.title) === id) || null;
