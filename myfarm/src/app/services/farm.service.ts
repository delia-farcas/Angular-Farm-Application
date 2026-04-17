import { Injectable } from '@angular/core';
import { Animal, DailyLogEntry } from '../models/farm';

function isoDateOnly(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function emptyLog(date: string): DailyLogEntry {
  return { date, milk: 0, eggs: 0, wool: 0, workHours: 0, meat: 0};
}

@Injectable({ providedIn: 'root' })
export class FarmService {
  private animals: Animal[] = [
    { id: 1, name: 'Vaca', icon: '🐄', count: 1, logs: [] },
    { id: 2, name: 'Cal', icon: '🐴', count: 0, logs: [] },
    { id: 3, name: 'Porc', icon: '🐖', count: 0, logs: [] },
    { id: 4, name: 'Gaina', icon: '🐔', count: 0, logs: [] },
    { id: 5, name: 'Oaie', icon: '🐑', count: 0, logs: [] },
    { id: 6, name: 'Capra', icon: '🐐', count: 0, logs: [] },
  ];

  getAnimals(): Animal[] {
    return this.animals;
  }

  getAnimalById(id: number): Animal | undefined {
    return this.animals.find(a => a.id === id);
  }

  syncCounts(countsByType: Partial<Record<'vaca' | 'cal' | 'porc' | 'gaina' | 'oaie' | 'capra', number>>): void {
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

  setCount(id: number, count: number): void {
    const animal = this.getAnimalById(id);
    if (!animal) return;
    animal.count = Math.max(0, Math.floor(count));
  }

  /** Add/merge a daily log entry for today (date-only ISO). */
  upsertTodayLog(
    animalId: number,
    patch: Partial<Omit<DailyLogEntry, 'date'>>
  ): void {
    const animal = this.getAnimalById(animalId);
    if (!animal) return;

    const today = isoDateOnly(new Date());
    const existing = animal.logs.find(l => l.date === today);
    if (!existing) {
      animal.logs.push({ ...emptyLog(today), ...patch });
      return;
    }
    Object.assign(existing, patch);
  }

  /** Read logs for a given animal within [start, end] inclusive (date-only compare). */
  getLogsInRange(animalId: number, startIso: string, endIso: string): DailyLogEntry[] {
    const animal = this.getAnimalById(animalId);
    if (!animal) return [];
    return animal.logs
      .filter(l => l.date >= startIso && l.date <= endIso)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

