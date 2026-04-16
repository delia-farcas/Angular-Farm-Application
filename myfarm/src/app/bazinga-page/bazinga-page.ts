import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-bazinga-page',
  imports: [],
  templateUrl: './bazinga-page.html',
  styleUrl: './bazinga-page.css',
})
export class BazingaPage {
  constructor(private router: Router) {}
  
  navigateHome(): void {
    this.router.navigate(['home']);
  }
  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }
}
