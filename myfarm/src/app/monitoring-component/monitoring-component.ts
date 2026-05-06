import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserTrackingService } from '../services/user-tracking.service';
import { ActivityList } from '../activity-list/activity-list';
import { UserOptions } from '../user-options/user-options';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, ActivityList, UserOptions],
  templateUrl: './monitoring-component.html',
  styleUrl: './monitoring-component.css'
})
export class MonitoringComponent implements OnInit {
  private router = inject(Router);
  private trackingService = inject(UserTrackingService);

  currentUsername = this.trackingUsername();
  isMenuOpen = false;

  private trackingUsername(): string {
    return this.trackingService.getCurrentUser() || '';
  }

  ngOnInit(): void {
    if (!this.trackingService.isCurrentUserAdmin()) {
      this.router.navigate(['home']);
    }
  }

  isAdmin(): boolean {
    return this.trackingService.isCurrentUserAdmin();
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateHome(): void {
    this.router.navigate(['home']);
  }

  navigateToUsers(): void {
    this.router.navigate(['users']);
  }

  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }
}