import { data, safe } from "../music/data.js";
import { accountNickname, saveAccountNickname } from "../music/account.js";
import { beginGithubSync, clearNicknamePrompt, readSyncStatus, signOutSync, syncReady, syncSession } from "../music/cloud-sync.js";
import { withBase } from "./paths.js";
import { currentLanguage, translateText } from "./i18n.js";

const appVersion = "0.9.15";

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
const accountShell = () => {
  const session = syncSession(); const ready = syncReady(); const signedIn = Boolean(session?.token && session?.user?.login);
  const nickname = signedIn ? accountNickname(session.user.id) : "";
  const title = signedIn ? `Hello, ${safe(nickname || session.user.login)}.` : "GitHub account.";
  const copy = signedIn ? "" : "Authorize GitHub once to create one shared music archive.";
  const actions = signedIn ? `${link("/import/data", "DATA DESK", "button primary")}<button class="button" type="button" data-account-sign-out>SIGN OUT</button>` : ready ? `<button class="button primary" type="button" data-account-sign-in>REGISTER / SIGN IN WITH GITHUB</button>` : `<p class="account-unavailable">Account sign-in is available on the published site.</p>`;
  const nicknameForm = signedIn ? `<form class="account-nickname-form"><div class="account-nickname-row"><span class="mono account-nickname-label">NICKNAME</span><input name="nickname" aria-label="Nickname" value="${safe(nickname)}" maxlength="24" autocomplete="nickname" placeholder="How should this archive address you?" required><button class="text-action" type="submit">SAVE</button></div></form>` : "";
  return `<section class="account-panel" id="account-panel" role="dialog" aria-modal="false" aria-labelledby="account-panel-title" hidden><div class="account-panel-head"><span class="eyebrow mono">ACCOUNT / AUTO SYNC</span><button class="account-close" type="button" aria-label="Close account panel" data-account-close>×</button></div><h2 id="account-panel-title" tabindex="-1">${title}</h2>${copy ? `<p>${copy}</p>` : ""}${nicknameForm}${signedIn ? `<div class="account-identity"><span class="mono">GITHUB IDENTITY</span><strong>@${safe(session.user.login)}</strong></div>` : ""}<div class="account-actions">${actions}</div><p class="account-status mono" id="account-status" aria-live="polite">${signedIn ? "Checking account sync…" : "Registration and sign-in are handled securely by GitHub."}</p><div class="account-version-row"><span class="account-version mono">v${appVersion}</span><button class="account-version-check mono" type="button" data-check-update>CHECK FOR UPDATES</button></div></section>`;
};
export const link = (href, label, className = "") => `<a class="${className}" href="${withBase(href)}" data-route>${safe(label)}</a>`;
export const pageHeader = (_eyebrow, title, copy = "", actions = "") => `<section class="page-head"><h1>${title}</h1>${copy ? `<p>${safe(copy)}</p>` : ""}${actions ? `<div class="page-actions">${actions}</div>` : ""}</section>`;
export const secondaryNav = (items) => `<nav class="secondary-nav" aria-label="Section navigation">${items.map(([href, label]) => link(href, label)).join("")}</nav>`;
export const setDocumentTitle = (label = "Home") => { document.title = `${data.profile.title} — ${translateText(String(label))}`; };

