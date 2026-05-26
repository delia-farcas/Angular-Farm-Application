import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { UserTrackingService } from './user-tracking.service';
import { fromEvent, merge, Subscription, throttleTime } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InactivityTimerService {
  private router = inject(Router);
  private trackingService = inject(UserTrackingService);
  private ngZone = inject(NgZone);

  private readonly INACTIVITY_TIMEOUT = 900000;
  private timeoutId: any;
  private activitySubscription?: Subscription;

  startMonitoring(): void {
    this.stopMonitoring();

    this.ngZone.runOutsideAngular(() => {
      const activityEvents$ = merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'click'),
        fromEvent(window, 'keypress'),
        fromEvent(window, 'scroll'),
        fromEvent(window, 'touchstart'),
      ).pipe(throttleTime(2000));

      this.activitySubscription = activityEvents$.subscribe(() => {
        this.ngZone.run(() => {
          this.resetTimer();
        });
      });
    });

    this.resetTimer();
  }

  stopMonitoring(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
  }

  private resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const token = sessionStorage.getItem('token');

    if (!token) {
      return;
    }

    this.timeoutId = setTimeout(() => {
      this.handleLogoutDueToInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }

  private handleLogoutDueToInactivity(): void {
    this.stopMonitoring();
    this.trackingService.logout();

    this.ngZone.run(() => {
      alert('Sesiunea a expirat din cauza inactivității. Te rugăm să te reautentifici.');
      this.router.navigate(['/login']);
    });
  }
}
