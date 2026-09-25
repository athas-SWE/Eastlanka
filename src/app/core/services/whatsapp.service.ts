import { Injectable } from '@angular/core';
import { SITE_CONFIG } from '../data/site-config';
import { Product } from '../models/product.model';
import { formatLkr } from '../utils/money';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly number = SITE_CONFIG.whatsappNumber;

  productOrderUrl(product: Product): string {
    const message = [
      `Hi ${SITE_CONFIG.name},`,
      '',
      "I'm interested in this product:",
      '',
      `Product: ${product.name}`,
      `Price: ${formatLkr(product.price)}`,
      `Product Code: ${product.code}`,
      '',
      'Please let me know whether it is available.',
    ].join('\n');

    return this.buildUrl(message);
  }

  orderUrl(
    items: { product: Product; qty: number }[],
    freeDelivery: boolean,
    details: { name: string; phone: string; address: string; city: string; note: string },
  ): string {
    const lines = items.map(
      (item) => `${item.qty} × ${item.product.name} — ${item.product.code} — ${formatLkr(item.product.price * item.qty)}`,
    );
    const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const message = [
      `Hi ${SITE_CONFIG.name},`,
      '',
      'I would like to order:',
      '',
      ...lines,
      '',
      `Total: ${formatLkr(total)}`,
      `Name: ${details.name.trim()}`,
      `Phone: ${details.phone.trim()}`,
      `Address: ${details.address.trim()}`,
      `Delivery city: ${details.city.trim()}`,
      details.note.trim() ? `Note: ${details.note.trim()}` : '',
      freeDelivery ? 'Free delivery: this order has 3 or more products.' : '',
      '',
      'Please confirm availability and delivery.',
    ]
      .filter((line) => line !== '')
      .join('\n');
    return this.buildUrl(message);
  }

  buyNowUrl(product: Product): string {
    const message = [
      `Hi ${SITE_CONFIG.name},`,
      '',
      'I would like to order:',
      '',
      `1 × ${product.name} — ${product.code} — ${formatLkr(product.price)}`,
      '',
      `Total: ${formatLkr(product.price)}`,
      '',
      'Please confirm availability and delivery.',
    ].join('\n');
    return this.buildUrl(message);
  }

  generalUrl(): string {
    const message = `Hi ${SITE_CONFIG.name},\n\nI'd like to know more about your products.`;
    return this.buildUrl(message);
  }

  private buildUrl(text: string): string {
    return `https://wa.me/${this.number}?text=${encodeURIComponent(text)}`;
  }
}
