import { link, renderShell, setDocumentTitle } from "./modules/layout/shell.js?v=0.7.1";
import { withBase, withoutBase } from "./modules/layout/paths.js";
import { home } from "./modules/home.js";
import { archiveAlbumCompare, archiveAlbumDetail, archiveAlbums, archiveArtistDetail, archiveArtists, archiveCoverage, archiveHome, archiveTrackDetail, archiveTracks, bindArchive } from "./modules/archive/pages.js";
import { rateAlbum, rateHome, rateTrack, unratedQueue, bindRating } from "./modules/rating/pages.js";
import { antiRecommendation, bindTaste, blindSpotPage, compare, dna, familyTree, goodNotMine, philosophy, portrait, profile, sonicMap, tasteHome } from "./modules/taste/pages.js";
import { bindImport, importData, importHome, importInbox, importNetEase, importQQ, importQQAlbum } from "./modules/import/pages.js";
import { annualPortrait, bindJournal, bindYear, entropyPage, journal, journalEdit, memoryPalace, yearInMusic } from "./modules/journal/pages.js";
import { migrateLocalData } from "./modules/music/resilience.js";
import { bindSearch, searchPage } from "./modules/search/pages.js";
import { applyLanguage, bindLanguageToggle, observeLanguage } from "./modules/layout/i18n.js";

const app = document.getElementById("app");
const cleanPath = (path) => path.replace(/\/+$/, "") || "/";
const route = (path) => {
  const current = cleanPath(path);
  if (current === "/") return home();
  if (current === "/archive") return archiveHome();
  if (current === "/archive/tracks") return archiveTracks();
  if (current === "/archive/albums") return archiveAlbums();
  if (current === "/archive/compare/albums") return archiveAlbumCompare();
  if (current === "/archive/artists") return archiveArtists();
  if (current === "/archive/coverage") return archiveCoverage();
  if (/^\/archive\/tracks\/.+/.test(current)) return archiveTrackDetail(decodeURIComponent(current.split("/").pop()));
  if (/^\/archive\/albums\/.+/.test(current)) return archiveAlbumDetail(decodeURIComponent(current.split("/").pop()));
  if (/^\/archive\/artists\/.+/.test(current)) return archiveArtistDetail(decodeURIComponent(current.split("/").pop()));
  if (current === "/rate") return rateHome();
  if (current === "/rate/queue") return unratedQueue();
  if (/^\/rate\/track\/.+/.test(current)) return rateTrack(decodeURIComponent(current.split("/").pop()));
  if (/^\/rate\/album\/.+/.test(current)) return rateAlbum(decodeURIComponent(current.split("/").pop()));
  if (current === "/taste") return tasteHome();
  if (current === "/taste/philosophy") return philosophy();
  if (current === "/taste/profile") return profile();
  if (current === "/taste/good-not-mine") return goodNotMine();
  if (current === "/taste/compare") return compare();
  if (current === "/taste/dna") return dna();
  if (current === "/taste/blind-spots") return blindSpotPage();
  if (current === "/taste/anti-recommendation") return antiRecommendation();
  if (current === "/taste/sonic-map") return sonicMap();
  if (current === "/taste/family-tree") return familyTree();
  if (current === "/taste/portrait") return portrait();
  if (current === "/import") return importHome();
  if (current === "/import/qq") return importQQ();
  if (current === "/import/qq-album") return importQQAlbum();
  if (current === "/import/netease") return importNetEase();
  if (current === "/import/inbox") return importInbox();
  if (current === "/import/data") return importData();
  if (current === "/journal") return journal();
  if (current === "/search") return searchPage();
  if (/^\/journal\/edit\/.+/.test(current)) return journalEdit(decodeURIComponent(current.split("/").pop()));
  if (current === "/journal/memory-palace") return memoryPalace();
  if (current === "/journal/entropy") return entropyPage();
  if (/^\/journal\/year\/\d{4}\/portrait$/.test(current)) return annualPortrait(Number(current.split("/")[3]));
  if (/^\/journal\/year\/\d{4}$/.test(current)) return yearInMusic(Number(current.split("/").pop()));
  return `<section class="not-found"><span class="eyebrow mono">404</span><h1>That page is not in the archive.</h1>${link("/", "RETURN HOME", "button primary")}</section>`;
};

