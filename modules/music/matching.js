const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase().replace(/\([^)]*(?:live|remaster|acoustic|version|版)[^)]*\)/gi, '').replace(/[^\p{L}\p{N}]+/gu, '');
const bigrams = (value) => {
  const text = normalize(value); if (text.length < 2) return new Set(text ? [text] : []);
  return new Set(Array.from({ length: text.length - 1 }, (_, index) => text.slice(index, index + 2)));
};
const dice = (left, right) => {
  const a = bigrams(left); const b = bigrams(right); if (!a.size || !b.size) return normalize(left) === normalize(right) ? 1 : 0;
  let overlap = 0; a.forEach((item) => { if (b.has(item)) overlap += 1; }); return 2 * overlap / (a.size + b.size);
};

export const matchTrack = (incoming, candidates = []) => {
  const exact = candidates.find((candidate) => normalize(candidate.title) === normalize(incoming.title) && normalize(candidate.artist) === normalize(incoming.artist));
  if (exact) return { confidence: 'auto_match', score: 1, candidate: exact };
  const ranked = candidates.map((candidate) => {
    const title = dice(incoming.title, candidate.title); const artist = dice(incoming.artist, candidate.artist); return { candidate, title, artist, score: title * .72 + artist * .28 };
  }).sort((left, right) => right.score - left.score);
  const best = ranked[0];
  if (best && best.title >= .68 && best.artist >= .45 && best.score >= .68) return { confidence: 'review', score: Math.round(best.score * 100) / 100, candidate: best.candidate };
  return { confidence: 'new_entry', score: best ? Math.round(best.score * 100) / 100 : 0, candidate: null };
};
