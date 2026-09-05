import { data, safe } from "../music/data.js";
import { accountNickname, saveAccountNickname } from "../music/account.js";
import { beginGithubSync, clearNicknamePrompt, completeEmailSignIn, readSyncStatus, requestEmailCode, signOutSync, syncSession } from "../music/cloud-sync.js";
import { withBase } from "./paths.js";
import { currentLanguage, translateText } from "./i18n.js";

const appVersion = "0.9.51";

const nav = [
  ["/", "Home"], ["/archive", "Archive"], ["/rate", "Rate"], ["/taste", "Taste"], ["/import", "Import"],
];
const mobileNav = [
  ["/", "Home", "home"], ["/archive", "Archive", "archive"], ["/rate", "Rate", "rate"], ["/taste", "Taste", "taste"], ["/import", "Import", "import"],
];
const mobileNavIcon = (name) => {
  const paths = {
    home: '<path d="M4 10.5 12 4l8 6.5v8.5H4z"/><path d="M9 20v-5h6v5"/>',
    archive: '<path d="M4 5h16v14H4z"/><path d="M7 9h10M7 13h10M7 17h6"/>',
    rate: '<path d="M12 3 20 8v8l-8 5-8-5V8z"/><path d="M7.5 15.5 12 8l4.5 7.5z"/>',
    taste: '<path d="M5 7c2.5-3 12.5-3 14 0v10c-1.5 3-11.5 3-14 0z"/><path d="M8 11c2-2 6-2 8 0M8 15c2 2 6 2 8 0"/>',
    import: '<path d="M4 5h16v14H4z"/><path d="M8 12h8M12 8v8"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
};
const pathIsActive = (path, href) => path === href || (href !== "/" && path.startsWith(href));
const mobileShell = (path) => {
  const mobileLink = (href, label, iconName) => `<a class="mobile-tab${pathIsActive(path, href) ? " active" : ""}${href === "/rate" ? " mobile-tab-rate" : ""}" href="${withBase(href)}" data-route>${mobileNavIcon(iconName)}<span>${safe(label)}</span></a>`;
  return `<nav class="mobile-tabbar" aria-label="Mobile primary navigation">${mobileNav.map(([href, label, iconName]) => mobileLink(href, label, iconName)).join("")}</nav>`;
};
const accountShell = () => {
  const session = syncSession(); const signedIn = Boolean(session?.token && session?.user?.login);
  const nickname = signedIn ? accountNickname(session.user.id) : "";
  const title = signedIn ? `Hello, ${safe(nickname || session.user.login)}.` : "Sign in or register.";
  const copy = "";
  const actions = signedIn ? `<button class="button" type="button" data-account-sign-out>SIGN OUT</button>` : `<div class="account-login-options"><button class="button primary" type="button" data-account-sign-in aria-label="Sign in with GitHub">GITHUB</button><button class="button" type="button" data-account-email-sign-in aria-label="Sign in with email">EMAIL</button></div>`;
  const nicknameForm = signedIn ? `<form class="account-nickname-form"><div class="account-nickname-row"><span class="mono account-nickname-label">NICKNAME</span><input name="nickname" aria-label="Nickname" value="${safe(nickname)}" maxlength="24" autocomplete="nickname" placeholder="How should this archive address you?" required><button class="text-action" type="submit">SAVE</button></div></form>` : "";
  const emailFlow = signedIn ? "" : `<div class="account-email-flow" hidden><form class="account-email-request"><label><span class="mono">EMAIL</span><input name="email" type="email" autocomplete="email" inputmode="email" required placeholder="you@example.com"></label><button class="button primary" type="submit">SEND CODE</button></form><form class="account-email-verify" hidden><label><span class="mono">CODE</span><input name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="000000"></label><button class="button primary" type="submit">VERIFY</button></form></div>`;
  return `<section class="account-panel" id="account-panel" role="dialog" aria-modal="false" aria-labelledby="account-panel-title" hidden><div class="account-panel-head"><span class="eyebrow mono">ACCOUNT / AUTO SYNC</span></div><h2 class="account-panel-title${signedIn ? "" : " account-signed-out"}" id="account-panel-title" tabindex="-1">${title}</h2>${copy ? `<p>${copy}</p>` : ""}${nicknameForm}${signedIn ? `<div class="account-identity"><span class="mono">${session.user.provider === "email" ? "EMAIL IDENTITY" : "GITHUB IDENTITY"}</span><strong>${session.user.provider === "email" ? safe(session.user.login) : `@${safe(session.user.login)}`}</strong></div>` : ""}<div class="account-actions">${actions}</div>${emailFlow}<p class="account-status mono" id="account-status" aria-live="polite">${signedIn ? "Checking account sync…" : ""}</p><div class="account-version-row"><span class="account-version mono">v${appVersion}</span><button class="account-version-check mono" type="button" data-check-update>CHECK FOR UPDATES</button></div></section>`;
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
  header.innerHTML = `<div class="brand-account"><a class="brand" href="${withBase("/")}" data-route>HIM <span>/</span></a><span class="brand-mark">anddream</span></div><div class="header-mobile-actions">${accountControl(true)}${languageControl(true)}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">MENU</button></div><nav class="primary-nav" id="primary-nav">${nav.map(([href, label]) => link(href, label, pathIsActive(path, href) ? "active" : "")).join("")}</nav><div class="header-end">${languageControl()}${accountControl()}</div>${accountShell()}${mobileShell(path)}`;
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
  const accountToggles = [...header.querySelectorAll(".account-toggle")]; const accountPanel = header.querySelector("#account-panel");
  const visibleAccountToggle = () => accountToggles.find((button) => {
    const bounds = button.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0;
  }) || accountToggles[0];
  const closeAccount = () => { accountPanel.hidden = true; clearNicknamePrompt(); accountToggles.forEach((button) => button.setAttribute("aria-expanded", "false")); };
  const openAccount = async ({ focusNickname = false } = {}) => { accountPanel.hidden = false; accountToggles.forEach((button) => button.setAttribute("aria-expanded", "true")); (focusNickname ? accountPanel.querySelector('[name="nickname"]') : accountPanel.querySelector("h2"))?.focus(); if (!syncSession()?.token) return; const status = accountPanel.querySelector("#account-status"); try { const remote = await readSyncStatus(); status.textContent = remote.updatedAt ? `SYNCED · ${new Date(remote.updatedAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}` : "Your first local change will create the shared archive."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not check account sync."; } };
  accountToggles.forEach((button) => button.addEventListener("click", () => accountPanel.hidden ? openAccount() : closeAccount()));
  accountPanel.querySelector("[data-account-sign-in]")?.addEventListener("click", () => { try { beginGithubSync(); } catch (error) { accountPanel.querySelector("#account-status").textContent = error instanceof Error ? error.message : "Could not start GitHub sign-in."; } });
  const emailFlow = accountPanel.querySelector(".account-email-flow"); const emailRequestForm = accountPanel.querySelector(".account-email-request"); const emailVerifyForm = accountPanel.querySelector(".account-email-verify"); let emailChallenge = "";
  accountPanel.querySelector("[data-account-email-sign-in]")?.addEventListener("click", () => { emailFlow.hidden = false; accountPanel.querySelector(".account-login-options").hidden = true; emailRequestForm.querySelector("input")?.focus(); });
  emailRequestForm?.addEventListener("submit", async (event) => { event.preventDefault(); const button = event.currentTarget.querySelector("button"); const status = accountPanel.querySelector("#account-status"); button.disabled = true; status.textContent = translateText("Sending sign-in code…"); try { const result = await requestEmailCode(new FormData(event.currentTarget).get("email")); emailChallenge = result.challenge; emailRequestForm.hidden = true; emailVerifyForm.hidden = false; emailVerifyForm.querySelector("input")?.focus(); status.textContent = translateText("Code sent. It expires in 10 minutes."); } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not send an email sign-in code."; } finally { button.disabled = false; } });
  emailVerifyForm?.addEventListener("submit", async (event) => { event.preventDefault(); const button = event.currentTarget.querySelector("button"); const status = accountPanel.querySelector("#account-status"); button.disabled = true; status.textContent = translateText("Checking code…"); try { await completeEmailSignIn(emailChallenge, new FormData(event.currentTarget).get("code")); location.reload(); } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not complete email sign-in."; button.disabled = false; } });
  accountPanel.querySelector("[data-check-update]")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("how-i-hear-music:check-update")));
  accountPanel.querySelector(".account-nickname-form")?.addEventListener("submit", (event) => { event.preventDefault(); const status = accountPanel.querySelector("#account-status"); try { const saved = saveAccountNickname(session.user.id, new FormData(event.currentTarget).get("nickname")); clearNicknamePrompt(); accountToggles.forEach((button) => { button.textContent = saved; button.classList.add("has-nickname"); button.setAttribute("data-i18n-ignore", ""); }); accountPanel.querySelector("#account-panel-title").textContent = `Hello, ${saved}.`; status.textContent = "Nickname saved · automatic sync queued."; } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not save the nickname."; } });
  accountPanel.querySelector("[data-account-sign-out]")?.addEventListener("click", async () => { const status = accountPanel.querySelector("#account-status"); try { await signOutSync(); renderShell(path); } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not sign out."; } });
  header.addEventListener("keydown", (event) => { if (event.key !== "Escape") return; if (!accountPanel.hidden) { closeAccount(); visibleAccountToggle().focus(); } });
  if (session?.promptNickname && !nickname) { clearNicknamePrompt(); openAccount({ focusNickname: true }); queueMicrotask(() => accountPanel.querySelector('[name="nickname"]')?.focus()); }
  setDocumentTitle(path === "/" ? "Home" : path.split("/").filter(Boolean).map((item) => item[0].toUpperCase() + item.slice(1)).join(" / "));
};
