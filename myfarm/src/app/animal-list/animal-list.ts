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
  // Lista începe goală, o vom popula din Service
  animals: Animal[] = [];

  // 2. Injectăm Service-ul în constructor
  constructor(private animalService: AnimalService) {}

  // 3. ngOnInit se execută automat când apare componenta pe ecran
  ngOnInit() {
    this.refreshList();
  }

  // Funcție utilitară ca să nu repetăm codul de citire a listei
  refreshList() {
    this.animals = this.animalService.getAnimals();
  }

  // ➕ ADAUGARE
  addAnimal() {
    const newAnimal: Animal = {
      id: Date.now(),
      name: 'Animal nou',
      status: 'Sanatos',
      location: 'Hambar',
      type: 'vaca',
      sex: 'femela', // Adăugat pentru a respecta noul model din Service
      age: 1,
      observations: ''
    };

    this.animalService.addAnimal(newAnimal);
    this.refreshList(); // Actualizăm ce vede utilizatorul
  }

  // ❌ STERGERE
  deleteAnimal(id: number) {
    this.animalService.deleteAnimal(id);
    this.refreshList(); // Actualizăm lista după ștergere
  }

  // ✏️ EDITARE
  editAnimal(animal: Animal) {
    // Acum putem folosi updateAnimal din service
    const updatedAnimal = { ...animal, status: 'In tratament' };
    this.animalService.updateAnimal(updatedAnimal);
    this.refreshList();
  }

  // 🖼️ Imaginile pot rămâne aici (țin de design/afisare)
  getImages(type: string): string[] {
    switch (type) {
      case 'vaca': return ['assets/vaca/vector.svg', 'assets/vaca/vector-2.svg'];
      case 'gaina': return ['assets/gaina/vector.svg'];
      default: return [];
    }
  }
}