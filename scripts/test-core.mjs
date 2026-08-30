import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

class LocalStorageMock {
  getItem(key) { return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : null; }
  setItem(key, value) { this[key] = String(value); }
  removeItem(key) { delete this[key]; }
  clear() { Object.keys(this).forEach((key) => delete this[key]); }
}

globalThis.localStorage = new LocalStorageMock();
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = input instanceof URL ? input : new URL(input);
  if (url.protocol !== 'file:') return nativeFetch(input, options);
  try { return new Response(await readFile(url), { status: 200, headers: { 'Content-Type': 'application/json' } }); } catch { return new Response('', { status: 404 }); }
};

const { storage, allTracks, trackId } = await import('../modules/music/data.js');
const { exportBackup, migrateLocalData, recoverySnapshots, restoreBackup } = await import('../modules/music/resilience.js');
const { metadataCoverage, saveMetadataOverride } = await import('../modules/music/metadata.js');

storage.set('how-i-hear-music:journal:v1', [{ type: 'rating', at: '2026-01-01T00:00:00.000Z', title: 'Before IDs' }]);
const migration = migrateLocalData();
assert.equal(migration.to, 1);
assert.match(storage.get('how-i-hear-music:journal:v1', [])[0].id, /^journal_/);

const firstTrack = allTracks()[0];
saveMetadataOverride(trackId(firstTrack), { album: 'Confirmed Album', releaseDate: '2026-08-31', language: 'Chinese', region: 'Mainland China', sourceNote: 'Owner confirmed' });
assert.equal(allTracks()[0].album, 'Confirmed Album');
assert.equal(metadataCoverage().fields.album > 0, true);
assert.throws(() => saveMetadataOverride(trackId(firstTrack), { releaseDate: '31/08/2026' }), /YYYY/);

const backup = exportBackup();
assert.equal(backup.version, 2);
assert.ok(backup.data['how-i-hear-music:metadata-overrides:v1']);
localStorage.clear();
assert.equal(restoreBackup(backup) > 0, true);
assert.equal(allTracks()[0].album, 'Confirmed Album');

storage.set('how-i-hear-music:test-value', { version: 1 });
storage.set('how-i-hear-music:test-value', { version: 2 });
storage.remove('how-i-hear-music:test-value');
assert.equal(recoverySnapshots().some((snapshot) => snapshot.key === 'how-i-hear-music:test-value' && snapshot.value?.version === 2), true);

console.log('Core data checks passed: migrations, metadata overlays, backup restore and recovery snapshots.');
