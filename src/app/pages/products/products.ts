import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.query.set(params.get('q') ?? '');
      this.category.set(params.get('category') ?? '');
    });
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
    const q = (event.target as HTMLInputElement).value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onCategory(event: Event): void {
    const category = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
