import { getQQAlbumDetails, parseQQAlbumLink } from '../server/providers/qqmusic-album.mjs';
import { searchMusicBrainzReleaseCandidates } from '../server/providers/musicbrainz.mjs';
import { handleSync } from './sync.mjs';

const defaultOrigin = 'https://andrewyy5178.github.io';
const serviceName = 'how-i-hear-music-adapter';
const apiCache = new Map();
const rateWindows = new Map();

const allowedOrigins = (env) => new Set(String(env.ALLOWED_ORIGIN || defaultOrigin).split(',').map((value) => value.trim()).filter(Boolean));
const serviceVersion = (env) => String(env.SERVICE_VERSION || '0.8.4');
const serviceAgent = (env) => `How-I-Hear-Music/${serviceVersion(env)} metadata importer`;
const isQQHost = (hostname) => hostname === 'qq.com' || hostname.endsWith('.qq.com');
const isNetEaseHost = (hostname) => hostname === 'music.163.com' || hostname.endsWith('.music.163.com') || hostname === '163cn.tv';

const publicDate = (value) => {
  const text = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  const date = new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
};

const responseHeaders = (request, env) => {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
  const origin = request.headers.get('Origin');
  if (origin && allowedOrigins(env).has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    headers.set('Vary', 'Origin');
  }
  return headers;
};

const json = (request, env, status, body, requestId) => {
  const headers = responseHeaders(request, env);
  if (requestId) headers.set('X-Request-Id', requestId);
  return new Response(JSON.stringify(body), { status, headers });
};

const readJsonBody = async (request) => {
  const body = await request.text();
  if (body.length > 20_000) throw new Error('Request body is too large.');
  try { return JSON.parse(body || '{}'); }
  catch { throw new Error('The import request is not valid JSON.'); }
};

const cacheFor = async (key, producer, ttl = 300_000) => {
  const current = apiCache.get(key);
  if (current && current.expiresAt > Date.now()) return current.value;
  const value = await producer();
  apiCache.set(key, { value, expiresAt: Date.now() + ttl });
  if (apiCache.size > 200) apiCache.delete(apiCache.keys().next().value);
  return value;
};

const withinRateLimit = (address) => {
  const now = Date.now();
  const recent = (rateWindows.get(address) || []).filter((at) => now - at < 600_000);
  if (recent.length >= 30) return false;
  recent.push(now);
  rateWindows.set(address, recent);
  return true;
};

const parsePublicQQUrl = (value) => {
  let url;
  try { url = new URL(String(value || '')); }
  catch { throw new Error('Paste a complete public QQ Music share link.'); }
  if (url.protocol !== 'https:' || !isQQHost(url.hostname)) throw new Error('Only public HTTPS QQ Music links can be imported.');
  return url;
};

