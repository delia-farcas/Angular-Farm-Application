import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Animal, DailyLogEntry } from '../models/farm';

@Injectable({ providedIn: 'root' })
export class FarmService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/logs';

  private animals: Animal[] = [
    { id: 1, name: 'Vaca', icon: '/animals/cow.svg', count: 0, logs: [] },
    { id: 3, name: 'Porc', icon: '/animals/pig.svg', count: 0, logs: [] },
    { id: 4, name: 'Gaina', icon: '/animals/chick.svg', count: 0, logs: [] },
    { id: 5, name: 'Oaie', icon: '/animals/sheep.svg', count: 0, logs: [] },
    { id: 6, name: 'Capra', icon: '/animals/goat.svg', count: 0, logs: [] },
    { id: 2, name: 'Cal', icon: '/animals/horse.svg', count: 0, logs: [] },
  ];

  getAnimals(): Animal[] {
    return this.animals;
  }

  getAnimalById(id: number): Animal | undefined {
    return this.animals.find((a) => a.id === id);
  }

  syncCounts(countsByType: Partial<Record<string, number>>): void {
    const typeToId: Record<string, number> = {
      vaca: 1, cal: 2, porc: 3, gaina: 4, oaie: 5, capra: 6,
    };

    for (const [type, id] of Object.entries(typeToId)) {
      const animal = this.getAnimalById(id);
      if (animal) {
        animal.count = countsByType[type] ?? 0;
      }
    }
  }

  upsertLog(logData: any): Observable<any> {
    return this.http.post(this.apiUrl, logData);
  }

  getProductionReport(userId: number, year: number, month: number | null, resource: string): Observable<any[]> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('year', year.toString())
      .set('resourceField', resource);

    if (month) params = params.set('month', month.toString());

    return this.http.get<Record<string, number>>(`${this.apiUrl}/report`, { params }).pipe(
      map(data => Object.entries(data).map(([label, value]) => ({ label, value })))
    );
  }

  upsertTodayLog(animalId: number, patch: Partial<Omit<DailyLogEntry, 'date'>>): Observable<any> {
  const logData = {
    reportDate: new Date().toISOString().split('T')[0], 
    milkLitersCow: patch.milk || 0,
    eggsCount: patch.eggs || 0,
    woolKg: patch.wool || 0,
    meatKg: patch.meat || 0,
    workHours: patch.workHours || 0,
    userId: 100 
  };
  return this.http.post(this.apiUrl, logData);
}

  getLogsInRange(animalId: number, startIso: string, endIso: string): Observable<DailyLogEntry[]> {
  const params = new HttpParams()
    .set('startDate', startIso)
    .set('endDate', endIso);

  return this.http.get<DailyLogEntry[]>(`${this.apiUrl}/history/${animalId}`, { params });
}
}