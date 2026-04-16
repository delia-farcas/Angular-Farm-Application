import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPage } from '../list-page/list-page';
import { ManagePage } from '../manage-page/manage-page';
import { AddAnimal } from '../add-animal/add-animal';
import { Router } from '@angular/router';
import { Animal } from '../models/animal';

@Component({
  selector: 'app-app-page',
  standalone: true,
  imports: [ListPage, ManagePage, AddAnimal, CommonModule],
  templateUrl: './app-page.html',
  styleUrls: ['./app-page.css'],
})
export class AppPage {
  currentPage: 'home' | 'manage' | 'add' = 'home';
  animalBeingEdited: Animal | null = null;

  constructor(private router: Router) {}

  showManage(): void {
    this.animalBeingEdited = null;
    this.currentPage = 'manage';
  }

  showHome(): void {
    this.animalBeingEdited = null;
    this.currentPage = 'home';
  }

  showAddAnimal(): void {
    this.animalBeingEdited = null;
    this.currentPage = 'add';
  }

  onEditAnimal(animal: Animal): void {
    this.animalBeingEdited = animal;
    this.currentPage = 'add';
  }

  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }
}

// Keep this component only if used elsewhere
export class DashboardComponent {
  userName = 'Delia';
}