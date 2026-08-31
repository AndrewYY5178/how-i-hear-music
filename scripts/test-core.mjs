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
const { decryptBackup, exportBackup, exportEncryptedBackup, migrateLocalData, previewRestore, recoverySnapshots, restoreBackup, restoreLastRollback } = await import('../modules/music/resilience.js');
const { metadataCoverage, metadataOverrideFor, saveMetadataOverride } = await import('../modules/music/metadata.js');
const { journalEntry, updateJournalEntry } = await import('../modules/music/journal.js');
const { albumNote, albumNotesKey, saveAlbumNote } = await import('../modules/music/notes.js');
const { blindSpots, sonicQuadrant } = await import('../modules/music/taste-dna.js');
const { readRatings, saveAlbumTrackRatings, saveRatingRecord, validScore } = await import('../modules/music/lifecycle.js');
const { formatTranslatedText, translateText } = await import('../modules/layout/i18n.js');

assert.equal(translateText('Rate', 'zh-CN'), '评分');
assert.equal(translateText('SONG', 'zh-CN'), '歌曲');
assert.equal(translateText('Decrease Vocal score', 'zh-CN'), '降低演唱评分');
assert.equal(translateText('Ariana Grande', 'zh-CN'), 'Ariana Grande');
assert.equal(translateText('12 heard · 3 waiting', 'zh-CN'), '听过 12 首 · 还有 3 首待评分');
assert.equal(translateText('The human voice stays human.', 'zh-CN'), '人声不该失去人的痕迹。');
assert.equal(translateText('2026 IN MUSIC', 'zh-CN'), '2026 年的音乐');
assert.equal(translateText('8 TRACKS · AVG 9.4 VS ARCHIVE 6.6 · 74% CONFIDENCE', 'zh-CN'), '8 首歌 · 平均 9.4，档案基准 6.6 · 可信度 74%');
assert.equal(translateText('SYNC NOW', 'zh-CN'), '立即同步');
assert.equal(translateText('12 tracks · last checked 8/31/2026', 'zh-CN'), '12 首 · 最近检查于 8/31/2026');
assert.equal(translateText('3 added · 2 removed', 'zh-CN'), '新增 3 首 · 移除 2 首');
assert.equal(translateText('READING PLAYLIST…', 'zh-CN'), '正在读取歌单……');
assert.equal(translateText('IMPORT 14 TO INBOX', 'zh-CN'), '将 14 首歌加入收件箱');
assert.equal(translateText('0 Existing', 'zh-CN'), '已存在 0 首');
assert.equal(formatTranslatedText('Begin with one listening decision.', { target: 'zh-CN', heading: true }), '先听，再作出判断');
assert.equal(formatTranslatedText('Begin with one listening decision.', { target: 'zh-CN' }), '先听，再作出判断。');
assert.equal(formatTranslatedText('Taste over time.', { target: 'zh-CN', heading: true }), '一路听来，什么变了？');
assert.equal(translateText('Rate', 'en'), 'Rate');

storage.set('how-i-hear-music:journal:v1', [{ type: 'rating', at: '2026-01-01T00:00:00.000Z', title: 'Before IDs' }]);
const migration = migrateLocalData();
assert.equal(migration.to, 1);
assert.match(storage.get('how-i-hear-music:journal:v1', [])[0].id, /^journal_/);

const firstTrack = allTracks()[0];
saveMetadataOverride(trackId(firstTrack), { album: 'Confirmed Album', albumSourceUrl: 'https://example.com/album', albumSourceNote: 'Owner confirmed', releaseDate: '2026-08-31', language: 'Chinese', region: 'Mainland China' });
assert.equal(allTracks()[0].album, 'Confirmed Album');
assert.equal(metadataCoverage().fields.album > 0, true);
assert.equal(metadataOverrideFor(trackId(firstTrack)).fields.album.sourceUrl, 'https://example.com/album');
assert.throws(() => saveMetadataOverride(trackId(firstTrack), { releaseDate: '31/08/2026' }), /YYYY/);
assert.throws(() => saveMetadataOverride(trackId(firstTrack), { album: 'Another Album', albumSourceUrl: 'http://example.com' }), /HTTPS/);

