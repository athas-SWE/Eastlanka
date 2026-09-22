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

  generalUrl(): string {
    const message = `Hi ${SITE_CONFIG.name},\n\nI'd like to know more about your products.`;
    return this.buildUrl(message);
  }

  private buildUrl(text: string): string {
    return `https://wa.me/${this.number}?text=${encodeURIComponent(text)}`;
  }
}
