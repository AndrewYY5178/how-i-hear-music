import { data, storage } from "./data.js";
import { accountNicknamePrefix } from "./account.js";

export const backupFormat = "how-i-hear-music-backup";
export const backupVersion = 2;
export const encryptedBackupFormat = "how-i-hear-music-encrypted-backup";
export const encryptedBackupVersion = 1;
export const schemaKey = "how-i-hear-music:schema-version";
export const recoveryKey = "how-i-hear-music:recovery:v1";
export const backupReminderKey = "how-i-hear-music:backup-reminder:v1";
export const restoreRollbackKey = "how-i-hear-music:restore-rollback:v1";

const fixedKeys = [
  data.library.storageKey, data.library.libraryStorageKey, data.library.ignoredStorageKey, data.library.albumStorageKey,
  "how-i-hear-music:rating-sessions:v2", "how-i-hear-music:journal:v1", "how-i-hear-music:recording-versions:v1",
  "how-i-hear-music:sonic-descriptors:v1", "how-i-hear-music:taste-groups:v1", "how-i-hear-music:memory-entries:v1",
  "how-i-hear-music:personal-awards:v1", "how-i-hear-music:rediscovery-skips:v1", "how-i-hear-music:cover-overrides:v1",
  "how-i-hear-music:playlist-snapshots:v1", "how-i-hear-music:metadata-overrides:v1",
  "how-i-hear-music:album-notes:v1",
];
export const backupKeys = () => [...new Set([...fixedKeys, ...Object.keys(localStorage).filter((key) => key.startsWith("how-i-hear-music:album-draft:") || key.startsWith(accountNicknamePrefix))])];
const identity = (item) => item?.id || `${item?.title || ""}::${item?.artist || ""}::${item?.at || ""}` || JSON.stringify(item);
const mergeArrays = (current, incoming) => { const result = [...current]; const seen = new Set(current.map(identity)); incoming.forEach((item) => { const id = identity(item); if (!seen.has(id)) { seen.add(id); result.push(item); } }); return result; };
const compatibleEntries = (payload) => { const allowed = new Set(fixedKeys); return Object.entries(payload?.data || {}).filter(([key]) => allowed.has(key) || key.startsWith("how-i-hear-music:album-draft:") || key.startsWith(accountNicknamePrefix)); };

export const exportBackup = () => ({ format: backupFormat, version: backupVersion, schemaVersion: 1, exportedAt: new Date().toISOString(), data: Object.fromEntries(backupKeys().map((key) => [key, storage.get(key, null)]).filter(([, value]) => value !== null)) });
const bytesToBase64 = (bytes) => { let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); };
const base64ToBytes = (value) => Uint8Array.from(atob(String(value || "")), (character) => character.charCodeAt(0));
const encryptionKey = async (password, salt, usage) => {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 250000 }, material, { name: "AES-GCM", length: 256 }, false, [usage]);
};
export const exportEncryptedBackup = async (password) => {
  if (!globalThis.crypto?.subtle) throw new Error("Encrypted backup requires a secure modern browser context.");
  if (String(password || "").length < 10) throw new Error("Use a backup password with at least 10 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12)); const key = await encryptionKey(password, salt, "encrypt");
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(exportBackup())));
  return { format: encryptedBackupFormat, version: encryptedBackupVersion, algorithm: "AES-GCM", derivation: "PBKDF2-SHA256", iterations: 250000, exportedAt: new Date().toISOString(), salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) };
};
export const decryptBackup = async (payload, password) => {
  if (!globalThis.crypto?.subtle) throw new Error("Encrypted backup requires a secure modern browser context.");
  if (!payload || payload.format !== encryptedBackupFormat || payload.version !== encryptedBackupVersion) throw new Error("This is not a supported encrypted backup.");
  if (!password) throw new Error("Enter the password used to encrypt this backup.");
  try {
    const salt = base64ToBytes(payload.salt); const iv = base64ToBytes(payload.iv); const key = await encryptionKey(password, salt, "decrypt");
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, base64ToBytes(payload.ciphertext));
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch { throw new Error("The encrypted backup could not be opened. Check the password and file integrity."); }
};
export const previewRestore = (payload) => {
  if (!payload || payload.format !== backupFormat || ![1, 2].includes(payload.version) || !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) throw new Error("This is not a supported How I Hear Music backup.");
  const entries = compatibleEntries(payload); const conflicts = entries.filter(([key, value]) => { const current = storage.get(key, null); return current !== null && JSON.stringify(current) !== JSON.stringify(value); });
  return { groups: entries.length, conflicts: conflicts.length, additions: entries.length - conflicts.length, keys: entries.map(([key]) => key) };
};
export const restoreBackup = (payload, { conflictPolicy = "backup", createRollback = true } = {}) => {
  previewRestore(payload); if (!["backup", "local"].includes(conflictPolicy)) throw new Error("Choose whether backup or local values win conflicts."); const entries = compatibleEntries(payload); let restored = 0;
  if (createRollback) localStorage.setItem(restoreRollbackKey, JSON.stringify({ at: new Date().toISOString(), values: Object.fromEntries([...entries.map(([key]) => [key, localStorage.getItem(key)]), [backupReminderKey, localStorage.getItem(backupReminderKey)], [recoveryKey, localStorage.getItem(recoveryKey)]]) }));
  try { entries.forEach(([key, value]) => {
    const current = storage.get(key, Array.isArray(value) ? [] : {}); let next = null;
    if (Array.isArray(value)) { const local = Array.isArray(current) ? current : []; next = conflictPolicy === "backup" ? mergeArrays(value, local) : mergeArrays(local, value); }
    else if (value && typeof value === "object") { const local = current && typeof current === "object" ? current : {}; next = conflictPolicy === "backup" ? { ...local, ...value } : { ...value, ...local }; }
    else if (key.startsWith(accountNicknamePrefix) && typeof value === "string") next = conflictPolicy === "local" && typeof current === "string" && current ? current : value;
    else if (key.startsWith("how-i-hear-music:album-draft:") && Number.isFinite(value)) next = value;
    if (next !== null) { if (!storage.set(key, next)) throw new Error("Browser storage rejected part of the restore."); restored += 1; }
  }); } catch (error) { if (createRollback) restoreLastRollback(); throw error; }
  if (!restored) throw new Error("The backup contains no compatible local records.");
  storage.set(backupReminderKey, { lastBackupAt: new Date().toISOString() });
  return restored;
};
export const restoreLastRollback = () => {
  let snapshot; try { snapshot = JSON.parse(localStorage.getItem(restoreRollbackKey) || "null"); } catch {} if (!snapshot?.values) throw new Error("No complete restore rollback is available.");
  Object.entries(snapshot.values).forEach(([key, raw]) => { if (raw === null) localStorage.removeItem(key); else localStorage.setItem(key, raw); }); localStorage.removeItem(restoreRollbackKey); return Object.keys(snapshot.values).length;
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
export const storageEstimate = async () => {
  if (!navigator.storage?.estimate) return { supported: false, usage: null, quota: null, percent: null };
  const result = await navigator.storage.estimate(); const usage = Number(result.usage); const quota = Number(result.quota); return { supported: true, usage: Number.isFinite(usage) ? usage : null, quota: Number.isFinite(quota) ? quota : null, percent: Number.isFinite(usage) && Number.isFinite(quota) && quota > 0 ? usage / quota * 100 : null };
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
