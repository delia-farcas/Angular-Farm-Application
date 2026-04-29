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


  setCurrentUser(username: string): void {
    localStorage.setItem('current_user', username);
    
    if (this.isCookiesAllowed()) {
      this.cookieService.set('current_user', username, 7, '/');
    }
  }

  getCurrentUser(): string {
    return localStorage.getItem('current_user') || 'Oaspete';
  }

  logout(): void {
    localStorage.removeItem('current_user');
    this.cookieService.delete('current_user', '/');
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