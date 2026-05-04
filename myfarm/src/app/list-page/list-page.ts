import { Component, EventEmitter, Output, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { AnimalCardComponent } from '../animal-card/animal-card';
import { UserTrackingService } from '../services/user-tracking.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AnimalCardComponent],
  templateUrl: './list-page.html',
  styleUrl: './list-page.css',
})
export class ListPage implements OnInit {
  @Output() goToManage = new EventEmitter<void>();
  @Output() goToAddAnimal = new EventEmitter<void>();

  private trackingService = inject(UserTrackingService);
  private animalService = inject(AnimalService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUsername: string = 'Delia';
  animals: Animal[] = [];
  selectedType: 'toate' | 'vaca' | 'porc' | 'gaina' | 'cal' | 'oaie' | 'capra' = 'toate';

  currentPage = 0;
  pageSize = 15;
  isLoading = false;
  hasMoreData = true; 
  /** Initializes the component. */
  ngOnInit() {
    this.currentUsername = this.trackingService.getCurrentUser();
    this.loadAnimals(); // Încărcăm prima pagină
  }

  /** Handles the Load animals functionality. */
loadAnimals() {
  if (this.isLoading || !this.hasMoreData) return;

  this.isLoading = true;
  this.cdr.markForCheck(); // after setting isLoading

  this.animalService.getAnimalsPaginated(
    this.trackingService.getCurrentUserId(),
    this.currentPage,
    this.pageSize
  )
  .pipe(
    finalize(() => {
      this.isLoading = false;
      this.cdr.markForCheck(); // after finalize changes isLoading
    })
  )
  .subscribe({
    next: (newAnimals) => {
      if (newAnimals.length < this.pageSize) {
        this.hasMoreData = false;
      }
      this.animals = [...this.animals, ...newAnimals];
      this.currentPage++;
      this.cdr.markForCheck(); // after updating animals
    },
    error: (err) => {
      console.error('Eroare la încărcarea animalelor', err);
      this.cdr.markForCheck();
    }
  });
}
  /** Handles the table scroll event. */
  onTableScroll(event: any) {
    const element = event.target;

    const threshold = 100;
    const position = element.scrollHeight - element.scrollTop;
    const offset = element.clientHeight + threshold;

    if (position <= offset && !this.isLoading) {
      this.loadAnimals();
    }
  }

  /** Returns the list of animals filtered by the selected type. */
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

    this.animalService.deleteAnimal(id).subscribe(() => {
      this.animals = [];
      this.currentPage = 0;
      this.hasMoreData = true;
      this.loadAnimals();
    });
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
