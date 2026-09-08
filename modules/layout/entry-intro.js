import { curlPoint, pageCurlFrame } from "./page-curl.js";
const INTRO_SESSION_KEY = "how-i-hear-music:entry-intro:v2";
const INTRO_DURATION = 4200;
const STRIP_COUNT = 24;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const readSessionFlag = () => {
  try { return sessionStorage.getItem(INTRO_SESSION_KEY) === "seen"; } catch { return false; }
};

const writeSessionFlag = () => {
  try { sessionStorage.setItem(INTRO_SESSION_KEY, "seen"); } catch {}
};

const shouldReplay = () => new URLSearchParams(location.search).get("intro") === "1";

const getIntroDuration = (intro) => intro?._entryIntroDuration || INTRO_DURATION;

const readIntroDuration = () => {
  const requested = Number(new URLSearchParams(location.search).get("introDuration"));
  return Number.isFinite(requested) && requested >= 1800 && requested <= 20000 ? requested : INTRO_DURATION;
};

const cancelAnimation = (intro) => {
  if (intro?._entryIntroFrame) {
    cancelAnimationFrame(intro._entryIntroFrame);
    intro._entryIntroFrame = 0;
  }
};

const disposeWebGL = (intro) => {
  const webgl = intro?._entryIntroWebGL;
  if (!webgl) return;
  webgl.resizeObserver?.disconnect();
  webgl.renderer?.dispose();
  webgl.renderer?.forceContextLoss?.();
  webgl.frontTexture?.dispose();
  webgl.backTexture?.dispose();
  webgl.geometry?.dispose();
  webgl.shadow?.geometry?.dispose();
  webgl.frontMaterial?.dispose();
  webgl.backMaterial?.dispose();
  webgl.shadowMaterial?.dispose();
  webgl.canvas?.remove();
  intro.classList.remove("has-webgl");
  intro._entryIntroWebGL = null;
};

const clearIntro = (intro, { remember = true } = {}) => {
  if (!intro) return;
  window.clearTimeout(intro._entryIntroTimer);
  cancelAnimation(intro);
  intro._entryIntroEvents?.abort();
  disposeWebGL(intro);
  disposeCanvas(intro);
  intro.querySelector(".entry-intro-native")?.remove();
  intro.classList.remove("is-active", "is-finishing");
  intro.hidden = true;
  intro.setAttribute("aria-hidden", "true");
  document.body.classList.remove("entry-intro-lock");
  document.body.removeAttribute("data-entry-intro");
  if (remember) writeSessionFlag();
};

const finishIntro = (intro) => {
  if (!intro || intro.hidden || intro.classList.contains("is-finishing")) return;
  intro.classList.add("is-finishing");
  cancelAnimation(intro);
  intro._entryIntroTimer = window.setTimeout(() => clearIntro(intro), 520);
};

const makeFlexibleSheet = (intro) => {
  if (intro._entryIntroStrips?.length) return;
  const sheet = intro.querySelector("[data-entry-intro-sheet]");
  const sourceFront = sheet?.querySelector(".entry-intro-sheet-front");
  const sourceBack = sheet?.querySelector(".entry-intro-sheet-back");
  if (!sheet || !sourceFront || !sourceBack) return;

  const flex = document.createElement("div");
  flex.className = "entry-intro-flex";
  flex.setAttribute("aria-hidden", "true");
  flex.style.setProperty("--strip-count", STRIP_COUNT);

  const strips = Array.from({ length: STRIP_COUNT }, (_, index) => {
    const strip = document.createElement("div");
    strip.className = "entry-intro-strip";
    strip.style.setProperty("--strip-index", index);

    const front = document.createElement("div");
    front.className = "entry-intro-strip-face entry-intro-strip-front";
    front.innerHTML = sourceFront.innerHTML;
    front.style.setProperty("--strip-index", index);

    const back = document.createElement("div");
    back.className = "entry-intro-strip-face entry-intro-strip-back";
    back.innerHTML = "";
    back.style.setProperty("--strip-index", index);

    strip.append(front, back);
    flex.append(strip);
    return { strip, front, back };
  });

  sheet.append(flex);
  sheet.classList.add("has-flex");
  intro._entryIntroStrips = strips;
  intro._entryIntroFlex = flex;
};

