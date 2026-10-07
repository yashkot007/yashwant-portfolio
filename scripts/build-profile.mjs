import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const profile = JSON.parse(await readFile(path.join(root, 'data/public-profile.json'), 'utf8'));

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing ' + label);
}
function publicUrl(value, label, schemes = ['https:']) {
  requiredString(value, label);
  if (!schemes.includes(new URL(value).protocol)) throw new Error('Unsupported URL in ' + label);
}
for (const key of ['name', 'summary', 'about', 'focus_context', 'meta_description']) requiredString(profile[key], key);
if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.last_reviewed)) throw new Error('Expected last_reviewed as YYYY-MM-DD');
for (const key of ['headline', 'experience', 'selected_work', 'skills', 'skill_groups', 'current_focus', 'focus_questions', 'public_work', 'education', 'sources']) {
  if (!Array.isArray(profile[key])) throw new Error('Expected ' + key + ' array');
}
const sourceIds = new Set(profile.sources.map(item => item.id));
for (const item of [...profile.experience, ...profile.selected_work]) {
  if (!item.source_ids?.length || item.source_ids.some(id => !sourceIds.has(id))) throw new Error('Unknown evidence source');
}
for (const [key, value] of Object.entries(profile.links)) publicUrl(value, 'links.' + key, ['https:', 'mailto:']);
for (const item of [...profile.study_links, ...profile.sources.filter(item => item.url)]) publicUrl(item.url, item.label);
for (const item of profile.experience) {
  if (!/^\d{4}-\d{2}$/.test(item.start) || (item.end && !/^\d{4}-\d{2}$/.test(item.end))) throw new Error('Expected month precision in experience');
}
for (const work of [...profile.selected_work, ...profile.public_work]) {
  for (const key of ['id', 'kind', 'status', 'title', 'description', 'evidence_basis']) requiredString(work[key], key);
}
const ids = [...profile.selected_work, ...profile.public_work].map(work => work.id);
if (new Set(ids).size !== ids.length) throw new Error('Work IDs must be unique');
for (const work of profile.public_work) {
  publicUrl(work.url, 'public_work.' + work.name);
  if (!/^[0-9a-f]{40}$/.test(work.commit)) throw new Error('Expected inspected public commit');
  for (const ref of work.references) {
    publicUrl(ref.url, ref.label);
    if (!new URL(ref.url).pathname.includes('/blob/' + work.commit + '/')) throw new Error('Evidence reference must match inspected revision');
  }
}
const groupedSkills = profile.skill_groups.flatMap(group => group.items);
if (groupedSkills.length !== profile.skills.length || groupedSkills.some((skill, index) => skill !== profile.skills[index])) throw new Error('Grouped skills must preserve the shared skills inventory');

