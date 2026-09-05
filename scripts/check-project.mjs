import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchTrack } from '../modules/music/matching.js';
import { createPlaylistSnapshot, diffPlaylistSnapshots } from '../modules/music/sync.js';
import { clampScore, radarScoreFromPointer, scoreFromKey, waveformScoreFromPointer } from '../modules/rating/interactions.js';
import { withBase, withoutBase } from '../modules/layout/paths.js';
import { directQQAlbumIdentity, normalizeQQAlbum } from '../server/providers/qqmusic-album.mjs';
import { normalizeInsightTags } from '../modules/music/insights.js';
import { albumNarrative } from '../modules/music/album-narrative.js';

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

try {
  const parsedAlbum = directQQAlbumIdentity('分享专辑 https://y.qq.com/n/ryqq/albumDetail/000hBflm2T62Ur');
  if (parsedAlbum.id !== '000hBflm2T62Ur') errors.push('QQ album import: desktop album MID parsing failed');
  const parsedMobileAlbum = directQQAlbumIdentity('https://i.y.qq.com/n2/m/share/details/album.html?albummid=002EfO222kNFd0');
  if (parsedMobileAlbum.id !== '002EfO222kNFd0') errors.push('QQ album import: mobile album MID parsing failed');
  directQQAlbumIdentity('https://y.qq.com/n/ryqq/playlist/123456'); errors.push('QQ album import: playlist link was not rejected');
} catch (error) { if (!String(error.message).includes('playlist')) errors.push(`QQ album import: parser failed (${error.message})`); }
const albumFixture = normalizeQQAlbum({ code: 0, data: { id: 1, mid: 'fixtureAlbum01', name: 'Fixture', singername: 'Artist', singermid: 'artistMid01', aDate: '2026-01-02', list: [
  { songmid: 'trackDisc02', songname: 'Disc two', cdIdx: 1, belongCD: 1, interval: 180, singer: [{ name: 'Artist', mid: 'artistMid01' }] },
  { songmid: 'trackDisc01B', songname: 'Second', cdIdx: 0, belongCD: 2, interval: 170, singer: [{ name: 'Artist', mid: 'artistMid01' }] },
  { songmid: 'trackDisc01A', songname: 'First', cdIdx: 0, belongCD: 1, interval: 160, singer: [{ name: 'Artist', mid: 'artistMid01' }] },
] } });
if (albumFixture.tracks.map((track) => `${track.discNumber}:${track.trackNumber}`).join() !== '1:1,1:2,2:1') errors.push('QQ album import: disc/track ordering is incorrect');
if (albumFixture.releaseDate !== '2026-01-02' || albumFixture.tracks[0].durationMs !== 160000) errors.push('QQ album import: normalized metadata is incorrect');
if (normalizeInsightTags(['VOCAL', "CAN'T EXPLAIN", 'ONE MOMENT']).join() !== 'vocal-texture,inexplicable,one-moment') errors.push('insights: legacy listening reasons are not backward compatible');
const latePeakNarrative = albumNarrative([{ overall: 7 }, { overall: 7.2 }, { overall: 8 }, { overall: 8.4 }]);
if (!latePeakNarrative?.includes('arriving late') || albumNarrative([{ overall: 8 }, { overall: null }, { overall: 9 }]) !== null) errors.push('album narrative: complete evidence gate or peak-position analysis is incorrect');

