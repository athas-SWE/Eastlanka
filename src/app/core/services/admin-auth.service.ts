import { Injectable, signal } from '@angular/core';
import { SITE_CONFIG } from '../data/site-config';

const SESSION_KEY = 'eastlanka-admin';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  readonly loggedIn = signal(readSession());

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  login(password: string): boolean {
    if (password !== SITE_CONFIG.adminPassword) {
      return false;
    }

    writeSession(true);
    this.loggedIn.set(true);
    return true;
  }

  logout(): void {
    writeSession(false);
    this.loggedIn.set(false);
  }
}

function readSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSession(value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Private browsing can block storage.
  }
}
