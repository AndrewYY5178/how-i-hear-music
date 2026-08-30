import { allAlbums, allArtists, allTracks, canonical, data, slug, storage, trackId } from "./data.js";
import { matchTrack } from "./matching.js";

export const albumStorageKey = data.library.albumStorageKey;
const identity = (track) => `${canonical(track.title)}::${canonical(track.artist)}::${canonical(track.album)}`;
const albumIdentity = (album) => `${canonical(album.title)}::${canonical(album.artist || album.artistName)}`;
const qqAlbumId = (album) => album.providerRefs?.qqmusic?.albumId || album.providerAlbumId || "";
const qqTrackId = (track) => track.providerRefs?.qqmusic?.trackId || track.providerTrackId || "";

export const analyzeAlbumImport = (album) => {
  const albums = allAlbums(); const tracks = allTracks(); const providerAlbum = albums.find((item) => qqAlbumId(item) && qqAlbumId(item) === album.providerAlbumId); const canonicalAlbum = albums.find((item) => albumIdentity(item) === albumIdentity(album));
  const rows = album.tracks.map((track) => {
    const providerMatch = tracks.find((item) => qqTrackId(item) && qqTrackId(item) === track.providerTrackId);
    const exactMatch = providerMatch || tracks.find((item) => identity(item) === identity({ ...track, artist: track.artistName, album: album.title }));
    if (exactMatch) return { ...track, duplicateStatus: "existing", canonicalTrackId: trackId(exactMatch) };
    const fuzzy = matchTrack({ title: track.title, artist: track.artistName }, tracks);
    return { ...track, duplicateStatus: fuzzy.confidence === "review" || fuzzy.confidence === "auto_match" ? "review" : "new", possibleTrackId: fuzzy.candidate ? trackId(fuzzy.candidate) : null };
  });
  return {
    duplicateAlbum: Boolean(providerAlbum),
    existingAlbumId: providerAlbum?.id || canonicalAlbum?.id || (canonicalAlbum ? slug(canonicalAlbum.artist + "-" + canonicalAlbum.title) : null),
    rows,
    counts: { new: rows.filter((track) => track.duplicateStatus === "new").length, existing: rows.filter((track) => track.duplicateStatus === "existing").length, review: rows.filter((track) => track.duplicateStatus === "review").length },
  };
};

export const storeAlbumImport = (album, sourceUrl) => {
  const analysis = analyzeAlbumImport(album);
  if (analysis.duplicateAlbum) return { duplicate: true, albumId: analysis.existingAlbumId };
  const existingArtist = allArtists().find((artist) => canonical(artist.name) === canonical(album.artistName));
  const artistRecord = existingArtist || { id: "artist_local_" + crypto.randomUUID(), name: album.artistName, role: "Imported album artist", providerIds: { qqmusic: album.artistProviderId || null } };
  const albumId = analysis.existingAlbumId || "album_local_" + crypto.randomUUID(); const importedAt = new Date().toISOString();
  const tracks = analysis.rows.map((track) => {
    const existing = track.canonicalTrackId ? allTracks().find((item) => trackId(item) === track.canonicalTrackId) : null;
    return {
      ...(existing || {}),
      id: track.canonicalTrackId || "track_local_" + crypto.randomUUID(),
      title: track.title,
      artist: track.artistName,
      artistId: existing?.artistId || artistRecord.id,
      album: album.title,
      albumId,
      trackNumber: track.trackNumber,
      discNumber: track.discNumber,
      durationMs: track.durationMs,
      scores: existing?.scores || null,
      duplicateStatus: track.duplicateStatus,
      possibleTrackId: track.possibleTrackId || null,
      providerRefs: { ...(existing?.providerRefs || {}), qqmusic: { trackId: track.providerTrackId, albumId: album.providerAlbumId, externalUrl: track.externalUrl } },
    };
  });
  const record = {
    id: albumId,
    title: album.title,
    artist: album.artistName,
    artistId: artistRecord.id,
    artistRecord,
    year: album.year,
    releaseDate: album.releaseDate,
    coverUrl: null,
    coverSource: null,
    status: "IMPORTED",
    sourceUrl,
    providerRefs: { qqmusic: { albumId: album.providerAlbumId, numericAlbumId: album.providerNumericAlbumId || null, externalUrl: album.externalUrl } },
    importedAt,
    tracks,
    importLog: { id: "import_" + crypto.randomUUID(), provider: "qqmusic", type: "album", sourceUrl, providerAlbumId: album.providerAlbumId, importedAt, totalTracks: tracks.length, newTracks: analysis.counts.new, existingTracks: analysis.counts.existing, reviewTracks: analysis.counts.review, status: "complete" },
  };
  const current = storage.get(albumStorageKey, []);
  if (!storage.set(albumStorageKey, [...current.filter((item) => item.id !== albumId), record])) throw new Error("The album could not be saved in this browser.");
  return { duplicate: false, albumId, record };
};
