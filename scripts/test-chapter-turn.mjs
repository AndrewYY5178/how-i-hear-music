import assert from 'node:assert/strict';
import { chapterJourney, unturnedPolygon } from '../modules/layout/chapter-turn.js';
import { pageCurlFrame } from '../modules/layout/page-curl.js';
assert.deepEqual(chapterJourney('/', '/taste'), { count:3, direction:1, duration:1300 });
assert.deepEqual(chapterJourney('/import', '/archive'), { count:3, direction:-1, duration:1300 });
assert.equal(chapterJourney('/archive', '/archive/albums/one').count, 0);
assert.equal(chapterJourney('/unknown', '/taste').count, 0);
assert.equal(chapterJourney('/', '/import').duration, 1450);
for (const width of [390,1024,1440]) for (const direction of [-1,1]) {
  for (const p of [0,.25,.5,.75,1]) assert.ok(!/NaN|Infinity/.test(unturnedPolygon(pageCurlFrame(p,width,900),width,900,direction)));
  assert.equal(unturnedPolygon(pageCurlFrame(1,width,900),width,900,direction),'polygon(0 0,0 0,0 0)');
}
console.log('Chapter direction, sheet counts, timing, child routes and clipping: passed');
