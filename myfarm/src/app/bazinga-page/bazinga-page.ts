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

  navigateHome(): void {
    this.router.navigate(['home']);
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
