import { data, safe } from "../music/data.js";
import { withBase } from "./paths.js";
import { currentLanguage, translateText } from "./i18n.js";

const nav = [
  ["/", "Home"], ["/archive", "Archive"], ["/rate", "Rate"], ["/taste", "Taste"], ["/import", "Import"], ["/journal", "Journal"],
];
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
  header.innerHTML = `<a class="brand" href="${withBase("/")}" data-route>HIM <span>/</span> 001</a><div class="header-mobile-actions">${languageControl(true)}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">MENU</button></div><nav class="primary-nav" id="primary-nav">${nav.map(([href, label]) => link(href, label, path === href || (href !== "/" && path.startsWith(href)) ? "active" : "")).join("")}${link("/search", "Search", path === "/search" ? "utility-search active" : "utility-search")}</nav><div class="header-end">${link("/search", "SEARCH", path === "/search" ? "header-search active" : "header-search")}${languageControl()}<span class="brand-mark">anddream</span></div>`;
  document.getElementById("site-footer").innerHTML = `<span>HOW I HEAR MUSIC</span><span class="mono">PERSONAL ARCHIVE / ISSUE 001</span>${link("/taste/philosophy", "METHOD ↗")}`;
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
  setDocumentTitle(path === "/" ? "Home" : path.split("/").filter(Boolean).map((item) => item[0].toUpperCase() + item.slice(1)).join(" / "));
};
