import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const profile = JSON.parse(await readFile(path.join(root, 'data/public-profile.json'), 'utf8'));

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${label}`);
}

function publicUrl(value, label, schemes = ['https:']) {
  requiredString(value, label);
  const parsed = new URL(value);
  if (!schemes.includes(parsed.protocol)) throw new Error(`Unsupported URL in ${label}`);
}

requiredString(profile.name, 'name');
requiredString(profile.summary, 'summary');
if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.last_reviewed)) throw new Error('Expected last_reviewed as YYYY-MM-DD');
for (const key of ['experience', 'skills', 'current_focus', 'public_work', 'education']) {
  if (!Array.isArray(profile[key])) throw new Error(`Expected ${key} array`);
}
for (const [key, value] of Object.entries(profile.links)) publicUrl(value, `links.${key}`, ['https:', 'mailto:']);
for (const work of profile.public_work) publicUrl(work.url, `public_work.${work.name}`);

// Relative representation links work at a root domain and at a repository base path.
const representations = {
  human: './',
  json: './profile.json',
  markdown: './profile.md',
  guidance: './llms.txt',
};
const published = { ...profile, representations };
const escape = (value) => String(value).replace(/([\\`*_{}\[\]<>])/g, '\\$1');
const link = (label, url) => `[${escape(label)}](${url})`;
const range = (item) => `${item.start} — ${item.end ?? 'present'}`;

const md = [
  `# ${escape(profile.name)}`,
  '',
  escape(profile.summary),
  '',
  `Location: ${escape(profile.location)}`,
  `Last reviewed: ${profile.last_reviewed}`,
  '',
  `Public formats: ${link('Human portfolio', representations.human)} · ${link('JSON', representations.json)} · ${link('Reading guide', representations.guidance)}`,
  '',
  '## Current role',
  '',
  `${escape(profile.current_role.title)} at ${escape(profile.current_role.organization)} · ${profile.current_role.start} — present`,
  '',
  '## Experience',
];
for (const item of profile.experience) {
  md.push('', `### ${escape(item.organization)}`, '', `${escape(item.title)} · ${range(item)}`);
  for (const [key, label] of [['completed_contributions', 'Completed contributions'], ['ongoing_work', 'Ongoing work'], ['contributions', 'Contributions']]) {
    if (!item[key]?.length) continue;
    md.push('', `${label}:`, '', ...item[key].map((value) => `- ${escape(value)}`));
  }
}
md.push('', '## Skills', '', profile.skills.map(escape).join(' · '));
md.push('', '## Current focus', '', ...profile.current_focus.map((value) => `- ${escape(value)}`), '', escape(profile.focus_context));
md.push('', '## Public work');
for (const work of profile.public_work) {
  md.push('', `### ${link(work.name, work.url)}`, '', `${escape(work.status)}${work.merged ? ` · Merged ${work.merged}` : ''}`, '', escape(work.description));
}
md.push('', '## Education', '', ...profile.education.map((item) => `- ${escape(item.degree)} · ${escape(item.institution)} · ${item.year}`));
md.push('', '## Contact', '', ...Object.entries(profile.links).map(([key, value]) => `- ${link(key === 'github' ? 'GitHub' : key === 'linkedin' ? 'LinkedIn' : 'Email', value)}`), '');

const llms = [
  `# ${profile.name}`,
  '',
  `> ${profile.summary}`,
  '',
  `Public profile last reviewed: ${profile.last_reviewed}.`,
  '',
  'The Markdown and JSON profiles contain the same approved career information. Completed contributions, ongoing work, skills, career focus and public projects are identified separately in those profiles. An active area of study should not be represented as a measured production outcome.',
  '',
  '## Profile',
  '',
  '- [Human portfolio](./): visual portfolio and project notes.',
  '- [Markdown profile](./profile.md): readable career profile and public links.',
  '- [JSON profile](./profile.json): structured version of the same career profile.',
  '',
  '## Public work',
  '',
  ...profile.public_work.map((work) => `- ${link(work.name, work.url)}: ${work.status}. ${work.description}`),
  '',
  '## Contact',
  '',
  ...Object.entries(profile.links).map(([key, value]) => `- ${link(key === 'github' ? 'GitHub' : key === 'linkedin' ? 'LinkedIn' : 'Email', value)}`),
  '',
];

await mkdir(path.join(root, 'public'), { recursive: true });
await Promise.all([
  writeFile(path.join(root, 'public/profile.json'), `${JSON.stringify(published, null, 2)}\n`),
  writeFile(path.join(root, 'public/profile.md'), md.join('\n')),
  writeFile(path.join(root, 'public/llms.txt'), llms.join('\n')),
]);
console.log('Generated public/profile.json, public/profile.md and public/llms.txt');