const renderFlexibleSheet = (intro, elapsed) => {
  const sheet = intro.querySelector("[data-entry-intro-sheet]");
  const backdrop = intro.querySelector("[data-entry-intro-backdrop]");
  const flex = intro._entryIntroFlex;
  const strips = intro._entryIntroStrips;
  if (!sheet || !backdrop || !flex || !strips?.length) return;

  const progress = clamp(elapsed / getIntroDuration(intro));
  const focus = ease(progress / 0.29);
  const turn = ease((progress - 0.23) / 0.77);
  const fade = clamp((progress - 0.88) / 0.12);
  const scale = 0.82 + focus * 0.2 - turn * 0.08;
  const shift = turn * 102;

  sheet.style.opacity = String(progress < 0.05 ? progress / 0.05 : 1 - fade);
  sheet.style.transform = `translate(-50%, -50%) translateX(${shift}%) scale(${scale})`;
  backdrop.style.opacity = String(0.98 - turn * 0.98);

  strips.forEach(({ strip, front, back }, index) => {
    const position = index / (strips.length - 1);
    const local = clamp((turn - position * 0.14) / 0.86);
    const localEase = ease(local);
    const bend = Math.sin(Math.PI * position) * Math.sin(Math.PI * local);
    const yaw = -180 * localEase - bend * 31;
    const lift = bend * 21;
    const depth = bend * 64;
    const twist = bend * 2.4;
    const width = 1 - bend * 0.055;

    strip.style.setProperty("--curl-bend", bend.toFixed(3));
    strip.style.transform = `translate3d(0, ${lift.toFixed(2)}px, ${depth.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) rotateZ(${twist.toFixed(2)}deg) scaleX(${width.toFixed(4)})`;
    front.style.opacity = String(local < 0.52 ? 1 : clamp((1 - local) / 0.48));
    back.style.opacity = String(local < 0.44 ? 0 : clamp((local - 0.44) / 0.3));
  });
};

const loadImage = (url) => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = url;
});

const measureSheet = (sheet) => {
  const rect = sheet.getBoundingClientRect();
  // The initial entrance scale is part of getBoundingClientRect(). Use the
  // authored dimensions for the raster surface so it stays full-size when
  // the sheet grows into focus.
  return {
    width: sheet.offsetWidth || rect.width,
    height: sheet.offsetHeight || rect.height,
  };
};

const drawWrapped = (context, text, x, y, maxWidth, lineHeight) => {
  const words = String(text || "").match(/[\u3400-\u9fff]|[^\s\u3400-\u9fff]+|\s+/gu) || [];
  let line = "";
  words.forEach((word) => {
    const candidate = line + word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else line = candidate;
  });
  if (line) context.fillText(line, x, y);
  return y;
};

