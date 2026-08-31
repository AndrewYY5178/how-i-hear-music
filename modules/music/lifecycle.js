import { data, storage } from "./data.js";

export const ratingStorageKey = "how-i-hear-music:rating-sessions:v2";
export const lifecycleStates = ["imported", "heard", "rated", "archived"];

const inboxKey = data.library.storageKey;
const libraryKey = data.library.libraryStorageKey;
const read = (key) => storage.get(key, []);
export const readRatings = () => storage.get(ratingStorageKey, {});
export const validScore = (value, { nullable = false } = {}) => {
  if (value === null || value === undefined || value === "") { if (nullable) return null; throw new Error("Every score must be confirmed before saving."); }
  const number = Number(value); if (!Number.isFinite(number) || number < 0 || number > 11) throw new Error("Scores must stay between 0 and 11.");
  return Math.round(number * 10) / 10;
};
export const saveRatingRecord = (id, value) => {
  if (!id) throw new Error("A confirmed Track ID is required before saving a rating.");
  const scores = Object.fromEntries(["song", "vocal", "production", "overall"].map((field) => [field, validScore(value.scores?.[field])]));
  const next = { ...readRatings(), [id]: { ...value, scores } }; if (!storage.set(ratingStorageKey, next)) throw new Error("Local storage is unavailable."); updateLifecycle(id, "rated"); archiveTrack(id); return next[id];
};
export const saveAlbumTrackRatings = ({ album, tracks, at = new Date().toISOString() }) => {
  if (!album?.title || !Array.isArray(tracks) || !tracks.length) throw new Error("A confirmed album and ordered Track list are required."); const seen = new Set(); const confirmed = tracks.map((track) => { if (!track.trackId || seen.has(track.trackId)) throw new Error("Every album row needs one unique confirmed Track ID."); seen.add(track.trackId); return { ...track, overall: validScore(track.overall) }; });
  const previousRatings = structuredClone(readRatings()); const next = { ...previousRatings }; confirmed.forEach((track) => { const current = next[track.trackId] || {}; next[track.trackId] = { ...current, title: track.title, artist: track.artist || album.artist, source: current.source || "album", updatedAt: at, scores: { ...(current.scores || {}), overall: track.overall } }; });
  if (!storage.set(ratingStorageKey, next)) throw new Error("Local storage is unavailable."); confirmed.forEach((track) => { updateLifecycle(track.trackId, "rated"); archiveTrack(track.trackId); }); return { confirmed, previousRatings };
};

export const lifecycleState = (track, location = "inbox", ratings = readRatings()) => {
  if (track.lifecycleState === "archived" || location === "library" || track.state === "kept") return "archived";
  if (track.lifecycleState === "rated" || ratings[track.id]) return "rated";
  if (track.lifecycleState === "heard") return "heard";
  return "imported";
};

export const lifecycleTracks = () => {
  const ratings = readRatings();
  return [
    ...read(inboxKey).map((track) => ({ ...track, lifecycleState: lifecycleState(track, "inbox", ratings), lifecycleLocation: "inbox" })),
    ...read(libraryKey).map((track) => ({ ...track, lifecycleState: lifecycleState(track, "library", ratings), lifecycleLocation: "library" })),
  ];
};

export const updateLifecycle = (id, next) => {
  if (!lifecycleStates.includes(next)) return false;
  const now = new Date().toISOString();
  const timestamp = `${next}At`;
  let changed = false;
  [inboxKey, libraryKey].forEach((key) => {
    const records = read(key);
    if (!records.some((track) => track.id === id)) return;
    storage.set(key, records.map((track) => track.id === id ? { ...track, lifecycleState: next, [timestamp]: now } : track));
    changed = true;
  });
  return changed;
};

export const archiveTrack = (id) => {
  const inbox = read(inboxKey);
  const track = inbox.find((item) => item.id === id);
  if (!track) return updateLifecycle(id, "archived");
  const archived = { ...track, lifecycleState: "archived", archivedAt: new Date().toISOString() };
  storage.set(inboxKey, inbox.filter((item) => item.id !== id));
  const library = read(libraryKey);
  storage.set(libraryKey, [...library.filter((item) => item.id !== id), archived]);
  return true;
};
