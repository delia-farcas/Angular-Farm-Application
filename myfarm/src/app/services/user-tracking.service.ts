import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserTrackingService {

  constructor(private cookieService: CookieService) { }

  setPreference(key: string, value: string): void {
  this.cookieService.set(key, value, 365, '/', '', true, 'Strict');
}
  getPreference(key: string): string {
    return this.cookieService.get(key) || '';
}

  logActivity(activity: string): void {
    const key = 'user_activities';
    const current = this.cookieService.get(key);
    const activities = current ? JSON.parse(current) : [];
    activities.push({ activity, timestamp: new Date().toISOString() });
    // Keep only last 50 activities to avoid cookie size limit
    if (activities.length > 50) activities.shift();
    this.cookieService.set(key, JSON.stringify(activities), 30); // Expires in 30 days
  }

  getActivities(): any[] {
    const current = this.cookieService.get('user_activities');
    return current ? JSON.parse(current) : [];
  }

  
  incrementCounter(key: string): void {
    const current = parseInt(this.cookieService.get(key) || '0');
    this.cookieService.set(key, (current + 1).toString(), 365);
  }

  getCounter(key: string): number {
    return parseInt(this.cookieService.get(key) || '0');
  }
  
  setLastLogin(): void {
    this.cookieService.set('last_login', new Date().toISOString(), 365);
  }

  getLastLogin(): string {
    return this.cookieService.get('last_login');
  }

  // Page visits
  logPageVisit(page: string): void {
    this.incrementCounter(`page_visit_${page}`);
  }

  getPageVisits(page: string): number {
    return this.getCounter(`page_visit_${page}`);
  }
}