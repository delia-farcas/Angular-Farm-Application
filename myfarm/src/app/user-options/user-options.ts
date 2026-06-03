import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserTrackingService } from '../services/user-tracking.service';
@Component({
  selector: 'app-user-options',
  imports: [],
  templateUrl: './user-options.html',
  styleUrl: './user-options.css',
})
export class UserOptions {
  private trackingService = inject(UserTrackingService);
  constructor(private router: Router) {}
  goToChat() {
    this.router.navigate(['/chat']);
  }

  async logout(): Promise<void> {
    const navigatCuSucces = await this.router.navigate(['/login']);
    if (navigatCuSucces) {
      this.trackingService.logout();
    }
  }
}
