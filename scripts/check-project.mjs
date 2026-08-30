import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchTrack } from '../modules/music/matching.js';
import { createPlaylistSnapshot, diffPlaylistSnapshots } from '../modules/music/sync.js';
import { clampScore, radarScoreFromPointer, scoreFromKey, waveformScoreFromPointer } from '../modules/rating/interactions.js';
import { withBase, withoutBase } from '../modules/layout/paths.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors = [];
const readJson = async (name) => {
  try { return JSON.parse(await readFile(join(root, 'data', name), 'utf8')); }
  catch (error) { errors.push(`${name}: invalid JSON (${error.message})`); return null; }
};
const unique = (items, label) => {
  const seen = new Set();
  items.forEach((item) => { if (!item) errors.push(`${label}: missing ID`); else if (seen.has(item)) errors.push(`${label}: duplicate ID ${item}`); else seen.add(item); });
  return seen;
};

const files = (await readdir(join(root, 'data'))).filter((name) => extname(name) === '.json');
const parsed = Object.fromEntries(await Promise.all(files.map(async (name) => [name, await readJson(name)])));
const songs = parsed['songs.json']; const artists = parsed['artists.json']; const catalog = parsed['catalog.json'];
if (songs && artists && catalog) {
  const artistIds = unique(catalog.artists.map((item) => item.id), 'artist');
  const trackIds = unique(songs.entries.map((item) => item.id), 'track');
  unique(songs.entries.map((item) => item.compositionId), 'composition');
  unique(songs.entries.map((item) => item.recordingId), 'recording');
  songs.entries.forEach((track) => {
    if (!track.title || !track.artist || !artistIds.has(track.artistId)) errors.push(`${track.id || track.title}: missing title, artist or valid artistId`);
    Object.entries(track.scores || {}).forEach(([field, value]) => { if (value !== null && (!Number.isFinite(value) || value < 0 || value > 11)) errors.push(`${track.id}: ${field} score is outside 0–11`); });
  });
  const catalogTrackIds = unique(catalog.tracks.map((item) => item.id), 'catalog track');
  unique(catalog.recordings.map((item) => item.id), 'catalog recording');
  if (catalogTrackIds.size !== trackIds.size || [...trackIds].some((id) => !catalogTrackIds.has(id))) errors.push('catalog.json tracks do not match songs.json');
  catalog.recordings.forEach((recording) => { if (!catalogTrackIds.has(recording.trackId)) errors.push(`${recording.id}: invalid track reference ${recording.trackId}`); });
}

const matchingFixture = [{ id: 'fixture_track', title: 'Tattooed Heart', artist: 'Ariana Grande' }];
if (matchTrack({ title: 'Tattooed Heart', artist: 'Ariana Grande' }, matchingFixture).confidence !== 'auto_match') errors.push('matching: exact match did not produce AUTO MATCH');
if (matchTrack({ title: 'Tattooed Hearts', artist: 'Ariana Grande' }, matchingFixture).confidence !== 'review') errors.push('matching: fuzzy match did not produce REVIEW');
if (matchTrack({ title: 'Unrelated', artist: 'Nobody' }, matchingFixture).confidence !== 'new_entry') errors.push('matching: unrelated track did not produce NEW ENTRY');

const previousSnapshot = createPlaylistSnapshot({ tracks: [{ title: 'A', artist: 'One' }, { title: 'B', artist: 'Two' }], playlist: { id: 'fixture', title: 'Fixture' }, source: 'fixture', sourceUrl: 'https://example.com/fixture' });
const currentSnapshot = createPlaylistSnapshot({ tracks: [{ title: 'B', artist: 'Two' }, { title: 'C', artist: 'Three' }], playlist: { id: 'fixture', title: 'Fixture' }, source: 'fixture', sourceUrl: 'https://example.com/fixture' });
const beforeDiff = JSON.stringify(previousSnapshot); const snapshotDiff = diffPlaylistSnapshots(previousSnapshot, currentSnapshot);
if (snapshotDiff.additions.map((track) => track.title).join() !== 'C' || snapshotDiff.removals.map((track) => track.title).join() !== 'A' || snapshotDiff.unchanged.map((track) => track.title).join() !== 'B') errors.push('sync: playlist snapshot difference is incorrect');
if (JSON.stringify(previousSnapshot) !== beforeDiff) errors.push('sync: comparing snapshots mutated the stored baseline');

