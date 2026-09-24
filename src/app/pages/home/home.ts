import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { SeoService, logoUrl } from '../../core/services/seo.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { discountPercent, formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';
import { ProductGrid } from '../../shared/product-grid/product-grid';

const SPOTLIGHT_INTERVAL = 4500;

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductGrid, CloudinaryUrlPipe, Icon],
  templateUrl: './home.html',
})
export class Home {
  private readonly catalogue = inject(ProductService);
  private readonly whatsapp = inject(WhatsAppService);
  private readonly seo = inject(SeoService);

  readonly site = SITE_CONFIG;
  readonly categories = this.catalogue.categories;
  readonly arrivals = computed(() => this.catalogue.newArrivals().slice(0, 3));
  readonly productCount = computed(() => this.catalogue.products().length);
  readonly categoryCount = computed(() => this.catalogue.categories().length);
  readonly whatsappUrl = this.whatsapp.generalUrl();

  readonly spotlight = computed(() => {
    const available = this.catalogue.products().filter((product) => product.available);
    const featured = available.filter(
      (product) => product.newArrival || (product.originalPrice ?? 0) > product.price,
    );
    return (featured.length ? featured : available).slice(0, 5);
  });
  readonly activeIndex = signal(0);
  readonly active = computed<Product | undefined>(() => {
    const list = this.spotlight();
    return list.length ? list[this.activeIndex() % list.length] : undefined;
  });
  readonly paused = signal(false);

  protected formatLkr = formatLkr;
  protected discountPercent = discountPercent;

  readonly highlights = ['Prices shown upfront', 'Order in one message', 'Real replies on WhatsApp'];

  readonly steps = [
    { title: 'Pick a product', text: 'Browse the catalogue and open anything you like.' },
    { title: 'Tap WhatsApp', text: 'The product name, code and price are filled in for you.' },
    { title: 'We confirm', text: 'Stock and delivery are sorted in the same chat. Order 3 products and delivery is free.' },
  ];

  readonly reasons = [
    { label: 'Shop', title: 'Quality Products', text: 'Chosen for daily use, not just for a feed.' },
    { label: 'Discover', title: 'New Finds', text: 'The same pieces we highlight on Facebook and Instagram.' },
    { label: 'Upgrade', title: 'Great Prices', text: 'Clear rupee prices before you message us.' },
    { label: 'Live Better', title: 'Trusted Support', text: 'Questions go straight to WhatsApp — no ticket queue.' },
  ];

  constructor() {
    this.seo.apply({
      title: 'East Lanka | New Products • Better Tomorrow',
      description:
        'East Lanka is a Sri Lankan product catalogue. Browse electronics, fashion, home, accessories and gifts, then order on WhatsApp.',
      path: '/',
      image: logoUrl(),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        email: SITE_CONFIG.email,
        logo: logoUrl(),
        sameAs: [SITE_CONFIG.facebookUrl, SITE_CONFIG.instagramUrl],
      },
    });
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const timer = setInterval(() => {
      if (!this.paused()) {
        this.next();
      }
    }, SPOTLIGHT_INTERVAL);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  orderUrl(product: Product): string {
    return this.whatsapp.productOrderUrl(product);
  }

  show(index: number): void {
    this.activeIndex.set(index);
  }

  next(): void {
    const count = this.spotlight().length;
    if (count) {
      this.activeIndex.update((index) => (index + 1) % count);
    }
  }

  previous(): void {
    const count = this.spotlight().length;
    if (count) {
      this.activeIndex.update((index) => (index - 1 + count) % count);
    }
  }
}
