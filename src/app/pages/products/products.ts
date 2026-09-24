import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-products',
  imports: [ProductGrid],
  templateUrl: './products.html',
})
export class Products {
  private readonly productService = inject(ProductService);
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'Products | East Lanka',
      description: 'Browse the East Lanka catalogue. Compare prices in rupees and order on WhatsApp.',
      path: '/products',
    });
  }

  readonly categories = this.productService.categories;
  readonly query = signal('');
  readonly category = signal('');

  readonly filtered = computed(() => this.productService.search(this.query(), this.category() || undefined));

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value);
  }
}
