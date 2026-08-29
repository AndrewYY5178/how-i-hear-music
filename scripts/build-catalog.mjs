import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = async (name) => JSON.parse(await readFile(join(root, 'data', name), 'utf8'));
const pad = (value) => String(value).padStart(6, '0');
const slug = (value) => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

const [profile, artistsSource, songs] = await Promise.all([read('music-profile.json'), read('artists.json'), read('songs.json')]);
songs.entries = songs.entries.map((entry, index) => ({
  id: entry.id || `track_${pad(index + 1)}`,
  compositionId: entry.compositionId || `composition_${pad(index + 1)}`,
  recordingId: entry.recordingId || `recording_${pad(index + 1)}`,
  ...entry,
}));

const declaredArtists = [...artistsSource.featured, ...artistsSource.uncertain, ...artistsSource.archiveArtists];
const declaredArtistIds = new Set(declaredArtists.map((artist) => artist.id));
const songOnlyArtists = songs.entries.filter((entry, index, entries) => !declaredArtistIds.has(entry.artistId) && entries.findIndex((item) => item.artistId === entry.artistId) === index).map((entry) => ({ id: entry.artistId, name: entry.artist, status: null }));
const artistRecords = [...declaredArtists, ...songOnlyArtists];
const artistByName = new Map(artistRecords.flatMap((artist) => [[artist.name, artist.id], ...(artist.romanized ? [[artist.romanized, artist.id]] : [])]));
const albums = profile.albumArchive.map((album, index) => ({
  id: `album_${pad(index + 1)}`,
  title: album.title,
  primaryArtistId: artistByName.get(album.artist) || null,
  artistName: album.artist,
  coverReference: album.coverUrl || null,
  providerIds: {},
}));
const albumByIdentity = new Map(albums.map((album) => [slug(album.artistName + '-' + album.title), album]));
const releases = albums.map((album, index) => ({ id: `release_${pad(index + 1)}`, albumId: album.id, releaseType: 'album', providerIds: {} }));
const releaseByAlbum = new Map(releases.map((release) => [release.albumId, release.id]));

const catalog = {
  schemaVersion: 1,
  generatedFrom: ['data/artists.json', 'data/music-profile.json', 'data/songs.json'],
  policy: {
    unknownValues: 'null',
    versionTypes: 'Never inferred. Studio, Live, Acoustic, Remastered and other labels require an explicit source.',
    providerIds: 'Stored as provider references; never used as canonical IDs.',
  },
  artists: artistRecords.map((artist) => ({ id: artist.id, name: artist.name, romanized: artist.romanized || null, status: artist.status || null })),
  albums,
  tracks: songs.entries.map((entry) => ({ id: entry.id, compositionId: entry.compositionId, title: entry.title, primaryArtistId: entry.artistId, artistName: entry.artist, releaseDate: entry.releaseDate || null, isrc: entry.isrc || null, upc: entry.upc || null, externalReferences: entry.externalReferences || [], providerIds: entry.providerIds || {} })),
  recordings: songs.entries.map((entry) => {
    const album = entry.album ? albumByIdentity.get(slug(entry.artist + '-' + entry.album)) : null;
    return { id: entry.recordingId, trackId: entry.id, artistIds: [entry.artistId], versionType: entry.versionType || null, releaseId: album ? releaseByAlbum.get(album.id) : null, providerIds: entry.providerIds || {} };
  }),
  releases,
};

await writeFile(join(root, 'data', 'songs.json'), JSON.stringify(songs, null, 2) + '\n');
await writeFile(join(root, 'data', 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log(`Catalog built: ${catalog.artists.length} artists, ${catalog.albums.length} albums, ${catalog.tracks.length} tracks, ${catalog.recordings.length} recordings.`);
