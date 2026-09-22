import { Injectable } from '@angular/core';
import { SITE_CONFIG } from '../data/site-config';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly cloudName = SITE_CONFIG.cloudinary.cloudName;
  private readonly folder = SITE_CONFIG.cloudinary.folder;
  private readonly uploadPreset = SITE_CONFIG.cloudinary.uploadPreset;
  private readonly uploadEndpoint = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  url(idOrUrl: string, options?: { width?: number }): string {
    if (!idOrUrl) {
      return '';
    }

    if (idOrUrl.startsWith('http://') || idOrUrl.startsWith('https://') || idOrUrl.startsWith('assets/')) {
      return idOrUrl;
    }

    const transforms = ['f_auto', 'q_auto'];
    if (options?.width) {
      transforms.push(`w_${options.width}`, 'c_limit');
    }

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transforms.join(',')}/${idOrUrl}`;
  }

  async upload(file: File, publicId?: string): Promise<CloudinaryUploadResult> {
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', this.uploadPreset);
    body.append('folder', this.folder);

    if (publicId) {
      body.append('public_id', publicId);
    }

    const response = await fetch(this.uploadEndpoint, {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || 'Cloudinary upload failed.');
    }

    const data = (await response.json()) as {
      public_id: string;
      url: string;
      secure_url: string;
    };

    return {
      publicId: data.public_id,
      url: this.url(data.public_id),
      secureUrl: data.secure_url,
    };
  }
}
