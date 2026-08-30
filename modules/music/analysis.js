import { allTracks, storage, trackId } from "./data.js";
import { insightTagsOf } from "./insights.js";

export const journalStorageKey = "how-i-hear-music:journal:v1";
export const currentEvidence = () => {
  const saved = storage.get("how-i-hear-music:rating-sessions:v2", {});
  return allTracks().map((track) => ({ ...track, ...(saved[trackId(track)] || {}), id: trackId(track), scores: saved[trackId(track)]?.scores || track.scores || {}, insightTags: insightTagsOf(saved[trackId(track)] || {}) }));
};

export const ratingChanges = (entries = storage.get(journalStorageKey, [])) => {
  const groups = new Map();
  entries.filter((entry) => entry.type === "rating" && entry.trackId && entry.scores?.overall !== null && entry.scores?.overall !== undefined && Number.isFinite(Number(entry.scores.overall))).forEach((entry) => groups.set(entry.trackId, [...(groups.get(entry.trackId) || []), entry]));
  return [...groups.values()].filter((group) => group.length > 1).map((group) => { const ordered = group.sort((a, b) => new Date(a.at) - new Date(b.at)); return { first: ordered[0], entry: ordered.at(-1), delta: Number(ordered.at(-1).scores.overall) - Number(ordered[0].scores.overall), count: ordered.length }; });
};

export const antiRecommendationPatterns = (records = currentEvidence(), minimum = 3) => {
  const scored = records.filter((record) => [record.scores?.song, record.scores?.vocal, record.scores?.production, record.scores?.overall].every((value) => value !== null && value !== undefined && Number.isFinite(Number(value))));
  const rules = [
    { id: "vocal-connection", title: "TECHNICAL VOCAL ≠ CONNECTION", copy: "Strong vocal responses do not always become personal attachment.", match: (s) => Number(s.vocal) >= 8.5 && Number(s.overall) <= 6 },
    { id: "craft-connection", title: "CRAFT ≠ RESONANCE", copy: "High component scores can still leave the final response noticeably lower.", match: (s) => (Number(s.song) + Number(s.vocal) + Number(s.production)) / 3 - Number(s.overall) >= 2 },
    { id: "production-friction", title: "PRODUCTION FRICTION", copy: "The production response repeatedly sits well below the rest of the listening shape.", match: (s) => Number(s.production) + 1.5 <= (Number(s.song) + Number(s.vocal)) / 2 },
    { id: "song-friction", title: "THE SONG ITSELF HOLDS BACK", copy: "Performance and sound can land while the underlying song remains the boundary.", match: (s) => Number(s.song) + 1.5 <= (Number(s.vocal) + Number(s.production)) / 2 },
  ];
  return rules.map((rule) => ({ ...rule, records: scored.filter((record) => rule.match(record.scores)) })).filter((rule) => rule.records.length >= minimum);
};

export const rediscoveryCandidates = ({ entries = storage.get(journalStorageKey, []), now = new Date(), skipped = storage.get("how-i-hear-music:rediscovery-skips:v1", {}) } = {}) => {
  const latest = new Map();
  entries.filter((entry) => entry.type === "rating" && entry.trackId && Number.isFinite(new Date(entry.at).getTime())).forEach((entry) => { if (!latest.has(entry.trackId) || new Date(entry.at) > new Date(latest.get(entry.trackId).at)) latest.set(entry.trackId, entry); });
  const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6); const skipCutoff = new Date(now); skipCutoff.setDate(skipCutoff.getDate() - 7);
  return [...latest.values()].filter((entry) => new Date(entry.at) <= cutoff && (!skipped[entry.trackId] || new Date(skipped[entry.trackId]) <= skipCutoff)).map((entry) => ({ entry, track: allTracks().find((track) => trackId(track) === entry.trackId), ageMonths: Math.max(6, Math.floor((now - new Date(entry.at)) / 2629800000)) })).filter((item) => item.track).sort((a, b) => new Date(a.entry.at) - new Date(b.entry.at));
};
