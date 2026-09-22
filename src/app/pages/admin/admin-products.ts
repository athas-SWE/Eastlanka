import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { formatLkr } from '../../core/utils/money';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './admin-products.html',
})
export class AdminProducts {
  private readonly catalogue = inject(ProductService);

  readonly products = this.catalogue.products;
  readonly categories = this.catalogue.categories;
  readonly busy = signal('');
  readonly message = signal('');
  readonly error = signal('');

  protected formatLkr = formatLkr;

  categoryName(slug: string): string {
    return this.catalogue.categoryBySlug(slug)?.name ?? slug;
  }

  async remove(code: string, name: string): Promise<void> {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) {
      return;
    }

    this.busy.set(code);
    this.error.set('');
    this.message.set('');

    try {
      const remote = await this.catalogue.removeProduct(code);
      this.message.set(remote ? `${name} deleted.` : `${name} deleted on this device.`);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not delete product.');
    } finally {
      this.busy.set('');
    }
  }
}
