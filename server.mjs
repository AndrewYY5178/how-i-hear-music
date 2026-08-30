import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { getQQAlbumDetails, parseQQAlbumLink } from './server/providers/qqmusic-album.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const serviceVersion = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version;
const serviceAgent = `How-I-Hear-Music/${serviceVersion} metadata importer`;
const trustProxy = process.env.TRUST_PROXY === '1';
const allowedOrigins = new Set(String(process.env.ALLOWED_ORIGIN || '').split(',').map((value) => value.trim()).filter(Boolean));
const apiCache = new Map();
const rateWindows = new Map();
const cacheFor = async (key, producer, ttl = 300_000) => { const current = apiCache.get(key); if (current && current.expiresAt > Date.now()) return current.value; const value = await producer(); apiCache.set(key, { value, expiresAt: Date.now() + ttl }); if (apiCache.size > 200) { const oldest = apiCache.keys().next().value; apiCache.delete(oldest); } return value; };
const withinRateLimit = (address) => { const now = Date.now(); const recent = (rateWindows.get(address) || []).filter((at) => now - at < 600_000); if (recent.length >= 30) return false; recent.push(now); rateWindows.set(address, recent); return true; };
const clientAddress = (request) => trustProxy ? String(request.headers['x-forwarded-for'] || '').split(',')[0].trim() || request.socket.remoteAddress || 'unknown' : request.socket.remoteAddress || 'unknown';
const pruneRuntimeState = () => { const now = Date.now(); for (const [key, item] of apiCache) if (item.expiresAt <= now) apiCache.delete(key); for (const [key, times] of rateWindows) { const recent = times.filter((at) => now - at < 600_000); if (recent.length) rateWindows.set(key, recent); else rateWindows.delete(key); } };
setInterval(pruneRuntimeState, 300_000).unref();
const logEvent = (event) => console.log(JSON.stringify({ service: 'how-i-hear-music-adapter', version: serviceVersion, at: new Date().toISOString(), ...event }));
const logFailure = (request, requestId, error) => logEvent({ level: 'error', requestId, method: request.method, path: new URL(request.url || '/', 'http://localhost').pathname, message: error instanceof Error ? error.message : 'Unknown adapter error' });
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const json = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
};

const readJsonBody = async (request) => {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 20_000) throw new Error('Request body is too large.');
  }
  try { return JSON.parse(body || '{}'); } catch { throw new Error('The import request is not valid JSON.'); }
};

const isQQHost = (hostname) => hostname === 'qq.com' || hostname.endsWith('.qq.com');
const isNetEaseHost = (hostname) => hostname === 'music.163.com' || hostname.endsWith('.music.163.com') || hostname === '163cn.tv';
const publicDate = (value) => {
  const timestamp = Number(value); if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  const date = new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
};
const parsePublicQQUrl = (value) => {
  let url;
  try { url = new URL(String(value || '')); } catch { throw new Error('Paste a complete public QQ Music share link.'); }
  if (url.protocol !== 'https:' || !isQQHost(url.hostname)) throw new Error('Only public HTTPS QQ Music links can be imported.');
  return url;
};

