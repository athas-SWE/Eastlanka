import { Injectable, inject, signal } from '@angular/core';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { CatalogueSnapshot, Category, CategorySlug, Product } from '../models/product.model';
import { CloudinaryService } from './cloudinary.service';

const LOCAL_KEY = 'eastlanka-catalogue';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly cloudinary = inject(CloudinaryService);

  readonly products = signal<Product[]>(clone(PRODUCTS));
  readonly categories = signal<Category[]>(clone(CATEGORIES));
  readonly loaded = signal(false);
  readonly remoteSynced = signal(false);
  readonly lastSavedAt = signal<string | null>(null);

  constructor() {
    void this.hydrate();
  }

  all(): Product[] {
    return this.products();
  }

  byCode(code: string): Product | undefined {
    return this.products().find((product) => product.code.toLowerCase() === code.toLowerCase());
  }

  byCategory(slug: CategorySlug | string): Product[] {
    return this.products().filter((product) => product.category === slug);
  }

  newArrivals(): Product[] {
    return this.products().filter((product) => product.newArrival);
  }

  offers(): Product[] {
    return this.products().filter(
      (product) => product.originalPrice !== undefined && product.originalPrice > product.price,
    );
  }

  categoryBySlug(slug: string): Category | undefined {
    return this.categories().find((category) => category.slug === slug);
  }

  search(query: string, category?: string): Product[] {
    const q = query.trim().toLowerCase();
    return this.products().filter((product) => {
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.code.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      const matchesCategory = !category || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }

  async saveProduct(product: Product, isNew: boolean): Promise<boolean> {
    if (isNew) {
      this.products.update((list) => [product, ...list]);
    } else {
      this.products.update((list) => list.map((item) => (item.code === product.code ? product : item)));
    }
    return this.persist();
  }

  async removeProduct(code: string): Promise<boolean> {
    this.products.update((list) => list.filter((product) => product.code !== code));
    return this.persist();
  }

  async saveCategory(category: Category, isNew: boolean): Promise<boolean> {
    if (isNew) {
      if (this.categoryBySlug(category.slug)) {
        throw new Error('A category with this name already exists.');
      }
      this.categories.update((list) => [...list, category]);
    } else {
      this.categories.update((list) => list.map((item) => (item.slug === category.slug ? category : item)));
    }
    return this.persist();
  }

  async removeCategory(slug: string): Promise<boolean> {
    if (this.byCategory(slug).length) {
      throw new Error('Move or delete products in this category first.');
    }
    this.categories.update((list) => list.filter((category) => category.slug !== slug));
    return this.persist();
  }

  private async hydrate(): Promise<void> {
    const local = this.readLocal();
    if (local) {
      this.apply(local, false);
    }

    try {
      const remote = await this.cloudinary.fetchCatalogue();
      if (remote) {
        this.apply(remote, true);
        this.writeLocal(remote);
      }
    } catch {
      // Bundled or local catalogue stays visible.
    }

    this.loaded.set(true);
  }

  private persist(): boolean {
    const snapshot: CatalogueSnapshot = {
      updatedAt: new Date().toISOString(),
      products: this.products(),
      categories: this.categories(),
    };
    this.lastSavedAt.set(snapshot.updatedAt);
    this.writeLocal(snapshot);
    void this.cloudinary.uploadCatalogue(snapshot).then((uploaded) => {
      this.remoteSynced.set(uploaded);
    });
    return true;
  }

  private apply(snapshot: CatalogueSnapshot, remote: boolean): void {
    this.products.set(clone(snapshot.products));
    this.categories.set(clone(snapshot.categories));
    this.lastSavedAt.set(snapshot.updatedAt || null);
    this.remoteSynced.set(remote);
  }

  private readLocal(): CatalogueSnapshot | null {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) {
        return null;
      }
      const data = JSON.parse(raw) as CatalogueSnapshot;
      if (!Array.isArray(data.products) || !Array.isArray(data.categories)) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  private writeLocal(snapshot: CatalogueSnapshot): void {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(snapshot));
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