const drawPaperCanvas = async (sourceFront, width, height, reverse = false) => {
  await Promise.all([
    document.fonts.load('400 16px "Libre Baskerville"'),
    document.fonts.load('italic 16px "Libre Baskerville"'),
    document.fonts.load('400 16px "DM Mono"'),
  ]);
  const canvas = document.createElement("canvas");
  const density = Math.min(window.devicePixelRatio || 1, 3, Math.sqrt(8000000 / (width * height)), 8192 / Math.max(width, height));
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.fontKerning = "normal";
  context.textRendering = "geometricPrecision";

  const rootStyle = getComputedStyle(document.documentElement);
  const paper = rootStyle.getPropertyValue("--paper-light").trim() || "#f2eee5";
  const paperDeep = rootStyle.getPropertyValue("--paper").trim() || "#e7dfcf";
  const ink = rootStyle.getPropertyValue("--ink").trim() || "#20201d";
  const muted = rootStyle.getPropertyValue("--muted").trim() || "#6b6b68";
  const red = rootStyle.getPropertyValue("--red").trim() || "#a44733";
  const textureUrl = new URL("../../assets/textures/newsprint-fibres-v1.png", import.meta.url).href;
  const texture = await loadImage(textureUrl);

  context.fillStyle = reverse ? paperDeep : paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (texture) {
    const pattern = context.createPattern(texture, "repeat");
    if (pattern) {
      pattern.setTransform(new DOMMatrix().scale(canvas.width / width));
      context.filter = document.documentElement.dataset.theme === "chromatic" ? "grayscale(1)" : "none";
      // Texture is baked into both page faces, so the fibres bend with the
      // paper rather than remaining fixed over the viewport.
      context.globalAlpha = reverse ? 0.34 : 0.42;
      context.globalCompositeOperation = "multiply";
      context.fillStyle = pattern;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      context.filter = "none";
    }
  }
  if (reverse) {
    context.strokeStyle = ink;
    context.lineWidth = 2;
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    return canvas;
  }

  // One typesetting pass supplies both the native-text cover and GPU texture.
  // Keep the material/rules separate until all native text positions are known.
  const textRuns = [];
  const paintText = context.fillText.bind(context);
  context.fillText = (text, x, y, maxWidth) => {
    textRuns.push({ text, x, y, maxWidth, font: context.font, color: context.fillStyle,
      metrics: context.measureText(text) });
  };

  const scale = canvas.width / 1024;
  const pixel = canvas.width / width;
  const x = 56 * scale;
  let titleSize = Math.min(canvas.width * 0.12, canvas.height * 0.18);
  const kicker = sourceFront.querySelector(".entry-intro-kicker")?.textContent.trim() || "THE LISTENING EDITION · ISSUE 001";
  const titleTop = sourceFront.querySelector(".entry-intro-masthead span")?.textContent.trim() || "HOW I";
  const titleBottom = sourceFront.querySelector(".entry-intro-masthead strong")?.textContent.trim() || "HEAR MUSIC";
  const lead = sourceFront.querySelector(".entry-intro-lead")?.textContent.trim() || "A personal archive of records, shapes and the reasons a song stays alive.";
  const folio = sourceFront.querySelector(".entry-intro-folio")?.textContent.trim() || "ANDDREAM / PRIVATE LISTENING ARCHIVE";

  context.strokeStyle = ink;
  context.lineWidth = 2 * scale;
  context.strokeRect(1 * scale, 1 * scale, canvas.width - 2 * scale, canvas.height - 2 * scale);
  context.fillStyle = red;
  context.font = `${Math.max(10 * pixel, 10 * scale)}px "DM Mono", monospace`;
  context.fillText(kicker, x, canvas.height * 0.07, canvas.width - 2 * x);
  context.fillStyle = ink;
  context.font = `${titleSize}px "Libre Baskerville", Georgia, serif`;
  titleSize *= Math.min(1, (canvas.width - 2 * x) / context.measureText(titleBottom).width);
  context.font = `italic ${Math.round(titleSize)}px "Libre Baskerville", Georgia, serif`;
  context.fillText(titleTop, x, canvas.height * 0.30);
  context.font = `${Math.round(titleSize)}px "Libre Baskerville", Georgia, serif`;
  context.fillText(titleBottom, x, canvas.height * 0.30 + titleSize * 1.16);
  const ruleY = canvas.height * 0.30 + titleSize * 1.55;
  context.beginPath();
  context.moveTo(x, ruleY);
  context.lineTo(canvas.width - x, ruleY);
  context.stroke();

  context.fillStyle = muted;
  const leadSize = Math.max(16 * pixel, 20 * scale);
  context.font = `italic ${leadSize}px "Libre Baskerville", Georgia, serif`;
  drawWrapped(context, lead, x, ruleY + leadSize * 2, Math.min(canvas.width - 2 * x, 640 * pixel), leadSize * 1.45);

  context.strokeStyle = rootStyle.getPropertyValue("--line").trim() || "#969696";
  context.lineWidth = 1 * scale;
  const columnsTop = canvas.height * 0.78;
  const columns = [
    [x, 146 * scale],
    [320 * scale, 188 * scale],
    [560 * scale, 112 * scale],
    [760 * scale, 165 * scale],
  ];
  columns.forEach(([left, length]) => {
    context.beginPath(); context.moveTo(left, columnsTop); context.lineTo(left + length, columnsTop); context.stroke();
    context.beginPath(); context.moveTo(left, columnsTop + canvas.height * 0.09); context.lineTo(left + length, columnsTop + canvas.height * 0.09); context.stroke();
  });

  context.fillStyle = muted;
  context.font = `${Math.max(9 * pixel, 10 * scale)}px "DM Mono", monospace`;
  context.textAlign = "left";
  context.fillText(folio, x, canvas.height * 0.92, canvas.width - 2 * x);
  context.textAlign = "left";
  const native = document.createElement("div");
  native.className = "entry-intro-native";
  const material = document.createElement("canvas");
  material.width = canvas.width; material.height = canvas.height;
  material.getContext("2d").drawImage(canvas, 0, 0);
  Object.assign(material.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
  native.append(material);
  for (const run of textRuns) {
    const span = document.createElement("span");
    span.textContent = run.text;
    const fontSize = Number(run.font.match(/([\d.]+)px/)[1]);
    const ascent = run.metrics.fontBoundingBoxAscent;
    const descent = run.metrics.fontBoundingBoxDescent;
    const baseline = (fontSize - ascent - descent) / 2 + ascent;
    Object.assign(span.style, { all: "initial", position: "absolute", whiteSpace: "pre",
      font: run.font, fontKerning: "normal", textRendering: "geometricPrecision", lineHeight: "1", color: run.color,
      left: `${run.x / pixel}px`, top: `${(run.y - baseline) / pixel}px`,
      transformOrigin: "top left", transform: `scale(${Math.min(1, (run.maxWidth || Infinity) / run.metrics.width) / pixel}, ${1 / pixel})` });
    native.append(span);
    context.font = run.font; context.fillStyle = run.color;
    if (run.maxWidth) paintText(run.text, run.x, run.y, run.maxWidth);
    else paintText(run.text, run.x, run.y);
  }
  sourceFront.parentElement.querySelector(".entry-intro-native")?.remove();
  sourceFront.parentElement.append(native);
  return canvas;
};

const deformPoint = (x, y, progress, width, height) => {
  return curlPoint(x, y, progress, width, height);
};

const projectPoint = (point, width, height) => {
  return { x: width / 2 + point.x, y: height / 2 - point.y, z: point.z, curl: point.curl };
};

const drawMappedTriangle = (context, image, source, destination, dpr = 1) => {
  const [s0, s1, s2] = source;
  const [d0, d1, d2] = destination;
  const determinant = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(determinant) < 0.001) return;
  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / determinant;
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / determinant;
  const e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / determinant;
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / determinant;
  const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / determinant;
  const f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / determinant;
  context.save();
  // The canvas backing store is DPR-scaled, while all page geometry is in
  // CSS pixels. Keep both the clip and the image transform in that space so
  // high-density displays do not shrink the mapped page to half size.
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.beginPath();
  context.moveTo(d0.x, d0.y);
  context.lineTo(d1.x, d1.y);
  context.lineTo(d2.x, d2.y);
  context.closePath();
  context.clip();
  context.setTransform(dpr * a, dpr * b, dpr * c, dpr * d, dpr * e, dpr * f);
  context.drawImage(image, 0, 0);
  context.restore();
};

