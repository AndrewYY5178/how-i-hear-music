import { configuredApiBase } from "./api.js";
import { decryptBackup, exportEncryptedBackup, previewRestore, restoreBackup } from "./resilience.js";

const sessionKey = "how-i-hear-music:cloud-sync-session:v1";
const get = () => { try { return JSON.parse(localStorage.getItem(sessionKey) || "null"); } catch { return null; } };
const set = (value) => localStorage.setItem(sessionKey, JSON.stringify(value));
const clear = () => localStorage.removeItem(sessionKey);
const base = () => configuredApiBase();
const request = async (path, options = {}) => {
  if (!base()) throw new Error("Private sync needs the hosted metadata service.");
  const saved = get(); const headers = new Headers(options.headers || {});
  if (saved?.token) headers.set("Authorization", `Bearer ${saved.token}`);
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(base() + path, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(result.error || "Sync request failed."), { status: response.status, result });
  return result;
};
export const syncSession = () => get();
export const syncReady = () => Boolean(base());
export const beginGithubSync = () => {
  if (!base()) throw new Error("Private sync is not available on this build.");
  const returnTo = new URL(location.href); returnTo.hash = "";
  location.assign(`${base()}/api/sync/github/start?return_to=${encodeURIComponent(returnTo.toString())}`);
};
export const completeGithubSync = async () => {
  const match = location.hash.match(/(?:^#|&)sync-exchange=([^&]+)/); if (!match) return null;
  const result = await request("/api/sync/exchange", { method: "POST", body: JSON.stringify({ exchangeCode: decodeURIComponent(match[1]) }) });
  set({ token: result.token, user: result.user, revision: 0, expiresAt: result.expiresAt });
  history.replaceState({}, "", `${location.pathname}${location.search}`);
  return result.user;
};
export const readSyncStatus = async () => {
  const result = await request("/api/sync/status"); const saved = get(); set({ ...saved, user: result.user, revision: result.revision, updatedAt: result.updatedAt }); return result;
};
export const pushEncryptedSync = async (password) => {
  const saved = get(); if (!saved?.token) throw new Error("Sign in with GitHub before syncing.");
  const encrypted = await exportEncryptedBackup(password); const result = await request("/api/sync/blob", { method: "PUT", body: JSON.stringify({ encrypted, revision: Number(saved.revision || 0) }) });
  set({ ...saved, revision: result.revision, updatedAt: result.updatedAt }); return result;
};
export const downloadEncryptedSync = async (password) => {
  const saved = get(); if (!saved?.token) throw new Error("Sign in with GitHub before syncing.");
  const result = await request("/api/sync/blob"); if (!result.encrypted) return { empty: true, revision: 0 };
  const backup = await decryptBackup(result.encrypted, password); const preview = previewRestore(backup);
  set({ ...saved, revision: result.revision, updatedAt: result.updatedAt }); return { backup, preview, revision: result.revision, updatedAt: result.updatedAt };
};
export const applyDownloadedSync = (backup, conflictPolicy = "local") => restoreBackup(backup, { conflictPolicy });
export const signOutSync = async () => { try { await request("/api/sync/logout", { method: "POST", body: "{}" }); } finally { clear(); } };
