import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

class LocalStorageMock {
  getItem(key) { return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : null; }
  setItem(key, value) { this[key] = String(value); }
  removeItem(key) { delete this[key]; }
}
globalThis.localStorage = new LocalStorageMock();
globalThis.location = { search: '', hostname: 'localhost', pathname: '/', href: 'http://localhost:3000/' };
globalThis.window = globalThis;
globalThis.document = { querySelector: () => null };
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => { const url = input instanceof URL ? input : new URL(input); if (url.protocol !== 'file:') return nativeFetch(input, options); try { return new Response(await readFile(url), { status: 200, headers: { 'Content-Type': 'application/json' } }); } catch { return new Response('', { status: 404 }); } };

const archive = await import('../modules/archive/pages.js');
const home = await import('../modules/home.js');
const imports = await import('../modules/import/pages.js');
const journal = await import('../modules/journal/pages.js');
const rating = await import('../modules/rating/pages.js');
const search = await import('../modules/search/pages.js');
const taste = await import('../modules/taste/pages.js');
const stylesheet = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
localStorage.setItem('how-i-hear-music:journal:v1', JSON.stringify([{ id: 'journal_fixture', type: 'rating', title: 'Fixture', artist: 'Artist', scores: { song: 8, vocal: 8, production: 8, overall: 8 }, at: '2026-08-31T00:00:00.000Z' }]));

const renders = [
  ['Home', home.home],
  ['Archive', archive.archiveHome], ['Archive tracks', archive.archiveTracks], ['Archive metadata', archive.archiveCoverage],
  ['Data Desk', imports.importData], ['Journal', journal.journal], ['Journal correction', () => journal.journalEdit('journal_fixture')], ['Entropy', journal.entropyPage],
  ['Memory Palace', journal.memoryPalace], ['Rate', rating.rateHome],
  ['Taste DNA', taste.dna], ['Blind Spots', taste.blindSpotPage],
];
for (const [name, render] of renders) {
  const html = render();
  assert.equal(typeof html, 'string', `${name} did not return markup`);
  assert.match(html, /<h1>|page-head/, `${name} lacks a page heading`);
  assert.equal(html.includes('undefined'), false, `${name} exposed undefined`);
}
assert.match(rating.rateTrack('missing-track'), /Track not found/);
assert.doesNotMatch(rating.rateTrack('missing-track'), /SAVE RATING/);
assert.match(rating.rateAlbum('missing-album'), /Album not found/);
const blockedAlbum = rating.rateAlbum('单依纯-纯妹妹');
assert.match(blockedAlbum, /CONFIRMED TRACK ORDER REQUIRED/);
assert.doesNotMatch(blockedAlbum, /Track 01|7\.6/);

const homeMarkup = home.home();
assert.doesNotMatch(homeMarkup, /READ THE METHOD|EXPLORE TRACK|EXPLORE ALBUM|ENTER THE ARCHIVE|ABOUT THIS ARCHIVE|card-link/);
const archiveHome = archive.archiveHome();
assert.match(archiveHome, /class="archive-search"/);
assert.match(archiveHome, /SEARCH THE RECORD/);
assert.match(archiveHome, /id="archive-search-trigger"/);
assert.match(archiveHome, /id="archive-search-panel"[^>]+ hidden/);
location.search = '?q=Tattooed';
const searchMarkup = search.archiveSearch();
assert.match(searchMarkup, /<mark>Tattooed<\/mark> Heart/);
assert.doesNotMatch(searchMarkup, /id="archive-search-panel"[^>]+ hidden/);
location.search = '';
const trackIndex = archive.archiveTracks();
assert.ok(trackIndex.indexOf('track_000001') < trackIndex.indexOf('track_000002'), 'Track index does not default to rating high–low');
assert.match(trackIndex, /<option value="rating">RATING HIGH–LOW<\/option>/);
const artistIndex = archive.archiveArtists();
assert.ok(artistIndex.indexOf('shan-yichun') < artistIndex.indexOf('ariana-grande'), 'Artist index does not default to average rating high–low');
localStorage.setItem('how-i-hear-music:album-draft:ariana-grande-sweetener:overall', '10');
localStorage.setItem('how-i-hear-music:album-draft:ariana-grande-yours-truly:overall', '8');
const albumIndex = archive.archiveAlbums();
assert.ok(albumIndex.indexOf('ariana-grande-sweetener') < albumIndex.indexOf('ariana-grande-yours-truly'), 'Album index does not default to album rating high–low');
assert.doesNotMatch(albumIndex, /Open album|OPEN ALBUM/);
assert.match(albumIndex, /<a class="album-card"[^>]+data-route/);
assert.match(albumIndex, /album-card-disc/);
const albumDetail = archive.archiveAlbumDetail('陶喆-黑色柳丁');
assert.match(albumDetail, /name="coverFile"/);
assert.match(albumDetail, /never uploaded/);
localStorage.setItem('how-i-hear-music:cover-overrides:v1', JSON.stringify({ '陶喆-陶喆': 'https://invalid.example/missing.jpg' }));
const fallbackAlbumIndex = archive.archiveAlbums();
assert.match(fallbackAlbumIndex, /data-cover-fallback-source="https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music125/);
localStorage.removeItem('how-i-hear-music:cover-overrides:v1');
localStorage.setItem('how-i-hear-music:cover-overrides-local:v1', JSON.stringify({ '陶喆-陶喆': 'data:image/png;base64,fixture' }));
assert.match(archive.archiveAlbums(), /data-cover-source="data:image\/png;base64,fixture"/);
localStorage.removeItem('how-i-hear-music:cover-overrides-local:v1');
assert.match(stylesheet, /\.album-card:nth-child\(3n\).*\.album-card-record/);
assert.doesNotMatch(stylesheet, /\.album-card:nth-child\(3n\)[^{]+\.album-card-disc/);
assert.match(stylesheet, /\.import-album-disc \{ top:1%; right:0; width:98%/);
assert.match(stylesheet, /\.home-record-controls \{[^}]+z-index:30/);
localStorage.setItem('how-i-hear-music:cloud-sync-session:v1', JSON.stringify({ token: 'fixture', user: { id: 1, login: 'fixture' } }));
assert.match(home.home(), /<strong>10<\/strong>/, 'Signed-in Home does not show a confirmed album score');
assert.doesNotMatch(imports.importHome(), /METADATA SERVICE|Hosted adapter configured|Local metadata adapter ready/);
location.hostname = 'example.github.io';
assert.match(imports.importHome(), /METADATA SERVICE NOT CONNECTED/);
location.hostname = 'localhost';
localStorage.setItem('how-i-hear-music:playlist-snapshots:v1', JSON.stringify({
  'https://y.qq.com/example': { source: 'qqmusic', sourceLabel: 'QQ Music', sourceUrl: 'https://y.qq.com/example', syncedAt: '2026-09-01T00:00:00.000Z', playlist: { title: 'Fixture playlist', trackCount: 1 }, tracks: [] },
}));
assert.match(imports.importInbox(), /CHECK PLAYLIST UPDATES/);
assert.doesNotMatch(imports.importInbox(), /SYNC NOW/);

console.log(`Route render checks passed: ${renders.length} reliability, retrieval and analysis views.`);
