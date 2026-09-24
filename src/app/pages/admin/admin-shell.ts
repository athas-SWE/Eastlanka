import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { SeoService } from '../../core/services/seo.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './admin-shell.html',
})
export class AdminShell {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'Admin | East Lanka',
      description: 'East Lanka catalogue admin.',
      path: '/admin',
      noindex: true,
    });
  }

  readonly links = [
    { path: '/admin', label: 'Dashboard', exact: true, icon: 'grid' as const },
    { path: '/admin/products', label: 'Products', exact: false, icon: 'box' as const },
    { path: '/admin/categories', label: 'Categories', exact: false, icon: 'tag' as const },
    { path: '/admin/media', label: 'Images', exact: false, icon: 'image' as const },
  ];

  signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
