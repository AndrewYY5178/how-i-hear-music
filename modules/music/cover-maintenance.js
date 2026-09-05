import { storage } from "./data.js";

export const coverOverrideKey = "how-i-hear-music:cover-overrides:v1";
export const localCoverOverrideKey = "how-i-hear-music:cover-overrides-local:v1";

export const coverSourcesFor = (album, id) => {
  const override = storage.get(coverOverrideKey, {})[id] || "";
  const localOverride = storage.get(localCoverOverrideKey, {})[id] || "";
  const canonical = album.coverUrl || "";
  const primary = localOverride || override || canonical;
  const alternate = [override, canonical, album.coverFallback].find((source) => source && source !== primary) || "";
  return { primary, alternate, local: localOverride, remote: override };
};

export const encodeLocalCover = (file) => new Promise((resolve, reject) => {
  if (!file || !String(file.type || "").startsWith("image/")) { reject(new Error("Choose a JPG, PNG, WebP or AVIF image.")); return; }
  if (file.size > 20 * 1024 * 1024) { reject(new Error("Choose an image smaller than 20 MB.")); return; }
  const objectUrl = URL.createObjectURL(file); const image = new Image();
  const finish = (error, value) => { URL.revokeObjectURL(objectUrl); error ? reject(error) : resolve(value); };
  image.onerror = () => finish(new Error("This image could not be read in the browser."));
  image.onload = () => {
    try {
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight); if (!sourceSize) throw new Error("This image has no readable dimensions.");
      const size = Math.min(1400, sourceSize); const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size; const context = canvas.getContext("2d");
      if (!context) throw new Error("This browser cannot prepare a local cover.");
      context.drawImage(image, (image.naturalWidth - sourceSize) / 2, (image.naturalHeight - sourceSize) / 2, sourceSize, sourceSize, 0, 0, size, size);
      const candidates = [["image/webp", .86], ["image/jpeg", .84], ["image/jpeg", .72]];
      const encoded = candidates.map(([mime, quality]) => { try { return canvas.toDataURL(mime, quality); } catch { return ""; } }).filter(Boolean).sort((left, right) => left.length - right.length)[0];
      if (!encoded || encoded.length > 2400000) throw new Error("This image is still too large after compression. Choose a smaller cover.");
      finish(null, encoded);
    } catch (error) { finish(error instanceof Error ? error : new Error("This image could not be prepared.")); }
  };
  image.src = objectUrl;
});
