import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart.service';
import { formatLkr } from '../../core/utils/money';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-order-bar',
  imports: [RouterLink, Icon],
  templateUrl: './order-bar.html',
})
export class OrderBar {
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);

  readonly count = this.cart.count;
  readonly total = this.cart.total;
  readonly hidden = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/order') || event.urlAfterRedirects.startsWith('/admin')),
      startWith(this.router.url.startsWith('/order') || this.router.url.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/order') || this.router.url.startsWith('/admin') },
  );
  protected formatLkr = formatLkr;
}
