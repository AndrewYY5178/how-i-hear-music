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
export const rating = (value) => value === null || value === undefined ? "—" : Number(value).toFixed(Number.isInteger(Number(value)) ? 0 : 1);
export const canonical = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
export const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
};
export const importedAlbums = () => storage.get(data.library.albumStorageKey, []);
export const allAlbums = () => {
  const local = importedAlbums(); const used = new Set();
  const canonicalAlbums = data.profile.albumArchive.map((album) => { const id = slug(album.artist + "-" + album.title); const supplement = local.find((item) => item.id === id); if (supplement) used.add(supplement.id); return supplement ? { ...album, ...supplement, coverUrl: supplement.coverUrl || album.coverUrl || null, coverSource: supplement.coverSource || album.coverSource || null } : album; });
  return [...canonicalAlbums, ...local.filter((album) => !used.has(album.id))];
};
export const allTracks = () => {
  const result = [...data.songs.entries]; const ids = new Set(result.map(trackId));
  importedAlbums().flatMap((album) => album.tracks || []).forEach((track) => { if (!ids.has(track.id)) { ids.add(track.id); result.push(track); } });
  return result;
};
export const allArtists = () => {
  const result = [...data.artists.featured, ...data.artists.uncertain]; const ids = new Set(result.map((artist) => artist.id));
  importedAlbums().forEach((album) => { if (album.artistRecord?.id && !ids.has(album.artistRecord.id)) { ids.add(album.artistRecord.id); result.push(album.artistRecord); } });
  return result;
};
export const findTrack = (id) => allTracks().find((track) => trackId(track) === id || legacyTrackId(track) === id) || null;
export const findArtist = (id) => allArtists().find((artist) => artist.id === id) || null;
export const findAlbum = (id) => allAlbums().find((album) => (album.id || slug(album.artist + "-" + album.title)) === id || slug(album.artist + "-" + album.title) === id) || null;
