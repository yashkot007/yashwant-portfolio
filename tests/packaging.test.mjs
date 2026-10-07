import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectPublicAssets } from '../scripts/package-worker.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicDir = path.join(root, 'public');
const dist = path.join(root, 'dist');
const { default: worker } = await import(pathToFileURL(path.join(dist, 'server/index.js')).href);
const origin = 'https://yashwantkotipalli.com';
const fetch = (pathname, options) => worker.fetch(new Request(origin + pathname, options));

async function publicFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!prefix && ['_headers', '_redirects', '.assetsignore'].includes(entry.name)) continue;
    const relative = prefix + entry.name;
    if (entry.isDirectory()) files.push(...await publicFiles(path.join(directory, entry.name), relative + '/'));
    else files.push(relative);
  }
  return files.sort();
}

test('deployment artifact has no static files that can intercept the Worker', async () => {
  assert.deepEqual((await readdir(dist)).sort(), ['.openai', 'server']);
  assert.deepEqual(await readdir(path.join(dist, 'server')), ['index.js']);
  assert.equal(await lstat(path.join(dist, 'client')).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error)), null);
  const sourceHosting = JSON.parse(await readFile(path.join(root, '.openai/hosting.json'), 'utf8'));
  const builtHosting = JSON.parse(await readFile(path.join(dist, '.openai/hosting.json'), 'utf8'));
  assert.deepEqual(builtHosting, sourceHosting);
  assert.equal(builtHosting.static, undefined);
  const response = await fetch('/'); // The deployed bundle needs no native ASSETS binding.
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Link'), /<https:\/\/yashwantkotipalli\.com\/>; rel="canonical"/);
  assert.equal(await response.text(), await readFile(path.join(publicDir, 'index.html'), 'utf8'));
});

test('packaged public files retain exact bytes, types and content-based ETags', async () => {
  const types = {
    'index.html': 'text/html; charset=utf-8',
    'profile.json': 'application/json; charset=utf-8',
    'profile.md': 'text/markdown; charset=utf-8',
    'llms.txt': 'text/plain; charset=utf-8',
    'robots.txt': 'text/plain; charset=utf-8',
    'sitemap.xml': 'application/xml; charset=utf-8',
    'assets/styles.css': 'text/css; charset=utf-8',
    'assets/site.js': 'text/javascript; charset=utf-8',
    'assets/favicon.svg': 'image/svg+xml',
    'assets/oracle-official.png': 'image/png',
    'assets/deloitte-white.png': 'image/png',
    'assets/amazon-inverse-official.svg': 'image/svg+xml',
  };
  for (const filename of await publicFiles(publicDir)) {
    const pathname = filename === 'index.html' ? '/' : '/' + filename.split('/').map(encodeURIComponent).join('/');
    const bytes = await readFile(path.join(publicDir, filename));
    const response = await fetch(pathname + '?packaging-check=1');
    assert.equal(response.status, 200, filename);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes, filename);
    assert.equal(response.headers.get('Content-Length'), String(bytes.length), filename);
    assert.equal(response.headers.get('ETag'), '"sha256-' + createHash('sha256').update(bytes).digest('hex') + '"', filename);
    assert.equal(response.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate', filename);
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff', filename);
    if (types[filename]) assert.equal(response.headers.get('Content-Type'), types[filename], filename);
  }
});

