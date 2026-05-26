import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { UserTrackingService } from './services/user-tracking.service';
import { CookieConsent } from './cookie-consent/cookie-consent';
import { InactivityTimerService } from './services/inactivity-timer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CookieConsent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('myfarm');
  private inactivityTimerService = inject(InactivityTimerService);

  constructor(
    private router: Router,
    private trackingService: UserTrackingService,
  ) {}

  ngOnInit() {
    this.inactivityTimerService.startMonitoring();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackingService.logPageVisit(event.url);
      });
  }
}
