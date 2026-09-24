import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.html',
})
export class AdminLogin {
  private readonly auth = inject(AdminAuthService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly password = signal('');
  readonly error = signal('');

  constructor() {
    this.seo.apply({
      title: 'Admin sign in | East Lanka',
      description: 'Sign in to the East Lanka catalogue admin.',
      path: '/admin/login',
      noindex: true,
    });
    if (this.auth.isLoggedIn()) {
      void this.router.navigateByUrl(this.returnUrl());
    }
  }

  onPassword(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
    this.error.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    if (!this.auth.login(this.password())) {
      this.error.set('That password is not correct.');
      return;
    }
    void this.router.navigateByUrl(this.returnUrl());
  }

  private returnUrl(): string {
    const value = this.route.snapshot.queryParamMap.get('returnUrl');
    return value && value.startsWith('/admin') ? value : '/admin';
  }
}
