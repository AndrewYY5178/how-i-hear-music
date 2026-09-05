let stopMotion = () => {};

const staggerSelectors = [
  ".album-grid > .album-card",
  ".track-grid > .track-card",
  ".artist-grid > article",
  ".global-search-results article",
  ".year-grid > article",
  ".memory-zone",
  ".taste-dna > article",
  ".blind-spots > article",
  ".album-preview-track",
  ".catalog-results > article",
];

const observedSelectors = [
  ".rediscover",
  ".journal-year-link",
  ".journal-list > article",
  ".year-grid > article",
  ".memory-zone",
  ".taste-dna article",
  ".blind-spots article",
  ".listening-portrait",
  ".global-search-results article",
  ".album-preview-track",
];

const stampResult = (node) => {
  if (!node || !node.textContent.trim()) return;
  const text = node.textContent.toUpperCase();
  if (/SAVED|COMPLETE|ARCHIVED|ADDED|已保存|已入档|导入完成/.test(text)) {
    node.classList.remove("motion-stamped");
    void node.offsetWidth;
    node.classList.add("motion-stamped");
  }
  [...node.querySelectorAll(".album-preview-track, .catalog-results > article")].forEach((item, index) => item.style.setProperty("--motion-index", index));
};

export const bindLivingMotion = (root, path) => {
  stopMotion();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];
  document.body.dataset.motionRoute = path;

  staggerSelectors.forEach((selector) => root.querySelectorAll(selector).forEach((node, index) => node.style.setProperty("--motion-index", index)));

  if (!reduced) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("motion-visible");
      observer.unobserve(entry.target);
    }), { threshold: 0.14, rootMargin: "0px 0px -6%" });
    root.querySelectorAll(observedSelectors.join(",")).forEach((node) => {
      node.classList.add("motion-observed");
      observer.observe(node);
    });
    cleanups.push(() => observer.disconnect());

    if (path === "/" || /^\/journal\/year\//.test(path) || path === "/taste/dna") {
      const columns = document.createElement("div");
      columns.className = "editorial-motion-columns";
      columns.setAttribute("aria-hidden", "true");
      columns.innerHTML = "<i></i>".repeat(6);
      root.prepend(columns);
      const timer = setTimeout(() => columns.remove(), 1100);
      cleanups.push(() => { clearTimeout(timer); columns.remove(); });
    }
  }

  const dynamicTargets = ["rate-save-message", "album-save-message", "qq-album-import-result", "qq-import-result", "netease-import-result", "sync-status"];
  dynamicTargets.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    const observer = new MutationObserver(() => stampResult(node));
    observer.observe(node, { childList: true, subtree: true, characterData: true });
    cleanups.push(() => observer.disconnect());
  });

  stopMotion = () => cleanups.forEach((cleanup) => cleanup());
};
