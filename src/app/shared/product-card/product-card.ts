import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { discountPercent, formatLkr } from '../../core/utils/money';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
})
export class ProductCard {
  readonly product = input.required<Product>();

  protected formatLkr = formatLkr;
  protected discountPercent = discountPercent;
}
