import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);

  readonly products = this.catalogue.products;
  readonly categories = this.catalogue.categories;
  readonly busy = signal('');
  readonly message = signal('');
  readonly error = signal('');

  protected formatLkr = formatLkr;

  constructor() {
    const notice = this.router.getCurrentNavigation()?.extras.state?.['notice'] ?? history.state?.notice;
    if (typeof notice === 'string' && notice) {
      if (notice.includes('failed')) {
        this.error.set(notice);
      } else {
        this.message.set(notice);
      }
    }
  }

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
