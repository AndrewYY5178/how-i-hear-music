const identity = (track = {}) => `${String(track.title || "").trim().toLocaleLowerCase()}::${String(track.artist || "").trim().toLocaleLowerCase()}`;

export const createPlaylistSnapshot = ({ tracks = [], playlist = {}, source = "", sourceLabel = "", sourceUrl = "" }) => ({
  source,
  sourceLabel,
  sourceUrl,
  playlist: {
    id: playlist.id || null,
    title: playlist.title || "Untitled playlist",
    creator: playlist.creator || "",
    trackCount: tracks.length,
  },
  tracks: tracks.map((track) => ({
    title: track.title || "",
    artist: track.artist || "",
    album: track.album || "",
    releaseDate: track.releaseDate || null,
    isrc: track.isrc || null,
    upc: track.upc || null,
    externalReferences: Array.isArray(track.externalReferences) ? track.externalReferences : [],
    provider: track.provider || {},
  })),
  syncedAt: new Date().toISOString(),
});

export const diffPlaylistSnapshots = (previous = {}, current = {}) => {
  const before = Array.isArray(previous.tracks) ? previous.tracks : [];
  const after = Array.isArray(current.tracks) ? current.tracks : [];
  const beforeKeys = new Set(before.map(identity));
  const afterKeys = new Set(after.map(identity));
  return {
    additions: after.filter((track) => !beforeKeys.has(identity(track))),
    removals: before.filter((track) => !afterKeys.has(identity(track))),
    unchanged: after.filter((track) => beforeKeys.has(identity(track))),
  };
};
