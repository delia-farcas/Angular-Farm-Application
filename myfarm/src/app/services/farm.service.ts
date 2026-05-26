import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { Animal, DailyLogEntry } from '../models/farm';
import { UserTrackingService } from './user-tracking.service';
import { environment } from '../../environments/environment';
export interface DailyProductionPayload {
  milkLitersCow: number;
  milkLitersGoat: number;
  milkLitersSheep: number;
  eggsCount: number;
  woolKg: number;
  meatKg: number;
  workHours: number;
}

@Injectable({ providedIn: 'root' })
export class FarmService {
  private http = inject(HttpClient);
  private trackingService = inject(UserTrackingService);
  private apiUrl = `${environment.apiUrl}/api/logs`;
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
      vaca: 1,
      cal: 2,
      porc: 3,
      gaina: 4,
      oaie: 5,
      capra: 6,
    };

    for (const [type, id] of Object.entries(typeToId)) {
      const animal = this.getAnimalById(id);
      if (animal) {
        animal.count = countsByType[type] ?? 0;
      }
    }
  }

  upsertDailyLog(fields: DailyProductionPayload): Observable<unknown> {
    const userId = this.trackingService.getCurrentUserId();
    if (userId < 1) {
      return throwError(() => new Error('Utilizator neautentificat (ID invalid). Reconectați-vă.'));
    }

    const logData = {
      reportDate: new Date().toISOString().split('T')[0],
      milkLitersCow: fields.milkLitersCow,
      milkLitersGoat: fields.milkLitersGoat,
      milkLitersSheep: Math.round(fields.milkLitersSheep),
      eggsCount: Math.round(fields.eggsCount),
      woolKg: fields.woolKg,
      meatKg: fields.meatKg,
      workHours: fields.workHours,
      userId,
    };

    return this.http.post(this.apiUrl, logData);
  }

  getLogsInRange(userId: number, startIso: string, endIso: string): Observable<DailyLogEntry[]> {
    const params = new HttpParams()
      .set('startDate', startIso)
      .set('endDate', endIso)
      .set('page', '0')
      .set('size', '400');

    return this.http.get<any[]>(`${this.apiUrl}/history/${userId}`, { params }).pipe(
      map((logs) =>
        logs.map((log) => ({
          date: this.normalizeReportDate(log?.reportDate),
          milkCow: Number(log?.milkLitersCow) || 0,
          milkGoat: Number(log?.milkLitersGoat) || 0,
          milkSheep: Number(log?.milkLitersSheep) || 0,
          eggs: Number(log?.eggsCount) || 0,
          wool: Number(log?.woolKg) || 0,
          workHours: Number(log?.workHours) || 0,
          meat: Number(log?.meatKg) || 0,
        })),
      ),
    );
  }

  private normalizeReportDate(reportDate: unknown): string {
    if (typeof reportDate === 'string') return reportDate;

    if (reportDate && typeof reportDate === 'object') {
      const anyDate = reportDate as any;
      const y = Number(anyDate.year);
      const m = Number(anyDate.monthValue ?? anyDate.month);
      const d = Number(anyDate.dayOfMonth ?? anyDate.day);
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }

    return '';
  }

  getProductionReport(
    userId: number,
    year: number,
    month: number | null,
    resource: string,
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('year', year.toString())
      .set('resourceField', resource);

    if (month) params = params.set('month', month.toString());

    return this.http
      .get<Record<string, number>>(`${this.apiUrl}/report`, { params })
      .pipe(map((data) => Object.entries(data).map(([label, value]) => ({ label, value }))));
  }
}
