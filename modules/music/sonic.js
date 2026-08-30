import { storage } from "./data.js";

export const sonicStorageKey = "how-i-hear-music:sonic-descriptors:v1";
export const sonicDimensions = {
  warmCold: { label: "WARM / COLD", low: "WARM", high: "COLD" },
  denseSparse: { label: "DENSE / SPARSE", low: "DENSE", high: "SPARSE" },
  directAbstract: { label: "DIRECT / ABSTRACT", low: "DIRECT", high: "ABSTRACT" },
  controlledLoose: { label: "CONTROLLED / LOOSE", low: "CONTROLLED", high: "LOOSE" },
};
export const clampSonic = (value) => Math.max(-1, Math.min(1, Math.round(Number(value) * 10) / 10));
export const readSonic = () => storage.get(sonicStorageKey, {});
export const sonicFor = (id) => readSonic()[id] || null;
export const saveSonic = (id, values) => {
  const normalized = Object.fromEntries(Object.keys(sonicDimensions).map((key) => [key, clampSonic(values[key] ?? 0)]));
  return storage.set(sonicStorageKey, { ...readSonic(), [id]: { ...normalized, updatedAt: new Date().toISOString() } });
};
