const CANONICAL_ORIGIN = 'https://yashwantkotipalli.com';
const PRODUCTION_HOSTS = new Set([
  'yashwantkotipalli.com', 'www.yashwantkotipalli.com',
  'yashwant-kotipalli.yashwant7kotipalli.chatgpt.site',
]);
const FORMATS = [
  { type: 'text/html', asset: '/' },
  { type: 'application/json', asset: '/profile.json' },
  { type: 'text/markdown', asset: '/profile.md' },
];

function parseAccept(value) {
  if (!value?.trim()) return [{ type: '*', subtype: '*', q: 1 }];
  return value.split(',').map((part) => {
    const [media, ...parameters] = part.trim().toLowerCase().split(';');
    const [type, subtype, extra] = media.trim().split('/');
    if (!type || !subtype || extra || (type === '*' && subtype !== '*')) return null;
    let q = 1;
    for (const parameter of parameters) {
      const [key, raw] = parameter.trim().split('=');
      if (key !== 'q') continue;
      // Invalid quality values are unacceptable rather than silently becoming 1.
      q = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(raw ?? '') ? Number(raw) : 0;
    }
    return { type, subtype, q };
  }).filter(Boolean);
}

export function negotiate(accept) {
  const ranges = parseAccept(accept);
  let selected = null;
  for (const format of FORMATS) {
    const [type, subtype] = format.type.split('/');
    let matching = null;
    for (const range of ranges) {
      if (range.type !== '*' && range.type !== type) continue;
      if (range.subtype !== '*' && range.subtype !== subtype) continue;
      const specificity = range.type === '*' ? 0 : range.subtype === '*' ? 1 : 2;
      // A specific refusal overrides an allowed wildcard; equally specific
      // duplicate ranges use their highest quality deterministically.
      if (!matching || specificity > matching.specificity || (specificity === matching.specificity && range.q > matching.q)) {
        matching = { q: range.q, specificity };
      }
    }
    if (!matching || matching.q === 0) continue;
    // FORMATS order provides a stable human-first tie break.
    if (!selected || matching.q > selected.q || (matching.q === selected.q && matching.specificity > selected.specificity)) {
      selected = { ...format, ...matching };
    }
  }
  return selected;
}

function profileRoute(pathname) {
  // Match a complete final segment so aliases work under a repository base path.
  const match = pathname.match(/^(.*\/)(profile(?:\.json|\.md)?)$/);
  return match ? { base: match[1], endpoint: match[2] } : null;
}

function addVary(headers, value) {
  const existing = headers.get('Vary')?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];
  if (!existing.some((item) => item.toLowerCase() === value.toLowerCase()) && !existing.includes('*')) existing.push(value);
  headers.set('Vary', existing.join(', '));
}

function profileLinks(existing = '', includeAlternates = true) {
  // Keep preload and other upstream links, while replacing stale canonical hints.
  const preserved = existing.split(/,\s*(?=<)/).filter(Boolean).filter(link => {
    const rel = link.match(/;\s*rel\s*=\s*(?:"([^"]*)"|([^;\s,]+))/i);
    return !(rel?.[1] ?? rel?.[2] ?? '').toLowerCase().split(/\s+/).includes('canonical');
  });
  const own = [`<${CANONICAL_ORIGIN}/>; rel="canonical"`];
  if (includeAlternates) {
    for (const format of FORMATS) own.push(`<${CANONICAL_ORIGIN}${format.asset}>; rel="alternate"; type="${format.type}"`);
  }
  return [...new Set([...preserved, ...own])].join(', ');
}

async function fetchProfile(request, env, route) {
  const negotiating = route.endpoint === 'profile';
  const headers = new Headers();
  if (negotiating) addVary(headers, 'Accept');
  if (!['GET', 'HEAD'].includes(request.method)) {
    headers.set('Allow', 'GET, HEAD');
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    return new Response('Method not allowed\n', { status: 405, headers });
  }
  const format = negotiating
    ? negotiate(request.headers.get('Accept'))
    : FORMATS.find((item) => item.asset.endsWith(route.endpoint));
  if (!format) {
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    return new Response(request.method === 'HEAD' ? null : 'Available profile formats: text/html, application/json, text/markdown\n', { status: 406, headers });
  }
  const assetUrl = new URL(request.url);
  assetUrl.pathname = format.asset;
  const assetRequest = new Request(assetUrl, request);
  // Format selection happened here. Do not let the static asset layer renegotiate.
  assetRequest.headers.delete('Accept');
  const response = await env.ASSETS.fetch(assetRequest);
  const outputHeaders = new Headers(response.headers);
  if (response.ok || response.status === 304) outputHeaders.set('Link', profileLinks(outputHeaders.get('Link') ?? ''));
  if (negotiating) addVary(outputHeaders, 'Accept');
  if (response.ok || response.status === 304) outputHeaders.set('Content-Type', `${format.type}; charset=utf-8`);
  return new Response(request.method === 'HEAD' ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outputHeaders,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Consolidate the public host aliases; local previews and other hosts stay usable.
    if (['GET', 'HEAD'].includes(request.method) && PRODUCTION_HOSTS.has(url.hostname)) {
      const target = new URL(url);
      target.protocol = 'https:';
      target.host = new URL(CANONICAL_ORIGIN).host;
      if (target.pathname === '/index.html') target.pathname = '/';
      if (target.href !== url.href) return Response.redirect(target.href, 308);
    }
    if (!env?.ASSETS?.fetch) {
      return new Response('Static asset binding unavailable\n', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    const route = profileRoute(url.pathname);
    if (route) return fetchProfile(request, env, route);
    // User agents are hints, never authentication or a reason to change content.
    // All ordinary requests retain the static site's routing and content.
    const response = await env.ASSETS.fetch(request);
    if (['/', '/index.html'].includes(url.pathname) && (response.ok || response.status === 304)) {
      const headers = new Headers(response.headers);
      headers.set('Link', profileLinks(headers.get('Link') ?? ''));
      return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, statusText: response.statusText, headers });
    }
    return response;
  },
};
