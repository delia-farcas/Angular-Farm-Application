import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../models/animal';
import { AnimalCardComponent } from '../animal-card/animal-card';
import { AnimalService } from '../services/animal'; // 1. Importă Service-ul

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, AnimalCardComponent],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.css',
})
export class AnimalList implements OnInit {
  animals: Animal[] = [];

  /** Instantiates the component and injects dependencies. */
  constructor(private animalService: AnimalService) {}

  /** Initializes the component. */
  ngOnInit() {
    this.refreshList();
  }

  /** Handles the Refresh list functionality. */
  refreshList() {
    this.animals = this.animalService.getAnimals();
  }

  /** Handles the Add animal functionality. */
  addAnimal() {
    const newAnimal: Animal = {
      id: Date.now(),
      name: 'Animal nou',
      status: 'Sanatoasa',
      location: 'Hambar',
      type: 'vaca',
      sex: 'femela', // Adăugat pentru a respecta noul model din Service
      age: 1,
      observations: '',
    };

    this.animalService.addAnimal(newAnimal);
    this.refreshList(); // Actualizăm ce vede utilizatorul
  }

  /** Handles the Delete animal functionality. */
  deleteAnimal(id: number) {
    this.animalService.deleteAnimal(id);
    this.refreshList(); // Actualizăm lista după ștergere
  }

  /** Handles the Edit animal functionality. */
  editAnimal(animal: Animal) {
    const updatedAnimal = { ...animal, status: 'In tratament' };
    this.animalService.updateAnimal(updatedAnimal);
    this.refreshList();
  }

  /** Retrieves the images. */
  getImages(type: string): string[] {
    switch (type) {
      case 'vaca':
        return ['assets/vaca/vector.svg', 'assets/vaca/vector-2.svg'];
      case 'gaina':
        return ['assets/gaina/vector.svg'];
      default:
        return [];
    }
  }
}
