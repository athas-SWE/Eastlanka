import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { SeoService } from '../../core/services/seo.service';

export const DELIVERY_FAQ = [
  {
    question: 'How do I order?',
    answer: 'Open a product and tap Order on WhatsApp. We confirm the price, stock and delivery with you in the chat.',
  },
  {
    question: 'When is delivery free?',
    answer: SITE_CONFIG.freeDelivery.detail,
  },
  {
    question: 'Where do you deliver?',
    answer: 'East Lanka delivers in Sri Lanka. We agree the delivery details on WhatsApp after you enquire.',
  },
];

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
})
export class About {
  private readonly seo = inject(SeoService);
  readonly site = SITE_CONFIG;
  readonly faq = DELIVERY_FAQ;

  constructor() {
    this.seo.apply({
      title: 'About East Lanka',
      description: 'East Lanka is a Sri Lankan catalogue. Browse products, then order and arrange delivery on WhatsApp.',
      path: '/about',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: DELIVERY_FAQ.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    });
  }
}
