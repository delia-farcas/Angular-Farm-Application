import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user';
import type { UserListRow } from '../models/user-list-row';
import { UserTrackingService } from './user-tracking.service';

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private trackingService = inject(UserTrackingService);
  private apiUrl = 'https://192.168.101.24:8080/api/users';

  /** Handles the Register functionality. */
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user).pipe(
      tap((savedUser) => {
        if (savedUser) {
          const idToSave = savedUser.userId; 
          this.trackingService.setCurrentUser(savedUser.username, savedUser.role, idToSave);
        }
      })
    );
  }

  /** Handles the Login functionality. */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response && response.token) {
            // 1. Salvăm token-ul primit de la backend în sessionStorage
            sessionStorage.setItem('token', response.token);

            // 2. Salvăm restul detaliilor utilizatorului în trackingService, exact cum făceai înainte
            const user = response.user;
            this.trackingService.setCurrentUser(user.username, user.role, user.userId);
          }
        })
      );
  }

  /** Metodă helper pentru a lua token-ul rapid în aplicație */
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  /** Metodă de logout pentru a curăța tot */
  logout(): void {
    sessionStorage.removeItem('token');
    // Dacă trackingService are vreo metodă de clear, o poți apela și pe aceea aici
  }

  /** Paginated users with animal counts (admin list) - CURĂȚAT DE REQUESTER_ID */
  listUsersWithSummary(page: number, size: number): Observable<UserListRow[]> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<UserListRow[]>(`${this.apiUrl}/summary`, { params });
  }

  /** Get all users - CURĂȚAT DE REQUESTER_ID */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /** Delete user - CURĂȚAT DE REQUESTER_ID */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>('https://192.168.101.24:8080/api/admin/logs');
  }

  getObservations(): Observable<any[]> {
    return this.http.get<any[]>('https://192.168.101.24:8080/api/admin/observations');
  }

  resolveObservation(id: number): Observable<any> {
    return this.http.put(`https://192.168.101.24:8080/api/admin/observations/${id}/resolve`, {});
  }
}