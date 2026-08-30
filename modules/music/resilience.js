import { data, storage } from "./data.js";

export const backupFormat = "how-i-hear-music-backup";
export const backupVersion = 2;
export const schemaKey = "how-i-hear-music:schema-version";
export const recoveryKey = "how-i-hear-music:recovery:v1";
export const backupReminderKey = "how-i-hear-music:backup-reminder:v1";

const fixedKeys = [
  data.library.storageKey, data.library.libraryStorageKey, data.library.ignoredStorageKey, data.library.albumStorageKey,
  "how-i-hear-music:rating-sessions:v2", "how-i-hear-music:journal:v1", "how-i-hear-music:recording-versions:v1",
  "how-i-hear-music:sonic-descriptors:v1", "how-i-hear-music:taste-groups:v1", "how-i-hear-music:memory-entries:v1",
  "how-i-hear-music:personal-awards:v1", "how-i-hear-music:rediscovery-skips:v1", "how-i-hear-music:cover-overrides:v1",
  "how-i-hear-music:playlist-snapshots:v1", "how-i-hear-music:metadata-overrides:v1",
];
export const backupKeys = () => [...new Set([...fixedKeys, ...Object.keys(localStorage).filter((key) => key.startsWith("how-i-hear-music:album-draft:"))])];
const identity = (item) => item?.id || `${item?.title || ""}::${item?.artist || ""}::${item?.at || ""}` || JSON.stringify(item);
const mergeArrays = (current, incoming) => { const result = [...current]; const seen = new Set(current.map(identity)); incoming.forEach((item) => { const id = identity(item); if (!seen.has(id)) { seen.add(id); result.push(item); } }); return result; };

export const exportBackup = () => ({ format: backupFormat, version: backupVersion, schemaVersion: 1, exportedAt: new Date().toISOString(), data: Object.fromEntries(backupKeys().map((key) => [key, storage.get(key, null)]).filter(([, value]) => value !== null)) });
export const restoreBackup = (payload) => {
  if (!payload || payload.format !== backupFormat || ![1, 2].includes(payload.version) || !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) throw new Error("This is not a supported How I Hear Music backup.");
  const allowed = new Set(fixedKeys); let restored = 0;
  Object.entries(payload.data).forEach(([key, value]) => {
    if (!allowed.has(key) && !key.startsWith("how-i-hear-music:album-draft:")) return;
    const current = storage.get(key, Array.isArray(value) ? [] : {});
    if (Array.isArray(value)) { storage.set(key, mergeArrays(Array.isArray(current) ? current : [], value)); restored += 1; return; }
    if (value && typeof value === "object") { storage.set(key, { ...(current && typeof current === "object" ? current : {}), ...value }); restored += 1; return; }
    if (key.startsWith("how-i-hear-music:album-draft:") && Number.isFinite(value)) { storage.set(key, value); restored += 1; }
  });
  if (!restored) throw new Error("The backup contains no compatible local records.");
  storage.set(backupReminderKey, { lastBackupAt: new Date().toISOString() });
  return restored;
};

export const recoverySnapshots = () => storage.get(recoveryKey, []);
export const restoreRecoverySnapshot = (index) => {
  const snapshot = recoverySnapshots()[Number(index)]; if (!snapshot?.key) throw new Error("That recovery snapshot is no longer available.");
  if (snapshot.value === null) storage.remove(snapshot.key, { recover: false }); else storage.set(snapshot.key, snapshot.value, { recover: false });
  return snapshot;
};
export const dataHealth = () => {
  const bytes = Object.keys(localStorage).reduce((sum, key) => sum + key.length + String(localStorage.getItem(key) || "").length, 0) * 2;
  const reminder = storage.get(backupReminderKey, {}); const last = reminder.lastBackupAt ? new Date(reminder.lastBackupAt) : null; const days = last && Number.isFinite(last.valueOf()) ? Math.floor((Date.now() - last) / 86400000) : null;
  return { bytes, kilobytes: Math.round(bytes / 1024), groups: backupKeys().filter((key) => localStorage.getItem(key) !== null).length, recoveryCount: recoverySnapshots().length, lastBackupAt: last, backupDue: days === null || days >= 30 };
};
export const markBackupCreated = () => storage.set(backupReminderKey, { lastBackupAt: new Date().toISOString() }, { recover: false });

export const migrateLocalData = () => {
  const version = Number(localStorage.getItem(schemaKey) || 0); if (version >= 1) return { from: version, to: version, changed: 0 };
  const journalKey = "how-i-hear-music:journal:v1"; const journal = storage.get(journalKey, []); let changed = 0;
  const migrated = journal.map((entry, index) => { if (entry.id) return entry; changed += 1; return { ...entry, id: `journal_${String(entry.at || Date.now()).replace(/\D/g, "").slice(0, 17)}_${index}` }; });
  if (changed) storage.set(journalKey, migrated);
  localStorage.setItem(schemaKey, "1");
  return { from: version, to: 1, changed };
};
