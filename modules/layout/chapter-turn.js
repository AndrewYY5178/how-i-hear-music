import { curlPoint, pageCurlFrame } from './page-curl.js';

export const chapters = ['/', '/archive', '/rate', '/taste', '/import'];
export const chapterIndex = (path) => path === '/' ? 0 : chapters.findIndex((root, i) => i > 0 && (path === root || path.startsWith(`${root}/`)));
export const chapterJourney = (from, to) => {
  const a = chapterIndex(from), b = chapterIndex(to);
  const count = a < 0 || b < 0 ? 0 : Math.abs(b - a);
  return { count, direction: b >= a ? 1 : -1, duration: count ? 1000 + (count - 1) * 150 : 0 };
};
let active = null;
let audio = null;
const soundKey = 'how-i-hear-music:paper-sound:v1';
export const paperSoundEnabled = () => { try { return localStorage.getItem(soundKey) !== 'off'; } catch { return true; } };
export function bindPaperSound() {
  document.querySelectorAll('[data-paper-sound]').forEach(button => {
    button.setAttribute('aria-pressed', String(paperSoundEnabled()));
    button.onclick = () => {
      const enabled = !paperSoundEnabled();
      try { localStorage.setItem(soundKey, enabled ? 'on' : 'off'); } catch { /* private mode */ }
      button.setAttribute('aria-pressed', String(enabled));
      if (!enabled) audio?.suspend().catch(() => {});
    };
  });
}
function prepareSound() {
  if (!paperSoundEnabled()) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (Audio) { audio ||= new Audio(); audio.resume().catch(() => {}); }
  } catch { /* Sound must never gate navigation. */ }
}
function rustle() {
  if (!paperSoundEnabled() || audio?.state !== 'running' || document.hidden) return;
  const length = Math.floor(audio.sampleRate * .24);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / length) ** 2;
  const source = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain();
  source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 1250; filter.Q.value = .55;
  gain.gain.value = .022;
  source.connect(filter).connect(gain).connect(audio.destination); source.start();
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
}

// Clip the native outgoing page at the moving fold. Text stays native/sharp;
// only the blank paper backs and curved fold are rendered by WebGL.
export function unturnedPolygon(frame, width, height, direction = 1) {
  const points = [[0, 0], [width, 0], [width, height], [0, height]];
  const distance = ([x, y]) => (direction * (x - width / 2)) * frame.nx + (height / 2 - y) * frame.ny - frame.crease;
  const clipped = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length], da = distance(a), db = distance(b);
    if (da <= 0) clipped.push(a);
    if ((da <= 0) !== (db <= 0)) { const t = da / (da - db); clipped.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
  }
  return clipped.length ? `polygon(${clipped.map(([x, y]) => `${x}px ${y}px`).join(',')})` : 'polygon(0 0,0 0,0 0)';
}

