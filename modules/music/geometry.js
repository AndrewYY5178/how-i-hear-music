import { safe } from "./data.js";

export const geometryFields = ["song", "vocal", "production", "overall"];
const point = (value, index, cx, cy, radius) => { const angle = -Math.PI / 2 + Math.PI * 2 * index / 4; const distance = Math.max(0, Math.min(11, Number(value) || 0)) / 11 * radius; return [cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance]; };
export const glyphPoints = (scores = {}, cx = 60, cy = 60, radius = 42) => geometryFields.map((field, index) => point(scores?.[field], index, cx, cy, radius).map((value) => value.toFixed(1)).join(",")).join(" ");
export const trackGlyph = (scores = {}, label = "Track glyph", className = "") => `<svg class="track-glyph ${className}" viewBox="0 0 120 120" role="img" aria-label="${safe(label)}"><path d="M60 18V102M18 60H102"></path><polygon points="${glyphPoints(scores)}"></polygon></svg>`;

export const terrainPoints = (tracks = [], width = 220, height = 72, padding = 8) => {
  const values = tracks.map((track) => Number(track.overall ?? track.scores?.overall)).filter(Number.isFinite); if (!values.length) return "";
  return values.map((value, index) => `${(padding + index / Math.max(1, values.length - 1) * (width - padding * 2)).toFixed(1)},${(padding + (11 - Math.max(5, Math.min(11, value))) / 6 * (height - padding * 2)).toFixed(1)}`).join(" ");
};
export const albumTerrain = (tracks = [], label = "Album terrain", className = "") => { const points = terrainPoints(tracks); return `<svg class="album-terrain ${className}" viewBox="0 0 220 72" role="img" aria-label="${safe(label)}${points ? "" : "; no scored terrain"}"><line x1="8" y1="64" x2="212" y2="64"></line>${points ? `<polyline points="${points}"></polyline>` : ""}</svg>`; };

const medianScores = (tracks) => Object.fromEntries(geometryFields.map((field) => { const values = tracks.map((track) => Number(track.scores?.[field])).filter(Number.isFinite).sort((a, b) => a - b); const middle = Math.floor(values.length / 2); return [field, values.length ? values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2 : 0]; }));
export const artistSignature = (tracks = [], traits = [], label = "Artist signature") => {
  const scored = tracks.filter((track) => geometryFields.some((field) => Number.isFinite(Number(track.scores?.[field])))); const median = medianScores(scored); const layers = scored.slice(0, 5).map((track, index) => `<polygon points="${glyphPoints(track.scores, 58, 58, 40)}" opacity="${(.08 + index * .04).toFixed(2)}"></polygon>`).join(""); const ticks = traits.slice(0, 4).map((trait, index) => `<line x1="126" x2="${126 + Math.round(trait.score * 72)}" y1="${26 + index * 18}" y2="${26 + index * 18}"><title>${safe(trait.label)}</title></line>`).join("");
  return `<svg class="artist-signature" viewBox="0 0 220 116" role="img" aria-label="${safe(label)}"><path class="signature-grid" d="M58 18V98M18 58H98"></path>${layers}<polygon class="signature-median" points="${glyphPoints(median, 58, 58, 40)}"></polygon><g class="signature-traits">${ticks}</g></svg>`;
};

export const tasteTraitMark = (trait) => `<span class="taste-trait-mark" style="--trait-score:${Math.round(trait.score * 100)}%" aria-label="Taste trait strength ${Math.round(trait.score * 100)} out of 100"><i></i><b>${Math.round(trait.score * 100)}</b></span>`;
