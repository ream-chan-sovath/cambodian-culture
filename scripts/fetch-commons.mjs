#!/usr/bin/env node
// Download an image from Wikimedia Commons into a page folder and record its credit.
//
//   npm run image -- "File:Apsara dancers Siem Reap 20091118 03.jpg" apsara-royal-ballet hero
//
// Arguments: <Commons file title or URL> <page folder> [local name without extension] [--width 2400]
//
// Only licences that allow reuse with attribution are accepted (public domain, CC0, CC BY, CC BY-SA).
// Anything marked NC (non-commercial), ND (no derivatives) or unknown is refused.

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';

const USER_AGENT = 'CambodianCultureArchive/1.0 (https://github.com; image credits script)';
const ALLOWED = [/^public domain/i, /^pd\b/i, /^cc0/i, /^no restrictions/i, /^cc by(-sa)? \d(\.\d)?/i];
const REFUSED = /\b(nc|nd)\b/i;

const args = process.argv.slice(2);
const widthFlag = args.indexOf('--width');
const width = widthFlag >= 0 ? Number(args.splice(widthFlag, 2)[1]) : 2400;
const [input, page, localName] = args;

if (!input || !page) {
  console.error('Usage: npm run image -- "File:Name.jpg" <page-folder> [local-name] [--width 2400]');
  process.exit(1);
}

const title = decodeURIComponent(input.replace(/^https?:\/\/commons\.wikimedia\.org\/wiki\//, '')).replace(/_/g, ' ');
if (!title.startsWith('File:')) {
  console.error(`Expected a Commons file title starting with "File:", got "${title}".`);
  process.exit(1);
}

const api = new URL('https://commons.wikimedia.org/w/api.php');
api.search = new URLSearchParams({
  action: 'query',
  format: 'json',
  prop: 'imageinfo',
  iiprop: 'url|size|mime|extmetadata',
  iiurlwidth: String(width),
  titles: title,
}).toString();

const res = await fetch(api, { headers: { 'User-Agent': USER_AGENT } });
const data = await res.json();
const pageInfo = Object.values(data.query.pages)[0];
const info = pageInfo.imageinfo?.[0];
if (!info) {
  console.error(`Commons has no file called "${title}".`);
  process.exit(1);
}

const meta = info.extmetadata ?? {};
const text = (key) => (meta[key]?.value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const license = text('LicenseShortName');

if (!ALLOWED.some((re) => re.test(license)) || REFUSED.test(license)) {
  console.error(`Refused: "${title}" is licensed "${license || 'unknown'}". Only public domain, CC0, CC BY and CC BY-SA are allowed.`);
  process.exit(2);
}

const ext = info.mime === 'image/png' ? 'png' : info.mime === 'image/webp' ? 'webp' : 'jpg';
const name = `${(localName ?? title.replace(/^File:/, '').replace(/\.[^.]+$/, ''))
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^\w]+/g, '-')
  .replace(/^-|-$/g, '')}.${ext}`;

const folder = path.join('src/content/pages', page);
await fs.mkdir(path.join(folder, 'images'), { recursive: true });

const downloadUrl = info.thumburl && info.width > width ? info.thumburl : info.url;
const image = await fetch(downloadUrl, { headers: { 'User-Agent': USER_AGENT } });
if (!image.ok) {
  console.error(`Download failed (${image.status}) for ${downloadUrl}`);
  process.exit(1);
}
// Keep the repo light: cap the long edge (Astro makes the smaller sizes at build time).
const original = Buffer.from(await image.arrayBuffer());
const resized = await sharp(original)
  .rotate()
  .resize({ width: width, height: width, fit: 'inside', withoutEnlargement: true })
  .toFormat(ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpeg', { quality: 84 })
  .toBuffer();
await fs.writeFile(path.join(folder, 'images', name), resized);

const creditsPath = path.join(folder, 'credits.yaml');
let credits = {};
try {
  credits = YAML.parse(await fs.readFile(creditsPath, 'utf8')) ?? {};
} catch {}

credits[name] = {
  title: title.replace(/^File:/, ''),
  author: text('Artist') || text('Credit') || 'Unknown',
  date: text('DateTimeOriginal').replace(/date QS:.*$/, '').trim() || undefined,
  license,
  licenseUrl: meta.LicenseUrl?.value || undefined,
  source: pageInfo.canonicalurl ?? info.descriptionurl,
};

await fs.writeFile(creditsPath, YAML.stringify(credits, { lineWidth: 0 }));
console.log(`Saved ${path.join(folder, 'images', name)} (${license}, by ${credits[name].author})`);
