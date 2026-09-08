const clamp = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

// A developable cylinder: distance along the paper becomes arc length.
// The unturned side stays exactly in place. Beyond the half-cylinder the
// reverse side continues as a flat sheet, without stretching or twisting.
export function pageCurlFrame(progress, width, height) {
  const turn = smooth((progress - 0.22) / 0.52);
  const exit = smooth((progress - 0.74) / 0.22);
  const radius = Math.min(width, height) * 0.065;
  // The bottom-right corner follows a true 90-degree circular arc, rising
  // diagonally then returning to the bottom baseline. Its chord rotates from
  // diagonal to horizontal, so the curl axis naturally becomes vertical.
  // Complete the arc while a visible strip of paper remains. Then translate
  // with an exactly vertical fold, instead of only becoming vertical offscreen.
  const travel = width * 1.25;
  const orbitRadius = travel / Math.SQRT2;
  const theta = -Math.PI / 4 + turn * Math.PI / 2;
  const dx = -orbitRadius * (Math.sin(theta) + Math.SQRT1_2)
    - exit * (width * 2 + Math.PI * radius * 2 - travel);
  const dy = turn >= 1 ? 0 : orbitRadius * (Math.cos(theta) - Math.SQRT1_2);
  const length = Math.hypot(dx, dy);
  const nx = length > 1e-8 ? -dx / length : Math.SQRT1_2;
  const ny = turn >= 1 ? 0 : length > 1e-8 ? -dy / length : -Math.SQRT1_2;
  let distance;
  if (length >= Math.PI * radius) distance = (length + Math.PI * radius) / 2;
  else {
    // Invert d - r*sin(d/r) so even the initial lift follows the same arc.
    let lo = 0, hi = Math.PI * radius;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      if (mid - radius * Math.sin(mid / radius) < length) lo = mid;
      else hi = mid;
    }
    distance = length < 1e-8 ? 0 : (lo + hi) / 2;
  }
  return { nx, ny, radius, crease: nx * width / 2 - ny * height / 2 - distance,
    dx, dy, orbitRadius, turn, exit };
}

export function curlPoint(x, y, progress, width, height, frame = pageCurlFrame(progress, width, height)) {
  const { nx, ny, radius, crease } = frame;
  const distance = x * nx + y * ny - crease;
  if (distance <= 0) return { x, y, z: 0, curl: 0 };
  const angle = Math.min(Math.PI, distance / radius);
  const arc = radius * Math.sin(angle) - Math.max(0, distance - Math.PI * radius);
  const displacement = arc - distance;
  return { x: x + nx * displacement, y: y + ny * displacement,
    z: radius * (1 - Math.cos(angle)), curl: angle / Math.PI };
}
