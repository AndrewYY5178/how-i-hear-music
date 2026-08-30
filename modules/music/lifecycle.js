import { data, storage } from "./data.js";

export const ratingStorageKey = "how-i-hear-music:rating-sessions:v2";
export const lifecycleStates = ["imported", "heard", "rated", "archived"];

const inboxKey = data.library.storageKey;
const libraryKey = data.library.libraryStorageKey;
const read = (key) => storage.get(key, []);
export const readRatings = () => storage.get(ratingStorageKey, {});

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
