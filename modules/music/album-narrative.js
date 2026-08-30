const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
export const albumNarrative = (tracks) => {
  const list = tracks || []; const values = list.map((track) => track.overall ?? track.scores?.overall).filter((value) => value !== null && value !== undefined && value !== "").map(Number).filter(Number.isFinite);
  if (values.length < 3 || values.length !== list.length) return null;
  const mean = average(values); const deviation = Math.sqrt(average(values.map((value) => (value - mean) ** 2))); const peak = Math.max(...values); const peakIndex = values.indexOf(peak); const range = peak - Math.min(...values);
  const sectionSize = Math.max(1, Math.ceil(values.length / 3)); const opening = average(values.slice(0, sectionSize)); const ending = average(values.slice(-sectionSize)); const clauses = [];
  if (deviation <= 0.45) clauses.push("a highly consistent course"); else if (range >= 2.5) clauses.push("a wide, uneven range"); else clauses.push("a gently changing course");
  if (peak - mean > 1.5 && values.filter((value) => peak - value < 0.35).length === 1) clauses.push("one dominant peak");
  else if (peakIndex >= Math.floor(values.length * .75)) clauses.push("the highest point arriving late");
  else if (peakIndex < Math.ceil(values.length * .25)) clauses.push("the highest point arriving early");
  else clauses.push("the strongest rise near the middle");
  if (ending - opening >= .75) clauses.push("an ending that sits above the opening"); else if (opening - ending >= .75) clauses.push("an opening that sits above the ending");
  return `The rating shape follows ${clauses.slice(0, 2).join(", with ")}${clauses[2] ? `, and ${clauses[2]}` : ""}.`;
};
