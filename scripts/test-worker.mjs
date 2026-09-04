import { handleRequest } from '../worker/index.mjs';

const env = { ALLOWED_ORIGIN: 'https://andrewyy5178.github.io', SERVICE_VERSION: '0.9.7' };
const allowedOrigin = env.ALLOWED_ORIGIN;
const request = (path, options = {}) => new Request(`https://adapter.example${path}`, options);
const expect = (condition, message) => { if (!condition) throw new Error(message); };

const health = await handleRequest(request('/healthz'), env);
const healthBody = await health.json();
expect(health.status === 200 && healthBody.status === 'ok' && healthBody.version === env.SERVICE_VERSION, 'Worker health contract failed.');

const version = await handleRequest(request('/api/version', { headers: { Origin: allowedOrigin } }), env);
const versionBody = await version.json();
expect(version.status === 200 && versionBody.capabilities.includes('qq-playlist') && versionBody.capabilities.includes('musicbrainz-release-candidates'), 'Worker version contract failed.');
expect(versionBody.capabilities.includes('account-auto-sync'), 'Worker account auto-sync capability is not advertised.');
expect(version.headers.get('Access-Control-Allow-Origin') === allowedOrigin, 'Worker did not return the configured CORS origin.');

const preflight = await handleRequest(request('/api/import/qq-playlist', { method: 'OPTIONS', headers: { Origin: allowedOrigin } }), env);
expect(preflight.status === 204 && preflight.headers.get('Access-Control-Allow-Methods')?.includes('POST'), 'Worker CORS preflight failed.');

const rejected = await handleRequest(request('/api/version', { headers: { Origin: 'https://example.com' } }), env);
expect(rejected.status === 403, 'Worker accepted an unconfigured browser origin.');

const unconfiguredSync = await handleRequest(request('/api/sync/status', { headers: { Origin: allowedOrigin } }), env);
expect(unconfiguredSync.status === 503 && (await unconfiguredSync.json()).error.includes('not configured'), 'Worker did not keep private sync unavailable without its database and OAuth secret.');

const nativeFetch = globalThis.fetch;
globalThis.fetch = async () => new Response(JSON.stringify({ data: { song: { list: [{ id: 101, mid: 'songMid01', name: 'Fixture Track', time_public: '2025-12-28', version: 3, index_album: 7, index_cd: 1, interval: 180, singer: [{ name: 'Fixture Artist' }], album: { id: 202, mid: 'albumMid01', name: 'Fixture Album' } }] } } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
const search = await handleRequest(request('/api/import/qq-search?q=Fixture', { headers: { Origin: allowedOrigin, 'CF-Connecting-IP': 'fixture-search' } }), env);
const searchTrack = (await search.json()).tracks?.[0];
expect(search.status === 200 && searchTrack?.releaseDate === '2025-12-28', 'Worker did not preserve QQ time_public release metadata.');
expect(searchTrack?.provider?.albumMid === 'albumMid01' && searchTrack.provider.versionCode === 3 && searchTrack.provider.trackNumber === 7 && searchTrack.provider.discNumber === 2, 'Worker did not preserve QQ entity/version/order evidence.');
globalThis.fetch = nativeFetch;

globalThis.fetch = async () => new Response(JSON.stringify({ releases: [{ id: 'fixture-release', title: 'Fixture Album', date: '2025-12-28', country: 'US', 'artist-credit': [{ name: 'Fixture Artist' }], 'text-representation': { language: 'eng' } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
const releaseCandidates = await handleRequest(request('/api/metadata/musicbrainz-release-candidates?album=Fixture%20Album&artist=Fixture%20Artist', { headers: { Origin: allowedOrigin, 'CF-Connecting-IP': 'fixture-musicbrainz' } }), env);
const releaseCandidate = (await releaseCandidates.json()).candidates?.[0];
expect(releaseCandidates.status === 200 && releaseCandidate?.region === 'US' && releaseCandidate?.language === 'eng' && releaseCandidate?.sourceUrl.endsWith('/fixture-release'), 'Worker did not preserve reviewable MusicBrainz release language and region candidates.');
globalThis.fetch = nativeFetch;

const invalid = await handleRequest(request('/api/import/qq-playlist', {
  method: 'POST',
  headers: { Origin: allowedOrigin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ shareUrl: 'https://example.com/private' }),
}), env);
expect(invalid.status === 422 && (await invalid.json()).error.includes('QQ Music'), 'Worker invalid-request boundary failed.');

const missing = await handleRequest(request('/unknown'), env);
expect(missing.status === 404, 'Worker unknown-route handling failed.');

console.log('Worker contract test passed: health, version, CORS, validation and 404 behavior.');
