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

  logout() {
    this.router.navigate(['/login']).then((navigatCuSucces) => {
      if (navigatCuSucces) {
        this.trackingService.logout();
      }
    });
  }
}
