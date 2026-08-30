const qqHosts = (hostname) => hostname === "qq.com" || hostname.endsWith(".qq.com");
const albumCache = new Map();
const cacheTtl = 30 * 60 * 1000;

const firstUrl = (value) => (String(value || "").match(/https?:\/\/[^\s<>"'）)】]+/i) || [""])[0].replace(/[，。；、]+$/, "");
const albumIdentity = (url) => {
  const pathMatch = url.pathname.match(/(?:albumDetail|album)\/([A-Za-z0-9]{6,32})(?:\.html)?/i);
  return url.searchParams.get("albummid") || url.searchParams.get("albumMid") || url.searchParams.get("albumid") || url.searchParams.get("albumId") || pathMatch?.[1] || "";
};
const resourceType = (url) => /(?:playlist|taoge)/i.test(url.pathname) || url.searchParams.has("disstid") ? "playlist" : /(?:songDetail|song\/)/i.test(url.pathname) || url.searchParams.has("songmid") ? "track" : "unknown";
const validIdentity = (value) => /^[A-Za-z0-9]{6,32}$/.test(value);

export const directQQAlbumIdentity = (value) => {
  let url;
  try { url = new URL(firstUrl(value)); } catch { throw new Error("Could not identify a QQ Music album from this link."); }
  if (url.protocol !== "https:" || !qqHosts(url.hostname)) throw new Error("Only public HTTPS QQ Music album links are supported.");
  const kind = resourceType(url);
  if (kind === "playlist") throw new Error("This is a QQ Music playlist, not an album.");
  if (kind === "track") throw new Error("This is a QQ Music track, not an album.");
  const id = albumIdentity(url);
  return { url, id: validIdentity(id) ? id : "" };
};

const resolveQQShare = async (initial) => {
  let current = initial;
  for (let index = 0; index < 4; index += 1) {
    const response = await fetch(current, { redirect: "manual", headers: { "User-Agent": "How-I-Hear-Music/0.1 metadata importer", Referer: "https://y.qq.com/" }, signal: AbortSignal.timeout(12_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("QQ Music returned an incomplete share redirect.");
      current = new URL(location, current);
      if (current.protocol !== "https:" || !qqHosts(current.hostname)) throw new Error("The QQ Music share link redirected outside QQ Music.");
      const kind = resourceType(current);
      if (kind === "playlist") throw new Error("This is a QQ Music playlist, not an album.");
      if (kind === "track") throw new Error("This is a QQ Music track, not an album.");
      const redirectedId = albumIdentity(current);
      if (validIdentity(redirectedId)) return { id: redirectedId, url: current };
      continue;
    }
    if (!response.ok) throw new Error(`QQ Music could not open this public share link (${response.status}).`);
    const html = await response.text();
    const candidates = [
      albumIdentity(current),
      ...Array.from(html.matchAll(/(?:albummid|albumMid)["'\s:=\\]+([A-Za-z0-9]{6,32})/gi), (match) => match[1]),
      ...Array.from(html.matchAll(/albumDetail\/([A-Za-z0-9]{6,32})/gi), (match) => match[1]),
    ];
    const id = candidates.find(validIdentity);
    if (id) return { id, url: current };
    break;
  }
  throw new Error("Could not identify a QQ Music album from this link.");
};

export const parseQQAlbumLink = async (text) => {
  const direct = directQQAlbumIdentity(text);
  const resolved = direct.id ? { id: direct.id, url: direct.url } : await resolveQQShare(direct.url);
  return { provider: "qqmusic", type: "album", albumId: resolved.id, canonicalUrl: `https://y.qq.com/n/ryqq/albumDetail/${encodeURIComponent(resolved.id)}` };
};

const positive = (value, fallback) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
export const normalizeQQAlbum = (payload, requestedId = "") => {
  const album = payload?.data;
  if (payload?.code !== 0 || !album) throw new Error("QQ Music did not return a readable public album.");
  if (!Array.isArray(album.list) || !album.list.length) throw new Error("Album found, but track data is unavailable.");
  const providerAlbumId = String(album.mid || requestedId || album.id || "");
  const tracks = album.list.map((song, sourceIndex) => {
    const zeroBasedDisc = Number(song.cdIdx ?? song.index_cd);
    const discNumber = Number.isFinite(zeroBasedDisc) && zeroBasedDisc >= 0 ? zeroBasedDisc + 1 : 1;
    const trackNumber = positive(song.belongCD ?? song.index_album, sourceIndex + 1);
    const singers = Array.isArray(song.singer) ? song.singer : [];
    return {
      providerTrackId: String(song.songmid || song.songid || ""),
      title: String(song.songname || song.name || "").trim(),
      artistName: singers.map((singer) => singer.name).filter(Boolean).join(" / ") || String(album.singername || "Artist not recorded"),
      artistProviderId: String(singers[0]?.mid || album.singermid || "") || null,
      albumName: String(album.name || "Untitled album"),
      albumProviderId: providerAlbumId,
      trackNumber,
      discNumber,
      durationMs: positive(song.interval, null) ? Number(song.interval) * 1000 : null,
      sourceIndex,
      externalUrl: song.songmid ? `https://y.qq.com/n/ryqq/songDetail/${encodeURIComponent(song.songmid)}` : null,
    };
  }).filter((track) => track.title && track.providerTrackId);
  if (!tracks.length) throw new Error("Album found, but track data is unavailable.");
  tracks.sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber || a.sourceIndex - b.sourceIndex);
  return {
    provider: "qqmusic",
    providerAlbumId,
    providerNumericAlbumId: Number(album.id) || null,
    title: String(album.name || "Untitled album"),
    artistName: String(album.singername || tracks[0].artistName || "Artist not recorded"),
    artistProviderId: String(album.singermid || tracks[0].artistProviderId || "") || null,
    releaseDate: /^\d{4}-\d{2}-\d{2}$/.test(album.aDate || "") ? album.aDate : null,
    year: /^\d{4}/.test(album.aDate || "") ? Number(String(album.aDate).slice(0, 4)) : null,
    artworkUrl: null,
    externalUrl: `https://y.qq.com/n/ryqq/albumDetail/${encodeURIComponent(providerAlbumId)}`,
    trackCount: tracks.length,
    tracks: tracks.map(({ sourceIndex, ...track }) => track),
  };
};

export const getQQAlbumDetails = async (albumId) => {
  if (!validIdentity(albumId)) throw new Error("Could not identify a QQ Music album from this link.");
  const cached = albumCache.get(albumId);
  if (cached && Date.now() - cached.at < cacheTtl) return cached.value;
  const parameter = /^\d+$/.test(albumId) ? "albumid" : "albummid";
  const query = new URLSearchParams({ [parameter]: albumId, format: "json", platform: "yqq.json", needNewCode: "0" });
  const response = await fetch(`https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg?${query}`, { headers: { "User-Agent": "How-I-Hear-Music/0.1 metadata importer", Referer: "https://y.qq.com/" }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`QQ Music album metadata is unavailable right now (${response.status}).`);
  const value = normalizeQQAlbum(await response.json(), albumId);
  albumCache.set(albumId, { at: Date.now(), value });
  albumCache.set(value.providerAlbumId, { at: Date.now(), value });
  return value;
};