const requestQQPage = async (initialUrl) => {
  let current = initialUrl;
  for (let index = 0; index < 4; index += 1) {
    const response = await fetch(current, {
      redirect: 'manual',
      headers: { 'User-Agent': serviceAgent, Referer: 'https://y.qq.com/' },
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('QQ Music returned an incomplete share redirect.');
      current = new URL(location, current);
      if (current.protocol !== 'https:' || !isQQHost(current.hostname)) throw new Error('The QQ Music share link redirected outside QQ Music.');
      continue;
    }
    if (!response.ok) throw new Error('QQ Music could not open this public share link (' + response.status + ').');
    return { url: current, html: await response.text() };
  }
  throw new Error('This QQ Music share link redirected too many times.');
};

const playlistIdFromQQShare = async (shareUrl) => {
  const supplied = parsePublicQQUrl(shareUrl);
  const initialId = supplied.searchParams.get('disstid') || supplied.searchParams.get('id') || supplied.pathname.match(/playlist\/(\d+)/i)?.[1];
  if (initialId && /^\d+$/.test(initialId)) return initialId;
  const { url, html } = await requestQQPage(supplied);
  const candidates = [
    url.searchParams.get('disstid'), url.searchParams.get('id'), url.pathname.match(/playlist\/(\d+)/i)?.[1],
    ...Array.from(html.matchAll(/(?:disstid|dissid|"id")\s*(?:=|:|%3D)\s*["']?(\d{5,})/gi), (match) => match[1]),
  ];
  const id = candidates.find((item) => /^\d+$/.test(item || ''));
  if (!id) throw new Error('This QQ Music link did not resolve to a public playlist. Paste the playlist share link, not a song or album link.');
  return id;
};

const fetchQQPlaylist = async (shareUrl) => {
  const playlistId = await playlistIdFromQQShare(shareUrl);
  const query = new URLSearchParams({
    type: '1', json: '1', utf8: '1', onlysong: '0', disstid: playlistId, format: 'json',
    g_tk: '5381', loginUin: '0', hostUin: '0', inCharset: 'utf8', outCharset: 'utf-8', notice: '0', platform: 'yqq.json', needNewCode: '0',
  });
  const upstream = await fetch('https://c.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?' + query, {
    headers: { 'User-Agent': serviceAgent, Referer: 'https://y.qq.com/' },
    signal: AbortSignal.timeout(12_000),
  });
  if (!upstream.ok) throw new Error('QQ Music playlist metadata is unavailable right now (' + upstream.status + ').');
  const data = await upstream.json();
  const playlist = data.cdlist?.[0];
  if (!playlist || !Array.isArray(playlist.songlist)) throw new Error('QQ Music did not return a readable public playlist. It may be private, unavailable or unsupported.');
  const tracks = playlist.songlist.map((song) => ({
    title: String(song.songname || '').trim(),
    artist: (song.singer || []).map((singer) => singer.name).filter(Boolean).join(' / ') || 'Artist not recorded',
    album: String(song.albumname || '').trim(),
    releaseDate: publicDate(song.pubtime),
    isrc: null,
    upc: null,
    externalReferences: song.songmid ? [{ provider: 'qqmusic', url: 'https://y.qq.com/n/ryqq/songDetail/' + encodeURIComponent(song.songmid) }] : [],
    provider: { source: 'qqmusic', playlistId, songMid: song.songmid || '', albumMid: song.albummid || '', durationSeconds: Number(song.interval) || null },
  })).filter((track) => track.title);
  if (!tracks.length) throw new Error('QQ Music found the playlist but exposed no importable track metadata.');
  return { playlist: { id: playlistId, title: playlist.dissname || 'QQ Music playlist', creator: playlist.nickname || '', trackCount: tracks.length }, tracks };
};

const parsePublicNetEaseUrl = (value) => {
  let url;
  try { url = new URL(String(value || '')); } catch { throw new Error('Paste a complete public NetEase Cloud Music share link.'); }
  if (url.protocol !== 'https:' || !isNetEaseHost(url.hostname)) throw new Error('Only public HTTPS NetEase Cloud Music links can be imported.');
  return url;
};

const playlistIdFromNetEaseShare = async (shareUrl) => {
  const supplied = parsePublicNetEaseUrl(shareUrl);
  const direct = supplied.searchParams.get('id') || supplied.pathname.match(/playlist\/(\d+)/i)?.[1];
  if (direct && /^\d+$/.test(direct)) return direct;
  let current = supplied;
  for (let index = 0; index < 4; index += 1) {
    const response = await fetch(current, { redirect: 'manual', headers: { 'User-Agent': serviceAgent, Referer: 'https://music.163.com/' }, signal: AbortSignal.timeout(12_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location'); if (!location) throw new Error('NetEase returned an incomplete share redirect.');
      current = new URL(location, current); if (current.protocol !== 'https:' || !isNetEaseHost(current.hostname)) throw new Error('The NetEase share link redirected outside NetEase Music.');
      const redirected = current.searchParams.get('id') || current.pathname.match(/playlist\/(\d+)/i)?.[1]; if (redirected && /^\d+$/.test(redirected)) return redirected;
      continue;
    }
    if (!response.ok) throw new Error('NetEase could not open this public share link (' + response.status + ').');
    const html = await response.text();
    const id = [current.searchParams.get('id'), current.pathname.match(/playlist\/(\d+)/i)?.[1], ...Array.from(html.matchAll(/(?:playlist\?id=|playlist\/)(\d{5,})/gi), (match) => match[1])].find((item) => /^\d+$/.test(item || ''));
    if (id) return id;
    break;
  }
  throw new Error('This NetEase link did not resolve to a public playlist. Paste the playlist share link, not a song or album link.');
};

const fetchNetEasePlaylist = async (shareUrl) => {
  const playlistId = await playlistIdFromNetEaseShare(shareUrl);
  const upstream = await fetch('https://music.163.com/api/playlist/detail?id=' + encodeURIComponent(playlistId), {
    headers: { 'User-Agent': serviceAgent, Referer: 'https://music.163.com/' },
    signal: AbortSignal.timeout(12_000),
  });
  if (!upstream.ok) throw new Error('NetEase playlist metadata is unavailable right now (' + upstream.status + ').');
  const data = await upstream.json(); const playlist = data.result;
  if (data.code !== 200 || !playlist || !Array.isArray(playlist.tracks)) throw new Error('NetEase did not return a readable public playlist. It may be private, unavailable or unsupported.');
  const tracks = playlist.tracks.map((song) => ({
    title: String(song.name || '').trim(),
    artist: (song.artists || []).map((artist) => artist.name).filter(Boolean).join(' / ') || 'Artist not recorded',
    album: String(song.album?.name || '').trim(),
    releaseDate: publicDate(song.album?.publishTime),
    isrc: null,
    upc: null,
    externalReferences: song.id ? [{ provider: 'netease', url: 'https://music.163.com/song?id=' + encodeURIComponent(song.id) }] : [],
    provider: { source: 'netease', playlistId, songId: Number(song.id) || null, albumId: Number(song.album?.id) || null, artistIds: (song.artists || []).map((artist) => Number(artist.id)).filter(Number.isFinite), durationSeconds: Number(song.duration) ? Math.round(Number(song.duration) / 1000) : null },
  })).filter((track) => track.title);
  if (!tracks.length) throw new Error('NetEase found the playlist but exposed no importable track metadata.');
  return { playlist: { id: playlistId, title: playlist.name || 'NetEase playlist', creator: playlist.creator?.nickname || '', trackCount: tracks.length }, tracks };
};

const searchQQCatalog = async (query) => {
  const keyword = String(query || '').trim();
  if (!keyword || keyword.length > 120) throw new Error('Enter a music search between 1 and 120 characters.');
  const params = new URLSearchParams({ p: '1', n: '12', w: keyword, format: 'json', new_json: '1', cr: '1', aggr: '1', lossless: '0', flag_qc: '0' });
  const upstream = await fetch('https://c.y.qq.com/soso/fcgi-bin/client_search_cp?' + params, {
    headers: { 'User-Agent': serviceAgent, Referer: 'https://y.qq.com/' },
    signal: AbortSignal.timeout(12_000),
  });
  if (!upstream.ok) throw new Error('QQ Music search is unavailable right now (' + upstream.status + ').');
  const data = await upstream.json();
  const rows = data.data?.song?.list || data.data?.song?.itemlist || [];
  return rows.map((song) => ({
    title: String(song.songname || song.name || '').trim(),
    artist: (song.singer || []).map((singer) => singer.name).filter(Boolean).join(' / ') || String(song.singername || 'Artist not recorded'),
    album: String(song.albumname || song.album?.name || '').trim(),
    releaseDate: publicDate(song.pubtime),
    isrc: null,
    upc: null,
    externalReferences: (song.songmid || song.mid) ? [{ provider: 'qqmusic', url: 'https://y.qq.com/n/ryqq/songDetail/' + encodeURIComponent(song.songmid || song.mid) }] : [],
    provider: { source: 'qqmusic', songMid: song.songmid || song.mid || '', albumMid: song.albummid || song.album?.mid || '', durationSeconds: Number(song.interval) || null },
  })).filter((track) => track.title);
};

createServer(async (request, response) => {
  const requestId = randomUUID(); const startedAt = Date.now(); const requestPath = new URL(request.url || '/', 'http://localhost').pathname;
  response.setHeader('X-Request-Id', requestId);
  response.on('finish', () => logEvent({ level: 'info', requestId, method: request.method, path: requestPath, status: response.statusCode, durationMs: Date.now() - startedAt }));
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self' https:; base-uri 'self'; object-src 'none'");
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) { response.setHeader('Access-Control-Allow-Origin', origin); response.setHeader('Vary', 'Origin'); response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); }
  if (request.method === 'OPTIONS') { if (origin && !allowedOrigins.has(origin)) { response.writeHead(403); response.end(); } else { response.writeHead(204); response.end(); } return; }
  if (request.method === 'GET' && requestPath === '/healthz') { json(response, 200, { status: 'ok', version: serviceVersion, uptimeSeconds: Math.round(process.uptime()), cacheEntries: apiCache.size, providers: ['qqmusic', 'netease'] }); return; }
  if (request.method === 'GET' && requestPath === '/api/version') { json(response, 200, { version: serviceVersion, capabilities: ['qq-playlist', 'qq-album', 'qq-search', 'netease-playlist'] }); return; }
  if (request.url?.startsWith('/api/') && !withinRateLimit(clientAddress(request))) { json(response, 429, { error: 'Too many metadata requests. Try again in a few minutes.' }); return; }
  if (request.method === 'POST' && request.url === '/api/import/qq-album-preview') {
    try {
      const body = await readJsonBody(request);
      const resolved = await parseQQAlbumLink(body.text);
      const album = await cacheFor(`qq-album:${resolved.albumId}`, () => getQQAlbumDetails(resolved.albumId));
      json(response, 200, { album, sourceUrl: album.externalUrl || resolved.canonicalUrl });
    } catch (error) {
      logFailure(request, requestId, error);
      json(response, 422, { error: error instanceof Error ? error.message : 'Could not import this QQ Music album.' });
    }
    return;
  }
  if (request.method === 'GET' && request.url?.startsWith('/api/import/qq-search')) {
    try {
      const query = new URL(request.url, 'http://localhost').searchParams.get('q');
      json(response, 200, { tracks: await cacheFor(`qq-search:${String(query || '').trim().toLowerCase()}`, () => searchQQCatalog(query)) });
    } catch (error) {
      logFailure(request, requestId, error);
      json(response, 422, { error: error instanceof Error ? error.message : 'Could not search QQ Music.' });
    }
    return;
  }
  if (request.method === 'POST' && request.url === '/api/import/qq-playlist') {
    try {
      const body = await readJsonBody(request);
      const result = await cacheFor(`qq-playlist:${body.shareUrl}`, () => fetchQQPlaylist(body.shareUrl));
      json(response, 200, result);
    } catch (error) {
      logFailure(request, requestId, error);
      json(response, 422, { error: error instanceof Error ? error.message : 'Could not import this QQ Music playlist.' });
    }
    return;
  }
  if (request.method === 'POST' && request.url === '/api/import/netease-playlist') {
    try {
      const body = await readJsonBody(request);
      const result = await cacheFor(`netease-playlist:${body.shareUrl}`, () => fetchNetEasePlaylist(body.shareUrl));
      json(response, 200, result);
    } catch (error) {
      logFailure(request, requestId, error);
      json(response, 422, { error: error instanceof Error ? error.message : 'Could not import this NetEase playlist.' });
    }
    return;
  }
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const safePath = normalize(requested).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = join(root, safePath);

  try {
    const body = await readFile(filePath);
    const cacheControl = safePath.endsWith('sw.js') || extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=300';
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream', 'Cache-Control': cacheControl });
    response.end(body);
  } catch {
    if (request.method === 'GET' && !extname(safePath)) {
      const body = await readFile(join(root, 'index.html'));
      response.writeHead(200, { 'Content-Type': contentTypes['.html'], 'Cache-Control': 'no-cache' });
      response.end(body);
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, host, () => {
  console.log(`How I Hear Music is running at http://${host}:${port}`);
});
