import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user';
import type { UserListRow } from '../models/user-list-row';
import { UserTrackingService } from './user-tracking.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private trackingService = inject(UserTrackingService);
  private apiUrl = 'http://localhost:8080/api/users';

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
  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((user) => {
          if (user){
            this.trackingService.setCurrentUser(user.username, user.role, user.userId);
          }
        }),
      );
  }

  /** Paginated users with animal counts (admin list). */
  listUsersWithSummary(page: number, size: number): Observable<UserListRow[]> {
    const params = new HttpParams()
      .set('requesterId', String(this.trackingService.getCurrentUserId()))
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<UserListRow[]>(`${this.apiUrl}/summary`, { params });
  }

  getAllUsers(): Observable<User[]> {
    const params = new HttpParams().set(
      'requesterId',
      String(this.trackingService.getCurrentUserId()),
    );
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
  getLogs(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8080/api/admin/logs');
}

  getObservations(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/admin/observations');
  }

  resolveObservation(id: number): Observable<any> {
    return this.http.put(`http://localhost:8080/api/admin/observations/${id}/resolve`, {});
  }
}
