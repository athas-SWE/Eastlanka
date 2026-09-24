import { Component, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { FacebookService } from '../../core/services/facebook.service';
import { ProductService } from '../../core/services/product.service';
import { nextProductCode, nextProductId, slugify } from '../../core/utils/catalogue';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

interface ProductDraft {
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  image: string;
  description: string;
  available: boolean;
  newArrival: boolean;
}

@Component({
  selector: 'app-admin-product-form',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './admin-product-form.html',
})
export class AdminProductForm implements OnDestroy {
  private readonly catalogue = inject(ProductService);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly facebook = inject(FacebookService);
  private readonly router = inject(Router);

  readonly code = input<string>();
  readonly isNew = computed(() => !this.code() || this.code() === 'new');
  readonly existing = computed(() => (this.isNew() ? undefined : this.catalogue.byCode(this.code()!)));
  readonly categories = this.catalogue.categories;

  readonly draft = signal<ProductDraft>(emptyDraft());
  readonly saving = signal(false);
  readonly error = signal('');
  readonly previewFile = signal<File | null>(null);
  readonly previewUrl = signal('');
  private readonly appliedCode = signal<string | null>(null);

  constructor() {
    effect(() => {
      const creating = this.isNew();
      const product = this.existing();
      const firstCategory = this.categories()[0]?.slug ?? '';

      if (creating) {
        if (this.appliedCode() !== 'new') {
          this.draft.set({ ...emptyDraft(), category: firstCategory });
          this.appliedCode.set('new');
        } else if (!this.draft().category && firstCategory) {
          this.draft.update((current) => ({ ...current, category: firstCategory }));
        }
        return;
      }

      if (product && this.appliedCode() !== product.code) {
        this.draft.set({
          name: product.name,
          category: product.category,
          price: String(product.price),
          originalPrice: product.originalPrice ? String(product.originalPrice) : '',
          image: product.image,
          description: product.description,
          available: product.available,
          newArrival: Boolean(product.newArrival),
        });
        this.appliedCode.set(product.code);
      }
    });
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  setText(key: 'name' | 'category' | 'price' | 'originalPrice' | 'description' | 'image', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this.draft.update((current) => ({ ...current, [key]: value }));
  }

  setFlag(key: 'available' | 'newArrival', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.draft.update((current) => ({ ...current, [key]: checked }));
  }

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.revokePreview();
    this.previewFile.set(file);
    this.previewUrl.set(file ? URL.createObjectURL(file) : '');
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    const draft = this.draft();
    const price = Number(draft.price);
    const originalPrice = draft.originalPrice ? Number(draft.originalPrice) : undefined;

    if (!draft.name.trim()) {
      this.error.set('Add a product name.');
      return;
    }
    if (!draft.category) {
      this.error.set('Choose a category, or create one first.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      this.error.set('Enter a price in rupees.');
      return;
    }
    if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice <= price)) {
      this.error.set('Offer price must be higher than the selling price.');
      return;
    }
    if (!draft.description.trim()) {
      this.error.set('Add a short description.');
      return;
    }
    if (!draft.image && !this.previewFile()) {
      this.error.set('Add a product photo.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      let image = draft.image;
      const file = this.previewFile();
      if (file) {
        const uploaded = await this.cloudinary.upload(file, `products/${slugify(draft.name)}-${Date.now()}`);
        image = uploaded.publicId;
      }

      const existing = this.existing();
      const product: Product = {
        id: existing?.id ?? nextProductId(this.catalogue.products()),
        code: existing?.code ?? nextProductCode(this.catalogue.products()),
        name: draft.name.trim(),
        category: draft.category,
        price,
        originalPrice,
        image,
        description: draft.description.trim(),
        available: draft.available,
        newArrival: draft.newArrival,
        facebookPostId: existing?.facebookPostId,
      };

      const creating = this.isNew();
      const remote = await this.catalogue.saveProduct(product, creating);
      let notice = remote ? 'Product saved.' : 'Product saved on this device.';

      if (creating && !product.facebookPostId) {
        const posted = await this.facebook.publishIfEnabled(product);
        if (posted.status === 'posted' && posted.postId) {
          await this.catalogue.saveProduct({ ...product, facebookPostId: posted.postId }, false);
          notice = 'Product saved and posted to Facebook.';
        } else if (posted.status === 'failed') {
          notice = remote
            ? 'Product saved. Facebook post failed.'
            : 'Product saved on this device. Facebook post failed.';
        }
      }

      await this.router.navigateByUrl('/admin/products', {
        state: { notice },
      });
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not save product.');
    } finally {
      this.saving.set(false);
    }
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

function emptyDraft(): ProductDraft {
  return {
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    image: '',
    description: '',
    available: true,
    newArrival: true,
  };
}
