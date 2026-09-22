import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../core/data/categories';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './categories.html',
})
export class Categories {
  readonly categories = CATEGORIES;
}
