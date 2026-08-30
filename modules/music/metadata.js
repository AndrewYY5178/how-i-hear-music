import { allTracks, findBaseTrack, storage, trackId } from "./data.js";

export const metadataOverrideKey = "how-i-hear-music:metadata-overrides:v1";
export const metadataFields = ["album", "releaseDate", "language", "region"];
const clean = (value) => String(value || "").trim();

export const metadataCoverage = (tracks = allTracks()) => {
  const fields = Object.fromEntries(metadataFields.map((field) => [field, tracks.filter((track) => clean(track[field])).length]));
  const complete = tracks.filter((track) => metadataFields.every((field) => clean(track[field]))).length;
  return { total: tracks.length, complete, fields };
};

export const saveMetadataOverride = (id, values) => {
  const base = findBaseTrack(id); if (!base) throw new Error("That Track no longer exists."); const now = new Date().toISOString(); const fields = {};
  metadataFields.forEach((field) => {
    const value = clean(values[field]); if (field === "releaseDate" && value && !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value)) throw new Error("Release date must be YYYY, YYYY-MM or YYYY-MM-DD.");
    const sourceUrl = clean(values[`${field}SourceUrl`]); if (sourceUrl) { let parsed; try { parsed = new URL(sourceUrl); } catch { throw new Error(`${field} source must be a complete HTTPS address.`); } if (parsed.protocol !== "https:") throw new Error(`${field} source must use HTTPS.`); }
    const sourceNote = clean(values[`${field}SourceNote`]); const changed = value && value !== clean(base[field]); if (changed || sourceUrl || sourceNote) fields[field] = { ...(changed ? { value } : {}), ...(sourceUrl ? { sourceUrl } : {}), ...(sourceNote ? { sourceNote } : {}), confirmedAt: now };
  });
  const overrides = { ...storage.get(metadataOverrideKey, {}) }; const next = Object.keys(fields).length ? { fields, metadataConfirmedAt: now } : null;
  if (next) overrides[id] = next; else delete overrides[id];
  if (!storage.set(metadataOverrideKey, overrides)) throw new Error("Local storage is unavailable.");
  return overrides[id] || null;
};

export const metadataOverrideFor = (id) => { const record = storage.get(metadataOverrideKey, {})[id] || {}; if (record.fields) return record; const fields = Object.fromEntries(metadataFields.filter((field) => clean(record[field])).map((field) => [field, { value: clean(record[field]), sourceUrl: clean(record.sourceUrl), sourceNote: clean(record.sourceNote), confirmedAt: record.metadataConfirmedAt }])); return { ...record, fields }; };
export const metadataRows = () => allTracks().map((track) => ({ track, id: trackId(track), missing: metadataFields.filter((field) => !clean(track[field])) }));
