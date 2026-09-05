const recordPalette = ["#8f4937", "#65705a", "#566d78", "#796071", "#8b7349", "#72533f", "#4f7068"];
const toneCache = new Map();
const artworkProxyHosts = new Set(["y.gtimg.cn", "p1.music.126.net", "p2.music.126.net", "p3.music.126.net", "p4.music.126.net"]);

const hash = (value) => [...String(value || "record")].reduce((total, character) => ((total << 5) - total + character.codePointAt(0)) | 0, 0);

export const fallbackCoverTone = (key) => recordPalette[Math.abs(hash(key)) % recordPalette.length];

const quantizedChannel = (value) => Math.min(255, Math.round(value / 24) * 24);

export const dominantPixelTone = (pixels, width, height, { edgeOnly = false, maximum = 184 } = {}) => {
  const buckets = new Map();
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < 180) continue;
    const pixel = index / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const edgeSize = Math.max(2, Math.round(Math.min(width, height) / 7));
    if (edgeOnly && x >= edgeSize && x < width - edgeSize && y >= edgeSize && y < height - edgeSize) continue;
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const key = `${quantizedChannel(red)}-${quantizedChannel(green)}-${quantizedChannel(blue)}`;
    const bucket = buckets.get(key) || { red: 0, green: 0, blue: 0, count: 0, spread: 0 };
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    bucket.count += 1;
    bucket.spread += Math.max(red, green, blue) - Math.min(red, green, blue);
    buckets.set(key, bucket);
  }
  const swatches = [...buckets.values()];
  const largestPopulation = Math.max(...swatches.map((bucket) => bucket.count));
  const swatchValues = (bucket) => {
    const values = [bucket.red, bucket.green, bucket.blue].map((value) => value / bucket.count);
    const high = Math.max(...values) / 255;
    const low = Math.min(...values) / 255;
    const lightness = (high + low) / 2;
    const saturation = high === low ? 0 : (high - low) / (1 - Math.abs(2 * lightness - 1));
    const population = bucket.count / largestPopulation;
    const prominence = Math.pow(population, .55) * (.28 + 1.72 * Math.pow(saturation, 1.2)) * (.72 + .28 * (1 - Math.abs(lightness - .52)));
    return { bucket, values, lightness, saturation, population, prominence };
  };
  const candidates = swatches.map(swatchValues);
  const colorful = candidates.filter(({ population, saturation, lightness }) => population >= .035 && saturation >= .18 && lightness >= .08 && lightness <= .92);
  const dominant = (colorful.length ? colorful.sort((left, right) => right.prominence - left.prominence) : candidates.sort((left, right) => right.population - left.population))[0]?.bucket;
  if (!dominant) return null;
  const values = [dominant.red, dominant.green, dominant.blue].map((value) => value / dominant.count);
  const lightness = values.reduce((total, value) => total + value, 0) / 3;
  const targetLightness = Math.max(34, Math.min(maximum, lightness));
  const scale = lightness ? targetLightness / lightness : 1;
  return `rgb(${values.map((value) => Math.round(Math.max(0, Math.min(255, value * scale)))).join(" ")})`;
};

const sampledTones = (image) => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const record = dominantPixelTone(pixels, canvas.width, canvas.height);
  return { record, edge: dominantPixelTone(pixels, canvas.width, canvas.height, { edgeOnly: true, maximum: 164 }) || record };
};

const artworkApiBase = () => {
  const explicit = globalThis.window?.__HIM_API_BASE__;
  const hosted = globalThis.location?.hostname?.endsWith("github.io") ? globalThis.document?.querySelector?.('meta[name="him-api-base"]')?.content : "";
  return String(explicit || hosted || "").replace(/\/$/, "");
};

export const artworkSamplerSources = (source) => {
  const value = String(source || "");
  let parsed;
  try { parsed = new URL(value, globalThis.location?.href || "http://localhost/"); } catch { return value ? [value] : []; }
  if (parsed.protocol !== "https:" || !artworkProxyHosts.has(parsed.hostname)) return value ? [value] : [];
  const proxy = `${artworkApiBase()}/api/artwork?url=${encodeURIComponent(parsed.href)}`;
  return [proxy, value];
};

const sampleSource = (source) => new Promise((resolve) => {
  const sampler = new Image();
  sampler.crossOrigin = "anonymous";
  sampler.decoding = "async";
  sampler.onload = () => {
    try { resolve(sampledTones(sampler)); }
    catch { resolve(null); }
  };
  sampler.onerror = () => resolve(null);
  sampler.src = source;
});

const tonesForSource = (source) => {
  if (toneCache.has(source)) return toneCache.get(source);
  const result = artworkSamplerSources(source).reduce((attempt, candidate) => attempt.then((tones) => tones || sampleSource(candidate)), Promise.resolve(null));
  toneCache.set(source, result);
  return result;
};

const applyTone = async (target, source) => {
  if (!source) return null;
  const tones = await tonesForSource(source);
  if (!target.isConnected || !tones) return null;
  if (tones.record) target.style.setProperty("--record-color", tones.record);
  if (tones.edge) target.style.setProperty("--sleeve-edge-color", tones.edge);
  return tones;
};

export const reextractCoverTone = (target) => {
  const source = target?.dataset?.coverSource || "";
  if (!source) return Promise.resolve(null);
  toneCache.delete(source);
  return applyTone(target, source);
};

const showCoverFallback = (image) => {
  image.hidden = true;
  const fallback = image.nextElementSibling;
  if (fallback?.matches("[data-cover-fallback]")) fallback.hidden = false;
};

const bindCoverImage = (image) => {
  if (image.dataset.coverBound === "true") return;
  image.dataset.coverBound = "true";
  const handleError = () => {
    const alternate = image.dataset.coverFallbackSource;
    if (alternate && image.src !== new URL(alternate, location.href).href) {
      image.src = alternate;
      const toneTarget = image.closest("[data-cover-tone]");
      if (toneTarget) {
        toneTarget.dataset.coverSource = alternate;
        applyTone(toneTarget, alternate);
      }
      return;
    }
    showCoverFallback(image);
  };
  image.addEventListener("error", handleError);
  if (image.complete && !image.naturalWidth) handleError();
};

export const bindCoverTones = (root = document) => {
  root.querySelectorAll("[data-cover-image]").forEach(bindCoverImage);
  root.querySelectorAll("[data-cover-tone]").forEach((target) => {
  if (target.dataset.toneBound === "true") return;
  target.dataset.toneBound = "true";
  applyTone(target, target.dataset.coverSource);
  });
};
