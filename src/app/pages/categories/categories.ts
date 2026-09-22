import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './categories.html',
})
export class Categories {
  readonly categories = inject(ProductService).categories;
}