const navigate = (path, { replace = false } = {}) => {
  const requested = new URL(path, location.href);
  const target = cleanPath(withoutBase(requested.pathname));
  const browserPath = `${withBase(target)}${requested.search}${requested.hash}`;
  if (replace) history.replaceState({}, "", browserPath); else history.pushState({}, "", browserPath);
  render();
};
const parentRoute = (path) => {
  if (/^\/journal\/year\/\d{4}\/portrait$/.test(path)) return { href: path.replace(/\/portrait$/, ""), label: "BACK TO YEAR" };
  if (path === "/archive/compare/albums") return { href: "/archive/albums", label: "BACK TO ALBUMS" };
  if (/^\/archive\/(tracks|albums|artists)\/.+/.test(path)) {
    const section = path.split("/")[2];
    return { href: "/archive/" + section, label: "BACK TO " + section.toUpperCase() };
  }
  if (path === "/archive") return { href: "/", label: "BACK HOME" };
  if (/^\/archive\/(tracks|albums|artists|coverage)$/.test(path)) return { href: "/archive", label: "BACK TO ARCHIVE" };
  if (/^\/(taste|import|journal)\/.+/.test(path)) return { href: "/" + path.split("/")[1], label: "BACK TO " + path.split("/")[1].toUpperCase() };
  if (/^\/(taste|import|journal|rate)$/.test(path)) return { href: "/", label: "BACK HOME" };
  if (/^\/rate\/.+/.test(path)) return { href: "/rate", label: "BACK TO RATE" };
  return { href: "/", label: "BACK HOME" };
};
const render = () => {
  const path = cleanPath(withoutBase(location.pathname));
  renderShell(path);
  app.dataset.route = path;
  const parent = parentRoute(path);
  const back = path === "/" ? "" : link(parent.href, `← ${parent.label}`, "back-button");
  app.innerHTML = back + route(path);
  const pageTitle = path === "/" ? "Home" : app.querySelector("h1")?.textContent.trim() || "Page"; setDocumentTitle(pageTitle);
  const description = `${pageTitle} — personal listening evidence in How I Hear Music.`; const publicUrl = new URL(withBase(path), "https://andrewyy5178.github.io").href; document.querySelector('link[rel="canonical"]')?.setAttribute("href", publicUrl); document.querySelector('meta[property="og:url"]')?.setAttribute("content", publicUrl); document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle); document.querySelector('meta[property="og:description"]')?.setAttribute("content", description); document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", pageTitle); document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description); document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  app.focus({ preventScroll: true });
  bindArchive(path, navigate);
  bindRating(path, navigate);
  bindImport(path, navigate);
  bindJournal(path, navigate);
  bindYear(path, navigate);
  bindTaste(path, navigate);
  bindSearch(path, navigate);
  bindLanguageToggle(() => setDocumentTitle(pageTitle));
  applyLanguage();
};

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[data-route]");
  if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === "_blank") return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  navigate(url.pathname + url.search);
  window.scrollTo({ top: 0, behavior: "instant" });
});
window.addEventListener("popstate", render);

const restorePagesRoute = () => {
  const parameters = new URLSearchParams(location.search);
  const recovered = parameters.get("route");
  if (recovered?.startsWith("/")) {
    const target = new URL(recovered, location.origin);
    navigate(`${target.pathname}${target.search}${target.hash}`, { replace: true });
    return true;
  }
  const current = cleanPath(withoutBase(location.pathname));
  const legacy = location.hash.match(/^#(archive|rate|taste|import|journal)(\/.*)?$/);
  if (current === "/" && legacy) {
    navigate(`/${legacy[1]}${legacy[2] || ""}`, { replace: true });
    return true;
  }
  return false;
};

migrateLocalData();
if (!restorePagesRoute()) render();
observeLanguage();

const registerOfflineShell = async () => {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  try {
    const registration = await navigator.serviceWorker.register(new URL("./sw.js", import.meta.url), { scope: new URL("./", import.meta.url).pathname }); const banner = document.getElementById("update-banner"); const showUpdate = (worker) => { if (!worker || !navigator.serviceWorker.controller) return; banner.hidden = false; document.getElementById("apply-update").onclick = () => worker.postMessage("SKIP_WAITING"); };
    if (registration.waiting) showUpdate(registration.waiting);
    registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", () => { if (registration.installing?.state === "installed") showUpdate(registration.installing); }));
    let refreshing = false; navigator.serviceWorker.addEventListener("controllerchange", () => { if (refreshing) return; refreshing = true; location.reload(); });
  } catch (error) { console.warn("Offline shell registration failed.", error); }
};
registerOfflineShell();
