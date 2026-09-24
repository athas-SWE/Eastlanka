import { Component, inject, signal } from '@angular/core';
import { FacebookService } from '../../core/services/facebook.service';

@Component({
  selector: 'app-admin-facebook',
  templateUrl: './admin-facebook.html',
})
export class AdminFacebook {
  private readonly facebook = inject(FacebookService);

  readonly pageId = signal('');
  readonly token = signal('');
  readonly autoPost = signal(true);
  readonly pageName = signal('');
  readonly connected = signal(false);
  readonly lastPostAt = signal<string | null>(null);
  readonly lastPostUrl = signal<string | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly testing = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  constructor() {
    void this.load();
  }

  setPageId(event: Event): void {
    this.pageId.set((event.target as HTMLInputElement).value);
  }

  setToken(event: Event): void {
    this.token.set((event.target as HTMLInputElement).value);
  }

  setAutoPost(event: Event): void {
    this.autoPost.set((event.target as HTMLInputElement).checked);
  }

  async save(event: Event): Promise<void> {
    event.preventDefault();
    await this.submit(false);
  }

  async test(): Promise<void> {
    await this.submit(true);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.apply(await this.facebook.getSettings());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not load Facebook settings.');
    } finally {
      this.loading.set(false);
    }
  }

  private async submit(testOnly: boolean): Promise<void> {
    if (testOnly) {
      this.testing.set(true);
    } else {
      this.saving.set(true);
    }
    this.error.set('');
    this.message.set('');

    const input = {
      pageId: this.pageId().trim(),
      pageAccessToken: this.token().trim(),
      autoPost: this.autoPost(),
    };

    try {
      const status = testOnly ? await this.facebook.testSettings(input) : await this.facebook.saveSettings(input);
      this.apply(status);
      this.token.set('');
      this.message.set(testOnly ? `Connected to ${status.pageName}.` : 'Facebook settings saved.');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not update Facebook settings.');
    } finally {
      this.saving.set(false);
      this.testing.set(false);
    }
  }

  private apply(status: {
    connected: boolean;
    pageId: string;
    pageName: string;
    autoPost: boolean;
    lastPostAt: string | null;
    lastPostUrl: string | null;
  }): void {
    this.connected.set(status.connected);
    this.pageId.set(status.pageId);
    this.pageName.set(status.pageName);
    this.autoPost.set(status.autoPost);
    this.lastPostAt.set(status.lastPostAt);
    this.lastPostUrl.set(status.lastPostUrl);
  }
}
