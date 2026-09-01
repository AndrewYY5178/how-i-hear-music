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
localStorage.setItem('how-i-hear-music:journal:v1', JSON.stringify([{ id: 'journal_fixture', type: 'rating', title: 'Fixture', artist: 'Artist', scores: { song: 8, vocal: 8, production: 8, overall: 8 }, at: '2026-08-31T00:00:00.000Z' }]));

const renders = [
  ['Home', home.home],
  ['Archive tracks', archive.archiveTracks], ['Archive metadata', archive.archiveCoverage],
  ['Data Desk', imports.importData], ['Journal', journal.journal], ['Journal correction', () => journal.journalEdit('journal_fixture')], ['Entropy', journal.entropyPage],
  ['Memory Palace', journal.memoryPalace], ['Rate', rating.rateHome], ['Search', search.searchPage],
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
const trackIndex = archive.archiveTracks();
assert.ok(trackIndex.indexOf('track_000001') < trackIndex.indexOf('track_000002'), 'Track index does not default to rating high–low');
assert.match(trackIndex, /<option value="rating">RATING HIGH–LOW<\/option>/);
const artistIndex = archive.archiveArtists();
assert.ok(artistIndex.indexOf('shan-yichun') < artistIndex.indexOf('ariana-grande'), 'Artist index does not default to average rating high–low');
localStorage.setItem('how-i-hear-music:album-draft:ariana-grande-sweetener:overall', '10');
localStorage.setItem('how-i-hear-music:album-draft:ariana-grande-yours-truly:overall', '8');
const albumIndex = archive.archiveAlbums();
assert.ok(albumIndex.indexOf('ariana-grande-sweetener') < albumIndex.indexOf('ariana-grande-yours-truly'), 'Album index does not default to album rating high–low');

console.log(`Route render checks passed: ${renders.length} reliability, retrieval and analysis views.`);
