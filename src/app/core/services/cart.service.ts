import { Injectable, computed, inject, signal } from '@angular/core';
import { SITE_CONFIG } from '../data/site-config';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

const CART_KEY = 'eastlanka-cart';

interface CartLine {
  code: string;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalogue = inject(ProductService);
  private readonly lines = signal<CartLine[]>(readCart());

  readonly entries = computed(() =>
    this.lines()
      .map((line) => {
        const product = this.catalogue.byCode(line.code);
        return product ? { product, qty: line.qty } : null;
      })
      .filter((entry): entry is { product: Product; qty: number } => entry !== null),
  );

  readonly count = computed(() => this.entries().reduce((sum, entry) => sum + entry.qty, 0));
  readonly total = computed(() => this.entries().reduce((sum, entry) => sum + entry.product.price * entry.qty, 0));
  readonly freeDelivery = computed(() => this.count() >= SITE_CONFIG.freeDelivery.minItems);
  readonly remainingForFreeDelivery = computed(() => Math.max(SITE_CONFIG.freeDelivery.minItems - this.count(), 0));

  qty(code: string): number {
    return this.lines().find((line) => line.code === code)?.qty ?? 0;
  }

  add(product: Product): void {
    if (!product.available) {
      return;
    }
    this.lines.update((lines) => {
      const existing = lines.find((line) => line.code === product.code);
      const next = existing
        ? lines.map((line) => (line.code === product.code ? { ...line, qty: line.qty + 1 } : line))
        : [...lines, { code: product.code, qty: 1 }];
      writeCart(next);
      return next;
    });
  }

  setQty(code: string, qty: number): void {
    this.lines.update((lines) => {
      const next = qty <= 0 ? lines.filter((line) => line.code !== code) : lines.map((line) => (line.code === code ? { ...line, qty } : line));
      writeCart(next);
      return next;
    });
  }

  remove(code: string): void {
    this.setQty(code, 0);
  }

  clear(): void {
    this.lines.set([]);
    writeCart([]);
  }
}

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) {
      return [];
    }
    const data = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(data)) {
      return [];
    }
    return data.filter((line) => typeof line.code === 'string' && Number.isFinite(line.qty) && line.qty > 0);
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch {
    // Private browsing can block storage.
  }
}