const renderCanvasCurl = (intro, progress) => {
  const canvasState = intro._entryIntroCanvas;
  if (!canvasState) return;
  const { canvas, context, width, height, frontCanvas, backCanvas, columns, rows, dpr } = canvasState;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  const triangles = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u0 = column / columns;
      const u1 = (column + 1) / columns;
      const v0 = row / rows;
      const v1 = (row + 1) / rows;
      const source = [
        { x: u0 * frontCanvas.width, y: v0 * frontCanvas.height },
        { x: u1 * frontCanvas.width, y: v0 * frontCanvas.height },
        { x: u1 * frontCanvas.width, y: v1 * frontCanvas.height },
        { x: u0 * frontCanvas.width, y: v1 * frontCanvas.height },
      ];
      const world = [
        deformPoint((u0 - 0.5) * width, (0.5 - v0) * height, progress, width, height),
        deformPoint((u1 - 0.5) * width, (0.5 - v0) * height, progress, width, height),
        deformPoint((u1 - 0.5) * width, (0.5 - v1) * height, progress, width, height),
        deformPoint((u0 - 0.5) * width, (0.5 - v1) * height, progress, width, height),
      ];
      const destination = world.map((point) => projectPoint(point, width + canvasState.margin * 2, height + canvasState.margin * 2));
      const curl = world.reduce((sum, point) => sum + point.curl, 0) / 4;
      const z = world.reduce((sum, point) => sum + point.z, 0) / 4;
      const image = curl > 0.5 ? backCanvas : frontCanvas;
      triangles.push({ image, source: [source[0], source[1], source[2]], destination: [destination[0], destination[1], destination[2]], z, curl });
      triangles.push({ image, source: [source[0], source[2], source[3]], destination: [destination[0], destination[2], destination[3]], z, curl });
    }
  }
  triangles.sort((first, second) => first.z - second.z);
  triangles.forEach(({ image, source, destination, z, curl }) => {
    drawMappedTriangle(context, image, source, destination, dpr);
    if (curl > 0.02) {
      context.save();
      context.globalAlpha = clamp(Math.abs(z) / (width * 0.42), 0, 0.2);
      context.fillStyle = "#20201d";
      context.beginPath();
      context.moveTo(destination[0].x, destination[0].y);
      context.lineTo(destination[1].x, destination[1].y);
      context.lineTo(destination[2].x, destination[2].y);
      context.closePath();
      context.fill();
      context.restore();
    }
  });
  canvasState.lastProgress = progress;
};

