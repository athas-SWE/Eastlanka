import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { QuickViewService } from '../../core/services/quick-view.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { discountPercent, formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-quick-view',
  imports: [RouterLink, CloudinaryUrlPipe, Icon],
  templateUrl: './quick-view.html',
})
export class QuickView {
  private readonly cart = inject(CartService);
  private readonly favorites = inject(FavoritesService);
  private readonly whatsapp = inject(WhatsAppService);
  readonly sheet = inject(QuickViewService);

  protected formatLkr = formatLkr;
  protected discountPercent = discountPercent;

  saved(): boolean {
    const product = this.sheet.product();
    return product ? this.favorites.has(product.code) : false;
  }

  inOrder(): number {
    const product = this.sheet.product();
    return product ? this.cart.qty(product.code) : 0;
  }

  add(): void {
    const product = this.sheet.product();
    if (product) {
      this.cart.add(product);
    }
  }

  toggleSaved(): void {
    const product = this.sheet.product();
    if (product) {
      this.favorites.toggle(product);
    }
  }

  buyUrl(): string {
    const product = this.sheet.product();
    return product ? this.whatsapp.buyNowUrl(product) : '';
  }

  async share(): Promise<void> {
    const product = this.sheet.product();
    if (!product) {
      return;
    }
    const url = `${location.origin}/products/${product.code}`;
    const payload = { title: product.name, text: `${product.name} — ${formatLkr(product.price)}`, url };
    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        // The shopper closed the share sheet.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
  }
}
