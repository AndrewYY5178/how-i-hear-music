import { canonical, data, safe, storage } from "../music/data.js";
import { matchTrack } from "../music/matching.js";
import { createPlaylistSnapshot, diffPlaylistSnapshots } from "../music/sync.js";
import { archiveTrack, lifecycleStates, lifecycleTracks, updateLifecycle } from "../music/lifecycle.js";
import { albumStorageKey, analyzeAlbumImport, storeAlbumImport } from "../music/album-import.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";

const inboxKey = data.library.storageKey;
const libraryKey = data.library.libraryStorageKey;
const ignoredKey = data.library.ignoredStorageKey;
const ratingKey = "how-i-hear-music:rating-sessions:v2";
const journalKey = "how-i-hear-music:journal:v1";
const versionKey = "how-i-hear-music:recording-versions:v1";
const sonicKey = "how-i-hear-music:sonic-descriptors:v1";
const tasteGroupKey = "how-i-hear-music:taste-groups:v1";
const awardsKey = "how-i-hear-music:personal-awards:v1";
const rediscoveryKey = "how-i-hear-music:rediscovery-skips:v1";
const coverOverrideKey = "how-i-hear-music:cover-overrides:v1";
const snapshotKey = "how-i-hear-music:playlist-snapshots:v1";
const backupFormat = "how-i-hear-music-backup";
const backupVersion = 1;
const importNav = () => secondaryNav([["/import/qq", "QQ Playlist"], ["/import/qq-album", "QQ Album"], ["/import/netease", "NetEase"], ["/import/inbox", "Inbox"]]);
const read = (key) => storage.get(key, []);
const key = (track) => canonical(track.title) + "::" + canonical(track.artist);
const sourceUrl = (value) => (String(value || "").match(/https?:\/\/[^\s<>"'）)】]+/i) || [""])[0].replace(/[，。；、]+$/, "");
const readSnapshots = () => storage.get(snapshotKey, {});
const saveSnapshot = (snapshot) => storage.set(snapshotKey, { ...readSnapshots(), [snapshot.sourceUrl]: snapshot });
const apiRequest = async (endpoint, options) => {
  const response = await fetch(endpoint, options);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) throw new Error("Public metadata import requires the local Node server and is unavailable on this static Pages build.");
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The metadata service could not complete this request.");
  return result;
};

export const importHome = () => `${pageHeader("IMPORT", "Bring music in.", "Playlists enter Inbox; a confirmed album import creates its ordered Archive record.")}${importNav()}<div class="import-choices"><article><span class="mono">QQ MUSIC</span><h2>Playlist or album.</h2><p>Review playlist tracks in Inbox, or preserve an album's official sequence.</p>${link("/import/qq", "IMPORT FROM QQ →", "button primary")}</article><article><span class="mono">NETEASE</span><h2>Import a public playlist.</h2><p>Read public playlist metadata through the server, with no login, Cookie, audio or lyrics.</p>${link("/import/netease", "IMPORT FROM NETEASE →", "button primary")}</article></div>`;

export const importQQ = () => `${pageHeader("IMPORT / QQ MUSIC", "Bring a QQ record in.", "Public metadata only: no QQ login, Cookie, audio or lyrics.")}${importNav()}<section class="qq-import-focus"><div class="qq-import-intro"><span class="eyebrow mono">01 / PLAYLIST IMPORT</span><h2>Paste the share at the desk.</h2><p>One public playlist at a time. Nothing is added until you review the preview.</p></div><form id="qq-import-form"><label><span class="mono">QQ MUSIC PLAYLIST / SHARE CARD</span><textarea id="qq-share" rows="4" placeholder="Paste a QQ Music playlist link or share text"></textarea></label><button class="button primary" type="submit">PREVIEW IMPORT</button></form><aside id="qq-import-result"><span class="mono">IMPORT PREVIEW</span><p>Waiting for a public playlist link.</p></aside></section><section class="catalog-search"><div><span class="eyebrow mono">02 / QQ MUSIC CATALOG</span><p>Looking for one track instead? Search the public catalog and send it straight to Inbox.</p></div><form id="qq-search-form"><input id="qq-search-query" type="search" placeholder="Search tracks, artists or albums"><button class="button" type="submit">SEARCH QQ MUSIC</button></form><div id="qq-search-results"></div></section>`;

export const importQQAlbum = () => `${pageHeader("IMPORT / QQ ALBUM", "Preserve the record's sequence.", "Paste one public QQ Music album link. Preview every disc and track before the local Archive changes.")}${importNav()}<section class="qq-import-focus album-import-focus"><div class="qq-import-intro"><span class="eyebrow mono">ORDERED ALBUM IMPORT</span><h2>Start with the album itself.</h2><p>Metadata only. Track order comes from the exact QQ Music album entity—never search results or recommendations.</p></div><form id="qq-album-import-form"><label><span class="mono">QQ MUSIC ALBUM / SHARE TEXT</span><textarea id="qq-album-share" rows="4" placeholder="Paste an album URL or the full QQ Music share message"></textarea></label><button class="button primary" type="submit">DETECT ALBUM</button></form><aside id="qq-album-import-result" aria-live="polite"><span class="mono">ALBUM PREVIEW</span><p>Waiting for a public QQ Music album link.</p></aside></section>`;

export const importNetEase = () => `${pageHeader("IMPORT / NETEASE", "Bring a NetEase record in.", "Public metadata only: no NetEase login, Cookie, audio, cover download or lyrics.")}${importNav()}<section class="qq-import-focus"><div class="qq-import-intro"><span class="eyebrow mono">01 / PLAYLIST IMPORT</span><h2>Paste the public share.</h2><p>Playlist metadata enters the same Inbox review workflow as every other source.</p></div><form id="netease-import-form"><label><span class="mono">NETEASE PLAYLIST / SHARE CARD</span><textarea id="netease-share" rows="4" placeholder="Paste a NetEase Cloud Music playlist link or share text"></textarea></label><button class="button primary" type="submit">PREVIEW IMPORT</button></form><aside id="netease-import-result"><span class="mono">IMPORT PREVIEW</span><p>Waiting for a public playlist link.</p></aside></section>`;

const stateLabel = (state) => state === "auto_match" ? "AUTO MATCH" : state === "review" ? "REVIEW" : state === "kept" ? "LEGACY RECORD" : "NEW ENTRY";
export const importInbox = () => {
  const records = lifecycleTracks(); const ignored = read(ignoredKey); const snapshots = Object.values(readSnapshots()); const counts = Object.fromEntries(lifecycleStates.map((state) => [state, records.filter((track) => track.lifecycleState === state).length]));
  const sources = snapshots.length ? snapshots.map((snapshot, index) => `<article><div><span class="mono">${safe(snapshot.sourceLabel || snapshot.source)}</span><strong>${safe(snapshot.playlist?.title || "Untitled playlist")}</strong><p>${safe(String(snapshot.playlist?.trackCount || snapshot.tracks?.length || 0))} tracks · last checked ${safe(new Date(snapshot.syncedAt).toLocaleDateString())}</p></div><button class="button" type="button" data-sync-source="${index}">SYNC NOW</button></article>`).join("") : "<p class='empty-state'>Import a public playlist once to create a local sync source.</p>";
  const entries = records.length ? records.map((track, index) => {
    const status = track.lifecycleState; const canArchive = status === "rated"; const canIgnore = track.lifecycleLocation === "inbox" && status !== "rated";
    return `<article><span class="mono">${String(index + 1).padStart(2, "0")}</span><div><span class="inbox-state lifecycle-${safe(status)}">${safe(status)}</span><strong>${safe(track.title)}</strong><p>${safe(track.artist + (track.album ? " · " + track.album : ""))} · ${stateLabel(track.state)}${track.matchedTitle ? safe(" · possible match: " + track.matchedTitle) : ""}</p></div><div class="entry-actions">${status === "imported" ? `<button data-inbox-action="heard" data-id="${safe(track.id)}">MARK HEARD</button>` : ""}${status !== "archived" ? link(`/rate/track/${encodeURIComponent(track.id)}`, status === "rated" ? "RATE AGAIN" : "RATE") : ""}${canArchive ? `<button data-inbox-action="archive" data-id="${safe(track.id)}">ARCHIVE</button>` : ""}${track.lifecycleLocation === "inbox" ? `<button data-inbox-action="${track.state === "review" ? "new-entry" : "review"}" data-id="${safe(track.id)}">${track.state === "review" ? "NEW ENTRY" : "REVIEW"}</button>` : ""}${canIgnore ? `<button data-inbox-action="ignore" data-id="${safe(track.id)}">IGNORE</button>` : ""}</div></article>`;
  }).join("") : "<p class='empty-state'>No imported records yet.</p>";
  return `${pageHeader("IMPORT / INBOX", "Move music through the desk.", "Imported, heard and rated records stay out of Archive until you deliberately archive them.")}${importNav()}<div class="inbox-counts">${lifecycleStates.map((state) => `<span><b>${state.toUpperCase()}</b>${counts[state]}</span>`).join("")}</div><p class="workflow-note mono">${ignored.length} IGNORED · MATCH CONFIDENCE REMAINS VISIBLE IN EACH RECORD</p><section class="playlist-sources"><div><span class="eyebrow mono">PLAYLIST SOURCES</span><h2>Check what changed.</h2><p>Sync compares public snapshots. A removal never deletes a local track, rating or note.</p></div><div class="playlist-source-list">${sources}</div><div id="sync-status" aria-live="polite"></div></section><section class="inbox-entries">${entries}</section><section class="local-backup"><div><span class="eyebrow mono">LOCAL DATA</span><h2>Keep a copy of the desk.</h2><p>Export Inbox, Library, lifecycle states, ratings, Journal, playlist snapshots and album drafts as one versioned JSON file. Restore merges valid records without deleting existing data.</p></div><div class="backup-actions"><button class="button" id="export-local-data" type="button">EXPORT BACKUP</button><label class="button" for="restore-local-data">RESTORE BACKUP</label><input id="restore-local-data" type="file" accept="application/json,.json"><p id="backup-status" aria-live="polite"></p></div></section>`;
};

const classifyTracks = (tracks, playlist, source, platform) => {
  const local = [...read(inboxKey), ...read(libraryKey)]; const seen = new Set();
  return tracks.map((track) => {
    const identity = key(track); const localMatch = local.find((item) => key(item) === identity); const duplicate = seen.has(identity); seen.add(identity);
    if (duplicate || localMatch) return { ...track, state: "existing", matchedLocalId: localMatch?.id || null, sourceUrl: source, source: platform.id, sourceLabel: platform.label, playlist };
    const match = matchTrack(track, data.songs.entries); const candidate = match.candidate;
    return { ...track, state: match.confidence, matchConfidence: match.score, matchedCanonicalId: candidate?.id || null, matchedTitle: candidate ? `${candidate.title} — ${candidate.artist}` : null, providerRefs: { [platform.id]: track.provider || {} }, sourceUrl: source, source: platform.id, sourceLabel: platform.label, playlist };
  });
};
const storeClassified = (classified, platform) => {
  const importable = classified.filter((track) => track.state !== "existing");
  const additions = importable.map((track) => ({ ...track, id: "inbox_" + crypto.randomUUID(), lifecycleState: "imported", importedAt: new Date().toISOString() }));
  const mergeProvider = (items) => items.map((item) => { const incoming = classified.find((track) => track.matchedLocalId === item.id); return incoming ? { ...item, providerRefs: { ...(item.providerRefs || {}), [platform.id]: incoming.provider || {} } } : item; });
  storage.set(inboxKey, [...mergeProvider(read(inboxKey)), ...additions]); storage.set(libraryKey, mergeProvider(read(libraryKey)));
  return additions;
};
const preview = (container, tracks, playlist, source, platform = { id: "qqmusic", label: "QQ Music" }) => {
  const classified = classifyTracks(tracks, playlist, source, platform); const importable = classified.filter((track) => track.state !== "existing");
  container.innerHTML = `<span class="mono">PLAYLIST FOUND</span><h2>${safe(playlist.title)}</h2><p>${safe(playlist.creator ? "by " + playlist.creator + " · " : "")}${classified.length} public tracks</p><p><b>${importable.length} to review</b> · ${classified.length - importable.length} Existing</p><div class="preview-list">${classified.slice(0, 8).map((track) => `<div><span>${safe(track.state)}</span>${safe(track.title)} <small>${safe(track.artist)}</small></div>`).join("")}${classified.length > 8 ? `<p>+ ${classified.length - 8} more tracks</p>` : ""}</div><button id="confirm-playlist-import" class="button primary">IMPORT ${importable.length} TO INBOX</button>`;
  container.querySelector("#confirm-playlist-import").addEventListener("click", () => {
    const additions = storeClassified(classified, platform); saveSnapshot(createPlaylistSnapshot({ tracks, playlist, source: platform.id, sourceLabel: platform.label, sourceUrl: source }));
    container.innerHTML = `<span class="mono">IMPORT COMPLETE</span><h2>${additions.length} tracks entered Inbox.</h2><p>Review them before adding them to the archive.</p>${link("/import/inbox", "OPEN INBOX", "button primary")}`;
  });
};

const albumTrackPreview = (tracks) => {
  const multipleDiscs = new Set(tracks.map((track) => track.discNumber)).size > 1; let disc = null;
  return tracks.map((track) => {
    const separator = multipleDiscs && track.discNumber !== disc ? `<div class="album-preview-disc mono">DISC ${String(track.discNumber).padStart(2, "0")}</div>` : ""; disc = track.discNumber;
    return `${separator}<div class="album-preview-track"><span>${String(track.trackNumber).padStart(2, "0")}</span><strong>${safe(track.title)}</strong><small>${safe(track.artistName)}</small><em>${track.duplicateStatus === "existing" ? "EXISTS" : track.duplicateStatus === "review" ? "NEEDS REVIEW" : "NEW"}</em></div>`;
  }).join("");
};
const previewAlbum = (container, album, source) => {
  const analysis = analyzeAlbumImport(album); const meta = [album.artistName, album.year, `${album.trackCount} tracks`].filter(Boolean).join(" · ");
  container.innerHTML = `<span class="mono">${analysis.duplicateAlbum ? "ALBUM ALREADY EXISTS" : "ALBUM FOUND"}</span><h2>${safe(album.title)}</h2><p>${safe(meta)}</p><p><b>${analysis.counts.new} new</b> · ${analysis.counts.existing} existing · ${analysis.counts.review} need review</p><div class="album-preview-list">${albumTrackPreview(analysis.rows)}</div>${analysis.duplicateAlbum ? link(`/archive/albums/${analysis.existingAlbumId}`, "OPEN EXISTING ALBUM", "button") : `<button id="confirm-album-import" class="button primary" type="button">IMPORT ALBUM</button>`}`;
  container.querySelector("#confirm-album-import")?.addEventListener("click", () => {
    try {
      const result = storeAlbumImport(album, source);
      container.innerHTML = `<span class="mono">IMPORT COMPLETE</span><h2>${safe(album.title)} entered the Archive.</h2><p>${album.trackCount} tracks preserved in official order. ${analysis.counts.review ? `${analysis.counts.review} possible duplicates remain marked for review.` : "No uncertain duplicate was merged."}</p>${link(`/archive/albums/${result.albumId}`, "OPEN ALBUM", "button primary")}`;
    } catch (error) { container.innerHTML = `<span class="mono">IMPORT NOT SAVED</span><h2>The album stayed unchanged.</h2><p>${safe(error instanceof Error ? error.message : "The album could not be saved in this browser.")}</p>`; }
  });
};

export const bindImport = (path, navigate) => {
  if (path === "/import/qq-album") {
    document.getElementById("qq-album-import-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const text = document.getElementById("qq-album-share").value.trim(); const output = document.getElementById("qq-album-import-result");
      if (!text) { output.innerHTML = "<p>Paste a public QQ Music album link or share message.</p>"; return; }
      output.innerHTML = "<span class='mono'>READING ALBUM…</span><p>Resolving the public link and preserving its official sequence.</p>";
      try {
        const result = await apiRequest("/api/import/qq-album-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
        previewAlbum(output, result.album, result.sourceUrl);
      } catch (error) { output.innerHTML = `<span class="mono">ALBUM NOT AVAILABLE</span><h2>Could not read this album.</h2><p>${safe(error instanceof Error ? error.message : "Try another public QQ Music album link.")}</p>`; }
    });
  }
  if (path === "/import/qq") {
    document.getElementById("qq-import-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const share = sourceUrl(document.getElementById("qq-share").value); const output = document.getElementById("qq-import-result");
      if (!share) { output.innerHTML = "<p>Please paste a public QQ Music playlist link.</p>"; return; }
      output.innerHTML = "<span class='mono'>READING PLAYLIST…</span><p>Checking public QQ Music metadata.</p>";
      try {
        const result = await apiRequest("/api/import/qq-playlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shareUrl: share }) });
        preview(output, result.tracks || [], result.playlist, share);
      } catch (error) { output.innerHTML = `<span class="mono">IMPORT NOT AVAILABLE</span><h2>Could not read this playlist.</h2><p>${safe(error instanceof Error ? error.message : "Try another public QQ Music playlist link.")}</p>`; }
    });
    document.getElementById("qq-search-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const query = document.getElementById("qq-search-query").value.trim(); const output = document.getElementById("qq-search-results");
      if (!query) return;
      output.innerHTML = "<p class='empty-state'>Searching QQ Music…</p>";
      try {
        const result = await apiRequest("/api/import/qq-search?q=" + encodeURIComponent(query));
        const tracks = result.tracks || [];
        output.innerHTML = tracks.length ? `<div class="catalog-results">${tracks.map((track, index) => `<article><div><strong>${safe(track.title)}</strong><p>${safe(track.artist + (track.album ? " · " + track.album : ""))}</p></div><button data-catalog-add="${index}">ADD TO INBOX</button></article>`).join("")}</div>` : "<p class='empty-state'>No public QQ Music tracks found.</p>";
        output.querySelectorAll("[data-catalog-add]").forEach((button) => button.addEventListener("click", () => {
          const track = tracks[Number(button.dataset.catalogAdd)]; const exists = read(inboxKey).some((item) => key(item) === key(track)) || read(libraryKey).some((item) => key(item) === key(track));
          if (exists) { button.textContent = "ALREADY KNOWN"; return; }
          storage.set(inboxKey, [...read(inboxKey), { ...track, id: "inbox_" + crypto.randomUUID(), state: "new_entry", lifecycleState: "imported", importedAt: new Date().toISOString(), source: "qqmusic", sourceLabel: "QQ Music catalog" }]); button.textContent = "ADDED";
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
        const result = await apiRequest("/api/import/netease-playlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shareUrl: share }) });
        preview(output, result.tracks || [], result.playlist, share, { id: "netease", label: "NetEase Cloud Music" });
      } catch (error) { output.innerHTML = `<span class="mono">IMPORT NOT AVAILABLE</span><h2>Could not read this playlist.</h2><p>${safe(error instanceof Error ? error.message : "Try another public NetEase playlist link.")}</p>`; }
    });
  }
  if (path === "/import/inbox") bindInbox(navigate);
};

const backupKeys = () => [inboxKey, libraryKey, ignoredKey, albumStorageKey, ratingKey, journalKey, versionKey, sonicKey, tasteGroupKey, awardsKey, rediscoveryKey, coverOverrideKey, snapshotKey, ...Object.keys(localStorage).filter((item) => item.startsWith("how-i-hear-music:album-draft:"))];
const exportBackup = () => ({ format: backupFormat, version: backupVersion, exportedAt: new Date().toISOString(), data: Object.fromEntries([...new Set(backupKeys())].map((item) => [item, storage.get(item, null)]).filter(([, value]) => value !== null)) });
const mergeArrays = (current, incoming) => {
  const result = [...current]; const seen = new Set(current.map((item) => item?.id || key(item || {}) || JSON.stringify(item)));
  incoming.forEach((item) => { const identity = item?.id || key(item || {}) || JSON.stringify(item); if (!seen.has(identity)) { seen.add(identity); result.push(item); } });
  return result;
};
const restoreBackup = (payload) => {
  if (!payload || payload.format !== backupFormat || payload.version !== backupVersion || !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) throw new Error("This is not a supported How I Hear Music backup.");
  const exact = new Set([inboxKey, libraryKey, ignoredKey, albumStorageKey, ratingKey, journalKey, versionKey, sonicKey, tasteGroupKey, awardsKey, rediscoveryKey, coverOverrideKey, snapshotKey]); let restored = 0;
  Object.entries(payload.data).forEach(([name, value]) => {
    if (!exact.has(name) && !name.startsWith("how-i-hear-music:album-draft:")) return;
    if ([inboxKey, libraryKey, ignoredKey, albumStorageKey, journalKey, versionKey, tasteGroupKey].includes(name)) { if (!Array.isArray(value)) return; storage.set(name, mergeArrays(read(name), value)); restored += 1; return; }
    if (name === ratingKey && value && typeof value === "object" && !Array.isArray(value)) { storage.set(name, { ...storage.get(name, {}), ...value }); restored += 1; return; }
    if ([sonicKey, awardsKey, rediscoveryKey, coverOverrideKey, snapshotKey].includes(name) && value && typeof value === "object" && !Array.isArray(value)) { storage.set(name, { ...storage.get(name, {}), ...value }); restored += 1; return; }
    if (name.startsWith("how-i-hear-music:album-draft:") && (Array.isArray(value) || Number.isFinite(value))) { storage.set(name, value); restored += 1; }
  });
  if (!restored) throw new Error("The backup contains no compatible local records.");
  return restored;
};

const bindInbox = (navigate) => {
  document.querySelector(".playlist-source-list")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-sync-source]"); if (!button) return;
    const snapshot = Object.values(readSnapshots())[Number(button.dataset.syncSource)]; const status = document.getElementById("sync-status"); if (!snapshot || !status) return;
    const endpoint = snapshot.source === "netease" ? "/api/import/netease-playlist" : "/api/import/qq-playlist";
    button.disabled = true; button.textContent = "CHECKING…"; status.innerHTML = "<p class='empty-state'>Reading the latest public playlist snapshot…</p>";
    try {
      const result = await apiRequest(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shareUrl: snapshot.sourceUrl }) });
      const current = createPlaylistSnapshot({ tracks: result.tracks || [], playlist: result.playlist, source: snapshot.source, sourceLabel: snapshot.sourceLabel, sourceUrl: snapshot.sourceUrl });
      const diff = diffPlaylistSnapshots(snapshot, current);
      const list = (items) => items.slice(0, 5).map((track) => `<li>${safe(track.title)} <small>${safe(track.artist)}</small></li>`).join("");
      status.innerHTML = `<div class="sync-summary"><span class="mono">SNAPSHOT DIFFERENCE</span><h3>${diff.additions.length} added · ${diff.removals.length} removed</h3>${diff.additions.length ? `<div><b>NEW IN SOURCE</b><ul>${list(diff.additions)}</ul></div>` : ""}${diff.removals.length ? `<div><b>NO LONGER IN SOURCE</b><ul>${list(diff.removals)}</ul></div>` : ""}<p>Removed source entries remain untouched in your Inbox, Library, ratings and notes.</p><div class="sync-actions">${diff.additions.length ? `<button class="button primary" id="sync-add-and-save" type="button">ADD NEW + SAVE SNAPSHOT</button><button class="button" id="sync-save-only" type="button">SAVE SNAPSHOT ONLY</button>` : ""}</div></div>`;
      if (!diff.additions.length) { saveSnapshot(current); status.querySelector("h3").textContent = diff.removals.length ? `0 added · ${diff.removals.length} removed · snapshot saved` : "Up to date · snapshot saved"; }
      status.querySelector("#sync-add-and-save")?.addEventListener("click", () => {
        const platform = { id: snapshot.source, label: snapshot.sourceLabel }; const classified = classifyTracks(diff.additions, result.playlist, snapshot.sourceUrl, platform); const additions = storeClassified(classified, platform); saveSnapshot(current);
        status.innerHTML = `<p><b>${additions.length} new tracks entered Inbox.</b> Snapshot saved. Removed source entries were not deleted locally.</p>`;
      });
      status.querySelector("#sync-save-only")?.addEventListener("click", () => { saveSnapshot(current); status.innerHTML = "<p><b>Snapshot saved without importing additions.</b> No local tracks, ratings or notes were deleted.</p>"; });
    } catch (error) { status.innerHTML = `<p class="empty-state">${safe(error instanceof Error ? error.message : "Could not sync this playlist.")}</p>`; }
    finally { button.disabled = false; button.textContent = "SYNC NOW"; }
  });
  document.querySelector(".inbox-entries")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-inbox-action]"); if (!button) return;
    const entries = read(inboxKey); const track = lifecycleTracks().find((item) => item.id === button.dataset.id); if (!track) return;
    if (button.dataset.inboxAction === "heard") updateLifecycle(track.id, "heard");
    if (button.dataset.inboxAction === "archive") archiveTrack(track.id);
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
