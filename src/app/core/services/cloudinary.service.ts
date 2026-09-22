import { Injectable } from '@angular/core';
import { SITE_CONFIG } from '../data/site-config';
import { CatalogueSnapshot } from '../models/product.model';

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
  private readonly dataPreset = SITE_CONFIG.cloudinary.dataPreset;
  private readonly catalogueTag = SITE_CONFIG.cloudinary.catalogueTag;
  private readonly uploadEndpoint = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  url(idOrUrl: string, options?: { width?: number }): string {
    if (!idOrUrl) {
      return '';
    }

    if (
      idOrUrl.startsWith('http://') ||
      idOrUrl.startsWith('https://') ||
      idOrUrl.startsWith('assets/') ||
      idOrUrl.startsWith('blob:')
    ) {
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

  async fetchCatalogue(): Promise<CatalogueSnapshot | null> {
    const fromList = await this.fetchLatestTaggedCatalogue();
    if (fromList) {
      return fromList;
    }

    return this.fetchJson(
      `https://res.cloudinary.com/${this.cloudName}/raw/upload/${this.folder}/data/catalogue.json`,
    );
  }

  async uploadCatalogue(snapshot: CatalogueSnapshot): Promise<boolean> {
    const file = new File([JSON.stringify(snapshot)], `catalogue-${Date.now()}.json`, {
      type: 'application/json',
    });
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', this.dataPreset);
    body.append('folder', `${this.folder}/data`);
    body.append('tags', this.catalogueTag);
    body.append('unique_filename', 'true');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/raw/upload`, {
        method: 'POST',
        body,
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  private async fetchLatestTaggedCatalogue(): Promise<CatalogueSnapshot | null> {
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${this.cloudName}/raw/list/${this.catalogueTag}.json?t=${Date.now()}`,
        { cache: 'no-store' },
      );
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        resources?: { public_id: string; version?: number; created_at?: string; format?: string }[];
      };
      const latest = [...(payload.resources ?? [])].sort((a, b) => {
        return Date.parse(b.created_at ?? '') - Date.parse(a.created_at ?? '');
      })[0];

      if (!latest?.public_id) {
        return null;
      }

      const version = latest.version ? `v${latest.version}/` : '';
      const format = latest.format ? `.${latest.format}` : '.json';
      return this.fetchJson(
        `https://res.cloudinary.com/${this.cloudName}/raw/upload/${version}${latest.public_id}${format}`,
      );
    } catch {
      return null;
    }
  }

  private async fetchJson(url: string): Promise<CatalogueSnapshot | null> {
    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as CatalogueSnapshot;
      if (!Array.isArray(data?.products) || !Array.isArray(data?.categories)) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }
}
