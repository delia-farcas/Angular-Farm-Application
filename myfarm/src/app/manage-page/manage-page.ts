import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmService } from '../services/farm.service';
import { UserTrackingService } from '../services/user-tracking.service';
import { Animal } from '../models/farm';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { DailyProductionPayload } from '../services/farm.service';
import { UserOptions } from '../user-options/user-options';

@Component({
  selector: 'app-manage-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UserOptions],
  templateUrl: './manage-page.html',
  styleUrl: './manage-page.css',
})
export class ManagePage {
  @Output() goBack = new EventEmitter<void>();
  @Output() goToAddAnimal = new EventEmitter<void>();

  search = '';
  
  todaysInput: any = {};
  invalidInput: any = {};
  todaysMilkInput: any = {};
  invalidMilkInput: any = {};

  currentUsername: string = 'Delia';
  private trackingService = inject(UserTrackingService);

  saveMessage: string | null = null;
  saveMessageType: 'success' | 'warning' | null = null;
  isMenuOpen = false;

  constructor(
    private farm: FarmService,
    private router: Router,
  ) {
    this.currentUsername = this.trackingService.getCurrentUser();
    this.farm.getAnimals().forEach((a) => {
      this.todaysInput[a.id] = null;
      this.invalidInput[a.id] = false;
      this.todaysMilkInput[a.id] = null;
      this.invalidMilkInput[a.id] = false;
    });
  }

  get animals(): Animal[] {
    const q = this.search.trim().toLowerCase();
    const list = this.farm.getAnimals();
    if (!q) return list;
    return list.filter((a) => a.name.toLowerCase().includes(q));
  }

  getGestiuneUnit(animal: Animal): string {
    switch (animal.name) {
      case 'Vaca': return 'L';
      case 'Capra': return 'L';
      case 'Gaina': return 'ouă';
      case 'Oaie': return 'kg';
      case 'Cal': return 'ore';
      case 'Porc': return 'kg';
      default: return '';
    }
  }

  getGestiunePlaceholder(animal: Animal): string {
    switch (animal.name) {
      case 'Vaca': return 'ex: 15';
      case 'Capra': return 'ex: 25';
      case 'Gaina': return 'ex: 40';
      case 'Oaie': return 'ex: 3';
      case 'Cal': return 'ex: 6';
      case 'Porc': return 'ex: 12';
      default: return 'N/A';
    }
  }

  markValidity(animalId: number, value: any): void {
    if (value === null || value === undefined || value === '') {
      this.invalidInput[animalId] = false;
      return;
    }
    const num = Number(value);
    this.invalidInput[animalId] = !Number.isFinite(num) || num < 0;
  }

  markMilkValidity(animalId: number, value: any): void {
    if (value === null || value === undefined || value === '') {
      this.invalidMilkInput[animalId] = false;
      return;
    }
    const num = Number(value);
    this.invalidMilkInput[animalId] = !Number.isFinite(num) || num < 0;
  }

  onSaveToday(): void {
    this.saveMessage = null;
    this.saveMessageType = null;

    const merged: DailyProductionPayload = {
      milkLitersCow: 0,
      milkLitersGoat: 0,
      milkLitersSheep: 0,
      eggsCount: 0,
      woolKg: 0,
      meatKg: 0,
      workHours: 0,
    };

    let hasInput = false;

    for (const a of this.farm.getAnimals()) {
      const valInput = this.todaysInput[a.id];
      const milkInput = this.todaysMilkInput[a.id];

      const val = valInput !== null && valInput !== '' ? Number(valInput) : null;
      const milkVal = milkInput !== null && milkInput !== '' ? Number(milkInput) : null;

      if (val === null && milkVal === null) {
        continue;
      }

      hasInput = true;

      switch (a.name) {
        case 'Vaca':
          if (val !== null) merged.milkLitersCow = val;
          break;
        case 'Capra':
          if (val !== null) merged.milkLitersGoat = val;
          break;
        case 'Oaie':
          if (val !== null) merged.woolKg = val;
          if (milkVal !== null) merged.milkLitersSheep = milkVal;
          break;
        case 'Gaina':
          if (val !== null) merged.eggsCount = val;
          break;
        case 'Cal':
          if (val !== null) merged.workHours = val;
          break;
        case 'Porc':
          if (val !== null) merged.meatKg = val;
          break;
      }
    }

    if (!hasInput) {
      this.saveMessageType = 'warning';
      this.saveMessage = 'Nu ai introdus valori pentru gestiunea de azi.';
      return;
    }

    this.farm
      .upsertDailyLog(merged)
      .pipe(
        map(() => ({ ok: true as const })),
        catchError((err) => of({ ok: false as const, err })),
      )
      .subscribe((result) => {
        if (!result.ok) {
          this.saveMessageType = 'warning';
          this.saveMessage = 'Eroare la comunicarea cu serverul.';
          return;
        }

        this.farm.getAnimals().forEach((a) => {
          this.todaysInput[a.id] = null;
          this.todaysMilkInput[a.id] = null;
        });

        this.saveMessageType = 'success';
        this.saveMessage = 'Gestiunea a fost salvată cu succes.';
        setTimeout(() => this.goBack.emit(), 600);
      });
  }

  isGestiuneEnabled(animal: Animal): boolean {
    return true; 
  }

  toggleMenu(): void { this.isMenuOpen = !this.isMenuOpen; }
  onAddAnimalClick(): void { this.goToAddAnimal.emit(); }
  onBackClick(): void { this.goBack.emit(); }
  navigateToBazinga(): void { this.router.navigate(['bazinga']); }
  navigateToRaports(): void { this.router.navigate(['raports']); }
  navigateToUsers(): void { this.router.navigate(['users']); }
}
