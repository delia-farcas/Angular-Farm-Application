import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class UserTrackingService {
  private readonly cookieConsentKey = 'cookieConsent';
  private readonly pendingConsentPromptKey = 'pendingCookieConsentPrompt';

  /** Instantiates the component and injects dependencies. */
  constructor(private cookieService: CookieService) {}

  /** Handles the Is cookies allowed functionality. */
  isCookiesAllowed(): boolean {
    return localStorage.getItem(this.cookieConsentKey) === 'accepted';
  }

  /** Sets the cookie consent. */
  setCookieConsent(accepted: boolean): void {
    localStorage.setItem(this.cookieConsentKey, accepted ? 'accepted' : 'declined');
    sessionStorage.removeItem(this.pendingConsentPromptKey);
  }

  /** Handles the Has cookie consent decision functionality. */
  hasCookieConsentDecision(): boolean {
    return localStorage.getItem(this.cookieConsentKey) !== null;
  }

  /** Handles the Mark cookie consent prompt pending functionality. */
  markCookieConsentPromptPending(): void {
    sessionStorage.setItem(this.pendingConsentPromptKey, 'true');
  }

  /** Handles the Is cookie consent prompt pending functionality. */
  isCookieConsentPromptPending(): boolean {
    return sessionStorage.getItem(this.pendingConsentPromptKey) === 'true';
  }

  /** Handles the Clear cookie consent prompt pending functionality. */
  clearCookieConsentPromptPending(): void {
    sessionStorage.removeItem(this.pendingConsentPromptKey);
  }

  /** Sets the preference. */
  setPreference(key: string, value: string): void {
    if (this.isCookiesAllowed()) {
      this.cookieService.set(key, value, 365, '/', '', true, 'Strict');
    }
  }

  /** Retrieves the preference. */
  getPreference(key: string): string {
    if (this.isCookiesAllowed()) {
      return this.cookieService.get(key) || '';
    }
    return '';
  }

  /** Handles the Log activity functionality. */
  logActivity(activity: string): void {
    if (this.isCookiesAllowed()) {
      const key = 'user_activities';
      const current = this.cookieService.get(key);
      const activities = current ? JSON.parse(current) : [];
      activities.push({ activity, timestamp: new Date().toISOString() });
      if (activities.length > 50) activities.shift();
      this.cookieService.set(key, JSON.stringify(activities), 30); // Expires in 30 days
    }
  }

  /** Retrieves the activities. */
  getActivities(): any[] {
    if (this.isCookiesAllowed()) {
      const current = this.cookieService.get('user_activities');
      return current ? JSON.parse(current) : [];
    }
    return [];
  }

  /** Handles the Increment counter functionality. */
  incrementCounter(key: string): void {
    if (this.isCookiesAllowed()) {
      const current = parseInt(this.cookieService.get(key) || '0');
      this.cookieService.set(key, (current + 1).toString(), 365);
    }
  }

  /** Retrieves the counter. */
  getCounter(key: string): number {
    if (this.isCookiesAllowed()) {
      return parseInt(this.cookieService.get(key) || '0');
    }
    return 0;
  }

  /** Sets the last login. */
  setLastLogin(): void {
    if (this.isCookiesAllowed()) {
      this.cookieService.set('last_login', new Date().toISOString(), 365);
    }
  }

  /** Retrieves the last login. */
  getLastLogin(): string {
    if (this.isCookiesAllowed()) {
      return this.cookieService.get('last_login');
    }
    return '';
  }

  /** Handles the Log page visit functionality. */
  logPageVisit(page: string): void {
    this.incrementCounter(`page_visit_${page}`);
  }

  /** Retrieves the page visits. */
  getPageVisits(page: string): number {
    return this.getCounter(`page_visit_${page}`);
  }

  /** Handles the Register user functionality. */
  registerUser(userData: any): void {
    if (this.isCookiesAllowed() || true) {
      const usersStr = localStorage.getItem('app_users') || '[]';
      const users = JSON.parse(usersStr);

      const existing = users.find((u: any) => u.username === userData.username);
      if (existing) {
        Object.assign(existing, userData);
      } else {
        users.push(userData);
      }
      localStorage.setItem('app_users', JSON.stringify(users));

      this.setCurrentUser(userData.username);
    }
  }

  /** Handles the Verify user functionality. */
  verifyUser(username: string, pass: string): boolean {
    const usersStr = localStorage.getItem('app_users') || '[]';
    const users = JSON.parse(usersStr);
    return users.some((u: any) => u.username === username && u.password === pass);
  }

  /** Sets the current user. */
  setCurrentUser(username: string): void {
    this.cookieService.set('current_user', username, 7);

    localStorage.setItem('current_user', username);
  }

  /** Retrieves the current user. */
  getCurrentUser(): string {
    return localStorage.getItem('current_user') || 'Delia'; // Default back to Delia if no one is logged in
  }

  /** Retrieves the current user profile. */
  getCurrentUserProfile(): any {
    const usersStr = localStorage.getItem('app_users') || '[]';
    const users = JSON.parse(usersStr);
    const currentUser = this.getCurrentUser();
    return users.find((u: any) => u.username === currentUser) || null;
  }
}
