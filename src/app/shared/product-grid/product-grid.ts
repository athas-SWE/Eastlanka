import { Component, input } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard],
  templateUrl: './product-grid.html',
})
export class ProductGrid {
  readonly products = input.required<Product[]>();
  readonly emptyMessage = input('No products found.');
}
