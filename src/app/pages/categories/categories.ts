import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './categories.html',
})
export class Categories {
  private readonly seo = inject(SeoService);
  readonly categories = inject(ProductService).categories;

  constructor() {
    this.seo.apply({
      title: 'Categories | East Lanka',
      description: 'Shop East Lanka by category: electronics, fashion, home, accessories and gifts.',
      path: '/categories',
    });
  }
}
