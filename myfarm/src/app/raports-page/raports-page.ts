import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LunarReports } from '../lunar-reports/lunar-reports';
import { YearlyReports } from '../yearly-reports/yearly-reports';
import { UserOptions } from '../user-options/user-options';
import { UserTrackingService } from '../services/user-tracking.service';

@Component({
  selector: 'app-raports-page',
  standalone: true,
  imports: [CommonModule, LunarReports, YearlyReports, UserOptions],
  templateUrl: './raports-page.html',
  styleUrl: './raports-page.css',
})
export class RaportsPage {
  currentPage: 'lunar' | 'yearly' = 'lunar';
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

  /** Handles the Go to lunar reports functionality. */
  goToLunarReports(): void {
    this.currentPage = 'lunar';
  }

  /** Handles the Go to yearly reports functionality. */
  goToYearlyReports(): void {
    this.currentPage = 'yearly';
  }

  /** Navigates to home. */
  navigateHome(): void {
    this.router.navigate(['home']);
  }

  /** Navigates to to bazinga. */
  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToUsers(): void {
    this.router.navigate(['users']);
  }

  navigateToActivity(): void {
    this.router.navigate(['activity']);
  }
}
