import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../core/data/categories';
import { SITE_CONFIG } from '../../core/data/site-config';
import { ProductService } from '../../core/services/product.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { ProductGrid } from '../../shared/product-grid/product-grid';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductGrid],
  templateUrl: './home.html',
})
export class Home {
  readonly site = SITE_CONFIG;
  readonly categories = CATEGORIES;
  readonly arrivals = inject(ProductService).newArrivals().slice(0, 3);
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();

  readonly reasons = [
    { title: 'Quality Products', text: 'Chosen for daily use, not just for a feed.' },
    { title: 'Great Prices', text: 'Clear rupee prices before you message us.' },
    { title: 'Fast Delivery', text: 'We confirm stock, then arrange delivery with you.' },
    { title: 'Trusted Support', text: 'Questions go straight to WhatsApp — no ticket queue.' },
  ];
}
