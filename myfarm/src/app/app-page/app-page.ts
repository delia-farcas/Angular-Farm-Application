import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPage } from '../list-page/list-page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-page',
  standalone: true,
  imports: [ListPage, CommonModule],
  templateUrl: './app-page.html',
  styleUrls: ['./app-page.css'],
})
export class AppPage {
  /** Instantiates the component and injects dependencies. */
  constructor(private router: Router) {}

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
}
