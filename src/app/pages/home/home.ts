import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { ProductService } from '../../core/services/product.service';
import { RecentService } from '../../core/services/recent.service';
import { SeoService, logoUrl } from '../../core/services/seo.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductGrid, CloudinaryUrlPipe, Icon],
  templateUrl: './home.html',
})
export class Home {
  private readonly catalogue = inject(ProductService);
  private readonly router = inject(Router);

  readonly site = SITE_CONFIG;
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
  readonly categories = this.catalogue.categories;
  readonly offers = computed(() => this.catalogue.offers().slice(0, 4));
  readonly slides = computed(() => {
    const seen = new Set<string>();
    return [...this.catalogue.offers(), ...this.catalogue.newArrivals(), ...this.catalogue.popular()]
      .filter((product) => {
        if (!product.available || seen.has(product.code)) {
          return false;
        }
        seen.add(product.code);
        return true;
      })
      .slice(0, 5);
  });
  readonly index = signal(0);
  readonly paused = signal(false);
  readonly active = computed(() => {
    const list = this.slides();
    return list.length ? list[this.index() % list.length] : undefined;
  });
  protected formatLkr = formatLkr;
  readonly arrivals = computed(() => this.catalogue.newArrivals().slice(0, 4));
  readonly popular = computed(() => this.catalogue.popular().slice(0, 4));
  readonly recent = inject(RecentService).products;

  constructor() {
    inject(SeoService).apply({
      title: 'East Lanka | New Products • Better Tomorrow',
      description: 'Shop East Lanka. Search products, open a category, and order on WhatsApp.',
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

    const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }
    const timer = setInterval(() => {
      if (!this.paused()) {
        this.next();
      }
    }, 4500);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  show(index: number): void {
    this.index.set(index);
  }

  next(): void {
    const count = this.slides().length;
    if (count) {
      this.index.update((index) => (index + 1) % count);
    }
  }

  previous(): void {
    const count = this.slides().length;
    if (count) {
      this.index.update((index) => (index - 1 + count) % count);
    }
  }

  search(event: Event): void {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const q = String(data.get('q') ?? '').trim();
    void this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
  }
}