export function cancelChapterTurn() { active?.finish(true); }
export async function turnChapter(from, to, commit, { sound = true } = {}) {
  cancelChapterTurn();
  const journey = chapterJourney(from, to);
  if (!journey.count || matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) { commit(); return; }
  if (sound) prepareSound();
  const width = innerWidth, height = innerHeight;
  const layer = document.createElement('div'); layer.className = 'chapter-turn'; layer.inert = true;
  layer.setAttribute('aria-hidden', 'true'); layer.setAttribute('data-i18n-ignore', ''); layer.dataset.direction = String(journey.direction); layer.dataset.sheets = String(journey.count);
  const outgoing = document.createElement('div'); outgoing.className = 'chapter-turn-native';
  // Clone only the rendered viewport shell. No input values are serialized or
  // retained after the turn, and no cloned node can receive input or execute.
  for (const id of ['site-header', 'app', 'site-footer']) {
    const source = document.getElementById(id); if (!source) continue;
    const box = source.getBoundingClientRect(); const clone = source.cloneNode(true);
    clone.querySelectorAll('script,canvas,.account-panel,.entry-intro').forEach(node => node.remove());
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    // Rename roots too: duplicate IDs would make route binders ambiguous.
    clone.removeAttribute('id'); clone.classList.add(`chapter-copy-${id}`);
    Object.assign(clone.style, { position: 'absolute', margin: '0', left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    outgoing.append(clone);
  }
  layer.append(outgoing);
  let renderer, geometry, texture, material, raf = 0, committed = false, settled = false;
  const sheets = [];
  const finish = (discard = false) => {
    if (settled) return; settled = true; cancelAnimationFrame(raf);
    layer.remove(); sheets.forEach(sheet => sheet.geometry.dispose()); renderer?.dispose(); renderer?.forceContextLoss(); geometry?.dispose(); material?.dispose(); texture?.dispose();
    window.removeEventListener('resize', finish); document.removeEventListener('visibilitychange', hidden);
    if (active?.finish === finish) active = null;
    if (!committed && discard !== true) { committed = true; commit(); }
  };
  const hidden = () => { if (document.hidden) { audio?.suspend().catch(() => {}); finish(); } };
  active = { finish };
  window.addEventListener('resize', finish); document.addEventListener('visibilitychange', hidden);
  const safety = setTimeout(finish, 3000);
  try {
    const T = await import('../../assets/vendor/three.module.min.js');
    if (settled) return;
    renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(width, height); renderer.setClearColor(0, 0);
    const scene = new T.Scene(), camera = new T.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, .1, 5000);
    camera.position.z = 2500;
    const paper = document.createElement('canvas'); paper.width = paper.height = 256;
    const ctx = paper.getContext('2d'); ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#e7dfcf'; ctx.fillRect(0, 0, 256, 256);
    // Neutral fibres: never introduce yellow into the grayscale theme.
    for (let i = 0; i < 4500; i++) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * .045})`; ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, Math.random() * 3 + 1); }
    texture = new T.CanvasTexture(paper); texture.colorSpace = T.SRGBColorSpace; texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.repeat.set(width / 256, height / 256);
    geometry = new T.PlaneGeometry(width, height, 100, 64);
    const base = geometry.attributes.position.array.slice();
    material = new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide, vertexColors: true });
    for (let i = 0; i < journey.count; i++) {
      const g = geometry.clone(); g.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(base.length).fill(1), 3));
      const sheet = new T.Mesh(g, material); sheet.position.z = (journey.count - i) * 3; sheet.frustumCulled = false; scene.add(sheet); sheets.push(sheet);
    }
    layer.prepend(renderer.domElement);
    committed = true; commit();
    // Bind the real destination before adding inert copies. Legacy binders
    // use document-wide selectors and must never attach to the outgoing copy.
    document.body.append(layer);
    const start = performance.now(); const sounded = new Set();
    const draw = now => {
      if (settled) return;
      const elapsed = now - start;
      sheets.forEach((sheet, index) => {
        const p = Math.max(0, Math.min(1, (elapsed - index * 150) / 1000));
        if (p > .06 && !sounded.has(index)) { sounded.add(index); if (sound) rustle(); }
        sheet.visible = p < 1;
        const frame = pageCurlFrame(p, width, height), positions = sheet.geometry.attributes.position.array, colors = sheet.geometry.attributes.color.array;
        for (let j = 0; j < base.length; j += 3) {
          const point = curlPoint(base[j] * journey.direction, base[j + 1], p, width, height, frame);
          positions[j] = point.x * journey.direction; positions[j + 1] = point.y; positions[j + 2] = point.z;
          const shade = 1 - Math.sin(point.curl * Math.PI) * .22;
          colors[j] = colors[j + 1] = colors[j + 2] = shade;
        }
        sheet.geometry.attributes.position.needsUpdate = true; sheet.geometry.attributes.color.needsUpdate = true;
        if (!index) outgoing.style.clipPath = unturnedPolygon(frame, width, height, journey.direction);
      });
      renderer.render(scene, camera);
      if (elapsed >= journey.duration) { clearTimeout(safety); finish(); }
      else raf = requestAnimationFrame(draw);
    };
    draw(start);
  } catch { finish(); }
  finally { if (settled) clearTimeout(safety); }
}
