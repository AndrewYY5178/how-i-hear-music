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
const { decryptBackup, exportBackup, exportEncryptedBackup, migrateLocalData, recoverySnapshots, restoreBackup } = await import('../modules/music/resilience.js');
const { metadataCoverage, saveMetadataOverride } = await import('../modules/music/metadata.js');
const { journalEntry, updateJournalEntry } = await import('../modules/music/journal.js');
const { albumNote, albumNotesKey, saveAlbumNote } = await import('../modules/music/notes.js');
const { blindSpots } = await import('../modules/music/taste-dna.js');

storage.set('how-i-hear-music:journal:v1', [{ type: 'rating', at: '2026-01-01T00:00:00.000Z', title: 'Before IDs' }]);
const migration = migrateLocalData();
assert.equal(migration.to, 1);
assert.match(storage.get('how-i-hear-music:journal:v1', [])[0].id, /^journal_/);

const firstTrack = allTracks()[0];
saveMetadataOverride(trackId(firstTrack), { album: 'Confirmed Album', releaseDate: '2026-08-31', language: 'Chinese', region: 'Mainland China', sourceNote: 'Owner confirmed' });
assert.equal(allTracks()[0].album, 'Confirmed Album');
assert.equal(metadataCoverage().fields.album > 0, true);
assert.throws(() => saveMetadataOverride(trackId(firstTrack), { releaseDate: '31/08/2026' }), /YYYY/);
assert.throws(() => saveMetadataOverride(trackId(firstTrack), { sourceUrl: 'http://example.com' }), /HTTPS/);

const historicalId = storage.get('how-i-hear-music:journal:v1', [])[0].id;
updateJournalEntry(historicalId, { title: 'Corrected history', artist: 'Artist', song: '8.2', vocal: '8.4', production: '8.1', overall: '8.3', note: 'Corrected note', momentTimestamp: '2:47', momentNote: 'Harmony enters' });
assert.equal(journalEntry(historicalId).scores.overall, 8.3);
assert.equal(journalEntry(historicalId).revisionCount, 1);
assert.throws(() => updateJournalEntry(historicalId, { overall: '12' }), /between 0 and 11/);

saveAlbumNote('album-test', 'The second half keeps opening outward.');
assert.equal(albumNote('album-test').note, 'The second half keeps opening outward.');

const backup = exportBackup();
assert.equal(backup.version, 2);
assert.ok(backup.data['how-i-hear-music:metadata-overrides:v1']);
assert.ok(backup.data[albumNotesKey]);
localStorage.clear();
assert.equal(restoreBackup(backup) > 0, true);
assert.equal(allTracks()[0].album, 'Confirmed Album');
const encrypted = await exportEncryptedBackup('correct horse battery staple');
assert.equal(encrypted.format, 'how-i-hear-music-encrypted-backup');
assert.ok((await decryptBackup(encrypted, 'correct horse battery staple')).data['how-i-hear-music:metadata-overrides:v1']);
await assert.rejects(() => decryptBackup(encrypted, 'wrong password'), /could not be opened/);

const coverageRecords = Array.from({ length: 10 }, (_, index) => ({ id: `coverage-${index}`, title: `Coverage ${index}`, artist: `Artist ${index}`, language: index < 8 ? 'Chinese' : 'English', releaseDate: index < 8 ? '2024-01-01' : '2014-01-01', scores: { overall: 8 } }));
storage.set('how-i-hear-music:sonic-descriptors:v1', Object.fromEntries(coverageRecords.map((record, index) => [record.id, index < 6 ? { warmCold: -0.5, denseSparse: -0.5 } : index < 8 ? { warmCold: 0.5, denseSparse: -0.5 } : { warmCold: -0.5, denseSparse: 0.5 }])));
const coverageGaps = blindSpots({ records: coverageRecords, traits: [], albums: [], journal: [] }).map((spot) => spot.id);
assert.ok(coverageGaps.includes('language-breadth'));
assert.ok(coverageGaps.includes('era-breadth'));
assert.ok(coverageGaps.includes('sonic-quadrant'));

storage.set('how-i-hear-music:test-value', { version: 1 });
storage.set('how-i-hear-music:test-value', { version: 2 });
storage.remove('how-i-hear-music:test-value');
assert.equal(recoverySnapshots().some((snapshot) => snapshot.key === 'how-i-hear-music:test-value' && snapshot.value?.version === 2), true);

console.log('Core data checks passed: correction history, metadata, notes, encrypted backup, coverage gaps and recovery.');
