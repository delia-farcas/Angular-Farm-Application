import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-options',
  imports: [],
  templateUrl: './user-options.html',
  styleUrl: './user-options.css',
})
export class UserOptions {
  
  constructor(private router: Router) {
  }  
  goToChat() {
    this.router.navigate(['/chat']);
  }
}
