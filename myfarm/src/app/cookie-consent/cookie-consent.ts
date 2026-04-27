import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { UserTrackingService } from '../services/user-tracking.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.css',
})
export class CookieConsent implements OnInit {
  showPopup = false;

  /** Instantiates the component and injects dependencies. */
  constructor(
    private trackingService: UserTrackingService,
    private router: Router,
  ) {}

  /** Initializes the component. */
  ngOnInit() {
    if (this.isAutomationEnvironment()) {
      return;
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateVisibility(event.urlAfterRedirects);
      });

    this.updateVisibility(this.router.url);
  }

  /** Handles the Accept cookies functionality. */
  acceptCookies() {
    this.trackingService.setCookieConsent(true);
    this.showPopup = false;
  }

  /** Handles the Decline cookies functionality. */
  declineCookies() {
    this.trackingService.setCookieConsent(false);
    this.showPopup = false;
  }

  /** Handles the Update visibility functionality. */
  private updateVisibility(url: string) {
    const onHomePage = this.normalizeUrl(url) === '/home';
    const shouldShow = onHomePage && this.trackingService.isCookieConsentPromptPending();

    this.showPopup = shouldShow;

    if (onHomePage) {
      this.trackingService.clearCookieConsentPromptPending();
    }
  }

  /** Handles the Normalize url functionality. */
  private normalizeUrl(url: string): string {
    if (!url) {
      return '/';
    }

    return url.split('?')[0].split('#')[0] || '/';
  }

  /** Handles the Is automation environment functionality. */
  private isAutomationEnvironment(): boolean {
    return typeof navigator !== 'undefined' && navigator.webdriver;
  }
}
