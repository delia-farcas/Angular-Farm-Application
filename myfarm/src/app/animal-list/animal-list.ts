import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../models/animal';
import {AnimalCardComponent} from '../animal-card/animal-card';
@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, AnimalCardComponent],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.css',
})
export class AnimalList {

  animals: Animal[] = [
    {
      id: 1,
      name: 'Florica',
      status: 'Sanatoasa',
      location: 'Hambar',
      type: 'vaca'
    },
    {
      id: 2,
      name: 'Coco',
      status: 'Sanatoasa',
      location: 'Curte',
      type: 'gaina'
    }
  ];

  // ➕ ADAUGARE
  addAnimal() {
    const newAnimal: Animal = {
      id: Date.now(), // id simplu
      name: 'Animal nou',
      status: 'Sanatos',
      location: 'Hambar',
      type: 'vaca'
    };

    this.animals.push(newAnimal);
  }

  // ❌ STERGERE
  deleteAnimal(id: number) {
    this.animals = this.animals.filter(animal => animal.id !== id);
  }

  // ✏️ EDITARE (deocamdată doar log)
  editAnimal(animal: Animal) {
    console.log('Editezi:', animal);
  }

  // 🖼️ IMAGINI în funcție de tip
  getImages(type: string): string[] {
    switch (type) {
      case 'vaca':
        return [
          'assets/vaca/vector.svg',
          'assets/vaca/vector-2.svg'
        ];
      case 'gaina':
        return [
          'assets/gaina/vector.svg'
        ];
      default:
        return [];
    }
  }
}