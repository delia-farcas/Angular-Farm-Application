import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class UserTrackingService {
  private cookieService = inject(CookieService);

  private readonly cookieConsentKey = 'cookieConsent';
  private readonly pendingConsentPromptKey = 'pendingCookieConsentPrompt';

  isCookiesAllowed(): boolean {
    return localStorage.getItem(this.cookieConsentKey) === 'accepted';
  }

  setCookieConsent(accepted: boolean): void {
    localStorage.setItem(this.cookieConsentKey, accepted ? 'accepted' : 'declined');
    sessionStorage.removeItem(this.pendingConsentPromptKey);
  }

  markCookieConsentPromptPending(): void {
    sessionStorage.setItem(this.pendingConsentPromptKey, 'true');
  }

  clearCookieConsentPromptPending(): void {
    sessionStorage.removeItem(this.pendingConsentPromptKey);
  }

  isCookieConsentPromptPending(): boolean {
    return sessionStorage.getItem(this.pendingConsentPromptKey) === 'true';
  }

  logPageVisit(url: string): void {
    this.logActivity(`Visited: ${url}`);
  }

  incrementCounter(key: string): void {
    const currentValue = parseInt(this.getPreference(key) || '0', 10);
    this.setPreference(key, (currentValue + 1).toString());
  }

  setCurrentUser(username: string, userRole?: string, userId?: number): void {
    localStorage.setItem('current_user', username);
    localStorage.setItem('current_user_role', userRole || 'ROLE_USER');
    if (userId !== undefined) {
      localStorage.setItem('current_user_id', userId.toString());
    }

    if (this.isCookiesAllowed()) {
      this.cookieService.set('current_user', username, 7, '/');
      if (userId !== undefined) {
        this.cookieService.set('current_user_id', userId.toString(), 7, '/');
      }
    }
  }

  getCurrentUser(): string {
    return localStorage.getItem('current_user') || 'Oaspete';
  }

  getCurrentUserId(): number {
    const id = localStorage.getItem('current_user_id');
    return id ? parseInt(id, 10) : -1;
  }

  getCurrentUserRole(): string {
    return localStorage.getItem('current_user_role') || 'ROLE_USER';
  }

  isCurrentUserAdmin(): boolean {
    return this.getCurrentUserRole() === 'ROLE_ADMIN';
  }

  logout(): void {
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_user_id');
    localStorage.removeItem('current_user_role');
    sessionStorage.removeItem('token');
    this.cookieService.delete('current_user', '/');
    this.cookieService.delete('current_user_id', '/');
  }

  setLastLogin(): void {
    if (this.isCookiesAllowed()) {
      this.cookieService.set('last_login', new Date().toISOString(), 365, '/');
    }
  }

  logActivity(activity: string): void {
    if (this.isCookiesAllowed()) {
      const key = 'user_activities';
      const current = this.cookieService.get(key);
      const activities = current ? JSON.parse(current) : [];
      activities.push({ activity, timestamp: new Date().toISOString() });

      if (activities.length > 50) activities.shift();
      this.cookieService.set(key, JSON.stringify(activities), 30, '/');
    }
  }

  setPreference(key: string, value: string): void {
    if (this.isCookiesAllowed()) {
      this.cookieService.set(key, value, 365, '/');
    }
  }

  getPreference(key: string): string {
    if (this.isCookiesAllowed()) {
      return this.cookieService.get(key) || '';
    }
    return '';
  }
}
