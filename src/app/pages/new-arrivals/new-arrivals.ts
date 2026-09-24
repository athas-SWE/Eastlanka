import { Component, computed, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-new-arrivals',
  imports: [ProductGrid],
  templateUrl: './new-arrivals.html',
})
export class NewArrivals {
  private readonly catalogue = inject(ProductService);
  private readonly seo = inject(SeoService);
  readonly products = computed(() => this.catalogue.newArrivals());

  constructor() {
    this.seo.apply({
      title: 'New Arrivals | East Lanka',
      description: 'The newest products in the East Lanka catalogue. Order on WhatsApp.',
      path: '/new-arrivals',
    });
  }
}
