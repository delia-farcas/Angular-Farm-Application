import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user';
import { UserTrackingService } from './user-tracking.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private trackingService = inject(UserTrackingService);
  private apiUrl = 'http://localhost:8080/api/users';

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  login(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User>(`${this.apiUrl}/login`, { params }).pipe(
      tap(user => {
        if (user) this.trackingService.setCurrentUser(user.username);
      })
    );
  }
}