import { Injectable, signal } from '@angular/core';

const SESSION_KEY = 'eastlanka-admin';
const CREDENTIAL_KEY = 'eastlanka-admin-credential';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  readonly loggedIn = signal(readSession());

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  async login(password: string): Promise<string | null> {
    let response: Response;
    try {
      response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
    } catch {
      return 'Sign-in is unavailable. Start the site with npm start.';
    }

    const text = await response.text();
    let data: { error?: string; ok?: boolean } = {};
    try {
      data = text ? (JSON.parse(text) as { error?: string; ok?: boolean }) : {};
    } catch {
      return 'Sign-in is unavailable. Start the site with npm start.';
    }

    if (!response.ok || !data.ok) {
      return data.error || 'That password is not correct.';
    }

    writeSession(true);
    writeCredential(password);
    this.loggedIn.set(true);
    return null;
  }

  credential(): string {
    return readCredential();
  }

  logout(): void {
    writeSession(false);
    writeCredential('');
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

function readCredential(): string {
  try {
    return sessionStorage.getItem(CREDENTIAL_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeCredential(password: string): void {
  try {
    if (password) {
      sessionStorage.setItem(CREDENTIAL_KEY, password);
    } else {
      sessionStorage.removeItem(CREDENTIAL_KEY);
    }
  } catch {
    // Private browsing can block storage.
  }
}
