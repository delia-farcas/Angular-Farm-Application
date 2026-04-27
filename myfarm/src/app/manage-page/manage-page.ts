import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmService } from '../services/farm.service';
import { UserTrackingService } from '../services/user-tracking.service';
import { Animal } from '../models/farm';
import { Router } from '@angular/router';

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
  todaysInput: Record<number, number | null> = {};
  invalidInput: Record<number, boolean> = {};

  todaysMilkInput: Record<number, number | null> = {};
  invalidMilkInput: Record<number, boolean> = {};

  currentUsername: string = 'Delia';
  private trackingService = inject(UserTrackingService);

  /** Instantiates the component and injects dependencies. */
  constructor(
    private farm: FarmService,
    private router: Router,
  ) {
    this.currentUsername = this.trackingService.getCurrentUser();
    for (const a of this.farm.getAnimals()) {
      this.todaysInput[a.id] = null;
      this.invalidInput[a.id] = false;
      this.todaysMilkInput[a.id] = null;
      this.invalidMilkInput[a.id] = false;
    }
  }

  get animals(): Animal[] {
    const q = this.search.trim().toLowerCase();
    const list = this.farm.getAnimals();
    if (!q) return list;
    return list.filter((a) => a.name.toLowerCase().includes(q));
  }

  /** Retrieves the gestiune unit. */
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

  /** Retrieves the gestiune placeholder. */
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

  /** Handles the Is gestiune enabled functionality. */
  isGestiuneEnabled(_: Animal): boolean {
    return true;
  }

  /** Handles the Mark validity functionality. */
  markValidity(animalId: number, value: any): void {
    if (value === null || value === undefined || value === '') {
      this.invalidInput[animalId] = false;
      return;
    }
    const num = Number(value);
    this.invalidInput[animalId] = !Number.isFinite(num) || num < 0;
  }

  /** Handles the Mark milk validity functionality. */
  markMilkValidity(animalId: number, value: any): void {
    if (value === null || value === undefined || value === '') {
      this.invalidMilkInput[animalId] = false;
      return;
    }
    const num = Number(value);
    this.invalidMilkInput[animalId] = !Number.isFinite(num) || num < 0;
  }

  /** Handles the save today event. */
  onSaveToday(): void {
    for (const a of this.farm.getAnimals()) {
      const raw = this.todaysInput[a.id];
      const rawMilk = this.todaysMilkInput[a.id];

      const value = (raw !== null && raw !== undefined) ? Number(raw) : null;
      const validValue = (value !== null && Number.isFinite(value) && value >= 0) ? value : null;

      const milkValue = (rawMilk !== null && rawMilk !== undefined) ? Number(rawMilk) : null;
      const validMilkValue = (milkValue !== null && Number.isFinite(milkValue) && milkValue >= 0) ? milkValue : null;

      if (validValue === null && validMilkValue === null) continue;

      switch (a.name) {
        case 'Vaca':
        case 'Capra':
          if (validValue !== null) this.farm.upsertTodayLog(a.id, { milk: validValue });
          break;
        case 'Gaina':
          if (validValue !== null) this.farm.upsertTodayLog(a.id, { eggs: validValue });
          break;
        case 'Oaie':
          const patch: any = {};
          if (validValue !== null) patch.wool = validValue;
          if (validMilkValue !== null) patch.milk = validMilkValue;
          if (Object.keys(patch).length > 0) this.farm.upsertTodayLog(a.id, patch);
          break;
        case 'Cal':
          if (validValue !== null) this.farm.upsertTodayLog(a.id, { workHours: validValue });
          break;
        case 'Porc':
          if (validValue !== null) this.farm.upsertTodayLog(a.id, { meat: validValue });
          break;
      }
    }

    for (const a of this.farm.getAnimals()) {
      this.todaysInput[a.id] = null;
      this.invalidInput[a.id] = false;
      this.todaysMilkInput[a.id] = null;
      this.invalidMilkInput[a.id] = false;
    }
    this.goBack.emit();
  }

  /** Handles the add animal click event. */
  onAddAnimalClick(): void {
    this.goToAddAnimal.emit();
  }

  /** Handles the back click event. */
  onBackClick(): void {
    this.goBack.emit();
  }
  /** Navigates to to bazinga. */
  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  /** Navigates to to raports. */
  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }
}

export class DashboardComponent {
  userName = 'Delia';
}
