import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard {
  private readonly catalogue = inject(ProductService);

  readonly productCount = computed(() => this.catalogue.products().length);
  readonly categoryCount = computed(() => this.catalogue.categories().length);
  readonly offerCount = computed(() => this.catalogue.offers().length);
  readonly remoteSynced = this.catalogue.remoteSynced;
  readonly lastSavedAt = this.catalogue.lastSavedAt;
}
