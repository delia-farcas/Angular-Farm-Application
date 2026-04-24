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

  constructor(
    private router: Router,
    private trackingService: UserTrackingService
  ) {}

  showWelcome() {
    this.currentPage = 'welcome';
  }

  showLogin() {
    this.currentPage = 'login';
  }

  showSignup() {
    this.currentPage = 'signup';
  }

  navigateToDashboard() {
    this.trackingService.markCookieConsentPromptPending();
    this.router.navigate(['home']);
  }
}