const sourceFiles = ['index.html', '404.html', 'terms.html', 'base.js', 'app.js', 'sw.js', 'modules/home.js', 'modules/layout/i18n.js', 'modules/layout/shell.js', 'modules/archive/pages.js', 'modules/rating/pages.js', 'modules/taste/pages.js', 'modules/import/pages.js', 'modules/journal/pages.js', 'modules/search/pages.js', 'modules/music/api.js', 'modules/music/cloud-sync.js', 'modules/music/sync.js', 'modules/music/album-import.js', 'modules/music/versions.js', 'modules/music/insights.js', 'modules/music/sonic.js', 'modules/music/album-narrative.js', 'modules/music/analysis.js', 'modules/music/groups.js', 'modules/music/portrait.js', 'modules/music/taste-dna.js', 'modules/music/entropy.js', 'modules/music/memory.js', 'modules/music/geometry.js'];
const routePattern = /^\/$|^\/(archive|rate|taste|import|journal|search)(\/.*)?$|^\/terms\.html$/;
for (const name of sourceFiles) {
  const source = await readFile(join(root, name), 'utf8');
  const links = [...source.matchAll(/(?:href=|link\()(["'`])(\/[^"'`$]*)\1/g)].map((match) => match[2]);
  for (const href of links) {
    const path = href.split(/[?#]/)[0];
    if (extname(path)) { try { await readFile(join(root, path.slice(1))); } catch { errors.push(`${name}: missing internal asset ${href}`); } }
    else if (!routePattern.test(path)) errors.push(`${name}: unsupported internal route ${href}`);
  }
  const externalTargets = source.match(/<a[^>]*target="_blank"[^>]*>/g) || [];
  if (externalTargets.some((anchor) => !/rel="[^"]*noreferrer/.test(anchor))) errors.push(`${name}: target=_blank link is missing noreferrer`);
  const images = source.match(/<img\b[^>]*>/g) || [];
  if (images.some((image) => !/\balt=/.test(image))) errors.push(`${name}: image is missing alternative text`);
  if (/<button\b(?![^>]*\btype=)[^>]*>/i.test(source)) errors.push(`${name}: button is missing an explicit type`);
}

const styles = await readFile(join(root, 'styles.css'), 'utf8');
const desktopHomeGrid = styles.lastIndexOf('.featured-shape { grid-template-columns:minmax(360px,1fr) minmax(280px,.8fr) minmax(144px,.4fr); }');
const tabletHomeGrid = styles.lastIndexOf('.featured-shape { grid-template-columns:minmax(0,.8fr) minmax(240px,1fr) minmax(120px,.45fr); }');
const mobileHomeGrid = styles.lastIndexOf('.featured-shape { grid-template-columns:minmax(0,1fr); }');
if (desktopHomeGrid < 0 || tabletHomeGrid < desktopHomeGrid || mobileHomeGrid < tabletHomeGrid) errors.push('styles.css: the final Home grid cascade must restore tablet and mobile layouts after the desktop declaration');
const ratingPages = await readFile(join(root, 'modules', 'rating', 'pages.js'), 'utf8');
if (/\["Track 01"/.test(ratingPages) || ratingPages.includes('findRateTrack(id) || choices[0]') || ratingPages.includes('findAlbum(id) || data.profile.albumArchive[0]')) errors.push('rating integrity: fabricated album rows or invalid-record fallback remains');
const precisionButtons = ratingPages.match(/<button[^>]*data-(?:score-step|album-step)[^>]*>/g) || [];
if (!precisionButtons.length || precisionButtons.some((button) => !button.includes('type="button"') || !button.includes('aria-label='))) errors.push('rating controls: every precision button must be a labelled non-submit button');
if (!styles.includes('summary { min-height:40px; align-items:center; }')) errors.push('styles.css: disclosure summaries must expose a 40px interaction target');
const entryHtml = await readFile(join(root, 'index.html'), 'utf8');
if (!entryHtml.includes('name="him-api-base" content="https://how-i-hear-music-adapter.bevel-exhaust.workers.dev"')) errors.push('hosted adapter: GitHub Pages API base is missing or incorrect');
if ([...entryHtml.matchAll(/(?:href|src)="(\/[^\"]+)"/g)].length) errors.push('index.html: root-absolute assets break GitHub project-site deployment');
const baseSource = await readFile(join(root, 'base.js'), 'utf8');
if (!entryHtml.includes('<base id="app-base" href="./"') || !entryHtml.includes('src="./base.js"') || !baseSource.includes('document.getElementById("app-base").href') || !baseSource.includes('/how-i-hear-music/')) errors.push('index.html: deployment-aware asset base is missing');
const fallbackHtml = await readFile(join(root, '404.html'), 'utf8');
if (!fallbackHtml.includes('const base = "/how-i-hear-music"') || !fallbackHtml.includes('route=${encodeURIComponent')) errors.push('404.html: GitHub Pages route recovery is missing');
const appSource = await readFile(join(root, 'app.js'), 'utf8');
const emailMigration = await readFile(join(root, 'migrations', '0002_email_auth.sql'), 'utf8');
if (!emailMigration.includes('email_auth_challenges') || !emailMigration.includes('sync_users_email_hash_idx')) errors.push('email auth: D1 migration is missing challenge or identity schema');
if (!appSource.includes('withoutBase(location.pathname)') || !appSource.includes('location.hash.match')) errors.push('app.js: project base or legacy hash routing is missing');
if (!appSource.includes('requestedTarget === "/search" ? "/archive"') || !appSource.includes('current === "/search"')) errors.push('routing: old Search links must redirect into Archive');
if (!appSource.includes('const pageTitle = path === "/" ? "Home"') || !appSource.includes('link[rel="canonical"]')) errors.push('app.js: document titles or route canonical metadata are missing');
if (!appSource.includes('archiveAlbumCompare()') || !appSource.includes('/archive/compare/albums')) errors.push('app.js: evidence-gated album comparison route is missing');
for (const path of ['/taste/anti-recommendation', '/taste/sonic-map', '/taste/family-tree', '/taste/portrait']) if (!appSource.includes(path)) errors.push(`app.js: personal analysis route ${path} is missing`);
for (const path of ['/taste/dna', '/taste/blind-spots', '/journal/memory-palace', '/journal/entropy', '/taste/journal', '/taste/journal/memory-palace', '/taste/journal/entropy']) if (!appSource.includes(path)) errors.push(`app.js: advanced taste route ${path} is missing`);
if (!appSource.includes('annualPortrait(') || !appSource.includes('bindYear(')) errors.push('app.js: annual portrait or awards binding is missing');
const apiSource = await readFile(join(root, 'modules', 'music', 'api.js'), 'utf8');
if (!apiSource.includes('location.hostname.endsWith("github.io")') || !apiSource.includes('window.__HIM_API_BASE__')) errors.push('metadata adapter: hosted base must not override the local same-origin service');
const versionSource = await readFile(join(root, 'modules', 'music', 'versions.js'), 'utf8');
if (!versionSource.includes('confirmedByOwner: true') || !styles.includes('.version-form')) errors.push('versions: explicit owner confirmation and comparison UI are required');
if (!styles.includes('.version-morph') || !styles.includes('.sonic-map') || !styles.includes('.listening-portrait') || !styles.includes('.personal-awards')) errors.push('styles.css: personal analysis visual contracts are incomplete');
const dnaSource = await readFile(join(root, 'modules', 'music', 'taste-dna.js'), 'utf8');
if (!dnaSource.includes('minimumEvidence = 5') || !dnaSource.includes('coverageGap') || !dnaSource.includes('confidence')) errors.push('Taste DNA: evidence gate or blind-spot scoring is missing');
const entropySource = await readFile(join(root, 'modules', 'music', 'entropy.js'), 'utf8');
if (!entropySource.includes('evidenceCount >= 3') || !entropySource.includes('Neither direction is treated as better')) errors.push('Archive Entropy: evidence gate or neutral narrative is missing');
const memorySource = await readFile(join(root, 'modules', 'music', 'memory.js'), 'utf8');
if (!memorySource.includes('source: "manual"') || !memorySource.includes('source: "derived"') || !memorySource.includes('memory-entries:v1')) errors.push('Memory Palace: manual/derived provenance boundary is missing');
const geometrySource = await readFile(join(root, 'modules', 'music', 'geometry.js'), 'utf8');
for (const primitive of ['trackGlyph', 'albumTerrain', 'artistSignature', 'tasteTraitMark']) if (!geometrySource.includes(`export const ${primitive}`)) errors.push(`Music as Geometry: ${primitive} primitive is missing`);
if (!styles.includes('.taste-dna') || !styles.includes('.memory-palace') || !styles.includes('.entropy-chart') || !styles.includes('.track-glyph')) errors.push('styles.css: advanced taste visual contracts are incomplete');
if (!entryHtml.includes('rel="manifest"') || !entryHtml.includes('rel="canonical"') || !entryHtml.includes('id="update-banner"')) errors.push('index.html: install, canonical or explicit update metadata is missing');
if (!entryHtml.includes('Noto+Serif+SC') || !entryHtml.includes('Noto+Sans+SC')) errors.push('index.html: bilingual type families are missing');
if (!entryHtml.includes('http-equiv="Content-Security-Policy"') || !entryHtml.includes('name="referrer" content="no-referrer"')) errors.push('index.html: static security and referrer policy are missing');
const serviceWorker = await readFile(join(root, 'sw.js'), 'utf8');
if (!serviceWorker.includes('/api/') || !serviceWorker.includes('request.mode === "navigate"') || !serviceWorker.includes('SKIP_WAITING')) errors.push('offline shell: API exclusion, navigation fallback or explicit update behavior is missing');
if (!serviceWorker.includes('modules/layout/i18n.js')) errors.push('offline shell: bilingual runtime is missing');
if (!serviceWorker.includes('new Request(url, { cache: "reload" })')) errors.push('offline shell: release installation must bypass stale HTTP asset caches');
for (const source of sourceFiles.filter((file) => file.endsWith('.js') && file !== 'sw.js')) if (!serviceWorker.includes(`"${source}"`)) errors.push(`offline shell: missing ${source} from the first-load shell`);
for (const asset of ['manifest.webmanifest', 'robots.txt', 'sitemap.xml']) { try { await readFile(join(root, asset)); } catch { errors.push(`delivery: missing ${asset}`); } }
const snapshotRoutes = ['/archive', '/archive/tracks', '/archive/albums', '/archive/artists', '/rate', '/taste', '/taste/journal', '/import', '/journal'];
for (const route of snapshotRoutes) {
  try {
    const snapshot = await readFile(join(root, route.slice(1), 'index.html'), 'utf8');
    const canonical = `https://andrewyy5178.github.io/how-i-hear-music${route}/`;
    if (!snapshot.includes('data-static-snapshot') || !snapshot.includes(`rel="canonical" href="${canonical}"`) || !snapshot.includes('src="/how-i-hear-music/app.js?v=')) errors.push(`delivery: invalid static snapshot ${route}`);
  } catch { errors.push(`delivery: missing static snapshot ${route}`); }
}
try {
  const socialImage = await readFile(join(root, 'og-image.png'));
  if (socialImage.length < 24 || socialImage.toString('ascii', 1, 4) !== 'PNG' || socialImage.readUInt32BE(16) !== 1200 || socialImage.readUInt32BE(20) !== 630) errors.push('delivery: og-image.png must be a 1200×630 PNG');
} catch { errors.push('delivery: missing og-image.png'); }
const sitemapSource = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const route of snapshotRoutes) if (!sitemapSource.includes(`https://andrewyy5178.github.io/how-i-hear-music${route}/`)) errors.push(`delivery: sitemap is missing ${route}`);
if (sitemapSource.includes('?route=')) errors.push('delivery: sitemap must expose direct crawlable routes');
if (!styles.includes('@media (prefers-reduced-motion:reduce)')) errors.push('styles.css: reduced-motion handling is missing');
if (styles.includes('before English labels collide') || !styles.includes('@media (max-width:760px)')) errors.push('styles.css: full masthead must remain available above the mobile breakpoint');
const shellSource = await readFile(join(root, 'modules', 'layout', 'shell.js'), 'utf8');
if (shellSource.includes('READ / 20—') || styles.includes('.edition')) errors.push('masthead: obsolete edition marker or styling remains');
if (shellSource.includes('link("/search"') || shellSource.includes('header-search') || shellSource.includes('utility-search')) errors.push('navigation: Search must live inside Archive instead of the masthead or mobile More');
for (const contract of ['account-toggle', 'account-panel', 'GITHUB', 'EMAIL', 'aria-label="Sign in with GitHub"', 'aria-label="Sign in with email"', 'readSyncStatus', 'signOutSync']) if (!shellSource.includes(contract)) errors.push(`account shell: missing ${contract}`);
if (!styles.includes('.account-panel') || !styles.includes('.account-toggle')) errors.push('account shell: responsive account presentation is missing');
const serverSource = await readFile(join(root, 'server.mjs'), 'utf8');
for (const contract of ["requestPath === '/healthz'", "requestPath === '/api/version'", 'TRUST_PROXY', 'logEvent', 'pruneRuntimeState']) if (!serverSource.includes(contract)) errors.push(`adapter resilience: missing ${contract}`);
if (!serverSource.includes("Location: `/?route=${encodeURIComponent(route)}`")) errors.push('server: local deep links must recover through the root document');
if (!serverSource.includes("requestPath === '/' ? '/index.html'")) errors.push('server: route recovery query must resolve to the root document');
if (!serverSource.includes("safePath.endsWith('sw.js')") || !serverSource.includes("? 'no-cache' : 'public, max-age=300'")) errors.push('delivery: service worker and app shell must revalidate');
const packageData = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
if (!serviceWorker.includes(`how-i-hear-music-shell-${packageData.version}`) || !serviceWorker.includes('key.startsWith(cachePrefix)')) errors.push('offline shell: cache version or scoped cleanup is not aligned with the release');
if (!serverSource.includes("process.env.HOST") || !serverSource.includes('serviceAgent') || serverSource.includes('How-I-Hear-Music/0.1')) errors.push('adapter: host or service-version identity is not deployable');
const workerSource = await readFile(join(root, 'worker', 'index.mjs'), 'utf8');
const workerConfig = await readFile(join(root, 'wrangler.jsonc'), 'utf8');
for (const contract of ['ALLOWED_ORIGIN', 'SERVICE_VERSION', '/healthz', '/api/version', '/api/import/qq-smart-preview', '/api/import/qq-playlist', '/api/import/netease-playlist', '/api/import/qq-album-preview']) if (!workerSource.includes(contract) && !workerConfig.includes(contract)) errors.push(`hosted adapter: missing ${contract}`);
if (!workerConfig.includes('https://andrewyy5178.github.io') || !workerConfig.includes(`\"SERVICE_VERSION\": \"${packageData.version}\"`)) errors.push('hosted adapter: production origin or service version is not aligned');

if (errors.length) { console.error(errors.map((item) => `- ${item}`).join('\n')); process.exitCode = 1; }
else console.log(`Project check passed: ${files.length} JSON files, ${songs?.entries.length || 0} canonical tracks, no invalid internal route literals.`);
