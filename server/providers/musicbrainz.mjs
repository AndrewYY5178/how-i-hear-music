const musicBrainzBase = 'https://musicbrainz.org/ws/2';

const quoted = (value) => `"${String(value || '').trim().replaceAll('"', '\\"')}"`;

/**
 * Returns release-level candidates only. MusicBrainz's language describes the
 * release title/track-title language, not lyric language, so callers must show
 * it as a reviewable source candidate rather than a track fact.
 */
export const searchMusicBrainzReleaseCandidates = async ({ album, artist }, { serviceAgent }) => {
  const release = String(album || '').trim();
  const creditedArtist = String(artist || '').trim();
  if (!release || !creditedArtist) throw new Error('An album and artist are required to find public release candidates.');
  const query = `release:${quoted(release)} AND artist:${quoted(creditedArtist)}`;
  const url = new URL(`${musicBrainzBase}/release`);
  url.search = new URLSearchParams({ query, fmt: 'json', limit: '8' }).toString();
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': serviceAgent },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`MusicBrainz release search is unavailable right now (${response.status}).`);
  const payload = await response.json();
  return (payload.releases || []).map((releaseItem) => ({
    id: String(releaseItem.id || ''),
    title: String(releaseItem.title || '').trim(),
    artist: (releaseItem['artist-credit'] || []).map((credit) => credit.name || credit.artist?.name).filter(Boolean).join('') || creditedArtist,
    releaseDate: String(releaseItem.date || '').trim() || null,
    region: String(releaseItem.country || '').trim() || null,
    language: String(releaseItem['text-representation']?.language || '').trim() || null,
    sourceUrl: releaseItem.id ? `https://musicbrainz.org/release/${encodeURIComponent(releaseItem.id)}` : 'https://musicbrainz.org/',
  })).filter((candidate) => candidate.id && candidate.title);
};
