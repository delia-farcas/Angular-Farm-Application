import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { AnimalCardComponent } from '../animal-card/animal-card';
import { UserTrackingService } from '../services/user-tracking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimalCardComponent],
  templateUrl: './list-page.html',
  styleUrl: './list-page.css',
})
export class ListPage {
  @Output() goToManage = new EventEmitter<void>();
  @Output() goToAddAnimal = new EventEmitter<void>();

  private trackingService = inject(UserTrackingService);
  currentUsername: string = 'Delia';

  /** Instantiates the component and injects dependencies. */
  constructor(
    private animalService: AnimalService,
    private router: Router,
  ) {}
  animals: Animal[] = [];
  selectedType: 'toate' | 'vaca' | 'porc' | 'gaina' | 'cal' | 'oaie' | 'capra' = 'toate';

  /** Initializes the component. */
  ngOnInit() {
    this.currentUsername = this.trackingService.getCurrentUser();
    this.animals = this.animalService.getAnimals();
  }

  get filteredAnimals(): Animal[] {
    if (this.selectedType === 'toate') {
      return this.animals;
    }
    return this.animals.filter((a) => a.type === this.selectedType);
  }

  /** Handles the Delete animal functionality. */
  deleteAnimal(id: number) {
    const confirmed = window.confirm('Sigur vrei să ștergi animalul?');
    if (!confirmed) return;
    this.animalService.deleteAnimal(id);
    this.animals = this.animalService.getAnimals();
  }

  /** Handles the Edit animal functionality. */
  editAnimal(animal: Animal) {
    this.router.navigate(['add'], { state: { animalToEdit: animal } });
  }
  /** Navigates to To add animal. */
  navigatetoAddAnimal(): void {
    this.router.navigate(['add']);
  }
  /** Navigates to to manage. */
  navigateToManage(): void {
    this.router.navigate(['manage']);
  }
}
