# Yashwant Kotipalli — Field Notes

[Yashwant Kotipalli’s portfolio](https://yashwantkotipalli.com/) for AI infrastructure, GPU systems and distributed systems engineering.

The site opens in light mode. Visitors can switch to dark mode; their explicit preference is remembered on their device. Native work notes and the résumé summary remain readable without JavaScript.

## Public profile formats

- `/` — the human portfolio.
- `/profile.json` — structured public career facts.
- `/profile.md` — the same profile as Markdown.
- `/llms.txt` — a discovery guide for tools that support it.
- `/profile` — request HTML, JSON or Markdown using the HTTP `Accept` header.

Agent access is public and read-only. Format selection uses an explicit request, without a mandatory visitor question or a claim that every agent can be identified. Ordinary page and asset requests keep their normal behavior.

## Develop

Node.js 20 or newer is sufficient; the project has no runtime package dependencies.

```sh
npm run build
npm test
python3 -m http.server 8766 --directory public
```

The static preview serves the public page and named profile files. The negotiated `/profile` route runs in the included Cloudflare-compatible Worker. Local Wrangler development uses the `ASSETS` binding configured in `wrangler.json`; the deployed bundle supplies the same interface from embedded public files.

Approved public content lives in `data/public-profile.json`. The build generates the human page, JSON, Markdown and discovery guide from that same model, including work status, professional scope, technical notes and immutable public-code references. `scripts/build-site.mjs` embeds all public file bytes in `dist/server/index.js` and copies `.openai/hosting.json`; it emits no `dist/client` assets. This Worker-only layout makes public requests reach the routing code, including host redirects and HTTP profile metadata. Native Sites packaging does not carry the source Wrangler configuration, so a local `run_worker_first` setting alone cannot establish production routing.

The embedded asset adapter preserves exact file bytes, MIME types, GET/HEAD behavior and conditional requests with deterministic SHA-256 ETags. Public files require cache revalidation, missing files return 404, and error responses are not cached. The build rejects symlinks and special files; runtime asset access uses an exact path manifest. `npm test` rebuilds first and checks both the source Worker and the actual packaged entrypoint.

## Asset sources

Company wordmarks are unchanged assets from official media resources:

- [Oracle](https://www.oracle.com/news/resources/)
- [Amazon](https://press.aboutamazon.com/logos)
- [Deloitte](https://www.deloitte.com/no/no/legal/bilder-logo-media.html)

Typography: DM Sans, IBM Plex Mono and Libre Baskerville via Google Fonts. The personal favicon is original.

## Search identity

The canonical website is `https://yashwantkotipalli.com/`. The public `www` and Sites origin aliases redirect to it, preserving paths and query strings. HTML, sitemap and HTTP canonical hints agree on that URL. Local previews and unknown hosts are not redirected.

The homepage includes linked `WebSite`, `ProfilePage` and `Person` structured data. Professional identity and external profile references are generated from the public content model. Machine-readable profile aliases advertise absolute, resolvable alternatives and preserve upstream caching and preload metadata.

The wildcard crawl rule allows search crawlers, including Googlebot and OAI-SearchBot. All visitors receive the same facts; only explicit content negotiation chooses a representation. `llms.txt` is an optional reading guide, not an indexing or ranking guarantee. GPTBot training permission is independent of ChatGPT Search permission; this SEO update does not change the existing training policy.

On October 7, 2026, the Google Search Console domain property `yashwantkotipalli.com` was verified through a public DNS TXT record. The sitemap `https://yashwantkotipalli.com/sitemap.xml` reports Success with one discovered page. The live homepage test reported that the URL is available to Google, the page can be indexed, and one Profile page item is valid. An indexing request was accepted; the homepage was not yet indexed at that check. Verification, sitemap submission and indexing requests do not guarantee indexing or ranking. Track full-name and name-plus-role queries, then use original public engineering work and consistent LinkedIn/GitHub profile links to build a stronger identity over time.

Primary references: [Google profile pages](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [site names](https://developers.google.com/search/docs/appearance/site-names), [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [OpenAI crawlers](https://developers.openai.com/api/docs/bots).


## Search-engine change notifications

The root public directory includes an IndexNow ownership file with a random 32-character hexadecimal filename. Its UTF-8 contents match the filename without the `.txt` extension. This is a public site-ownership proof, not a private account API key. The build includes it as an ordinary plain-text asset.

After publishing substantive changes, the canonical changed URL can be submitted once to `https://api.indexnow.org/indexnow` using the corresponding key. IndexNow shares notifications with participating search engines; it does not guarantee crawling, indexing, ranking, or appearance in an AI answer. Do not submit unchanged pages repeatedly, canonical aliases as separate pages, or private URLs. Continue to maintain the sitemap. See the [IndexNow protocol](https://www.indexnow.org/documentation).

Claude-SearchBot and Claude-User are permitted by the existing wildcard crawl rule. A live Claude retrieval test on October 7, 2026 successfully read and cited the homepage; a separate name-only search found LinkedIn but did not retrieve the portfolio. These are different capabilities, and permitting a crawler does not establish search visibility. Anthropic documents search partners without naming its text-search provider in its [publisher guidance](https://support.claude.com/en/articles/10684638-report-block-and-remove-content-from-claude).
