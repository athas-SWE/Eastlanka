import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { CartService } from '../../core/services/cart.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CloudinaryUrlPipe, Icon],
  templateUrl: './header.html',
})
export class Header {
  readonly site = SITE_CONFIG;
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
  readonly cartCount = inject(CartService).count;
  readonly loggedIn = inject(AdminAuthService).loggedIn;
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);

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

  search(event: Event): void {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const q = String(data.get('q') ?? '').trim();
    this.closeMenu();
    void this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
  }
}
