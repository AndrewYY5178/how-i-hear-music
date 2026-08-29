import { data, safe } from "../music/data.js";

const nav = [
  ["/", "Home"], ["/archive", "Archive"], ["/rate", "Rate"], ["/taste", "Taste"], ["/import", "Import"], ["/journal", "Journal"],
];
export const link = (href, label, className = "") => `<a class="${className}" href="${href}" data-route>${safe(label)}</a>`;
export const pageHeader = (eyebrow, title, copy = "", actions = "") => `<section class="page-head"><span class="eyebrow mono">${safe(eyebrow)}</span><h1>${title}</h1>${copy ? `<p>${safe(copy)}</p>` : ""}${actions ? `<div class="page-actions">${actions}</div>` : ""}</section>`;
export const secondaryNav = (items) => `<nav class="secondary-nav" aria-label="Section navigation">${items.map(([href, label]) => link(href, label)).join("")}</nav>`;

export const renderShell = (path) => {
  const header = document.getElementById("site-header");
  const moduleName = path.split("/").filter(Boolean)[0] || "home";
  document.body.dataset.module = moduleName;
  header.classList.remove("menu-open");
  header.innerHTML = `<a class="brand" href="/" data-route>HIM <span>/</span> 001</a><button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav">MENU</button><nav class="primary-nav" id="primary-nav">${nav.map(([href, label]) => link(href, label, path === href || (href !== "/" && path.startsWith(href)) ? "active" : "")).join("")}</nav><div class="header-end"><span class="brand-mark">anddream</span><span class="edition mono">READ / 20—</span></div>`;
  document.getElementById("site-footer").innerHTML = `<span>HOW I HEAR MUSIC</span><span class="mono">PERSONAL ARCHIVE / ISSUE 001</span><a href="/taste/philosophy" data-route>METHOD ↗</a>`;
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
  document.title = `${data.profile.title} — ${path === "/" ? "Home" : path.split("/").filter(Boolean).map((item) => item[0].toUpperCase() + item.slice(1)).join(" / ")}`;
};
