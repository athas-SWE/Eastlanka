import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-offers',
  imports: [ProductGrid],
  templateUrl: './offers.html',
})
export class Offers {
  readonly products = inject(ProductService).offers();
}
