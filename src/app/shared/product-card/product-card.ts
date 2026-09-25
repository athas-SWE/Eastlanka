import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { discountPercent, formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../cloudinary-url.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  private readonly cart = inject(CartService);
  readonly product = input.required<Product>();

  protected formatLkr = formatLkr;
  protected discountPercent = discountPercent;

  add(event: Event): void {
    event.preventDefault();
    this.cart.add(this.product());
  }

  inOrder(): number {
    return this.cart.qty(this.product().code);
  }
}