const historicalId = storage.get('how-i-hear-music:journal:v1', [])[0].id;
updateJournalEntry(historicalId, { title: 'Corrected history', artist: 'Artist', song: '8.2', vocal: '8.4', production: '8.1', overall: '8.3', note: 'Corrected note', momentTimestamp: '2:47', momentNote: 'Harmony enters' });
assert.equal(journalEntry(historicalId).scores.overall, 8.3);
assert.equal(journalEntry(historicalId).revisionCount, 1);
assert.equal(journalEntry(historicalId).title, 'Before IDs');
assert.throws(() => updateJournalEntry(historicalId, { overall: '12' }), /between 0 and 11/);

assert.equal(validScore('8.26'), 8.3);
assert.throws(() => validScore(''), /confirmed/);
assert.throws(() => saveRatingRecord('partial-track', { scores: { overall: 8 } }), /confirmed/);
const albumRating = saveAlbumTrackRatings({ album: { title: 'Verified Album', artist: 'Artist' }, tracks: [{ trackId: 'verified-1', title: 'First', overall: 8.4 }, { trackId: 'verified-2', title: 'Second', overall: 9.1 }] });
assert.equal(albumRating.confirmed.length, 2);
assert.equal(readRatings()['verified-2'].scores.overall, 9.1);
assert.throws(() => saveAlbumTrackRatings({ album: { title: 'Broken' }, tracks: [{ trackId: 'verified-1', title: 'First', overall: null }] }), /confirmed/);

saveAlbumNote('album-test', 'The second half keeps opening outward.');
assert.equal(albumNote('album-test').note, 'The second half keeps opening outward.');

const backup = exportBackup();
assert.equal(backup.version, 2);
assert.ok(backup.data['how-i-hear-music:metadata-overrides:v1']);
assert.ok(backup.data[albumNotesKey]);
localStorage.clear();
assert.equal(restoreBackup(backup) > 0, true);
assert.equal(allTracks()[0].album, 'Confirmed Album');
saveAlbumNote('album-test', 'Local conflict value');
assert.equal(previewRestore(backup).conflicts > 0, true);
restoreBackup(backup, { conflictPolicy: 'backup' });
assert.equal(albumNote('album-test').note, 'The second half keeps opening outward.');
assert.equal(restoreLastRollback() > 0, true);
assert.equal(albumNote('album-test').note, 'Local conflict value');
const encrypted = await exportEncryptedBackup('correct horse battery staple');
assert.equal(encrypted.format, 'how-i-hear-music-encrypted-backup');
assert.ok((await decryptBackup(encrypted, 'correct horse battery staple')).data['how-i-hear-music:metadata-overrides:v1']);
await assert.rejects(() => decryptBackup(encrypted, 'wrong password'), /could not be opened/);

const coverageRecords = Array.from({ length: 10 }, (_, index) => ({ id: `coverage-${index}`, title: `Coverage ${index}`, artist: `Artist ${index}`, language: index < 7 ? 'Chinese' : index === 7 ? '中文' : 'English', releaseDate: index < 8 ? '2024-01-01' : '2014-01-01', scores: { overall: 8 } }));
storage.set('how-i-hear-music:sonic-descriptors:v1', Object.fromEntries(coverageRecords.map((record, index) => [record.id, index < 6 ? { warmCold: -0.5, denseSparse: -0.5 } : index < 8 ? { warmCold: 0.5, denseSparse: -0.5 } : { warmCold: -0.5, denseSparse: 0.5 }])));
const coverageGaps = blindSpots({ records: coverageRecords, traits: [], albums: [], journal: [] }).map((spot) => spot.id);
assert.ok(coverageGaps.includes('language-breadth'));
assert.ok(coverageGaps.includes('era-breadth'));
assert.ok(coverageGaps.includes('sonic-quadrant'));
assert.equal(sonicQuadrant({ warmCold: 0, denseSparse: 0 }), null);
assert.equal(sonicQuadrant({ warmCold: -.5, denseSparse: .5 }), 'warm / sparse');

storage.set('how-i-hear-music:test-value', { version: 1 });
storage.set('how-i-hear-music:test-value', { version: 2 });
storage.remove('how-i-hear-music:test-value');
assert.equal(recoverySnapshots().some((snapshot) => snapshot.key === 'how-i-hear-music:test-value' && snapshot.value?.version === 2), true);

console.log('Core data checks passed: rating identity, field provenance, album persistence, restore rollback, encryption and evidence gates.');
