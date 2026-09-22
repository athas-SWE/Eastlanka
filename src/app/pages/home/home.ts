import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { ProductService } from '../../core/services/product.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductGrid, CloudinaryUrlPipe],
  templateUrl: './home.html',
})
export class Home {
  private readonly catalogue = inject(ProductService);

  readonly site = SITE_CONFIG;
  readonly categories = this.catalogue.categories;
  readonly arrivals = computed(() => this.catalogue.newArrivals().slice(0, 3));
  readonly productCount = computed(() => this.catalogue.products().length);
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();

  readonly reasons = [
    { label: 'Shop', title: 'Quality Products', text: 'Chosen for daily use, not just for a feed.' },
    { label: 'Discover', title: 'New Finds', text: 'The same pieces we highlight on Facebook and Instagram.' },
    { label: 'Upgrade', title: 'Great Prices', text: 'Clear rupee prices before you message us.' },
    { label: 'Live Better', title: 'Trusted Support', text: 'Questions go straight to WhatsApp — no ticket queue.' },
  ];
}