const disposeCanvas = (intro) => {
  const canvasState = intro?._entryIntroCanvas;
  if (!canvasState) return;
  canvasState.canvas.remove();
  intro.classList.remove("has-canvas");
  intro._entryIntroCanvas = null;
};

const normalizeCanvasForDpr = (source, width, height, dpr) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.drawImage(source, 0, 0, width, height);
  return canvas;
};

const makeCanvasCurlSheet = async (intro) => {
  const sheet = intro.querySelector("[data-entry-intro-sheet]");
  const sourceFront = sheet?.querySelector(".entry-intro-sheet-front");
  if (!sheet || !sourceFront) throw new Error("Entry sheet markup is unavailable.");
  const size = measureSheet(sheet);
  if (!size.width || !size.height) throw new Error("Entry sheet has no measurable bounds.");
  const frontArtwork = await drawPaperCanvas(sourceFront, size.width, size.height);
  const backArtwork = await drawPaperCanvas(sourceFront, size.width, size.height, true);
  const canvas = document.createElement("canvas");
  canvas.className = "entry-intro-canvas-fallback";
  canvas.setAttribute("aria-hidden", "true");
  // Keep the 2D fallback in CSS-pixel space. It is a short-lived intro layer
  // and this avoids browser-specific backing-store scaling changing the page
  // geometry while the corner mesh is being rasterized.
  const dpr = 1;
  // Normalize both source pages to the same CSS-pixel coordinate system as
  // the display canvas. This keeps the affine mesh mapping 1:1 without
  // allowing a high-resolution source to appear undersized.
  const frontCanvas = normalizeCanvasForDpr(frontArtwork, size.width, size.height, dpr);
  const backCanvas = normalizeCanvasForDpr(backArtwork, size.width, size.height, dpr);
  const margin = Math.max(size.width, size.height) * 0.8;
  canvas.width = Math.round((size.width + margin * 2) * dpr);
  canvas.height = Math.round((size.height + margin * 2) * dpr);
  Object.assign(canvas.style, { width: `${canvas.width / dpr}px`, height: `${canvas.height / dpr}px`, left: `${-margin}px`, top: `${-margin}px`, maxWidth: "none" });
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable.");
  sheet.append(canvas);
  intro.classList.add("has-canvas");
  intro._entryIntroCanvas = { canvas, context, width: size.width, height: size.height, margin, dpr, frontCanvas, backCanvas, columns: 60, rows: 44 };
  renderCanvasCurl(intro, 0);
};

const deformPage = (webgl, progress) => {
  const { geometry, basePositions, width, height } = webgl;
  const positions = geometry.attributes.position.array;
  const colors = geometry.attributes.color.array;
  const shadowPositions = webgl.shadow.geometry.attributes.position.array;
  const frame = pageCurlFrame(progress, width, height);
  for (let i = 0; i < basePositions.length; i += 3) {
    const p = curlPoint(basePositions[i], basePositions[i + 1], progress, width, height, frame);
    positions[i] = p.x; positions[i + 1] = p.y; positions[i + 2] = p.z;
    // The shadow follows the folded silhouette, never a stationary rectangle.
    shadowPositions[i] = p.x + p.z * 0.18;
    shadowPositions[i + 1] = p.y - p.z * 0.22;
    shadowPositions[i + 2] = -1;
    const light = 1 - 0.2 * Math.sin(p.curl * Math.PI) - 0.06 * p.curl;
    colors[i] = colors[i + 1] = colors[i + 2] = light;
  }
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  webgl.shadow.geometry.attributes.position.needsUpdate = true;
  webgl.shadow.frustumCulled = false;
  webgl.renderer.render(webgl.scene, webgl.camera);
};

