import { configuredApiBase } from "./api.js";
import { exportBackup, previewRestore, restoreBackup } from "./resilience.js";

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
export const requestNicknamePrompt = () => { const saved = get(); if (saved?.token) set({ ...saved, promptNickname: true }); };
export const clearNicknamePrompt = () => { const saved = get(); if (saved?.promptNickname || !saved?.nicknamePromptSeen) set({ ...saved, promptNickname: false, nicknamePromptSeen: true }); };
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
export const pushAccountSync = async () => {
  const saved = get(); if (!saved?.token) throw new Error("Sign in with GitHub before syncing.");
  const result = await request("/api/sync/blob", { method: "PUT", body: JSON.stringify({ backup: exportBackup(), revision: Number(saved.revision || 0) }) });
  set({ ...saved, revision: result.revision, updatedAt: result.updatedAt }); return result;
};
export const downloadAccountSync = async () => {
  const saved = get(); if (!saved?.token) throw new Error("Sign in with GitHub before syncing.");
  const result = await request("/api/sync/blob"); if (!result.backup) return { empty: true, revision: 0 };
  const backup = result.backup; const preview = previewRestore(backup);
  set({ ...saved, revision: result.revision, updatedAt: result.updatedAt }); return { backup, preview, revision: result.revision, updatedAt: result.updatedAt };
};
let automaticStarted = false; let automaticTimer = null; let applyingRemote = false;
const pullCloud = async (conflictPolicy = "backup") => {
  const incoming = await downloadAccountSync();
  if (incoming.empty) return incoming;
  applyingRemote = true;
  try { incoming.restored = restoreBackup(incoming.backup, { conflictPolicy }); window.dispatchEvent(new CustomEvent("how-i-hear-music:sync-applied")); }
  finally { applyingRemote = false; }
  return incoming;
};
const reconcile = async ({ initial = false } = {}) => {
  const before = Number(syncSession()?.revision || 0); const remote = await readSyncStatus();
  if (!remote.revision) return pushAccountSync();
  if (initial || Number(remote.revision) > before) return pullCloud("backup");
  return remote;
};
const schedule = () => {
  if (applyingRemote || !syncSession()?.token) return;
  clearTimeout(automaticTimer); automaticTimer = setTimeout(async () => {
    try { await pushAccountSync(); }
    catch (error) {
      if (error?.status !== 409) { console.warn("Automatic account sync failed.", error); return; }
      try { await pullCloud("local"); await pushAccountSync(); } catch (retryError) { console.warn("Automatic account sync retry failed.", retryError); }
    }
  }, 900);
};
export const startAutomaticSync = async ({ initial = false } = {}) => {
  if (!syncSession()?.token) return null;
  if (!automaticStarted) {
    automaticStarted = true;
    window.addEventListener("how-i-hear-music:local-change", schedule);
    window.setInterval(() => reconcile().catch((error) => console.warn("Automatic account sync check failed.", error)), 45_000);
  }
  return reconcile({ initial });
};
export const signOutSync = async () => { try { await request("/api/sync/logout", { method: "POST", body: "{}" }); } finally { clear(); } };
