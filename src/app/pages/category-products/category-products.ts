import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-category-products',
  imports: [RouterLink, ProductGrid],
  templateUrl: './category-products.html',
})
export class CategoryProducts {
  private readonly productService = inject(ProductService);
  private readonly title = inject(Title);

  readonly slug = input.required<string>();
  readonly category = computed(() => this.productService.categoryBySlug(this.slug()));
  readonly products = computed(() => this.productService.byCategory(this.slug()));

  constructor() {
    effect(() => {
      const category = this.category();
      this.title.setTitle(category ? `${category.name} | East Lanka` : 'Category | East Lanka');
    });
  }
}
