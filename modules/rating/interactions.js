export const clampScore = (value, minimum = 0, maximum = 11) => {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : minimum;
  return Math.max(minimum, Math.min(maximum, Math.round(safe * 10) / 10));
};

export const scoreFromKey = (key, current, minimum = 0, maximum = 11) => {
  if (key === "Home") return minimum;
  if (key === "End") return maximum;
  const step = { ArrowUp: 0.1, ArrowRight: 0.1, ArrowDown: -0.1, ArrowLeft: -0.1, PageUp: 1, PageDown: -1 }[key];
  return step === undefined ? null : clampScore(Number(current) + step, minimum, maximum);
};

export const radarScoreFromPointer = (clientX, clientY, rect, fieldIndex) => {
  const x = (clientX - rect.left) / rect.width * 220;
  const y = (clientY - rect.top) / rect.height * 220;
  const angle = -Math.PI / 2 + Math.PI * 2 * fieldIndex / 4;
  const projected = ((x - 110) * Math.cos(angle) + (y - 110) * Math.sin(angle)) / 70 * 11;
  return clampScore(projected);
};

export const waveformScoreFromPointer = (clientY, rect) => {
  const svgY = (clientY - rect.top) / rect.height * 180;
  const score = 5 + ((180 - 24 - svgY) / (180 - 48)) * 6;
  return clampScore(score, 5, 11);
};
