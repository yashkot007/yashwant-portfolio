import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Loading the dependency-free Worker this way also works before the parent
// checkout's package.json declares its JavaScript module type.
const source = await readFile(new URL('../worker.js', import.meta.url), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const json = await readFile(new URL('../public/profile.json', import.meta.url), 'utf8');
const markdown = await readFile(new URL('../public/profile.md', import.meta.url), 'utf8');
const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');
const canonical = JSON.parse(await readFile(new URL('../data/public-profile.json', import.meta.url), 'utf8'));
const html = '<!doctype html><title>Yashwant Kotipalli</title><h1>Human portfolio</h1>';

function fixture() {
  const calls = [];
  const assets = new Map([
    ['/', [html, 'text/html']],
    ['/index.html', [html, 'text/html']],
    ['/profile.json', [json, 'application/json']],
    ['/profile.md', [markdown, 'text/markdown']],
    ['/llms.txt', [llms, 'text/plain']],
    ['/main.css', ['body { color: black; }', 'text/css']],
  ]);
  return {
    calls,
    env: { ASSETS: { async fetch(request) {
      const url = new URL(request.url);
      calls.push({ pathname: url.pathname, accept: request.headers.get('Accept'), method: request.method });
      const asset = assets.get(url.pathname);
      if (!asset) return new Response('Not found', { status: 404 });
      return new Response(request.method === 'HEAD' ? null : asset[0], { headers: { 'Content-Type': asset[1], Vary: 'Accept-Encoding' } });
    } } },
  };
}

async function get(path, accept, extras = {}) {
  const { env, calls } = fixture();
  const headers = { ...extras.headers };
  if (accept !== undefined) headers.Accept = accept;
  const response = await worker.fetch(new Request(`https://portfolio.example${path}`, { method: extras.method ?? 'GET', headers }), env);
  return { response, calls };
}

test('explicit formats map to root assets under any repository base path', async () => {
  for (const prefix of ['', '/yashwant-portfolio', '/nested/site']) {
    for (const [suffix, type] of [['json', 'application/json'], ['md', 'text/markdown']]) {
      const { response, calls } = await get(`${prefix}/profile.${suffix}`, 'text/html');
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Content-Type'), `${type}; charset=utf-8`);
      assert.equal(calls[0].pathname, `/profile.${suffix}`);
      assert.equal(calls[0].accept, null);
      assert.match(response.headers.get('Link'), new RegExp(`${prefix}/profile\\.json`));
      assert.equal(response.headers.get('Vary'), 'Accept-Encoding');
    }
  }
});

test('negotiation respects quality values and combines Vary', async () => {
  const { response, calls } = await get('/profile', 'text/html;q=0.2, application/json;q=0.9, text/markdown;q=0.5');
  assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
  assert.deepEqual(calls.map((item) => item.pathname), ['/profile.json']);
  assert.equal(response.headers.get('Vary'), 'Accept-Encoding, Accept');
  assert.equal(JSON.parse(await response.text()).name, 'Yashwant Kotipalli');
});

test('specific zero quality overrides a positive wildcard', async () => {
  const { response } = await get('/profile', 'text/html;q=0, text/markdown;q=0, */*;q=0.8');
  assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
  const none = await get('/profile', 'text/html;q=0, text/markdown;q=0, application/json;q=0, */*;q=1');
  assert.equal(none.response.status, 406);
  assert.equal(none.response.headers.get('Vary'), 'Accept');
  assert.equal(none.calls.length, 0);
  const wildcardRefusal = await get('/profile', '*/*;q=0');
  assert.equal(wildcardRefusal.response.status, 406);
});

test('missing or broad Accept defaults to the human representation', async () => {
  for (const accept of [undefined, '*/*', 'text/*', 'application/json;q=0.5, text/html;q=0.5']) {
    const { response } = await get('/profile', accept);
    assert.equal(response.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assert.equal(await response.text(), html);
  }
  const application = await get('/profile', 'application/*');
  assert.equal(application.response.headers.get('Content-Type'), 'application/json; charset=utf-8');
});

test('specificity governs a format quality before representations are compared', async () => {
  const { response } = await get('/profile', 'application/json;q=0.1, application/*;q=1, text/markdown;q=0.7, text/html;q=0.2');
  assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  const unknown = await get('/profile', 'image/png');
  assert.equal(unknown.response.status, 406);
  const invalid = await get('/profile', 'application/json;q=7, text/html;q=0.2');
  assert.equal(invalid.response.headers.get('Content-Type'), 'text/html; charset=utf-8');
});

test('ordinary requests are not negotiated and crawler hints do not gate content', async () => {
  const home = await get('/', 'application/json', { headers: { 'User-Agent': 'ExampleBot/1.0' } });
  assert.equal(home.response.headers.get('Content-Type'), 'text/html');
  assert.equal(await home.response.text(), html);
  assert.equal(home.response.headers.get('Vary'), 'Accept-Encoding');
  const css = await get('/main.css', 'application/json');
  assert.equal(css.response.headers.get('Content-Type'), 'text/css');
  assert.equal(css.calls[0].pathname, '/main.css');
  const lookalike = await get('/notprofile.json', 'application/json');
  assert.equal(lookalike.response.status, 404);
});

test('HEAD and method handling preserve format semantics', async () => {
  const head = await get('/repo/profile', 'text/markdown', { method: 'HEAD' });
  assert.equal(head.response.status, 200);
  assert.equal(head.response.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(await head.response.text(), '');
  const post = await get('/profile', 'application/json', { method: 'POST' });
  assert.equal(post.response.status, 405);
  assert.equal(post.response.headers.get('Allow'), 'GET, HEAD');
  assert.equal(post.calls.length, 0);
});

test('generated profiles preserve approved claims, project status and actual public links', () => {
  const profile = JSON.parse(json);
  const { representations, ...facts } = profile;
  assert.deepEqual(facts, canonical);
  assert.equal(profile.current_role.organization, 'Oracle Cloud Infrastructure');
  assert.equal(profile.current_role.start, '2025-08');
  assert.deepEqual(profile.experience[0].ongoing_work, ['Developing a GPU-validation control plane.']);
  assert.match(profile.focus_context, /active areas? of study/);
  assert.equal(profile.public_work[1].status, 'Independent experimental prototype');
  for (const url of [
    'https://github.com/openclaw/openclaw/pull/81731',
    'https://github.com/yashkot007/accord',
    'https://github.com/yashkot007',
    'https://www.linkedin.com/in/yashwant-kotipalli',
    'mailto:yashwant7kotipalli@gmail.com',
  ]) {
    assert.ok(json.includes(url), `JSON missing ${url}`);
    assert.ok(markdown.includes(url), `Markdown missing ${url}`);
    assert.ok(llms.includes(url), `Reading guide missing ${url}`);
  }
  assert.deepEqual(profile.representations, { human: './', json: './profile.json', markdown: './profile.md', guidance: './llms.txt' });
  assert.match(markdown, /Completed contributions:/);
  assert.match(markdown, /Ongoing work:/);
});
