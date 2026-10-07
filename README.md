# Yashwant Kotipalli — Field Notes

Personal portfolio for AI infrastructure, GPU systems and distributed systems engineering.

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

The static preview serves the public page and named profile files. The negotiated `/profile` route runs in the included Cloudflare-compatible Worker, using the `ASSETS` binding configured in `wrangler.json`.

Approved public facts live in `data/public-profile.json`; `scripts/build-profile.mjs` generates JSON, Markdown and the discovery guide. Keep the human page consistent when changing career content. `scripts/build-site.mjs` produces `dist/client` assets and `dist/server/index.js` for hosting.

## Asset sources

Company wordmarks are unchanged assets from official media resources:

- [Oracle](https://www.oracle.com/news/resources/)
- [Amazon](https://press.aboutamazon.com/logos)
- [Deloitte](https://www.deloitte.com/no/no/legal/bilder-logo-media.html)

Typography: DM Sans, IBM Plex Mono and Libre Baskerville via Google Fonts. The personal favicon is original.
