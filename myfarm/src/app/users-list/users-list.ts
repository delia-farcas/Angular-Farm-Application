import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserTrackingService } from '../services/user-tracking.service';
import { UserList } from '../user-list/user-list';
import { UserOptions } from '../user-options/user-options';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, UserList, UserOptions],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList implements OnInit {
  private router = inject(Router);
  private trackingService = inject(UserTrackingService);

  currentUsername = this.trackingService.getCurrentUser();
  isMenuOpen = false;

  ngOnInit(): void {
    if (!this.trackingService.isCurrentUserAdmin()) {
      this.router.navigate(['home']);
    }
  }

  isAdmin(): boolean {
    return this.trackingService.isCurrentUserAdmin();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }

  navigateHome(): void {
    this.router.navigate(['home']);
  }

  toggleNav(): void {
    document.body.classList.toggle('nav-open');
  }

  closeNav(): void {
    document.body.classList.remove('nav-open');
  }
}
