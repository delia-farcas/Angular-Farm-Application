import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user';
import type { UserListRow } from '../models/user-list-row';
import { UserTrackingService } from './user-tracking.service';
import { environment } from '../../environments/environment';
interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private trackingService = inject(UserTrackingService);
  private apiUrl = `${environment.apiUrl}/api/users`;

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user).pipe(
      tap((savedUser) => {
        if (savedUser) {
          const idToSave = savedUser.userId;
          this.trackingService.setCurrentUser(savedUser.username, savedUser.role, idToSave);
        }
      }),
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response && response.token) {
          sessionStorage.setItem('token', response.token);

          const user = response.user;
          this.trackingService.setCurrentUser(user.username, user.role, user.userId);
        }
      }),
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  logout(): void {
    sessionStorage.removeItem('token');
  }

  listUsersWithSummary(page: number, size: number): Observable<UserListRow[]> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<UserListRow[]>(`${this.apiUrl}/summary`, { params });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/admin/logs`);
  }

  getObservations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/admin/observations`);
  }

  resolveObservation(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/admin/observations/${id}/resolve`, {});
  }
}
