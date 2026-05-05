import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPage } from '../list-page/list-page';
import { Router } from '@angular/router';
import { UserOptions } from '../user-options/user-options';
import { UserTrackingService } from '../services/user-tracking.service';
@Component({
  selector: 'app-app-page',
  standalone: true,
  imports: [ListPage, UserOptions, CommonModule],
  templateUrl: './app-page.html',
  styleUrls: ['./app-page.css'],
})
export class AppPage {
  /** Instantiates the component and injects dependencies. */
  constructor(
    private router: Router,
    private trackingService: UserTrackingService,
  ) {}
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isAdmin(): boolean {
    return this.trackingService.isCurrentUserAdmin();
  }

  /** Navigates to To add animal. */
  navigatetoAddAnimal(): void {
    this.router.navigate(['add']);
  }

  /** Navigates to to bazinga. */
  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  /** Navigates to to raports. */
  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }

  navigateToUsers(): void {
    this.router.navigate(['users']);
  }
}
