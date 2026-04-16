import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important pentru [style.display] sau *ngIf
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-add-animal',
  standalone: true, // Dacă folosești Angular 17+
  imports: [CommonModule, FormsModule], // Adaugă FormsModule pentru ngModel
  templateUrl: './add-animal.html',
  styleUrl: './add-animal.css',
})
export class AddAnimal implements OnChanges {
  @Output() goBack = new EventEmitter<void>();
  @Input() animalToEdit: Animal | null = null;

  selectedEmoji = '🐄';
  isPickerVisible = false;
  isEditMode = false;

  animal: Animal = {
    id: 0,
    name: '',
    status: 'Sanatoasa',
    type: 'vaca',
    sex: 'femela',
    age: 0,
    location: ''
  };

  constructor(private animalService: AnimalService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animalToEdit'] && this.animalToEdit) {
      this.isEditMode = true;
      this.animal = { ...this.animalToEdit };
    } else if (changes['animalToEdit'] && !this.animalToEdit) {
      this.isEditMode = false;
      this.animal = {
        id: 0,
        name: '',
        type: 'vaca',
        sex: 'femela',
        age: 0,
        status: 'Sanatoasa',
        location: '',
      };
    }
  }

  get canSubmit(): boolean {
  const nameOk = this.animal.name?.trim().length > 0;
  const locationOk = this.animal.location?.trim().length > 0;
  const typeOk = !!this.animal.type;
  const sexOk = !!this.animal.sex;
  const ageOk = !isNaN(Number(this.animal.age)) && Number(this.animal.age) >= 0;  const statusOk = this.animal.status?.trim().length > 0;
  return nameOk && locationOk && typeOk && sexOk && ageOk && statusOk;
}

  togglePicker(event: Event) {
    event.preventDefault();
    this.isPickerVisible = !this.isPickerVisible;
  }

  selectIcon(icon: string) {
    this.selectedEmoji = icon;
    this.isPickerVisible = false;
  }
  onSubmit() {
    if (!this.canSubmit) return;

    const trimmed: Animal = {
      ...this.animal,
      name: this.animal.name.trim(),
      location: this.animal.location.trim(),
    };

    if (this.isEditMode && trimmed.id) {
      this.animalService.updateAnimal(trimmed);
    } else {
      const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
      this.animalService.addAnimal({ ...trimmed, id: uniqueId });
    }
    this.goBack.emit();
  }
  onBackClick(): void {
    this.goBack.emit();
  }
}