test('packaged HEAD and conditional requests preserve each selected representation', async () => {
  for (const [pathname, accept] of [['/', 'text/html'], ['/assets/oracle-official.png', '*/*'], ['/profile', 'application/json'], ['/profile', 'text/markdown']]) {
    const get = await fetch(pathname, { headers: { Accept: accept } });
    const headers = { Accept: accept, 'If-None-Match': '"unrelated", W/' + get.headers.get('ETag') };
    const head = await fetch(pathname, { method: 'HEAD', headers: { Accept: accept } });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const name of ['Content-Type', 'Content-Length', 'ETag', 'Cache-Control', 'Vary', 'Link']) assert.equal(head.headers.get(name), get.headers.get(name));
    for (const method of ['GET', 'HEAD']) {
      const fresh = await fetch(pathname, { method, headers });
      assert.equal(fresh.status, 304);
      assert.equal(await fresh.text(), '');
      assert.equal(fresh.headers.get('ETag'), get.headers.get('ETag'));
      assert.equal(fresh.headers.get('Vary'), get.headers.get('Vary'));
      assert.equal(fresh.headers.get('Link'), get.headers.get('Link'));
    }
    const changed = await fetch(pathname, { headers: { Accept: accept, 'If-None-Match': '"outdated"' } });
    assert.equal(changed.status, 200);
    const any = await fetch(pathname, { headers: { Accept: accept, 'If-None-Match': '*' } });
    assert.equal(any.status, 304);
  }
  const html = await fetch('/profile', { headers: { Accept: 'text/html' } });
  const json = await fetch('/profile', { headers: { Accept: 'application/json', 'If-None-Match': html.headers.get('ETag') } });
  assert.equal(json.status, 200);
  assert.notEqual(json.headers.get('ETag'), html.headers.get('ETag'));
  assert.equal(json.headers.get('Vary'), 'Accept-Encoding, Accept');
});

test('packaged aliases redirect while negotiated formats and crawler content stay consistent', async () => {
  for (const alias of ['http://yashwantkotipalli.com', 'https://www.yashwantkotipalli.com', 'https://yashwant-kotipalli.yashwant7kotipalli.chatgpt.site']) {
    for (const method of ['GET', 'HEAD']) {
      const response = await worker.fetch(new Request(alias + '/profile.json?ref=contact', { method }));
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('Location'), origin + '/profile.json?ref=contact');
      const target = await worker.fetch(new Request(response.headers.get('Location'), { method }));
      assert.equal(target.status, 200);
      assert.equal(target.headers.get('Location'), null);
    }
  }
  const index = await fetch('/index.html?ref=contact');
  assert.equal(index.status, 308);
  assert.equal(index.headers.get('Location'), origin + '/?ref=contact');
  const preview = await worker.fetch(new Request('http://localhost:8766/'));
  assert.equal(preview.status, 200);
  assert.equal(preview.headers.get('Location'), null);
  for (const [pathname, accept] of [['/', 'text/html'], ['/profile', 'application/json'], ['/profile', 'text/markdown']]) {
    const variants = [];
    for (const agent of ['Mozilla/5.0', 'Googlebot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot']) {
      const response = await fetch(pathname, { headers: { Accept: accept, 'User-Agent': agent } });
      variants.push({ status: response.status, headers: [...response.headers], body: await response.text() });
    }
    for (const variant of variants) assert.deepEqual(variant, variants[0]);
  }
});

test('packaged asset paths return uncached errors without exposing source files', async () => {
  for (const pathname of ['/missing.css', '/assets/%2f..%2fprofile.json', '/%2e%2e%2fprofile.json', '/.openai/hosting.json', '/scripts/package-worker.mjs', '/__proto__']) {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(pathname, { method });
      assert.equal(response.status, 404, pathname);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.equal(response.headers.get('Link'), null);
      assert.equal(await response.text(), method === 'HEAD' ? '' : 'Not found\n');
    }
  }
  const post = await fetch('/assets/styles.css', { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('Allow'), 'GET, HEAD');
  assert.equal(post.headers.get('Cache-Control'), 'no-store');
});

test('packaging rejects external symlinks and omits static configuration files', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-package-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const publicRoot = path.join(directory, 'public');
  await mkdir(publicRoot);
  await writeFile(path.join(publicRoot, 'index.html'), '<!doctype html><title>Fixture</title>');
  await writeFile(path.join(publicRoot, '_headers'), '/\n  Link: <https://example.com/>; rel="canonical"\n');
  const manifest = await collectPublicAssets(publicRoot);
  assert.deepEqual(Object.keys(manifest), ['/index.html']);
  await writeFile(path.join(directory, 'outside.txt'), 'Outside the public tree');
  await symlink(path.join(directory, 'outside.txt'), path.join(publicRoot, 'linked.txt'));
  await assert.rejects(collectPublicAssets(publicRoot), /must not contain symbolic links/);
});
