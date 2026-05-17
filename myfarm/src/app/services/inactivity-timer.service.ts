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

  // 15 minute exprimate în milisecunde (15 * 60 * 1000)
  private readonly INACTIVITY_TIMEOUT = 10000; 
  private timeoutId: any;
  private activitySubscription?: Subscription;

  /** Pornește monitorizarea activității (se apelează la pornirea aplicației) */
  startMonitoring(): void {
    // Curățăm un eventual timer vechi
    this.stopMonitoring();

    // Rulăm în afara NgZone pentru a nu declanșa cicluri inutile de Change Detection în Angular la fiecare mișcare de mouse
    this.ngZone.runOutsideAngular(() => {
      // Ascultăm evenimentele care indică faptul că utilizatorul e activ
      const activityEvents$ = merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'click'),
        fromEvent(window, 'keypress'),
        fromEvent(window, 'scroll'),
        fromEvent(window, 'touchstart')
      ).pipe(
        throttleTime(2000) // Verificăm evenimentele o dată la 2 secunde, ca să nu supraîncărcăm procesorul
      );

      this.activitySubscription = activityEvents$.subscribe(() => {
        this.ngZone.run(() => {
          this.resetTimer();
        });
      });
    });

    this.resetTimer();
  }

  /** Oprește monitorizarea (util la logout) */
  stopMonitoring(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
  }

  /** Resetează ceasul de la 0 de fiecare dată când utilizatorul mișcă mouse-ul sau scrie ceva */
  private resetTimer(): void {
  if (this.timeoutId) {
    clearTimeout(this.timeoutId);
  }

  // Verificăm direct token-ul din sesiune
  const token = sessionStorage.getItem('token');
  
  if (!token) {
    return; // Nu ești logată, nu pornim cronometrul
  }

  this.timeoutId = setTimeout(() => {
    this.handleLogoutDueToInactivity();
  }, this.INACTIVITY_TIMEOUT);
}

  /** Acțiunea care se execută când timpul a expirat */
  private handleLogoutDueToInactivity(): void {
    console.log('[TIMER] Executăm curățarea datelor din sesiune...');
    this.stopMonitoring();
    this.trackingService.logout();

    // Forțăm Angular să reintre în zona lui principală pentru a actualiza interfața grafică (UI)
    this.ngZone.run(() => {
      console.log('[TIMER] Afișăm alerta pe ecran.');
      alert('Sesiunea a expirat din cauza inactivității. Te rugăm să te reautentifici.');

      console.log('[TIMER] Navigăm către /login...');
      this.router.navigate(['/login']);
    });
  }
}