import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const sourceFiles = ['index.html', 'terms.html', 'app.js', 'modules/home.js', 'modules/archive/pages.js', 'modules/rating/pages.js', 'modules/taste/pages.js', 'modules/import/pages.js', 'modules/journal/pages.js'];
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

if (errors.length) { console.error(errors.map((item) => `- ${item}`).join('\n')); process.exitCode = 1; }
else console.log(`Project check passed: ${files.length} JSON files, ${songs?.entries.length || 0} canonical tracks, no invalid internal route literals.`);
