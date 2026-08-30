import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

class LocalStorageMock {
  getItem(key) { return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : null; }
  setItem(key, value) { this[key] = String(value); }
  removeItem(key) { delete this[key]; }
}
globalThis.localStorage = new LocalStorageMock();
globalThis.location = { search: '', hostname: 'localhost', pathname: '/', href: 'http://localhost:3000/' };
globalThis.window = globalThis;
globalThis.document = { querySelector: () => null };
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => { const url = input instanceof URL ? input : new URL(input); if (url.protocol !== 'file:') return nativeFetch(input, options); try { return new Response(await readFile(url), { status: 200, headers: { 'Content-Type': 'application/json' } }); } catch { return new Response('', { status: 404 }); } };

const archive = await import('../modules/archive/pages.js');
const imports = await import('../modules/import/pages.js');
const journal = await import('../modules/journal/pages.js');
const rating = await import('../modules/rating/pages.js');
const search = await import('../modules/search/pages.js');
const taste = await import('../modules/taste/pages.js');

const renders = [
  ['Archive tracks', archive.archiveTracks], ['Archive metadata', archive.archiveCoverage],
  ['Data Desk', imports.importData], ['Journal', journal.journal], ['Entropy', journal.entropyPage],
  ['Memory Palace', journal.memoryPalace], ['Rate', rating.rateHome], ['Search', search.searchPage],
  ['Taste DNA', taste.dna], ['Blind Spots', taste.blindSpotPage],
];
for (const [name, render] of renders) {
  const html = render();
  assert.equal(typeof html, 'string', `${name} did not return markup`);
  assert.match(html, /<h1>|page-head/, `${name} lacks a page heading`);
  assert.equal(html.includes('undefined'), false, `${name} exposed undefined`);
}

console.log(`Route render checks passed: ${renders.length} reliability, retrieval and analysis views.`);
