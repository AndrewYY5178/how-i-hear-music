import assert from 'node:assert/strict';
import { curlPoint, pageCurlFrame } from '../modules/layout/page-curl.js';

for (const [width, height] of [[343, 440], [840, 592], [980, 690]]) {
  for (const progress of [0, .2, .37, .55, .72, 1]) {
    for (let x = -width / 2; x < width / 2; x += width / 20) {
      for (let y = -height / 2; y < height / 2; y += height / 20) {
        const p = curlPoint(x, y, progress, width, height);
        assert.ok(Object.values(p).every(Number.isFinite));
        if (progress <= .2) assert.deepEqual(p, { x, y, z: 0, curl: 0 });
        // Locally isometric: neither horizontal nor vertical paper fibres stretch.
        for (const [dx, dy] of [[.01, 0], [0, .01]]) {
          const q = curlPoint(x + dx, y + dy, progress, width, height);
          assert.ok(Math.abs(Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) - .01) < .00001);
        }
      }
    }
  }
  const corner = curlPoint(width / 2, -height / 2, .37, width, height);
  assert.ok(corner.x < width / 2 && corner.y > -height / 2 && corner.z > 0);
  let previousX = width / 2;
  let previousSlope = Infinity;
  for (let progress = .23; progress <= .96; progress += .01) {
    const frame = pageCurlFrame(progress, width, height);
    const p = curlPoint(width / 2, -height / 2, progress, width, height, frame);
    assert.ok(Math.abs(p.x - width / 2 - frame.dx) < 1e-6);
    assert.ok(Math.abs(p.y + height / 2 - frame.dy) < 1e-6);
    const r = frame.orbitRadius;
    const orbitDistance = Math.hypot(frame.dx + r * Math.SQRT1_2, frame.dy + r * Math.SQRT1_2);
    if (frame.exit === 0) assert.ok(Math.abs(orbitDistance - r) < 1e-6);
    assert.ok(p.x < previousX);
    const slope = Math.abs(frame.ny / frame.nx);
    assert.ok(slope <= previousSlope);
    previousX = p.x; previousSlope = slope;
  }
  assert.ok(Math.abs(pageCurlFrame(1, width, height).ny) < 1e-12);
  for (const progress of [.74, .78, .82, .9]) {
    const frame = pageCurlFrame(progress, width, height);
    assert.equal(frame.ny, 0);
    assert.equal(frame.nx, 1);
  }
  assert.ok(pageCurlFrame(.74, width, height).crease > -width / 2,
    'Vertical finishing fold must still be visible');
}
console.log('Page curl: stationary region, finite coordinates, bottom-right lift and local paper-length preservation passed at three aspect ratios.');
