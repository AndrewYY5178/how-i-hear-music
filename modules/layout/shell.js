import { data, safe } from "../music/data.js";
import { withBase } from "./paths.js";
import { currentLanguage, translateText } from "./i18n.js";

const nav = [
  ["/", "Home"], ["/archive", "Archive"], ["/rate", "Rate"], ["/taste", "Taste"], ["/import", "Import"], ["/journal", "Journal"],
];
const mobileNav = [
  ["/", "Home", "home"], ["/archive", "Archive", "archive"], ["/rate", "Rate", "rate"], ["/taste", "Taste", "taste"],
];
const mobileNavIcon = (name) => {
  const paths = {
    home: '<path d="M4 10.5 12 4l8 6.5v8.5H4z"/><path d="M9 20v-5h6v5"/>',
    archive: '<path d="M4 5h16v14H4z"/><path d="M7 9h10M7 13h10M7 17h6"/>',
    rate: '<path d="M12 3 20 8v8l-8 5-8-5V8z"/><path d="M7.5 15.5 12 8l4.5 7.5z"/>',
    taste: '<path d="M5 7c2.5-3 12.5-3 14 0v10c-1.5 3-11.5 3-14 0z"/><path d="M8 11c2-2 6-2 8 0M8 15c2 2 6 2 8 0"/>',
    more: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
};
const pathIsActive = (path, href) => path === href || (href !== "/" && path.startsWith(href));
const mobileShell = (path) => {
  const moreActive = ["/import", "/journal", "/search"].some((href) => pathIsActive(path, href));
  const mobileLink = (href, label, iconName) => `<a class="mobile-tab${pathIsActive(path, href) ? " active" : ""}${href === "/rate" ? " mobile-tab-rate" : ""}" href="${withBase(href)}" data-route>${mobileNavIcon(iconName)}<span>${safe(label)}</span></a>`;
  return `<div class="mobile-more-panel" id="mobile-more-panel" hidden aria-label="More destinations">${link("/import", "Import", pathIsActive(path, "/import") ? "active" : "")}${link("/journal", "Journal", pathIsActive(path, "/journal") ? "active" : "")}${link("/search", "Search", path === "/search" ? "active" : "")}</div><nav class="mobile-tabbar" aria-label="Mobile primary navigation">${mobileNav.map(([href, label, iconName]) => mobileLink(href, label, iconName)).join("")}<button class="mobile-tab mobile-tab-more${moreActive ? " active" : ""}" type="button" data-mobile-more aria-expanded="false" aria-controls="mobile-more-panel">${mobileNavIcon("more")}<span>More</span></button></nav>`;
};
export const link = (href, label, className = "") => `<a class="${className}" href="${withBase(href)}" data-route>${safe(label)}</a>`;
export const pageHeader = (eyebrow, title, copy = "", actions = "") => `<section class="page-head"><span class="eyebrow mono">${safe(eyebrow)}</span><h1>${title}</h1>${copy ? `<p>${safe(copy)}</p>` : ""}${actions ? `<div class="page-actions">${actions}</div>` : ""}</section>`;
export const secondaryNav = (items) => `<nav class="secondary-nav" aria-label="Section navigation">${items.map(([href, label]) => link(href, label)).join("")}</nav>`;
export const setDocumentTitle = (label = "Home") => { document.title = `${data.profile.title} — ${translateText(String(label))}`; };

export const renderShell = (path) => {
  const header = document.getElementById("site-header");
  const moduleName = path.split("/").filter(Boolean)[0] || "home";
  document.body.dataset.module = moduleName;
  header.classList.remove("menu-open");
  const languageControl = (mobile = false) => `<button class="language-toggle${mobile ? " language-toggle-mobile" : ""}" type="button" data-language-toggle data-i18n-ignore aria-pressed="${currentLanguage() === "zh-CN"}" aria-label="${currentLanguage() === "zh-CN" ? "Switch to English" : "切换到中文"}">${currentLanguage() === "zh-CN" ? "EN" : "中文"}</button>`;
  header.innerHTML = `<a class="brand" href="${withBase("/")}" data-route>HIM <span>/</span> 001</a><div class="header-mobile-actions">${languageControl(true)}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">MENU</button></div><nav class="primary-nav" id="primary-nav">${nav.map(([href, label]) => link(href, label, pathIsActive(path, href) ? "active" : "")).join("")}${link("/search", "Search", path === "/search" ? "utility-search active" : "utility-search")}</nav><div class="header-end">${link("/search", "SEARCH", path === "/search" ? "header-search active" : "header-search")}${languageControl()}<span class="brand-mark">anddream</span></div>${mobileShell(path)}`;
  document.getElementById("site-footer").innerHTML = `<span>HOW I HEAR MUSIC</span><span class="mono">PERSONAL ARCHIVE / ISSUE 001</span>`;
  const toggle = header.querySelector(".menu-toggle");
  toggle.addEventListener("click", (event) => {
    const open = header.classList.toggle("menu-open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
  });
  header.onkeydown = (event) => {
    if (event.key !== "Escape" || !header.classList.contains("menu-open")) return;
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  };
  const more = header.querySelector("[data-mobile-more]");
  const morePanel = header.querySelector("#mobile-more-panel");
  const closeMore = () => { morePanel.hidden = true; more.setAttribute("aria-expanded", "false"); };
  more.addEventListener("click", () => {
    const open = morePanel.hidden;
    morePanel.hidden = !open;
    more.setAttribute("aria-expanded", String(open));
  });
  morePanel.addEventListener("click", closeMore);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !morePanel.hidden) { closeMore(); more.focus(); } }, { once: true });
  setDocumentTitle(path === "/" ? "Home" : path.split("/").filter(Boolean).map((item) => item[0].toUpperCase() + item.slice(1)).join(" / "));
};
