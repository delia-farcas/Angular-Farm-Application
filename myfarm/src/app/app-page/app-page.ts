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

  navigatetoAddAnimal(): void {
    this.router.navigate(['add']);
  }

  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }

  navigateToUsers(): void {
    this.router.navigate(['users']);
  }

  navigateToActivity(): void {
    this.router.navigate(['activity']);
  }
}