if (clampScore(11.4) !== 11 || clampScore(-0.2) !== 0) errors.push('rating interaction: score clamping is incorrect');
if (scoreFromKey('ArrowUp', 7.5) !== 7.6 || scoreFromKey('PageDown', 7.5) !== 6.5 || scoreFromKey('Escape', 7.5) !== null) errors.push('rating interaction: keyboard score steps are incorrect');
const chartRect = { left: 0, top: 0, width: 220, height: 220 };
if (radarScoreFromPointer(110, 40, chartRect, 0) !== 11 || radarScoreFromPointer(110, 110, chartRect, 0) !== 0) errors.push('rating interaction: radar pointer projection is incorrect');
const waveRect = { top: 0, height: 180 };
if (waveformScoreFromPointer(24, waveRect) !== 11 || waveformScoreFromPointer(156, waveRect) !== 5) errors.push('rating interaction: waveform pointer projection is incorrect');
if (withBase('/archive', '/how-i-hear-music') !== '/how-i-hear-music/archive' || withoutBase('/how-i-hear-music/archive', '/how-i-hear-music') !== '/archive') errors.push('routing: project-site base path conversion is incorrect');
if (withBase('/', '') !== '/' || withoutBase('/archive', '') !== '/archive') errors.push('routing: root deployment path conversion is incorrect');

const sourceFiles = ['index.html', '404.html', 'terms.html', 'app.js', 'modules/home.js', 'modules/archive/pages.js', 'modules/rating/pages.js', 'modules/taste/pages.js', 'modules/import/pages.js', 'modules/journal/pages.js', 'modules/music/sync.js'];
const routePattern = /^\/$|^\/(archive|rate|taste|import|journal)(\/.*)?$|^\/terms\.html$/;
for (const name of sourceFiles) {
  const source = await readFile(join(root, name), 'utf8');
  const links = [...source.matchAll(/(?:href=|link\()(["'`])(\/[^"'`$]*)\1/g)].map((match) => match[2]);
  for (const href of links) {
    const path = href.split(/[?#]/)[0];
    if (extname(path)) { try { await readFile(join(root, path.slice(1))); } catch { errors.push(`${name}: missing internal asset ${href}`); } }
    else if (!routePattern.test(path)) errors.push(`${name}: unsupported internal route ${href}`);
  }
}

const styles = await readFile(join(root, 'styles.css'), 'utf8');
const desktopHomeGrid = styles.lastIndexOf('.featured-shape { grid-template-columns:minmax(360px,1fr) minmax(280px,.8fr) minmax(144px,.4fr); }');
const tabletHomeGrid = styles.lastIndexOf('.featured-shape { grid-template-columns:minmax(0,.8fr) minmax(240px,1fr) minmax(120px,.45fr); }');
const mobileHomeGrid = styles.lastIndexOf('.featured-shape { grid-template-columns:minmax(0,1fr); }');
if (desktopHomeGrid < 0 || tabletHomeGrid < desktopHomeGrid || mobileHomeGrid < tabletHomeGrid) errors.push('styles.css: the final Home grid cascade must restore tablet and mobile layouts after the desktop declaration');
const ratingPages = await readFile(join(root, 'modules', 'rating', 'pages.js'), 'utf8');
const precisionButtons = ratingPages.match(/<button[^>]*data-(?:score-step|album-step)[^>]*>/g) || [];
if (!precisionButtons.length || precisionButtons.some((button) => !button.includes('type="button"') || !button.includes('aria-label='))) errors.push('rating controls: every precision button must be a labelled non-submit button');
if (!styles.includes('summary { min-height:40px; align-items:center; }')) errors.push('styles.css: disclosure summaries must expose a 40px interaction target');
const entryHtml = await readFile(join(root, 'index.html'), 'utf8');
if ([...entryHtml.matchAll(/(?:href|src)="(\/[^\"]+)"/g)].length) errors.push('index.html: root-absolute assets break GitHub project-site deployment');
if (!entryHtml.includes('<base id="app-base" href="/"') || !entryHtml.includes('document.getElementById("app-base").href') || !entryHtml.includes('/how-i-hear-music/')) errors.push('index.html: deployment-aware asset base is missing');
const fallbackHtml = await readFile(join(root, '404.html'), 'utf8');
if (!fallbackHtml.includes('const base = "/how-i-hear-music"') || !fallbackHtml.includes('route=${encodeURIComponent')) errors.push('404.html: GitHub Pages route recovery is missing');
const appSource = await readFile(join(root, 'app.js'), 'utf8');
if (!appSource.includes('withoutBase(location.pathname)') || !appSource.includes('location.hash.match')) errors.push('app.js: project base or legacy hash routing is missing');
if (!appSource.includes('setDocumentTitle(path === "/" ? "Home" : app.querySelector("h1")?.textContent.trim()')) errors.push('app.js: document titles must use the rendered editorial heading');

if (errors.length) { console.error(errors.map((item) => `- ${item}`).join('\n')); process.exitCode = 1; }
else console.log(`Project check passed: ${files.length} JSON files, ${songs?.entries.length || 0} canonical tracks, no invalid internal route literals.`);
