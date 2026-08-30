import { allTracks, storage, trackId } from "./data.js";
import { currentEvidence, ratingChanges } from "./analysis.js";
import { versionsForTrack } from "./versions.js";

export const memoryStorageKey = "how-i-hear-music:memory-entries:v1";
export const memoryZones = [
  ["first-discoveries", "FIRST DISCOVERIES"], ["growers", "GROWERS"], ["perfect-moments", "PERFECT MOMENTS"],
  ["personal-canon", "PERSONAL CANON"], ["reinterpretations", "REINTERPRETATIONS"], ["turning-points", "TURNING POINTS"],
];
export const readMemoryEntries = () => storage.get(memoryStorageKey, []);
export const addMemoryEntry = ({ entityType, entityId, zone, note, date, importance }) => {
  const allowedTypes = ["track", "album", "artist", "version"]; entityType = allowedTypes.includes(entityType) ? entityType : "track"; entityId = String(entityId || ""); zone = memoryZones.some(([id]) => id === zone) ? zone : "personal-canon";
  if (!entityId) throw new Error("Choose a record for this memory.");
  const entry = { id: `memory_${Date.now().toString(36)}`, entityType, entityId, zone, note: String(note || "").trim(), date: date || null, importance: Math.max(1, Math.min(5, Number(importance) || 3)), source: "manual", createdAt: new Date().toISOString() };
  if (!storage.set(memoryStorageKey, [...readMemoryEntries(), entry])) throw new Error("Local storage is unavailable."); return entry;
};
export const removeMemoryEntry = (id) => storage.set(memoryStorageKey, readMemoryEntries().filter((entry) => entry.id !== id));

export const derivedMemoryEntries = ({ evidence = currentEvidence(), changes = ratingChanges(), tracks = allTracks() } = {}) => {
  const result = []; const known = new Map(tracks.map((track) => [trackId(track), track]));
  changes.filter((item) => item.delta >= 1).forEach((item) => result.push({ id: `derived-grower-${item.entry.trackId}`, entityType: "track", entityId: item.entry.trackId, zone: "growers", note: `Overall moved +${item.delta.toFixed(1)} across ${item.count} saved ratings.`, date: item.entry.at, importance: 3, source: "derived" }));
  evidence.filter((record) => record.moment?.timestamp && record.moment?.note).forEach((record) => result.push({ id: `derived-moment-${trackId(record)}`, entityType: "track", entityId: trackId(record), zone: "perfect-moments", note: `${record.moment.timestamp} — ${record.moment.note}`, date: null, importance: 3, source: "derived" }));
  const roots = new Set(); tracks.forEach((track) => { const versions = versionsForTrack(track, tracks); const root = track.baseTrackId || trackId(track); if (versions.length > 1 && !roots.has(root)) { roots.add(root); result.push({ id: `derived-version-${root}`, entityType: "track", entityId: root, zone: "reinterpretations", note: `${versions.length} confirmed recordings share this composition.`, date: null, importance: 3, source: "derived" }); } });
  const journal = storage.get("how-i-hear-music:journal:v1", []); const discoveries = new Set(); journal.filter((entry) => entry.type === "rating" && entry.trackId && entry.source && entry.source !== "archive").forEach((entry) => { if (discoveries.has(entry.trackId) || !known.has(entry.trackId)) return; discoveries.add(entry.trackId); result.push({ id: `derived-discovery-${entry.trackId}`, entityType: "track", entityId: entry.trackId, zone: "first-discoveries", note: "First entered through an external import, then received a saved rating.", date: entry.at, importance: 2, source: "derived" }); });
  return result;
};

export const allMemoryEntries = () => {
  const manual = readMemoryEntries(); const manualKeys = new Set(manual.map((entry) => `${entry.entityType}:${entry.entityId}:${entry.zone}`)); return [...manual, ...derivedMemoryEntries().filter((entry) => !manualKeys.has(`${entry.entityType}:${entry.entityId}:${entry.zone}`))];
};
