import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../models/animal';
import { AnimalCardComponent } from '../animal-card/animal-card';
import { AnimalService } from '../services/animal';
import { UserTrackingService } from '../services/user-tracking.service'; // Importă Tracking Service

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, AnimalCardComponent],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.css',
})
export class AnimalList implements OnInit {
  animals: Animal[] = [];

  private animalService = inject(AnimalService);
  private trackingService = inject(UserTrackingService);

  currentPage = 0;
  pageSize = 10;

  /** Initializes the component. */
  ngOnInit() {
    this.refreshList();
  }

  /** Handles the Refresh list functionality. */
  refreshList() {
    const userId = this.trackingService.getCurrentUserId();

    this.animalService.getAnimalsPaginated(userId, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.animals = data;
      },
      error: (err) => console.error('Eroare la încărcarea animalelor:', err),
    });
  }

  /** Handles the Add animal functionality. */
  addAnimal() {
    const newAnimal: Animal = {
      id: 0,
      name: 'Animal nou',
      status: 'Sanatoasa',
      location: 'Hambar',
      type: 'vaca',
      sex: 'femela',
      age: 1,
      observations: '',
      ownerId: this.trackingService.getCurrentUserId(),
    };

    this.animalService.addAnimal(newAnimal).subscribe(() => {
      this.refreshList(); // Reîncărcăm din backend după salvare
    });
  }

  /** Handles the Delete animal functionality. */
  deleteAnimal(id: number) {
    if (confirm('Sigur vrei să ștergi?')) {
      this.animalService.deleteAnimal(id).subscribe(() => {
        this.refreshList();
      });
    }
  }

  /** Handles the Edit animal functionality. */
  editAnimal(animal: Animal) {
    const updatedAnimal = { ...animal, status: 'In tratament' };
    this.animalService.updateAnimal(updatedAnimal).subscribe(() => {
      this.refreshList();
    });
  }

  /** Retrieves the images. */
  getImages(type: string): string[] {
    const images: Record<string, string[]> = {
      vaca: ['assets/vaca/vector.svg', 'assets/vaca/vector-2.svg'],
      gaina: ['assets/gaina/vector.svg'],
    };
    return images[type] || [];
  }
}
