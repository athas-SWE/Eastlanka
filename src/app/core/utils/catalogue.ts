import { Category, Product } from '../models/product.model';

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'category';
}

export function nextProductCode(products: Product[]): string {
  const highest = products.reduce((max, product) => {
    const match = /^EL-(\d+)$/i.exec(product.code);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `EL-${String(highest + 1).padStart(3, '0')}`;
}

export function nextProductId(products: Product[]): number {
  return products.reduce((max, product) => Math.max(max, product.id), 0) + 1;
}

export function uniqueSlug(name: string, categories: Category[], current?: string): string {
  const base = slugify(name);
  if (base === current || !categories.some((category) => category.slug === base)) {
    return base;
  }

  let index = 2;
  while (categories.some((category) => category.slug === `${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
}
