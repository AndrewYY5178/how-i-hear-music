import { canonical, data, safe, storage } from "../music/data.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";

const inboxKey = data.library.storageKey;
const libraryKey = data.library.libraryStorageKey;
const ignoredKey = data.library.ignoredStorageKey;
const importNav = () => secondaryNav([["/import/qq", "QQ Music"], ["/import/inbox", "Inbox"]]);
const read = (key) => storage.get(key, []);
const key = (track) => canonical(track.title) + "::" + canonical(track.artist);
const sourceUrl = (value) => (String(value || "").match(/https?:\/\/[^\s<>"'）)】]+/i) || [""])[0].replace(/[，。；、]+$/, "");

export const importHome = () => `${pageHeader("IMPORT", "Bring music in.", "External music enters Inbox first. Import is never the Archive.")}${importNav()}<div class="import-choices"><article><span class="mono">QQ MUSIC</span><h2>Paste a public share.</h2><p>Read playlist metadata without a login, then review before keeping anything.</p>${link("/import/qq", "IMPORT FROM QQ →", "button primary")}</article><article class="muted-card"><span class="mono">NETEASE</span><h2>Coming soon.</h2><p>Manual track import remains available after the QQ adapter workflow is complete.</p></article></div>`;

export const importQQ = () => `${pageHeader("IMPORT / QQ MUSIC", "Bring a QQ record in.", "Public metadata only: no QQ login, Cookie, audio or lyrics.")}${importNav()}<section class="qq-import-focus"><div class="qq-import-intro"><span class="eyebrow mono">01 / PLAYLIST IMPORT</span><h2>Paste the share at the desk.</h2><p>One public playlist at a time. Nothing is added until you review the preview.</p></div><form id="qq-import-form"><label><span class="mono">QQ MUSIC PLAYLIST / SHARE CARD</span><textarea id="qq-share" rows="4" placeholder="Paste a QQ Music playlist link or share text"></textarea></label><button class="button primary" type="submit">PREVIEW IMPORT</button></form><aside id="qq-import-result"><span class="mono">IMPORT PREVIEW</span><p>Waiting for a public playlist link.</p></aside></section><section class="catalog-search"><div><span class="eyebrow mono">02 / QQ MUSIC CATALOG</span><p>Looking for one track instead? Search the public catalog and send it straight to Inbox.</p></div><form id="qq-search-form"><input id="qq-search-query" type="search" placeholder="Search tracks, artists or albums"><button class="button" type="submit">SEARCH QQ MUSIC</button></form><div id="qq-search-results"></div></section>`;

export const importInbox = () => {
  const inbox = read(inboxKey); const kept = read(libraryKey); const ignored = read(ignoredKey);
  return `${pageHeader("IMPORT / INBOX", "Review before the archive.", "New imports stay separate until you deliberately keep or rate them.")}${importNav()}<div class="inbox-counts"><span><b>NEW</b>${inbox.length}</span><span><b>KEPT</b>${kept.length}</span><span><b>IGNORED</b>${ignored.length}</span></div><section class="inbox-entries">${inbox.length ? inbox.map((track, index) => `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span><div><strong>${safe(track.title)}</strong><p>${safe(track.artist + (track.album ? " · " + track.album : ""))}</p></div><div class="entry-actions"><button data-inbox-action="keep" data-id="${safe(track.id)}">ADD TO ARCHIVE</button><a href="/rate" data-route>RATE</a><button data-inbox-action="ignore" data-id="${safe(track.id)}">IGNORE</button></div></article>`).join("") : "<p class='empty-state'>Nothing is waiting for review.</p>"}</section>`;
};

const preview = (container, tracks, playlist, source) => {
  const existing = [...read(inboxKey), ...read(libraryKey)]; const seen = new Set();
  const classified = tracks.map((track) => {
    const duplicate = seen.has(key(track)) || existing.some((item) => key(item) === key(track)); seen.add(key(track));
    return { ...track, state: duplicate ? "existing" : "new", sourceUrl: source, source: "qqmusic", sourceLabel: "QQ Music", playlist };
  });
  const newCount = classified.filter((track) => track.state === "new").length;
  container.innerHTML = `<span class="mono">PLAYLIST FOUND</span><h2>${safe(playlist.title)}</h2><p>${safe(playlist.creator ? "by " + playlist.creator + " · " : "")}${classified.length} public tracks</p><p><b>${newCount} New</b> · ${classified.length - newCount} Existing</p><div class="preview-list">${classified.slice(0, 8).map((track) => `<div><span>${safe(track.state)}</span>${safe(track.title)} <small>${safe(track.artist)}</small></div>`).join("")}${classified.length > 8 ? `<p>+ ${classified.length - 8} more tracks</p>` : ""}</div><button id="confirm-qq-import" class="button primary">IMPORT ${newCount} NEW TRACKS</button>`;
  container.querySelector("#confirm-qq-import").addEventListener("click", () => {
    const additions = classified.filter((track) => track.state === "new").map((track) => ({ ...track, id: "inbox_" + crypto.randomUUID(), importedAt: new Date().toISOString() }));
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
          storage.set(inboxKey, [...read(inboxKey), { ...track, id: "inbox_" + crypto.randomUUID(), importedAt: new Date().toISOString(), source: "qqmusic", sourceLabel: "QQ Music catalog" }]); button.textContent = "ADDED";
        }));
      } catch (error) { output.innerHTML = `<p class="empty-state">${safe(error instanceof Error ? error.message : "QQ Music search failed.")}</p>`; }
    });
  }
  if (path === "/import/inbox") document.querySelector(".inbox-entries")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-inbox-action]"); if (!button) return;
    const entries = read(inboxKey); const track = entries.find((item) => item.id === button.dataset.id); if (!track) return;
    if (button.dataset.inboxAction === "keep") storage.set(libraryKey, [...read(libraryKey), { ...track, id: "library_" + crypto.randomUUID(), keptAt: new Date().toISOString() }]);
    if (button.dataset.inboxAction === "ignore") storage.set(ignoredKey, [...read(ignoredKey), { ...track, ignoredAt: new Date().toISOString() }]);
    storage.set(inboxKey, entries.filter((item) => item.id !== track.id)); navigate("/import/inbox");
  });
};
