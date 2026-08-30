import { storage } from "./data.js";
import { normalizeInsightTags } from "./insights.js";

export const journalStorageKey = "how-i-hear-music:journal:v1";
export const readJournal = () => storage.get(journalStorageKey, []);
export const journalEntry = (id) => readJournal().find((entry) => entry.id === id) || null;
const clean = (value, maximum = 600) => String(value || "").trim().slice(0, maximum);
const score = (value) => { if (value === "" || value === null || value === undefined) return null; const number = Number(value); if (!Number.isFinite(number) || number < 0 || number > 11) throw new Error("Scores must stay between 0 and 11."); return Math.round(number * 10) / 10; };

export const updateJournalEntry = (id, changes = {}) => {
  const entries = readJournal(); const index = entries.findIndex((entry) => entry.id === id); if (index < 0) throw new Error("That Journal entry no longer exists."); const current = entries[index];
  const next = { ...current, title: clean(changes.title, 120) || current.title, artist: clean(changes.artist, 120), note: clean(changes.note), revisedAt: new Date().toISOString(), revisionCount: Number(current.revisionCount || 0) + 1 };
  const timestamp = clean(changes.momentTimestamp, 5); const momentNote = clean(changes.momentNote, 160);
  if ((timestamp || momentNote) && (!/^\d{1,2}:[0-5]\d$/.test(timestamp) || !momentNote)) throw new Error("A musical moment needs both an M:SS timestamp and an observation.");
  next.moment = timestamp && momentNote ? { timestamp, note: momentNote } : null;
  if (current.type === "rating" && Array.isArray(changes.reasons)) { next.insightTags = normalizeInsightTags(changes.reasons); next.reasons = next.insightTags; }
  if (current.type === "album") next.overall = score(changes.overall);
  if (current.type === "rating") next.scores = { ...current.scores, song: score(changes.song), vocal: score(changes.vocal), production: score(changes.production), overall: score(changes.overall) };
  entries[index] = next; if (!storage.set(journalStorageKey, entries)) throw new Error("Local storage is unavailable."); return next;
};

export const removeJournalEntry = (id) => storage.set(journalStorageKey, readJournal().filter((entry) => entry.id !== id));
