import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Animal } from '../models/animal';
import { FarmService } from './farm.service';

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private http = inject(HttpClient);
  private farmService = inject(FarmService);
  private apiUrl = 'http://localhost:8080/api/animals';

  private animalsLocal: Animal[] = [];

  /** Retrieves the animals paginated. */
  getAnimalsPaginated(ownerId: number, page: number, size: number): Observable<Animal[]> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<Animal[]>(`${this.apiUrl}/owner/${ownerId}`, { params }).pipe(
      tap((animals) => {
        console.log('tap received:', animals); 
        this.animalsLocal = animals;
        this.syncFarmCounts();
      }),
    );
  }

  /** Handles the Add animal functionality. */
  addAnimal(animal: Animal): Observable<Animal> {
  return this.http.post<Animal>(this.apiUrl, animal).pipe(
    tap((newAnimal) => {
      this.animalsLocal.push(newAnimal); 
      this.refreshData(); 
    })
  );
}

  /** Handles the Update animal functionality. */
  updateAnimal(animal: Animal): Observable<Animal> {
    return this.http
      .put<Animal>(`${this.apiUrl}/${animal.id}`, animal)
      .pipe(tap(() => this.refreshData()));
  }

  /** Handles the Delete animal functionality. */
  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(tap(() => this.refreshData()));
  }

  /** Handles the Refresh data functionality. */
  private refreshData() {
    this.syncFarmCounts();
  }

  /** Handles the Sync farm counts functionality. */
  private syncFarmCounts(): void {
    const counts = this.animalsLocal.reduce<Partial<Record<Animal['type'], number>>>(
      (acc, animal) => {
        acc[animal.type] = (acc[animal.type] ?? 0) + 1;
        return acc;
      },
      {},
    );
    this.farmService.syncCounts(counts);
  }
}