const representations = { human: './', json: './profile.json', markdown: './profile.md', guidance: './llms.txt' };
const published = { ...profile, representations };
const escape = value => String(value).replace(/([\\*_{}\[\]<>])/g, '\\$1').split(String.fromCharCode(96)).join('\\' + String.fromCharCode(96));
const link = (label, url) => '[' + escape(label) + '](' + url + ')';
const range = item => item.start + ' — ' + (item.end ?? 'present');
const contactLabels = { github: 'GitHub', linkedin: 'LinkedIn', x: 'X', email: 'Email' };
const contact = Object.entries(profile.links).map(([key, url]) => '- ' + link(contactLabels[key], url));
const md = [
  '# ' + escape(profile.name), '',
  escape(profile.headline.join(' ')), '', escape(profile.summary), '',
  'Location: ' + escape(profile.location),
  'Last reviewed: ' + profile.last_reviewed, '',
  'Public formats: ' + link('Human portfolio', representations.human) + ' · ' + link('JSON', representations.json) + ' · ' + link('Reading guide', representations.guidance), '',
  '## Current role', '',
  escape(profile.current_role.title) + ' at ' + escape(profile.current_role.organization) + ' · ' + profile.current_role.start + ' — present', '',
  '## Engineering work',
];
for (const work of profile.selected_work) {
  md.push('', '### ' + escape(work.title), '', escape(work.organization) + ' · ' + escape(work.status), '',
    escape(work.description), '', ...work.scope.map(item => '- ' + escape(item.label) + ': ' + escape(item.text)),
    '', 'Evidence basis: ' + escape(work.evidence_basis));
}
md.push('', '## Public code and engineering notes');
for (const work of profile.public_work) {
  md.push('', '### ' + link(work.title, work.url), '',
    escape(work.status) + (work.merged ? ' · Merged ' + work.merged : ''), '',
    escape(work.description), '', '#### ' + escape(work.note_title), '',
    ...work.note.flatMap(paragraph => [escape(paragraph), '']),
    ...work.references.map(ref => '- ' + link(ref.label, ref.url)), '',
    escape(work.method), '',
    'Evidence basis: ' + escape(work.evidence_basis) + ' Inspected ' + work.inspected + '.');
}
md.push('', '## Experience');
for (const item of profile.experience) {
  md.push('', '### ' + escape(item.organization), '', escape(item.title) + ' · ' + range(item), '', escape(item.scope));
  for (const [key, label] of [['completed_contributions', 'Completed contributions'], ['ongoing_work', 'Ongoing work'], ['professional_scope', 'Professional scope'], ['contributions', 'Contributions']]) {
    if (!item[key]?.length) continue;
    md.push('', label + ':', '', ...item[key].map(value => '- ' + escape(value)));
  }
}
md.push('', '## Technical practice');
for (const group of profile.skill_groups) md.push('', '### ' + escape(group.label), '', group.items.map(escape).join(' · '));
md.push('', '## Current focus', '', escape(profile.focus_title), '', escape(profile.focus_context), '',
  ...profile.focus_questions.map(item => '- ' + escape(item.label) + ': ' + escape(item.text)), '',
  'Reading and study: ' + profile.study_links.map(item => link(item.label, item.url)).join(' · '));
md.push('', '## Background', '', escape(profile.about), '', '## Education', '',
  ...profile.education.map(item => '- ' + escape(item.degree) + ' · ' + escape(item.institution) + ' · ' + item.year),
  '', '## Contact', '', escape(profile.contact_context), '', ...contact, '', '## Source basis', '');
for (const item of profile.sources) md.push('- ' + (item.url ? link(item.label, item.url) : escape(item.label)) + ' · ' + escape(item.kind));
md.push('');
const llms = [
  '# ' + profile.name, '', '> ' + profile.summary, '',
  'Public profile last reviewed: ' + profile.last_reviewed + '.', '',
  'The human page, Markdown and JSON are generated from the same public content model. Employer work is a professional summary. Public contribution and prototype notes identify their status, inspected revision, source references and testing provenance. Ongoing development and active study are identified separately from completed contributions.', '',
  '## Profile', '',
  '- [Human portfolio](./): engineering work, public code and notes, experience and current focus.',
  '- [Markdown profile](./profile.md): complete readable profile and technical notes.',
  '- [JSON profile](./profile.json): the same facts, statuses, notes and evidence references.', '',
  '## Public work', '',
  ...profile.public_work.map(work => '- ' + link(work.title, work.url) + ': ' + work.status + '. ' + work.description), '',
  '## Evidence interpretation', '',
  'Employment dates follow the owner-selected resume baseline. Resume and professional-profile statements are professional self-report. Linked code and tests were inspected for the notes; inspection does not mean those tests were rerun. Contributor-reported test runs are attributed. GPU kernel development is professional scope; inference performance and deeper kernel engineering also remain active areas of study. No benchmark speedup or production inference-serving result is asserted.', '',
  '## Contact', '', ...contact, '',
];
await mkdir(path.join(root, 'public'), { recursive: true });
await Promise.all([
  writeFile(path.join(root, 'public/profile.json'), JSON.stringify(published, null, 2) + '\n'),
  writeFile(path.join(root, 'public/profile.md'), md.join('\n')),
  writeFile(path.join(root, 'public/llms.txt'), llms.join('\n')),
]);
console.log('Generated the public JSON, Markdown and reading guide');
