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
  '/catalogue.html',
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

function field(chunk, key) {
  const match = chunk.match(new RegExp(`${key}:\\s*(?:'([^']*)'|(\\d+))`));
  return match ? match[1] ?? match[2] ?? '' : '';
}

function products() {
  const text = readFileSync(join(root, 'src/app/core/data/products.ts'), 'utf8');
  return text
    .split(/\n  \{/)
    .slice(1)
    .map((chunk) => ({
      code: field(chunk, 'code'),
      name: field(chunk, 'name'),
      price: field(chunk, 'price'),
      description: field(chunk, 'description'),
      category: field(chunk, 'category'),
    }))
    .filter((product) => product.code && product.name);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const items = products()
  .map(
    (product) => `    <article>
      <h2><a href="${origin}/products/${escapeHtml(product.code)}">${escapeHtml(product.name)}</a></h2>
      <p>${escapeHtml(product.code)} · ${escapeHtml(product.category)} · Rs. ${Number(product.price).toLocaleString('en-LK')}</p>
      <p>${escapeHtml(product.description)}</p>
    </article>`,
  )
  .join('\n');

writeFileSync(
  join(root, 'public', 'catalogue.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>East Lanka product list</title>
    <meta name="description" content="Every product in the East Lanka catalogue, with the price in rupees." />
    <link rel="canonical" href="${origin}/catalogue.html" />
  </head>
  <body>
    <h1>East Lanka products</h1>
    <p>Browse a product, then order on WhatsApp from the shop.</p>
${items}
  </body>
</html>
`,
);

console.log(`Wrote ${paths.length} sitemap URLs and ${products().length} catalogue entries.`);
