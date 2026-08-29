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
export const findTrack = (id) => data.songs.entries.find((track) => trackId(track) === id || legacyTrackId(track) === id) || null;
export const findArtist = (id) => data.artists.featured.find((artist) => artist.id === id) || data.artists.uncertain.find((artist) => artist.id === id) || null;
export const findAlbum = (id) => data.profile.albumArchive.find((album) => slug(album.artist + "-" + album.title) === id) || null;
export const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* local-only enhancement */ } },
};
