import { Component ,EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { AnimalCardComponent } from '../animal-card/animal-card';

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
  @Output() editAnimalRequest = new EventEmitter<Animal>();

  constructor(private animalService: AnimalService) {}
  animals: Animal[] = [];
  selectedType: 'toate' | 'vaca' | 'porc' | 'gaina' | 'cal' | 'oaie' | 'capra' = 'toate';

  ngOnInit() {
    this.animals = this.animalService.getAnimals();
  }

  get filteredAnimals(): Animal[] {
    if (this.selectedType === 'toate') {
      return this.animals;
    }
    return this.animals.filter(a => a.type === this.selectedType);
  }

  deleteAnimal(id: number) {
    const confirmed = window.confirm('Sigur vrei să ștergi animalul?');
    if (!confirmed) return;
    this.animalService.deleteAnimal(id);
    this.animals = this.animalService.getAnimals();
  }

  editAnimal(animal: Animal) {
    this.editAnimalRequest.emit(animal);
  }
  onAddAnimalClick(): void {
    this.goToAddAnimal.emit();
  }
  
  onManageClick(): void{
    this.goToManage.emit();
  }
}



