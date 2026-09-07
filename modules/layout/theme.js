const storageKey = "how-i-hear-music:theme:v1";
const themes = new Set(["paper", "chromatic"]);

const readTheme = () => {
  try {
    const saved = localStorage.getItem(storageKey);
    return themes.has(saved) ? saved : "paper";
  } catch {
    return "paper";
  }
};

let theme = readTheme();

export const currentTheme = () => theme;

export const applyTheme = () => {
  if (typeof document === "undefined" || !document.documentElement) return;
  document.documentElement.dataset.theme = theme;
  if (document.body) document.body.dataset.theme = theme;
  document.querySelectorAll?.("[data-theme-option]").forEach((button) => {
    const selected = button.dataset.themeOption === theme;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "chromatic" ? "#dedede" : "#e7dfcf");
};

export const setTheme = (next) => {
  theme = themes.has(next) ? next : "paper";
  try { localStorage.setItem(storageKey, theme); } catch {}
  applyTheme();
  window.dispatchEvent(new CustomEvent("how-i-hear-music:theme-change", { detail: { theme } }));
};

export const bindThemeControls = (root = document) => {
  root.querySelectorAll?.("[data-theme-option]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      setTheme(button.dataset.themeOption);
    };
  });
  applyTheme();
};

applyTheme();
