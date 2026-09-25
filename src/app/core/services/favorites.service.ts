import { Injectable, computed, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

const KEY = 'eastlanka-favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly catalogue = inject(ProductService);
  private readonly codes = signal<string[]>(read());

  readonly products = computed(() =>
    this.codes()
      .map((code) => this.catalogue.byCode(code))
      .filter((product): product is Product => product !== undefined),
  );
  readonly count = computed(() => this.products().length);

  has(code: string): boolean {
    return this.codes().some((item) => item.toLowerCase() === code.toLowerCase());
  }

  toggle(product: Product): void {
    this.codes.update((codes) => {
      const next = this.has(product.code) ? codes.filter((code) => code.toLowerCase() !== product.code.toLowerCase()) : [product.code, ...codes];
      write(next);
      return next;
    });
  }
}

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(data) ? data.filter((code): code is string => typeof code === 'string') : [];
  } catch {
    return [];
  }
}

function write(codes: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(codes));
  } catch {
    // Private browsing can block storage.
  }
}
