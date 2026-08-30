import { storage } from "./data.js";

export const albumNotesKey = "how-i-hear-music:album-notes:v1";
export const albumNote = (albumId) => storage.get(albumNotesKey, {})[albumId] || null;
export const saveAlbumNote = (albumId, note) => {
  const notes = { ...storage.get(albumNotesKey, {}) }; const value = String(note || "").trim().slice(0, 2000);
  if (value) notes[albumId] = { note: value, revisedAt: new Date().toISOString() }; else delete notes[albumId];
  if (!storage.set(albumNotesKey, notes)) throw new Error("Local storage is unavailable."); return notes[albumId] || null;
};
