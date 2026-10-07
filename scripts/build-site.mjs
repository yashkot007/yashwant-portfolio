import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import './build-profile.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const styleVersion = createHash('sha256').update(await readFile(path.join(publicDir, 'assets/styles.css'))).digest('hex').slice(0, 12);
const profile = JSON.parse(await readFile(path.join(root, 'data/public-profile.json'), 'utf8'));
const siteOrigin = new URL(profile.site_url).origin;
const h = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const links = items => items.map(item => '<a class="pd-link" href="' + h(item.url) + '">' + h(item.label) + '</a>').join('');
const contactLabels = { github: 'GitHub', linkedin: 'LinkedIn', x: 'X', email: 'Email me' };
// Bootstrap Icons social/contact marks. License: public/assets/bootstrap-icons-LICENSE.txt.
const socialPaths = {
  email: 'M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z',
  github: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8',
  linkedin: 'M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z',
  x: 'M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z',
};
const contactLinks = Object.entries(profile.links).map(([key, url]) => socialPaths[key]
  ? '<a class="field-social-link" href="' + h(url) + '" aria-label="' + h(contactLabels[key]) + '" title="' + h(contactLabels[key]) + '"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + socialPaths[key] + '"></path></svg></a>'
  : links([{ label: contactLabels[key], url }])).join('');
