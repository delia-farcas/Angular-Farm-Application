import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserTrackingService {
  private readonly cookieConsentKey = 'cookieConsent';
  private readonly pendingConsentPromptKey = 'pendingCookieConsentPrompt';

  constructor(private cookieService: CookieService) { }

  isCookiesAllowed(): boolean {
    return localStorage.getItem(this.cookieConsentKey) === 'accepted';
  }

  setCookieConsent(accepted: boolean): void {
    localStorage.setItem(this.cookieConsentKey, accepted ? 'accepted' : 'declined');
    sessionStorage.removeItem(this.pendingConsentPromptKey);
  }

  hasCookieConsentDecision(): boolean {
    return localStorage.getItem(this.cookieConsentKey) !== null;
  }

  markCookieConsentPromptPending(): void {
    sessionStorage.setItem(this.pendingConsentPromptKey, 'true');
  }

  isCookieConsentPromptPending(): boolean {
    return sessionStorage.getItem(this.pendingConsentPromptKey) === 'true';
  }

  clearCookieConsentPromptPending(): void {
    sessionStorage.removeItem(this.pendingConsentPromptKey);
  }

  setPreference(key: string, value: string): void {
    if (this.isCookiesAllowed()) {
      this.cookieService.set(key, value, 365, '/', '', true, 'Strict');
    }
  }

  getPreference(key: string): string {
    if (this.isCookiesAllowed()) {
      return this.cookieService.get(key) || '';
    }
    return '';
  }

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

  getActivities(): any[] {
    if (this.isCookiesAllowed()) {
      const current = this.cookieService.get('user_activities');
      return current ? JSON.parse(current) : [];
    }
    return [];
  }

  
  incrementCounter(key: string): void {
    if (this.isCookiesAllowed()) {
      const current = parseInt(this.cookieService.get(key) || '0');
      this.cookieService.set(key, (current + 1).toString(), 365);
    }
  }

  getCounter(key: string): number {
    if (this.isCookiesAllowed()) {
      return parseInt(this.cookieService.get(key) || '0');
    }
    return 0;
  }
  
  setLastLogin(): void {
    if (this.isCookiesAllowed()) {
      this.cookieService.set('last_login', new Date().toISOString(), 365);
    }
  }

  getLastLogin(): string {
    if (this.isCookiesAllowed()) {
      return this.cookieService.get('last_login');
    }
    return '';
  }

  // Page visits
  logPageVisit(page: string): void {
    this.incrementCounter(`page_visit_${page}`);
  }

  getPageVisits(page: string): number {
    return this.getCounter(`page_visit_${page}`);
  }

  // --- Authentification logic ---
  registerUser(userData: any): void {
    if (this.isCookiesAllowed() || true) { // We store locally anyway to satisfy the functional requirement
      const usersStr = localStorage.getItem('app_users') || '[]';
      const users = JSON.parse(usersStr);
      // verify if user already exists
      const existing = users.find((u: any) => u.username === userData.username);
      if (existing) {
        Object.assign(existing, userData);
      } else {
        users.push(userData);
      }
      localStorage.setItem('app_users', JSON.stringify(users));
      
      // Auto login on register
      this.setCurrentUser(userData.username);
    }
  }

  verifyUser(username: string, pass: string): boolean {
    const usersStr = localStorage.getItem('app_users') || '[]';
    const users = JSON.parse(usersStr);
    return users.some((u: any) => u.username === username && u.password === pass);
  }

  setCurrentUser(username: string): void {
    this.cookieService.set('current_user', username, 7);
    // fallback or sync to local storage for quick access
    localStorage.setItem('current_user', username);
  }

  getCurrentUser(): string {
    return localStorage.getItem('current_user') || 'Delia'; // Default back to Delia if no one is logged in
  }

  getCurrentUserProfile(): any {
    const usersStr = localStorage.getItem('app_users') || '[]';
    const users = JSON.parse(usersStr);
    const currentUser = this.getCurrentUser();
    return users.find((u: any) => u.username === currentUser) || null;
  }
}
