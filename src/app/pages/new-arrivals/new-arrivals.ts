import { Component, computed, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-new-arrivals',
  imports: [ProductGrid],
  templateUrl: './new-arrivals.html',
})
export class NewArrivals {
  private readonly catalogue = inject(ProductService);
  readonly products = computed(() => this.catalogue.newArrivals());
}
