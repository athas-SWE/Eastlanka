import { Injectable } from '@angular/core';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { Category, CategorySlug, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly products = PRODUCTS;
  readonly categories = CATEGORIES;

  all(): Product[] {
    return this.products;
  }

  byCode(code: string): Product | undefined {
    return this.products.find((product) => product.code.toLowerCase() === code.toLowerCase());
  }

  byCategory(slug: CategorySlug | string): Product[] {
    return this.products.filter((product) => product.category === slug);
  }

  newArrivals(): Product[] {
    return this.products.filter((product) => product.newArrival);
  }

  offers(): Product[] {
    return this.products.filter(
      (product) => product.originalPrice !== undefined && product.originalPrice > product.price,
    );
  }

  categoryBySlug(slug: string): Category | undefined {
    return this.categories.find((category) => category.slug === slug);
  }

  search(query: string, category?: string): Product[] {
    const q = query.trim().toLowerCase();
    return this.products.filter((product) => {
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.code.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      const matchesCategory = !category || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }
}
