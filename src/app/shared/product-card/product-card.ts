import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { QuickViewService } from '../../core/services/quick-view.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { discountPercent, formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../cloudinary-url.pipe';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CloudinaryUrlPipe, Icon],
  templateUrl: './product-card.html',
})
export class ProductCard {
  private readonly cart = inject(CartService);
  private readonly favorites = inject(FavoritesService);
  private readonly quickView = inject(QuickViewService);
  private readonly whatsapp = inject(WhatsAppService);
  readonly product = input.required<Product>();

  protected formatLkr = formatLkr;
  protected discountPercent = discountPercent;

  add(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cart.add(this.product());
  }

  save(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favorites.toggle(this.product());
  }

  open(event: Event): void {
    event.preventDefault();
    this.quickView.open(this.product());
  }

  saved(): boolean {
    return this.favorites.has(this.product().code);
  }

  inOrder(): number {
    return this.cart.qty(this.product().code);
  }

  buyUrl(): string {
    return this.whatsapp.buyNowUrl(this.product());
  }
}
