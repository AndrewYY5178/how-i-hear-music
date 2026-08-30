import { allTracks, trackId } from "./data.js";
import { insightTagsOf } from "./insights.js";

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const normalizedEntropy = (values) => {
  const counts = new Map(); values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  if (counts.size < 2) return 0; const total = values.filter(Boolean).length; const entropy = [...counts.values()].reduce((sum, count) => { const p = count / total; return sum - p * Math.log(p); }, 0); return entropy / Math.log(counts.size);
};
const quarter = (date) => `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;
const yearOf = (record) => Number(String(record.releaseDate || record.year || "").slice(0, 4)) || null;

export const archiveEntropy = ({ entries = [], tracks = allTracks() } = {}) => {
  const lookup = new Map(tracks.map((track) => [trackId(track), track])); const dated = entries.filter((entry) => entry.type === "rating" && entry.trackId && Number.isFinite(new Date(entry.at).getTime())).sort((a, b) => new Date(a.at) - new Date(b.at)); const periods = [...new Set(dated.map((entry) => quarter(new Date(entry.at))))];
  return periods.map((period, periodIndex) => {
    const endEntries = dated.filter((entry) => periods.indexOf(quarter(new Date(entry.at))) <= periodIndex); const latest = new Map(); endEntries.forEach((entry) => latest.set(entry.trackId, entry)); const evidence = [...latest.values()].map((entry) => ({ ...lookup.get(entry.trackId), ...entry })); const artists = evidence.map((record) => record.artist); const tags = evidence.flatMap(insightTagsOf); const years = evidence.map(yearOf).filter(Boolean); const albums = evidence.map((record) => record.album).filter(Boolean);
    const current = dated.filter((entry) => quarter(new Date(entry.at)) === period); const beforeArtists = new Set(dated.filter((entry) => new Date(entry.at) < new Date(current[0]?.at || 0)).map((entry) => lookup.get(entry.trackId)?.artist).filter(Boolean)); const currentArtists = [...new Set(current.map((entry) => lookup.get(entry.trackId)?.artist).filter(Boolean))];
    const artistDiversity = normalizedEntropy(artists); const artistConcentration = 1 - artistDiversity; const traitDiversity = tags.length ? normalizedEntropy(tags) : null; const eraSpread = years.length ? clamp01(new Set(years.map((year) => Math.floor(year / 10) * 10)).size / 5) : null; const albumDepth = albums.length ? clamp01((albums.length - new Set(albums).size) / Math.max(1, albums.length - 1)) : null; const explorationRate = currentArtists.length ? currentArtists.filter((artist) => !beforeArtists.has(artist)).length / currentArtists.length : 0; const available = [artistDiversity, traitDiversity, eraSpread, albumDepth, explorationRate].filter((value) => value !== null); const index = available.length ? available.reduce((sum, value) => sum + value, 0) / available.length : 0;
    return { period, index, artistConcentration, traitDiversity, eraSpread, albumDepth, explorationRate, evidenceCount: evidence.length };
  }).filter((snapshot) => snapshot.evidenceCount >= 3);
};

export const entropyNarrative = (series) => {
  if (!series.length) return null; if (series.length === 1) return "The first period establishes a baseline; breadth and concentration are not value judgments.";
  const latest = series.at(-1); const prior = series.at(-2); const delta = latest.index - prior.index; if (Math.abs(delta) < .04) return "The archive held a similar balance between concentration and breadth.";
  const dimensions = [["new artists", latest.explorationRate - prior.explorationRate], ["wider listening reasons", (latest.traitDiversity || 0) - (prior.traitDiversity || 0)], ["release periods", (latest.eraSpread || 0) - (prior.eraSpread || 0)]].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  return `The archive became ${delta > 0 ? "more distributed" : "more concentrated"}, led by ${dimensions[0][0]}. Neither direction is treated as better.`;
};
