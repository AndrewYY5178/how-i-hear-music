import { allTracks, storage, trackId } from "./data.js";

export const metadataOverrideKey = "how-i-hear-music:metadata-overrides:v1";
export const metadataFields = ["album", "releaseDate", "language", "region"];
const clean = (value) => String(value || "").trim();

export const metadataCoverage = (tracks = allTracks()) => {
  const fields = Object.fromEntries(metadataFields.map((field) => [field, tracks.filter((track) => clean(track[field])).length]));
  const complete = tracks.filter((track) => metadataFields.every((field) => clean(track[field]))).length;
  return { total: tracks.length, complete, fields };
};

export const saveMetadataOverride = (id, values) => {
  const releaseDate = clean(values.releaseDate);
  if (releaseDate && !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(releaseDate)) throw new Error("Release date must be YYYY, YYYY-MM or YYYY-MM-DD.");
  const sourceUrl = clean(values.sourceUrl); if (sourceUrl) { let parsed; try { parsed = new URL(sourceUrl); } catch { throw new Error("Source URL must be a complete HTTPS address."); } if (parsed.protocol !== "https:") throw new Error("Source URL must use HTTPS."); }
  const overrides = { ...storage.get(metadataOverrideKey, {}) };
  const next = Object.fromEntries(metadataFields.map((field) => [field, clean(values[field])]).filter(([, value]) => value));
  if (clean(values.sourceNote)) next.sourceNote = clean(values.sourceNote);
  if (sourceUrl) next.sourceUrl = sourceUrl;
  if (Object.keys(next).length) overrides[id] = { ...next, metadataConfirmedAt: new Date().toISOString() }; else delete overrides[id];
  if (!storage.set(metadataOverrideKey, overrides)) throw new Error("Local storage is unavailable.");
  return overrides[id] || null;
};

export const metadataOverrideFor = (id) => storage.get(metadataOverrideKey, {})[id] || {};
export const metadataRows = () => allTracks().map((track) => ({ track, id: trackId(track), missing: metadataFields.filter((field) => !clean(track[field])) }));
