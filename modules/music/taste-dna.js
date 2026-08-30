import { allTracks, storage, trackId } from "./data.js";
import { currentEvidence, ratingChanges } from "./analysis.js";
import { insightTagsOf } from "./insights.js";
import { readSonic } from "./sonic.js";

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const overall = (record) => Number(record.scores?.overall);
const has = (record, tag) => insightTagsOf(record).includes(tag);
const rootId = (record) => record.baseTrackId || trackId(record);
const momentSeconds = (record) => {
  const parts = String(record.moment?.timestamp || "").split(":").map(Number);
  return parts.length === 2 && parts.every(Number.isFinite) ? parts[0] * 60 + parts[1] : 0;
};

export const tasteTraitDefinitions = [
  { id: "melodic-surprise", label: "Melodic Surprise", copy: "Melody matters most when it withholds something, then reveals it.", match: (r) => has(r, "melody") && has(r, "surprise") },
  { id: "harmony-sensitivity", label: "Harmony Sensitivity", copy: "Harmony repeatedly carries more than surface polish.", match: (r) => has(r, "harmony") },
  { id: "dynamic-arrangement", label: "Dynamic Arrangement", copy: "Movement and structural change are recurring reasons to return.", match: (r) => has(r, "arrangement") },
  { id: "groove-affinity", label: "Groove Affinity", copy: "Rhythmic feel repeatedly turns craft into attachment.", match: (r) => has(r, "groove") },
  { id: "human-imperfection", label: "Human Imperfection", copy: "Explicitly loose vocal texture can matter more than polish.", match: (r, c) => has(r, "vocal-texture") && Number(c.sonic[trackId(r)]?.controlledLoose) >= .3 },
  { id: "vocal-interpretation", label: "Vocal Interpretation", copy: "The voice matters as interpretation, not only technique.", match: (r) => has(r, "vocal-texture") || Number(r.scores?.vocal) >= 9 && overall(r) >= 8.5 },
  { id: "production-curiosity", label: "Production Curiosity", copy: "Production earns attention when it changes how the song is understood.", match: (r) => Number(r.scores?.production) >= 9 && overall(r) >= 8.5 },
  { id: "slow-burn-melody", label: "Slow-Burn Melody", copy: "Some melodies become clearer through return rather than impact.", match: (r, c) => has(r, "melody") && Number(c.changes.get(trackId(r))) >= .8 },
  { id: "atmospheric-restraint", label: "Atmospheric Restraint", copy: "Space and atmosphere recur without needing maximal density.", match: (r, c) => has(r, "atmosphere") && Number(c.sonic[trackId(r)]?.denseSparse) >= .2 },
  { id: "reinterpretation", label: "Reinterpretation", copy: "A song can stay alive by changing its performance shape.", match: (r, c) => (c.versionCounts.get(rootId(r)) || 0) > 1 },
  { id: "late-payoff", label: "Late Payoff", copy: "A decisive moment often arrives after the song has established its world.", match: (r) => has(r, "one-moment") && momentSeconds(r) >= 120 },
  { id: "structural-development", label: "Structural Development", copy: "Arrangement and surprise work together across the full form.", match: (r) => has(r, "arrangement") && has(r, "surprise") },
  { id: "minimalism-purposeful", label: "Minimalism, When Purposeful", copy: "Sparse sound works when the listening evidence names its purpose.", match: (r, c) => has(r, "atmosphere") && Number(c.sonic[trackId(r)]?.denseSparse) >= .4 && overall(r) >= 8.5 },
];

const contextFor = (records) => {
  const changes = new Map(ratingChanges().map((item) => [item.entry.trackId, item.delta]));
  const versionCounts = new Map();
  allTracks().forEach((record) => versionCounts.set(rootId(record), (versionCounts.get(rootId(record)) || 0) + 1));
  return { records, sonic: readSonic(), changes, versionCounts };
};

