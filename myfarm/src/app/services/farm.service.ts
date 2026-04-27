import { Injectable } from '@angular/core';
import { Animal, DailyLogEntry } from '../models/farm';

/** Executes the Iso date only logic. */
function isoDateOnly(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Executes the Empty log logic. */
function emptyLog(date: string): DailyLogEntry {
  return { date, milk: 0, eggs: 0, wool: 0, workHours: 0, meat: 0 };
}

@Injectable({ providedIn: 'root' })
export class FarmService {
  private animals: Animal[] = [
    { id: 1, name: 'Vaca', icon: '/animals/cow.svg', count: 1, logs: [] },
    { id: 3, name: 'Porc', icon: '/animals/pig.svg', count: 0, logs: [] },
    { id: 4, name: 'Gaina', icon: '/animals/chick.svg', count: 0, logs: [] },
    { id: 5, name: 'Oaie', icon: '/animals/sheep.svg', count: 0, logs: [] },
    { id: 6, name: 'Capra', icon: '/animals/goat.svg', count: 0, logs: [] },
    { id: 2, name: 'Cal', icon: '/animals/horse.svg', count: 0, logs: [] },
  ];

  /** Retrieves the animals. */
  getAnimals(): Animal[] {
    return this.animals;
  }

  /** Retrieves the animal by id. */
  getAnimalById(id: number): Animal | undefined {
    return this.animals.find((a) => a.id === id);
  }

  /** Handles the Sync counts functionality. */
  syncCounts(
    countsByType: Partial<Record<'vaca' | 'cal' | 'porc' | 'gaina' | 'oaie' | 'capra', number>>,
  ): void {
    const typeToId: Record<'vaca' | 'cal' | 'porc' | 'gaina' | 'oaie' | 'capra', number> = {
      vaca: 1,
      cal: 2,
      porc: 3,
      gaina: 4,
      oaie: 5,
      capra: 6,
    };

    for (const [type, id] of Object.entries(typeToId) as Array<[keyof typeof typeToId, number]>) {
      const animal = this.getAnimalById(id);
      if (!animal) continue;
      animal.count = countsByType[type] ?? 0;
    }
  }

  /** Sets the count. */
  setCount(id: number, count: number): void {
    const animal = this.getAnimalById(id);
    if (!animal) return;
    animal.count = Math.max(0, Math.floor(count));
  }

  /** Handles the Upsert today log functionality. */
  upsertTodayLog(animalId: number, patch: Partial<Omit<DailyLogEntry, 'date'>>): void {
    const animal = this.getAnimalById(animalId);
    if (!animal) return;

    const today = isoDateOnly(new Date());
    const existing = animal.logs.find((l) => l.date === today);
    if (!existing) {
      animal.logs.push({ ...emptyLog(today), ...patch });
      return;
    }
    Object.assign(existing, patch);
  }

  /** Retrieves the logs in range. */
  getLogsInRange(animalId: number, startIso: string, endIso: string): DailyLogEntry[] {
    const animal = this.getAnimalById(animalId);
    if (!animal) return [];
    return animal.logs
      .filter((l) => l.date >= startIso && l.date <= endIso)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
