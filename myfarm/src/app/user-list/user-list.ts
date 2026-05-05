import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import type { UserListRow } from '../models/user-list-row';
import { UserCardComponent } from '../user-card/user-card';
import { UserService } from '../services/user.service';
import { UserTrackingService } from '../services/user-tracking.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, UserCardComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  private userService = inject(UserService);
  private trackingService = inject(UserTrackingService);
  private cdr = inject(ChangeDetectorRef);

  users: UserListRow[] = [];
  searchQuery = '';

  currentPage = 0;
  pageSize = 15;
  isLoading = false;
  hasMoreData = true;

  ngOnInit(): void {
    if (!this.trackingService.isCurrentUserAdmin()) {
      this.hasMoreData = false;
      return;
    }

    this.resetAndLoad();
  }

  get filteredUsers(): UserListRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }

  onTableScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100;
    const position = element.scrollHeight - element.scrollTop;
    const offset = element.clientHeight + threshold;
    if (position <= offset && !this.isLoading) {
      this.loadNextPage();
    }
  }

  resetAndLoad(): void {
    this.users = [];
    this.currentPage = 0;
    this.hasMoreData = true;
    this.loadNextPage();
  }

  private loadNextPage(): void {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService
      .listUsersWithSummary(this.currentPage, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (rows) => {
          if (rows.length < this.pageSize) {
            this.hasMoreData = false;
          }
          this.users = [...this.users, ...rows];
          this.currentPage++;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Eroare la încărcarea utilizatorilor:', err);
          this.cdr.markForCheck();
        },
      });
  }

  deleteUser(userId: number): void {
    const currentId = this.trackingService.getCurrentUserId();
    if (userId === currentId) {
      alert('Nu poți șterge contul cu care ești autentificat.');
      return;
    }
    if (!confirm('Sigur vrei să ștergi acest utilizator?')) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.resetAndLoad();
      },
      error: (err) => {
        console.error('Eroare la ștergere:', err);
        alert('Nu s-a putut șterge utilizatorul.');
      },
    });
  }
}
