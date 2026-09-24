import { Component, computed, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-offers',
  imports: [ProductGrid],
  templateUrl: './offers.html',
})
export class Offers {
  private readonly catalogue = inject(ProductService);
  private readonly seo = inject(SeoService);
  readonly products = computed(() => this.catalogue.offers());

  constructor() {
    this.seo.apply({
      title: 'Offers | East Lanka',
      description: 'Current East Lanka offers. See the sale price and order on WhatsApp while stock lasts.',
      path: '/offers',
    });
  }
}
