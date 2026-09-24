import { Injectable, inject } from '@angular/core';
import { SITE_CONFIG } from '../data/site-config';
import { Product } from '../models/product.model';
import { AdminAuthService } from './admin-auth.service';

export interface FacebookStatus {
  connected: boolean;
  pageId: string;
  pageName: string;
  autoPost: boolean;
  lastPostAt: string | null;
  lastPostUrl: string | null;
  tested?: boolean;
}

export interface FacebookPublishResult {
  status: 'posted' | 'skipped' | 'failed';
  postId?: string;
}

interface PublishResponse {
  posted?: boolean;
  skipped?: boolean;
  postId?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class FacebookService {
  private readonly auth = inject(AdminAuthService);

  getSettings(): Promise<FacebookStatus> {
    return this.request<FacebookStatus>('/api/facebook/settings');
  }

  async publishIfEnabled(product: Product): Promise<FacebookPublishResult> {
    if (product.facebookPostId) {
      return { status: 'skipped', postId: product.facebookPostId };
    }

    let status: FacebookStatus;
    try {
      status = await this.getSettings();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (/not configured|unavailable/i.test(message)) {
        return { status: 'skipped' };
      }
      return { status: err instanceof FacebookApiError ? 'failed' : 'skipped' };
    }

    if (!status.connected || !status.autoPost) {
      return { status: 'skipped' };
    }

    try {
      const result = await this.request<PublishResponse>('/api/facebook/publish', {
        method: 'POST',
        body: {
          whatsappNumber: SITE_CONFIG.whatsappNumber,
          product: {
            code: product.code,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            description: product.description,
            image: product.image,
            facebookPostId: product.facebookPostId,
          },
        },
      });
      if (result.posted && result.postId) {
        return { status: 'posted', postId: result.postId };
      }
      if (result.skipped) {
        return { status: 'skipped', postId: result.postId };
      }
      return { status: 'failed' };
    } catch {
      return { status: 'failed' };
    }
  }

  private async request<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
    const password = this.auth.credential();
    if (!password) {
      throw new FacebookApiError('Sign out and sign in again so Facebook actions can be authorized.');
    }

    let response: Response;
    try {
      response = await fetch(path, {
        method: options?.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new Error('Facebook API is unavailable. Deploy to Vercel and set the environment variables.');
    }

    const text = await response.text();
    let data: { error?: string } = {};
    try {
      data = text ? (JSON.parse(text) as { error?: string }) : {};
    } catch {
      throw new Error('Facebook API is unavailable. Deploy to Vercel and set the environment variables.');
    }

    if (!response.ok) {
      throw new FacebookApiError(data.error || 'Facebook request failed.');
    }

    return data as T;
  }
}

class FacebookApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FacebookApiError';
  }
}
