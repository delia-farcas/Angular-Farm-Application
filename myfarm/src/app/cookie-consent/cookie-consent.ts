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

  constructor(
    private trackingService: UserTrackingService,
    private router: Router
  ) {}

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

  acceptCookies() {
    this.trackingService.setCookieConsent(true);
    this.showPopup = false;
  }

  declineCookies() {
    this.trackingService.setCookieConsent(false);
    this.showPopup = false;
  }

  private updateVisibility(url: string) {
    const onHomePage = this.normalizeUrl(url) === '/home';
    const shouldShow =
      onHomePage &&
      //!this.trackingService.hasCookieConsentDecision() &&
      this.trackingService.isCookieConsentPromptPending();

    this.showPopup = shouldShow;

    if (onHomePage) {
      this.trackingService.clearCookieConsentPromptPending();
    }
  }

  private normalizeUrl(url: string): string {
    if (!url) {
      return '/';
    }

    return url.split('?')[0].split('#')[0] || '/';
  }

  private isAutomationEnvironment(): boolean {
    return typeof navigator !== 'undefined' && navigator.webdriver;
  }
}
