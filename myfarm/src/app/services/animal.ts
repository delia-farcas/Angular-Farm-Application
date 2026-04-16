import { Injectable } from '@angular/core';
import { Animal } from '../models/animal';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {

  private animals: Animal[] = [
    { id: 1, name: 'Vaca', type: 'vaca', sex: 'femela', age: 5, status: 'Sanatoasa', location: 'Hambar' }
  ];

  getAnimals(): Animal[] {
    return this.animals;
  }

  addAnimal(animal: Animal) {
    this.animals.push(animal);
  }

  updateAnimal(animal: Animal) {
    const index = this.animals.findIndex(a => a.id === animal.id);
    if (index !== -1) {
      this.animals[index] = { ...animal };
    }
  }

  deleteAnimal(id: number) {
    this.animals = this.animals.filter(a => a.id !== id);
  }
}