import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { WhatsAppService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  readonly site = SITE_CONFIG;
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
  readonly menuOpen = signal(false);

  readonly links = [
    { path: '/products', label: 'Products' },
    { path: '/categories', label: 'Categories' },
    { path: '/new-arrivals', label: 'New Arrivals' },
    { path: '/offers', label: 'Offers' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
