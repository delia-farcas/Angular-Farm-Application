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

  constructor(private router: Router) {}

  goToLunarReports(): void {
    this.currentPage = 'lunar';
  }

  goToYearlyReports(): void {
    this.currentPage = 'yearly';
  }

  navigateHome(): void {
    this.router.navigate(['home']);
  }
  
  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }
}
