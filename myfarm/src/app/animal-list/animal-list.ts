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
  
  // Injectăm serviciile folosind metoda modernă 'inject'
  private animalService = inject(AnimalService);
  private trackingService = inject(UserTrackingService);

  // Parametri pentru paginare
  currentPage = 0;
  pageSize = 10;

  ngOnInit() {
    this.refreshList();
  }

  /** Obține user-ul curent și încarcă lista de la server */
  refreshList() {
    // În mod normal, aici ar trebui să ai un ID numeric de la backend. 
    // Dacă trackingService returnează doar username-ul, folosim un ID simulat (ex: 1) 
    // sau modificăm backend-ul să accepte username.
    const userId = 1; 

    this.animalService.getAnimalsPaginated(userId, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.animals = data;
        },
        error: (err) => console.error('Eroare la încărcarea animalelor:', err)
      });
  }

  /** Adaugă un animal trimițând datele la backend */
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
      ownerId: 1 
    };

    this.animalService.addAnimal(newAnimal).subscribe(() => {
      this.refreshList(); // Reîncărcăm din backend după salvare
    });
  }

  /** Șterge animal apelând serverul */
  deleteAnimal(id: number) {
    if (confirm('Sigur vrei să ștergi?')) {
      this.animalService.deleteAnimal(id).subscribe(() => {
        this.refreshList();
      });
    }
  }

  /** Editează animal apelând serverul (PUT) */
  editAnimal(animal: Animal) {
    const updatedAnimal = { ...animal, status: 'In tratament' };
    this.animalService.updateAnimal(updatedAnimal).subscribe(() => {
      this.refreshList();
    });
  }

  getImages(type: string): string[] {
    const images: Record<string, string[]> = {
      'vaca': ['assets/vaca/vector.svg', 'assets/vaca/vector-2.svg'],
      'gaina': ['assets/gaina/vector.svg']
    };
    return images[type] || [];
  }
}