import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTrackingService } from '../services/user-tracking.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.css',
})
export class CookieConsent implements OnInit {
  showPopup = false;

  constructor(private trackingService: UserTrackingService, private router: Router) {}

  ngOnInit() {
    console.log('CookieConsent component initialized');
    
    // TEMP: Clear consent for testing
    localStorage.removeItem('cookieConsent');
    console.log('Cleared consent for testing');
    
    // Check consent on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('NavigationEnd event:', event.url);
      this.checkConsent(event.url);
    });

    // Also check on initial load with a small delay to ensure router is ready
    setTimeout(() => {
      console.log('Initial check with URL:', this.router.url);
      this.checkConsent(this.router.url);
    }, 100);
  }

  private checkConsent(url: string) {
    console.log('Checking consent for URL:', url);
    const consent = localStorage.getItem('cookieConsent');
    console.log('Current consent:', consent);
    // Show popup if no consent given and URL is not the starting page
    if (!consent && url !== '/') {
      console.log('Showing popup for URL:', url);
      this.showPopup = true;
    } else {
      console.log('Not showing popup. Consent:', consent, 'URL:', url);
      this.showPopup = false;
    }
  }

  acceptCookies() {
    console.log('Accept cookies clicked');
    this.trackingService.setCookieConsent(true);
    this.showPopup = false;
  }

  declineCookies() {
    console.log('Decline cookies clicked');
    this.trackingService.setCookieConsent(false);
    this.showPopup = false;
  }
}
