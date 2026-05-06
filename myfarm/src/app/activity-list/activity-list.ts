import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { ActivityRowComponent } from '../activity-row-component/activity-row-component';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ActivityRowComponent],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css'
})
export class ActivityList implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  observations: any[] = [];
  logs: any[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadData();
    console.log('Observations:', this.observations);
  }

  loadData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    // Încărcăm ambele seturi de date
    this.userService.getObservations().subscribe(data => {
      this.observations = data;
      this.cdr.markForCheck();
    });

    this.userService .getLogs().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(data => {
      this.logs = data;
      this.cdr.markForCheck();
    });
  }

  resolveObservation(id: number): void {
    this.userService.resolveObservation(id).subscribe(() => this.loadData());
  }
}