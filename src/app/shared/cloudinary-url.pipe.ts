import { Pipe, PipeTransform, inject } from '@angular/core';
import { CloudinaryService } from '../core/services/cloudinary.service';

@Pipe({
  name: 'cloudinaryUrl',
})
export class CloudinaryUrlPipe implements PipeTransform {
  private readonly cloudinary = inject(CloudinaryService);

  transform(idOrUrl: string, width?: number): string {
    return this.cloudinary.url(idOrUrl, width ? { width } : undefined);
  }
}
