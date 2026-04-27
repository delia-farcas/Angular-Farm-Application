import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginPage } from '../login-page/login-page';
import { SignupPage } from '../signup-page/signup-page';
import { WelcomePage } from '../welcome-page/welcome-page';
import { UserTrackingService } from '../services/user-tracking.service';

@Component({
  selector: 'app-starting-page',
  standalone: true,
  imports: [CommonModule, WelcomePage, LoginPage, SignupPage],
  templateUrl: './starting-page.html',
  styleUrl: './starting-page.css',
})
export class StartingPage {
  currentPage: 'welcome' | 'login' | 'signup' = 'welcome';

  /** Instantiates the component and injects dependencies. */
  constructor(
    private router: Router,
    private trackingService: UserTrackingService,
  ) {}

  /** Handles the Show welcome functionality. */
  showWelcome() {
    this.currentPage = 'welcome';
  }

  /** Handles the Show login functionality. */
  showLogin() {
    this.currentPage = 'login';
  }

  /** Handles the Show signup functionality. */
  showSignup() {
    this.currentPage = 'signup';
  }

  /** Navigates to to dashboard. */
  navigateToDashboard() {
    this.trackingService.markCookieConsentPromptPending();
    this.router.navigate(['home']);
  }
}
