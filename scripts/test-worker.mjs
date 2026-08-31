import { handleRequest } from '../worker/index.mjs';

const env = { ALLOWED_ORIGIN: 'https://andrewyy5178.github.io', SERVICE_VERSION: '0.4.10' };
const allowedOrigin = env.ALLOWED_ORIGIN;
const request = (path, options = {}) => new Request(`https://adapter.example${path}`, options);
const expect = (condition, message) => { if (!condition) throw new Error(message); };

const health = await handleRequest(request('/healthz'), env);
const healthBody = await health.json();
expect(health.status === 200 && healthBody.status === 'ok' && healthBody.version === env.SERVICE_VERSION, 'Worker health contract failed.');

const version = await handleRequest(request('/api/version', { headers: { Origin: allowedOrigin } }), env);
const versionBody = await version.json();
expect(version.status === 200 && versionBody.capabilities.includes('qq-playlist'), 'Worker version contract failed.');
expect(version.headers.get('Access-Control-Allow-Origin') === allowedOrigin, 'Worker did not return the configured CORS origin.');

const preflight = await handleRequest(request('/api/import/qq-playlist', { method: 'OPTIONS', headers: { Origin: allowedOrigin } }), env);
expect(preflight.status === 204 && preflight.headers.get('Access-Control-Allow-Methods')?.includes('POST'), 'Worker CORS preflight failed.');

const rejected = await handleRequest(request('/api/version', { headers: { Origin: 'https://example.com' } }), env);
expect(rejected.status === 403, 'Worker accepted an unconfigured browser origin.');

const invalid = await handleRequest(request('/api/import/qq-playlist', {
  method: 'POST',
  headers: { Origin: allowedOrigin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ shareUrl: 'https://example.com/private' }),
}), env);
expect(invalid.status === 422 && (await invalid.json()).error.includes('QQ Music'), 'Worker invalid-request boundary failed.');

const missing = await handleRequest(request('/unknown'), env);
expect(missing.status === 404, 'Worker unknown-route handling failed.');

console.log('Worker contract test passed: health, version, CORS, validation and 404 behavior.');
