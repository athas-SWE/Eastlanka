import { Component, computed, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-offers',
  imports: [ProductGrid],
  templateUrl: './offers.html',
})
export class Offers {
  private readonly catalogue = inject(ProductService);
  readonly products = computed(() => this.catalogue.offers());
}
