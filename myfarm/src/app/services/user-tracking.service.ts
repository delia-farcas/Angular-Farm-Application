import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserTrackingService {

  constructor(private cookieService: CookieService) { }

  isCookiesAllowed(): boolean {
    return localStorage.getItem('cookieConsent') === 'accepted';
  }

  setCookieConsent(accepted: boolean): void {
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'declined');
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
      // Keep only last 50 activities to avoid cookie size limit
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
}