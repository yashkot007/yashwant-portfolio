import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import './build-profile.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteOrigin = 'https://yashwantkotipalli.com';
const publicDir = path.join(root, 'public');
const profile = JSON.parse(await readFile(path.join(root, 'data/public-profile.json'), 'utf8'));
const person = {
  '@context': 'https://schema.org', '@type': 'Person',
  name: profile.name, url: `${siteOrigin}/`,
  jobTitle: profile.current_role.title,
  worksFor: { '@type': 'Organization', name: profile.current_role.organization },
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: profile.skills,
};
const indexPath = path.join(publicDir, 'index.html');
let html = await readFile(indexPath, 'utf8');
const metadata = [
  `  <link rel="canonical" href="${siteOrigin}/">`,
  `  <meta property="og:url" content="${siteOrigin}/">`,
  `  <script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`,
].join('\n');
html = html.replace(/\n?[ \t]*<!-- public-metadata-start -->[\s\S]*?<!-- public-metadata-end -->[ \t]*\n?/, '\n');
html = html.replace('</head>', `  <!-- public-metadata-start -->\n${metadata}\n  <!-- public-metadata-end -->\n</head>`);
await writeFile(indexPath, html);
await writeFile(path.join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`);
await writeFile(path.join(publicDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteOrigin}/</loc></url></urlset>\n`);
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'server'), { recursive: true });
await cp(publicDir, path.join(dist, 'client'), { recursive: true });
await cp(path.join(root, 'worker.js'), path.join(dist, 'server/index.js'));
await mkdir(path.join(dist, '.openai'), { recursive: true });
await cp(path.join(root, '.openai/hosting.json'), path.join(dist, '.openai/hosting.json'));
console.log('Built the portfolio and agent formats');
