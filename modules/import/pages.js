import { canonical, data, safe, storage } from "../music/data.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";

const inboxKey = data.library.storageKey;
const libraryKey = data.library.libraryStorageKey;
const ignoredKey = data.library.ignoredStorageKey;
const ratingKey = "how-i-hear-music:rating-sessions:v2";
const journalKey = "how-i-hear-music:journal:v1";
const backupFormat = "how-i-hear-music-backup";
const backupVersion = 1;
const importNav = () => secondaryNav([["/import/qq", "QQ Music"], ["/import/netease", "NetEase"], ["/import/inbox", "Inbox"]]);
const read = (key) => storage.get(key, []);
const key = (track) => canonical(track.title) + "::" + canonical(track.artist);
const sourceUrl = (value) => (String(value || "").match(/https?:\/\/[^\s<>"'）)】]+/i) || [""])[0].replace(/[，。；、]+$/, "");

export const importHome = () => `${pageHeader("IMPORT", "Bring music in.", "External music enters Inbox first. Import is never the Archive.")}${importNav()}<div class="import-choices"><article><span class="mono">QQ MUSIC</span><h2>Paste a public share.</h2><p>Read playlist metadata without a login, then review before keeping anything.</p>${link("/import/qq", "IMPORT FROM QQ →", "button primary")}</article><article><span class="mono">NETEASE</span><h2>Import a public playlist.</h2><p>Read public playlist metadata through the server, with no login, Cookie, audio or lyrics.</p>${link("/import/netease", "IMPORT FROM NETEASE →", "button primary")}</article></div>`;

export const importQQ = () => `${pageHeader("IMPORT / QQ MUSIC", "Bring a QQ record in.", "Public metadata only: no QQ login, Cookie, audio or lyrics.")}${importNav()}<section class="qq-import-focus"><div class="qq-import-intro"><span class="eyebrow mono">01 / PLAYLIST IMPORT</span><h2>Paste the share at the desk.</h2><p>One public playlist at a time. Nothing is added until you review the preview.</p></div><form id="qq-import-form"><label><span class="mono">QQ MUSIC PLAYLIST / SHARE CARD</span><textarea id="qq-share" rows="4" placeholder="Paste a QQ Music playlist link or share text"></textarea></label><button class="button primary" type="submit">PREVIEW IMPORT</button></form><aside id="qq-import-result"><span class="mono">IMPORT PREVIEW</span><p>Waiting for a public playlist link.</p></aside></section><section class="catalog-search"><div><span class="eyebrow mono">02 / QQ MUSIC CATALOG</span><p>Looking for one track instead? Search the public catalog and send it straight to Inbox.</p></div><form id="qq-search-form"><input id="qq-search-query" type="search" placeholder="Search tracks, artists or albums"><button class="button" type="submit">SEARCH QQ MUSIC</button></form><div id="qq-search-results"></div></section>`;

export const importNetEase = () => `${pageHeader("IMPORT / NETEASE", "Bring a NetEase record in.", "Public metadata only: no NetEase login, Cookie, audio, cover download or lyrics.")}${importNav()}<section class="qq-import-focus"><div class="qq-import-intro"><span class="eyebrow mono">01 / PLAYLIST IMPORT</span><h2>Paste the public share.</h2><p>Playlist metadata enters the same Inbox review workflow as every other source.</p></div><form id="netease-import-form"><label><span class="mono">NETEASE PLAYLIST / SHARE CARD</span><textarea id="netease-share" rows="4" placeholder="Paste a NetEase Cloud Music playlist link or share text"></textarea></label><button class="button primary" type="submit">PREVIEW IMPORT</button></form><aside id="netease-import-result"><span class="mono">IMPORT PREVIEW</span><p>Waiting for a public playlist link.</p></aside></section>`;

const stateLabel = (state) => state === "review" ? "REVIEW" : "NEW ENTRY";
export const importInbox = () => {
  const inbox = read(inboxKey); const kept = read(libraryKey); const ignored = read(ignoredKey); const reviewCount = inbox.filter((track) => track.state === "review").length; const newCount = inbox.length - reviewCount;
  return `${pageHeader("IMPORT / INBOX", "Review before the archive.", "New imports stay separate until you deliberately keep or rate them.")}${importNav()}<div class="inbox-counts"><span><b>NEW ENTRY</b>${newCount}</span><span><b>REVIEW</b>${reviewCount}</span><span><b>KEPT</b>${kept.length}</span><span><b>IGNORED</b>${ignored.length}</span></div><section class="inbox-entries">${inbox.length ? inbox.map((track, index) => `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span><div><span class="inbox-state ${safe(track.state || "new_entry")}">${stateLabel(track.state)}</span><strong>${safe(track.title)}</strong><p>${safe(track.artist + (track.album ? " · " + track.album : ""))}</p></div><div class="entry-actions"><button data-inbox-action="keep" data-id="${safe(track.id)}">KEEP</button><a href="/rate/track/${encodeURIComponent(track.id)}" data-route>RATE</a><button data-inbox-action="${track.state === "review" ? "new-entry" : "review"}" data-id="${safe(track.id)}">${track.state === "review" ? "NEW ENTRY" : "REVIEW"}</button><button data-inbox-action="ignore" data-id="${safe(track.id)}">IGNORE</button></div></article>`).join("") : "<p class='empty-state'>Nothing is waiting for review.</p>"}</section><section class="local-backup"><div><span class="eyebrow mono">LOCAL DATA</span><h2>Keep a copy of the desk.</h2><p>Export Inbox, Library, ratings, Journal and album drafts as one versioned JSON file. Restore merges valid records without deleting existing data.</p></div><div class="backup-actions"><button class="button" id="export-local-data" type="button">EXPORT BACKUP</button><label class="button" for="restore-local-data">RESTORE BACKUP</label><input id="restore-local-data" type="file" accept="application/json,.json"><p id="backup-status" aria-live="polite"></p></div></section>`;
};

const preview = (container, tracks, playlist, source, platform = { id: "qqmusic", label: "QQ Music" }) => {
  const existing = [...data.songs.entries, ...read(inboxKey), ...read(libraryKey)]; const seen = new Set();
  const classified = tracks.map((track) => {
    const duplicate = seen.has(key(track)) || existing.some((item) => key(item) === key(track)); seen.add(key(track));
    return { ...track, state: duplicate ? "existing" : "new_entry", sourceUrl: source, source: platform.id, sourceLabel: platform.label, playlist };
  });
  const newCount = classified.filter((track) => track.state === "new_entry").length;
  container.innerHTML = `<span class="mono">PLAYLIST FOUND</span><h2>${safe(playlist.title)}</h2><p>${safe(playlist.creator ? "by " + playlist.creator + " · " : "")}${classified.length} public tracks</p><p><b>${newCount} New</b> · ${classified.length - newCount} Existing</p><div class="preview-list">${classified.slice(0, 8).map((track) => `<div><span>${safe(track.state)}</span>${safe(track.title)} <small>${safe(track.artist)}</small></div>`).join("")}${classified.length > 8 ? `<p>+ ${classified.length - 8} more tracks</p>` : ""}</div><button id="confirm-playlist-import" class="button primary">IMPORT ${newCount} NEW TRACKS</button>`;
  container.querySelector("#confirm-playlist-import").addEventListener("click", () => {
    const additions = classified.filter((track) => track.state === "new_entry").map((track) => ({ ...track, id: "inbox_" + crypto.randomUUID(), importedAt: new Date().toISOString() }));
    storage.set(inboxKey, [...read(inboxKey), ...additions]);
    container.innerHTML = `<span class="mono">IMPORT COMPLETE</span><h2>${additions.length} tracks entered Inbox.</h2><p>Review them before adding them to the archive.</p>${link("/import/inbox", "OPEN INBOX", "button primary")}`;
  });
};

export const bindImport = (path, navigate) => {
  if (path === "/import/qq") {
    document.getElementById("qq-import-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const share = sourceUrl(document.getElementById("qq-share").value); const output = document.getElementById("qq-import-result");
      if (!share) { output.innerHTML = "<p>Please paste a public QQ Music playlist link.</p>"; return; }
      output.innerHTML = "<span class='mono'>READING PLAYLIST…</span><p>Checking public QQ Music metadata.</p>";
      try {
        const response = await fetch("/api/import/qq-playlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shareUrl: share }) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error);
        preview(output, result.tracks || [], result.playlist, share);
      } catch (error) { output.innerHTML = `<span class="mono">IMPORT NOT AVAILABLE</span><h2>Could not read this playlist.</h2><p>${safe(error instanceof Error ? error.message : "Try another public QQ Music playlist link.")}</p>`; }
    });
    document.getElementById("qq-search-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const query = document.getElementById("qq-search-query").value.trim(); const output = document.getElementById("qq-search-results");
      if (!query) return;
      output.innerHTML = "<p class='empty-state'>Searching QQ Music…</p>";
      try {
        const response = await fetch("/api/import/qq-search?q=" + encodeURIComponent(query)); const result = await response.json(); if (!response.ok) throw new Error(result.error);
        const tracks = result.tracks || [];
        output.innerHTML = tracks.length ? `<div class="catalog-results">${tracks.map((track, index) => `<article><div><strong>${safe(track.title)}</strong><p>${safe(track.artist + (track.album ? " · " + track.album : ""))}</p></div><button data-catalog-add="${index}">ADD TO INBOX</button></article>`).join("")}</div>` : "<p class='empty-state'>No public QQ Music tracks found.</p>";
        output.querySelectorAll("[data-catalog-add]").forEach((button) => button.addEventListener("click", () => {
          const track = tracks[Number(button.dataset.catalogAdd)]; const exists = read(inboxKey).some((item) => key(item) === key(track)) || read(libraryKey).some((item) => key(item) === key(track));
          if (exists) { button.textContent = "ALREADY KNOWN"; return; }
          storage.set(inboxKey, [...read(inboxKey), { ...track, id: "inbox_" + crypto.randomUUID(), state: "new_entry", importedAt: new Date().toISOString(), source: "qqmusic", sourceLabel: "QQ Music catalog" }]); button.textContent = "ADDED";
        }));
      } catch (error) { output.innerHTML = `<p class="empty-state">${safe(error instanceof Error ? error.message : "QQ Music search failed.")}</p>`; }
    });
  }
  if (path === "/import/netease") {
    document.getElementById("netease-import-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const share = sourceUrl(document.getElementById("netease-share").value); const output = document.getElementById("netease-import-result");
      if (!share) { output.innerHTML = "<p>Please paste a public NetEase Cloud Music playlist link.</p>"; return; }
      output.innerHTML = "<span class='mono'>READING PLAYLIST…</span><p>Checking public NetEase playlist metadata.</p>";
      try {
        const response = await fetch("/api/import/netease-playlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shareUrl: share }) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error);
        preview(output, result.tracks || [], result.playlist, share, { id: "netease", label: "NetEase Cloud Music" });
      } catch (error) { output.innerHTML = `<span class="mono">IMPORT NOT AVAILABLE</span><h2>Could not read this playlist.</h2><p>${safe(error instanceof Error ? error.message : "Try another public NetEase playlist link.")}</p>`; }
    });
  }
  if (path === "/import/inbox") bindInbox(navigate);
};

const backupKeys = () => [inboxKey, libraryKey, ignoredKey, ratingKey, journalKey, ...Object.keys(localStorage).filter((item) => item.startsWith("how-i-hear-music:album-draft:"))];
const exportBackup = () => ({ format: backupFormat, version: backupVersion, exportedAt: new Date().toISOString(), data: Object.fromEntries([...new Set(backupKeys())].map((item) => [item, storage.get(item, null)]).filter(([, value]) => value !== null)) });
const mergeArrays = (current, incoming) => {
  const result = [...current]; const seen = new Set(current.map((item) => item?.id || key(item || {}) || JSON.stringify(item)));
  incoming.forEach((item) => { const identity = item?.id || key(item || {}) || JSON.stringify(item); if (!seen.has(identity)) { seen.add(identity); result.push(item); } });
  return result;
};
const restoreBackup = (payload) => {
  if (!payload || payload.format !== backupFormat || payload.version !== backupVersion || !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) throw new Error("This is not a supported How I Hear Music backup.");
  const exact = new Set([inboxKey, libraryKey, ignoredKey, ratingKey, journalKey]); let restored = 0;
  Object.entries(payload.data).forEach(([name, value]) => {
    if (!exact.has(name) && !name.startsWith("how-i-hear-music:album-draft:")) return;
    if ([inboxKey, libraryKey, ignoredKey, journalKey].includes(name)) { if (!Array.isArray(value)) return; storage.set(name, mergeArrays(read(name), value)); restored += 1; return; }
    if (name === ratingKey && value && typeof value === "object" && !Array.isArray(value)) { storage.set(name, { ...storage.get(name, {}), ...value }); restored += 1; return; }
    if (name.startsWith("how-i-hear-music:album-draft:") && (Array.isArray(value) || Number.isFinite(value))) { storage.set(name, value); restored += 1; }
  });
  if (!restored) throw new Error("The backup contains no compatible local records.");
  return restored;
};

const bindInbox = (navigate) => {
  document.querySelector(".inbox-entries")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-inbox-action]"); if (!button) return;
    const entries = read(inboxKey); const track = entries.find((item) => item.id === button.dataset.id); if (!track) return;
    if (button.dataset.inboxAction === "keep") { storage.set(libraryKey, [...read(libraryKey), { ...track, state: "kept", id: "library_" + crypto.randomUUID(), sourceInboxId: track.id, keptAt: new Date().toISOString() }]); storage.set(inboxKey, entries.filter((item) => item.id !== track.id)); }
    if (button.dataset.inboxAction === "ignore") { storage.set(ignoredKey, [...read(ignoredKey), { ...track, ignoredAt: new Date().toISOString() }]); storage.set(inboxKey, entries.filter((item) => item.id !== track.id)); }
    if (button.dataset.inboxAction === "review") storage.set(inboxKey, entries.map((item) => item.id === track.id ? { ...item, state: "review", reviewedAt: null } : item));
    if (button.dataset.inboxAction === "new-entry") storage.set(inboxKey, entries.map((item) => item.id === track.id ? { ...item, state: "new_entry" } : item));
    navigate("/import/inbox");
  });
  document.getElementById("export-local-data")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], { type: "application/json" }); const href = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = href; anchor.download = `how-i-hear-music-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(href); document.getElementById("backup-status").textContent = "Backup exported.";
  });
  document.getElementById("restore-local-data")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0]; const status = document.getElementById("backup-status"); if (!file) return;
    if (file.size > 2_000_000) { status.textContent = "Backup is too large (2 MB maximum)."; return; }
    try { const restored = restoreBackup(JSON.parse(await file.text())); status.textContent = `${restored} local data groups restored. Reloading Inbox…`; setTimeout(() => navigate("/import/inbox"), 350); } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not restore this backup."; }
  });
};
