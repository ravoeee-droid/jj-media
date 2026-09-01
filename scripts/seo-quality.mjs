import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root,'seo','content-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const errors = [];
const warnings = [];

const strip = html => html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
const get = (html, rx) => (html.match(rx) || [,''])[1]?.trim() || '';
const count = (html, rx) => (html.match(rx) || []).length;
const exists = rel => fs.existsSync(path.join(root,rel));

for (const article of manifest.articles.filter(a => a.status === 'published')) {
  const file = path.join(root, article.path);
  if (!fs.existsSync(file)) { errors.push(`${article.path}: manifest says published but file is missing`); continue; }
  const html = fs.readFileSync(file,'utf8');
  const text = strip(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  const title = get(html, /<title>([\s\S]*?)<\/title>/i);
  const description = get(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || get(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const canonical = get(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || get(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  const h1Count = count(html, /<h1\b/gi);
  const schemaOk = /"@type"\s*:\s*"(?:Article|NewsArticle)"/i.test(html);
  const internalLinks = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]).filter(h => !/^(?:https?:|mailto:|tel:|#)/i.test(h));
  const badPlaceholders = /\b(?:lorem ipsum|todo|tbd|platzhalter)\b/i.test(text);
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  const imgsWithoutAlt = imgTags.filter(tag => !/\balt=["'][^"']*["']/i.test(tag));

  if (!title) errors.push(`${article.path}: missing <title>`);
  if (title.length > 68) warnings.push(`${article.path}: title is ${title.length} chars; review SERP truncation`);
  if (!description) errors.push(`${article.path}: missing meta description`);
  if (description && (description.length < 110 || description.length > 175)) warnings.push(`${article.path}: meta description is ${description.length} chars`);
  if (!canonical.startsWith('https://www.jj-media-design.de/')) errors.push(`${article.path}: canonical missing or unexpected (${canonical || 'none'})`);
  if (h1Count !== 1) errors.push(`${article.path}: expected exactly 1 H1, found ${h1Count}`);
  if (!schemaOk) errors.push(`${article.path}: Article/NewsArticle JSON-LD missing`);
  if (internalLinks.length < 3) errors.push(`${article.path}: fewer than 3 internal links`);
  if (imgsWithoutAlt.length) errors.push(`${article.path}: ${imgsWithoutAlt.length} image(s) without alt attribute`);
  if (badPlaceholders) errors.push(`${article.path}: placeholder language found`);
  if (article.type === 'evergreen' && words < 900) errors.push(`${article.path}: evergreen article too thin (${words} words)`);
  if (article.type === 'trend') {
    if (words < 550) errors.push(`${article.path}: trend article too thin (${words} words)`);
    if (!article.primary_source) errors.push(`${article.path}: trend article missing primary_source in manifest`);
    if (!/class=["'][^"']*source-link/i.test(html)) errors.push(`${article.path}: trend article must expose a visible primary source link`);
  }
  if (!article.review_by) errors.push(`${article.path}: missing review_by in manifest`);
}

for (const cluster of manifest.topic_clusters) {
  if (cluster.pillar && !exists(cluster.pillar)) errors.push(`cluster ${cluster.id}: pillar path missing: ${cluster.pillar}`);
}

const sitemapPath = path.join(root,'sitemap.xml');
if (!fs.existsSync(sitemapPath)) errors.push('sitemap.xml missing');
else {
  const sitemap = fs.readFileSync(sitemapPath,'utf8');
  for (const article of manifest.articles.filter(a => a.status === 'published')) {
    const canonicalPath = article.path.replace(/\.html$/,'');
    const url = `${manifest.site}/${canonicalPath}`;
    if (!sitemap.includes(url)) errors.push(`sitemap missing ${url}`);
  }
}

const robotsPath = path.join(root,'robots.txt');
if (!fs.existsSync(robotsPath)) errors.push('robots.txt missing');
else if (!fs.readFileSync(robotsPath,'utf8').includes('Sitemap: https://www.jj-media-design.de/sitemap.xml')) errors.push('robots.txt missing sitemap declaration');

if (warnings.length) {
  console.warn('\nSEO warnings:');
  warnings.forEach(w => console.warn(`- ${w}`));
}
if (errors.length) {
  console.error('\nSEO quality gate failed:');
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log(`SEO quality gate passed for ${manifest.articles.filter(a => a.status === 'published').length} published article(s).`);