const requestQQPage = async (initialUrl, env) => {
  let current = initialUrl;
  for (let index = 0; index < 4; index += 1) {
    const response = await fetch(current, {
      redirect: 'manual',
      headers: { 'User-Agent': serviceAgent(env), Referer: 'https://y.qq.com/' },
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('QQ Music returned an incomplete share redirect.');
      current = new URL(location, current);
      if (current.protocol !== 'https:' || !isQQHost(current.hostname)) throw new Error('The QQ Music share link redirected outside QQ Music.');
      continue;
    }
    if (!response.ok) throw new Error(`QQ Music could not open this public share link (${response.status}).`);
    return { url: current, html: await response.text() };
  }
  throw new Error('This QQ Music share link redirected too many times.');
};

const playlistIdFromQQShare = async (shareUrl, env) => {
  const supplied = parsePublicQQUrl(shareUrl);
  const direct = supplied.searchParams.get('disstid') || supplied.searchParams.get('id') || supplied.pathname.match(/playlist\/(\d+)/i)?.[1];
  if (direct && /^\d+$/.test(direct)) return direct;
  const { url, html } = await requestQQPage(supplied, env);
  const candidates = [
    url.searchParams.get('disstid'), url.searchParams.get('id'), url.pathname.match(/playlist\/(\d+)/i)?.[1],
    ...Array.from(html.matchAll(/(?:disstid|dissid|"id")\s*(?:=|:|%3D)\s*["']?(\d{5,})/gi), (match) => match[1]),
  ];
  const id = candidates.find((item) => /^\d+$/.test(item || ''));
  if (!id) throw new Error('This QQ Music link did not resolve to a public playlist. Paste the playlist share link, not a song or album link.');
  return id;
};

const fetchQQPlaylist = async (shareUrl, env) => {
  const playlistId = await playlistIdFromQQShare(shareUrl, env);
  const query = new URLSearchParams({
    type: '1', json: '1', utf8: '1', onlysong: '0', disstid: playlistId, format: 'json',
    g_tk: '5381', loginUin: '0', hostUin: '0', inCharset: 'utf8', outCharset: 'utf-8', notice: '0', platform: 'yqq.json', needNewCode: '0',
  });
  const upstream = await fetch(`https://c.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?${query}`, {
    headers: { 'User-Agent': serviceAgent(env), Referer: 'https://y.qq.com/' },
    signal: AbortSignal.timeout(12_000),
  });
  if (!upstream.ok) throw new Error(`QQ Music playlist metadata is unavailable right now (${upstream.status}).`);
  const data = await upstream.json();
  const playlist = data.cdlist?.[0];
  if (!playlist || !Array.isArray(playlist.songlist)) throw new Error('QQ Music did not return a readable public playlist. It may be private, unavailable or unsupported.');
  const tracks = playlist.songlist.map((song) => ({
    title: String(song.songname || '').trim(),
    artist: (song.singer || []).map((singer) => singer.name).filter(Boolean).join(' / ') || 'Artist not recorded',
    album: String(song.albumname || '').trim(),
    releaseDate: publicDate(song.time_public || song.pubtime || song.album?.time_public), isrc: null, upc: null,
    externalReferences: song.songmid ? [{ provider: 'qqmusic', url: `https://y.qq.com/n/ryqq/songDetail/${encodeURIComponent(song.songmid)}` }] : [],
    provider: { source: 'qqmusic', playlistId, songMid: song.songmid || '', albumMid: song.albummid || '', durationSeconds: Number(song.interval) || null },
  })).filter((track) => track.title);
  if (!tracks.length) throw new Error('QQ Music found the playlist but exposed no importable track metadata.');
  return { playlist: { id: playlistId, title: playlist.dissname || 'QQ Music playlist', creator: playlist.nickname || '', trackCount: tracks.length }, tracks };
};

const parsePublicNetEaseUrl = (value) => {
  let url;
  try { url = new URL(String(value || '')); }
  catch { throw new Error('Paste a complete public NetEase Cloud Music share link.'); }
  if (url.protocol !== 'https:' || !isNetEaseHost(url.hostname)) throw new Error('Only public HTTPS NetEase Cloud Music links can be imported.');
  return url;
};

const playlistIdFromNetEaseShare = async (shareUrl, env) => {
  const supplied = parsePublicNetEaseUrl(shareUrl);
  const direct = supplied.searchParams.get('id') || supplied.pathname.match(/playlist\/(\d+)/i)?.[1];
  if (direct && /^\d+$/.test(direct)) return direct;
  let current = supplied;
  for (let index = 0; index < 4; index += 1) {
    const response = await fetch(current, { redirect: 'manual', headers: { 'User-Agent': serviceAgent(env), Referer: 'https://music.163.com/' }, signal: AbortSignal.timeout(12_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('NetEase returned an incomplete share redirect.');
      current = new URL(location, current);
      if (current.protocol !== 'https:' || !isNetEaseHost(current.hostname)) throw new Error('The NetEase share link redirected outside NetEase Music.');
      const redirected = current.searchParams.get('id') || current.pathname.match(/playlist\/(\d+)/i)?.[1];
      if (redirected && /^\d+$/.test(redirected)) return redirected;
      continue;
    }
    if (!response.ok) throw new Error(`NetEase could not open this public share link (${response.status}).`);
    const html = await response.text();
    const id = [current.searchParams.get('id'), current.pathname.match(/playlist\/(\d+)/i)?.[1], ...Array.from(html.matchAll(/(?:playlist\?id=|playlist\/)(\d{5,})/gi), (match) => match[1])].find((item) => /^\d+$/.test(item || ''));
    if (id) return id;
    break;
  }
  throw new Error('This NetEase link did not resolve to a public playlist. Paste the playlist share link, not a song or album link.');
};

const fetchNetEasePlaylist = async (shareUrl, env) => {
  const playlistId = await playlistIdFromNetEaseShare(shareUrl, env);
  const upstream = await fetch(`https://music.163.com/api/playlist/detail?id=${encodeURIComponent(playlistId)}`, {
    headers: { 'User-Agent': serviceAgent(env), Referer: 'https://music.163.com/' }, signal: AbortSignal.timeout(12_000),
  });
  if (!upstream.ok) throw new Error(`NetEase playlist metadata is unavailable right now (${upstream.status}).`);
  const data = await upstream.json();
  const playlist = data.result;
  if (data.code !== 200 || !playlist || !Array.isArray(playlist.tracks)) throw new Error('NetEase did not return a readable public playlist. It may be private, unavailable or unsupported.');
  const tracks = playlist.tracks.map((song) => ({
    title: String(song.name || '').trim(),
    artist: (song.artists || []).map((artist) => artist.name).filter(Boolean).join(' / ') || 'Artist not recorded',
    album: String(song.album?.name || '').trim(), releaseDate: publicDate(song.album?.publishTime), isrc: null, upc: null,
    externalReferences: song.id ? [{ provider: 'netease', url: `https://music.163.com/song?id=${encodeURIComponent(song.id)}` }] : [],
    provider: { source: 'netease', playlistId, songId: Number(song.id) || null, albumId: Number(song.album?.id) || null, artistIds: (song.artists || []).map((artist) => Number(artist.id)).filter(Number.isFinite), durationSeconds: Number(song.duration) ? Math.round(Number(song.duration) / 1000) : null },
  })).filter((track) => track.title);
  if (!tracks.length) throw new Error('NetEase found the playlist but exposed no importable track metadata.');
  return { playlist: { id: playlistId, title: playlist.name || 'NetEase playlist', creator: playlist.creator?.nickname || '', trackCount: tracks.length }, tracks };
};

const searchQQCatalog = async (query, env) => {
  const keyword = String(query || '').trim();
  if (!keyword || keyword.length > 120) throw new Error('Enter a music search between 1 and 120 characters.');
  const params = new URLSearchParams({ p: '1', n: '12', w: keyword, format: 'json', new_json: '1', cr: '1', aggr: '1', lossless: '0', flag_qc: '0' });
  const upstream = await fetch(`https://c.y.qq.com/soso/fcgi-bin/client_search_cp?${params}`, {
    headers: { 'User-Agent': serviceAgent(env), Referer: 'https://y.qq.com/' }, signal: AbortSignal.timeout(12_000),
  });
  if (!upstream.ok) throw new Error(`QQ Music search is unavailable right now (${upstream.status}).`);
  const data = await upstream.json();
  const rows = data.data?.song?.list || data.data?.song?.itemlist || [];
  return rows.map((song) => ({
    title: String(song.songname || song.name || '').trim(),
    artist: (song.singer || []).map((singer) => singer.name).filter(Boolean).join(' / ') || String(song.singername || 'Artist not recorded'),
    album: String(song.albumname || song.album?.name || '').trim(), releaseDate: publicDate(song.time_public || song.pubtime || song.album?.time_public), isrc: null, upc: null,
    externalReferences: (song.songmid || song.mid) ? [{ provider: 'qqmusic', url: `https://y.qq.com/n/ryqq/songDetail/${encodeURIComponent(song.songmid || song.mid)}` }] : [],
    provider: { source: 'qqmusic', songMid: song.songmid || song.mid || '', songId: Number(song.songid || song.id) || null, albumMid: song.albummid || song.album?.mid || '', albumId: Number(song.albumid || song.album?.id) || null, trackNumber: Number(song.index_album) > 0 ? Number(song.index_album) : null, discNumber: Number.isFinite(Number(song.index_cd)) ? Number(song.index_cd) + 1 : null, versionCode: Number(song.version) || 0, durationSeconds: Number(song.interval) || null },
  })).filter((track) => track.title);
};

const handleApiError = (request, env, requestId, error, fallback) => {
  console.error(JSON.stringify({ service: serviceName, version: serviceVersion(env), requestId, path: new URL(request.url).pathname, message: error instanceof Error ? error.message : fallback }));
  return json(request, env, 422, { error: error instanceof Error ? error.message : fallback }, requestId);
};

export const handleRequest = async (request, env = {}) => {
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const origins = allowedOrigins(env);

  if (request.method === 'OPTIONS') {
    if (origin && !origins.has(origin)) return json(request, env, 403, { error: 'Origin is not allowed.' }, requestId);
    return new Response(null, { status: 204, headers: responseHeaders(request, env) });
  }
  if (url.pathname.startsWith('/api/') && origin && !origins.has(origin)) return json(request, env, 403, { error: 'Origin is not allowed.' }, requestId);
  const syncResponse = await handleSync({ request, url, env, headers: responseHeaders(request, env), origin: [...origins][0] || defaultOrigin });
  if (syncResponse) return syncResponse;
  if (request.method === 'GET' && url.pathname === '/healthz') return json(request, env, 200, { status: 'ok', version: serviceVersion(env), providers: ['qqmusic', 'netease'] }, requestId);
  if (request.method === 'GET' && url.pathname === '/api/version') return json(request, env, 200, { version: serviceVersion(env), capabilities: ['qq-playlist', 'qq-album', 'qq-search', 'netease-playlist', 'musicbrainz-release-candidates', 'account-auto-sync'] }, requestId);

  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (url.pathname.startsWith('/api/') && !withinRateLimit(address)) return json(request, env, 429, { error: 'Too many metadata requests. Try again in a few minutes.' }, requestId);

  if (request.method === 'POST' && url.pathname === '/api/import/qq-album-preview') {
    try {
      const body = await readJsonBody(request);
      const resolved = await parseQQAlbumLink(body.text, { serviceAgent: serviceAgent(env) });
      const album = await cacheFor(`qq-album:${resolved.albumId}`, () => getQQAlbumDetails(resolved.albumId, { serviceAgent: serviceAgent(env) }));
      return json(request, env, 200, { album, sourceUrl: album.externalUrl || resolved.canonicalUrl }, requestId);
    } catch (error) { return handleApiError(request, env, requestId, error, 'Could not import this QQ Music album.'); }
  }
  if (request.method === 'GET' && url.pathname === '/api/import/qq-search') {
    try {
      const query = url.searchParams.get('q');
      const tracks = await cacheFor(`qq-search:${String(query || '').trim().toLowerCase()}`, () => searchQQCatalog(query, env));
      return json(request, env, 200, { tracks }, requestId);
    } catch (error) { return handleApiError(request, env, requestId, error, 'Could not search QQ Music.'); }
  }
  if (request.method === 'GET' && url.pathname === '/api/metadata/musicbrainz-release-candidates') {
    try {
      const album = url.searchParams.get('album'); const artist = url.searchParams.get('artist');
      const candidates = await cacheFor(`musicbrainz-release:${String(album || '').trim().toLowerCase()}:${String(artist || '').trim().toLowerCase()}`, () => searchMusicBrainzReleaseCandidates({ album, artist }, { serviceAgent: serviceAgent(env) }), 3_600_000);
      return json(request, env, 200, { candidates }, requestId);
    } catch (error) { return handleApiError(request, env, requestId, error, 'Could not search MusicBrainz release metadata.'); }
  }
  if (request.method === 'POST' && url.pathname === '/api/import/qq-playlist') {
    try {
      const body = await readJsonBody(request);
      return json(request, env, 200, await cacheFor(`qq-playlist:${body.shareUrl}`, () => fetchQQPlaylist(body.shareUrl, env)), requestId);
    } catch (error) { return handleApiError(request, env, requestId, error, 'Could not import this QQ Music playlist.'); }
  }
  if (request.method === 'POST' && url.pathname === '/api/import/netease-playlist') {
    try {
      const body = await readJsonBody(request);
      return json(request, env, 200, await cacheFor(`netease-playlist:${body.shareUrl}`, () => fetchNetEasePlaylist(body.shareUrl, env)), requestId);
    } catch (error) { return handleApiError(request, env, requestId, error, 'Could not import this NetEase playlist.'); }
  }
  return json(request, env, 404, { error: 'Not found.' }, requestId);
};

export default { fetch: handleRequest };
