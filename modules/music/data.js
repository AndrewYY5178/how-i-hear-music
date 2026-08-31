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
export const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; } },
  set(key, value, { recover = true } = {}) { try { const next = JSON.stringify(value); const prior = localStorage.getItem(key); if (recover && key.startsWith("how-i-hear-music:") && key !== "how-i-hear-music:recovery:v1" && prior !== next) { const recoveryKey = "how-i-hear-music:recovery:v1"; let snapshots = []; try { snapshots = JSON.parse(localStorage.getItem(recoveryKey) || "[]"); } catch {} const parsed = prior === null ? null : (() => { try { return JSON.parse(prior); } catch { return prior; } })(); localStorage.setItem(recoveryKey, JSON.stringify([{ key, value: parsed, at: new Date().toISOString() }, ...snapshots].slice(0, 20))); } localStorage.setItem(key, next); return true; } catch { return false; } },
  remove(key, { recover = true } = {}) { try { const prior = localStorage.getItem(key); if (recover && prior !== null && key.startsWith("how-i-hear-music:") && key !== "how-i-hear-music:recovery:v1") { const recoveryKey = "how-i-hear-music:recovery:v1"; let snapshots = []; try { snapshots = JSON.parse(localStorage.getItem(recoveryKey) || "[]"); } catch {} let value = prior; try { value = JSON.parse(prior); } catch {} localStorage.setItem(recoveryKey, JSON.stringify([{ key, value, at: new Date().toISOString() }, ...snapshots].slice(0, 20))); } localStorage.removeItem(key); return true; } catch { return false; } },
};
export const importedAlbums = () => storage.get(data.library.albumStorageKey, []);
export const localVersions = () => storage.get("how-i-hear-music:recording-versions:v1", []);
export const allAlbums = () => {
  const local = importedAlbums(); const used = new Set();
  const canonicalAlbums = data.profile.albumArchive.map((album) => { const id = slug(album.artist + "-" + album.title); const supplement = local.find((item) => item.id === id); if (supplement) used.add(supplement.id); return supplement ? { ...album, ...supplement, coverUrl: supplement.coverUrl || album.coverUrl || null, coverSource: supplement.coverSource || album.coverSource || null } : album; });
  return [...canonicalAlbums, ...local.filter((album) => !used.has(album.id))];
};
export const baseTracks = () => {
  const result = [...data.songs.entries]; const ids = new Set(result.map(trackId));
  storage.get(data.library.libraryStorageKey, []).forEach((track) => { if (!ids.has(trackId(track))) { ids.add(trackId(track)); result.push(track); } });
  importedAlbums().flatMap((album) => album.tracks || []).forEach((track) => { if (!ids.has(track.id)) { ids.add(track.id); result.push(track); } });
  localVersions().forEach((track) => { if (!ids.has(track.id)) { ids.add(track.id); result.push(track); } });
  return result;
};
export const allTracks = () => {
  const result = baseTracks();
  const overrides = storage.get("how-i-hear-music:metadata-overrides:v1", {});
  return result.map((track) => { const override = overrides[trackId(track)] || {}; const fieldValues = override.fields ? Object.fromEntries(Object.entries(override.fields).filter(([, evidence]) => evidence?.value).map(([field, evidence]) => [field, evidence.value])) : {}; return { ...track, ...Object.fromEntries(Object.entries(override).filter(([field]) => ["album", "releaseDate", "language", "region"].includes(field))), ...fieldValues }; });
};
export const allArtists = () => {
  const result = [...data.artists.featured, ...data.artists.uncertain]; const ids = new Set(result.map((artist) => artist.id));
  importedAlbums().forEach((album) => { if (album.artistRecord?.id && !ids.has(album.artistRecord.id)) { ids.add(album.artistRecord.id); result.push(album.artistRecord); } });
  return result;
};
export const findTrack = (id) => allTracks().find((track) => trackId(track) === id || legacyTrackId(track) === id) || null;
export const findBaseTrack = (id) => baseTracks().find((track) => trackId(track) === id || legacyTrackId(track) === id) || null;
export const findArtist = (id) => allArtists().find((artist) => artist.id === id) || null;
export const findAlbum = (id) => allAlbums().find((album) => (album.id || slug(album.artist + "-" + album.title)) === id || slug(album.artist + "-" + album.title) === id) || null;
