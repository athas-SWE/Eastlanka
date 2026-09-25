import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SITE_CONFIG } from '../../core/data/site-config';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './bottom-nav.html',
})
export class BottomNav {
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);

  readonly site = SITE_CONFIG;
  readonly count = this.cart.count;
  readonly saved = inject(FavoritesService).count;
  readonly remaining = this.cart.remainingForFreeDelivery;
  readonly freeDelivery = this.cart.freeDelivery;
  readonly hidden = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/admin')),
      startWith(this.router.url.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/admin') },
  );
  readonly onOrder = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/order')),
      startWith(this.router.url.startsWith('/order')),
    ),
    { initialValue: this.router.url.startsWith('/order') },
  );
}
