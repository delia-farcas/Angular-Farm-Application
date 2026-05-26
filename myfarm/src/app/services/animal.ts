import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Animal } from '../models/animal';
import { FarmService } from './farm.service';
import {environment} from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private http = inject(HttpClient);
  private farmService = inject(FarmService);
  private apiUrl = `${environment.apiUrl}/api/animals`;

  private animalsLocal: Animal[] = [];

  getAnimalsPaginated(ownerId: number, page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/owner/${ownerId}`, { params }).pipe(
      tap((response) => {
        this.animalsLocal = response.content || response;
        this.syncFarmCounts();
      }),
    );
  }

  addAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(this.apiUrl, animal).pipe(
      tap((newAnimal) => {
        this.animalsLocal.push(newAnimal);
        this.refreshData();
      }),
    );
  }

  updateAnimal(animal: Animal): Observable<Animal> {
    return this.http
      .put<Animal>(`${this.apiUrl}/${animal.id}`, animal)
      .pipe(tap(() => this.refreshData()));
  }

  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.animalsLocal = this.animalsLocal.filter((a) => a.id !== id);
        this.refreshData();
      }),
    );
  }

  private refreshData() {
    this.syncFarmCounts();
  }

  private syncFarmCounts(): void {
    const counts = this.animalsLocal.reduce<Partial<Record<string, number>>>((acc, animal) => {
      acc[animal.type] = (acc[animal.type] ?? 0) + 1;
      return acc;
    }, {});
    this.farmService.syncCounts(counts);
  }
}
