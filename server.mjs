import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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
      headers: { 'User-Agent': 'How-I-Hear-Music/0.1 metadata importer', Referer: 'https://y.qq.com/' },
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
    headers: { 'User-Agent': 'How-I-Hear-Music/0.1 metadata importer', Referer: 'https://y.qq.com/' },
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
    provider: { source: 'qqmusic', playlistId, songMid: song.songmid || '', albumMid: song.albummid || '', durationSeconds: Number(song.interval) || null },
  })).filter((track) => track.title);
  if (!tracks.length) throw new Error('QQ Music found the playlist but exposed no importable track metadata.');
  return { playlist: { id: playlistId, title: playlist.dissname || 'QQ Music playlist', creator: playlist.nickname || '', trackCount: tracks.length }, tracks };
};

createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/import/qq-playlist') {
    try {
      const body = await readJsonBody(request);
      const result = await fetchQQPlaylist(body.shareUrl);
      json(response, 200, result);
    } catch (error) {
      json(response, 422, { error: error instanceof Error ? error.message : 'Could not import this QQ Music playlist.' });
    }
    return;
  }
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const safePath = normalize(requested).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = join(root, safePath);

  try {
    const body = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`How I Hear Music is running at http://localhost:${port}`);
});
