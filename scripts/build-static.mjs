import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const profile = JSON.parse(await readFile(join(root, 'data/music-profile.json'), 'utf8'));
const songs = JSON.parse(await readFile(join(root, 'data/songs.json'), 'utf8')).entries;
const artistsData = JSON.parse(await readFile(join(root, 'data/artists.json'), 'utf8'));
const artists = [...artistsData.featured, ...artistsData.uncertain];
const albums = profile.albumArchive;
const baseUrl = 'https://andrewyy5178.github.io/how-i-hear-music';
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
const link = (href, label) => `<a href="/how-i-hear-music${href}">${escape(label)}</a>`;
const list = (items) => `<ol class="snapshot-list">${items.map((item) => `<li><strong>${escape(item.label)}</strong>${item.note ? `<span>${escape(item.note)}</span>` : ''}</li>`).join('')}</ol>`;

const routes = [
  { path: '/', title: 'How I Hear Music', description: 'A personal music taste archive: listening shapes, album landscapes and notes over time.' },
  { path: '/archive', title: 'Archive', description: `${songs.length} Tracks, ${albums.length} Albums and ${artists.length} Artists in a personal listening archive.`, body: `<section class="page-head"><span class="eyebrow mono">ARCHIVE</span><h1>Browse the record.</h1><p>Tracks, albums and artists that have entered the archive.</p></section><nav class="snapshot-gates">${link('/archive/tracks', `${songs.length} Tracks`)}${link('/archive/albums', `${albums.length} Albums`)}${link('/archive/artists', `${artists.length} Artists`)}</nav>` },
  { path: '/archive/tracks', title: 'Archive — Tracks', description: `${songs.length} recorded Tracks with explicit personal listening scores.`, body: `<section class="page-head"><span class="eyebrow mono">ARCHIVE / TRACKS</span><h1>Tracks in the record.</h1><p>Ratings are personal evidence and are never inferred.</p></section>${list(songs.map((track) => ({ label: track.title, note: track.artist })))}` },
  { path: '/archive/albums', title: 'Archive — Albums', description: `${albums.length} Albums in the How I Hear Music archive.`, body: `<section class="page-head"><span class="eyebrow mono">ARCHIVE / ALBUMS</span><h1>Albums in view.</h1><p>Confirmed records and listening landscapes.</p></section>${list(albums.map((album) => ({ label: album.title, note: album.artist })))}` },
  { path: '/archive/artists', title: 'Archive — Artists', description: `${artists.length} Artists represented in the How I Hear Music archive.`, body: `<section class="page-head"><span class="eyebrow mono">ARCHIVE / ARTISTS</span><h1>The people at the center.</h1><p>Artists represented by confirmed listening records.</p></section>${list(artists.map((artist) => ({ label: artist.name, note: artist.role || artist.romanized || '' })))}` },
  { path: '/rate', title: 'Rate', description: 'Rate one Track across Song, Vocal, Production and Overall without replacing personal listening judgment.', body: `<section class="page-head"><span class="eyebrow mono">RATE</span><h1>Begin with one listening decision.</h1><p>Four dimensions, one personal response. Scores stay in this browser.</p></section>` },
  { path: '/taste', title: 'Taste', description: 'The evidence-based listening philosophy and Taste system behind How I Hear Music.', body: `<section class="page-head"><span class="eyebrow mono">TASTE</span><h1>How I hear music.</h1><p>Melody, production, interpretation and resonance—described without pretending preference is objective.</p></section>` },
  { path: '/import', title: 'Import', description: 'Import public QQ Music and NetEase metadata without platform login, Cookies, audio or lyrics.', body: `<section class="page-head"><span class="eyebrow mono">IMPORT</span><h1>Bring music in.</h1><p>Public playlist and album metadata only. Review precedes every local write.</p></section>` },
  { path: '/journal', title: 'Journal', description: 'A private browser-local listening journal built from saved ratings, notes and corrections.', body: `<section class="page-head"><span class="eyebrow mono">JOURNAL</span><h1>Listening, over time.</h1><p>Saved ratings and notes remain local unless their owner exports a backup.</p></section>` },
];

const source = await readFile(join(root, 'index.html'), 'utf8');
for (const route of routes.filter((item) => item.path !== '/')) {
  const canonical = `${baseUrl}${route.path}/`;
  const html = source.replace('<base id="app-base" href="./" />', '<base id="app-base" href="/how-i-hear-music/" />').replaceAll('="./', '="/how-i-hear-music/')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(route.title)} — How I Hear Music</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escape(route.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escape(route.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escape(route.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escape(route.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escape(route.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace('<main id="app" tabindex="-1"></main>', `<main id="app" tabindex="-1" data-static-snapshot>${route.body}</main>`);
  const target = join(root, route.path.slice(1), 'index.html'); await mkdir(dirname(target), { recursive: true }); await writeFile(target, html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${baseUrl}${route.path === '/' ? '/' : `${route.path}/`}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(root, 'sitemap.xml'), sitemap);
console.log(`Static snapshots built: ${routes.length - 1} route documents and ${routes.length} sitemap URLs.`);
