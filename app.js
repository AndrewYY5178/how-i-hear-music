import { renderShell } from "./modules/layout/shell.js";
import { home } from "./modules/home.js";
import { archiveAlbumDetail, archiveAlbums, archiveArtistDetail, archiveArtists, archiveHome, archiveTrackDetail, archiveTracks, bindArchive } from "./modules/archive/pages.js";
import { rateAlbum, rateHome, rateTrack, bindRating } from "./modules/rating/pages.js";
import { compare, goodNotMine, philosophy, profile, tasteHome } from "./modules/taste/pages.js";
import { bindImport, importHome, importInbox, importQQ } from "./modules/import/pages.js";
import { journal } from "./modules/journal/pages.js";

const app = document.getElementById("app");
const cleanPath = (path) => path.replace(/\/+$/, "") || "/";
const route = (path) => {
  const current = cleanPath(path);
  if (current === "/") return home();
  if (current === "/archive") return archiveHome();
  if (current === "/archive/tracks") return archiveTracks();
  if (current === "/archive/albums") return archiveAlbums();
  if (current === "/archive/artists") return archiveArtists();
  if (/^\/archive\/tracks\/.+/.test(current)) return archiveTrackDetail(decodeURIComponent(current.split("/").pop()));
  if (/^\/archive\/albums\/.+/.test(current)) return archiveAlbumDetail(decodeURIComponent(current.split("/").pop()));
  if (/^\/archive\/artists\/.+/.test(current)) return archiveArtistDetail(decodeURIComponent(current.split("/").pop()));
  if (current === "/rate") return rateHome();
  if (/^\/rate\/track\/.+/.test(current)) return rateTrack(decodeURIComponent(current.split("/").pop()));
  if (/^\/rate\/album\/.+/.test(current)) return rateAlbum(decodeURIComponent(current.split("/").pop()));
  if (current === "/taste") return tasteHome();
  if (current === "/taste/philosophy") return philosophy();
  if (current === "/taste/profile") return profile();
  if (current === "/taste/good-not-mine") return goodNotMine();
  if (current === "/taste/compare") return compare();
  if (current === "/import") return importHome();
  if (current === "/import/qq") return importQQ();
  if (current === "/import/inbox") return importInbox();
  if (current === "/journal") return journal();
  return `<section class="not-found"><span class="eyebrow mono">404</span><h1>That page is not in the archive.</h1><a href="/" data-route class="button primary">RETURN HOME</a></section>`;
};

const navigate = (path, { replace = false } = {}) => {
  const target = cleanPath(path);
  if (replace) history.replaceState({}, "", target); else history.pushState({}, "", target);
  render();
};
const parentRoute = (path) => {
  if (/^\/archive\/(tracks|albums|artists)\/.+/.test(path)) {
    const section = path.split("/")[2];
    return { href: "/archive/" + section, label: "BACK TO " + section.toUpperCase() };
  }
  if (path === "/archive") return { href: "/", label: "BACK HOME" };
  if (/^\/archive\/(tracks|albums|artists)$/.test(path)) return { href: "/archive", label: "BACK TO ARCHIVE" };
  if (/^\/(taste|import)\/.+/.test(path)) return { href: "/" + path.split("/")[1], label: "BACK TO " + path.split("/")[1].toUpperCase() };
  if (/^\/(taste|import|journal|rate)$/.test(path)) return { href: "/", label: "BACK HOME" };
  if (/^\/rate\/.+/.test(path)) return { href: "/rate", label: "BACK TO RATE" };
  return { href: "/", label: "BACK HOME" };
};
const render = () => {
  const path = cleanPath(location.pathname);
  renderShell(path);
  app.dataset.route = path;
  const parent = parentRoute(path);
  const back = path === "/" ? "" : `<a class="back-button" href="${parent.href}" data-route>← ${parent.label}</a>`;
  app.innerHTML = back + route(path);
  app.focus({ preventScroll: true });
  bindArchive(path);
  bindRating(path, navigate);
  bindImport(path, navigate);
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
render();
