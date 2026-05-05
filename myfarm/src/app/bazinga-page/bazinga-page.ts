import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserOptions } from '../user-options/user-options';
import { UserTrackingService } from '../services/user-tracking.service';
@Component({
  selector: 'app-bazinga-page',
  standalone: true,
  imports: [CommonModule, UserOptions],
  templateUrl: './bazinga-page.html',
  styleUrl: './bazinga-page.css',
})
export class BazingaPage {
  isMenuOpen = false;

  /** Instantiates the component and injects dependencies. */
  constructor(
    private router: Router,
    private trackingService: UserTrackingService,
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isAdmin(): boolean {
    return this.trackingService.isCurrentUserAdmin();
  }

  /** Navigates to home. */
  navigateHome(): void {
    this.router.navigate(['home']);
  }
  /** Navigates to to raports. */
  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }

  navigateToUsers(): void {
    this.router.navigate(['users']);
  }
}
