import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
})
export class AdminShell {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly links = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/products', label: 'Products', exact: false },
    { path: '/admin/categories', label: 'Categories', exact: false },
    { path: '/admin/media', label: 'Images', exact: false },
  ];

  signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
