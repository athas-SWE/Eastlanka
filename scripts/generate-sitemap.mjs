import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://eastlanka.com.lk';

function codes(file, key) {
  const text = readFileSync(join(root, file), 'utf8');
  return [...text.matchAll(new RegExp(`${key}: '([^']+)'`, 'g'))].map((match) => match[1]);
}

const paths = [
  '/',
  '/products',
  '/categories',
  '/new-arrivals',
  '/offers',
  '/about',
  '/contact',
  ...codes('src/app/core/data/categories.ts', 'slug').map((slug) => `/categories/${slug}`),
  ...codes('src/app/core/data/products.ts', 'code').map((code) => `/products/${code}`),
];

const urls = paths
  .map((path) => `  <url><loc>${origin}${path === '/' ? '' : path}</loc></url>`)
  .join('\n');

writeFileSync(
  join(root, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

console.log(`Wrote ${paths.length} sitemap URLs.`);
