import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

@Component({
  selector: 'app-admin-categories',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './admin-categories.html',
})
export class AdminCategories {
  private readonly catalogue = inject(ProductService);

  readonly categories = this.catalogue.categories;
  readonly busy = signal('');
  readonly message = signal('');
  readonly error = signal('');

  productCount(slug: string): number {
    return this.catalogue.byCategory(slug).length;
  }

  async remove(slug: string, name: string): Promise<void> {
    if (!confirm(`Delete ${name}?`)) {
      return;
    }

    this.busy.set(slug);
    this.error.set('');
    this.message.set('');

    try {
      const remote = await this.catalogue.removeCategory(slug);
      this.message.set(remote ? `${name} deleted.` : `${name} deleted on this device.`);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not delete category.');
    } finally {
      this.busy.set('');
    }
  }
}
