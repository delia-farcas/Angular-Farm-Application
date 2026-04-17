import { Component } from '@angular/core';
import { WelcomePage } from '../welcome-page/welcome-page';
import { LoginPage } from '../login-page/login-page';
import { SignupPage } from '../signup-page/signup-page';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 1. Importă Router


@Component({
  selector: 'app-starting-page',
  standalone: true,
  imports: [CommonModule, WelcomePage, LoginPage, SignupPage],
  templateUrl: './starting-page.html',
  styleUrl: './starting-page.css',
})
export class StartingPage {
  // Starea inițială: arătăm pagina de Welcome
  currentPage: 'welcome' | 'login' | 'signup' = 'welcome';

  showWelcome() {
    this.currentPage = 'welcome';
  }

  showLogin() {
    this.currentPage = 'login';
  }

  showSignup() {
    this.currentPage = 'signup';
  }

  constructor(private router: Router) {}

  navigateToDashboard() {
  console.log('Părintele a primit semnalul! Navigăm spre home...');
  this.router.navigate(['home']);
 }

}
