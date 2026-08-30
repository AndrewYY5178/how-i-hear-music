export const insightTags = ["melody", "harmony", "groove", "arrangement", "vocal-texture", "lyric", "one-moment", "atmosphere", "surprise", "inexplicable"];
export const insightLabel = {
  melody: "MELODY", harmony: "HARMONY", groove: "GROOVE", arrangement: "ARRANGEMENT",
  "vocal-texture": "VOCAL TEXTURE", lyric: "LYRIC", "one-moment": "ONE MOMENT",
  atmosphere: "ATMOSPHERE", surprise: "SURPRISE", inexplicable: "INEXPLICABLE",
};
const aliases = { vocal: "vocal-texture", "one moment": "one-moment", "can't explain": "inexplicable", "cant explain": "inexplicable" };
export const normalizeInsightTag = (value) => {
  const key = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  return aliases[key] || key;
};
export const normalizeInsightTags = (values = []) => [...new Set(values.map(normalizeInsightTag).filter((value) => insightTags.includes(value)))];
export const insightTagsOf = (record = {}) => normalizeInsightTags(record.insightTags || record.reasons || record.tags || []);

export const insightStats = (records, minimumOverall = 9) => {
  const eligible = records.filter((record) => Number(record.scores?.overall) >= minimumOverall);
  const tagged = eligible.filter((record) => insightTagsOf(record).length);
  return insightTags.map((tag) => ({ tag, count: tagged.filter((record) => insightTagsOf(record).includes(tag)).length, total: tagged.length }))
    .filter((item) => item.count).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
};