export const tasteDNA = ({ records = currentEvidence(), minimumEvidence = 5, now = new Date() } = {}) => {
  const scored = records.filter((record) => Number.isFinite(overall(record))); const baseline = scored.length ? scored.reduce((sum, record) => sum + overall(record), 0) / scored.length : 0; const context = contextFor(scored);
  const journal = storage.get("how-i-hear-music:journal:v1", []); const latestByTrack = new Map();
  journal.filter((entry) => entry.trackId && Number.isFinite(new Date(entry.at).getTime())).forEach((entry) => { if (!latestByTrack.has(entry.trackId) || new Date(entry.at) > new Date(latestByTrack.get(entry.trackId))) latestByTrack.set(entry.trackId, entry.at); });
  return tasteTraitDefinitions.map((definition) => {
    const evidence = scored.filter((record) => definition.match(record, context)); const values = evidence.map(overall); const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; const deviation = values.length ? Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length) : 0;
    const recency = evidence.length ? evidence.reduce((sum, record) => { const at = latestByTrack.get(trackId(record)); if (!at) return sum + .5; const months = Math.max(0, (now - new Date(at)) / 2629800000); return sum + Math.max(.2, 1 - months / 36); }, 0) / evidence.length : 0;
    const lift = clamp01((average - baseline + 3) / 6); const quality = clamp01(average / 11); const consistency = clamp01(1 - deviation / 3); const score = clamp01(quality * .55 + lift * .3 + consistency * .15); const confidence = clamp01(Math.min(1, evidence.length / 10) * .6 + consistency * .25 + recency * .15);
    return { ...definition, score, confidence, evidenceCount: evidence.length, evidence, average, baseline };
  }).filter((trait) => trait.evidenceCount >= minimumEvidence).sort((a, b) => b.score * b.confidence - a.score * a.confidence || b.evidenceCount - a.evidenceCount);
};

export const activatedTraits = (record, traits = tasteDNA()) => {
  if (!record) return [];
  const context = contextFor(currentEvidence());
  return traits.filter((trait) => trait.match(record, context));
};

export const blindSpots = ({ records = currentEvidence(), traits = tasteDNA(), albums = [], journal = storage.get("how-i-hear-music:journal:v1", []) } = {}) => {
  const spots = [];
  traits.forEach((trait) => {
    const artists = [...new Set(trait.evidence.map((record) => record.artist).filter(Boolean))]; const coverageGap = clamp01(1 - artists.length / 5);
    if (artists.length <= 2 && coverageGap >= .5) spots.push({ id: `trait-${trait.id}`, type: "TRAIT BLIND SPOT", title: `${trait.label} beyond the current core`, copy: `This trait is strong, but its evidence comes from only ${artists.length} ${artists.length === 1 ? "artist" : "artists"}. The gap is breadth, not certainty.`, affinity: trait.score, coverageGap, confidence: trait.confidence, score: trait.score * coverageGap * trait.confidence, links: trait.evidence.slice(0, 3).map((record) => ({ href: `/archive/tracks/${trackId(record)}`, label: record.title })) });
  });
  const completedAlbums = new Set(journal.filter((entry) => entry.type === "album").map((entry) => entry.artist));
  const byArtist = new Map(); records.filter((record) => overall(record) >= 8.5).forEach((record) => byArtist.set(record.artist, [...(byArtist.get(record.artist) || []), record]));
  for (const [artist, artistTracks] of byArtist) {
    const average = artistTracks.reduce((sum, record) => sum + overall(record), 0) / artistTracks.length;
    if (artistTracks.length >= 3 && average >= 8.5 && !completedAlbums.has(artist)) {
      const archiveAlbums = albums.filter((album) => album.artist === artist); const coverageGap = archiveAlbums.length ? .75 : 1;
      spots.push({ id: `album-${artist}`, type: "ALBUM BLIND SPOT", title: `${artist} beyond individual tracks`, copy: `${artistTracks.length} tracks average ${average.toFixed(1)}, but no complete album rating is recorded. This is an unexplored depth, not a prediction.`, affinity: clamp01(average / 11), coverageGap, confidence: clamp01(artistTracks.length / 8), score: clamp01(average / 11) * coverageGap * clamp01(artistTracks.length / 8), links: artistTracks.slice(0, 3).map((record) => ({ href: `/archive/tracks/${trackId(record)}`, label: record.title })) });
    }
  }
  return spots.sort((a, b) => b.score - a.score).slice(0, 5);
};
