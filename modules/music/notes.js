import { accountSignedIn, storage } from "./data.js?v=0.9.109";

export const albumNotesKey = "how-i-hear-music:album-notes:v1";
export const albumNote = (albumId) => accountSignedIn() ? storage.get(albumNotesKey, {})[albumId] || null : null;
export const saveAlbumNote = (albumId, note) => {
  const notes = { ...storage.get(albumNotesKey, {}) }; const value = String(note || "").trim().slice(0, 2000);
  if (value) notes[albumId] = { note: value, revisedAt: new Date().toISOString() }; else delete notes[albumId];
  if (!storage.set(albumNotesKey, notes)) throw new Error("Local storage is unavailable."); return notes[albumId] || null;
};
