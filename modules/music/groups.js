import { storage } from "./data.js";

export const tasteGroupStorageKey = "how-i-hear-music:taste-groups:v1";
export const readTasteGroups = () => storage.get(tasteGroupStorageKey, []);
export const addTasteGroup = ({ name, description, memberType, memberIds }) => {
  name = String(name || "").trim(); description = String(description || "").trim(); memberType = memberType === "track" ? "track" : "artist"; memberIds = [...new Set((memberIds || []).filter(Boolean))];
  if (!name || !memberIds.length) throw new Error("Name the group and select at least one member.");
  const group = { id: `taste_group_${Date.now().toString(36)}`, name, description, memberType, memberIds, createdAt: new Date().toISOString() };
  if (!storage.set(tasteGroupStorageKey, [...readTasteGroups(), group])) throw new Error("Local storage is unavailable.");
  return group;
};
export const removeTasteGroup = (id) => storage.set(tasteGroupStorageKey, readTasteGroups().filter((group) => group.id !== id));
