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

  constructor(private router: Router) {}

  navigatetoAddAnimal(): void {
    this.router.navigate(['add']);
  }

  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }
}
