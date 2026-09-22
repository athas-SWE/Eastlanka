import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-new-arrivals',
  imports: [ProductGrid],
  templateUrl: './new-arrivals.html',
})
export class NewArrivals {
  readonly products = inject(ProductService).newArrivals();
}
