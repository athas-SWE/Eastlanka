import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SeoService, breadcrumbJsonLd } from '../../core/services/seo.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-category-products',
  imports: [RouterLink, ProductGrid],
  templateUrl: './category-products.html',
})
export class CategoryProducts {
  private readonly productService = inject(ProductService);
  private readonly seo = inject(SeoService);
  private readonly cloudinary = inject(CloudinaryService);

  readonly slug = input.required<string>();
  readonly category = computed(() => this.productService.categoryBySlug(this.slug()));
  readonly products = computed(() => this.productService.byCategory(this.slug()));

  constructor() {
    effect(() => {
      const category = this.category();
      if (!category) {
        this.seo.apply({
          title: 'Category | East Lanka',
          description: 'That category is not in the East Lanka catalogue.',
          path: `/categories/${this.slug()}`,
          noindex: true,
        });
        return;
      }
      this.seo.apply({
        title: `${category.name} | East Lanka`,
        description: category.blurb,
        path: `/categories/${category.slug}`,
        image: this.cloudinary.url(category.image, { width: 1200 }),
        jsonLd: {
          '@context': 'https://schema.org',
          ...breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Categories', path: '/categories' },
            { name: category.name, path: `/categories/${category.slug}` },
          ]),
        },
      });
    });
  }
}
