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

  orderUrl(items: { product: Product; qty: number }[], freeDelivery: boolean): string {
    const lines = items.map(
      (item, index) =>
        `${index + 1}. ${item.product.name} (${item.product.code}) × ${item.qty} — ${formatLkr(item.product.price)}`,
    );
    const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const message = [
      `Hi ${SITE_CONFIG.name},`,
      '',
      "I'd like to order:",
      '',
      ...lines,
      '',
      `Items: ${items.reduce((sum, item) => sum + item.qty, 0)}`,
      `Total: ${formatLkr(total)}`,
      freeDelivery ? 'Free delivery: yes, this order has 3 or more products.' : 'Please confirm the delivery charge.',
      '',
      'Please confirm stock and delivery.',
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
