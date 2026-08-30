import { canonical, data, storage, trackId } from "./data.js";

export const versionStorageKey = "how-i-hear-music:recording-versions:v1";
export const versionTypes = ["STUDIO", "LIVE", "ACOUSTIC", "REARRANGED", "DEMO", "REMIX", "REMASTERED", "OTHER"];

export const localVersions = () => storage.get(versionStorageKey, []);

export const baseTrackId = (track) => track?.baseTrackId || trackId(track);

export const versionsForTrack = (track, tracks = data.songs.entries) => {
  if (!track) return [];
  const rootId = baseTrackId(track);
  const root = tracks.find((item) => trackId(item) === rootId) || track;
  const compositionId = root.compositionId || track.compositionId || null;
  const relatedCanonical = compositionId ? tracks.filter((item) => item.compositionId === compositionId) : [root];
  const relatedLocal = localVersions().filter((item) => item.baseTrackId === rootId);
  const seen = new Set();
  return [...relatedCanonical, ...relatedLocal].filter((item) => {
    const id = trackId(item); if (seen.has(id)) return false; seen.add(id); return true;
  });
};

export const createVersion = (track, input) => {
  const type = String(input.versionType || "").toUpperCase();
  const label = String(input.label || "").trim();
  if (!track || !versionTypes.includes(type)) throw new Error("Choose a confirmed version type.");
  if (!label) throw new Error("Name this recording so it can stay distinct.");
  const rootId = baseTrackId(track);
  const key = canonical(`${rootId}-${type}-${label}`);
  const existing = localVersions();
  if (existing.some((item) => canonical(`${item.baseTrackId}-${item.versionType}-${item.versionLabel}`) === key)) throw new Error("This version is already recorded.");
  const version = {
    id: `version_${Date.now().toString(36)}_${key.slice(-10)}`,
    baseTrackId: rootId,
    compositionId: track.compositionId || `composition_local_${canonical(rootId)}`,
    recordingId: `recording_${Date.now().toString(36)}_${key.slice(-8)}`,
    versionType: type.toLowerCase(),
    versionLabel: label,
    artistId: track.artistId || null,
    artist: track.artist,
    title: track.title,
    album: track.album || null,
    scores: null,
    confirmedByOwner: true,
    createdAt: new Date().toISOString(),
  };
  if (!storage.set(versionStorageKey, [...existing, version])) throw new Error("Local storage is unavailable.");
  return version;
};
