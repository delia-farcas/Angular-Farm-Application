import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LunarReports } from '../lunar-reports/lunar-reports';
import { YearlyReports } from '../yearly-reports/yearly-reports';

@Component({
  selector: 'app-raports-page',
  standalone: true,
  imports: [LunarReports, YearlyReports],
  templateUrl: './raports-page.html',
  styleUrl: './raports-page.css',
})
export class RaportsPage {
  currentPage: 'lunar' | 'yearly' = 'lunar';

  /** Instantiates the component and injects dependencies. */
  constructor(private router: Router) {}

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
}
