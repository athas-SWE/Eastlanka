import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-order',
  imports: [RouterLink, CloudinaryUrlPipe, Icon],
  templateUrl: './order.html',
})
export class Order {
  private readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsAppService);
  private readonly seo = inject(SeoService);

  readonly site = SITE_CONFIG;
  readonly entries = this.cart.entries;
  readonly count = this.cart.count;
  readonly total = this.cart.total;
  readonly freeDelivery = this.cart.freeDelivery;
  readonly remaining = this.cart.remainingForFreeDelivery;
  readonly name = signal('');
  readonly phone = signal('');
  readonly address = signal('');
  readonly city = signal('');
  readonly note = signal('');
  protected formatLkr = formatLkr;

  constructor() {
    this.seo.apply({
      title: 'Your order | East Lanka',
      description: 'Review the products you want and send one WhatsApp message to East Lanka.',
      path: '/order',
      noindex: true,
    });
  }

  setQty(code: string, qty: number): void {
    this.cart.setQty(code, qty);
  }

  remove(code: string): void {
    this.cart.remove(code);
  }

  phoneOk(): boolean {
    return /^0\d{9}$/.test(this.phone().replace(/[\s-]/g, ''));
  }

  ready(): boolean {
    return /[A-Za-z]/.test(this.name().trim()) && this.phoneOk() && this.address().trim().length > 0 && this.city().trim().length > 0;
  }

  clear(): void {
    this.cart.clear();
  }

  whatsappUrl(): string {
    return this.whatsapp.orderUrl(this.entries(), this.freeDelivery(), {
      name: this.name(),
      phone: this.phone(),
      address: this.address(),
      city: this.city(),
      note: this.note(),
    });
  }
}
