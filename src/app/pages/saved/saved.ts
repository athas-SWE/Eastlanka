import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-saved',
  imports: [RouterLink, ProductGrid],
  templateUrl: './saved.html',
})
export class Saved {
  readonly favorites = inject(FavoritesService);

  constructor() {
    inject(SeoService).apply({
      title: 'Saved products | East Lanka',
      description: 'Products you saved on this browser.',
      path: '/saved',
      noindex: true,
    });
  }
}
