import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DELIVERY_FAQ } from '../../core/data/faq';
import { SITE_CONFIG } from '../../core/data/site-config';
import { CartService } from '../../core/services/cart.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { ProductService } from '../../core/services/product.service';
import { RecentService } from '../../core/services/recent.service';
import { SeoService, absoluteUrl, breadcrumbJsonLd } from '../../core/services/seo.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { discountPercent, formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CloudinaryUrlPipe, Icon, ProductGrid],
  templateUrl: './product-details.html',
})
export class ProductDetails {
  private readonly productService = inject(ProductService);
  private readonly whatsapp = inject(WhatsAppService);
  private readonly seo = inject(SeoService);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly cart = inject(CartService);
  private readonly recent = inject(RecentService);

  readonly code = input.required<string>();
  readonly product = computed(() => this.productService.byCode(this.code()));
  readonly category = computed(() => {
    const product = this.product();
    return product ? this.productService.categoryBySlug(product.category) : undefined;
  });

  readonly site = SITE_CONFIG;
  readonly faq = DELIVERY_FAQ;
  readonly related = computed(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    return this.productService.byCategory(product.category).filter((item) => item.code !== product.code).slice(0, 4);
  });
  readonly viewed = computed(() => this.recent.products().filter((item) => item.code !== this.product()?.code).slice(0, 4));
  readonly copied = signal(false);
  readonly inOrder = computed(() => {
    const product = this.product();
    return product ? this.cart.qty(product.code) : 0;
  });

  protected formatLkr = formatLkr;
  protected discountPercent = discountPercent;

  constructor() {
    effect(() => {
      const product = this.product();
      const category = this.category();
      if (product) {
        this.recent.view(product.code);
      }
      if (!product) {
        this.seo.apply({
          title: 'Product | East Lanka',
          description: 'That product is not in the East Lanka catalogue.',
          path: `/products/${this.code()}`,
          noindex: true,
        });
        return;
      }
      const image = this.cloudinary.url(product.image, { width: 1200 });
      const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        ...(category ? [{ name: category.name, path: `/categories/${category.slug}` }] : []),
        { name: product.name, path: `/products/${product.code}` },
      ];
      this.seo.apply({
        title: `${product.name} | East Lanka`,
        description: product.description,
        path: `/products/${product.code}`,
        image,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbJsonLd(crumbs),
            {
              '@type': 'Product',
              name: product.name,
              sku: product.code,
              description: product.description,
              image,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'LKR',
                price: String(product.price),
                availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                url: absoluteUrl(`/products/${product.code}`),
              },
            },
          ],
        },
      });
    });
  }

  add(): void {
    const product = this.product();
    if (product) {
      this.cart.add(product);
    }
  }

  orderUrl(): string | null {
    const product = this.product();
    return product?.available ? this.whatsapp.buyNowUrl(product) : null;
  }

  async share(): Promise<void> {
    const product = this.product();
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
    this.copied.set(true);
  }
}
