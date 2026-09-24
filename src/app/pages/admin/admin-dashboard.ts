import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FacebookService, FacebookStatus } from '../../core/services/facebook.service';
import { ProductService } from '../../core/services/product.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, Icon],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard {
  private readonly catalogue = inject(ProductService);
  private readonly facebook = inject(FacebookService);

  readonly productCount = computed(() => this.catalogue.products().length);
  readonly categoryCount = computed(() => this.catalogue.categories().length);
  readonly offerCount = computed(() => this.catalogue.offers().length);
  readonly remoteSynced = this.catalogue.remoteSynced;
  readonly lastSavedAt = this.catalogue.lastSavedAt;
  readonly facebookStatus = signal<FacebookStatus | null>(null);
  readonly facebookError = signal('');

  constructor() {
    void this.loadFacebook();
  }

  private async loadFacebook(): Promise<void> {
    try {
      this.facebookStatus.set(await this.facebook.getSettings());
    } catch (err) {
      this.facebookError.set(err instanceof Error ? err.message : 'Could not load the Facebook connection.');
    }
  }
}