export const renderShell = (path) => {
  const header = document.getElementById("site-header");
  const session = syncSession(); const nickname = session?.user?.id ? accountNickname(session.user.id) : "";
  const moduleName = path.split("/").filter(Boolean)[0] || "home";
  document.body.dataset.module = moduleName;
  header.classList.remove("menu-open");
  const languageControl = (mobile = false) => `<button class="language-toggle${mobile ? " language-toggle-mobile" : ""}" type="button" data-language-toggle data-i18n-ignore aria-pressed="${currentLanguage() === "zh-CN"}" aria-label="${currentLanguage() === "zh-CN" ? "Switch to English" : "切换到中文"}">${currentLanguage() === "zh-CN" ? "EN" : "中文"}</button>`;
  const accountControl = (mobile = false) => `<button class="account-toggle${mobile ? " account-toggle-mobile" : ""}${nickname ? " has-nickname" : ""}" type="button" aria-expanded="false" aria-controls="account-panel"${nickname ? " data-i18n-ignore" : ""}>${safe(nickname || "ACCOUNT")}</button>`;
  header.innerHTML = `<div class="brand-account"><a class="brand" href="${withBase("/")}" data-route>HIM <span>/</span></a><span class="brand-mark">anddream</span></div><div class="header-mobile-actions">${accountControl(true)}${languageControl(true)}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">MENU</button></div><nav class="primary-nav" id="primary-nav">${nav.map(([href, label]) => link(href, label, pathIsActive(path, href) ? "active" : "")).join("")}${link("/search", "Search", path === "/search" ? "utility-search active" : "utility-search")}</nav><div class="header-end">${link("/search", "SEARCH", path === "/search" ? "header-search active" : "header-search")}${languageControl()}${accountControl()}</div>${accountShell()}${mobileShell(path)}`;
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
  const accountToggles = [...header.querySelectorAll(".account-toggle")]; const accountPanel = header.querySelector("#account-panel");
  const visibleAccountToggle = () => accountToggles.find((button) => {
    const bounds = button.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0;
  }) || accountToggles[0];
  const closeAccount = () => { accountPanel.hidden = true; clearNicknamePrompt(); accountToggles.forEach((button) => button.setAttribute("aria-expanded", "false")); };
  const openAccount = async ({ focusNickname = false } = {}) => { accountPanel.hidden = false; accountToggles.forEach((button) => button.setAttribute("aria-expanded", "true")); (focusNickname ? accountPanel.querySelector('[name="nickname"]') : accountPanel.querySelector("h2"))?.focus(); if (!syncSession()?.token) return; const status = accountPanel.querySelector("#account-status"); try { const remote = await readSyncStatus(); status.textContent = remote.updatedAt ? `SYNCED · ${new Date(remote.updatedAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}` : "Your first local change will create the shared archive."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not check account sync."; } };
  accountToggles.forEach((button) => button.addEventListener("click", () => accountPanel.hidden ? openAccount() : closeAccount()));
  accountPanel.querySelector("[data-account-close]")?.addEventListener("click", () => { closeAccount(); visibleAccountToggle().focus(); });
  accountPanel.querySelector("[data-account-sign-in]")?.addEventListener("click", () => beginGithubSync());
  accountPanel.querySelector("[data-check-update]")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("how-i-hear-music:check-update")));
  accountPanel.querySelector(".account-nickname-form")?.addEventListener("submit", (event) => { event.preventDefault(); const status = accountPanel.querySelector("#account-status"); try { const saved = saveAccountNickname(session.user.id, new FormData(event.currentTarget).get("nickname")); clearNicknamePrompt(); accountToggles.forEach((button) => { button.textContent = saved; button.classList.add("has-nickname"); button.setAttribute("data-i18n-ignore", ""); }); accountPanel.querySelector("#account-panel-title").textContent = `Hello, ${saved}.`; status.textContent = "Nickname saved · automatic sync queued."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not save the nickname."; } });
  accountPanel.querySelector("[data-account-sign-out]")?.addEventListener("click", async () => { const status = accountPanel.querySelector("#account-status"); try { await signOutSync(); renderShell(path); } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not sign out."; } });
  header.addEventListener("keydown", (event) => { if (event.key !== "Escape") return; if (!accountPanel.hidden) { closeAccount(); visibleAccountToggle().focus(); } if (!morePanel.hidden) { closeMore(); more.focus(); } });
  if (session?.promptNickname && !nickname) { clearNicknamePrompt(); openAccount({ focusNickname: true }); queueMicrotask(() => accountPanel.querySelector('[name="nickname"]')?.focus()); }
  setDocumentTitle(path === "/" ? "Home" : path.split("/").filter(Boolean).map((item) => item[0].toUpperCase() + item.slice(1)).join(" / "));
};