const makeWebGLSheet = async (intro) => {
  const sheet = intro.querySelector("[data-entry-intro-sheet]");
  const sourceFront = sheet?.querySelector(".entry-intro-sheet-front");
  if (!sheet || !sourceFront) throw new Error("Entry sheet markup is unavailable.");
  const { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CanvasTexture, Group, DoubleSide, FrontSide, BackSide, Float32BufferAttribute } = await import("../../assets/vendor/three.module.min.js");
  const THREE = { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CanvasTexture, Group, DoubleSide, FrontSide, BackSide, Float32BufferAttribute };
  const size = measureSheet(sheet);
  if (!size.width || !size.height || !window.WebGLRenderingContext) throw new Error("WebGL is unavailable.");

  const frontCanvas = await drawPaperCanvas(sourceFront, size.width, size.height);
  const backCanvas = await drawPaperCanvas(sourceFront, size.width, size.height, true);
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  // The sheet itself now spans the viewport: offscreen paper can be clipped
  // at the viewport, without allocating an oversized GPU drawing surface.
  const margin = 0;
  const renderWidth = size.width;
  const renderHeight = size.height;
  renderer.setPixelRatio(frontCanvas.width / size.width);
  renderer.setSize(renderWidth, renderHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "entry-intro-webgl-canvas";
  Object.assign(renderer.domElement.style, { left: `${-margin}px`, top: `${-margin}px`, width: `${renderWidth}px`, height: `${renderHeight}px`, maxWidth: "none" });
  renderer.domElement.setAttribute("aria-hidden", "true");
  sheet.append(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera(-renderWidth / 2, renderWidth / 2, renderHeight / 2, -renderHeight / 2, -4000, 4000);
  camera.position.z = 1000;
  const group = new Group();
  scene.add(group);
  const geometry = new PlaneGeometry(size.width, size.height, 160, 112);
  const basePositions = geometry.attributes.position.array.slice();
  const baseColors = new Float32Array(basePositions.length);
  for (let index = 0; index < baseColors.length; index += 3) baseColors[index] = baseColors[index + 1] = baseColors[index + 2] = 1;
  geometry.setAttribute("color", new Float32BufferAttribute(baseColors, 3));
  const frontTexture = new CanvasTexture(frontCanvas);
  const backTexture = new CanvasTexture(backCanvas);
  frontTexture.colorSpace = "srgb";
  backTexture.colorSpace = "srgb";
  frontTexture.anisotropy = backTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const frontMaterial = new MeshBasicMaterial({ map: frontTexture, vertexColors: true, side: FrontSide, transparent: true, depthWrite: true });
  const backMaterial = new MeshBasicMaterial({ map: backTexture, vertexColors: true, side: BackSide, transparent: true, depthWrite: true });
  const front = new Mesh(geometry, frontMaterial);
  const back = new Mesh(geometry, backMaterial);
  front.renderOrder = 2;
  back.renderOrder = 1;
  group.add(back, front);
  const shadowGeometry = geometry.clone();
  const shadowMaterial = new MeshBasicMaterial({ color: 0x20201d, transparent: true, opacity: 0.15, side: DoubleSide, depthWrite: false });
  const shadow = new Mesh(shadowGeometry, shadowMaterial);
  shadow.position.z = 0;
  group.add(shadow);

  intro.classList.add("has-webgl");
  intro._entryIntroWebGL = { THREE, renderer, scene, camera, group, geometry, shadow, frontMaterial, backMaterial, shadowMaterial, frontTexture, backTexture, basePositions, baseColors, width: size.width, height: size.height, canvas: renderer.domElement };
  deformPage(intro._entryIntroWebGL, 0);
};

const renderWebGLSheet = (intro, elapsed) => {
  const webgl = intro._entryIntroWebGL;
  if (!webgl) return;
  const progress = clamp(elapsed / getIntroDuration(intro));
  const backdrop = intro.querySelector("[data-entry-intro-backdrop]");
  if (backdrop) backdrop.style.opacity = "0";
  const sheet = intro.querySelector("[data-entry-intro-sheet]");
  if (sheet) {
    const fade = clamp((progress - 0.91) / 0.09);
    sheet.style.opacity = String(1 - fade);
    sheet.style.transform = "translate(-50%, -50%)";
  }
  deformPage(webgl, progress);
  const native = intro.querySelector(".entry-intro-native");
  if (native) native.hidden = progress > 0.22;
};

const animateIntro = (intro, startTime) => {
  if (intro.hidden || intro.classList.contains("is-finishing")) return;
  const params = new URLSearchParams(location.search);
  const inspectFrame = ["localhost", "127.0.0.1"].includes(location.hostname) && params.has("introFrame");
  const elapsed = inspectFrame ? clamp(Number(params.get("introFrame"))) * getIntroDuration(intro) : performance.now() - startTime;
  if (intro._entryIntroWebGL) renderWebGLSheet(intro, elapsed);
  else if (intro._entryIntroCanvas) {
    const progress = clamp(elapsed / getIntroDuration(intro));
    const backdrop = intro.querySelector("[data-entry-intro-backdrop]");
    if (backdrop) backdrop.style.opacity = String(0.98 - ease((progress - 0.27) / 0.73) * 0.98);
    const sheet = intro.querySelector("[data-entry-intro-sheet]");
    if (sheet) {
      const focus = ease(progress / 0.27);
      const fade = clamp((progress - 0.91) / 0.09);
      sheet.style.opacity = String(progress < 0.05 ? progress / 0.05 : 1 - fade);
      sheet.style.transform = `translate(-50%, -50%) scale(${1.12 - focus * 0.12})`;
    }
    renderCanvasCurl(intro, progress);
  }
  else renderFlexibleSheet(intro, elapsed);
  if (inspectFrame) return;
  if (elapsed >= getIntroDuration(intro)) {
    finishIntro(intro);
    return;
  }
  intro._entryIntroFrame = requestAnimationFrame(() => animateIntro(intro, startTime));
};

const bindSkip = (intro) => {
  if (intro._entryIntroBound) return;
  intro._entryIntroBound = true;
  intro.addEventListener("click", (event) => {
    if (event.target === intro || event.target.matches("[data-entry-intro-backdrop]")) finishIntro(intro);
  });
};

export const bindEntryIntro = (path) => {
  const intro = document.getElementById("entry-intro");
  if (!intro) return;
  if (path !== "/") { clearIntro(intro, { remember: false }); return; }
  if (readSessionFlag() && !shouldReplay()) { clearIntro(intro, { remember: false }); return; }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { clearIntro(intro); return; }
  if (intro.classList.contains("is-active")) return;

  intro.hidden = false;
  intro.setAttribute("aria-hidden", "false");
  document.body.classList.add("entry-intro-lock");
  document.body.dataset.entryIntro = "active";
  intro._entryIntroDuration = readIntroDuration();
  bindSkip(intro);

  const begin = () => {
    if (intro.hidden || intro.classList.contains("is-finishing")) { disposeWebGL(intro); disposeCanvas(intro); return; }
    intro.classList.add("is-active");
    intro._entryIntroStart = performance.now();
    animateIntro(intro, intro._entryIntroStart);
    // Start the safety timer with the visual animation, not with the async
    // texture/renderer setup. Slow font or image loading must not shorten the
    // page turn before the user can see it.
    if (!(["localhost", "127.0.0.1"].includes(location.hostname) && new URLSearchParams(location.search).has("introFrame")))
      intro._entryIntroTimer = window.setTimeout(() => finishIntro(intro), getIntroDuration(intro) + 160);
  };

  makeWebGLSheet(intro).then(begin).catch((error) => {
    disposeWebGL(intro);
    intro.dataset.rendererFallback = error.message;
    // A clean entrance is preferable to a visibly seamed software mesh.
    clearIntro(intro);
  });
  intro._entryIntroEvents = new AbortController();
  window.addEventListener("resize", () => finishIntro(intro), { signal: intro._entryIntroEvents.signal });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !intro.hidden) finishIntro(intro);
  }, { signal: intro._entryIntroEvents.signal });
};
