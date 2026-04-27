import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-bazinga-page',
  standalone: true,
  imports: [],
  templateUrl: './bazinga-page.html',
  styleUrl: './bazinga-page.css',
})
export class BazingaPage {
  /** Instantiates the component and injects dependencies. */
  constructor(private router: Router) {}

  /** Navigates to home. */
  navigateHome(): void {
    this.router.navigate(['home']);
  }
  /** Navigates to to raports. */
  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }
}