const month = value => new Date(value + '-01T00:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const range = item => month(item.start) + ' — ' + (item.end ? month(item.end) : 'Present');
const reviewed = new Date(profile.last_reviewed + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const plus = '<span class="field-icon" aria-hidden="true">+</span>';
function disclosure(id, label, content, group = 'field-case-notes') {
  return '<details id="' + h(id) + '" name="' + h(group) + '"><summary class="pd-case-link"><span class="pd-closed-label">' + h(label) + '</span><span class="pd-open-label">Close details</span>' + plus + '</summary><div class="pd-expand-content">' + content + '</div></details>';
}
const selectedWork = profile.selected_work.map((work, index) => '<article class="field-row"><span class="field-number" aria-hidden="true">' + String(index + 1).padStart(2, '0') + '</span><div><span class="pd-mono pd-muted">' + h(work.organization) + ' · ' + h(work.status) + '</span><h3>' + h(work.title) + '</h3><p>' + h(work.description) + '</p>' + disclosure(work.id, 'Scope and ownership', '<div class="pd-note-grid">' + work.scope.map(item => '<div><h4 class="pd-mono">' + h(item.label) + '</h4><p>' + h(item.text) + '</p></div>').join('') + '</div>') + '</div></article>').join('\n');
const publicWork = profile.public_work.map(work => '<article class="pd-public-item"><span class="pd-mono pd-muted">' + h(work.name === 'Accord' ? work.name : 'OpenClaw') + ' · ' + h(work.status) + (work.merged ? ' · ' + h(month(work.merged.slice(0, 7))) : '') + '</span><h3>' + h(work.title) + '</h3><p>' + h(work.description) + '</p><div class="pd-actions">' + links([{ label: work.link_label, url: work.url }]) + '<a class="pd-link" href="#' + h(work.id) + '" data-open-note>Read engineering note</a></div>' + disclosure(work.id, 'Engineering note', '<h3>' + h(work.note_title) + '</h3>' + work.note.map(paragraph => '<p>' + h(paragraph) + '</p>').join('') + '<div class="pd-contact-links">' + links(work.references) + '</div><p class="pd-note-source">' + h(work.method) + '</p>', 'field-public-notes') + (work.name === 'Accord' ? '<p class="pd-public-note">Experimental prototype · Public source · Private deployment</p>' : '') + '</article>').join('\n');
const logos = {
  oracle: '<span class="field-logo" data-company="oracle"><img alt="" src="assets/oracle-official.png" width="74" height="24"></span>',
  amazon: '<span class="field-logo" data-company="amazon"><img alt="" src="assets/amazon-inverse-official.svg" width="74" height="24"></span>',
  deloitte: '<span class="field-logo" data-company="deloitte"><img alt="" src="assets/deloitte-white.png" width="74" height="24"></span>',
};
const experience = profile.experience.map(item => '<article class="pd-timeline"><div class="field-employer">' + (logos[item.logo] ?? '<span class="field-logo field-research-label" aria-hidden="true">Research</span>') + '<h3>' + h(item.display_name ?? item.organization) + '</h3></div><div><p class="field-role-title">' + h(item.title) + '</p><p class="field-role-scope">' + h(item.scope) + '</p>' + (item.ongoing_work?.length ? '<p class="field-role-scope"><strong>In development:</strong> ' + h(item.ongoing_work.join(' ')) + '</p>' : '') + '</div><p class="field-dates"><time datetime="' + h(item.start) + '">' + h(month(item.start)) + '</time> — ' + (item.end ? '<time datetime="' + h(item.end) + '">' + h(month(item.end)) + '</time>' : 'Present') + '</p></article>').join('\n');
const skillGroups = profile.skill_groups.map(group => '<div><h3>' + h(group.label) + '</h3><p>' + h(group.items.join(' · ')) + '</p></div>').join('');
const resume = '<p><strong>Experience</strong><br>' + profile.experience.map(item => h(item.display_name ?? item.organization) + ' · ' + h(item.title) + '<br>' + h(range(item))).join('<br><br>') + '</p><p><strong>Education</strong><br>' + profile.education.map(item => h(item.degree) + '<br>' + h(item.institution) + ' · ' + item.year).join('<br><br>') + '</p><p><strong>Skills</strong><br>' + h(profile.skills.join(' · ')) + '</p>';
const person = {
  '@type': 'Person', '@id': siteOrigin + '/#person',
  name: profile.name, url: siteOrigin + '/', description: profile.summary,
  givenName: profile.given_name, familyName: profile.family_name,
  jobTitle: profile.current_role.title,
  worksFor: { '@type': 'Organization', name: profile.current_role.organization },
  homeLocation: { '@type': 'Place', name: profile.location },
  sameAs: [profile.links.github, profile.links.linkedin, profile.links.x],
  knowsAbout: profile.skills,
};
const structuredIdentity = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': siteOrigin + '/#website', url: profile.site_url,
      name: profile.name, alternateName: new URL(profile.site_url).hostname,
      publisher: { '@id': person['@id'] }, inLanguage: 'en' },
    { '@type': 'ProfilePage', '@id': siteOrigin + '/#profile', url: profile.site_url,
      name: profile.name + ' — AI Infrastructure Engineer', description: profile.meta_description,
      mainEntity: { '@id': person['@id'] }, isPartOf: { '@id': siteOrigin + '/#website' },
      inLanguage: 'en' },
    person,
  ],
};
const title = profile.name + ' — AI Infrastructure & Distributed Systems';
const html = [
  '<!doctype html>',
  '<html lang="en" data-theme="light">',
  '<head>',
  '  <meta charset="utf-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  '  <title>' + h(title) + '</title>',
  '  <meta name="description" content="' + h(profile.meta_description) + '">',
  '  <meta name="author" content="' + h(profile.name) + '">',
  '  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">',
  '  <meta name="theme-color" content="#F5F3EA">',
  '  <meta property="og:type" content="website">',
  '  <meta property="og:title" content="' + h(title) + '">',
  '  <meta property="og:description" content="' + h(profile.meta_description) + '">',
  '  <meta property="og:site_name" content="' + h(profile.name) + '">',
  '  <meta property="og:locale" content="en_US">',
  '  <meta name="twitter:card" content="summary">',
  '  <meta name="twitter:title" content="' + h(title) + '">',
  '  <meta name="twitter:description" content="' + h(profile.meta_description) + '">',
  '  <meta name="twitter:site" content="@' + h(new URL(profile.links.x).pathname.slice(1)) + '">',
  '  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">',
  '  <link rel="alternate" type="application/json" href="profile.json" title="Public career profile as JSON">',
  '  <link rel="alternate" type="text/markdown" href="profile.md" title="Public career profile as Markdown">',
  '  <script>(() => { let theme = "light"; try { if (localStorage.getItem("yk-portfolio-theme") === "dark") theme = "dark"; } catch {} document.documentElement.dataset.theme = theme; document.querySelector("meta[name=\\"theme-color\\"]").content = theme === "dark" ? "#181A18" : "#F5F3EA"; })();</script>',
  '  <link rel="stylesheet" href="assets/styles.css?v=' + styleVersion + '">',
  '  <script src="assets/site.js" defer></script>',
  '  <link rel="canonical" href="' + siteOrigin + '/">',
  '  <link rel="me" href="' + h(profile.links.linkedin) + '">',
  '  <link rel="me" href="' + h(profile.links.github) + '">',
  '  <link rel="me" href="' + h(profile.links.x) + '">',
  '  <meta property="og:url" content="' + siteOrigin + '/">',
  '  <script type="application/ld+json">' + JSON.stringify(structuredIdentity).replace(/</g, '\\u003c') + '</script>',
  '</head>',
  '<body>',
  '<a class="skip-link" href="#field-home">Skip to content</a>',
  '<div id="portfolio" aria-label="' + h(profile.name) + ' Field Notes portfolio"><section class="pd-stage"><div class="pd-page field"><div class="pd-shell">',
  '<header class="pd-wrap pd-nav"><a class="pd-name" href="#field-home"><span class="pd-monogram">YK</span><span>' + h(profile.name) + '</span></a><nav class="pd-links" aria-label="Main navigation"><a href="#field-work">Work</a><a class="pd-nav-optional" href="#field-experience">Experience</a><a class="pd-nav-optional" href="#field-focus">Focus</a><a data-open-resume href="#field-resume">Résumé</a></nav><button class="field-theme" type="button" aria-label="Dark mode" data-toggle-theme><span class="field-icon" aria-hidden="true" data-theme-icon>☾</span><span data-theme-label>Dark mode</span></button></header>',
  '<main class="pd-wrap field-layout" id="field-home">',
  '<aside class="field-index" aria-label="Page index"><p class="field-mark" aria-hidden="true">y.</p><p>ENGINEERING<br>FIELD NOTES</p><a href="#field-work">Engineering work</a><a href="#field-public">Public code &amp; notes</a><a href="#field-experience">Experience</a><a href="#field-focus">Current focus</a><p class="field-index-context">AI infrastructure<br>GPU systems<br>Distributed services</p></aside>',
  '<div>',
  '<section class="field-hero" aria-labelledby="field-heading"><p class="pd-label pd-mono">' + h(profile.current_role.title) + ' · Oracle OCI</p><h1 id="field-heading">' + profile.headline.map(h).join('<br>') + '</h1><div class="field-intro"><p>' + h(profile.summary) + '</p><div class="field-margin-note"><strong>The work beneath AI.</strong>' + profile.positioning.map(h).join('<br>') + '</div></div><div class="pd-actions"><a class="pd-link" href="#field-work">Read engineering work</a><a class="pd-link" data-open-resume href="#field-resume">View résumé summary</a><a class="pd-link" href="' + h(profile.links.email) + '">Get in touch</a></div></section>',
  '<section class="field-work" id="field-work" aria-labelledby="field-work-heading"><div class="pd-section-title"><h2 id="field-work-heading">Engineering work</h2><span class="pd-mono">Scope &amp; ownership</span></div>' + selectedWork + '</section>',
  '<section id="field-public" aria-labelledby="field-public-heading"><div class="pd-section-title"><h2 id="field-public-heading">Public code &amp; engineering notes</h2><span class="pd-mono">Source &amp; reasoning</span></div><div class="pd-public-grid">' + publicWork + '</div></section>',
  '<section id="field-experience" aria-labelledby="field-experience-heading"><div class="pd-section-title"><h2 id="field-experience-heading">Experience</h2><span class="pd-mono">Professional history</span></div>' + experience + '</section>',
  '<section class="field-skills" id="field-skills" aria-labelledby="field-skills-heading"><div class="pd-section-title"><h2 id="field-skills-heading">Technical practice</h2><span class="pd-mono">Systems &amp; tools</span></div><div class="field-skill-groups">' + skillGroups + '</div></section>',
  '<section class="field-focus" id="field-focus" aria-labelledby="field-focus-heading"><div><span class="pd-mono pd-muted">Current focus</span><h2 id="field-focus-heading">' + h(profile.focus_title) + '</h2></div><div><p>' + h(profile.focus_context) + '</p><dl class="field-focus-questions">' + profile.focus_questions.map(item => '<dt>' + h(item.label) + '</dt><dd>' + h(item.text) + '</dd>').join('') + '</dl><div class="pd-study-links"><span>Reading &amp; study</span>' + profile.study_links.map(item => '<a href="' + h(item.url) + '">' + h(item.label) + '</a>').join('') + '</div></div></section>',
  '<section class="pd-profile field-about" aria-labelledby="field-about-heading"><div><h2 id="field-about-heading">Background</h2><p>' + h(profile.about) + '</p><div class="field-education"><h3>Education</h3>' + profile.education.map(item => '<p>' + h(item.degree) + '<br>' + h(item.institution) + ' · ' + item.year + '</p>').join('') + '</div></div><details class="pd-resume-summary" id="field-resume"><summary>View résumé summary ' + plus + '</summary><div class="pd-resume-content">' + resume + '</div></details></section>',
  '</div></main>',
  '<footer class="pd-footer" id="field-contact"><div class="pd-wrap pd-footer-inner"><div><h2>' + h(profile.contact_heading) + '</h2><p class="field-contact-context">' + h(profile.contact_context) + '</p><p class="pd-mono pd-muted">' + h(profile.name) + ' · ' + h(profile.location) + '</p></div><div class="pd-contact-links field-social-links">' + contactLinks + '</div></div><div class="pd-wrap"><details class="field-tools" id="field-tools"><summary>For tools &amp; agents ' + plus + '</summary><div class="field-agent-content"><p>The same experience, work, technical notes, skills and current focus in readable and structured formats. Public code references include the inspected revision.</p><div class="pd-contact-links"><a class="pd-link" href="profile.md" type="text/markdown">Profile as text</a><a class="pd-link" href="profile.json" type="application/json">Structured profile · JSON</a><a class="pd-link" href="llms.txt" type="text/plain">Reading guide</a></div><p class="field-agent-updated">Profile reviewed ' + h(reviewed) + '.</p></div></details></div></footer>',
  '</div></div></section></div>',
  '</body>',
  '</html>',
  '',
].join('\n');
await writeFile(path.join(publicDir, 'index.html'), html);
await writeFile(path.join(publicDir, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + siteOrigin + '/sitemap.xml\n');
await writeFile(path.join(publicDir, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + siteOrigin + '/</loc></url></urlset>\n');
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'server'), { recursive: true });
await cp(publicDir, path.join(dist, 'client'), { recursive: true });
await cp(path.join(root, 'worker.js'), path.join(dist, 'server/index.js'));
await mkdir(path.join(dist, '.openai'), { recursive: true });
await cp(path.join(root, '.openai/hosting.json'), path.join(dist, '.openai/hosting.json'));
console.log('Built the portfolio and agent formats from one public content model');
