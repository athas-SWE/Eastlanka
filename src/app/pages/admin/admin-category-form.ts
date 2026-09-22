import { Component, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../core/models/product.model';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { ProductService } from '../../core/services/product.service';
import { uniqueSlug } from '../../core/utils/catalogue';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

interface CategoryDraft {
  name: string;
  blurb: string;
  image: string;
}

@Component({
  selector: 'app-admin-category-form',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './admin-category-form.html',
})
export class AdminCategoryForm implements OnDestroy {
  private readonly catalogue = inject(ProductService);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly router = inject(Router);
  private readonly appliedSlug = signal<string | null>(null);

  readonly slug = input<string>();
  readonly isNew = computed(() => !this.slug() || this.slug() === 'new');
  readonly existing = computed(() => (this.isNew() ? undefined : this.catalogue.categoryBySlug(this.slug()!)));

  readonly draft = signal<CategoryDraft>({ name: '', blurb: '', image: '' });
  readonly saving = signal(false);
  readonly error = signal('');
  readonly previewFile = signal<File | null>(null);
  readonly previewUrl = signal('');

  constructor() {
    effect(() => {
      const creating = this.isNew();
      const category = this.existing();

      if (creating && this.appliedSlug() !== 'new') {
        this.draft.set({ name: '', blurb: '', image: '' });
        this.appliedSlug.set('new');
        return;
      }

      if (category && this.appliedSlug() !== category.slug) {
        this.draft.set({
          name: category.name,
          blurb: category.blurb,
          image: category.image,
        });
        this.appliedSlug.set(category.slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  setText(key: 'name' | 'blurb' | 'image', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.draft.update((current) => ({ ...current, [key]: value }));
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

    if (!draft.name.trim()) {
      this.error.set('Add a category name.');
      return;
    }
    if (!draft.blurb.trim()) {
      this.error.set('Add a short description.');
      return;
    }
    if (!draft.image && !this.previewFile()) {
      this.error.set('Add a category photo.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      let image = draft.image;
      const file = this.previewFile();
      const existing = this.existing();
      const slug = existing?.slug ?? uniqueSlug(draft.name, this.catalogue.categories());

      if (file) {
        const uploaded = await this.cloudinary.upload(file, `categories/${slug}-${Date.now()}`);
        image = uploaded.publicId;
      }

      const category: Category = {
        slug,
        name: draft.name.trim(),
        blurb: draft.blurb.trim(),
        image,
      };

      const remote = await this.catalogue.saveCategory(category, this.isNew());
      await this.router.navigateByUrl('/admin/categories', {
        state: { notice: remote ? 'Category saved.' : 'Category saved on this device.' },
      });
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not save category.');
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
