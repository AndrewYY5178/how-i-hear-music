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
const { translateText } = await import('../modules/layout/i18n.js');
const stylesheet = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const shellSource = await readFile(new URL('../modules/layout/shell.js', import.meta.url), 'utf8');
const homeSource = await readFile(new URL('../modules/home.js', import.meta.url), 'utf8');
const archiveSource = await readFile(new URL('../modules/archive/pages.js', import.meta.url), 'utf8');
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
['纯妹妹', 'Lover', 'Graduation', 'Golden Hour', 'Un Verano Sin Ti', 'BRAT', 'Loud', 'Mylo Xyloto', '72 Seasons'].forEach((title) => assert.match(homeMarkup, new RegExp(`<b>${title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}</b>`), `Home showcase is missing ${title}`));
const mergedTaste = taste.tasteHome();
assert.match(mergedTaste, /taste-merged-index/);
assert.match(mergedTaste, /LISTENING JOURNAL/);
assert.match(mergedTaste, /\/taste\/journal/);
[
  'One personal listening archive: its overview, history and transparent insights.',
  '01 / LISTENING DNA →',
  'The shape of the archive, its method and its recurring signals.',
  "combines the supporting tracks' average Overall, lift above your archive baseline and score consistency.",
  'BLIND SPOT 01 · ALBUM BLIND SPOT',
  '9 TRACK GLYPHS · 0 ALBUM TERRAINS · 4 ARTIST SIGNATURES',
  'REDISCOVER · 20 MONTHS AGO',
  '2 MOST RECENT',
].forEach((label) => assert.notEqual(translateText(label, 'zh-CN'), label, `Taste Chinese translation missing: ${label}`));
const mergedJournal = journal.journal("/taste/journal");
assert.match(mergedJournal, /journal-recent/);
assert.match(mergedJournal, /\/taste\/journal\/year\//);
assert.doesNotMatch(shellSource, /\["\/journal", "Journal"\]/);
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
['纯妹妹', 'Lover', 'Graduation', 'Golden Hour', 'Un Verano Sin Ti', 'BRAT', 'Loud', 'Mylo Xyloto', '72 Seasons'].forEach((title) => assert.doesNotMatch(albumIndex, new RegExp(`<h3>${title}`), `Showcase-only album leaked into the Archive: ${title}`));
assert.doesNotMatch(albumIndex, /Open album|OPEN ALBUM/);
assert.match(albumIndex, /<a class="album-card"[^>]+data-route/);
assert.match(albumIndex, /album-card-disc/);
assert.match(albumIndex, /album-card-terrain/);
assert.match(albumIndex, /RATING —/);
assert.match(stylesheet, /\.album-card\.record-is-retracting \.album-card-cover \{ transform:none; box-shadow:none; transition-duration:280ms,220ms; \}/);
assert.match(stylesheet, /\.album-card\.record-is-open \.album-card-disc \{ opacity:1; transform:translate\(32%,0\) rotateY\(-6deg\) rotateZ\(18deg\) scale\(\.96\); \}/);
const albumDetail = archive.archiveAlbumDetail('陶喆-黑色柳丁');
assert.match(albumDetail, /name="coverFile"/);
assert.match(albumDetail, /data-reextract-tone/);
assert.match(albumDetail, /class="album-detail-image" data-cover-tone/);
assert.match(albumDetail, /never uploaded/);
['RE-EXTRACT COLOR', 'Theme color is sampled from the current cover when possible.', 'Re-reading cover pixels…', 'Color extraction retried. The sleeve will use the new sample when available.', 'Could not re-extract the cover color.'].forEach((label) => assert.notEqual(translateText(label, 'zh-CN'), label, `Archive color extraction translation missing: ${label}`));
localStorage.setItem('how-i-hear-music:cover-overrides:v1', JSON.stringify({ '陶喆-陶喆': 'https://invalid.example/missing.jpg' }));
const fallbackAlbumIndex = archive.archiveAlbums();
assert.match(fallbackAlbumIndex, /data-cover-fallback-source="https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music125/);
localStorage.removeItem('how-i-hear-music:cover-overrides:v1');
localStorage.setItem('how-i-hear-music:cover-overrides-local:v1', JSON.stringify({ '陶喆-陶喆': 'data:image/png;base64,fixture' }));
assert.match(archive.archiveAlbums(), /data-cover-source="data:image\/png;base64,fixture"/);
localStorage.removeItem('how-i-hear-music:cover-overrides-local:v1');
localStorage.setItem('how-i-hear-music:imported-albums:v1', JSON.stringify([{ id: 'taylor-swift-lover', title: 'Lover', artist: 'Taylor Swift' }]));
const signedOutWithLocalSample = home.home();
assert.match(signedOutWithLocalSample, /<b>纯妹妹<\/b>/, 'Signed-out showcase lost 纯妹妹 when a local sample album exists');
localStorage.removeItem('how-i-hear-music:imported-albums:v1');
assert.match(stylesheet, /\.album-card:nth-child\(3n\).*\.album-card-record/);
assert.doesNotMatch(stylesheet, /\.album-card:nth-child\(3n\)[^{]+\.album-card-disc/);
assert.match(stylesheet, /\.import-album-disc \{ top:1%; right:0; width:98%/);
assert.match(stylesheet, /\.home-record-controls \{[^}]+z-index:30/);
assert.match(stylesheet, /@media \(max-width:900px\)[\s\S]*?\.home-record-controls \{[\s\S]*?top:calc\(33% \+ clamp\(230px,65vw,270px\)\) !important;[\s\S]*?bottom:auto !important;/);
assert.match(shellSource, /class="account-panel-title\$\{signedIn \? "" : " account-signed-out"\}"/);
assert.match(shellSource, /data-account-sign-in[^>]*aria-label="Sign in with GitHub">GITHUB/);
assert.match(shellSource, /data-account-email-sign-in[^>]*aria-label="Sign in with email">EMAIL/);
assert.doesNotMatch(shellSource, /class="account-close"/);
assert.match(shellSource, /\["\/import", "Import", "import"\]/);
assert.doesNotMatch(shellSource, /data-mobile-more|mobile-more-panel/);
const importHomeMarkup = imports.importHome();
const importQQMarkup = imports.importQQ();
assert.match(importHomeMarkup, /class="secondary-nav"[\s\S]*?>Import<\/a>[\s\S]*?>Inbox<\/a>[\s\S]*?>Data Desk<\/a>/);
assert.match(importHomeMarkup, /<span class="mono">QQ MUSIC<\/span>/);
assert.match(importQQMarkup, /01 \/ QQ MUSIC/);
assert.doesNotMatch(importQQMarkup, /QQ MUSIC SMART IMPORT/);
assert.doesNotMatch(stylesheet, /\.account-login-options \{[^}]*border-top/);
assert.match(stylesheet, /\.home-record\[data-record-position="left-4"\] \{ z-index:6; opacity:\.5;/);
assert.match(stylesheet, /\.home-record\[data-record-position="right-3"\] \{ opacity:\.5;/);
assert.match(stylesheet, /UI 3\.11\.22 — make the 50% side-record floor win/);
assert.match(stylesheet, /UI 3\.11\.27 — keep every visible side record fully opaque/);
assert.match(stylesheet, /left-4"\],\.home-record\[data-record-position="right-4"\].*opacity:1 !important/);
assert.doesNotMatch(homeMarkup, /class="feature-score"/);
assert.match(homeMarkup, /class="radar-value-label"/);
assert.match(homeMarkup, /data-radar-placement="outside"/);
assert.match(stylesheet, /\.home-record\.record-is-retracting \.home-record-disc,\.album-card\.record-is-retracting \.album-card-disc \{ transition-duration:280ms,220ms; \}/);
assert.match(homeSource, /recordMoveTimer = window\.setTimeout\(\(\) => \{/);
assert.match(homeSource, /\}, 180\);/);
assert.match(archiveSource, /openTimer = window\.setTimeout\(\(\) => \{ card\.classList\.add\("record-is-open"\)/);
assert.match(archiveSource, /openTarget = null; openTimer = null; \}, 180\);/);
localStorage.setItem('how-i-hear-music:cloud-sync-session:v1', JSON.stringify({ token: 'fixture', user: { id: 1, login: 'fixture' } }));
localStorage.setItem('how-i-hear-music:album-draft:charli-xcx-brat:overall', '10');
localStorage.setItem('how-i-hear-music:imported-albums:v1', JSON.stringify([{ id: 'album_fixture', title: 'Fixture Album', artist: 'Fixture Artist', tracks: [{ id: 'track_fixture', title: 'Fixture Track', artist: 'Fixture Artist', trackNumber: 1 }] }]));
localStorage.setItem('how-i-hear-music:album-draft:album_fixture', JSON.stringify([{ trackId: 'track_fixture', title: 'Fixture Track', overall: 8.5 }]));
const albumRateMarkup = rating.rateAlbum('album_fixture');
assert.match(albumRateMarkup, /class="album-score-input"/);
assert.match(albumRateMarkup, /data-album-input/);
assert.match(archive.archiveAlbumDetail('album_fixture'), /M24 79/);
localStorage.setItem('how-i-hear-music:imported-albums:v1', JSON.stringify([
  { id: '单依纯-纯妹妹', title: '纯妹妹', artist: '单依纯' },
  { id: '单依纯-勇敢额度', title: '勇敢额度', artist: '单依纯' },
  { id: '王力宏-十八般武艺', title: '十八般武艺', artist: '王力宏' },
  { id: '王力宏-不可思议', title: '不可思议', artist: '王力宏' },
  { id: '王力宏-唯一', title: '唯一', artist: '王力宏' },
  { id: '陶喆-陶喆', title: '陶喆', artist: '陶喆' },
  { id: '陶喆-黑色柳丁', title: '黑色柳丁', artist: '陶喆' },
  { id: '陶喆-soul-power', title: 'Soul Power', artist: '陶喆' },
  { id: '祁紫檀-世界与孤独女王', title: '世界与孤独女王', artist: '祁紫檀' },
  { id: 'charli-xcx-brat', title: 'BRAT', artist: 'Charli xcx' },
]));
const fullOwnHome = home.home();
assert.doesNotMatch(fullOwnHome, /<b>Lover<\/b>/, 'Signed-in Home still mixes showcase albums after the user deck is full');
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
