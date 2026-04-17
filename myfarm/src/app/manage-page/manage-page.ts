import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmService } from '../services/farm.service';
import { Animal } from '../models/farm';

@Component({
  selector: 'app-manage-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-page.html',
  styleUrl: './manage-page.css',
})
export class ManagePage {
  @Output() goBack = new EventEmitter<void>();
  @Output() goToAddAnimal = new EventEmitter<void>();

  search = '';
  /** per-animal input for today */
  todaysInput: Record<number, number | null> = {};
  invalidInput: Record<number, boolean> = {};

  constructor(private farm: FarmService) {
    for (const a of this.farm.getAnimals()) {
      this.todaysInput[a.id] = null;
      this.invalidInput[a.id] = false;
    }
  }

  get animals(): Animal[] {
    const q = this.search.trim().toLowerCase();
    const list = this.farm.getAnimals();
    if (!q) return list;
    return list.filter(a => a.name.toLowerCase().includes(q));
  }

  getGestiuneUnit(animal: Animal): string {
    switch (animal.name) {
      case 'Vaca':
        return 'L';
      case 'Capra':
        return 'L';
      case 'Gaina':
        return 'ouă';
      case 'Oaie':
        return 'kg';
      case 'Cal':
        return 'ore';
      case 'Porc':
        return 'kg';
      default:
        return '';
    }
  }

  getGestiunePlaceholder(animal: Animal): string {
    switch (animal.name) {
      case 'Vaca':
        return 'ex: 15';
      case 'Capra':
        return 'ex: 25';
      case 'Gaina':
        return 'ex: 40';
      case 'Oaie':
        return 'ex: 3';
      case 'Cal':
        return 'ex: 6';
      case 'Porc':
         return 'ex: 12';
      default:
        return 'N/A';
    }
  }

  isGestiuneEnabled(_: Animal): boolean {
    return true;
  }

  markValidity(animalId: number, value: any): void {
    if (value === null || value === undefined || value === '') {
      this.invalidInput[animalId] = false;
      return;
    }
    const num = Number(value);
    this.invalidInput[animalId] = !Number.isFinite(num) || num < 0;
  }

  onSaveToday(): void {
    for (const a of this.farm.getAnimals()) {
      const raw = this.todaysInput[a.id];
      if (raw === null || raw === undefined) continue;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) continue;

      switch (a.name) {
        case 'Vaca':
        case 'Capra':
          this.farm.upsertTodayLog(a.id, { milk: value });
          break;
        case 'Gaina':
          this.farm.upsertTodayLog(a.id, { eggs: value });
          break;
        case 'Oaie':
          this.farm.upsertTodayLog(a.id, { wool: value });
          break;
        case 'Cal':
          this.farm.upsertTodayLog(a.id, { workHours: value });
          break;
        case 'Porc':
          this.farm.upsertTodayLog(a.id, { meat: value });
          break;
      }
    }
    
    for (const a of this.farm.getAnimals()) {
      this.todaysInput[a.id] = null;
      this.invalidInput[a.id] = false;
    }
    this.goBack.emit();
  }

  onAddAnimalClick(): void {
    this.goToAddAnimal.emit();
  }

  onBackClick(): void {
    this.goBack.emit();
  }
}

export class DashboardComponent {
  userName = 'Delia';
}
