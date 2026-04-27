import { Injectable } from '@angular/core';
import { Animal } from '../models/animal';
import { FarmService } from './farm.service';

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private animals: Animal[] = [
    {
      id: 1,
      name: 'Vaca',
      type: 'vaca',
      sex: 'femela',
      age: 5,
      status: 'Sanatoasa',
      location: 'Hambar',
      observations: '',
    },
  ];

  /** Instantiates the component and injects dependencies. */
  constructor(private farmService: FarmService) {
    this.syncFarmCounts();
  }

  /** Retrieves the animals. */
  getAnimals(): Animal[] {
    return this.animals;
  }

  /** Handles the Add animal functionality. */
  addAnimal(animal: Animal) {
    this.animals.push(animal);
    this.syncFarmCounts();
  }

  /** Handles the Update animal functionality. */
  updateAnimal(animal: Animal) {
    const index = this.animals.findIndex((a) => a.id === animal.id);
    if (index !== -1) {
      this.animals[index] = { ...animal };
      this.syncFarmCounts();
    }
  }

  /** Handles the Delete animal functionality. */
  deleteAnimal(id: number) {
    this.animals = this.animals.filter((a) => a.id !== id);
    this.syncFarmCounts();
  }

  /** Handles the Sync farm counts functionality. */
  private syncFarmCounts(): void {
    const counts = this.animals.reduce<Partial<Record<Animal['type'], number>>>((acc, animal) => {
      acc[animal.type] = (acc[animal.type] ?? 0) + 1;
      return acc;
    }, {});

    this.farmService.syncCounts(counts);
  }
}
