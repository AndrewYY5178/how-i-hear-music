import { rating, safe } from "../music/data.js";

export const fields = ["song", "vocal", "production", "overall"];
export const fieldLabel = { song: "Song", vocal: "Vocal", production: "Production", overall: "Overall" };
const point = (value, index, size, radius) => {
  const angle = -Math.PI / 2 + Math.PI * 2 * index / 4;
  const distance = (Math.max(0, Math.min(11, Number(value) || 0)) / 11) * radius;
  return [size / 2 + Math.cos(angle) * distance, size / 2 + Math.sin(angle) * distance];
};
const polygon = (values, size, radius) => values.map((value, index) => point(value, index, size, radius).map((part) => part.toFixed(1)).join(",")).join(" ");
export const radarPoints = (scores = {}) => polygon(fields.map((field) => scores?.[field] ?? 0), 220, 70);

export const radar = (scores = {}, { interactive = false, className = "" } = {}) => {
  scores = scores || {};
  const size = 220; const center = size / 2; const radius = 70;
  const values = fields.map((field) => scores[field] ?? 0);
  const rings = [3.5, 7, 11].map((level) => `<polygon points="${polygon(fields.map(() => level), size, radius)}"></polygon>`).join("");
  const axes = fields.map((_, index) => { const target = point(11, index, size, radius); return `<line x1="${center}" y1="${center}" x2="${target[0]}" y2="${target[1]}"></line>`; }).join("");
  const nodes = values.map((value, index) => { const target = point(value, index, size, radius); const field = fields[index]; return `<circle ${interactive ? `data-radar-field="${field}" tabindex="0" role="slider" aria-label="${fieldLabel[field]} score" aria-valuemin="0" aria-valuemax="11" aria-valuenow="${rating(value)}"` : ""} cx="${target[0]}" cy="${target[1]}" r="${interactive ? 6 : 4}"></circle>`; }).join("");
  const labels = fields.map((field, index) => { const target = point(11, index, size, radius + 28); return `<text x="${target[0]}" y="${target[1] + 3}" text-anchor="middle">${field.toUpperCase()}</text>`; }).join("");
  return `<svg class="radar ${className}" viewBox="0 0 ${size} ${size}" role="${interactive ? "group" : "img"}" aria-label="Listening Shape"><g class="radar-grid">${rings}${axes}</g><polygon class="radar-fill" points="${polygon(values, size, radius)}"></polygon><g class="radar-points">${nodes}</g><g class="radar-labels">${labels}</g></svg>`;
};

const y = (score, height, padding) => padding + (height - padding * 2) - ((Math.max(5, Math.min(11, Number(score) || 5)) - 5) / 6) * (height - padding * 2);
export const waveform = (tracks, { interactive = false } = {}) => {
  if (!tracks?.length) return `<div class="empty-wave">No confirmed track scores yet.</div>`;
  const width = 680; const height = 180; const padding = 24;
  const coords = tracks.map((track, index) => [padding + ((width - padding * 2) * index) / Math.max(1, tracks.length - 1), y(track.overall, height, padding)]);
  const path = coords.reduce((result, current, index) => {
    if (!index) return `M${current[0]} ${current[1]}`;
    const prior = coords[index - 1]; const middle = (prior[0] + current[0]) / 2;
    return `${result} C${middle} ${prior[1]},${middle} ${current[1]},${current[0]} ${current[1]}`;
  }, "");
  const guides = [5, 7, 9, 11].map((score) => `<line x1="${padding}" x2="${width - padding}" y1="${y(score, height, padding)}" y2="${y(score, height, padding)}"></line>`).join("");
  const nodes = coords.map((coord, index) => `<circle ${interactive ? `data-wave-index="${index}" tabindex="0" role="slider" aria-label="${safe(tracks[index].title)} score" aria-valuemin="0" aria-valuemax="11" aria-valuenow="${rating(tracks[index].overall)}"` : ""} cx="${coord[0]}" cy="${coord[1]}" r="${interactive ? 6 : 4}"><title>${safe(tracks[index].title)}: ${rating(tracks[index].overall)}</title></circle><text x="${coord[0]}" y="${height - 5}" text-anchor="middle">${String(index + 1).padStart(2, "0")}</text>`).join("");
  return `<svg class="waveform" viewBox="0 0 ${width} ${height}" role="${interactive ? "group" : "img"}" aria-label="Listening Landscape"><g class="wave-guides">${guides}</g><path d="${path}"></path><g class="wave-points">${nodes}</g></svg>`;
};

export const summary = (tracks) => {
  const values = tracks.map((track) => Number(track.overall)).filter(Number.isFinite);
  if (!values.length) return "";
  const average = values.reduce((sum, item) => sum + item, 0) / values.length;
  const variance = values.reduce((sum, item) => sum + (item - average) ** 2, 0) / values.length;
  return `<dl class="metric-row"><div><dt>PEAK</dt><dd>${rating(Math.max(...values))}</dd></div><div><dt>LOW</dt><dd>${rating(Math.min(...values))}</dd></div><div><dt>AVERAGE</dt><dd>${rating(average)}</dd></div><div><dt>CONSISTENCY</dt><dd>${rating(Math.max(0, 10 - Math.sqrt(variance)))}</dd></div><div><dt>RANGE</dt><dd>${rating(Math.max(...values) - Math.min(...values))}</dd></div></dl>`;
};
