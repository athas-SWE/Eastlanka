import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { ProductService } from '../../core/services/product.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { discountPercent, formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CloudinaryUrlPipe, Icon],
  templateUrl: './product-details.html',
})
export class ProductDetails {
  private readonly productService = inject(ProductService);
  private readonly whatsapp = inject(WhatsAppService);
  private readonly title = inject(Title);

  readonly code = input.required<string>();
  readonly product = computed(() => this.productService.byCode(this.code()));
  readonly category = computed(() => {
    const product = this.product();
    return product ? this.productService.categoryBySlug(product.category) : undefined;
  });

  readonly site = SITE_CONFIG;

  protected formatLkr = formatLkr;
  protected discountPercent = discountPercent;

  constructor() {
    effect(() => {
      const product = this.product();
      this.title.setTitle(product ? `${product.name} | East Lanka` : 'Product | East Lanka');
    });
  }

  orderUrl(): string | null {
    const product = this.product();
    return product ? this.whatsapp.productOrderUrl(product) : null;
  }
}
