import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { CloudinaryService, CloudinaryUploadResult } from '../../core/services/cloudinary.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

@Component({
  selector: 'app-media',
  imports: [CloudinaryUrlPipe, RouterLink],
  templateUrl: './media.html',
})
export class Media {
  private readonly cloudinary = inject(CloudinaryService);

  readonly site = SITE_CONFIG;
  readonly uploading = signal(false);
  readonly error = signal('');
  readonly uploaded = signal<CloudinaryUploadResult[]>([]);

  async onFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    input.value = '';

    if (!files.length) {
      return;
    }

    this.uploading.set(true);
    this.error.set('');

    try {
      const results: CloudinaryUploadResult[] = [];
      for (const file of files) {
        results.push(await this.cloudinary.upload(file));
      }
      this.uploaded.update((current) => [...results, ...current]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      this.uploading.set(false);
    }
  }

  async copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
  }
}
